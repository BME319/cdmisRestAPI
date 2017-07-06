var	config = require('../config'),
	Comment = require('../models/comment');

//根据doctorId查询相关评价 2017-03-30 GY 
exports.getCommentsByDoc = function(req, res) {
	//查询条件
	var doctorObject = req.body.doctorObject;
	var query = {doctorId:doctorObject._id};
	//设置参数
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	var populate = {path: 'patientId', select:{'_id':0, 'revisionInfo':0}};

	Comment.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

exports.getCommentsByCounselId = function(req, res) {
	//查询条件
	var _counselId = req.query.counselId;
	var query = {};
	if(_counselId != "" && _counselId != undefined){
		query["counselId"]=_counselId;
	}
	//设置参数
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	// var populate = {path: 'patientId', select:{'_id':0, 'revisionInfo':0}};
	
	Comment.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields);
}