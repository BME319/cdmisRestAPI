var	request = require('request'),
	config = require('../config');

exports.getDeviceInfo = function(req, res){
    var jsondata = req.body;

    request({
        method: 'POST',
        url: config.third_party_data.bloodpressure.get_device_url,
        body: jsondata,
        headers: {
        	'Content-Type': 'application/x-www-form-urlencoded'
    	},
        json: true
    }, function(err, response, body) {
        if(err){
            return res.status(500).send(err.errmsg);     
        }
        res.json({results: body});
    }); 
}

exports.debindingDevice = function(req, res){
    var jsondata = req.body;

    request({
        method: 'POST',
        url: config.third_party_data.bloodpressure.debinding_device_url,
        body: jsondata,
        headers: {
        	'Content-Type': 'application/x-www-form-urlencoded'
    	},
        json: true
    }, function(err, response, body) {
        if(err){
            return res.status(500).send(err.errmsg);     
        }
        res.json({results: body});
    }); 
}

exports.receiveBloodPressure = function(req, res){
    var jsondata = req.body;

    request({
        method: 'POST',
        url: config.third_party_data.bloodpressure.get_bp_data_url,
        body: jsondata,
        headers: {
        	'Content-Type': 'application/x-www-form-urlencoded'
    	},
        json: true
    }, function(err, response, body) {
        if(err){
            return res.status(500).send(err.errmsg);     
        }
        res.json({results: body});
    }); 
}