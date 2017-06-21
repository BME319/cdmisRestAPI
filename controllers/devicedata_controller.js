var	request = require('request'),
	config = require('../config'),
	Device = require('../models/device');

exports.getDeviceInfo = function(req, res){
	var userId = req.body.userId || null;
	var appId = req.body.appId || null;
	var twoDimensionalCode = req.body.twoDimensionalCode || null;

	if(userId === null || userId === '' || appId === null || appId === '' || twoDimensionalCode === null || twoDimensionalCode === '' ){
		return res.status(400).send('invalid input');     
	}
    var jsondata = {
    	appId: appId;
    	twoDimensionalCode: twoDimensionalCode
    };
   
    request({
        method: 'POST',
        url: config.third_party_data.bloodpressure.get_device_url,
        body: jsondata,
        json: true
    }, function(err, response, body) {
        if(err){
            return res.status(500).send(err.errmsg);     
        }
        if(body.errorCode == 0){
        	// save device info
        	var sn = body.deviceInfo.sn;
        	var imei = body.deviceInfo.imei;
        	var deviceId = sn + imei;

        	var deviceData = {
		        userId: userId,
		        deviceId: deviceId,
		        deviceType: 'sphygmomanometer',
		        deviceInfo: body.deviceInfo
		    };
		    var newDevice = new Device(deviceData);
		    newDevice.save(function(err, Info) {
		        if (err) {
		            return res.status(500).send(err.errmsg);
		        }
		        res.json({results: body});
		    });
        	
        }
        else{
        	// send error msg to the front end
        	res.json({results: body});
        }     
    }); 
}

exports.debindingDevice = function(req, res){
    var jsondata = req.body;

    request({
        method: 'POST',
        url: config.third_party_data.bloodpressure.debinding_device_url,
        body: jsondata,
     //    headers: {
     //    	'Content-Type': 'application/x-www-form-urlencoded'
    	// },
        json: true
    }, function(err, response, body) {
        if(err){
            return res.status(500).send(err.errmsg);     
        }
        res.json({results: body});
    }); 
}

exports.receiveBloodPressure = function(req, res){
  console.log("receiveBloodPressure"); 
  var res_data = req.body;
  console.log(res_data);

  var results = {
    "code": 1,
    "status": "success",
    "msg": "提交成功",
    "data": {}
  };
  res.json(results);
 
  // var body = '';
  // var results = '';

  // req.on('data',function(data){
  //   body += data;
  //   // console.log("partial: " + body);
  // });
  // req.on('end',function(){
  //   console.log("finish: " + body);
  //   results = {
  //     "code": 1,
  //     "status": "success",
  //     "msg": "提交成功",
  //     "data": {}
  //   };
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.write(results);
  //   res.end();
  
  // });

  // req.on('error', function(err) { 
  //   console.log('problem with request: ' + err.message); 
  //   results = {
  //     "code": 3,
  //     "status": "fail",
  //     "msg": "提交失败",
  //     "data": {}
  //   };
  //   res.statusCode = 500;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.write(results);
  //   res.end();
  // }); 
  
}