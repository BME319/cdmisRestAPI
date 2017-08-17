var Policy = require('../models/policy')
var Alluser = require('../models/alluser')
var commonFunc = require('../middlewares/commonFunc')

// 获取用户对象 添加保险专员／主管角色 2017-08-08 YQC
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
    } else if (req.session.role === 'insuranceA') {
      req.body.insuranceAObject = user
      next()
    } else if (req.session.role === 'insuranceC') {
      req.body.insuranceCObject = user
      next()
    } else {
      return res.status(400).send('Role of the User is not a doctor / patient / insuranceA / insuranceC')
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
// 获取保险专员ID对象 2017-08-08 YQC
exports.getInsuranceAObject = function (req, res, next) {
  let insuranceAId = req.body.insuranceAId || req.query.insuranceAId || null
  if (insuranceAId === null) {
    return res.status(412).send('Please Check Input of insuranceAId')
  }
  let query = {userId: insuranceAId, role: 'insuranceA'}
  Alluser.getOne(query, function (err, insuranceA) {
    if (err) {
      return res.status(500).send(err)
    }
    if (insuranceA === null) {
      return res.status(404).send('insuranceA Not Found')
    } else {
      req.body.insuranceAObject = insuranceA
      next()
    }
  })
}

// 保险专员／主管获取患者列表 专员只能获取自己负责的患者，主管可获取所有患者 2017-08-08 YQC
exports.getPatients = function (req, res) {
  let status = Number(req.query.status || null)
  let _name = req.query.name || null
  let query = {}
  if (req.session.role === 'insuranceA') {
    query['currentAgent'] = req.body.insuranceAObject._id
  }
  if (status !== null || status !== undefined || status !== '') {
    query['status'] = status
  }
  let opts = ''
  let fields = {_id: 0, patientId: 1, followUps: 1, currentAgent: 1, status: 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {path: 'patientId currentAgent', select: {'_id': 0, 'userId': 1, 'name': 1, 'gender': 1, 'phoneNo': 1, 'VIP': 1, 'birthday': 1}}
  // 模糊搜索
  if (_name) {
    let nameReg = new RegExp(_name)
    populate['match'] = {'patientId.name': nameReg}
  }
  Policy.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      let returns = []
      for (let item in items) {
        if (items[item].patientId !== null) {
          let itemTemp = items[item]
          let followUps = itemTemp.followUps
          let latestFollowUp = followUps[-1]
          delete itemTemp.followUps
          itemTemp['latestFollowUp'] = latestFollowUp
          returns.push(itemTemp)
        }
      }
      res.json({data: returns, code: 0})
    }
  }, opts, fields, populate)
}

// 保险专员／主管获取患者 专员只能获取自己负责的患者，主管可获取所有患者 2017-08-17 YQC
exports.getHistory = function (req, res) {
  let patientId = req.body.patientObject._id
  let query = {patientId: patientId, status: {$ne: 5}}
  let opts = ''
  let fields = {_id: 0, patientId: 1, followUps: 1, currentAgent: 1, status: 1}

  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (req.session.role === 'insuranceA' && String(item.currentAgent) !== String(req.body.insuranceAObject._id)) {
      res.json({msg: '非负责该用户的保险专员', code: 1})
    } else {
      res.json({data: item.followUps, code: 0})
    }
  }, opts, fields)
}

// 保险主管获取专员列表 2017-08-08 YQC
exports.getAgents = function (req, res) {
  let query = {role: 'insuranceA'}
  let _name = req.query.name || null
  if (_name) {
    let nameReg = new RegExp(_name)
    query['name'] = nameReg
  }
  let opts = ''
  let fields = {_id: 0, name: 1, phoneNo: 1, userId: 1}
  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      res.json({data: items, code: 0})
    }
  }, opts, fields)
}

// 保险主管设置／更换专员 2017-08-08 YQC
exports.setAgent = function (req, res) {
  let reason = req.body.reason || null
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let patientObject = req.body.patientObject
  let insuranceAObject = req.body.insuranceAObject
  let insuranceCObject = req.body.insuranceCObject
  let query = {patientId: patientObject._id, status: {$ne: 5}}
  let upObj = {
    $set: {
      currentAgent: insuranceAObject._id
    }
  }
  Policy.updateOne(query, upObj, function (err, upP) {
    let formerAgent = upP.currentAgent
    if (err) {
      return res.status(500).send(err)
    } else if (String(formerAgent) === String(insuranceAObject._id)) {
      return res.json({code: 1, msg: '专员不需改变'})
    } else {
      // res.json({date: upP})
      let followUp = {time: now, type: 2, agentId: insuranceCObject._id}
      // let agent = {startTime: now, agentId: insuranceAObject._id}
      let upAF
      // if (upP.agents.length === 0) {
      if (upP.currentAgent === null || upP.currentAgent === undefined || upP.currentAgent === '') {
        reason = '新用户分配专员'
        followUp['content'] = todayFormat + ' "' + insuranceCObject.name + '"主管因"' + reason + '"分配专员"' + insuranceAObject.name + '"'
        upAF = {
          $addToSet: {
            followUps: followUp // ,
            // agents: agent
          },
          $set: {status: 1}
        }
        Policy.updateOne(query, upAF, function (err, upAF) {
          if (err) {
            return res.status(500).send(err)
          } else {
            return res.json({code: 0, msg: '分配成功'})
          }
        })
      } else if (reason !== null) {
        followUp['content'] = todayFormat + ' "' + insuranceCObject.name + '"主管因"' + reason + '"更换专员为"' + insuranceAObject.name + '"'
        upAF = {
          $addToSet: {
            followUps: followUp // ,
            // agents: agent
          }
        }
        Policy.updateOne(query, upAF, function (err, upAF) {
          if (err) {
            return res.status(500).send(err)
          } else {
            return res.json({code: 0, msg: '更换成功'})
          }
        })
      } else {
        Policy.updateOne(query, {$set: {currentAgent: upP.currentAgent}}, function (err, upUnset) {
          if (err) {
            return res.status(500).send(err)
          } else {
            return res.json({code: 1, msg: '请填写更换专员理由/reason'})
          }
        })
      }
    }
  })
}

// 跟踪记录录入 2017-08-08 YQC
exports.insertFollowUp = function (req, res) {
  let content = req.body.content || null
  if (content === null) {
    return res.json({code: 1, msg: '请输入content'})
  }
  let photoUrls = req.body.photoUrls || []
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let insuranceObject = req.body.insuranceCObject || req.body.insuranceAObject
  let patientObject = req.body.patientObject
  let query = {patientId: patientObject, status: {$ne: 5}}
  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.json({code: 1, msg: '未找到该患者的意向'})
    } else if (req.session.role === 'insuranceA' && String(item.currentAgent) !== String(insuranceObject._id)) {
      return res.json({code: 1, msg: '不是该患者的负责专员'})
    } else {
      let upObj = {
        $push: {
          followUps: {
            content: todayFormat + ' ' + content,
            photos: photoUrls,
            time: now,
            agentId: insuranceObject._id,
            type: 1
          }
        }
      }
      Policy.update(query, upObj, function (err, upItem) {
        if (err) {
          return res.status(500).send(err)
        } else if (upItem.nModified === 0) {
          return res.json({code: 1, msg: '跟踪录入未成功'})
        } else {
          return res.json({code: 0, msg: '跟踪录入成功'})
        }
      })
    }
  })
}

// 保单信息录入 2017-08-08 YQC
exports.insertPolicy = function (req, res) {
  let content = req.body.content || null
  if (content === null) {
    return res.json({code: 1, msg: '请输入content'})
  }
  let photoUrls = req.body.photoUrls || []
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let insuranceObject = req.body.insuranceCObject || req.body.insuranceAObject
  let patientObject = req.body.patientObject
  let query = {patientId: patientObject, status: {$in: [0, 1, 4]}}
  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.json({code: 1, msg: '未找到该患者的意向'})
    } else if (req.session.role === 'insuranceA' && String(item.currentAgent) !== String(insuranceObject._id)) {
      return res.json({code: 1, msg: '不是该患者的负责专员'})
    } else {
      let upObj = {
        $push: {
          followUps: {
            content: todayFormat + ' 由"' + insuranceObject.name + '"录入保单，请主管尽快审核',
            time: now,
            agentId: insuranceObject._id,
            type: 3
          }
        },
        $set: {
          content: content,
          photos: photoUrls,
          status: 2,
          time: now
        }
      }
      Policy.update(query, upObj, function (err, upItem) {
        if (err) {
          return res.status(500).send(err)
        } else if (upItem.nModified === 0) {
          return res.json({code: 1, msg: '保单录入未成功'})
        } else {
          return res.json({code: 0, msg: '保单录入成功'})
        }
      })
    }
  })
}

// 审核保单 2017-08-08 YQC
exports.reviewPolicy = function (req, res) {
  let reviewResult = req.body.reviewResult || null
  if (reviewResult === null) {
    return res.json({code: 1, msg: '请填写reviewResult!'})
  }
  let insuranceCObject = req.body.insuranceCObject
  let patientObject = req.body.patientObject
  let query = {patientId: patientObject, status: 2}
  let upObj
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let rejectReason = req.body.rejectReason || null
  let startTime = new Date(req.body.startTime || null)
  let endTime = new Date(req.body.endTime || null)
  if (reviewResult === 'reject') {
    if (rejectReason === null) {
      return res.json({code: 1, msg: '请填写rejectReason!'})
    }
    upObj = {
      $push: {
        followUps: {
          content: todayFormat + ' 由"' + insuranceCObject.name + '"审核保单，审核不通过，原因为"' + rejectReason + '"，请继续跟进',
          time: now,
          agentId: insuranceCObject._id,
          type: 3
        }
      },
      $set: {
        status: 4,
        supervisor: insuranceCObject._id
      }
    }
  } else if (reviewResult === 'consent') {
    if (startTime === null || endTime === null) {
      return res.json({code: 1, msg: '请填写startTime, endTime!'})
    }
    upObj = {
      $push: {
        followUps: {
          content: todayFormat + ' 由"' + insuranceCObject.name + '"审核保单，审核通过，保单完成',
          time: now,
          agentId: insuranceCObject._id,
          type: 3
        }
      },
      $set: {
        status: 3,
        startTime: startTime,
        endTime: endTime,
        supervisor: insuranceCObject._id
      }
    }
  } else {
    return res.json({code: 1, msg: '请检查reviewResult输入!'})
  }

  Policy.update(query, upObj, function (err, upItem) {
    if (err) {
      return res.status(500).send(err)
    } else if (upItem.n === 0) {
      return res.json({code: 1, msg: '未找到该患者的待审核保单'})
    } else if (upItem.nModified === 0) {
      return res.json({code: 1, msg: '保单审核未成功'})
    } else {
      // return res.json({code: 0, msg: '保单审核成功'})
      let queryP = {_id: patientObject._id, role: 'patient'}
      let upObjP = {
        $set: {
          VIP: 1,
          VIPStartTime: startTime,
          VIPEndTime: endTime
        }
      }
      Alluser.update(queryP, upObjP, function (err, upPat) {
        if (err) {
          return res.status(500).send(err)
        } else if (upPat.nModified === 0) {
          return res.json({code: 1, msg: 'VIP状态设置未成功'})
        } else {
          return res.json({code: 0, msg: '保单审核成功'})
        }
      })
    }
  })
}

// 注销专员 2017-08-08 YQC
exports.agentOff = function (req, res) {
  let insuranceAObject = req.body.insuranceAObject
  let insuranceCObject = req.body.insuranceCObject
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let followUp = {
    time: now,
    type: 2,
    agentId: insuranceCObject._id,
    content: todayFormat + ' "' + insuranceCObject.name + '"主管注销保险专员"' + insuranceAObject.name + '"，请尽快分配新保险专员'
  }
  let query = {currentAgent: insuranceAObject._id, status: {$ne: 5}}
  let upObj = {
    $unset: {currentAgent: 1},
    $set: {status: 0},
    $push: {followUps: followUp}
  }
  Policy.update(query, upObj, function (err, upItems) {
    if (err) {
      return res.status(500).send(err)
    } else {
      return res.json({code: 0, msg: '专员注销成功，' + upItems.nModified + '位患者需分配新专员'})
    }
  }, {multi: true})
}
