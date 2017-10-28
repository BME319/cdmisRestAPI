var Policy = require('../models/policy')
var Alluser = require('../models/alluser')
var commonFunc = require('../middlewares/commonFunc')

// 获取用户对象 添加保险专员／主管角色 2017-08-08 YQC
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    } else if (user === null) {
      return res.status(404).send('User Not Found')
    } else {
      let roleFlag = 1
      if (req.session.role === 'insuranceA' || req.session.role.indexOf('insuranceA') !== -1) {
        req.body.insuranceAObjectS = user
        roleFlag = 0
      }
      if (req.session.role === 'insuranceC' || req.session.role.indexOf('insuranceC') !== -1) {
        req.body.insuranceCObjectS = user
        roleFlag = 0
      }
      if (req.session.role === 'admin' || req.session.role.indexOf('admin') !== -1) {
        req.body.adminObjectS = user
        roleFlag = 0
      }
      if (roleFlag) {
        return res.status(400).send('Role of the User is not a insuranceA / insuranceC / admin')
      } else {
        return next()
      }
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
  let iAOS = req.body.insuranceAObjectS || null
  let iCOS = req.body.insuranceCObjectS || null
  let iAdminOS = req.body.adminObjectS || null
  if ((iAOS || iCOS || iAdminOS) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let status = req.query.status || null
  let _name = req.query.name || null
  let _agentName = req.query.agentName || null
  let _gender = req.query.gender || null
  if (_gender !== null) {
    if (Number(_gender) !== 1 && Number(_gender) !== 2) {
      return res.json({msg: '请确认gender的输入是否正确', code: 1})
    }
  }
  let _phone = req.query.phoneNo || null

  let query = {}
  if (req.session.role === 'insuranceA' || (iAOS !== null && iCOS === null)) { // 专员只能获取自己负责的患者
    query['currentAgent'] = iAOS._id
  }
  if ((status !== null) && Number(status) !== 9) { // 输入9返回所有患者列表
    query['status'] = Number(status)
  }
  let opts = ''
  let skip = req.query.skip || null
  let limit = req.query.limit || null
  if (limit !== null && skip !== null) {
    opts = {limit: Number(limit), skip: Number(skip), sort: '_id'}
  } else if (limit === null && skip === null) {
    opts = {sort: '_id'}
  } else {
    return res.json({msg: '请确认skip,limit的输入是否正确', code: 1})
  }
  let fields = {_id: 0, patientId: 1, followUps: 1, currentAgent: 1, status: 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = [
    {path: 'patientId', match: {}, select: {'_id': 0, 'userId': 1, 'name': 1, 'gender': 1, 'phoneNo': 1, 'VIP': 1, 'birthday': 1}},
    {path: 'currentAgent', select: {'_id': 0, 'name': 1, 'phoneNo': 1}},
    {path: 'followUps.agentId', select: {'_id': 0, 'name': 1, 'phoneNo': 1, 'userId': 1, 'gender': 1}}
  ]
  // 模糊搜索
  if (_name) {
    let nameReg = new RegExp(_name)
    populate[0]['match']['name'] = nameReg
  }
  if (_gender) {
    populate[0]['match']['gender'] = _gender
  }
  if (_phone) {
    let phoneReg = new RegExp(_phone)
    populate[0]['match']['phoneNo'] = phoneReg
  }
  if (_agentName) {
    let agentNameReg = new RegExp(_agentName)
    populate[1]['match'] = {'name': agentNameReg}
  }

  Policy.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      let returns = []
      for (let item = 0; item < items.length; item++) {
        if (items[item].patientId !== null && items[item].currentAgent !== null) {
          let itemTemp = {}
          let followUps = items[item].followUps
          let latestFollowUp = followUps[followUps.length - 1]
          latestFollowUp.photos = commonFunc.addPrefixs(latestFollowUp.photos)
          itemTemp['latestFollowUp'] = latestFollowUp
          itemTemp['patientId'] = items[item].patientId
          itemTemp['currentAgent'] = items[item].currentAgent
          itemTemp['status'] = items[item].status
          returns.push(itemTemp)
        }
      }
      res.json({data: returns, code: 0})
    }
  }, opts, fields, populate)
}

// 保险专员／主管获取患者跟踪记录详情 专员只能获取自己负责的患者，主管可获取所有患者 2017-08-17 YQC
exports.getHistory = function (req, res) {
  let iAOS = req.body.insuranceAObjectS || null
  let iCOS = req.body.insuranceCObjectS || null
  let iAdminOS = req.body.adminObjectS || null
  let pO = req.body.patientObject || null
  if (((iAOS || iCOS || iAdminOS) && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let query = {patientId: pO._id, status: {$ne: 5}}
  let opts = ''
  let skip = req.query.skip || null
  let limit = req.query.limit || null
  let countFlag = 0
  if (limit !== null && skip !== null) {
    limit = Number(limit)
    skip = Number(skip)
  } else if (limit === null && skip === null) { // limit skip 未输入，返回计数
    countFlag = 1
  } else {
    return res.json({msg: '请确认skip,limit的输入是否正确', code: 1})
  }
  let fields = {_id: 0, patientId: 1, followUps: 1, currentAgent: 1, status: 1}
  let populate = {path: 'followUps.agentId', select: {'_id': 0, 'name': 1, 'phoneNo': 1, 'userId': 1, 'gender': 1}}

  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    if (item === null) {
      return res.json({msg: '该患者无跟踪详情', code: 1})
    } else {
      if ((req.session.role === 'insuranceA' || (iAOS !== null && iCOS === null)) && String(item.currentAgent) !== String(iAOS._id)) {
        return res.json({msg: '非负责该用户的保险专员', code: 1}) // 专员只能获取自己负责的患者跟踪记录
      } else if (countFlag === 1) {
        return res.json({data: item.followUps.length, code: 0})
      } else {
        let followUps = item.followUps.reverse().slice(skip, skip + limit)
        for (let followUp = 0; followUp < followUps.length; followUp++) {
          followUps[followUp].photos = commonFunc.addPrefixs(followUps[followUp].photos)
        }
        return res.json({data: followUps, code: 0})
      }
    }
  }, opts, fields, populate)
}

// 保险主管获取专员列表 2017-08-08 YQC
exports.getAgents = function (req, res, next) {
  let query = {role: 'insuranceA'}
  let _name = req.query.name || null
  if (_name) {
    let nameReg = new RegExp(_name)
    query['name'] = nameReg
  }
  let opts = ''
  let fields = {_id: 1, name: 1, phoneNo: 1, userId: 1, gender: 1}

  let skip = req.query.skip || null
  let limit = req.query.limit || null
  if (limit !== null && skip !== null) {
    req.limit = limit
    req.skip = skip
  } else if (limit === null && skip === null) { // limit skip 未输入，返回全部专员列表
    req.full = 1
  } else {
    return res.json({msg: '请确认skip,limit的输入是否正确', code: 1})
  }

  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else if (items.length === 0) {
      return res.json({data: [], code: 0})
    } else {
      // res.json({data: items, code: 0})
      let returns = []
      for (let item in items) {
        let agent = items[item]
        let queryA = {currentAgent: agent._id}
        Policy.count(queryA, function (err, num) {
          if (err) {
            return res.status(500).send(err)
          } else {
            let itemTemp = {}
            itemTemp['name'] = agent.name
            itemTemp['phoneNo'] = agent.phoneNo
            itemTemp['userId'] = agent.userId
            itemTemp['gender'] = agent.gender
            itemTemp['currentPatientNo'] = num
            returns.push(itemTemp)
            req.returns = returns
            if (req.returns.length === items.length) {
              return next()
            }
          }
        })
      }
    }
  }, opts, fields)
}

exports.sortAgents = function (req, res) {
  let returns = req.returns
  returns.sort(function (x, y) {
    if (x.currentPatientNo > y.currentPatientNo) {
      return 1
    }
  })
  if (req.full) {
    res.json({data: returns, code: 0})
  } else {
    res.json({data: returns.slice(Number(req.skip), Number(req.skip) + Number(req.limit)), code: 0})
  }
}

// 保险主管设置／更换专员 2017-08-08 YQC
exports.setAgent = function (req, res) {
  let iCOS = req.body.insuranceCObjectS || null
  let iAO = req.body.insuranceAObject || null
  let pO = req.body.patientObject || null
  if ((iAO && iCOS && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }

  let reason = req.body.reason || null
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let query = {patientId: pO._id, status: {$ne: 5}}
  let upObj = {
    $set: {
      currentAgent: iAO._id
    }
  }
  Policy.updateOne(query, upObj, function (err, upP) {
    let formerAgent = upP.currentAgent
    if (err) {
      return res.status(500).send(err)
    } else if (String(formerAgent) === String(iAO._id)) {
      return res.json({code: 1, msg: '专员不需改变'})
    } else {
      let followUp = {time: now, type: 2, agentId: iCOS._id}
      let upAF
      if ((upP.currentAgent || null) === null) {
        reason = '新用户分配专员'
        followUp['content'] = todayFormat + ' "' + iCOS.name + '"主管因"' + reason + '"分配专员"' + iAO.name + '"'
        upAF = {
          $addToSet: {
            followUps: followUp
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
        followUp['content'] = todayFormat + ' "' + iCOS.name + '"主管因"' + reason + '"更换专员为"' + iAO.name + '"'
        upAF = {
          $addToSet: {
            followUps: followUp
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

exports.editInfo = function (req, res) {
  let query = {userId: req.session.userId}
  if (req.session.role === 'insuranceC' || req.session.role.indexOf('insuranceC') !== -1) {
    // 主管角色，输入insuranceAId参数则修改某专员信息，不输入则修改自己的信息
    let insuranceAId = req.body.insuranceAId || null
    if (insuranceAId !== null) {
      query = {userId: insuranceAId, role: 'insuranceA'}
    }
  }
  let upObj = {}
  let name = req.body.name || null
  let gender = req.body.gender || null
  let phoneNo = req.body.phoneNo || null
  let password = req.body.password || null
  if (name !== null) {
    upObj['name'] = name
  }
  if (gender !== null) {
    upObj['gender'] = gender
  }
  if (phoneNo !== null) {
    upObj['phoneNo'] = phoneNo
  }
  if (password !== null) {
    upObj['password'] = password
  }

  Alluser.updateOne(query, upObj, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else {
      return res.json({code: 0, msg: '修改成功'})
    }
  }, {new: true})
}

// 跟踪记录录入 2017-08-08 YQC
exports.insertFollowUp = function (req, res) {
  let iAOS = req.body.insuranceAObjectS || null
  let iCOS = req.body.insuranceCObjectS || null
  let pO = req.body.patientObject || null
  if (((iAOS || iCOS) && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let content = req.body.content || null
  if (content === null) {
    return res.json({code: 1, msg: '请输入content'})
  }
  let photoUrls = commonFunc.removePrefixs(req.body.photoUrls || [])

  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let insuranceObject = iAOS || iCOS
  let query = {patientId: pO._id, status: {$ne: 5}}
  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.json({code: 1, msg: '未找到该患者的意向'})
    } else if ((req.session.role === 'insuranceA' || (iAOS !== null && iCOS === null)) && String(item.currentAgent) !== String(insuranceObject._id)) {
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
  let iAOS = req.body.insuranceAObjectS || null
  let iCOS = req.body.insuranceCObjectS || null
  let pO = req.body.patientObject || null
  if (((iAOS || iCOS) && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let content = req.body.content || null
  if (content === null) {
    return res.json({code: 1, msg: '请输入content'})
  }
  let photoUrls = commonFunc.removePrefixs(req.body.photoUrls || [])

  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let insuranceObject = iAOS || iCOS
  let query = {patientId: pO._id, status: {$in: [0, 1, 4]}}
  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.json({code: 1, msg: '未找到该患者的意向'})
    } else if ((req.session.role === 'insuranceA' || (iAOS !== null && iCOS === null)) && String(item.currentAgent) !== String(insuranceObject._id)) {
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

// 保险专员／主管获取患者保单详情 专员只能获取自己负责的患者，主管可获取所有患者 2017-08-23 YQC
exports.getPolicy = function (req, res) {
  let iAOS = req.body.insuranceAObjectS || null
  let iCOS = req.body.insuranceCObjectS || null
  let iAdminOS = req.body.adminObjectS || null
  let pO = req.body.patientObject || null
  if (((iAOS || iCOS || iAdminOS) && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let query = {patientId: pO._id, status: {$ne: 5}}
  let opts = ''

  let fields = {_id: 0, patientId: 1, content: 1, photos: 1, status: 1, currentAgent: 1}

  Policy.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if ((req.session.role === 'insuranceA' || (iAOS !== null && iCOS === null)) && String(item.currentAgent) !== String(iAOS._id)) {
      res.json({msg: '非负责该用户的保险专员', code: 1}) // 专员只能获取自己负责的患者的保单信息
    } else {
      if (item !== null) {
        item.photos = commonFunc.addPrefixs(item.photos)
      }
      res.json({data: item, code: 0})
    }
  }, opts, fields)
}

// 审核保单 2017-08-08 YQC
exports.reviewPolicy = function (req, res) {
  let iCOS = req.body.insuranceCObjectS || null
  let pO = req.body.patientObject || null
  if ((iCOS && pO) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let reviewResult = req.body.reviewResult || null
  if (reviewResult === null) {
    return res.json({code: 1, msg: '请填写reviewResult!'})
  }
  let query = {patientId: pO._id, status: 2}
  let upObj
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let rejectReason = req.body.rejectReason || null
  let startTime = req.body.startTime || null
  let endTime = req.body.endTime || null
  if (reviewResult === 'reject') {
    if (rejectReason === null) {
      return res.json({code: 1, msg: '请填写rejectReason!'})
    } else {
      upObj = {
        $push: {
          followUps: {
            content: todayFormat + ' 由"' + iCOS.name + '"审核保单，审核不通过，原因为"' + rejectReason + '"，请继续跟进',
            time: now,
            agentId: iCOS._id,
            type: 3
          }
        },
        $set: {
          status: 4,
          supervisor: iCOS._id
        }
      }
    }
  } else if (reviewResult === 'consent') {
    if (startTime === null || endTime === null) {
      return res.json({code: 1, msg: '请填写startTime, endTime!'})
    } else {
      upObj = {
        $push: {
          followUps: {
            content: todayFormat + ' 由"' + iCOS.name + '"审核保单，审核通过，保单完成',
            time: now,
            agentId: iCOS._id,
            type: 3
          }
        },
        $set: {
          status: 3,
          startTime: new Date(new Date(startTime).toLocaleDateString()),
          endTime: new Date(new Date(endTime).toLocaleDateString()),
          supervisor: iCOS._id
        }
      }
    }
  } else {
    return res.json({code: 1, msg: '请检查reviewResult输入!'})
  }

  Policy.updateOne(query, upObj, function (err, upItem) {
    if (err) {
      return res.status(500).send(err)
    } else if (upItem === null) {
      return res.json({code: 1, msg: '未找到该患者的待审核保单'})
    } else if (Number(upItem.status) === 3) {
      // return res.json({code: 0, msg: '保单审核成功'})
      let queryP = {_id: pO._id, role: 'patient'}
      let upObjP = {
        $set: {
          VIP: 1,
          VIPStartTime: new Date(new Date(startTime).toLocaleDateString()),
          VIPEndTime: new Date(new Date(endTime).toLocaleDateString())
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
    } else {
      return res.json({code: 0, msg: '保单审核成功'})
    }
  }, {new: true})
}

// 注销专员 2017-08-08 YQC
exports.agentOff = function (req, res) {
  let iAO = req.body.insuranceAObject || null
  let iCOS = req.body.insuranceCObjectS || null
  if ((iAO && iCOS) === null) {
    return res.json({msg: '请检查输入', code: 1})
  }
  let now = new Date()
  let dayTemp = commonFunc.convertToFormatDate(new Date(now))
  let todayFormat = dayTemp.slice(0, 4) + '年' + dayTemp.slice(4, 6) + '月' + dayTemp.slice(6, 8) + '日'
  let followUp = {
    time: now,
    type: 2,
    agentId: iCOS._id,
    content: todayFormat + ' "' + iCOS.name + '"主管注销保险专员"' + iAO.name + '"，请尽快分配新保险专员'
  }
  let query = {currentAgent: iAO._id, status: {$ne: 5}}
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
