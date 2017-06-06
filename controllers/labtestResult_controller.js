var config = require('../config');
var LabtestResult = require('../models/labtestResult');
var HealthInfo = require('../models/healthInfo');

//存数据方法, 2017-06-06 GY
exports.postLabtestResult = function(req, res) {
	var labtestResultData = {
		userId: req.body.userId,						
		time: new Date(req.body.time), 
		url: req.body.url, 
		SCr: req.body.SCr, //血肌酐 
		SCrunit: req.body.SCrunit, 
		GFR: req.body.GFR, //肾小球滤过率
		GFRunit: req.body.GFRunit, 
		ALB: req.body.ALB, //血白蛋白
		ALBunit: req.body.ALBunit, 
		PRO: req.body.PRO, //尿蛋白
		PROunit: req.body.PROunit
	};

	var newLabtestResult = new LabtestResult(labtestResultData);
	newLabtestResult.save(function(err, labtestResultInfo) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		// res.json({results: labtestResultInfo});
		var healthInfoData = {
			userId: req.body.userId,
			type: req.body.type,
			insertTime: new Date(),
			time: new Date(req.body.time),
			url: req.body.url,
			label: req.body.label,
			description: req.body.description,
			comments: req.body.comments, 
			resultId: labtestResultInfo._id
		};

		var newHealthInfo = new HealthInfo(healthInfoData);
		newHealthInfo.save(function(err, healthInfoInfo) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			res.json({healthInfoResult: healthInfoInfo, labtestResult: labtestResultInfo});
		});
	});
}

//直接根据userId和insertTime修改数据, 2017-06-06 GY
exports.updateLabtestResult = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	if (req.body.insertTime == null || req.body.insertTime == '') {
		return res.json({result:'请填写insertTime!'});
	}

	var query = {userId:req.body.userId, insertTime: new Date(req.body.insertTime)};
	var upObj = {};
	if (req.body.SCr != null) {
		upObj['SCr'] = req.body.SCr;
	}
	if (req.body.GFR != null) {
		upObj['GFR'] = req.body.GFR;
	}
	if (req.body.ALB != null) {
		upObj['ALB'] = req.body.ALB;
	}
	if (req.body.PRO != null) {
		upObj['PRO'] = req.body.PRO;
	}
	if (req.body.url != null) {
		upObj['url'] = req.body.url;
	}
	if (req.body.time != null) {
		upObj['time'] = req.body.time;
	}
	if (req.body.description != null) {
		upObj['description'] = req.body.description;
	}

	HealthInfo.updateOne(query, upObj, {new: true}, function(err, upHealthInfo) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upHealthInfo == null) {
			return res.json({result:'修改失败，不存在的记录!'});
		}
		else {
			var query2 = {_id: upHealthInfo.resultId};
			LabtestResult.updateOne(query2, upObj, function(err, upResult){
				if (err) {
					return res.status(500).send(err.message);
				}
				if (upResult == null) {
					return res.json({result:'修改失败，不存在的记录!'});
				}
				else {
					return res.json({result:'修改成功', healthInfoResult: upHealthInfo, labtestResult: upResult});
				}
			}, {new: true});
			// return res.json({result: '修改成功', editResults:upHealthInfo});
		}
	});
}