var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var Team = require('../models/team')
var PersionalDiag = require('../models/personalDiag')
var DoctorsInCharge = require('../models/doctorsInCharge')

// 获取对象 2017-07-22 YQC
// 获取用户对象
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    }
    if (user === null) {
      return res.status(404).json({results: '找不到用户'})
    } else if (req.session.role === 'patient') {
      req.body.patientObject = user
      next()
    } else if (req.session.role === 'doctor') {
      req.body.doctorObject = user
      next()
    } else {
      return res.status(400).json({results: '登录角色不是医生或患者'})
    }
  })
}
// 获取患者ID对象
exports.getPatientObject = function (req, res, next) {
  let patientId = req.body.patientId || req.query.patientId || null
  if (patientId === null) {
    return res.status(412).json({results: '请填写patientId'})
  }
  let query = {userId: patientId, role: 'patient'}
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      return res.status(500).send(err)
    }
    if (patient === null) {
      return res.status(404).json({results: '找不到患者'})
    } else {
      req.body.patientObject = patient
      next()
    }
  })
}
// 获取医生ID对象
exports.getDoctorObject = function (req, res, next) {
  let doctorId = req.body.doctorId || req.query.doctorId || null
  if (doctorId === null) {
    return res.status(412).json({results: '请填写doctorId'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctor === null) {
      return res.status(404).json({results: '找不到医生'})
    } else {
      req.body.doctorObject = doctor
      next()
    }
  })
}

// 获取某位医生的服务开启状态及收费情况
// 根据医生ID获取服务开启状态 2017-07-14 GY
exports.getServices = function (req, res) {
  let doctorId = req.query.userId || null
  let query = {}
  if (doctorId === null) {
    return res.status(412).json({results: '请输入doctorId'})
  } else {
    query['userId'] = doctorId
  }
  let opts = {}
  let fields = {
    userId: 1,
    counselStatus1: 1,
    counselStatus2: 1,
    counselStatus3: 1,
    counselStatus4: 1,
    counselStatus5: 1,
    charge1: 1,
    charge2: 1,
    charge3: 1,
    charge4: 1,
    charge5: 1,
    serviceSchedules: 1,
    serviceSuspendTime: 1,
    autoRelay: 1,
    relayTarget: 1
  }
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      // return res.json({results: doctorItem})
      let query = {$or: [{sponsorId: doctorId}, {'members.userId': doctorId}]}
      let opts = ''
      let fields = {_id: 0, teamId: 1, name: 1, sponsorName: 1}
      Team.getSome(query, function (err, items) {
        if (err) {
          return res.status(500).send(err)
        }
        res.json({results: doctorItem, teams: items})
      }, opts, fields)
    }
  }, opts, fields)
}
// 获取主管医生或主管患者

// 医生端使用的方法：开放修改及设置权限
// 修改服务开启状态 2017-07-14 GY
// 修改开启自动转发功能时的输出，增加所在队伍信息 2017-07-22 YQC
// 承接session.userId，输入修改的服务状态type，输出修改状态（和所在队伍信息）
exports.changeServiceStatus = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1':
          upObj = {counselStatus1: (!doctorItem.counselStatus1)}
          break
        case 'service2':
          upObj = {counselStatus2: (!doctorItem.counselStatus2)}
          break
        case 'service3':
          upObj = {counselStatus3: (!doctorItem.counselStatus3)}
          break
        case 'service4':
          upObj = {counselStatus4: (!doctorItem.counselStatus4)}
          break
        case 'service5':
          upObj = {counselStatus5: (!doctorItem.counselStatus5)}
          break
        case 'service6':
          upObj = {autoRelay: (!doctorItem.autoRelay)}
          break
        default:
          break
      }
      let opts = {
        new: true,
        runValidators: true,
        fields: {
          userId: 1,
          name: 1,
          counselStatus1: 1,
          counselStatus2: 1,
          counselStatus3: 1,
          counselStatus4: 1,
          counselStatus5: 1,
          charge1: 1,
          charge2: 1,
          charge3: 1,
          charge4: 1,
          charge5: 1,
          serviceSchedules: 1,
          serviceSuspendTime: 1,
          autoRelay: 1,
          relayTarget: 1
        }
      }
      Alluser.updateOne(query, upObj, function (err, upitem) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upitem === null) {
          return res.status(404).json({results: '找不到对象'})
        } else {
          if (serviceType !== 'service6') {
            return res.json({results: upitem})
          } else {
            let query = {$or: [{sponsorId: req.session.userId}, {'members.userId': req.session.userId}]}
            let opts = ''
            let fields = {_id: 0, teamId: 1, name: 1, sponsorName: 1}
            Team.getSome(query, function (err, items) {
              if (err) {
                return res.status(500).send(err)
              }
              res.json({currentStatus: upitem, teams: items})
            }, opts, fields)
          }
        }
      }, opts)
    }
  })
}

// 设置服务收费费用 2017-07-14 GY
exports.setCharge = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let charge = req.body.charge || null
  if (charge === null || charge === '') {
    return res.status(412).json({results: '请输入费用'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1':
          if (doctorItem.counselStatus1 === 1) upObj = {charge1: charge}
          break
        case 'service2':
          if (doctorItem.counselStatus2 === 1) upObj = {charge2: charge}
          break
        case 'service3':
          if (doctorItem.counselStatus3 === 1) upObj = {charge3: charge}
          break
        case 'service4':
          if (doctorItem.counselStatus4 === 1) upObj = {charge4: charge}
          break
        case 'service5':
          if (doctorItem.counselStatus5 === 1) upObj = {charge5: charge}
          break
        default:
          break
      }
      if (JSON.stringify(upObj) === '{}') {
        return res.status(412).json({results: '请先开启服务'})
      } else {
        let opts = {
          new: true,
          runValidators: true,
          fields: {
            userId: 1,
            name: 1,
            counselStatus1: 1,
            counselStatus2: 1,
            counselStatus3: 1,
            counselStatus4: 1,
            counselStatus5: 1,
            charge1: 1,
            charge2: 1,
            charge3: 1,
            charge4: 1,
            charge5: 1,
            serviceSchedules: 1,
            serviceSuspendTime: 1,
            autoRelay: 1,
            relayTarget: 1
          }
        }
        Alluser.updateOne(query, upObj, function (err, upitem) {
          if (err) {
            return res.status(500).send(err)
          }
          if (upitem === null) {
            return res.status(404).json({results: '找不到对象'})
          } else {
            return res.json({results: upitem})
          }
        }, opts)
      }
    }
  })
}

// 设置自动转发团队 2017-07-15 GY
exports.setRelayTarget = function (req, res) {
  let query = {userId: req.session.userId}
  let upObj = {
    relayTarget: req.body.relayTarget
  }
  let opts = {
    new: true,
    runValidators: true,
    fields: {
      userId: 1,
      name: 1,
      counselStatus1: 1,
      counselStatus2: 1,
      counselStatus3: 1,
      counselStatus4: 1,
      counselStatus5: 1,
      charge1: 1,
      charge2: 1,
      charge3: 1,
      charge4: 1,
      charge5: 1,
      serviceSchedules: 1,
      serviceSuspendTime: 1,
      autoRelay: 1,
      relayTarget: 1
    }
  }
  Alluser.updateOne(query, upObj, function (err, upitem) {
    if (err) {
      if (err.name === 'CastError') {
        return res.status(412).json({results: '不符合要求的输入', path: err.path})
      } else {
        return res.status(500).send(err)
      }
    }
    if (upitem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      let flag = 0
      for (let i = 0; i < upitem.relayTarget.length; i++) {
        if (JSON.stringify(upitem.relayTarget[i]) === '{}') { break }
        flag++
      }
      if (flag === upitem.relayTarget.length) {
        return res.json({results: upitem})
      } else {
        return res.status(412).json({results: '请检查输入'})
      }
    }
  }, opts)
}

// 面诊服务排班时间表相关 2017-07-15 GY
// 设置排班时间表和加号数量 2017-07-15 GY
// 输入，排班日期／时段／加号数量，输出，添加面诊排班信息
exports.setServiceSchedule = function (req, res) {
  let query = {userId: req.session.userId}
  let day = req.body.day || null
  let time = req.body.time || null
  let total = req.body.total || null
  let pullObj = {}
  let pushObj = {}
  if (day === null || time === null || total === null) {
    return res.status(412).json({results: '请输入day, time, count'})
  } else {
    // 添加预约时段字段 YQC 2017-07-27
    let bookingPeriod = day
    if (time === 'Morning') {
      bookingPeriod = String(bookingPeriod + '-1')
    } else if (time === 'Morning') {
      bookingPeriod = String(bookingPeriod + '-2')
    }
    pullObj = {
      $pull: {
        serviceSchedules: {
          day: day,
          time: time
        }
      }
    }
    pushObj = {
      $push: {
        serviceSchedules: {
          bookingPeriod: bookingPeriod,
          day: day,
          time: time,
          total: total
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      Alluser.update(query, pushObj, function (err, upschedule) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upschedule.n !== 0 && upschedule.nModified === 0) {
          return res.status(400).json({results: '已经存在的schedule'})
        } else if (upschedule.nModified === 1) {
          return res.json({results: '修改成功'})
        }
      })
    }
  })
}
// 删除排班 2017-07-15 GY
// 输入，排班日期／时段；输出，删除面诊排班信息
exports.deleteServiceSchedule = function (req, res) {
  let query = {userId: req.session.userId}
  let day = req.body.day || null
  let time = req.body.time || null
  let pullObj = {}
  if (day === null || time === null) {
    return res.status(412).json({results: '请输入day, time'})
  } else {
    pullObj = {
      $pull: {
        serviceSchedules: {
          day: day,
          time: time
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (pullres.n === 1 && pullres.nModified === 0) {
      return res.status(400).json({results: '该时间没有排班'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
// 获取排班信息 2017-07-19 YQC
// 承接session.userId；输出相应医生的面诊排班信息
exports.getMySchedules = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let query = {userId: doctorId}
  let opts = ''
  let fields = {'_id': 0, 'serviceSchedules': 1, 'schedules': 1}

  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      return res.json({results: doctorItem})
    }
  }, opts, fields)
}

// 设置面诊停诊时间 2017-07-15 GY
exports.setServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let upObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else if ((new Date(start) - new Date(end)) > 0) {
    return res.status(400).json({results: '请确认停诊时间'})
  } else {
    upObj = {
      $addToSet: {
        serviceSuspendTime: {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }
  }
  Alluser.update(query, upObj, function (err, upsus) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upsus.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
// 删除面诊停诊时间 2017-07-15 GY
exports.deleteServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let pullObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else {
    pullObj = {
      $pull: {
        serviceSuspendTime: {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (pullres.n !== 0 && pullres.nModified === 0) {
      return res.status(404).json({results: '未设置的停诊时间'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
// 确认收到面诊：personalDiag表修改
// 输入：code；修改内容：personalDiag.status, time

// 主管医生服务相关
// 获取申请主管医生服务的患者列表 2017-07-19 YQC
exports.getPatientsToReview = function (req, res) {
  let doctorId = req.session.userId
  let queryD = {userId: doctorId, role: 'doctor'}
  let doctorObjectId
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    }
    if (itemD === null) {
      return res.json({results: '医生不存在！'})
    }
    doctorObjectId = itemD._id

    let queryR = {doctorId: doctorObjectId}
    let opts = ''
    let fields = {'_id': 0, 'patientsInCharge': 1}
    let populate = {path: 'patientsInCharge.patientId', select: {'_id': 0, 'userId': 1, 'photoUrl': 1, 'name': 1, 'gender': 1, 'birthday': 1, 'class': 1, 'class_info': 1}}
    DpRelation.getOne(queryR, function (err, itemR) {
      if (err) {
        return res.status(500).send(err)
      }
      let listToFilter = itemR.patientsInCharge || []
      let patientsList = []
      for (let i = 0; i < listToFilter.length; i++) {
        console.log(Number(listToFilter[i].invalidFlag))
        if (Number(listToFilter[i].invalidFlag) === 0) {
          patientsList.push(listToFilter[i])
        }
      }
      if (patientsList.length === 0) {
        return res.json({results: '无主管医生服务待审核的患者！', numberToReview: patientsList.length})
      } else {
        res.json({results: patientsList, numberToReview: patientsList.length})
      }
    }, opts, fields, populate)
  })
}
// 通过或拒绝主管医生申请：patient, dpRelation表数据修改
// 输入：患者ID；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
// 2017-07-21 YQC
exports.reviewPatientInCharge = function (req, res, next) {
  let reviewResult = req.body.reviewResult || null
  if (reviewResult === null) {
    return res.json({result: '请填写reviewResult!'})
  }
  let rejectReason = req.body.rejectReason || null
  if (reviewResult === 'reject') {
    if (rejectReason === null) {
      return res.json({result: '请填写rejectReason!'})
    }
  }
  let patientObjectId = req.body.patientObject._id
  let queryDIC = {patientId: patientObjectId, invalidFlag: 0}
  DoctorsInCharge.getOne(queryDIC, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      return res.json({results: '该患者未申请主管医生服务'})
    } else {
      let chargeDuration = itemDIC.length
      let start = new Date()
      let end = new Date(String(start))
      end.setMonth(start.getMonth() + chargeDuration)
      let doctorObjectId = req.body.doctorObject._id
      let queryR = {doctorId: doctorObjectId, patientsInCharge: {$elemMatch: {$and: [{patientId: patientObjectId}, {invalidFlag: 0}]}}}
      let upObj
      if (reviewResult === 'reject') {
        upObj = {
          $set: {
            'patientsInCharge.$.invalidFlag': 3,
            'patientsInCharge.$.rejectReason': rejectReason
          }
        }
      } else if (reviewResult === 'consent') {
        upObj = {
          $set: {
            'patientsInCharge.$.invalidFlag': 1,
            'patientsInCharge.$.start': start,
            'patientsInCharge.$.end': end
          }
        }
      }
      DpRelation.update(queryR, upObj, function (err, upRelation) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upRelation.n === 0) {
          return res.json({results: '找不到该医生'})
        } else if (upRelation.nModified !== 1) {
          return res.json({results: '该患者未申请主管医生服务'})
        } else {
          // return res.json({results: '更新患者申请成功'})
          req.body.serviceStart = start
          req.body.serviceEnd = end
          next()
        }
      })
    }
  })
}

exports.updateDoctorInCharge = function (req, res) {
  let start = req.body.serviceStart
  let end = req.body.serviceEnd
  let patientObjectId = req.body.patientObject._id
  let reviewResult = req.body.reviewResult || null
  let rejectReason = req.body.rejectReason || null

  let query = {patientId: patientObjectId, invalidFlag: 0}
  let upObj
  if (reviewResult === 'reject') {
    upObj = {
      $set: {
        invalidFlag: 3,
        rejectReason: rejectReason
      }
    }
  } else if (reviewResult === 'consent') {
    upObj = {
      $set: {
        invalidFlag: 1,
        start: start,
        end: end
      }
    }
  }
  DoctorsInCharge.update(query, upObj, function (err, upRelation) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upRelation.n === 0) {
      return res.json({results: '找不到该患者'})
    } else if (upRelation.nModified !== 1) {
      return res.json({results: '该患者不需要审核'})
    } else {
      // return res.json({results: '更新医生申请成功'})
      return res.json({results: '审核完成'})
    }
  })
}

// 患者端使用的方法
// 面诊申请：修改面诊计数，新建面诊表数据
// 输入：医生ID和day, time 修改内容：alluser.serviceSchedules.count+1, new personalDiag
// 返回：personalDiag.code, endTime
exports.updatePDCapacityDown = function (req, res, next) {
  let doctorId = req.body.doctorId || null
  let bookingDay = req.body.day || null
  let bookingTime = req.body.time || null
  if (doctorId === null || bookingDay === null || bookingTime === null) {
    return res.json({results: '请检查doctorId,day,time输入完整'})
  }
  let bookingPeriod = bookingDay
  if (bookingTime === 'Morning') {
    bookingPeriod = String(bookingPeriod + '-1')
  } else if (bookingTime === 'Morning') {
    bookingPeriod = String(bookingPeriod + '-2')
  }
  let queryD = {userId: doctorId, role: 'doctor', 'serviceSchedules.bookingPeriod': bookingPeriod}
  let fieldsD = {_id: 0, serviceSchedules: 1}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemD === null) {
      return res.json({results: '该医生该时段面诊服务未开放'})
    } else {
      // return res.send(itemD)
      let serviceSchedulesList = itemD.serviceSchedules || []
      let serviceSchedule = null
      for (let i = 0; i < serviceSchedulesList.length; i++) {
        if (String(serviceSchedulesList[i].day) === String(bookingDay) && String(serviceSchedulesList[i].time) === String(bookingTime)) {
          serviceSchedule = serviceSchedulesList[i]
          break
        }
      }
      let count = serviceSchedule.count || 0
      let total = serviceSchedule.total || 0
      if (count < total) { // 存在余量，可预约面诊
        // let queryD2 = {userId: doctorId, role: 'doctor', serviceSchedules: {$elemMatch: {day: bookingDay, time: bookingTime}}}
        let upDoc = {
          $inc: {
            'serviceSchedules.$.count': 1
          }
        }
        console.log(queryD, upDoc)
        Alluser.update(queryD, upDoc, function (err, upDoctor) { // 占个号
          if (err) {
            return res.status(500).send(err)
          } else if (upDoctor.nModified === 0) {
            return res.json({results: '面诊数量未更新成功，请检查输入'})
          } else if (upDoctor.nModified !== 0) {
            // return res.json({results: '面诊数量更新成功'})
            next()
          }
        })
      } else { // 可预约面诊数量为零
        return res.json({results: '该时段预约已满，请更换预约时间'})
      }
    }
  }, fieldsD)
}

exports.newPersonalDiag = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let bookingDay = req.body.day
  let bookingTime = req.body.time
  let bookingPeriod = bookingDay
  if (bookingTime === 'Morning') {
    bookingPeriod = String(bookingPeriod + '-1')
  } else if (bookingTime === 'Morning') {
    bookingPeriod = String(bookingPeriod + '-2')
  }
  let queryPD = {doctorId: doctorObjectId, patientId: patientObjectId, bookingDay: bookingDay, bookingPeriod: bookingTime}
  PersionalDiag.getOne(queryPD, function (err, itemPD) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else if (itemPD === null) { // 新建面诊预约
      // 截止时间为预约日期第二天的中午
      let endTime = new Date(bookingDay)
      endTime.setDate(endTime.getDate() + 1)
      endTime.setHours(endTime.getHours() + 12)
      // 创建验证码
      let random = Math.random()
      let min = 100000
      let max = 1000000
      let code = Math.floor(min + (max - min) * random)

      let PDData = {
        diagId: req.newId,
        doctorId: doctorObjectId,
        patientId: patientObjectId,
        bookingPeriod: bookingPeriod,
        code: code,
        creatTime: new Date(),
        endTime: endTime,
        status: 0 // 0: 未开始，1: 已完成，2: 未进行自动结束
      }
      var newPersonalDiag = new PersionalDiag(PDData)
      newPersonalDiag.save(function (err, PDInfo) {
        if (err) {
          return res.status(500).send(err)
        } else {
          // res.json({result: '预约成功', newResults: PDInfo})
          req.body.perDiagObject = PDInfo
          req.body.patientId = req.session.userId
          req.body.type = 5
          next()
        }
      })
    } else { // 已有面诊撤回面诊数量占位
      let doctorId = req.body.doctorId
      let queryD = {userId: doctorId, role: 'doctor', 'serviceSchedules.bookingPeriod': bookingPeriod}
      let upDoc = {
        $inc: {
          'serviceSchedules.$.count': -1
        }
      }
      Alluser.update(queryD, upDoc, function (err, upDoctor) {
        if (err) {
          return res.status(500).send(err)
        } else if (upDoctor.n === 0) {
          return res.json({results: '找不到医生'})
        } else if (upDoctor.nModified === 0) {
          return res.json({results: '面诊数量未更新成功，请检查输入'})
        } else if (upDoctor.nModified !== 0) {
          return res.json({results: '当前时段已预约该医生'})
        }
      })
    }
  })
}

exports.getAvailablePD = function (req, res) {
  let doctorId = req.query.doctorId
  let today = new Date(new Date().toDateString())
  let tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  let twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)

  let query = {userId: doctorId, role: 'doctor', $and: [{'serviceSchedules.day': {$gte: today}}, {'serviceSchedules.day': {$lte: twoWeeksLater}}]}
  Alluser.getOne(query, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    } else {
      if (itemD === null) {
        return res.json({results: '医生不存在'})
      } else {
        return res.json({results: 'itemD'})
      }
    }
  })
}
// 2017-07-18 YQC
// 主管医生申请：patient, dpRelation表数据修改
// 输入：医生ID和购买时长；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
// exports.requestDoctorInCharge = function (req, res, next) {
//   // var patientId = req.body.patientId || null
//   let patientId = req.session.userId
//   let doctorId = req.body.doctorId || null
//   let chargeDuration = req.body.chargeDuration || null
//   // if (patientId == null) {
//   //   return res.json({result: '请填写patientId!'})
//   // }
//   if (doctorId == null) {
//     return res.json({result: '请填写doctorId!'})
//   }
//   if (chargeDuration == null) {
//     return res.json({result: '请填写chargeDuration!'})
//   }
//   let queryD = {userId: doctorId, role: 'doctor'}
//   Alluser.getOne(queryD, function (err, itemD) {
//     if (err) {
//       return res.status(500).send(err)
//     }
//     if (itemD == null) {
//       return res.json({result: '不存在的医生ID!'})
//     }

//     let doctorObjectId = itemD._id
//     let queryP = {userId: patientId, role: 'patient'}
//     Alluser.getOne(queryP, function (err, itemP) {
//       if (err) {
//         return res.status(500).send(err)
//       }
//       if (itemP === null) {
//         return res.json({results: '患者不存在'})
//       }
//       let doctorsInChargeList = itemP.doctorsInCharge || []
//       for (let i = 0; i < doctorsInChargeList.length; i++) {
//         if (Number(doctorsInChargeList[i].invalidFlag) === 0) {
//           return res.json({result: '已申请主管医生，请等待审核!'})
//         } else if (Number(doctorsInChargeList[i].invalidFlag) === 1) {
//           // return res.json({result: '当前已有主管医生!'})
//           let currentDoctorInCharge = doctorsInChargeList[i]
//           if (String(currentDoctorInCharge.doctorId) === String(doctorObjectId)) {
//             return res.json({result: '申请医生对象已是主管医生!'})
//           } else {
//             // return res.json({result: '申请医生对象不是当前的主管医生!'})
//             let queryR = {doctorId: currentDoctorInCharge.doctorId, patientsInCharge: {$elemMatch: {patientId: itemP._id, invalidFlag: 1}}}
//             let upObjR = {
//               $set: {
//                 'patientsInCharge.$.invalidFlag': 2
//               }
//             }
//             DpRelation.update(queryR, upObjR, function (err, upRelation) {
//               if (err) {
//                 return res.status(500).send(err)
//               } else if (upRelation.n === 0) {
//                 return res.json({results: '找不到该医生'})
//               } else if (upRelation.nModified === 1) {
//                 // return res.json({results: '删除主管患者成功'})
//                 let queryP = {_id: itemP._id, doctorsInCharge: {$elemMatch: {doctorId: currentDoctorInCharge.doctorId, invalidFlag: 1}}}
//                 let upObjP = {
//                   $set: {
//                     'doctorsInCharge.$.invalidFlag': 2
//                   }
//                 }
//                 Alluser.update(queryP, upObjP, function (err, upP) {
//                   if (err) {
//                     return res.status(500).send(err)
//                   } else if (upP.n === 0) {
//                     return res.json({results: '找不到该患者'})
//                   }
//                   // } else if (upP.nModified === 1) {
//                   //   // return res.json({results: '删除主管医生成功'})
//                   // }
//                 })
//               }
//             })
//           }
//         }
//       }
//       let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0, length: chargeDuration}
//       doctorsInChargeList.push(doctorNew)
//       let upObj = {$set: {doctorsInCharge: doctorsInChargeList}}
//       Alluser.updateOne(queryP, upObj, function (err, upPatient) {
//         if (err) {
//           return res.status(500).send(err)
//         } else if (upPatient.n === 0) {
//           return res.json({results: '找不到该患者'})
//         } else if (upPatient.nModified !== 0) {
//           // return res.json({results: '添加主管医生成功'})
//           Alluser.getOne(queryP, function (err, patient) {
//             if (err) {
//               return res.status(500).send(err)
//             } else {
//               for (let nodic = 0; nodic < patient.doctorsInCharge.length; nodic++) {
//                 let dic = patient.doctorsInCharge[nodic]
//                 if (dic.invalidFlag === 0) {
//                   req.body.docInChaObject = dic._id
//                   req.body.patientId = req.session.userId
//                 }
//               }
//             }
//           })
//           req.body.doctorObjectId = doctorObjectId
//           req.body.patientObjectId = itemP._id
//           next()
//         }
//       })
//     })
//   })
// }

exports.addDoctorInCharge = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let chargeDuration = req.body.chargeDuration || null
  if (chargeDuration == null) {
    return res.json({result: '请填写chargeDuration!'})
  }
  let queryDIC = {doctorId: doctorObjectId, patientId: patientObjectId}
  DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemsDIC.length !== 0) {
      for (let iDIC = 0; iDIC < itemsDIC.length; iDIC++) {
        if (Number(itemsDIC[iDIC].invalidFlag) === 0) {
          return res.json({result: '已申请主管医生，请等待审核!'})
        } else if (Number(itemsDIC[iDIC].invalidFlag) === 1 && String(itemsDIC[iDIC].doctorId) === String(doctorObjectId)) {
          return res.json({result: '申请医生对象已是主管医生!'})
        }
      }
    }
    // new DIC
    let doctorInCharge = {
      patientId: patientObjectId,
      doctorId: doctorObjectId,
      dpRelationTime: new Date(),
      invalidFlag: 0,
      length: chargeDuration
    }
    let newDoctorInCharge = new DoctorsInCharge(doctorInCharge)
    newDoctorInCharge.save(function (err, doctorInChargeInfo) {
      if (err) {
        return res.status(500).send(err)
      } else {
        // return res.json({message: '新建成功', results: doctorInChargeInfo})
        req.body.dpRelationTime = doctorInChargeInfo.dpRelationTime
        req.body.docInChaObject = doctorInChargeInfo
        req.body.patientId = req.session.userId
        req.body.type = 4
        next()
      }
    })
  })
}

exports.addPatientInCharge = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  let query = {doctorId: doctorObjectId}
  let upObj = {
    $push: {
      patientsInCharge: {
        patientId: patientObjectId,
        dpRelationTime: dpRelationTime,
        invalidFlag: 0,
        length: req.body.chargeDuration
      }
    }
  }
  DpRelation.update(query, upObj, function (err, upRelation1) {
    if (err) {
      return res.status(422).send(err)
    } else if (upRelation1.n === 0) {
      let dpRelationData = {
        doctorId: doctorObjectId
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err)
        }
        DpRelation.update(query, upObj, function (err, upRelation2) {
          if (err) {
            return res.status(422).send(err)
          } else if (upRelation2.nModified === 0) {
            return res.json({result: '未申请成功！请检查输入是否符合要求！'})
          } else if (upRelation2.nModified === 1) {
            // return res.json({result: '申请成功，请等待审核！', results: upRelation2})
            next()
          }
        })
      })
    } else if (upRelation1.nModified === 0) {
      return res.json({result: '未申请成功！请检查输入是否符合要求！'})
    } else if (upRelation1.nModified === 1) {
      // return res.json({result: '申请成功，请等待审核！', results: upRelation1})
      next()
    }
  }, {new: true})
}

// 2017-07-20 YQC
// 获取患者的主管医生服务的状态
exports.getDoctorsInCharge = function (req, res) {
  let patientObjectId = req.body.patientObject._id
  let queryDIC = {patientId: patientObjectId}
  let opts = ''
  let fields = {'_id': 0}
  let populate = {path: 'doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}

  DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemsDIC.length !== 0) {
      for (let i = 0; i < itemsDIC.length; i++) {
        if (Number(itemsDIC[i].invalidFlag) === 0) {
          return res.json({message: '已申请主管医生，请等待审核!'})
        } else if (Number(itemsDIC[i].invalidFlag) === 1) {
          return res.json({message: '当前已有主管医生!', results: itemsDIC[i]})
        }
      }
    }
    res.json({message: '当前无主管医生且无申请!'})
  }, opts, fields, populate)
}

// 2017-07-20 YQC
// 删除主管医生
exports.deleteDoctorInCharge = function (req, res, next) {
  let patientObjectId = req.body.patientObject._id
  let queryP = {patientId: patientObjectId, invalidFlag: 1}
  DoctorsInCharge.getOne(queryP, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      return res.status(404).json({results: '患者当前无主管医生'})
    } else {
      let upObj = {
        $set: {
          invalidFlag: 2
        }
      }
      DoctorsInCharge.update(queryP, upObj, function (err, upDIC) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upDIC.nModified === 0) {
          return res.status(400).json({results: '解绑医生不成功'})
        } else if (upDIC.nModified === 1) {
          // return res.json({results: '解绑医生成功'})
          req.body.doctorObjectId = itemDIC.doctorId
          next()
        }
      })
    }
  })
}

exports.deletePatientInCharge = function (req, res) {
  let patientObjectId = req.body.patientObject._id
  let doctorObjectId = req.body.doctorObjectId
  let queryR = {doctorId: doctorObjectId, patientsInCharge: {$elemMatch: {$and: [{patientId: patientObjectId}, {invalidFlag: 1}]}}}
  let upObj = {
    $set: {
      'patientsInCharge.$.invalidFlag': 2
    }
  }
  DpRelation.update(queryR, upObj, function (err, upRelation) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upRelation.n === 0) {
      return res.json({results: '没有该医生的主管医生服务'})
    } else if (upRelation.nModified !== 1) {
      return res.json({results: '修改失败'})
    } else {
      // return res.json({results: '解绑患者成功'})
      return res.json({results: '取消主管医生服务成功'})
    }
  })
}

// 判断关系
exports.relation = function (req, res) {
  let patientId = req.session.userId
  let patientObjectId = req.body.patientObject._id
  let doctorObjectId = req.body.doctorObject._id
  let queryDIC = {
    patientId: patientObjectId,
    invalidFlag: 1,
    doctorId: doctorObjectId
  }
  let DICRelation
  let FDRelation
  DoctorsInCharge.getOne(queryDIC, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      DICRelation = 0
    } else {
      DICRelation = 1
    }
    let queryPFD = {
      userId: patientId,
      role: 'patient',
      doctors: {$elemMatch: {doctorId: doctorObjectId}}
    }
    Alluser.getOne(queryPFD, function (err, itemPFD) {
      if (err) {
        return res.status(500).send(err)
      } else if (itemPFD === null) {
        FDRelation = 0
      } else {
        FDRelation = 1
      }
      res.json({DIC: DICRelation, FD: FDRelation})
    })
  })
}
