// var config = require('../config');
var request = require('request')
var webEntry = require('../settings').webEntry

var userWechatPatientServer = {}
var userWechatPatientList = {}

var userWechatDoctorServer = {}
var userWechatDoctorList = {}

var userAppPatientServer = {}
var userAppPatientList = {}

var userAppDoctorServer = {}
var userAppDoctorList = {}

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
  var reqUrl = 'http://' + webEntry.domain + ':4060/api/v1/communication/communication'
  var jsondata = {
    messageType: messageType,
    sendBy: sendBy,
    receiver: receiver,
    sendDateTime: data.msg.createTimeInMillis,
    content: data.msg
  }
  console.log(jsondata)
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
      console.log(response)
            // console.log(response.body);
            // send message
            /// send to sendBy
            // console.log("SENDBY: "+ sendBy);
            // console.log("app_doctor:  "+Object.keys(userAppDoctorServer));
            // console.log("app_patient:  "+Object.keys(userAppPatientServer));
            // console.log("wechat_doctor:  "+Object.keys(userWechatDoctorServer));
            // console.log("wechat_patient:  "+Object.keys(userWechatPatientServer));

      data.msg['messageId'] = response.body.messageNo

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
        sendToReceiver(messageType, receiver, sendBy, userAppDoctorServer, userWechatDoctorServer, data)
      } else if (targetRole === 'patient') {
        sendToReceiver(messageType, receiver, sendBy, userAppPatientServer, userWechatPatientServer, data)
      } else {

      }
    }
  })
}

function sendToReceiver (messageType, receiver, sendBy, userAppServer, userWechatServer, data) {
  var online = false
  if (messageType === 1) {       // 单聊
    if (userAppServer.hasOwnProperty(receiver)) {         // 用户在线
      online = true
            // console.log('getMsg: ' + receiver);
      userAppServer[receiver].emit('getMsg', {msg: data.msg})
    }
    if (userWechatServer.hasOwnProperty(receiver)) {
      online = true
      userWechatServer[receiver].emit('getMsg', {msg: data.msg})
    }
    if (!online) {           // 用户不在线
            // socket.emit("err",{msg:"对方已经下线或者断开连接"})
    }
  } else {           // 群聊
        // console.log(receiver);
    request({
            // url: 'http://' + webEntry.domain + ':4060/api/v1/communication/getTeam?teamId=' + data.msg.teamId + '?token=' + req.query.token || req.body.token,
      url: 'http://' + webEntry.domain + ':4060/api/v1/communication/team?teamId=' + data.msg.teamId,
      method: 'GET',
      json: true
    }, function (err, response) {
      if (err) {
                // do-something
                // console.log(err.errmsg);
      } else {
                // console.log(response.body);
        var sponsorId = response.body.results.sponsorId
        var members = response.body.results.members
        members.push({'userId': sponsorId})

                // console.log(members);
        for (var idx in members) {
                    // console.log(member);

          if (userAppServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
            online = true
                        // console.log(member.userId);
            if (members[idx].userId !== sendBy) {
                            // console.log(member.userId);
              userAppServer[members[idx].userId].emit('getMsg', {msg: data.msg})
            }
          }
                    // console.log(member);
          if (userWechatServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
            online = true
                        // console.log(member.userId);
            if (members[idx].userId !== sendBy) {
                            // console.log(member.userId);
              userWechatServer[members[idx].userId].emit('getMsg', {msg: data.msg})
            }
          }
          if (!online) {       // 用户不在线
                        // custom card 群发
            if (data.msg.contentType === 'custom' && data.msg.content.type === 'card') {
                            // console.log('in');
              var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_13_1_' + data.msg.content.consultationId + '_' + data.msg.teamId + '&#wechat_redirect'

              var template = {
                'userId': members[idx].userId,          // data.msg.content.doctorId, //医生的UID
                'role': 'doctor',
                'postdata': {
                  'template_id': 'cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k',
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
                      'value': data.msg.content.help, // 问题描述
                      'color': '#173177'
                    },
                    'keyword4': {
                      'value': data.msg.content.time, // 提交时间
                      'color': '#173177'
                    },

                    'remark': {
                      'value': '感谢您的使用！',
                      'color': '#173177'
                    }
                  }
                }
              }

                            // groupSend(data);
              request({
                                // url: 'http://'+ webEntry.domain +':4060/api/v1/wechat/messageTemplate' + '?token=' + req.query.token || req.body.token,
                url: 'http://' + webEntry.domain + ':4060/api/v1/wechat/messageTemplate',
                method: 'POST',
                body: template,
                json: true

              }, function (err, response, body) {

                                // if (!err && response.statusCode == 200) {
                                //     res.json({results:body});
                                // }
                                // else{
                                //     return res.status(500).send('Error');
                                // }
              })
            }

                        // others: no process
          }

                    // others: no process
        }
      }
    })
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
      console.log('newUser not match')
      console.log(data)
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

    var url = 'http://' + webEntry.domain + ':4060/api/v1/wechat/download'

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
