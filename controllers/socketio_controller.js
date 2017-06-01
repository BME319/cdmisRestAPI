// var config = require('../config');
var request = require('request');
var webEntry = require('../settings').webEntry;

var wechatCtrl = require('../controllers/wechat_controller');

var userServer = {};
var userList = {};
var count = 0;


function Arrayremove(array,name){
    var len = array.length;
    for(var i=0; i<len; i++){
        if(array[i] == name){
            array.splice(i,1)
            break
        }
    }
}

function messageSaveSend(data, url){

    var targetType = data.msg.targetType;
    var messageType;
    if(targetType == 'single'){         // 单聊
        messageType = 1;
    }
    else{       // 群聊
        messageType = 2;
    }
    var sendBy = data.msg.fromID;
    var receiver = data.to;

    var url = url;
    data.msg.content['src'] = url;
    data.msg.status = 'send_success';

    // save data
    var url = 'http://' + webEntry.domain + ':4050/communication/postCommunication';
    var jsondata = {
        messageType: messageType,
        sendBy:sendBy,
        receiver:receiver,
        sendDateTime:data.msg.createTimeInMillis,
        content:data.msg
    }
    request({
        url: url,
        method: 'POST',
        body: jsondata,
        json:true
    }, function(err, response){
        if(err) {
            // do-something
        }
        else{
            // console.log(response.body);
            // send message
            /// send to sendBy
            if(userServer.hasOwnProperty(sendBy)){         // 用户在线
                // console.log('messageRes: ' + sendBy);
                userServer[sendBy].emit('messageRes',{msg:data.msg});
            }
            else{           // 用户不在线
                // socket.emit("err",{msg:"对方已经下线或者断开连接"})
            }
            // userServer[sendBy].emit('messageRes',{msg:data.msg});
            /// send to receiver

            if(messageType == 1){       // 单聊
                if(userServer.hasOwnProperty(receiver)){         // 用户在线
                    // console.log('getMsg: ' + receiver);
                    userServer[receiver].emit('getMsg',{msg:data.msg});
                }
                else{           // 用户不在线
                    // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                }
            }
            else{           // 群聊
                // console.log(receiver);
                request({
                    url: 'http://' + webEntry.domain + ':4050/communication/getTeam?teamId=' + data.msg.teamId,
                    method: 'GET',
                    json:true
                }, function(err, response){
                    // if (!err && response.statusCode == 200) {       
                    //     console.log(response.body);
                    //     var members = response.body.results.members;
                    //     for(var member in members){
                    //         if(userServer.hasOwnProperty(member.userId)){         // 用户在线
                    //             userServer[member.userId].emit('getMsg',{msg:data.msg});
                    //         }
                    //     }
                    // }
                    // else{
                    //     console.log("123");
                    //     // return res.status(500).send('Error');
                    // }
                    if(err) {
                        // do-something
                        // console.log(err.errmsg);
                    }
                    else{
                        // console.log(response.body);
                        var sponsorId = response.body.results.sponsorId;
                        var members = response.body.results.members;
                        members.push({"userId":sponsorId});

                        // console.log(members);
                        for(var idx in members){
                            // console.log(member);
                            if(userServer.hasOwnProperty(members[idx].userId)){         // 用户在线
                                  // console.log(member.userId);
                                if(members[idx].userId != sendBy){
                                    // console.log(member.userId);
                                    userServer[members[idx].userId].emit('getMsg',{msg:data.msg});
                                }                            
                            }
                            else{       // 用户不在线
                                // custom card 群发
                                 if(data.msg.contentType == 'custom' && data.msg.content.type == 'card'){
                                    // console.log('in');
                                    var actionUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab9c316b3076535d&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_13_1_" +data.msg.targetID +'_'+data.msg.teamId + "&#wechat_redirect";
                                    var template = {
                                        "userId": members[idx].userId,          // data.msg.content.doctorId, //医生的UID
                                        "role": "doctor",
                                        "postdata": {
                                            "template_id": "cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k",
                                            "url": actionUrl,
                                            "data": {
                                                "first": {
                                                    "value": "您的团队有一个新的咨询（问诊）消息，请及时处理",
                                                    "color": "#173177"
                                                },
                                                "keyword1": {
                                                    "value": data.msg.content.counselId, //咨询ID
                                                    "color": "#173177"
                                                },
                                                "keyword2": {
                                                    "value": data.msg.content.patientName, //患者信息（姓名，性别，年龄）
                                                    "color": "#173177"
                                                },
                                                "keyword3": {
                                                    "value": data.msg.content.help, //问题描述
                                                    "color": "#173177"
                                                },
                                                "keyword4": {
                                                    "value": data.msg.content.time, //提交时间
                                                    "color": "#173177"
                                                },

                                                "remark": {
                                                    "value": "感谢您的使用！",
                                                    "color": "#173177"
                                                }
                                            }
                                        }
                                    };

                                    // groupSend(data);
                                    request({
                                        url: 'http://'+ webEntry.domain +':4050/wechat/messageTemplate',
                                        method: 'POST',
                                        body: template,
                                        json:true
                                    }, function(err, response, body){
                                        // if (!err && response.statusCode == 200) {   
                                        //     res.json({results:body});
                                        // }
                                        // else{
                                        //     return res.status(500).send('Error');
                                        // }
                                    });

                                   
                                 }

                                // others: no process
                            }
                        }                      
                    }
                })
            }
            
        }
    });  
}


// namespace chat
exports.chat = function (io, socket) {
    count += 1;
    socket.on('newUser',function(data){
        var nickname = data.user_name,
            user_id = data.user_id;
        socket.id = user_id;
        userServer[user_id] = socket;
        userList[user_id] = nickname
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
    socket.on('disconnect',function(){ //用户注销登陆执行内容
        count -= 1; 
        var id = socket.id
        delete userServer[id]
        delete userList[id]
        // io.emit('onlineCount',freeList)
        // io.emit('offline',{id:id})
        // io.emit('addCount', count)
        // console.log('disconnect: ' + id);
        // console.log(Object.keys(userServer));
    })
    socket.on('message',function(data){
        var contentType = data.msg.contentType;
        var clientType = data.msg.clientType;
        var role = data.role;
        // var toUserId = data.to;
        
        var url = 'http://'+ webEntry.domain +':4050/wechat/download';

        if(clientType != 'app' &&(contentType == 'image' || contentType == 'voice')){           // image voice
            var mediaId = data.msg.content.mediaId;
            var name;
            if(contentType == 'image' ){
                name = data.to + data.msg.createTimeInMillis + '.jpg';
            }
            else{
                name = data.to + data.msg.createTimeInMillis + '.mp3';
            }
        
            // download
            request({
                url: url + '?serverId=' + mediaId + '&name=' + name + '&role=' + role,
                method: 'GET',
                json: true
            }, function(err, response){
                if(err) {
                    // do-something
                }
                else{
                    var resUrl = "uploads/photos/" + name;
                    data.msg.content['src_thumb'] = resUrl;
                    messageSaveSend(data, resUrl);
                }
            });
        }else{          // text custom
            messageSaveSend(data, data.msg.content.src);
        }

     
    })
    socket.on('sendImg',function(data){
        if(userServer.hasOwnProperty(data.to)){
            userServer[data.to].emit('getImg',{msg:data.msg})
        }else{
            socket.emit("err",{msg:"对方已经下线或者断开连接"})
        }
    })
};



// namespace counsel
exports.counsel = function (io, socket) {
   
   socket.emit('open');  //通知客户端已连接
};
exports.otherEvent = function (io) {
};
exports.otherRoom = function (io) {
};


