var Counsel = require('../models/counsel')
var Alluser = require('../models/alluser')
var Team = require('../models/team')
var Consultation = require('../models/consultation')
var Communication = require('../models/communication')
var request = require('request')
var webEntry = require('../settings').webEntry

// 获取token的对象 2017-07-15 GY
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    }
    if (user === null) {
      return res.status(404).json({results: '找不到对象'})
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
// 获取患者ID对象 2017-07-15 GY
exports.getPatientObject = function (req, res, next) {
  let patientId = req.body.patientId || req.query.patientId || null
  if (patientId === null) {
    return res.status(412).json({results: '请填写patientId'})
  } else {
    req.patientId = patientId
  }
  let query = {userId: patientId, role: 'patient'}
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      return res.status(500).send(err)
    }
    if (patient === null) {
      return res.status(404).json({results: '不存在的患者ID'})
    } else {
      req.body.patientObject = patient
      next()
    }
  })
}
// 获取医生ID对象，并添加自动转发标记 2017-07-15 GY
exports.getDoctorObject = function (req, res, next) {
  let doctorId = req.body.doctorId || req.query.doctorId || null
  if (doctorId === null) {
    return res.status(412).json({results: '请填写doctorId'})
  } else {
    req.doctorId = doctorId
  }
  let query = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctor === null) {
      return res.status(404).json({results: '不存在的医生ID'})
    } else {
      if (doctor.autoRelay === 1) {
        req.body.autoRelayFlag = 1
        req.body.relayTarget = doctor.relayTarget
      }
      req.body.doctorObject = doctor
      next()
    }
  })
}

// 提交咨询问卷 2017-04-05 GY
// 增加选填字段 2017-04-13 GY
exports.saveQuestionaire = function (req, res, next) {
  let type = req.body.type || null
  if (type === null) {
    return res.json({result: '请填写type,咨询=1,问诊=2'})
  }

  var counselData = {
    counselId: req.newId, 
    patientId: req.session._id, 
    doctorId: req.body.doctorObject._id, 
    type: type,
    time: new Date(),
    status: 1,
		// topic: req.body.topic,
		// content: req.body.content,
		// title: req.body.title,
    sickTime: req.body.sickTime,
		// visited: req.body.visited,
    symptom: req.body.symptom,
    symptomPhotoUrl: req.body.symptomPhotoUrl,
		// description: req.body.description,
		// drugs: req.body.drugs,
		// history: req.body.history,
    help: req.body.help//, 
		// comment: req.body.comment,

		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:"gy",
		// 	userName:"gy",
		// 	terminalIP:"10.12.43.32"
		// }
  }
  if (req.body.hospital != null && req.body.hospital != '') {
    counselData['hospital'] = req.body.hospital
  }
  if (req.body.visitDate != null && req.body.visitDate != '') {
    counselData['visitDate'] = new Date(req.body.visitDate)
  }
  if (req.body.diagnosis != null && req.body.diagnosis != '') {
    counselData['diagnosis'] = req.body.diagnosis
  }
  if (req.body.diagnosisPhotoUrl != null && req.body.diagnosisPhotoUrl != '') {
    counselData['diagnosisPhotoUrl'] = req.body.diagnosisPhotoUrl
  }

  var newCounsel = new Counsel(counselData)
  newCounsel.save(function (err, counselInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // 自动转发相关 2017-07-15 GY
    if (req.body.autoRelayFlag) {
      req.body.counselInfo = counselInfo
      next()
    } else {
      res.json({result: '新建成功', results: counselInfo})
    }
  })
}

// 实现自动转发 暂未实现socket功能 2017-07-15 GY
exports.counselAutoRelay = function (req, res) {
  function add00(m) {
    return m < 10 ? '00'+m : (m < 100 ? '0'+m : m)
  }
  function add0(m) {
    return m < 10 ? '0'+m : m
  }
  function relayOne(index) {
    let now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth() + 1
    let d = now.getDate()
    let h = now.getHours()
    let mm = now.getMinutes()
    let s = now.getMilliseconds()
    let consultationId = 'G' + add0(m) + add0(d) + add0(h) + add0(mm) + add00(s)
    let messageNo = 'CMUA' + y + add0(m) + add0(d) + add0(h) + add0(mm) + add00(s) + index
    let queryteam = {teamId: teamIds[index].teamId}

    Team.getOne(queryteam, function (err, teamitem) {
      if (err) {
        teamErrFlag = 1
        console.log(err)
      }
      teamitem = teamitem || null
      if (teamitem === null) {
        teamEmptyFlag[index] = 1
        if (index < teamIds.length - 1) {
          relayOne(++index)
        } else {
          if (teamErrFlag || consultationErrFlag || communicationErrFlag || newsErrFlag) {
            return res.status(206).json({
              results: '新建成功', 
              results: req.body.counselInfo, 
              message: '医生设置了自动转发但在发消息时出现错误'
            })
          } else if (teamEmptyFlag.length !== 0) {
            let emptyTeams = []
            for (let i = 0; i < teamIds.length; i++) {
              if (teamEmptyFlag[i]) emptyTeams.push(teamIds[i])
            }
            return res.status(206).json({
              results: '新建成功', 
              results: req.body.counselInfo, 
              message: '医生设置了自动转发但部分转发目标不存在', 
              messageDetail: emptyTeams
            })
          } else {
            return res.json({result: '新建成功', results: req.body.counselInfo})
          }
        }
      } else {
        let consultationData = {
          consultationId: consultationId,
          sponsorId: req.body.doctorObject._id,
          patientId: req.session._id,
          diseaseInfo: req.body.counselInfo._id,
          teamId: teamitem._id,
          time: now,
          status:1
        }
        let newConsultation = new Consultation(consultationData)
        newConsultation.save(function (err, consultationInfo) {
          if (err) {
            consultationErrFlag = 1
          }
          // 生成咨询时，医生与患者页面的卡片消息模板
          let msgContent = {
            counsel: req.body.counselInfo, 
            type: 'card', 
            counselId: req.body.counselInfo.counselId, 
            patientId: req.session.userId, 
            patientName: req.body.patientObject.name, 
            doctorId: req.body.doctorObject.userId, 
            fromId: req.session.userId, 
            targetId: req.body.doctorObject.userId
          }
          // 转发时需要生成的卡片消息模板
          msgContent.consultationId = consultationData.consultationId
          msgContent.targetId = teamitem.teamId
          msgContent.fromId = req.body.doctorObject.userId
          let msgJson = {
            clientType: 'doctor', 
            contentType: 'custom', 
            fromID: req.body.doctorObject.userId, 
            fromName: req.body.doctorObject.name, 
            targetID: teamitem.teamId, 
            teamId: teamitem.teamId, 
            targetName: teamitem.name, 
            targetType: 'group', 
            status: 'send_going', 
            newsType: '13', 
            targetRole: 'doctor', 
            createTimeInMillis: Date.now(), 
            content: msgContent
          }
          let communicationData = {
            messageNo: messageNo, 
            messageType: 2, 
            sendBy: req.body.doctorObject.userId, 
            receiver: teamitem.teamId, 
            sendDateTime: msgJson.createTimeInMillis, 
            content: msgJson, 
            newsType: msgJson.newsType
          }
          let newCommunication = new Communication(communicationData)
          newCommunication.save(function (err, communicationInfo) {
            if (err) {
              communicationErrFlag = 1
            }
            let newsData = {
              messageId: communicationData.messageNo, 
              userId: communicationData.receiver, 
              userRole: 'doctor', 
              sendBy: req.body.doctorObject.userId, 
              readOrNot: 0, 
              type: '13', 
              time: now, 
              title: teamitem.name, 
              description: '[会诊消息]', 
              url: JSON.stringify(msgJson)
            }
            // 需要插入news表卧槽好多我先调已经存在的接口好了
            request({
              url: 'http://' + webEntry.domain + ':' + webEntry.restPort + '/api/v1/new/teamNews' + '?token=' + req.query.token || req.body.token, 
              method: 'POST', 
              body: newsData, 
              json: true
            }, function (err, response) {
              if (err) {
                newsErrFlag = 1
              }
              if (index < teamIds.length - 1) {
                relayOne(++index)
              } else {
                if (teamErrFlag || consultationErrFlag || communicationErrFlag || newsErrFlag) {
                  return res.status(206).json({
                    results: '新建成功', 
                    results: req.body.counselInfo, 
                    message: '医生设置了自动转发但在发消息时出现错误'
                  })
                } else if (teamEmptyFlag.length !== 0) {
                  let emptyTeams = []
                  for (let i = 0; i < teamIds.length; i++) {
                    if (teamEmptyFlag[i]) emptyTeams.push(teamIds[i])
                  }
                  return res.status(206).json({
                    results: '新建成功', 
                    results: req.body.counselInfo, 
                    message: '医生设置了自动转发但部分转发目标不存在', 
                    messageDetail: emptyTeams
                  })
                } else {
                  return res.json({result: '新建成功', results: req.body.counselInfo})
                }
              }
            })
          })
        })
      }
    })

    
  }

  let teamIds = req.body.relayTarget
  // err标记
  let teamErrFlag = 0
  let consultationErrFlag = 0
  let communicationErrFlag = 0
  let newsErrFlag = 0
  // team空标记
  let teamEmptyFlag = []
  // 

  if (teamIds.length === 0) {
    return res.status(206).json({
      result: '新建成功', 
      results: req.body.counselInfo, 
      message: '医生设置了自动转发但没有设置转发目标'
    })
  }
  relayOne(0)
}
