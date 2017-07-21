var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')

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
      return res.json({results: doctorItem})
    }
  }, opts, fields)
}
// 获取主管医生或主管患者

// 医生端使用的方法：开放修改及设置权限
// 修改服务开启状态 2017-07-14 GY
// 承接session.userId，输入修改的服务状态type
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
          return res.json({results: upitem})
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
exports.getServiceSchedules = function (req, res) {
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
// 获取申请主管医生服务的患者列表
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
    let populate = {path: 'patientsInCharge.patientId', select: {'photoUrl': 1, 'name': 1, 'gender': 1, 'birthday': 1, 'class': 1, 'class_info': 1}}
    DpRelation.getOne(queryR, function (err, itemR) {
      if (err) {
        return res.status(500).send(err)
      }
      let listToFilter = itemR.patientsInCharge
      console.log(listToFilter)
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

exports.reviewPatientInCharge = function (req, res, next) {
  let patientId = req.body.patientId || null
  let reviewResult = req.body.reviewResult || null
  if (patientId === null) {
    return res.json({result: '请填写patientId!'})
  }
  if (reviewResult === null) {
    return res.json({result: '请填写reviewResult!'})
  }
  let rejectReason = req.body.rejectReason || null
  if (reviewResult === 'reject') {
    if (rejectReason === null) {
      return res.json({result: '请填写rejectReason!'})
    }
  }
  let doctorId = req.session.userId
  let queryD = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    }
    if (itemD == null) {
      return res.json({result: '不存在的医生ID!'})
    }
    let doctorObjectId = itemD._id
    let queryP = {userId: patientId, role: 'patient'}
    console.log(queryP)
    Alluser.getOne(queryP, function (err, itemP) {
      if (err) {
        return res.status(500).send(err)
      }
      if (itemP == null) {
        return res.json({result: '不存在的患者ID!'})
      }
      let doctorsInChargeList = itemP.doctorsInCharge
      let currentDoctorInCharge
      for (let i = 0; i < doctorsInChargeList.length; i++) {
        if (Number(doctorsInChargeList[i].invalidFlag) === 0) {
          currentDoctorInCharge = doctorsInChargeList[i]
          break
        }
      }
      let chargeDuration = currentDoctorInCharge.length
      let start = new Date()
      let end = new Date(String(start))
      end.setMonth(start.getMonth() + chargeDuration)
      // return res.json({start: start, end: end, chargeDuration: chargeDuration})
      // 关于自然月的问题
      // let test1 = '2017-01-30T04:49:28.560Z'
      // let test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))
      // test1 = '2017-01-31T04:49:28.560Z'
      // test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))
      // test1 = '2017-02-28T04:49:28.560Z'
      // test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))
      // test1 = '2017-04-30T04:49:28.560Z'
      // test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))
      // test1 = '2017-05-01T04:49:28.560Z'
      // test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))
      // test1 = '2017-05-31T04:49:28.560Z'
      // test2 = new Date(String(test1))
      // test2.setMonth(test2.getMonth() + 1)
      // console.log(test1, test2, new Date(test2) - new Date(test1))

      let patientObjectId = itemP._id
      let query = {doctorId: doctorObjectId, patientsInCharge: {$elemMatch: {patientId: patientObjectId, invalidFlag: 0}}}
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
      DpRelation.update(query, upObj, function (err, upRelation) {
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
          req.body.doctorObjectId = doctorObjectId
          req.body.patientObjectId = patientObjectId
          next()
        }
      })
    })
  })
}

exports.updateDoctorInCharge = function (req, res) {
  let start = req.body.serviceStart
  let end = req.body.serviceEnd
  let doctorObjectId = req.body.doctorObjectId
  let patientObjectId = req.body.patientObjectId
  let reviewResult = req.body.reviewResult || null
  let rejectReason = req.body.rejectReason || null

  let query = {_id: patientObjectId, doctorsInCharge: {$elemMatch: {doctorId: doctorObjectId, invalidFlag: 0}}}
  let upObj
  if (reviewResult === 'reject') {
    upObj = {
      $set: {
        'doctorsInCharge.$.invalidFlag': 3,
        'doctorsInCharge.$.rejectReason': rejectReason
      }
    }
  } else if (reviewResult === 'consent') {
    upObj = {
      $set: {
        'doctorsInCharge.$.invalidFlag': 1,
        'doctorsInCharge.$.start': start,
        'doctorsInCharge.$.end': end
      }
    }
  }
  Alluser.update(query, upObj, function (err, upRelation) {
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

// 2017-07-20 YQC
// 获取患者的主管医生服务的状态
exports.getDoctorsInCharge = function (req, res) {
  let patientId = req.session.userId
  let queryP = {userId: patientId, role: 'patient'}
  let opts = ''
  let fields = {'_id': 0, 'doctorsInCharge': 1}
  Alluser.getOne(queryP, function (err, itemP) {
    if (err) {
      return res.status(500).send(err)
    }
    let doctorsInChargeList = itemP.doctorsInCharge
    for (let i = 0; i < doctorsInChargeList.length; i++) {
      if (Number(doctorsInChargeList[i].invalidFlag) === 0) {
        return res.json({message: '已申请主管医生，请等待审核!'})
      } else if (Number(doctorsInChargeList[i].invalidFlag) === 1) {
        return res.json({message: '当前已有主管医生!'})
      }
    }
    res.json({message: '当前无主管医生且无申请!'})
  }, opts, fields)
}

// 2017-07-20 YQC
// 删除主管医生
exports.getMyDoctorInCharge = function (req, res, next) {
  let patientId = req.session.userId
  let queryP = {userId: patientId, role: 'patient'}
  Alluser.getOne(queryP, function (err, itemP) {
    if (err) {
      return res.status(500).send(err)
    }
    let doctorsInChargeList = itemP.doctorsInCharge
    let doctorInCharge = null
    for (let i = 0; i < doctorsInChargeList.length; i++) {
      if (Number(doctorsInChargeList[i].invalidFlag) === 1) {
        doctorInCharge = doctorsInChargeList[i]
      }
    }
    if (doctorInCharge === null) {
      return res.json({message: '当前无主管医生!'})
    } else {
      req.body.doctorInCharge = doctorInCharge
      req.body.patient = itemP
      next()
    }
  })
}

exports.deleteDoctorInCharge = function (req, res, next) {
  let patientId = req.session.userId
  let doctorInCharge = req.body.doctorInCharge
  let queryP = {userId: patientId, role: 'patient'}
  let pullObj = {
    $pull: {
      doctorsInCharge: {
        doctorId: doctorInCharge.doctorId || null,
        firstTime: new Date(doctorInCharge.firstTime) || null,
        invalidFlag: 1,
        length: doctorInCharge.length || null,
        start: doctorInCharge.start || null,
        end: doctorInCharge.end || null
      }
    }
  }
  Alluser.update(queryP, pullObj, function (err, pull) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pull.n === 0) {
      return res.status(404).json({results: '找不到患者对象'})
    } else {
      let pushObj = {
        $push: {
          doctorsInCharge: {
            doctorId: doctorInCharge.doctorId,
            firstTime: new Date(doctorInCharge.firstTime),
            invalidFlag: 2,
            length: doctorInCharge.length,
            start: doctorInCharge.start,
            end: doctorInCharge.end
          }
        }
      }
      Alluser.update(queryP, pushObj, function (err, push) {
        if (err) {
          return res.status(500).send(err)
        }
        if (push.n !== 0 && push.nModified === 0) {
          return res.status(400).json({results: '解绑医生不成功'})
        } else if (push.nModified === 1) {
          // res.json({results: '解绑医生成功'})
          next()
        }
      })
    }
  })
}

exports.getPatientInCharge = function (req, res, next) {
  let doctorInCharge = req.body.doctorInCharge
  let queryD = {doctorId: doctorInCharge.doctorId}
  let patientId = req.body.patient._id
  DpRelation.getOne(queryD, function (err, itemR) {
    if (err) {
      return res.status(500).send(err)
    }
    let patientsInChargeList = itemR.patientsInCharge
    let patientInCharge = null
    for (let i = 0; i < patientsInChargeList.length; i++) {
      if (String(patientsInChargeList[i].patientId) === String(patientId) & Number(patientsInChargeList[i].invalidFlag) === 1) {
        patientInCharge = patientsInChargeList[i]
      }
    }
    if (patientInCharge === null) {
      return res.json({message: '该医生并不主管该病人!'})
    } else {
      req.body.patientInCharge = patientInCharge
      next()
    }
  })
}

exports.deletePatientInCharge = function (req, res) {
  let doctorInCharge = req.body.doctorInCharge
  let patientInCharge = req.body.patientInCharge
  let queryD = {doctorId: doctorInCharge.doctorId}
  let pullObj = {
    $pull: {
      patientsInCharge: {
        patientId: patientInCharge.patientId || null,
        dpRelationTime: new Date(patientInCharge.dpRelationTime) || null,
        invalidFlag: 1,
        length: patientInCharge.length || null,
        start: patientInCharge.start || null,
        end: patientInCharge.end || null
      }
    }
  }
  DpRelation.update(queryD, pullObj, function (err, pull) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pull.n === 0) {
      return res.status(404).json({results: '找不到医生对象'})
    } else {
      let pushObj = {
        $push: {
          patientsInCharge: {
            patientId: patientInCharge.patientId,
            dpRelationTime: new Date(patientInCharge.dpRelationTime),
            invalidFlag: 2,
            length: patientInCharge.length,
            start: patientInCharge.start,
            end: patientInCharge.end
          }
        }
      }
      DpRelation.update(queryD, pushObj, function (err, push) {
        if (err) {
          return res.status(500).send(err)
        }
        if (push.n !== 0 && push.nModified === 0) {
          return res.status(400).json({results: '解绑患者不成功'})
        } else if (push.nModified === 1) {
          res.json({results: '删除主管医生成功'})
        }
      })
    }
  })
}

// 判断关系
exports.relation = function (req, res) {
  let patientId = req.session.userId
  let doctorId = req.query.doctorId
  let queryD = {userId: doctorId, role: 'doctor'}
  let doctorObjectId
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemD === null) {
      return res.status(404).json({results: '找不到医生对象'})
    } else {
      doctorObjectId = itemD._id
    }
    let queryPDIC = {
      userId: patientId,
      role: 'patient',
      doctorsInCharge: {$elemMatch: {invalidFlag: 1, doctorId: doctorObjectId}}
    }
    let DICRelation
    let FDRelation
    Alluser.getOne(queryPDIC, function (err, itemPDIC) {
      console.log(itemPDIC)
      if (err) {
        return res.status(500).send(err)
      } else if (itemPDIC === null) {
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
        console.log(itemPFD)
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
  })
}

// 2017-07-18 YQC
// 主管医生申请：patient, dpRelation表数据修改
// 输入：医生ID和购买时长；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
exports.requestDoctorInCharge = function (req, res, next) {
  // var patientId = req.body.patientId || null
  let patientId = req.session.userId
  let doctorId = req.body.doctorId || null
  let chargeDuration = req.body.chargeDuration || null
  // if (patientId == null) {
  //   return res.json({result: '请填写patientId!'})
  // }
  if (doctorId == null) {
    return res.json({result: '请填写doctorId!'})
  }
  if (chargeDuration == null) {
    return res.json({result: '请填写chargeDuration!'})
  }
  let queryD = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    }
    if (itemD == null) {
      return res.json({result: '不存在的医生ID!'})
    }

    let doctorObjectId = itemD._id
    let queryP = {userId: patientId, role: 'patient'}
    Alluser.getOne(queryP, function (err, itemP) {
      if (err) {
        return res.status(500).send(err)
      }
      if (itemP === null) {
        return res.json({results: '患者不存在'})
      }
      let doctorsInChargeList = itemP.doctorsInCharge || {}
      for (let i = 0; i < doctorsInChargeList.length; i++) {
        if (Number(doctorsInChargeList[i].invalidFlag) === 0) {
          return res.json({result: '已申请主管医生，请等待审核!'})
        } else if (Number(doctorsInChargeList[i].invalidFlag) === 1) {
          // return res.json({result: '当前已有主管医生!'})
          let currentDoctorInCharge = doctorsInChargeList[i]
          if (String(currentDoctorInCharge.doctorId) === String(doctorObjectId)) {
            return res.json({result: '申请医生对象已是主管医生!'})
          } else {
            // return res.json({result: '申请医生对象不是当前的主管医生!'})
            let queryR = {doctorId: currentDoctorInCharge.doctorId, patientsInCharge: {$elemMatch: {patientId: itemP._id, invalidFlag: 1}}}
            let upObjR = {
              $set: {
                'patientsInCharge.$.invalidFlag': 2
              }
            }
            DpRelation.update(queryR, upObjR, function (err, upRelation) {
              if (err) {
                return res.status(500).send(err)
              } else if (upRelation.n === 0) {
                return res.json({results: '找不到该医生'})
              } else if (upRelation.nModified === 1) {
                // return res.json({results: '删除主管患者成功'})
                let queryP = {_id: itemP._id, doctorsInCharge: {$elemMatch: {doctorId: currentDoctorInCharge.doctorId, invalidFlag: 1}}}
                let upObjP = {
                  $set: {
                    'doctorsInCharge.$.invalidFlag': 2
                  }
                }
                Alluser.update(queryP, upObjP, function (err, upP) {
                  if (err) {
                    return res.status(500).send(err)
                  } else if (upP.n === 0) {
                    return res.json({results: '找不到该患者'})
                  }
                  // } else if (upP.nModified === 1) {
                  //   // return res.json({results: '删除主管医生成功'})
                  // }
                })
              }
            })
          }
        }
      }
      let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0, length: chargeDuration}
      doctorsInChargeList.push(doctorNew)
      let upObj = {$set: {doctorsInCharge: doctorsInChargeList}}
      Alluser.updateOne(queryP, upObj, function (err, upPatient) {
        if (err) {
          return res.status(500).send(err)
        } else if (upPatient.n === 0) {
          return res.json({results: '找不到该患者'})
        } else if (upPatient.nModified !== 0) {
          // return res.json({results: '添加主管医生成功'})
          req.body.doctorObjectId = doctorObjectId
          req.body.patientObjectId = itemP._id
          next()
        }
      })
    })
  })
}

exports.addPatientInCharge = function (req, res) {
  let doctorObjectId = req.body.doctorObjectId
  let patientObjectId = req.body.patientObjectId
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
            return res.json({result: '申请成功，请等待审核！', results: upRelation2})
          }
        })
      })
    } else if (upRelation1.nModified === 0) {
      return res.json({result: '未申请成功！请检查输入是否符合要求！'})
    } else if (upRelation1.nModified === 1) {
      return res.json({result: '申请成功，请等待审核！', results: upRelation1})
    }
  }, {new: true})
}
