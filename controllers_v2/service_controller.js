var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var Team = require('../models/team')
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
      return res.status(404).send('User Not Found')
    } else if (req.session.role === 'patient') {
      req.body.patientObject = user
      next()
    } else if (req.session.role === 'doctor') {
      req.body.doctorObject = user
      next()
    } else {
      return res.status(400).send('Role of the User is neither a doctor nor a patient')
    }
  })
}
// 获取患者ID对象
exports.getPatientObject = function (req, res, next) {
  let patientId = req.body.patientId || req.query.patientId || null
  if (patientId === null) {
    return res.status(412).send('Please Check Input of patientId')
  }
  let query = {userId: patientId, role: 'patient'}
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      return res.status(500).send(err)
    }
    if (patient === null) {
      return res.status(404).send('Patient Not Found')
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
  let doctorId = req.session.userId || null
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

// 2017-07-18 YQC
// 主管医生申请：patient, dpRelation表数据修改
// 输入：医生ID和购买时长；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
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
        req.body.docInChaObject = doctorInChargeInfo._id
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
exports.getDoctorsInCharge = function (req, res, next) {
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
          // 用于区别是否是 vitalSign插入数据后进行警戒值提醒而获取主管医生 2017-08-22 lgf
          if (req.isOutOfRange) {
            req.body.userId = itemsDIC[i].userId
            req.body.sendBy = req.session.userId
            // 定义警戒值消息类型为6
            req.body.type = 6
            req.body.description = req.body.patientObject.name + '患者的' + req.itemType + '项目超标,测量值为' + req.measureData + ',该项正常值为' + req.recommend
            return next()
          } else {
            return res.json({message: '当前已有主管医生!', results: itemsDIC[i]})
          }
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
