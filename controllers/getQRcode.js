var request = require('request'),
    xml2js = require('xml2js'),
    https = require('https'),
    moment = require('moment'),
    crypto = require('crypto'),
    path = require('path'), 
    fs = require('fs');

var config = require('../config'),
    webEntry = require('../settings').webEntry,
    commonFunc = require('../middlewares/commonFunc'),
    User = require('../models/user'),
    OpenIdTmp = require('../models/openId'),
    Doctor = require('../models/doctor'), 
    Order = require('../models/order');

exports.getAllDoctors = function(req, res, next) {
    var query = {};

    Doctor.getSome(query, function(err, items) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        else {
            var userId = [];
            for (var i = items.length - 1; i >= 0; i--) {
                userId[i] = items[i].userId;
            }
            req.body.doctorIds = userId;
            // console.log(req.body.doctorIds);
            return res.json({result:userId});
            // next();
        }
    });
}

exports.saveAllTDCticket = function(req, res) {
  // req.body.doctorIds = ['U201702150001', 'U201703190002', 'U201702150003', 'U201701050004'];
  // req.body.doctorIds = ["201705220008", "U201701061455", "U201705110001"]
  var TDCtickets = [];
  var count = 0;
  var endFlag = 0;
  var index = 0;

  var test = function(docId){
    var jsondata = {
        'userId':docId, 
        'role':'patient', 
        'postdata':{
            "action_name": "QR_LIMIT_STR_SCENE", 
            "action_info": {
                "scene": {
                    "scene_str": docId
                }
            }
        }
    };
    request({
        url: 'http://' + '121.196.221.44:4060/' + 'wechat/createTDCticket',
        method: 'POST',
        body: jsondata,
        json: true
    }, function(err, response, body){
        if (!err && response.statusCode == 200) {
        test(req.body.doctorIds[++index]); 
        count = index;

        }
        else{
 
        // console.log(body);
        }
    });
  }

  test(req.body.doctorIds[index]);

  // for (let i = req.body.doctorIds.length - 1; i >= 0; i--) {
  //     var jsondata = {
  //       'userId':req.body.doctorIds[i], 
  //       'role':'doctor', 
  //       'postdata':{
  //           "action_name": "QR_LIMIT_STR_SCENE", 
  //           "action_info": {
  //               "scene": {
  //                   "scene_str": req.body.doctorIds[i]
  //               }
  //           }
  //       }
  //       };
  //     // req.body.count = i;
  //     // console.log(req.body.count)

  //   request({
  //       url: 'http://' + '121.196.221.44:4060/' + 'wechat/createTDCticket',
  //       method: 'POST',
  //       body: jsondata,
  //       json: true
  //   }, function(err, response, body){
  //       if (!err && response.statusCode == 200) {   
  //       // res.json({results:body});
  //       // req.results = body;
  //       // next();
  //       // var TDCticket = body.results;
        
  //       // var TDCtickets = [];
  //       TDCtickets[i] = body.results;
  //       // console.log(body.results);
  //       // console.log(TDCtickets);
  //       // count -= 1;
  //       // console.log(count);
  //       if (i == -1) {
  //           endFlag = 1;
  //       }
  //       console.log(endFlag)
  //       // return res.json({result:body});
  //       }
  //       else{
  //       return res.status(500).send('Error');
  //       }
  //   });
  //   // TDCtickets[i] = TDCticket;
  // }


return res.json({result:count});
  // var callback_ready = function() {
  //   if (endFlag == 1) {
  //       return res.json({results:TDCtickets});
  //   }
  //   else {
  //       setTimeout("callback_ready", 1000);
  //   }
  // }
  // console.log(typeof(callback_ready));

  // callback_ready();  
}

// var download = function(url, dir, filename) {
//   request.head(url, function(err, res, body) {
//     request(url).pipe(fs.createWriteStream(dir + '/' + filename));
//   });
// };

exports.downloadImages = function(req, res) {
    var downloadImage = function(src, dest, callback) {
        request.head(src, function(err, res, body) {
            // console.log('content-type:', res.headers['content-type']);
            // console.log('content-length:', res.headers['content-length']);
            if (src) {
                request(src).pipe(fs.createWriteStream(dest)).on('close', function() {
                    callback(null, dest);
                });
            }
        });
    };

    var TDCtickets = [];
    // req.body.doctorIds = ['U201702150001', 'U201703190002', 'U201702150003', 'U201701050004'];
    // req.body.doctorIds = ['U201702150001'];


    for (let i = 0; i < req.body.doctorIds.length; i++) {
        var query = {userId:req.body.doctorIds[i]};

        User.getOne(query, function(err, item) {
            if (err) {
                console.log(err);
            }
            else {
                TDCtickets[i] = item.TDCticket;
                var query2 = {userId:item.userId}
                Doctor.getOne(query2, function(err, doctoritem) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(doctoritem.userId);
                        downloadImage("https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + TDCtickets[i], 'e:/doctorQRcodes_new/'+ doctoritem.name + '_' + doctoritem.title + '_' + doctoritem.workUnit +'.jpg', function(err, data){
                            if (err) {
                                // console.log(err)
                            }
                            if (data) {
                                // console.log("done: " + data);
                            }
                        });
                    }
                });
            }

        });
    }
    

    return res.json({result:[]});
}