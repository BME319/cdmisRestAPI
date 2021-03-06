// var config = require('../config');
var request = require('request')
var webEntry = require('../settings').webEntry

var commonFunc = require('../middlewares/commonFunc')
var config = require('../config')

var userWechatPatientServer = {}
var userWechatPatientList = {}

var userWechatDoctorServer = {}
var userWechatDoctorList = {}

var userAppPatientServer = {}
var userAppPatientList = {}

var userAppDoctorServer = {}
var userAppDoctorList = {}

var waitingForGotMsg = {}

function messageSaveSend (data, url, sender) {
  var targetType = data.msg.targetType
  var messageType
  var targetRole = data.msg.targetRole

  if (targetType === 'single') {         // 单聊
    messageType = 1
  } else {       // 群聊
    messageType = 2
  }
  var sendBy = data.msg.fromID
  var receiver = data.to

  var contentUrl = url
  data.msg.content['src'] = contentUrl
  data.msg.status = 'send_success'
  data.msg['time'] = Date.now()

    // save data
  var reqUrl = 'http://' + webEntry.domain + '/api/v2/communication/communication'
  var jsondata = {
    messageType: messageType,
    sendBy: sendBy,
    receiver: receiver,
    sendDateTime: data.msg.createTimeInMillis,
    content: data.msg
  }
  // console.log(jsondata)
  request({
        // url: url + '?token=' + req.query.token || req.body.token,
    url: reqUrl,
    method: 'POST',
    body: jsondata,
    json: true
  }, function (err, response) {
    if (err) {
      console.log(err)
            // do-something
    } else {
      // console.log(response)
            // console.log(response.body);
            // send message
            /// send to sendBy
            // console.log("SENDBY: "+ sendBy);
            // console.log("app_doctor:  "+Object.keys(userAppDoctorServer));
            // console.log("app_patient:  "+Object.keys(userAppPatientServer));
            // console.log("wechat_doctor:  "+Object.keys(userWechatDoctorServer));
            // console.log("wechat_patient:  "+Object.keys(userWechatPatientServer));
      if (response.body) {
        if (response.body.newResults) {
          data.msg['messageId'] = response.body.newResults.messageNo
  
          sender.emit('messageRes', {msg: data.msg})
  
                      // if(client == 'doctor'){
                      //     if(userAppDoctorServer.hasOwnProperty(sendBy)){         // 用户在线
                      //         // console.log("messageRes to [doctor]: "+sendBy)
                      //         userAppDoctorServer[sendBy].emit('messageRes',{msg:data.msg});
                      //         // sender.emit('messageRes',{msg:data.msg});
                      //     }
                      //     else{           // 用户不在线
                      //         // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                      //     }
                      // }
                      // else if(client == 'patient'){
                      //     if(userAppPatientServer.hasOwnProperty(sendBy)){         // 用户在线
                      //         // console.log("messageRes to [patient]: "+sendBy)
                      //         userAppPatientServer[sendBy].emit('messageRes',{msg:data.msg});
                      //         // sender.emit('messageRes',{msg:data.msg});
                      //     }
                      //     else{           // 用户不在线
                      //         // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                      //     }
                      // }
                      // else if(client == 'wechatdoctor'){
  
                      //       if(userWechatDoctorServer.hasOwnProperty(sendBy)){         // 用户在线
                      //         // console.log("messageRes to [wechatdoctor]: "+sendBy)
                      //         userWechatDoctorServer[sendBy].emit('messageRes',{msg:data.msg});
                      //         // sender.emit('messageRes',{msg:data.msg});
                      //     }
                      //     else{           // 用户不在线
                      //         // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                      //     }
                      // }
                      // else if(client == 'wechatpatient'){
                      //     if(userWechatPatientServer.hasOwnProperty(sendBy)){         // 用户在线
                      //         // console.log("messageRes to [wechatpatient]: "+sendBy)
                      //         userWechatPatientServer[sendBy].emit('messageRes',{msg:data.msg});
                      //         // sender.emit('messageRes',{msg:data.msg});
                      //     }
                      //     else{           // 用户不在线
                      //         // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                      //     }
                      // }
                      // else{
                      //     // do
                      // }
  
                      /// send to receiver
          if (targetRole === 'doctor') {
            sendToReceiver(messageType, receiver, sendBy, userAppDoctorServer, userWechatDoctorServer, data, targetRole)
          } else if (targetRole === 'patient') {
            sendToReceiver(messageType, receiver, sendBy, userAppPatientServer, userWechatPatientServer, data, targetRole)
          } else {
  
          }
        } else {
  
        }
      }
    }
  })
}

function sendToReceiver (messageType, receiver, sendBy, userAppServer, userWechatServer, data, targetRole) {
  if (messageType === 1) {       // 单聊
    var online = false
    if (userAppServer.hasOwnProperty(receiver)) {         // 用户在线
      online = true
            // console.log('getMsg: ' + receiver);
      userAppServer[receiver].emit('getMsg', {msg: data.msg})
      var gotmsgid = data.msg.messageId + receiver
      if (!waitingForGotMsg[gotmsgid])waitingForGotMsg[gotmsgid] = {msg: data.msg, id: receiver}
      // console.log('2', waitingForGotMsg)
      setTimeout(function () { sendSingleMsg(data.msg, receiver, targetRole) }, 15000)
    }
    if (userWechatServer.hasOwnProperty(receiver)) {
      online = true
      userWechatServer[receiver].emit('getMsg', {msg: data.msg})
      var gotmsgid = data.msg.messageId + receiver
      if (!waitingForGotMsg[gotmsgid])waitingForGotMsg[gotmsgid] = {msg: data.msg, id: receiver}
      setTimeout(function () { sendSingleMsg(data.msg, receiver, targetRole) }, 15000)
    }
    if (!online) {           // 用户不在线

            // socket.emit("err",{msg:"对方已经下线或者断开连接"})
    }
  } else {           // 群聊
    // console.log(receiver)
    // console.log(data.msg.teamId)
    request({
            // url: 'http://' + webEntry.domain + ':4060/api/v1/communication/getTeam?teamId=' + data.msg.teamId + '?token=' + req.query.token || req.body.token,
      url: 'http://' + webEntry.domain + '/api/v2/communication/teamtemp?teamId=' + data.msg.teamId,
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

            if (userAppServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
              // online = true
              // console.log(idx)
                          // console.log(member.userId);
              if (members[idx].userId !== sendBy) {
                // console.log(members[idx].userId)
                userAppServer[members[idx].userId].emit('getMsg', {msg: data.msg})
                var gotmsgid = data.msg.messageId + members[idx].userId
                if (!waitingForGotMsg[gotmsgid])waitingForGotMsg[gotmsgid] = {msg: data.msg, id: members[idx].userId}
                setTimeout(function () { sendSingleMsg(data.msg, members[idx].userId, targetRole) }, 15000)
              }
            }
                      // console.log(member);
            if (userWechatServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
              // online = true
              // console.log(idx)
                          // console.log(member.userId);
              if (members[idx].userId !== sendBy) {
                              // console.log(member.userId);
                userWechatServer[members[idx].userId].emit('getMsg', {msg: data.msg})
                var gotmsgid = data.msg.messageId + members[idx].userId
                if (!waitingForGotMsg[gotmsgid])waitingForGotMsg[gotmsgid] = {msg: data.msg, id: members[idx].userId}
                setTimeout(function () { sendSingleMsg(data.msg, members[idx].userId, targetRole) }, 15000)
              }
            }
           // if (!online) {       // 用户不在线
            // else {       // 用户不在线
                          // custom card 群发
              // if (data.msg.contentType === 'custom' && data.msg.content.type === 'card' || (data.msg.contentType === 'text' || data.msg.contentType === 'image' || data.msg.contentType === 'voice')) {
            if (data.msg.contentType === 'custom' && data.msg.content.type === 'card') {
                              // console.log(idx + ' 用户不在线');
              var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=https://media.haihonghospitalmanagement.com/proxy&response_type=code&scope=snsapi_userinfo&state=doctor_13_1_' + data.msg.content.consultationId + '_' + data.msg.teamId + '&#wechat_redirect'
              var help
              var time
              if (data.msg.content !== null) {
                var counsel = data.msg.content.counsel || null
                if (counsel !== null) {
                  help = counsel.help
                  time = counsel.time || new Date()
                }
              }
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
                      'value': data.msg.content.counselId, // 咨询ID
                      'color': '#173177'
                    },
                    'keyword2': {
                      'value': data.msg.content.patientName, // 患者信息（姓名，性别，年龄）
                      'color': '#173177'
                    },
                    'keyword3': {
                      'value': help, // 问题描述
                      'color': '#173177'
                    },
                    'keyword4': {
                      'value': commonFunc.getNowFormatSecond(new Date(time)), // 提交时间
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
            }

                          // others: no process
            // }
          }
        }
      }
    })
  }
}

function sendSingleMsg (msg, user_id, targetRole) {
  // 查看是否还处于待发送队列
  var tempgotmsgid = msg.messageId + user_id
  // console.log('1', tempgotmsgid)
  // console.log('5', waitingForGotMsg)
  if (waitingForGotMsg[tempgotmsgid]) { // 还在
    // 先查看是否在线
    var online = false
    if (targetRole === 'patient') {
      if (userAppPatientServer.hasOwnProperty(user_id)) {         // 用户在线
        online = true
        userAppPatientServer[user_id].emit('getMsg', {msg: msg})
        // setTimeout(function () { sendSingleMsg(msg, user_id, targetRole) }, 10000)
      }
      if (userWechatPatientServer.hasOwnProperty(user_id)) {
        online = true
        userWechatPatientServer[user_id].emit('getMsg', {msg: msg})
        // setTimeout(function () { sendSingleMsg(msg, user_id, targetRole) }, 10000)
      }
      if (!online) {           // 用户不在线
        delete waitingForGotMsg[tempgotmsgid]// 剔除
      }
    }
    if (targetRole === 'doctor') {
      if (userAppDoctorServer.hasOwnProperty(user_id)) {         // 用户在线
        online = true
        userAppDoctorServer[user_id].emit('getMsg', {msg: msg})
        // setTimeout(function () { sendSingleMsg(msg, user_id, targetRole) }, 10000)
      }
      if (userWechatPatientServer.hasOwnProperty(user_id)) {
        online = true
        userWechatPatientServer[user_id].emit('getMsg', {msg: msg})
        // setTimeout(function () { sendSingleMsg(msg, user_id, targetRole) }, 10000)
      }
      if (!online) {           // 用户不在线
        delete waitingForGotMsg[tempgotmsgid]// 剔除
      }
    }
  }
}

// namespace chat
exports.chat = function (io, socket) {
  socket.on('newUser', function (data) {
    var nickname = data.user_name
    var userId = data.user_id
    var client = data.client

        // socket.id = user_id;

    if (client === 'doctor') {
            // console.log("newUser @doctor:  "+ data.user_id);
      if (userAppDoctorServer[userId] && userAppDoctorServer[userId].id !== socket.id) {
        userAppDoctorServer[userId].emit('kick')
                // if(user_id == 'U201705120004'){
                //     console.log('old:  '+userAppDoctorServer[user_id].id);
                //     console.log(socket.id);
                // }
      }
            // if(user_id == 'U201705120004') console.log('new:  '+socket.id);
      socket.id = userId
      userAppDoctorServer[userId] = socket
      userAppDoctorList[userId] = nickname
    } else if (client === 'patient') {
            // console.log("newUser @patient:  "+ data.user_id);
      if (userAppPatientServer[userId] && userAppPatientServer[userId].id !== socket.id) {
        userAppPatientServer[userId].emit('kick')
      }
      socket.id = userId

      userAppPatientServer[userId] = socket
      userAppPatientList[userId] = nickname
    } else if (client === 'wechatdoctor') {
            // console.log("newUser @wechatdoctor:  "+ data.user_id);
      socket.id = userId

      userWechatDoctorServer[userId] = socket
      userWechatDoctorList[userId] = nickname
    } else if (client === 'wechatpatient') {
            // console.log("newUser @wechatpatient:  "+ data.user_id);

      socket.id = userId
      userWechatPatientServer[userId] = socket
      userWechatPatientList[userId] = nickname
    } else {
      // console.log('newUser not match')
      // console.log(data)
            // do
    }

        // io.emit('onlineCount',freeList)
        // io.emit('addCount', count)
        // if(freeList.length > 1){
        //     var from = user_id;
        //     Arrayremove(freeList,from)
        //     if(freeList.length == 1){
        //         n = 0
        //     }else{
        //         n = Math.floor(Math.random() * freeList.length)
        //     }
        //     var to = freeList[n]
        //     Arrayremove(freeList,to)
        //     io.emit("getChat",{p1:from,p2:to},userList)
        // }
        // console.log('newUser: ' +data.user_id);
        // console.log(Object.keys(userServer));
  })
  socket.on('disconnect', function (data) { // 用户注销登陆执行内容
        // console.log('disconnect');

    var id = socket.id
    if (data.client === 'doctor') {
      delete userAppDoctorServer[id]
      delete userAppDoctorList[id]
    } else if (data.client === 'patient') {
      delete userAppPatientServer[id]
      delete userAppPatientList[id]
    } else if (data.client === 'wechatdoctor') {
      delete userWechatDoctorServer[id]
      delete userWechatDoctorList[id]
    } else if (data.client === 'wechatpatient') {
      delete userWechatPatientServer[id]
      delete userWechatPatientList[id]
    } else {
            // do
    }

        // console.log(id);
        // console.log(Object.keys(userServer));
        // io.emit('onlineCount',freeList)
        // io.emit('offline',{id:id})
        // io.emit('addCount', count)
        // console.log('disconnect: ' + id);
        // console.log(Object.keys(userServer));
  })
  socket.on('message', function (data) {
        // console.log('message by: '+data.msg.fromName );
    var contentType = data.msg.contentType
    var clientType = data.msg.clientType
    var role = data.role
        // var toUserId = data.to;

    var url = 'http://' + webEntry.domain + '/api/v2/wechat/downloadsocket'

    if (clientType !== 'doctor' && clientType !== 'patient' && (contentType === 'image' || contentType === 'voice')) {           // image voice
      var mediaId = data.msg.content.mediaId
      var name
      if (contentType === 'image') {
        name = data.to + data.msg.createTimeInMillis + '.jpg'
      } else {
        name = data.to + data.msg.createTimeInMillis + '.mp3'
      }

            // download
      request({
                // url: url + '?serverId=' + mediaId + '&name=' + name + '&role=' + role + '?token=' + req.query.token || req.body.token,
        url: url + '?serverId=' + mediaId + '&name=' + name + '&role=' + role,
        method: 'GET',
        json: true
      }, function (err, response) {
        if (err) {
                    // do-something
        } else {
          var resUrl = 'uploads/photos/' + name
          data.msg.content['src_thumb'] = resUrl
          messageSaveSend(data, resUrl, socket)
        }
      })
    } else {          // text custom
      messageSaveSend(data, data.msg.content.src, socket)
    }
  })

  socket.on('gotMsg', function (data) {
    var temptempgotmsgid = data.msg.messageId + data.userId // 剔除
    // console.log('3', temptempgotmsgid)
    delete waitingForGotMsg[temptempgotmsgid]
    // console.log('4', waitingForGotMsg)
  })
    // socket.on('sendImg',function(data){
    //     if(userAppServer.hasOwnProperty(data.to)){
    //         userAppServer[data.to].emit('getImg',{msg:data.msg})
    //     }
    //     else if(userWechatServer.hasOwnProperty(data.to)){
    //         userWechatList[data.to].emit('getImg',{msg:data.msg})
    //     }
    //     else{
    //         socket.emit("err",{msg:"对方已经下线或者断开连接"})
    //     }
    // })
}

// namespace counsel
exports.counsel = function (io, socket) {
  socket.emit('open')  // 通知客户端已连接
}
exports.otherEvent = function (io) {
}
exports.otherRoom = function (io) {
}
