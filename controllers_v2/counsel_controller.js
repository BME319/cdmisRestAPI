// 代码 2017-03-28 GY
// 功能 getDoctorObject-getCounsels获取咨询问诊信息 getPatientObject,getDoctorObject,getNoMid.getNo(2),saveQuestionaire,counselAutoRelay问卷
// 注释 2017-07-14 YQC

var Counsel = require('../models/counsel')
// var Doctor = require('../models/doctor')
var Alluser = require('../models/alluser')
var Comment = require('../models/comment')
// var Patient = require('../models/patient')
var Consultation = require('../models/consultation')
var Team = require('../models/team')
var Communication = require('../models/communication')
var Counselautochangestatus = require('../models/counselautochangestatus')
var webEntry = require('../settings').webEntry
var request = require('request')
var commonFunc = require('../middlewares/commonFunc')
var config = require('../config')

var wechatCtrl = require('../controllers_v2/wechat_controller')

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
  // console.log(req.body.doctorObject)
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
    query['status'] = Number(_status)
  }
  if (_type != null) {
    query['type'] = Number(_type)
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
      // photo_url拼接 GY 2017-10-27
      if (item[i].symptomPhotoUrl.constructor === Array) {
        if (item[i].symptomPhotoUrl.length) {
          for (let j = 0; j < item[i].symptomPhotoUrl.length; j++) {
            if (typeof(item[i].symptomPhotoUrl[j]) === 'string') {
              let re = item[i].symptomPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
              // console.log(re)
              if (re) {
                item[i].symptomPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
              }
            }
          }
        }
      }
      if (item[i].diagnosisPhotoUrl.constructor === Array) {
        if (item[i].diagnosisPhotoUrl.length) {
          for (let j = 0; j < item[i].diagnosisPhotoUrl.length; j++) {
            if (typeof(item[i].diagnosisPhotoUrl[j]) === 'string') {
              let re = item[i].diagnosisPhotoUrl[j].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
              // console.log(re)
              if (re) {
                item[i].diagnosisPhotoUrl[j] = 'https://' + webEntry.photo_domain + re[0]
              }
            }
          }
        }
      }

      if (item[i].patientId != null) {
        if (_skip > 0) {
          _skip--
        } else {
          if (!_limit) {
            item1.push(item[i])
          } else {
            if (_limit) {
              item1.push(item[i])
              _limit--
            }
          }
        }
      }
    }
    for (var i = item1.length - 1; i >= 0; i--) {
      item1[i].patientId.photoUrl = commonFunc.adaptPrefix(item1[i].patientId.photoUrl)
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

  // photo_url拆分 gy 2017-10-27
  let symptomPhotoUrl = []
  if (req.body.symptomPhotoUrl) {
    if (req.body.symptomPhotoUrl.constructor === Array) {
      symptomPhotoUrl = req.body.symptomPhotoUrl
    }
    if (symptomPhotoUrl.length) {
      for (let i = 0; i < symptomPhotoUrl.length; i++) {
        if (typeof(symptomPhotoUrl[i]) === 'string') {
          let re = symptomPhotoUrl[i].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
          // console.log(re)
          if (re) {
            symptomPhotoUrl[i] = re[0]
          }
        }
      }
    }
  }
  // console.log(symptomPhotoUrl)
  let diagnosisPhotoUrl = []
  if (req.body.diagnosisPhotoUrl) {
    if (req.body.diagnosisPhotoUrl.constructor === Array) {
      diagnosisPhotoUrl = req.body.diagnosisPhotoUrl
    }
    if (diagnosisPhotoUrl.length) {
      for (let i = 0; i < diagnosisPhotoUrl.length; i++) {
        if (typeof(diagnosisPhotoUrl[i]) === 'string') {
          let re = diagnosisPhotoUrl[i].match(/\/uploads(\S*)(jpg|png|jpeg|gif|bmp|raw|webp)/)
          // console.log(re)
          if (re) {
            diagnosisPhotoUrl[i] = re[0]
          }
        }
      }
    }
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
    symptomPhotoUrl: symptomPhotoUrl,
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
  // let diagnosisPhotoUrl = req.body.diagnosisPhotoUrl || null
  if (hospital !== null) {
    counselData['hospital'] = hospital
  }
  if (visitDate !== null) {
    counselData['visitDate'] = new Date(visitDate)
  }
  if (diagnosis !== null) {
    counselData['diagnosis'] = diagnosis
  }
  if (diagnosisPhotoUrl) {
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
        console.log(new Date(), 'teamErr', err)
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
            console.log(new Date(), 'consultationErr', err)
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
              console.log(new Date(), 'communicationErr', err)
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
              url: 'http://' + webEntry.domain + '/api/v2/new/teamNewstemp',
              method: 'POST',
              body: newsData,
              json: true
            }, function (err, response) {
              if (err) {
                newsErrFlag = 1
                console.log(new Date(), 'newsErr', err)
              }
              request({
                      // url: 'http://' + webEntry.domain + ':4060/api/v1/communication/getTeam?teamId=' + data.msg.teamId + '?token=' + req.query.token || req.body.token,
                url: 'http://' + webEntry.domain + '/api/v2/communication/teamtemp?teamId=' + teamitem.teamId,
                method: 'GET',
                json: true
              }, function (err, response) {
                if (err) {
                          // do-something
                          // console.log(err.errmsg);
                } else {
                  // console.log(response.body)
                  if (!response.body.results) {
                    // console.log('noperson')
                  } else {
                    var sponsorId = response.body.results.sponsorId
                    var members = response.body.results.members
                    members.push({'userId': sponsorId})
                    // console.log(members)
                    // console.log(members.length)

                    for (var idx in members) {
                     // var online = false
                      // console.log(members[idx])
                      // custom card 群发
                      // if (data.msg.contentType === 'custom' && data.msg.content.type === 'card' || (data.msg.contentType === 'text' || data.msg.contentType === 'image' || data.msg.contentType === 'voice')) {
                      var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=https://media.haihonghospitalmanagement.com/proxy&response_type=code&scope=snsapi_userinfo&state=doctor_13_1_' + data.msg.content.consultationId + '_' + data.msg.teamId + '&#wechat_redirect'
                      var help
                      var time
                      if (msgContent !== null) {
                        var counsel = msgContent.counsel || null
                        if (counsel !== null) {
                          help = counsel.help
                          time = counsel.time || new Date()
                        }
                      }
                      let y = time.getFullYear()
                      let m = time.getMonth() + 1
                      let d = time.getDate()
                      let h = time.getHours()
                      let mm = time.getMinutes()
                      let s = time.getSeconds()
                      let formatSecond = y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s)
                      var template = {
                        'userId': members[idx].userId,          // data.msg.content.doctorId, //医生的UID
                        'role': 'doctor',
                        'postdata': {
                          'template_id': config.wxTemplateIdConfig.newCounselToDocOrTeam, // 'cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k',
                          'url': actionUrl,
                          'data': {
                            'first': {
                              'value': '您的团队有一个新的咨询（问诊）消息，请及时处理',
                              'color': '#173177'
                            },
                            'keyword1': {
                              'value': msgContent.counselId, // 咨询ID
                              'color': '#173177'
                            },
                            'keyword2': {
                              'value': msgContent.patientName, // 患者信息（姓名，性别，年龄）
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
                      // console.log(idx)

                                      // groupSend(data);
                      request({
                                          // url: 'http://'+ webEntry.domain +':4060/api/v1/wechat/messageTemplate' + '?token=' + req.query.token || req.body.token,
                        url: 'http://' + webEntry.domain + '/api/v2/wechat/messageTemplate',
                        method: 'POST',
                        body: template,
                        json: true

                      }, function (err, response, body) {
                                          // console.log(idx + 'done')
                        // console.log(body)

                                          // if (!err && response.statusCode == 200) {
                                          //     res.json({results:body});
                                          // }
                                          // else{
                                          //     return res.status(500).send('Error');
                                          // }
                      })

                                    // others: no process
                      // }
                    }
                  }
                }
              })
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
  if (req.body.status === 0) {
    statusInBody = 1
  }
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
  var fields = {'messages': 0, 'revisionInfo': 0}
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
      req.body.conselObject = counsels[0]._id
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
exports.changeCounselType = function (req, res, next) {
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
    req.body.newtype = 3
  } else if (req.body.type === 1 && req.body.changeType === 'type7') {
    // type7 咨询转加急咨询
    query = {
      counselId: req.body.counselId
    }
    upObj = {
      type: 7
    }
    req.body.newtype = 7
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
    // res.json({result: '修改成功', editResults: upCounsel})
    next()
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

// 给患者和医生推送咨询或问诊超时自动结束的微信模板消息 2017-09-07 lgf
exports.counselAutoEndMsg = function () {
  let currentTime = new Date()
  let timeTmp = new Date(currentTime.getTime() - 24 * 3600 * 1000)
  let startTime = new Date(timeTmp.getFullYear(), timeTmp.getMonth(), timeTmp.getDate(), '08', '00', '00')
  let endTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), '08', '00', '00')
  // console.log('startTime', startTime)
  // console.log('endTime', endTime)
  let query = {
    'endTime': {$gte: startTime, $lt: endTime} // >= <
  }
  var fields = {}
  var opts = {}
  var populate = [{'path': 'doctorId', 'select': {'userId': 1, 'openId': 1, 'name': 1}}, {'path': 'patientId', 'select': {'userId': 1, 'openId': 1, 'name': 1}}]
  Counselautochangestatus.getSome(query, function (err, timeoutCounsels) {
    if (err) {
      console.log(err.message)
    }
    if (timeoutCounsels.length === 0) {
      console.log('昨日不存在超时咨询或问诊的记录！')
    } else {
      // console.log(timeoutCounsels[0])
      // console.log(timeoutCounsels.length)
      for (let i = 0; i < 1; i++) {
        // let doctorOpenId = timeoutCounsels[i].doctorId.openId
        // let patientOpenId = timeoutCounsels[i].patientId.openId
        let valueTmp1 = '您好，患者咨询已结束。'
        if (timeoutCounsels[i].type === 6 || timeoutCounsels[i].type === 7) {
          valueTmp1 = '您好，患者加急咨询已结束。'
        }
        let endReason = '24小时未处理'
        if (timeoutCounsels[i].type === 6 || timeoutCounsels[i].type === 7) {
          endReason = '2小时未处理'
        }
        var templateDoc = {
          'userId': timeoutCounsels[i].doctorId.userId,
          'role': 'doctor',
          'postdata': {
            'template_id': config.wxTemplateIdConfig.counselAutoEndDoc,
            'url': '',                                      // 跳转路径需要添加
            'data': {
              'first': {
                'value': valueTmp1,
                'color': '#173177'
              },
              'keyword1': {
                'value': endReason,                         // 结束原因
                'color': '#173177'
              },
              'keyword2': {
                'value': timeoutCounsels[i].patientId.name, // 患者姓名
                'color': '#173177'
              },
              'keyword3': {
                'value': timeoutCounsels[i].help,           // 咨询内容
                'color': '#173177'
              },
              'keyword4': {
                'value': commonFunc.getNowFormatSecond(),   // 提交时间
                'color': '#173177'
              },

              'remark': {
                'value': '后期咨询请注意及时回复。',
                'color': '#173177'
              }
            }
          }
        }
        let params = templateDoc
        wechatCtrl.wechatMessageTemplate(params, function (err, results) {
          if (err) {
            console.log(new Date(), 'auto_send_messageTemplate_toDoc_fail_' + timeoutCounsels[i].counselId)
          } else {
            if (results.messageTemplate.errcode === 0) {
              console.log(new Date(), 'auto_send_messageTemplate_toDoc_success_' + timeoutCounsels[i].counselId)
            } else {
              console.log(new Date(), 'auto_send_messageTemplate_toDoc_fail_' + timeoutCounsels[i].counselId)
            }
          }
        })
        // request({
        //   url: 'http://' + webEntry.domain + '/api/v2/wechat/messageTemplate',
        //   method: 'POST',
        //   body: templateDoc,
        //   json: true
        // }, function (err, response) {
        //   if (!err && response.statusCode === 200) {
        //     console.log(new Date(), 'auto_send_messageTemplate_success')
        //   } else {
        //     console.log(new Date(), 'auto_send_messageTemplate_fail')
        //   }
        // })

        let valueTmp2 = '您好，您的咨询已结束。'
        if (timeoutCounsels[i].type === 6 || timeoutCounsels[i].type === 7) {
          valueTmp2 = '您好，您的加急咨询已结束。'
        }
        var templatePat = {
          'userId': timeoutCounsels[i].patientId.userId,
          'role': 'patient',
          'postdata': {
            'template_id': config.wxTemplateIdConfig.counselAutoEndPat,
            'url': '',
            'data': {
              'first': {
                'value': valueTmp2,
                'color': '#173177'
              },
              'keyword1': {
                'value': timeoutCounsels[i].help,           // 咨询内容
                'color': '#173177'
              },
              'keyword2': {
                'value': '医生超时未回复',                   // 结束原因
                'color': '#173177'
              },

              'remark': {
                'value': '我们会提醒医生在后期咨询中及时回复您的问题。',
                'color': '#173177'
              }
            }
          }
        }
        params = templatePat
        wechatCtrl.wechatMessageTemplate(params, function (err, results) {
          if (err) {
            console.log(new Date(), 'auto_send_messageTemplate_toPat_fail_' + timeoutCounsels[i].counselId)
          } else {
            if (results.messageTemplate.errcode === 0) {
              console.log(new Date(), 'auto_send_messageTemplate_toPat_success_' + timeoutCounsels[i].counselId)
            } else {
              console.log(new Date(), 'auto_send_messageTemplate_toPat_fail_' + timeoutCounsels[i].counselId)
            }
          }
        })
        // request({
        //   url: 'http://' + webEntry.domain + '/api/v2/wechat/messageTemplate',
        //   method: 'POST',
        //   body: templatePat,
        //   json: true
        // }, function (err, response) {
        //   if (!err && response.statusCode === 200) {
        //     console.log(new Date(), 'auto_send_messageTemplate_success')
        //   } else {
        //     console.log(new Date(), 'auto_send_messageTemplate_fail')
        //   }
        // })
      }
    }
  }, opts, fields, populate)
}
