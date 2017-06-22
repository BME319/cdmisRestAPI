var	request = require('request'),
	config = require('../config'),
	Patient = require('../models/patient'), 
	VitalSign = require('../models/vitalSign'), 
	Device = require('../models/device');

exports.bindingDevice = function(req, res){
	var userId = req.body.userId || null;
	var appId = req.body.appId || null;
	var twoDimensionalCode = req.body.twoDimensionalCode || null;

	if(userId === null || userId === '' || appId === null || appId === '' || twoDimensionalCode === null || twoDimensionalCode === '' ){
		return res.status(400).send('invalid input');     
	}
    var jsondata = {
    	appId: appId,
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
		        deviceName: '血压计',
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
	var userId = req.body.userId || null;
	var appId = req.body.appId || null;
	var sn = req.body.sn || null;
    var imei = req.body.imei || null;
    

	if(userId === null || userId === '' || appId === null || appId === '' || sn === null || sn === '' || imei === null || imei === '' ){
		return res.status(400).send('invalid input');     
	}
    var jsondata = {
    	appId: appId,
    	sn: sn
    };
    

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
        if(body.errorCode == 0){
        	// save data
        	var deviceId = sn + imei;

        	var query = {deviceId: deviceId};

			Device.removeOne(query,function(err, item){
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				res.json({results: body});
			});
        	
        }
        else{
        	// send error msg to the front end
        	// res.statusCode = 500;
        	res.json({results: body});
        }     
    }); 
}

exports.receiveBloodPressure = function(req, res){
  // console.log("receiveBloodPressure"); 
  // var res_data = req.body;
  // console.log(res_data);
  var sn = req.body.sn;
  var imei = req.body.imei;
  var deviceId = sn + imei;
  var query = {deviceId: deviceId};


  var results = {
    "code": 10,
    "status": "fail",
    "msg": "提交失败",
    "data": {}
  };

  Device.getOne(query, function(err, item) {
    if (err) {
        // return res.status(500).send(err.errmsg);
        res.json(results);
    }
    if(item == null){
        // res.json({results: {errorCode: 10, requestStatus: '设备不存在'}});
        res.json(results);
    }
    else{
        var userId = item.userId;
        var querypatient = { 
    		userId: userId
    	};
    	
    	Patient.getOne(querypatient, function (err, patient) {
        	if (err) {
            	// return res.status(500).send(err.errmsg);
            	res.json(results);
        	}
        	if (patient == null) {
        		// return res.status(400).send('user not exist');
        		res.json(results);
        	}
        	else {
        		var datetime = new Date();
        		var query = {
					patientId: patient._id, 
					type: '血压', 
					code: '血压', 
					date: datetime
				};
	
        		var upObj = {
            		$push: {
                		data: {
                    		time: datetime, 
                    		value: req.body.systolicpressure, 
                    		value2: req.body.diastolicpressure
                		}
            		}
        		};

				VitalSign.update(query, upObj, function(err, updata) {
					if (err){
						// return res.status(422).send(err.message);
						res.json(results);
					}
			        if (updata.nModified == 0) {
			            // return res.json({result:'未成功修改！请检查输入是否符合要求！', results:updata});
			            res.json(results);
			        }
			        else if (updata.nModified == 1) {
			            // return res.json({result:'新建或修改成功', resluts:updata});
			            results.code = 1;
			            results.status = 'success';
			            results.msg = '提交成功';
			            res.json(results);
			        }
				}, {new: true});
        	}   
    	});
    }
  });









  


 
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

exports.getDeviceInfo = function(req, res){
	var userId = req.query.userId || null;
	var deviceType = req.query.deviceType || null;

	if(userId === null || userId === '' ){
		return res.status(400).send('invalid input');     
	}
    
    var query = {userId: userId};
    if(deviceType != null && deviceType != '' ){
    	query['deviceType'] = deviceType;
    }

    Device.getSome(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item});
    }); 
}