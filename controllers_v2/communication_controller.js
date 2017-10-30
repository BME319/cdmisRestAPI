// 注释 2017-07-14 YQC

var config = require('../config')
var webEntry = require('../settings').webEntry
var Communication = require('../models/communication')
var Counsel = require('../models/counsel')
var Team = require('../models/team')
// var Patient = require('../models/patient')
// var Doctor = require('../models/doctor')
var Consultation = require('../models/consultation')
var DpRelation = require('../models/dpRelation')
var News = require('../models/news')
var Message = require('../models/message')
var commonFunc = require('../middlewares/commonFunc')
var request = require('request')
var Alluser = require('../models/alluser')
var wechatCtrl = require('../controllers_v2/wechat_controller')
var async = require('async')
// var commonFunc = require('../middlewares/commonFunc')

// 根据counselId获取counsel表除messages外的信息 2017-03-31 GY
// 注释 输入，counselId；输出，问诊信息
exports.getCounselReport = function (req, res) {
  if (req.query.counselId == null || req.query.counselId === '') {
    return res.json({result: '请填写counselId!'})
  }
  // 查询条件
  var _counselId = req.query.counselId
  var query = {counselId: _counselId}

  // 设置参数
  var opts = ''
  var fields = {'_id': 0, 'messages': 0, 'revisionInfo': 0}
  var populate = {path: 'doctorId patientId', select: {'_id': 0, 'userId': 1, 'name': 1}}

  Counsel.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item.symptomPhotoUrl.constructor === Array) {
      if (item.symptomPhotoUrl.length) {
        for (let j = 0; j < item.symptomPhotoUrl.length; j++) {
          if (typeof(item.symptomPhotoUrl[j]) === 'string') {
            let re = item.symptomPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
            // console.log(re)
            if (re) {
              item.symptomPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
            }
          }
        }
      }
    }
    if (item.diagnosisPhotoUrl.constructor === Array) {
      if (item.diagnosisPhotoUrl.length) {
        for (let j = 0; j < item.diagnosisPhotoUrl.length; j++) {
          if (typeof(item.diagnosisPhotoUrl[j]) === 'string') {
            let re = item.diagnosisPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
            // console.log(re)
            if (re) {
              item.diagnosisPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
            }
          }
        }
      }
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// 根据teamId获取team表所有信息 2017-03-31 GY
// 注释 输入，teamId；输出，团队信息
exports.getTeam = function (req, res) {
  if (req.query.teamId == null || req.query.teamId === '') {
    return res.json({result: '请填写teamId!'})
  }
  // 查询条件
  var _teamId = req.query.teamId
  var query = {teamId: _teamId}

  // 设置参数
  var opts = ''
  var fields = {'_id': 0, 'revisionInfo': 0}

  Team.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item !== null) {
      item.sponsorPhoto = commonFunc.adaptPrefix(item.sponsorPhoto)
      item.photoAddress = commonFunc.adaptPrefix(item.photoAddress)
      for (var i = item.members.length - 1; i >= 0; i--) {
        item.members[i].photoUrl = commonFunc.adaptPrefix(item.members[i].photoUrl)
      }
    }
    res.json({results: item})
  }, opts, fields)
}

// 新建组 2017-04-06 GY
// 注释 输入teamId，name，sponsorId，sponsorName，sponsorPhoto，photoAddress，description，time可选；输出，团队条目保存
exports.newTeam = function (req, res) {
  var teamData = {
    // teamId: req.newId,
    teamId: req.body.teamId,
    name: req.body.name,
    sponsorId: req.body.sponsorId,
    sponsorName: req.body.sponsorName,
    sponsorPhoto: commonFunc.removePrefix(req.body.sponsorPhoto),
    photoAddress: commonFunc.removePrefix(req.body.photoAddress),
    // members: [
    //  {
    //    userId: String,
    //    name: String
    //  }
    // ],
    // time: new Date(),
    description: req.body.description
    // number: req.body.,

    // revisionInfo:{
    // operationTime:new Date(),
    // userId:"gy",
    // userName:"gy",
    // terminalIP:"10.12.43.32"
    // }
  }
  if (req.body.time == null || req.body.time === '') {
    teamData['time'] = new Date()
    // teamData['time'] = commonFunc.getNowFormatSecond();
  } else {
    teamData['time'] = new Date(req.body.time)
  }

  var newTeam = new Team(teamData)
  newTeam.save(function (err, teamInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      teamInfo.sponsorPhoto = commonFunc.adaptPrefix(teamInfo.sponsorPhoto)
      teamInfo.photoAddress = commonFunc.adaptPrefix(teamInfo.photoAddress)
      res.json({result: '新建成功', newResults: teamInfo})
    }
  })
}

// 注释 删除组 输入，teamId；输出，团队条目删除
exports.deleteTeam = function (req, res) {
  var _teamId = req.body.teamId
  var query = {teamId: _teamId}
  Team.remove(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({result: 0, msg: 'delete success', data: item})
  })
}

// 新建会诊 2017-04-06 GY
// 注释 查询团队 输入teamId，输出teamObject
exports.checkTeam = function (req, res, next) {
  if (req.body.teamId == null || req.body.teamId === '') {
    return res.json({result: '请填写teamId!'})
  }
  var query = {
    teamId: req.body.teamId
  }
  Team.getOne(query, function (err, team) {
    if (err) {
            // console.log(err);
      return res.status(500).send('服务器错误, 团队查询失败!')
    }
    if (team == null) {
      return res.json({result: '不存在的teamID！'})
    }
    req.body.teamObject = team
    next()
  })
}
// 注释 查询咨询信息 输入counselId，输出diseaseInfo
exports.checkCounsel = function (req, res, next) {
  if (req.body.counselId == null || req.body.counselId === '') {
    return res.json({result: '请填写counselId!'})
  }
  var query = {
    counselId: req.body.counselId
  }
  Counsel.getOne(query, function (err, counsel) {
    if (err) {
            // console.log(err);
      return res.status(500).send('服务器错误, 咨询信息查询失败!')
    }
    if (counsel == null) {
      return res.json({result: '不存在的counselID！'})
    }
    if (counsel.symptomPhotoUrl.constructor === Array) {
      if (counsel.symptomPhotoUrl.length) {
        for (let j = 0; j < counsel.symptomPhotoUrl.length; j++) {
          if (typeof(counsel.symptomPhotoUrl[j]) === 'string') {
            let re = counsel.symptomPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
            // console.log(re)
            if (re) {
              counsel.symptomPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
            }
          }
        }
      }
    }
    if (counsel.diagnosisPhotoUrl.constructor === Array) {
      if (counsel.diagnosisPhotoUrl.length) {
        for (let j = 0; j < counsel.diagnosisPhotoUrl.length; j++) {
          if (typeof(counsel.diagnosisPhotoUrl[j]) === 'string') {
            let re = counsel.diagnosisPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
            // console.log(re)
            if (re) {
              counsel.diagnosisPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
            }
          }
        }
      }
    }
    req.body.diseaseInfo = counsel
    next()
  })
}
// 注释 查询患者信息 输入patientId，输出patientObject
exports.checkPatient = function (req, res, next) {
  if (req.body.patientId == null || req.body.patientId === '') {
    return res.json({result: '请填写patientId!'})
  }
  var query = {
    userId: req.body.patientId,
    role: 'patient'
  }
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 患者查询失败!')
    }
    if (patient == null) {
      return res.json({result: '不存在的patientID！'})
    }
    req.body.patientObject = patient
    next()
  })
}
// 注释 查询（主管）医生信息 输入sponsorId，输出sponsorObject
exports.checkDoctor = function (req, res, next) {
  if (req.body.sponsorId == null || req.body.sponsorId === '') {
    return res.json({result: '请填写sponsorId!'})
  }
  var query = {
    userId: req.body.sponsorId,
    role: 'doctor'
  }
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 医生查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的doctorID！'})
    }
    req.body.sponsorObject = doctor
    next()
  })
}
// 注释 承接team／counsel／patient／sponsorObeject，输入status，consultationId；输出，新建会诊信息保存
exports.newConsultation = function (req, res) {
  var status
  if (req.body.status == null || req.body.status === '') {
    // 无status参数传入时，自动设置为进行中，定义为1
    status = 1
  } else {
    status = req.body.status
  }

  var consultationData = {
    // consultationId: req.newId,
    consultationId: req.body.consultationId,
    sponsorId: req.body.sponsorObject._id,
    patientId: req.body.patientObject._id,
    time: new Date(),
    // time: commonFunc.getNowFormatSecond(),
    diseaseInfo: req.body.diseaseInfo._id,
    status: status,
    // messages: [
    //      {
   //    sender: String,
   //    receiver: String,
   //    time: Date,
   //    content: String
   //      }
  // ],
  // conclusion: String,
    teamId: req.body.teamObject._id

  // revisionInfo:{
  //   operationTime:new Date(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
  }

  var newConsultation = new Consultation(consultationData)
  newConsultation.save(function (err, consultationInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: consultationInfo})
  })
}

// 根据ID获取consultation
// 注释 输入，consultationId；输出，会诊信息
exports.getConsultation = function (req, res) {
  if (req.query.consultationId == null || req.query.consultationId === '') {
    return res.json({result: '请填写consultationId!'})
  }
  var query = {
    consultationId: req.query.consultationId
  }
  var opts = ''
  var fields = ''
  var populate = {
    'path': 'patientId diseaseInfo sponsorId',
    'select': {
      'diagnosisInfo': 0, 'doctors': 0, 'revisionInfo': 0
    }
  }
  Consultation.getOne(query, function (err, item) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (item === null) {
      return res.json({result: '不存在的consultationId!'})
    } else {
      if (item.patientId !== null) {
        item.patientId.photoUrl = commonFunc.adaptPrefix(item.patientId.photoUrl)
      }
      if (item.sponsorId !== null) {
        item.sponsorId.photoUrl = commonFunc.adaptPrefix(item.sponsorId.photoUrl)
      }
      res.json({result: item})
    }
  }, fields, opts, populate)
}

// 根据consultationId更新conclusion 2017-04-06 GY
// 注释 输入，consultationId；输出，更新会诊信息
exports.conclusion = function (req, res) {
  if (req.body.consultationId == null || req.body.consultationId === '') {
    return res.json({result: '请填写consultationId!'})
  }
  if (req.body.conclusion == null || req.body.conclusion === '') {
    return res.json({result: '请填写conclusion!'})
  }
  // var status
  // if (req.body.status == null || req.body.status === '') {
  //     // 无status参数传入时，自动设置为已完成
  //   status = 0
  // } else {
  //   status = req.body.status
  // }

  var query = {
    consultationId: req.body.consultationId
  }

  var upObj = {
    conclusion: req.body.conclusion// ,
    // status: status
  }
  // return res.json({query: query, upObj: upObj});
  Consultation.updateOne(query, upObj, function (err, upConclusion) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upConclusion == null) {
      return res.json({result: '更新结论失败'})
    }
    res.json({result: '更新结论成功', results: upConclusion})
  }, {new: true})
}

// 给team表中members字段增加组员 2017-04-06 GY
// 注释 输入，teamId，members；输出，增加组员信息
exports.insertMember = function (req, res, next) {
  if (req.body.teamId == null || req.body.teamId === '') {
    return res.json({result: '请填写teamId!'})
  }
  var query = {
    teamId: req.body.teamId
  }
  let members = req.body.members || []
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
  // return res.json({query: query, upObj: upObj});
  Team.update(query, upObj, function (err, upmember) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upmember.nModified === 0 && upmember.n === 0) {
      return res.json({result: '未成功修改！请检查输入是否符合要求！', results: upmember})
    }
    if (upmember.nModified === 0 && upmember.n !== 0) {
      return res.json({result: '未成功修改！请检查是否成员已添加！', results: upmember})
    }
    if (upmember.nModified !== 0) {
      // return res.json({result:'新建或修改成功', results:upmember});
      next()
    }
  // res.json({results: upmember});
  }, {new: true})
}

// 更新成员数量
// 注释 输入，teamId；输出，更新团队成员数量
exports.updateNumber = function (req, res) {
  var query = {teamId: req.body.teamId}
  Team.getOne(query, function (err, team) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 团队查询失败!')
    }

    var number = team.members.length + 1

    var upObj = {number: number}

    Team.updateOne(query, upObj, function (err, upteam) {
      if (err) {
        return res.status(422).send(err.message)
      } else {
        upteam.members = upteam.members || []
        for (var i = upteam.members.length - 1; i >= 0; i--) {
          upteam.members[i].photoUrl = commonFunc.adaptPrefix(upteam.members[i].photoUrl)
        }
        return res.json({result: '更新成员成功', results: upteam})
      }
    }, {new: true})
        // res.json({results:team});
  })
}

// 删除team表中members字段指定组员 2017-04-06 GY
// 注释 输入，teamId，membersUserId；输出，删除组员信息
exports.removeMember = function (req, res, next) {
  if (req.body.teamId == null || req.body.teamId === '') {
    return res.json({result: '请填写teamId!'})
  }
  var query = {
    teamId: req.body.teamId
  }

  var upObj = {
    $pull: {
      members: {
        userId: req.body.membersUserId
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Team.update(query, upObj, function (err, upmember) {
    if (err) {
      return res.status(422).send(err.message)
    }
    // upmember未选中文件，即团队编号不匹配
    if (upmember.n === 0 && upmember.nModified === 0) {
      return res.json({result: '未成功移除，请检查组是否存在！', results: upmember})
    }
    // upmember选中文件，但未更新文件，即团队编号匹配但团队成员不匹配
    if (upmember.n !== 0 && upmember.nModified === 0) {
      return res.json({result: '未成功移除，请检查成员是否存在！', results: upmember})
    }
    // upmember更新文件，即更新了团队成员
    if (upmember.nModified !== 0) {
  // return res.json({result:'移除成功', results: upmember});
      next()
    }

  // res.json({results: upmember});
  }, {new: true})
}

// 更新医生与医生的最后交流时间
// 注释 从doctor表获取A医生信息 输入，doctorId；输出，doctorObject
exports.getDoctor1Object = function (req, res, next) {
  if (req.body.doctorId == null || req.body.doctorId === '') {
    return res.json({result: '请填写doctorId!'})
  }
  var query = {
    userId: req.body.doctorId,
    role: 'doctor'
  }
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的doctorId！'})
    }
    req.body.doctorObject = doctor
    next()
  })
}
// 注释 从doctor表获取B医生信息 输入，doctorId；输出，doctor2Object
exports.getDoctor2Object = function (req, res, next) {
  if (req.body.doctorId2 == null || req.body.doctorId2 === '') {
    return res.json({result: '请填写doctorId2!'})
  }
  var query = {
    userId: req.body.doctorId2,
    role: 'doctor'
  }
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的doctorId2！'})
    }
    req.body.doctor2Object = doctor
    next()
  })
}
// 注释 承接doctorObject，doctor2Object；输出，删除DpRelation表中A医生条目中与B医生的交流记录
exports.removeDoctor = function (req, res, next) {
  var query = {
    doctorId: req.body.doctorObject._id
  }

  var upObj = {
    $pull: {
      doctors: {
        doctorId: req.body.doctor2Object._id
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  DpRelation.update(query, upObj, function (err, updpRelation) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updpRelation.n === 0) {
  // return res.json({result: updpRelation});
      var dpRelationData = {
        doctorId: req.body.doctorObject._id
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        // return res.json({result: dpRelationInfo});
        next()
      })
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 0) {
     // return res.json({result:'未成功移除，请检查成员是否存在！', results: updpRelation})
      next()
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 1) {
  // return res.json({result:'移除成功', results: updpRelation})
      next()
    }
  }, {new: true})
}
// 注释 承接doctorObject，doctor2Object；输出，删除DpRelation表中B医生条目中与A医生的交流记录
exports.removeDoctor2 = function (req, res, next) {
  var query = {
    doctorId: req.body.doctor2Object._id
  }

  var upObj = {
    $pull: {
      doctors: {
        doctorId: req.body.doctorObject._id
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  DpRelation.update(query, upObj, function (err, updpRelation) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updpRelation.n === 0) {
  // return res.json({result: updpRelation});
      var dpRelationData = {
        doctorId: req.body.doctor2Object._id
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        // return res.json({result: dpRelationInfo});
        next()
      })
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 0) {
      // return res.json({result:'未成功移除，请检查成员是否存在！', results: updpRelation})
      next()
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 1) {
  // return res.json({result:'移除成功', results: updpRelation})
      next()
    }
  }, {new: true})
}
// 注释 承接doctorObject，doctor2Object；输出，新建DpRelation表中B医生条目中与A医生的交流记录
exports.updateLastTalkTime2 = function (req, res, next) {
  var query = {
    doctorId: req.body.doctor2Object._id
  }

  var upObj = {
    $addToSet: {
      doctors: {
        doctorId: req.body.doctorObject._id,
        lastTalkTime: new Date(req.body.lastTalkTime)
      }
    }
  }

  // return res.json({query: query, upObj: upObj});
  DpRelation.update(query, upObj, function (err, updpRelation) {
    if (err) {
      return res.status(422).send(err.message)
    }

    if (updpRelation.n !== 0 && updpRelation.nModified === 0) {
  // return res.json({result:'', results: updpRelation})
      next()
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 1) {
  // return res.json({result:'更新成功', results: updpRelation})
      next()
    }
  })
}
// 注释 承接doctorObject，doctor2Object；输出，新建DpRelation表中A医生条目中与B医生的交流记录
exports.updateLastTalkTime = function (req, res) {
  var query = {
    doctorId: req.body.doctorObject._id
  }

  var upObj = {
    $addToSet: {
      doctors: {
        doctorId: req.body.doctor2Object._id,
        lastTalkTime: new Date(req.body.lastTalkTime)
      }
    }
  }

  // return res.json({query: query, upObj: upObj});
  DpRelation.update(query, upObj, function (err, updpRelation) {
    if (err) {
      return res.status(422).send(err.message)
    }

    if (updpRelation.n !== 0 && updpRelation.nModified === 0) {
      return res.json({result: '', results: updpRelation})
    }
    if (updpRelation.n !== 0 && updpRelation.nModified === 1) {
      return res.json({result: '更新成功', results: updpRelation})
    }
  }, {new: true})
}

// 根据ID及type存储交流记录 2017-04-21 GY
// 注释 承接communication类型newId；输入messageType，sendBy，receiver，content.createTimeInMillis/newsType；输出，交流记录存储
exports.postCommunication = function (req, res, next) {
  var commmunicationData = {
    messageNo: req.newId,
    messageType: req.body.messageType,
    sendBy: req.body.sendBy,
    receiver: req.body.receiver,
    // sendByRole: req.body.content.clientType, // 区分微信端和app端，doctor,patient,wechatdoctor,wechatpatient
    receiverRole: req.body.content.targetRole,  // 不区分微信端和app端，doctor,patient
    sendDateTime: req.body.content.createTimeInMillis,
    content: req.body.content,
    newsType: req.body.content.newsType
  }

  let sendByRole = req.body.content.clientType
  if (sendByRole === 'wechatdoctor') {
    sendByRole = 'doctor'
  } else if (sendByRole === 'wechatpatient') {
    sendByRole = 'patient'
  }
  commmunicationData['sendByRole'] = sendByRole
  req.commmunicationData = commmunicationData
  // console.log('commmunicationData', commmunicationData)
  var newCommunication = new Communication(commmunicationData)
  newCommunication.save(function (err, communicationInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }

    var msg = communicationInfo.content
    req.communicationInfo = communicationInfo
        // do not save into news

    // 用户咨询记录
    if (msg.contentType === 'custom' && (msg.content.type === 'count-notice' || msg.content.type === 'counsel-upgrade')) {
      return res.json({result: '新建成功', newResults: communicationInfo})
    }
    // 医生交流沟通记录
    if (msg.targetType === 'single') { // 点对点交流记录
          // console.log("111");
      request({
        // url: 'http://' + webEntry.domain + '/api/v2/new/news' + '?token=' + req.query.token || req.body.token,
        url: 'http://' + webEntry.domain + '/api/v2/new/newstemp',
        method: 'POST',
        body: bodyGen(msg, communicationInfo['messageNo']),
        json: true
      }, function (err, response) {
        if (err) return res.status(500).send(err)
        // return res.json({result: '新建成功', newResults: communicationInfo})
        return next()
      })
    } else { // team群发记录
      request({
        // url: 'http://' + webEntry.domain + '/api/v2/new/teamNews' + '?token=' + req.query.token || req.body.token,
        url: 'http://' + webEntry.domain + '/api/v2/new/teamNewstemp',
        method: 'POST',
        body: bodyGen(msg, communicationInfo['_id']),
        json: true
      }, function (err, response) {
                // console.log('err');
                // console.log(err);
                // console.log('res');
                // console.log(response);
        if (err) return res.status(500).send(err)
        return res.json({result: '新建成功', newResults: communicationInfo})
      })
    }

      // res.json({result:'新建成功', newResults: communicationInfo});
  })
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}

exports.sendMsgTemplate = function (req, res) {
  // 设置排序规则函数，时间降序
  function sortTime (a, b) {
    return b.time - a.time
  }
  // 微信模板消息
  async.parallel({
    receiver: function (callback) {
      Alluser.getOne({userId: req.body.content.targetID, role: req.commmunicationData.receiverRole}, function (err, item1) {
        callback(err, item1)
      })
    },
    send: function (callback) {
      Alluser.getOne({userId: req.body.content.fromID, role: req.commmunicationData.sendByRole}, function (err, item2) {
        callback(err, item2)
      })
    }
  }, function (err, results) {
    if (err) {
      console.log(err.errmsg)
    }
    if (results.receiver !== null && results.send !== null) {
      let query = {status: 1}
      if (req.commmunicationData.receiverRole === 'doctor') {
        query = {
          patientId: results.send._id,
          doctorId: results.receiver._id
        }
        Counsel.getSome(query, function (err, items) {
          if (err) {
            console.log(err.errmsg)
          }
          if (items.length === 0) {
            return res.json({result: '新建成功', newResults: req.communicationInfo})
          } else {
            var counsels = []
            counsels = items.sort(sortTime)
            let counselId = counsels[0].counselId
            // console.log(counselId)
            let help = counsels[0].help
            if (req.body.content.contentType === 'custom') {
              counselId = req.commmunicationData.content.content.counselId
            } else if (req.body.content.contentType === 'image') {
              help = '[图片]'
            } else if (req.body.content.contentType === 'text') {
              help = req.body.content.content.text
            }
            let date = new Date()
            let y = date.getFullYear()
            let m = date.getMonth() + 1
            let d = date.getDate()
            let h = date.getHours()
            let mm = date.getMinutes()
            let s = date.getSeconds()
            let formatSecond = y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s)
            let actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=https://media.haihonghospitalmanagement.com/proxy&response_type=code&scope=snsapi_userinfo&state=doctor_11_1_' + req.body.content.fromID + '_' + counselId + '&#wechat_redirect'
            var templateDoc = {
              'userId': req.body.content.targetID,
              'role': 'doctor',
              'postdata': {
                'template_id': config.wxTemplateIdConfig.newCounselToDocOrTeam,
                'url': actionUrl,                                  // 跳转路径需要添加
                'data': {
                  'first': {
                    'value': '您的患者有新的提问，请及时处理',
                    'color': '#173177'
                  },
                  'keyword1': {
                    'value': counselId,                     // 咨询ID,custom以外的聊天记录貌似获取不到。。
                    'color': '#173177'
                  },
                  'keyword2': {
                    'value': req.body.content.fromName,     // 患者信息（姓名，性别，年龄）
                    'color': '#173177'
                  },
                  'keyword3': {
                    'value': help, // 问题描述
                    'color': '#173177'
                  },
                  'keyword4': {
                    'value': formatSecond, // 提交时间
                    'color': '#173177'
                  },

                  'remark': {
                    'value': '感谢您的使用！',
                    'color': '#173177'
                  }
                }
              }
            }
            let params = templateDoc
            wechatCtrl.wechatMessageTemplate(params, function (err, results) {
              if (err) {
                console.log(new Date(), 'auto_send_messageTemplate_toDoc_fail_' + req.commmunicationData.messageNo)
 +              return res.json({result: '新建成功', newResults: req.communicationInfo})
              } else {
                if (results.messageTemplate.errcode === 0) {
                  return res.json({result: '新建成功', newResults: req.communicationInfo})
                } else {
                  return res.json({result: '新建成功', newResults: req.communicationInfo})
                }
              }
            })
          }
        })
      } else if (req.commmunicationData.receiverRole === 'patient') {
        let answer = ''
        if (req.body.content.contentType === 'text') {
          answer = req.body.content.content.text
        } else if (req.body.content.contentType === 'image') {
          answer = '[图片]'
        }
        query = {
          patientId: results.receiver._id,
          doctorId: results.send._id
        }
        Counsel.getSome(query, function (err, items) {
          if (err) {
            console.log(err.errmsg)
          }
          if (items.length === 0) {
            return res.json({result: '新建成功', newResults: req.communicationInfo})
          } else {
            var counsels = []
            counsels = items.sort(sortTime)
            let counselId = counsels[0].counselId
            let help = counsels[0].help
            let actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=https://media.haihonghospitalmanagement.com/proxy&response_type=code&scope=snsapi_userinfo&state=patient_11_1_' + req.body.content.fromID + '_' + counselId + '&#wechat_redirect'
            var templatePat = {
              'userId': req.body.content.targetID,
              'role': 'patient',
              'postdata': {
                'template_id': config.wxTemplateIdConfig.docReply,
                'url': actionUrl,
                'data': {
                  'first': {
                    'value': '您的咨询已被回复，请点击此处查看详情。',
                    'color': '#173177'
                  },
                  'keyword1': {
                    'value': help,                          // 咨询内容,貌似获取不到。。
                    'color': '#173177'
                  },
                  'keyword2': {
                    'value': answer,                        // 回复内容
                    'color': '#173177'
                  },
                  'keyword3': {
                    'value': req.body.content.fromName,     // 医生姓名
                    'color': '#173177'
                  },

                  'remark': {
                    'value': '感谢您的使用！',
                    'color': '#173177'
                  }
                }
              }
            }
            let params = templatePat
            wechatCtrl.wechatMessageTemplate(params, function (err, results) {
              if (err) {
                return res.status(500).send(err.errmsg)
              } else {
                if (results.messageTemplate.errcode === 0) {
                  return res.json({result: '新建成功', newResults: req.communicationInfo})
                } else {
                  return res.json({result: '新建成功', newResults: req.communicationInfo})
                }
              }
            })
          }
        })
      } else {
        return res.json({result: '新建成功', newResults: req.communicationInfo})
      }
    }
  })

  // if (commmunicationData.receiverRole === 'doctor') {
  //   let counselId = ''
  //   if (req.body.content.contentType === 'custom') {
  //     counselId = commmunicationData.content.content.counselId
  //   }
  //   var templateDoc = {
  //     'userId': req.body.content.targetID,
  //     'role': 'doctor',
  //     'postdata': {
  //       'template_id': config.wxTemplateIdConfig.newCounselToDocOrTeam,
  //       'url': '',                                  // 跳转路径需要添加
  //       'data': {
  //         'first': {
  //           'value': '您的患者有新的提问，请及时处理',
  //           'color': '#173177'
  //         },
  //         'keyword1': {
  //           'value': counselId,                     // 咨询ID,custom以外的聊天记录貌似获取不到。。
  //           'color': '#173177'
  //         },
  //         'keyword2': {
  //           'value': req.body.content.fromName,     // 患者信息（姓名，性别，年龄）
  //           'color': '#173177'
  //         },
  //         'keyword3': {
  //           'value': req.body.content.content.text, // 问题描述
  //           'color': '#173177'
  //         },
  //         'keyword4': {
  //           'value': commonFunc.getNowFormatSecond(), // 提交时间
  //           'color': '#173177'
  //         },

  //         'remark': {
  //           'value': '感谢您的使用！',
  //           'color': '#173177'
  //         }
  //       }
  //     }
  //   }
  //   let params = templateDoc
  //   wechatCtrl.wechatMessageTemplate(params, function (err, results) {
  //     if (err) {
  //       console.log(new Date(), 'auto_send_messageTemplate_toDoc_fail_' + commmunicationData.messageNo)
  //     } else {
  //       if (results.messageTemplate.errcode === 0) {
  //         console.log(new Date(), 'auto_send_messageTemplate_toDoc_success_' + commmunicationData.messageNo)
  //       } else {
  //         console.log(new Date(), 'auto_send_messageTemplate_toDoc_fail_' + commmunicationData.messageNo)
  //       }
  //     }
  //   })
  // } else if (commmunicationData.receiverRole === 'patient') {
  //   if (req.body.content.contentType === 'text') {
  //     let help = ''
  //     var templatePat = {
  //       'userId': req.body.content.targetID,
  //       'role': 'patient',
  //       'postdata': {
  //         'template_id': config.wxTemplateIdConfig.docReply,
  //         'url': '',
  //         'data': {
  //           'first': {
  //             'value': '您的咨询已被回复，请点击此处查看详情。',
  //             'color': '#173177'
  //           },
  //           'keyword1': {
  //             'value': help,                          // 咨询内容,貌似获取不到。。
  //             'color': '#173177'
  //           },
  //           'keyword2': {
  //             'value': req.body.content.content.text, // 回复内容
  //             'color': '#173177'
  //           },
  //           'keyword3': {
  //             'value': req.body.content.fromName,     // 医生姓名
  //             'color': '#173177'
  //           },

  //           'remark': {
  //             'value': '感谢您的使用！',
  //             'color': '#173177'
  //           }
  //         }
  //       }
  //     }
  //     let params = templatePat
  //     wechatCtrl.wechatMessageTemplate(params, function (err, results) {
  //       if (err) {
  //         console.log(new Date(), 'auto_send_messageTemplate_toPat_fail_' + commmunicationData.messageNo)
  //       } else {
  //         if (results.messageTemplate.errcode === 0) {
  //           console.log(new Date(), 'auto_send_messageTemplate_toPat_success_' + commmunicationData.messageNo)
  //         } else {
  //           console.log(new Date(), 'auto_send_messageTemplate_toPat_fail_' + commmunicationData.messageNo)
  //         }
  //       }
  //     })
  //   }
  // }
}

// exports.postCommunication = function(req, res) {

//   var commmunicationData = {
//   messageType: req.body.messageType,
//   sendBy: req.body.sendBy,
//   receiver: req.body.receiver,
//   sendDateTime: req.body.content.createTimeInMillis,
//   content: req.body.content
//   };

//   var newCommunication = new Communication(commmunicationData);
//   newCommunication.save(function(err, communicationInfo) {
//   if (err) {
//         return res.status(500).send(err.errmsg);
//       }
//       res.json({result:'新建成功', newResults: communicationInfo});
//   });
// }

// 根据ID及type获取交流记录 2017-04-21 GY
// 注释 输入messageType（1点对点2团队交流），id1，id2（团队交流时为teamId），newsType；输出，相应交流记录
exports.getCommunication = function (req, res) {
  var messageType = Number(req.query.messageType)
  var id1 = req.query.id1
  var id2 = req.query.id2
  var newsType = req.query.newsType || null

  var limit = Number(req.query.limit)
  var skip = Number(req.query.skip)

  var opts = {limit: limit, skip: skip, sort: '-_id'}

  var _Url = ''
  var messageTypeUrl = 'messageType=' + String(messageType)
  var id1Url = 'id1=' + id1
  var id2Url = 'id2=' + id2
  var newsTypeUrl = 'newsType=' + newsType
  var limitUrl = ''
  var skipUrl = ''

  if (limit != null && limit !== undefined) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip != null && skip !== undefined) {
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (messageTypeUrl !== '' || id1Url !== '' || id2Url !== '' || newsTypeUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (messageTypeUrl !== '') {
      _Url = _Url + messageTypeUrl + '&'
    }
    if (id1Url !== '') {
      _Url = _Url + id1Url + '&'
    }
    if (id2Url !== '') {
      _Url = _Url + id2Url + '&'
    }
    if (newsTypeUrl !== '') {
      _Url = _Url + newsTypeUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  var nexturl = webEntry.domain + '/api/v2/communication/getCommunication' + _Url

  if (messageType === 2) {           // 群聊
    var query = {receiver: id2}

    Communication.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (items.length === 0) {
        return res.json({results: '没有更多了!'})
      } else {
        return res.json({results: items, nexturl: nexturl})
      }
    }, opts)
  } else if (messageType === 1) {    // 单聊，获取聊天记录时增加收发方的角色
    // query = {
    //   $or: [
    //     {sendBy: id1, receiver: id2},
    //     {sendBy: id2, receiver: id1}
    //   ]
    // }
    if (newsType !== null) {
      // query = {
      //   $or: [
      //   {sendBy: id1, receiver: id2},
      //   {sendBy: id2, receiver: id1}
      //   ],
      //   $or: [
      //   {'newsType': newsType},
      //   {'content.newsType': newsType}
      //   ]
      // };
      // query['newsType'] = Number(newsType)
      query = {newsType: Number(newsType)}
      if (Number(newsType) === 11) {          // 医-患
        query = {
          $or: [
            {
              sendBy: id1,
              sendByRole: req.query.sendByRole,
              receiver: id2,
              receiverRole: req.query.receiverRole
            },
            {
              sendBy: id2,
              sendByRole: req.query.receiverRole,
              receiver: id1,
              receiverRole: req.query.sendByRole
            }
          ]
        }
      } else if (Number(newsType) === 12) {   // 医-医
        query = {
          $or: [
            {sendBy: id1, receiver: id2, sendByRole: 'doctor', receiverRole: 'doctor'},
            {sendBy: id2, receiver: id1, sendByRole: 'doctor', receiverRole: 'doctor'}
          ]
        }
      }
    }
    // console.log(query)

    Communication.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (items.length === 0) {
        return res.json({results: '没有更多了!'})
      } else {
        return res.json({results: items, nexturl: nexturl})
      }
    }, opts)
  }
}

// 注释 判断是否符合DoctorUserPatient的Id样式
function isID (str) {
  var pat = /^[DUP][0-9]{12}$/
  if (pat.test(str)) return str
  return null
}

// 注释 根据信息内容msg和信息编号MESSAGE_ID返回req.body
function bodyGen (msg, MESSAGE_ID) {
  // type define 4 种
  // 11:医-患
  // 12:医-医
  // 13:医-团队
  // teamId as type:医-会诊
  var msgType = msg.contentType
  var isSingle = msg.targetType === 'single'
  var receiver = msg.targetID
  var teamId = msg.teamId || null
  var sender = isID(msg.fromID) || isID(msg.fromName)
  // var content = {}
  var desc = ''

  var body = {
    userId: receiver,
    sendBy: sender,
    teamId: teamId,
    type: msg.newsType,
    title: '',
    description: '',
    readOrNot: 0,
    url: '',
    userRole: msg.targetRole,
    messageId: MESSAGE_ID // 从post communication/postCommunication response取
  }
  if (body.type === 15) {
    body['caseType'] = Number(body.teamId) || 0
  }
  if (msgType === 'custom') {
    if (msg.content.contentStringMap) {
      msgType = msg.content.contentStringMap.type
            // content=JSON.parse(msg.content.contentStringMap);
    } else {
      msgType = msg.content.type
            // content = msg.content;
    }
        // msgType=content.type;
  }
    // body.description
  switch (msgType) {
    case 'text':desc = msg.content.text; break
    case 'image':desc = '[图片]'; break
    case 'voice':desc = '[语音]'; break
    case 'card':desc = isSingle ? '[咨询消息]' : '[会诊消息]'; break
    case 'contact':desc = '[联系人名片]'; break
    case 'endl':desc = '[咨询结束]'; break
    default:break
  }
    // if(!isSingle) desc=msg.fromName + ':' +desc;
  body.description = desc
    // body.title

  // 点对点沟通 body.title设置内容包含交流双方
  // 团队交流 body.title设置内容为团队编号
  if (isSingle) {
    var twoUser = {}
    twoUser[msg.fromID] = msg.targetName
    twoUser[msg.targetID] = msg.fromName
    body.title = JSON.stringify(twoUser)
  } else body.title = msg.targetName

    // var sendInfo={
    //   userId:msg.fromID,
    //   name:msg.fromName
    // }
  body.url = JSON.stringify(msg)
  return body
}

// 临时方法：给所有的消息记录加上一个newsType的字段，来源于原content.newsType 2017-06-13 GY
exports.addnewsType = function (req, res) {
  var newsType = req.query.newsType
  // var newsType = Number(req.query.newsType);
  var query = {'content.newsType': newsType}
  var upObj = {newsType: newsType}
  var opts = {multi: true}

  Communication.update(query, upObj, function (err, upitems) {
    if (err) {
      console.log(err)
    } else {
      return res.json({results: upitems})
    }
  }, opts)
}

// 临时方法：给所有消息记录加上一个content.time字段，来源于原文档中的sendDateTime 2017-06-21 GY
exports.addcontenttime = function (req, res) {
  var queryall = {}

  Communication.getSome(queryall, function (err, items) {
    if (err) console.log(err)

    var ids = []
    for (var j = 0; j < items.length; j++) {
      ids[j] = items[j]._id
    }
  // return res.json({'count': ids.length, 'result': ids});
    for (let i = 0; i < ids.length; i++) {
      var query = {'_id': ids[i]}
  // console.log(query);
      Communication.getOne(query, function (err, item) {
        if (err) {
          console.log(err)
        } else if (item === null) {
          console.log('item_of_null')
          console.log(i)
        } else if (item.content.createTimeInMillis === undefined) {
          console.log('item_createTimeInMillis_of_undefined')
          console.log(i)
        } else {
          var queryup = {'_id': ids[i]}
          var upObj = {'content.time': item.content.createTimeInMillis}
          Communication.updateOne(queryup, upObj, function (err, upCM) {
            if (err) {
              console.log(err)
            } else {
              console.log('updateSuccess')
              console.log(upCM._id)
  // console.log(upCM.content.time);
              console.log(i)
            }
          }, {new: true})
        }
      })
    }
  })
}
// 临时方法：确认content.time字段是否都加上了 2017-06-21 GY
exports.timeconfirmation = function (req, res) {
  var query = {}
  var flag = 0
  Communication.getSome(query, function (err, items) {
    if (err) {
      console.log(err)
    }
    for (let i = 0; i < items.length; i++) {
      if (!(items[i].content.time)) {
        console.log(i)
        console.log(items[i]._id)
      }
      flag = i
      console.log(flag)
    }
    console.log(items.length)
    if (flag === items.length - 1) {
      return res.json({'result': 'finish'})
    }
  })
}

// 患者群体教育 向患者群发 2017-07-26 GY
// 查询所有目标的userId
exports.getMassTargets = function (req, res, next) {
  let content = req.body.content || null
  if (content === null) {
    return res.status(412).json({results: '群发内容不能为空'})
  }
  // else if (!(content.createTimeInMillis && content.newsType)) {
  //   return res.status(412).json({results: '不合规则的content'})
  // }
  let target = req.body.target || null
  if (target === null) {
    return res.status(412).json({results: '群发目标不能为空'})
  }
  let query = {doctorId: req.session._id}
  let opts = {}
  let fields = {}
  let populate = {path: 'patients.patientId patientsInCharge.patientId', select: {_id: 0, userId: 1, name: 1}}
  DpRelation.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '暂无关注或主管的患者'})
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
        return res.status(404).json({results: '无有效群发目标'})
      } else {
        req.massTarget = targets
        // console.log(targets)
        next()
      }
    }
  }, opts, fields, populate)
}
// 构建并写入communication, news表数据
// 突然就变成系统消息了，所以改成写入message表
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

  let doctorname = req.session.name
  let title = '医生 ' + doctorname + ' 给您发来一条消息'
  let description = '您的关注/主管医生 ' + doctorname + ' 给您发来一条群体教育消息：' + content

  for (let i = 0; i < req.massTarget.length; i++) {
    let massId = 'MAM' + req.session.userId + y + add0(m) + add0(d) + add0(h) + add0(mm) + add00(s) + add00(i)

    // content[i] = JSON.parse(JSON.stringify(req.body.content))
    // content[i].targetID = req.massTarget[i].userId
    // content[i].targetName = req.massTarget[i].name
    // content[i].fromID = req.session.userId

    let communicationData = {
      messageId: massId,
      userId: req.massTarget[i].userId,
      sendBy: req.session.userId,
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
  // let msgType = communicationDatas[0].content.content.contentType
  // let desc = ''
  // switch(msgType){
  //       case 'text':desc = communicationDatas[0].content.content.text;break;
  //       case 'image':desc='[图片]';break;
  //       case 'voice':desc='[语音]';break;
  //       // case 'card':desc = isSingle?'[咨询消息]':'[会诊消息]';break;
  //       // case 'contact':desc='[联系人名片]';break;
  //       // case 'endl':desc='[咨询结束]';break;
  //       default:break;
  //   }

  for (let i = 0; i < req.massTarget.length; i++) {
    uparr[i] = {
      updateOne: {
        filter: {
          userId: req.massTarget[i].userId,
          userRole: 'patient',
          sendBy: req.session.userId,
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
      return res.status(500).send(err)
    }
    News.bulkWrite(uparr, function (err, newsInfo) {
      if (err) {
        return res.status(500).send(err)
      }
      // return res.json ({result: newsInfo})
      // return res.json({results: '群发成功', content: cmuInfos[0].description})
      return res.json({results: '群发成功', title: cmuInfos[0].title, description: cmuInfos[0].description})
    })
  })
}
