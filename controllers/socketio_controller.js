// var config = require('../config');
var request = require('request')
var webEntry = require('../settings').webEntry

var wechatCtrl = require('../controllers/wechat_controller')
var commonFunc = require('../middlewares/commonFunc')

var userWechatServer = {}
var userWechatList = {}
var userAppServer = {}
var userAppList = {}

var userWechatPatientServer = {}
var userWechatPatientList = {}

var userWechatDoctorServer = {}
var userWechatDoctorList = {}
var userAppPatientServer = {}
var userAppPatientList = {}
var userAppDoctorServer = {}
var userAppDoctorList = {}
var userList = {}
var count = 0
// count of received from sender
var countrs = 0
// count of sent to receiver weixin
var countsrw = 0
// count of sent to receiver app
var countsra = 0
// count of sent to sender
var countss = 0
// count of offline receiver
var offlinecount = []

function Arrayremove (array, name) {
  var len = array.length
  for (var i = 0; i < len; i++) {
    if (array[i] == name) {
      array.splice(i, 1)
      break
    }
  }
}

function messageSaveSend (data, url, sender) {
  var targetType = data.msg.targetType
  var messageType
  var client = data.msg.clientType
  var targetRole = data.msg.targetRole
  var test = data.msg.test

  if (targetType == 'single') {         // 单聊
    messageType = 1
  } else {       // 群聊
    messageType = 2
  }
  var sendBy = data.msg.fromID
  var receiver = data.to

  var url = url
  data.msg.content['src'] = url
  data.msg.status = 'send_success'
  data.msg['time'] = Date.now()

    // save data
  var url = 'http://' + webEntry.domain + '/api/v1/communication/communication'
  var jsondata = {
    messageType: messageType,
    sendBy: sendBy,
    receiver: receiver,
    sendDateTime: data.msg.createTimeInMillis,
    content: data.msg
  }
  request({
        // url: url + '?token=' + req.query.token || req.body.token,
    url: url,
    method: 'POST',
    body: jsondata,
    json: true
  }, function (err, response) {
    if (err) {
            // do-something
    } else {
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
      if (test == 'test') {
        countss++
      }

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
      if (targetRole == 'doctor') {
        sendToReceiver(messageType, receiver, sendBy, userAppDoctorServer, userWechatDoctorServer, data)
      } else if (targetRole == 'patient') {
        sendToReceiver(messageType, receiver, sendBy, userAppPatientServer, userWechatPatientServer, data)
      } else {

      }
    }
  })
}

function sendToReceiver (messageType, receiver, sendBy, userAppServer, userWechatServer, data) {
  var test = data.msg.test
  if (messageType == 1) {       // 单聊
    var online = false
    if (userAppServer.hasOwnProperty(receiver)) {         // 用户在线
      online = true
            // console.log('getMsg: ' + receiver);
      userAppServer[receiver].emit('getMsg', {msg: data.msg})
      if (test == 'test') {
        countsra++
      }
    }
    if (userWechatServer.hasOwnProperty(receiver)) {
      online = true
      userWechatServer[receiver].emit('getMsg', {msg: data.msg})
      if (test == 'test') {
        countsrw++
      }
    }
    if (!online) {           // 用户不在线
      if (test == 'test') {
        offlinecount.push(data.to)
      }
            // socket.emit("err",{msg:"对方已经下线或者断开连接"})
    }
  } else {           // 群聊
        // console.log(receiver);
    request({
            // url: 'http://' + webEntry.domain + ':4060/api/v1/communication/getTeam?teamId=' + data.msg.teamId + '?token=' + req.query.token || req.body.token,
      url: 'http://' + webEntry.domain + '/api/v1/communication/team?teamId=' + data.msg.teamId,
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
        console.log(members)
        console.log(members.length)

        for (var idx in members) {
         // var online = false
          console.log(members[idx])

          if (userAppServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
            // online = true
            console.log(idx)
                        // console.log(member.userId);
            if (members[idx].userId != sendBy) {
                            // console.log(member.userId);
              userAppServer[members[idx].userId].emit('getMsg', {msg: data.msg})
            }
          }
                    // console.log(member);
          if (userWechatServer.hasOwnProperty(members[idx].userId)) {         // 用户在线
            // online = true
            console.log(idx)
                        // console.log(member.userId);
            if (members[idx].userId != sendBy) {
                            // console.log(member.userId);
              userWechatServer[members[idx].userId].emit('getMsg', {msg: data.msg})
            }
          }
         // if (!online) {       // 用户不在线
          // else {       // 用户不在线
                        // custom card 群发
            // if (data.msg.contentType === 'custom' && data.msg.content.type === 'card' || (data.msg.contentType === 'text' || data.msg.contentType === 'image' || data.msg.contentType === 'voice')) {
          if (data.msg.contentType === 'custom' && data.msg.content.type === 'card') {
                            // console.log(idx + ' 用户不在线');
            var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_13_1_' + data.msg.content.consultationId + '_' + data.msg.teamId + '&#wechat_redirect'
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
                    'value': help, // 问题描述
                    'color': '#173177'
                  },
                  'keyword4': {
                    'value': commonFunc.getNowFormatSecondMinus(new Date(time)), // 提交时间
                    'color': '#173177'
                  },

                  'remark': {
                    'value': '感谢您的使用！',
                    'color': '#173177'
                  }
                }
              }
            }
            console.log(idx)

                            // groupSend(data);
            request({
                                // url: 'http://'+ webEntry.domain +':4060/api/v1/wechat/messageTemplate' + '?token=' + req.query.token || req.body.token,
              url: 'http://' + webEntry.domain + '/api/v1/wechat/messageTemplate',
              method: 'POST',
              body: template,
              json: true
            }, function (err, response, body) {
                                // console.log(idx + 'done')
              console.log(body)

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
    })
  }
}

// namespace chat
exports.chat = function (io, socket) {
  socket.on('newUser', function (data) {
    var nickname = data.user_name,

      user_id = data.user_id,
      client = data.client
        // console.log(data)
        // socket.id = user_id;

    if (client == 'doctor') {
            // console.log("newUser @doctor:  "+ data.user_id);
      if (userAppDoctorServer[user_id] && userAppDoctorServer[user_id].id != socket.id) {
        userAppDoctorServer[user_id].emit('kick')
                // if(user_id == 'U201705120004'){
                //     console.log('old:  '+userAppDoctorServer[user_id].id);
                //     console.log(socket.id);
                // }
      }
            // if(user_id == 'U201705120004') console.log('new:  '+socket.id);
      socket.id = user_id
      userAppDoctorServer[user_id] = socket
      userAppDoctorList[user_id] = nickname
    } else if (client == 'patient') {
            // console.log("newUser @patient:  "+ data.user_id);
      if (userAppPatientServer[user_id] && userAppPatientServer[user_id].id != socket.id) {
        userAppPatientServer[user_id].emit('kick')
      }
      socket.id = user_id

      userAppPatientServer[user_id] = socket
      userAppPatientList[user_id] = nickname
    } else if (client == 'wechatdoctor') {
            // console.log("newUser @wechatdoctor:  "+ data.user_id);
      socket.id = user_id

      userWechatDoctorServer[user_id] = socket
      userWechatDoctorList[user_id] = nickname
    } else if (client == 'wechatpatient') {
            // console.log("newUser @wechatpatient:  "+ data.user_id);

      socket.id = user_id
      userWechatPatientServer[user_id] = socket
      userWechatPatientList[user_id] = nickname
    } else {
            // console.log('newUser not match');
            // console.log(data);
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
    if (data.client == 'doctor') {
      delete userAppDoctorServer[id]
      delete userAppDoctorList[id]
    } else if (data.client == 'patient') {
      delete userAppPatientServer[id]
      delete userAppPatientList[id]
    } else if (data.client == 'wechatdoctor') {
      delete userWechatDoctorServer[id]
      delete userWechatDoctorList[id]
    } else if (data.client == 'wechatpatient') {
      delete userWechatPatientServer[id]
      delete userWechatPatientList[id]
    } else {
            // do
    }
  })
    // socket.on('disconnect',function(){ //用户注销登陆执行内容

    //     // console.log('disconnect');

    //     count -= 1;
    //     var id = socket.id
    //     delete userServer[id]
    //     delete userList[id]
    //     // console.log(id);
    //     // console.log(Object.keys(userServer));
    //     // io.emit('onlineCount',freeList)
    //     // io.emit('offline',{id:id})
    //     // io.emit('addCount', count)
    //     // console.log('disconnect: ' + id);
    //     // console.log(Object.keys(userServer));
    // })

  socket.on('message', function (data) {
        // console.log('message by: '+data.msg.fromName );

    var contentType = data.msg.contentType
    var clientType = data.msg.clientType
    var role = data.role
    var test = data.msg.test
        // var toUserId = data.to;
    var url = 'http://' + webEntry.domain + '/api/v1/wechat/download'

    // receive from sender
    if (test == 'test') {
      countrs++
    }
    if (test == 'clear') {
      countrs = 0
      countsrw = 0
      countsra = 0
      countss = 0
      offlinecount = []
    }
    if (test == 'getback') {
      data.msg.offline = offlinecount
      data.msg.content = '服务器收到：' + countrs + '服务器发回回执：' + countss + '服务器发给app：' + countsra + '服务器发给微信：' + countsrw
    }

    if (clientType != 'doctor' && clientType != 'patient' && (contentType == 'image' || contentType == 'voice')) {           // image voice
      var mediaId = data.msg.content.mediaId
      var name
      if (contentType == 'image') {
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
  socket.on('sendImg', function (data) {
    if (userServer.hasOwnProperty(data.to)) {
      userServer[data.to].emit('getImg', {msg: data.msg})
    } else {
      socket.emit('err', {msg: '对方已经下线或者断开连接'})
    }
  })
}

// namespace counsel
exports.counsel = function (io, socket) {
  socket.emit('open')  // 通知客户端已连接
}
exports.otherEvent = function (io) {
}
exports.otherRoom = function (io) {
}

dateFormat = function (fmt) { // author: meizz
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  return fmt
}
