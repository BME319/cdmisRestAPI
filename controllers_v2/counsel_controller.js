// 代码 2017-03-28 GY
// 功能 getDoctorObject-getCounsels获取咨询问诊信息 getPatientObject,getDoctorObject,getNoMid.getNo(2),saveQuestionaire,counselAutoRelay问卷
// 注释 2017-07-14 YQC

// var config = require('../config')
var Counsel = require('../models/counsel')
// var Doctor = require('../models/doctor')
var Alluser = require('../models/alluser')
var Comment = require('../models/comment')
// var Patient = require('../models/patient')
var Consultation = require('../models/consultation')
var Team = require('../models/team')
var Communication = require('../models/communication')
var webEntry = require('../settings').webEntry
var request = require('request')

// 获取医生ID对象，并添加自动转发标记 2017-07-15 GY
// 注释 输入，doctorId；输出，相应的doctorObject
exports.getDoctorObject = function (req, res, next) {
  let doctorId = req.body.doctorId || req.query.doctorId || null
  if (doctorId === null) {
    return res.status(412).json({results: '请填写doctorId'})
  } else {
    req.doctorId = doctorId
  }
  let query = {userId: doctorId, role: 'doctor'}
  // console.log(query)
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
      // console.log(req.body)
      next()
    }
  })
}

// 根据状态、类型获取咨询问诊信息，暂未实现计数
// 注释 输入，status，type，name，skip，limit，承接doctorObject；输出，问诊信息
exports.getCounsels = function (req, res) {
  // 查询条件
  console.log(req.body.doctorObject)
  let _doctorId = req.body.doctorObject._id || null
  let _status = req.query.status || null
  let _type = req.query.type || null
  let _name = req.query.name || null
  let _skip = req.query.skip || null
  let _limit = req.query.limit || null
  let query = {doctorId: _doctorId}

  if (_skip === null) {
    _skip = 0
  }
  // type和status可以为空
  if (_status != null) {
    query['_status'] = _status
  }
  if (_type != null) {
    query['_type'] = _type
  }
  // if(_name!=""&&_name!=undefined){
  //   query["patientId.name"]=_name;
  // }
  let opts = ''
  let fields = {'_id': 0, 'messages': 0, 'revisionInfo': 0}
  // 关联主表patient获取患者信息
  let populate = {path: 'patientId', select: {'_id': 0, 'revisionInfo': 0, 'doctors': 0}}
  // if(_name!=""&&_name!=undefined){
  //   populate["match"]={"name":_name};
  // }
  // 模糊搜索
  let nameReg = new RegExp(_name)
  if (_name) {
    populate['match'] = {'name': nameReg}
  }
  // console.log(populate)
  Counsel.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    let item1 = []
    for (let i = 0; i < item.length; i++) {
      if (item[i].patientId != null) {
        if (_skip > 0) {
          _skip--
        } else {
          if (_limit === '' || _limit === undefined) {
            item1.push(item[i])
          } else {
            if (_limit > 0) {
              item1.push(item[i])
              _limit--
            }
          }
        }
      }
    }
    res.json({results: item1, count: item1.length})
  }, opts, fields, populate)
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

// 提交咨询问卷 2017-04-05 GY
// 增加选填字段 2017-04-13 GY
// 注释 输入，type，sickTime，symptom/photo,help,选填hospital,visitDate,diagnosis/photo；输出，保存问卷
exports.saveQuestionaire = function (req, res, next) {
  let type = req.body.type || null
  if (type === null) {
    return res.json({result: '请填写type,咨询=1,问诊=2,加急咨询=6'})
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
    help: req.body.help // ,
    // comment: req.body.comment,

    // revisionInfo:{
    //   operationTime:new Date(),
    //   userId:"gy",
    //   userName:"gy",
    //   terminalIP:"10.12.43.32"
    // }
  }
  let hospital = req.body.hospital || null
  let visitDate = req.body.visitDate || null
  let diagnosis = req.body.diagnosis || null
  let diagnosisPhotoUrl = req.body.diagnosisPhotoUrl || null
  if (hospital !== null) {
    counselData['hospital'] = hospital
  }
  if (visitDate !== null) {
    counselData['visitDate'] = new Date(visitDate)
  }
  if (diagnosis !== null) {
    counselData['diagnosis'] = diagnosis
  }
  if (diagnosisPhotoUrl !== null) {
    counselData['diagnosisPhotoUrl'] = diagnosisPhotoUrl
  }

  var newCounsel = new Counsel(counselData)
  newCounsel.save(function (err, counselInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      req.body.counselInfo = counselInfo
      req.body.patientId = req.session.userId
      req.body.conselObject = counselInfo._id
      next()
    }
    // 自动转发相关 2017-07-15 GY
    // if (req.body.autoRelayFlag) {
    //   req.body.counselInfo = counselInfo
    //   next()
    // } else {
    //   res.json({result: '新建成功', results: counselInfo})
    // }
  })
}

// 实现自动转发 暂未实现socket功能 2017-07-15 GY
exports.counselAutoRelay = function (req, res, next) {
  // 未设置自动转发，进入下一步
  if (!req.body.autoRelayFlag) {
    console.log('no_auto_relay')
    // return res.send('test_success')
    return next()
  }

  function add00 (m) {
    return m < 10 ? '00' + m : (m < 100 ? '0' + m : m)
  }
  function add0 (m) {
    return m < 10 ? '0' + m : m
  }
  function relayOne (index) {
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
            // return res.status(206).json({
            //   result: '新建成功',
            //   results: req.body.counselInfo,
            //   message: '医生设置了自动转发但在发消息时出现错误'
            // })
            console.log({
              time: new Date(),
              doctorId: req.body.doctorId,
              warning: '医生设置了自动转发但在发消息时出现错误'
            })
            next()
          } else if (teamEmptyFlag.length !== 0) {
            let emptyTeams = []
            for (let i = 0; i < teamIds.length; i++) {
              if (teamEmptyFlag[i]) emptyTeams.push(teamIds[i])
            }
            // return res.status(206).json({
            //   result: '新建成功',
            //   results: req.body.counselInfo,
            //   message: '医生设置了自动转发但部分转发目标不存在',
            //   messageDetail: emptyTeams
            // })
            console.log({
              time: new Date(),
              doctorId: req.body.doctorId,
              warning: '医生设置了自动转发但部分转发目标不存在',
              warningDetail: emptyTeams
            })
            next()
          } else {
            // return res.json({result: '新建成功', results: req.body.counselInfo})
            next()
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
          status: 1
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
              url: 'http://' + webEntry.domain + ':' + webEntry.restPort + '/api/v2/new/teamNews' + '?token=' + req.query.token || req.body.token,
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
                  // return res.status(206).json({
                  //   result: '新建成功',
                  //   results: req.body.counselInfo,
                  //   message: '医生设置了自动转发但在发消息时出现错误'
                  // })
                  console.log({
                    time: new Date(),
                    doctorId: req.body.doctorId,
                    warning: '医生设置了自动转发但在转发消息时出现错误'
                  })
                  next()
                } else if (teamEmptyFlag.length !== 0) {
                  let emptyTeams = []
                  for (let i = 0; i < teamIds.length; i++) {
                    if (teamEmptyFlag[i]) emptyTeams.push(teamIds[i])
                  }
                  // return res.status(206).json({
                  //   result: '新建成功',
                  //   results: req.body.counselInfo,
                  //   message: '医生设置了自动转发但部分转发目标不存在',
                  //   messageDetail: emptyTeams
                  // })
                  console.log({
                    time: new Date(),
                    doctorId: req.body.doctorId,
                    warning: '医生设置了自动转发但部分转发目标不存在',
                    warningDetail: emptyTeams
                  })
                  next()
                } else {
                  // return res.json({result: '新建成功', results: req.body.counselInfo})
                  next()
                }
              }
            })
          })
        })
      }
    })
  }

  let teamIds = req.body.relayTarget || []
  // err标记
  let teamErrFlag = 0
  let consultationErrFlag = 0
  let communicationErrFlag = 0
  let newsErrFlag = 0
  // team空标记
  let teamEmptyFlag = []
  //

  if (teamIds.length === 0) {
    // return res.status(206).json({
    //   result: '新建成功',
    //   results: req.body.counselInfo,
    //   message: '医生设置了自动转发但没有设置转发目标'
    // })
    console.log({
      time: new Date(),
      doctorId: req.body.doctorId,
      warning: '医生设置了自动转发但没有设置转发目标'
    })
    // return res.send('test_success')
    return next()
  } else {
    relayOne(0)
  }
}

// 注释 更改咨询状态
// 输入，counselId，status；输出，咨询状态更新
exports.changeCounselStatus = function (req, res, next) {
  var counselId = req.body.counselId || null
  if (counselId === null) {
    return res.json({result: '请填写counselId!'})
  }
  var query = {
    counselId: counselId
  }

  var upObj = {
  // revisionInfo:{
  //   operationTime:new Date(),
  //   userId:'',
  //   userName:'',
  //   terminalIP:''
  // }
  }
  if (req.body.status != null) {
    upObj['status'] = req.body.status
    upObj['endTime'] = new Date()
  }

  // return res.json({query: query, upObj: upObj});

  Counsel.updateOne(query, upObj, function (err, upCounsel) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upCounsel == null) {
      return res.json({result: '修改失败，不存在的counselId！'})
    } else {
      // req.counsel_id = upCounsel._id
      // req.status = upCounsel.status
      // console.log(req.counsel_id, req.status)
      req.editResults = upCounsel
      next()
    }
  }, {new: true})
}

// 注释 更改会诊状态，承接editResults；输出，更改结果
exports.changeConsultationStatus = function (req, res) {
  var query = {diseaseInfo: req.editResults._id}
  var upObj = {status: req.editResults.status}
  var opts = {multi: true}

  Consultation.update(query, upObj, function (err, upitems) {
    if (err) {
      res.status(500).send(err.errmsg)
    } else if (upitems.ok === 0) {
      return res.status(500).send('数据库连接失败')
    } else {
      return res.json({result: '修改成功', editResults: req.editResults})
    }
  }, opts)
}

// 根据医生患者获取咨询问诊状态
// 注释 承接patientObject，doctorObject；输入，status，type，changetype；输出，最新的问诊状态或跳入changeCounselType函数
exports.getStatus = function (req, res, next) {
  // if (req.query.type == null || req.query.type == '') {
  //   if (req.body.type == null || req.body.type == '') {
  //   return res.json({result: '请填写type!'});
  //   }
  //   else {
  //   req.type = req.body.type;
  //   }
  // }
  // else {
  //   req.type = req.query.type;
  // }
  let status = req.body.status || req.query.status || null
  let statusInBody = req.body.status || null
  let changeType = req.body.changeType || null
  let type = req.query.type || req.body.type || null
  if (changeType !== null) {
    if (status === null) {
      return res.json({result: '请填写status!'})
    } else {
      status = parseInt(status, 10)
    }
  }

  var query = {
    patientId: req.body.patientObject._id,
    doctorId: req.body.doctorObject._id
  // type:req.type
  }
  if (type !== null) {
    query['type'] = type
  }

  // 设置排序规则函数，时间降序
  function sortTime (a, b) {
    return b.time - a.time
  }

  var opts = ''
  var fields = {'_id': 0, 'messages': 0, 'revisionInfo': 0}
  var populate = {path: 'patientId doctorId', select: {'_id': 0, 'userId': 1, 'name': 1}}

  Counsel.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (items.length === 0) {
      return res.json({result: '请填写咨询问卷!'})
    } else {
      var counsels = []
      counsels = items.sort(sortTime)
      req.body.counselId = counsels[0].counselId
      if (statusInBody === null && changeType === null) {
        return res.json({result: counsels[0]})
      } else {
        next()
      }
    }
      // res.json({});
  }, opts, fields, populate)
}

// 注释 更改问诊类型 输入，type，changetype，counselId；输出，更新成功或失败
exports.changeCounselType = function (req, res) {
  // 若类型为1 更改类型标识为True 写入查询和更新参数 否则返回错误
  let query = {}
  let upObj = {}
  if (req.body.type === 1 && req.body.changeType === 'type3') {
    // type3 咨询转问诊
    query = {
      counselId: req.body.counselId
    }
    upObj = {
      type: 3
    }
  } else if (req.body.type === 1 && req.body.changeType === 'type7') {
    // type7 咨询转加急咨询
    query = {
      counselId: req.body.counselId
    }
    upObj = {
      type: 7
    }
  } else {
    return res.json({result: '不可更改的类型!'})
  }
  // return res.json({query: query, upObj: upObj});

  Counsel.updateOne(query, upObj, function (err, upCounsel) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upCounsel == null) {
      return res.json({result: '修改失败，不存在的counselId！'})
    }
    res.json({result: '修改成功', editResults: upCounsel})
  }, {new: true})
}

// 注释 提交评价分数 承接patientObject，doctorObject；输入totalScore，content，counselId；输出，存储新建问诊评价，更新问诊评价信息
exports.insertCommentScore = function (req, res) {
  var commentData = {
    commentId: req.newId,   // counselpost01
    patientId: req.body.patientObject._id,   // p01
    doctorId: req.body.doctorObject._id,   // doc01
    time: new Date(),
    totalScore: req.body.totalScore,
    content: req.body.content,
    counselId: req.body.counselId
  }

  var newComment = new Comment(commentData)
  newComment.save(function (err, commentInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    var query = {counselId: req.body.counselId}
    var upObj = {comment: req.newId}

    Counsel.updateOne(query, upObj, function (err, upCounsel) {
      if (err) {
        return res.status(422).send(err.message)
      }
      if (upCounsel == null) {
        return res.json({result: '修改失败，不存在的counselId！'})
      }
      res.json({result: '成功', commentresults: commentInfo, CounselResults: upCounsel})
    }, {new: true})
  })
}
