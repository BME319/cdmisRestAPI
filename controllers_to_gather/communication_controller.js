var Communication = require('../models/communication')
var Team = require('../models/team')
var DpRelation = require('../models/dpRelation')
var News = require('../models/news')
var Message = require('../models/message')
var commonFunc = require('../middlewares/commonFunc')
var Alluser = require('../models/alluser')

exports.userIDbyPhone = function (req, res, next) {
  let query = {phoneNo: req.body.phoneNo}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.json({status: 1, msg: '服务器错误!'})
    } else if (item === null) {
      return res.json({status: 1, msg: '不存在该用户!'})
    } else {
      req.item = item
      return next()
    }
  })
}

exports.dUserIDbyPhone = function (req, res, next) {
  let query = {phoneNo: req.body.phoneNo, role: 'doctor'}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.json({status: 1, msg: '服务器错误!'})
    } else if (item === null) {
      return res.json({status: 1, msg: '不存在该医生!'})
    } else {
      req.item = item
      return next()
    }
  })
}

exports.receiverIDbyPhone = function (req, res, next) {
  let messageType = req.body.messageType || null
  let _messageType = Number(messageType)
  if (_messageType === 1) {               // 单聊获取用户userId
    let query = {phoneNo: req.body.receiver}
    Alluser.getOne(query, function (err, receiverItem) {
      if (err) {
        return res.json({status: 1, msg: '服务器错误!'})
      } else if (receiverItem === null) {
        return res.json({status: 1, msg: '不存在该用户!'})
      } else {
        req.receiverItem = receiverItem
        return next()
      }
    })
  } else if (_messageType === 2) {        // 群聊直接输入群名
    return next()
  } else {
    return res.json({status: 1, msg: '请输入正确的信息类型!'})
  }
}

// 新建组
exports.newTeam = function (req, res, next) {
  var teamData = {
    teamId: req.body.teamId,
    name: req.body.name,
    sponsorId: req.item.userId,
    sponsorName: req.item.name,
    sponsorPhoto: commonFunc.removePrefix(req.item.photoUrl),
    photoAddress: commonFunc.removePrefix(req.item.photoUrl)
    // description: req.body.description
  }
  if (req.body.time == null || req.body.time === '') {
    teamData['time'] = new Date()
  } else {
    teamData['time'] = new Date(req.body.time)
  }

  var newTeam = new Team(teamData)
  newTeam.save(function (err, teamInfo) {
    if (err) {
      return res.json({status: 1, msg: '操作失败!'})
    } else {
      teamInfo.sponsorPhoto = commonFunc.adaptPrefix(teamInfo.sponsorPhoto)
      teamInfo.photoAddress = commonFunc.adaptPrefix(teamInfo.photoAddress)
      // return res.json({status: 0, msg: '操作成功!'})
      req.status = 0
      req.msg = '新建成功!'
      return next()
    }
  })
}

// 给team表中members字段增加组员
exports.insertMember = function (req, res, next) {
  if (req.body.teamId == null || req.body.teamId === '') {
    return res.json({status: 1, msg: '请填写teamId!'})
  }
  var query = {
    teamId: req.body.teamId
  }
  let members = [
    {
      userId: req.item.userId,
      name: req.item.name,
      photoUrl: req.item.photoUrl
    }
  ]
  // let members = req.item || []
  for (var i = members.length - 1; i >= 0; i--) {
    members[i].photoUrl = commonFunc.removePrefix(members[i].photoUrl)
  }

  var upObj = {
    $addToSet: {
      members: {
        $each: members
      }
    }
  }

  Team.update(query, upObj, function (err, upmember) {
    if (err) {
      return res.json({msg: err.message, status: 1})
    }
    if (upmember.nModified === 0 && upmember.n === 0) {
      return res.json({msg: '未成功修改！请检查输入是否符合要求！', status: 1})
    }
    if (upmember.nModified === 0 && upmember.n !== 0) {
      return res.json({msg: '未成功修改！请检查是否成员已添加！', status: 1})
    }
    if (upmember.nModified !== 0) {
      next()
    }
  }, {new: true})
}

// 更新成员数量
exports.updateNumber = function (req, res, next) {
  var query = {teamId: req.body.teamId}
  Team.getOne(query, function (err, team) {
    if (err) {
      return res.json({msg: '服务器错误, 团队查询失败!', status: 1})
    }
    var number = team.members.length + 1

    var upObj = {number: number}

    Team.updateOne(query, upObj, function (err, upteam) {
      if (err) {
        return res.json({msg: err.message, status: 1})
      } else {
        upteam.members = upteam.members || []
        for (var i = upteam.members.length - 1; i >= 0; i--) {
          upteam.members[i].photoUrl = commonFunc.adaptPrefix(upteam.members[i].photoUrl)
        }
        // return res.json({msg: '更新成员成功', status: 0})
        req.status = 0
        req.msg = '更新成员成功!'
        return next()
      }
    }, {new: true})
  })
}

// 删除team表中members字段指定组员
exports.removeMember = function (req, res, next) {
  if (req.body.teamId == null || req.body.teamId === '') {
    return res.json({msg: '请填写teamId!', status: 1})
  }
  var query = {
    teamId: req.body.teamId
  }

  var upObj = {
    $pull: {
      members: {
        userId: req.item.userId
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Team.update(query, upObj, function (err, upmember) {
    if (err) {
      return res.json({msg: err.message, status: 1})
    }
    // upmember未选中文件，即团队编号不匹配
    if (upmember.n === 0 && upmember.nModified === 0) {
      return res.json({msg: '未成功移除，请检查组是否存在！', status: 1})
    }
    // upmember选中文件，但未更新文件，即团队编号匹配但团队成员不匹配
    if (upmember.n !== 0 && upmember.nModified === 0) {
      return res.json({msg: '未成功移除，请检查成员是否存在！', status: 1})
    }
    // upmember更新文件，即更新了团队成员
    if (upmember.nModified !== 0) {
      // return res.json({msg: '移除成功', status: 0})
      next()
    }
  }, {new: true})
}

// 根据ID及type存储交流记录
exports.postCommunication = function (req, res, next) {
  var commmunicationData = {
    messageNo: req.newId,
    messageType: req.body.messageType,
    sendBy: req.item.userId,
    // receiver: req.body.receiver,
    sendDateTime: new Date(),
    content: req.body.content,                     // socket不用了，req.body.content 仅为发送的photo\text
    // newsType: req.body.content.newsType,        // 单聊为医患11，群聊为医-团队13
    mediaType: req.body.mediaType                  // 媒体类型，photo,text
  }

  if (req.body.messageType === '1') {
    commmunicationData['newsType'] = '11'
    commmunicationData['receiver'] = req.receiverItem.userId
  } else if (req.body.messageType === '2') {
    commmunicationData['newsType'] = '13'
    commmunicationData['receiver'] = req.body.receiver
  }
  var newCommunication = new Communication(commmunicationData)
  newCommunication.save(function (err, communicationInfo) {
    if (err) {
      return res.status(500).json({status: 1, msg: err})
    }
    req.status = 0
    req.msg = '新建成功！'
    next()
  })
}

// 患者群体教育 向患者群发 查询所有目标
exports.getMassTargets = function (req, res, next) {
  let content = req.body.content || null
  if (content === null) {
    return res.json({msg: '群发内容不能为空', status: 1})
  }
  let target = req.body.target || null
  if (target === null) {
    return res.json({msg: '群发目标不能为空', status: 1})
  }
  let query = {doctorId: req.item._id}
  let opts = {}
  let fields = {}
  let populate = {path: 'patients.patientId patientsInCharge.patientId', select: {_id: 0, userId: 1, name: 1}}
  DpRelation.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).json({msg: err, status: 1})
    }
    if (doctorItem === null) {
      return res.status(404).json({msg: '暂无关注或主管的患者', status: 1})
    } else {
      let targets = []
      let targetsUserId = []
      switch (target) {
        case 'FOLLOW':
          for (let i = 0; i < doctorItem.patients.length; i++) {
            if (doctorItem.patients[i].patientId !== null) {
              targets.push(doctorItem.patients[i].patientId)
            }
          }
          break
        case 'INCHARGE':
          for (let i = 0; i < doctorItem.patientsInCharge.length; i++) {
            if (doctorItem.patientsInCharge[i].patientId !== null && doctorItem.patientsInCharge[i].invalidFlag === 1) {
              targets.push(doctorItem.patientsInCharge[i].patientId)
            }
          }
          break
        case 'ALL':
          for (let i = 0; i < doctorItem.patients.length; i++) {
            if (doctorItem.patients[i].patientId) {
              targets.push(doctorItem.patients[i].patientId)
              targetsUserId.push(doctorItem.patients[i].patientId.userId)
            }
          }
          for (let j = 0; j < doctorItem.patientsInCharge.length; j++) {
            if (doctorItem.patientsInCharge[j].patientId && doctorItem.patientsInCharge[j].invalidFlag === 1) {
              if (targetsUserId.indexOf(doctorItem.patientsInCharge[j].patientId.userId) === -1) {
                targets.push(doctorItem.patientsInCharge[j].patientId)
              }
            }
          }
          break
        default:
          break
      }
      if (targets.length === 0) {
        return res.status(404).json({msg: '无有效群发目标', status: 1})
      } else {
        req.massTarget = targets
        // console.log('req.massTarget', req.massTarget)
        next()
      }
    }
  }, opts, fields, populate)
}

// 构建并写入news表和message表
exports.massCommunication = function (req, res, next) {
  function add00 (m) {
    return m < 10 ? '00' + m : (m < 100 ? '0' + m : m)
  }
  function add0 (m) {
    return m < 10 ? '0' + m : m
  }
  let now = new Date()
  let y = now.getFullYear()
  let m = now.getMonth() + 1
  let d = now.getDate()
  let h = now.getHours()
  let mm = now.getMinutes()
  let s = now.getMilliseconds()

  let communicationDatas = []
  // let content = []
  let content = req.body.content || null

  let doctorname = req.item.name
  let title = '医生 ' + doctorname + ' 给您发来一条消息'
  let description = '您的关注/主管医生 ' + doctorname + ' 给您发来一条群体消息：' + content

  for (let i = 0; i < req.massTarget.length; i++) {
    let massId = 'MAM' + req.item.userId + y + add0(m) + add0(d) + add0(h) + add0(mm) + add00(s) + add00(i)

    let communicationData = {
      messageId: massId,
      userId: req.massTarget[i].userId,
      sendBy: req.item.userId,
      readOrNot: 0,
      type: 8,
      time: now,
      title: title,
      description: description,
      url: ''
    }

    communicationDatas[i] = communicationData
  }

  let uparr = []

  for (let i = 0; i < req.massTarget.length; i++) {
    uparr[i] = {
      updateOne: {
        filter: {
          userId: req.massTarget[i].userId,
          userRole: 'patient',
          sendBy: req.item.userId,
          type: 8
        },
        update: {
          time: now,
          title: title,
          description: description,
          readOrNot: 0,
          messageId: communicationDatas[i].messageId
        },
        upsert: true
      }
    }
  }

  // console.log(communicationDatas)

  Message.create(communicationDatas, function (err, cmuInfos) {
    if (err) {
      return res.status(500).json({msg: err, status: 1})
    }
    News.bulkWrite(uparr, function (err, newsInfo) {
      if (err) {
        return res.status(500).json({msg: err, status: 1})
      }
      // return res.json({msg: '群发成功', status: 0})
      req.status = 0
      req.msg = '群发成功!'
      return next()
    })
  })
}
