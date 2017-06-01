var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor'), 
	DpRelation = require('../models/dpRelation'), 
	commonFunc = require('../middlewares/commonFunc'), 
	Counsel = require('../models/counsel');

//根据userId查询患者详细信息 2017-03-29 GY
//修改：只输出最新的诊断内容 2017-05-14 GY
exports.getPatientDetail = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
	//查询条件
	var _userId = req.query.userId;
	var query = {userId:_userId};
	//输出内容
	var fields = {'_id':0, 'revisionInfo':0, 'doctors':0};
	var populate = {path: 'diagnosisInfo.doctor', select: {'_id':0, 'userId':1, 'name':1, 'workUnit':1, 'department':1}};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	if (item == null) {
    		return res.json({results:item});
    	}
    	else {
    		//输出最新的诊断内容
    		var recentDiagnosis = [];
    		if (item.diagnosisInfo.length != 0) {
    			recentDiagnosis[0] = item.diagnosisInfo[item.diagnosisInfo.length - 1];
    		}
    		//禁止输出item.diagnosisInfo
    		// item.diagnosisInfo = [];
    		return res.json({results: item, recentDiagnosis:recentDiagnosis});
    	}
    	// res.json({results: item});
	}, '', fields, populate);
}


//根据医院和医生姓名（选填）获取医生信息 2017-03-29 GY
exports.getDoctorLists = function(req, res) {
	//查询条件
	var _province = req.query.province;
	var _city = req.query.city;
	var _district = req.query.district;

	var _workUnit = req.query.workUnit;
	var _name = req.query.name;


	var _limit = Number(req.query.limit);
	var _skip = Number(req.query.skip);

	// var query;
	// //name选填
	// if ((_name == null || _name == '') && (_workUnit == null || _workUnit == '')){
	// 	query = {};
	// }
	// else if((_name == null || _name == '') && _workUnit != null){
	// 	query = {workUnit:_workUnit};
	// }
	// else if (_name != null && (_workUnit == null || _workUnit == '')){
	// 	query = {name:_name};
	// }
	// else{
	// 	query = {workUnit:_workUnit, name:_name};
	// }

	var query = {};
	if(_province != ""&&_province!=null)
	{
		query["province"] = _province

	}
	if(_city != ""&&_city!=null)
	{
		query["city"] = _city

	}
	if(_district != ""&&_district!=null)
	{
		query["district"] = _district

	}
	if(_workUnit != ""&&_workUnit!=null)
	{
		query["workUnit"] = _workUnit

	}
	if(_name != ""&&_name!=null)
	{
		query["name"] = _name

	}
	//输出内容


	// if(_limit==null||_limit==)
	var option = {limit:_limit, skip:_skip,sort:-"_id"}
	var fields = {"_id":0, 'revisionInfo':0};

	var populate = '';
	var _workUnitUrl=""
	var _nameUrl=""
	var _limitUrl=""
	var _skipUrl=""
	var _Url=""
	if(_workUnit!=null&&_workUnit!=undefined){
		_workUnitUrl="workUnit="+_workUnit
	}
	if(_name!=null&&_name!=undefined){
		_nameUrl="name="+_name
	}
	if(_limit!=null&&_limit!=undefined){
		_limitUrl="limit="+String(_limit)
	}
	if(_skip!=null&&_skip!=undefined){
		_skipUrl="skip="+String(_skip+_limit)
	}
	if(_workUnitUrl!=""||_nameUrl!=""||_limitUrl!=""||_skipUrl!=""){
		_Url=_Url+"?"
		if(_workUnitUrl!=""){
			_Url=_Url+_workUnitUrl+"&"
		}
		if(_nameUrl!=""){
			_Url=_Url+_nameUrl+"&"
		}
		if(_limitUrl!=""){
			_Url=_Url+_limitUrl+"&"
		}
		if(_skipUrl!=""){
			_Url=_Url+_skipUrl+"&"
		}
		_Url=_Url.substr(0,_Url.length-1)
	}
	var nexturl=webEntry.domain+":"+webEntry.restPort+"/patient/getDoctorLists"+_Url
	Doctor.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}


    	res.json({results: items,nexturl:nexturl});

	}, option, fields, populate);

}

//通过patient表中userId返回PatientObject 2017-03-30 GY 
//修改：增加判断不存在ID情况 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
    var query = { 
        userId: req.query.userId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient == null) {
        	return res.json({result:'不存在的患者ID！'});
        }
        req.body.patientObject = patient;
        next();
    });
};

//获取患者的所有医生 2017-03-30 GY
//2017-04-05 GY 修改：按照要求更换查询表
exports.getMyDoctor = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
	//查询条件
	//var patientObject = req.body.patientObject;
	var _patientId = req.query.userId;
	var query = {userId:_patientId};

	
	var opts = '';
	var fields = {'_id':0, 'doctors':1};
	//通过子表查询主表，定义主表查询路径及输出内容
	var ret = {};
	var populate = {path: 'doctors.doctorId', select: {'_id':0, 'IDNo':0, 'revisionInfo':0, 'teams':0}};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	// console.log(item.doctors.length)
    	for(var i=0;i<item.doctors.length;i++){
    		if(item.doctors[i].invalidFlag==0){
    			ret=item.doctors[i];
    			break;
    		}
    	}
    	res.json({results: ret});
	}, opts, fields, populate);
}

//查询咨询记录 2017-03-30 GY
exports.getCounselRecords = function(req, res) {
	//查询条件
	var patientObject = req.body.patientObject;
	var query = {'patientId':patientObject._id};

	
	var opts = '';
	var fields = {'_id':0, 'doctorId':1, 'time':1, 'messages':1};
	//通过子表查询主表，定义主表查询路径及输出内容	
	var populate = {path: 'doctorId', select: {'_id':0, 'userId':1, 'name':1, 'photoUrl':1}};

	Counsel.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//获取患者ID对象(用于新建患者方法) 2017-04-06 GY
exports.checkPatientId = function (req, res, next) {
	if (req.body.userId == null || req.body.userId == '') {
        return res.json({result:'请填写userId!'});
    }
    var query = { 
        userId: req.body.userId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (patient != null) {
        	return res.json({result:'已存在的患者ID！'});
        }
        //req.body.patientObject = patient;
        next();
    });
};
//新建患者个人信息 2017-04-06 GY
exports.newPatientDetail = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	if (req.body.birthday == null || req.body.birthday =='') {
		return res.json({result:'请填写birthday!'});
	}
	if (req.body.bloodType == null || req.body.bloodType =='') {
		return res.json({result:'请填写bloodType!'});
	}
	if (req.body.hypertension == null || req.body.hypertension =='') {
		return res.json({result:'请填写hypertension!'});
	}
	var patientData = {
		userId:req.body.userId, 
		name:req.body.name, 
		gender:req.body.gender, 
		bloodType:req.body.bloodType, 
		hypertension:req.body.hypertension, 
		allergic:req.body.allergic, 
		class:req.body.class, 
		class_info:req.body.class_info, 
		birthday:new Date(req.body.birthday)//, 
		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:"gy",
		// 	userName:"gy",
		// 	terminalIP:"10.12.43.32"
		// }
	};
	if (req.body.photoUrl != null){
		patientData['photoUrl'] = req.body.photoUrl;
	}
	if (req.body.IDNo != null){
		patientData['IDNo'] = req.body.IDNo;
	}
	if (req.body.height != null){
		patientData['height'] = req.body.height;
	}
	if (req.body.occupation != null){
		patientData['occupation'] = req.body.occupation;
	}
	if (req.body.nation != null){
		patientData['address.nation'] = req.body.nation;
	}
	if (req.body.province != null){
		patientData['address.province'] = req.body.province;
	}
	if (req.body.city != null){
		patientData['address.city'] = req.body.city;
	}
	if (req.body.operationTime != null && req.body.operationTime != ''){
		patientData['operationTime'] = req.body.operationTime;
	}
	if (req.body.lastVisit != null) {
		if (req.body.lastVisit.time != null && req.body.lastVisit.time != ''){
			patientData['lastVisit.time'] = new Date(req.body.lastVisit.time);
		}
		if (req.body.lastVisit.hospital != null){
			patientData['lastVisit.hospital'] = req.body.lastVisit.hospital;
		}
		if (req.body.lastVisit.diagnosis != null){
			patientData['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis;
		}
	}
	//return res.status(200).send(counselData);
	var newPatient = new Patient(patientData);
	newPatient.save(function(err, patientInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({result: '新建成功', results: patientInfo});
	});
}

//修改患者个人信息 2017-04-06 GY
exports.editPatientDetail = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	var query = {
		userId: req.body.userId
	};
	
	var upObj = {
		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:"gy",
		// 	userName:"gy",
		// 	terminalIP:"10.12.43.32"
		// }
	};
	if (req.body.userId != null){
		upObj['userId'] = req.body.userId;
	}
	if (req.body.name != null){
		upObj['name'] = req.body.name;
	}
	if (req.body.photoUrl != null){
		upObj['photoUrl'] = req.body.photoUrl;
	}
	if (req.body.birthday != null && req.body.birthday != ''){
		upObj['birthday'] = new Date(req.body.birthday);
	}
	if (req.body.gender != null){
		upObj['gender'] = req.body.gender;
	}
	if (req.body.IDNo != null){
		upObj['IDNo'] = req.body.IDNo;
	}
	if (req.body.height != null){
		upObj['height'] = req.body.height;
	}
	if (req.body.occupation != null){
		upObj['occupation'] = req.body.occupation;
	}
	if (req.body.bloodType != null){
		upObj['bloodType'] = req.body.bloodType;
	}
	if (req.body.nation != null){
		upObj['address.nation'] = req.body.nation;
	}
	if (req.body.province != null){
		upObj['address.province'] = req.body.province;
	}
	if (req.body.city != null){
		upObj['address.city'] = req.body.city;
	}
	if (req.body.class != null){
		upObj['class'] = req.body.class;
	}
	if (req.body.class_info != null){
		upObj['class_info'] = req.body.class_info;
	}
	if (req.body.operationTime != null && req.body.operationTime != ''){
		upObj['operationTime'] = new Date(req.body.operationTime);
	}
	if (req.body.hypertension != null){
		upObj['hypertension'] = req.body.hypertension;
	}
	if (req.body.allergic != null){
		upObj['allergic'] = req.body.allergic;
	}
	if (req.body.lastVisit != null) {
		if (req.body.lastVisit.time != null && req.body.lastVisit.time != ''){
			upObj['lastVisit.time'] = new Date(req.body.lastVisit.time);
		}
		if (req.body.lastVisit.hospital != null){
			upObj['lastVisit.hospital'] = req.body.lastVisit.hospital;
		}
		if (req.body.lastVisit.diagnosis != null){
			upObj['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis;
		}
	}
	
	//return res.json({query: query, upObj: upObj});
	Patient.updateOne(query, upObj, function(err, upPatient) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upPatient == null) {
			return res.json({result:'修改失败，不存在的患者ID！'})
		}
		res.json({result: '修改成功', results: upPatient});
	}, {new: true});
}

//新增疾病进程
exports.getDoctorObject = function (req, res, next) {
	if (req.body.doctorId == null || req.body.doctorId == '') {
		return res.json({result:'请填写doctorId!'});
	}
    var query = { 
        userId: req.body.doctorId
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (doctor == null) {
        	return res.json({result:'不存在的医生ID！'});
        }
        req.body.doctorObject = doctor;
        next();
    });
}
exports.insertDiagnosis = function(req, res, next) {
	if (req.body.patientId == null || req.body.patientId == '') {
		return res.json({result:'请填写patientId!'});
	}
	var query = {
		userId: req.body.patientId
	};
	
	var diagname = req.body.diagname, 
		diagprogress = req.body.diagprogress, 
		diagcontent = req.body.diagcontent; 

	if (req.body.diagtime == null || req.body.diagtime == '') {
		var diagtime = new Date();
	}
	else {
		var diagtime = new Date(req.body.diagtime); 
	}
	if (req.body.diagoperationTime == null || req.body.diagoperationTime == '') {
		var diagoperationTime = new Date('1900-01-01');
	}
	else {
		var diagoperationTime = new Date(req.body.diagoperationTime); 
	}
	if (req.body.diaghypertension == null || req.body.diaghypertension == '') {
		// 前端定义默认高血压否为2
		var diaghypertension = 2;
	}
	else {
		var diaghypertension = req.body.diaghypertension; 
	}
	
	var upObj = {
		$push: {
			diagnosisInfo: {
				name:diagname, 
				time:diagtime, 
				hypertension:diaghypertension, 
				progress:diagprogress, 
				operationTime:diagoperationTime, 
				content:diagcontent, 
				doctor:req.body.doctorObject._id
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Patient.update(query, upObj, function(err, updiag) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (updiag.nModified == 0) {
			return res.json({result:'未成功修改！请检查输入是否符合要求！', results: updiag});
		}
		// if (updiag.nModified == 1) {
		// 	return res.json({result:'修改成功', results: updiag});
		// }
		// res.json({results: updiag});
		req.body.userId = req.body.patientId;
		req.body.class = diagname;
		req.body.class_info = diagprogress;
		req.body.hypertension = diaghypertension;
		next();
	}, {new: true});
}

//绑定主管医生
//1. 查询当前主管医生并在DPRelation表里解绑（删除）
exports.debindingDoctor = function(req, res, next) {
	if (req.body.patientId == null || req.body.patientId == '') {
		return res.json({result:'请填写patientId!'});
	}
	var query = {userId: req.body.patientId};

	Patient.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	if (item == null) {
    		return res.json({result: '不存在的患者ID！'})
    	}
    	// return res.json({results: item});
    	if (item.doctors.length == 0) {
    		next();
    	}
    	else {
    		for (var i = item.doctors.length - 1; i >= 0; i--) {    			
    			if (item.doctors[i].invalidFlag == 0) {
    				lastDocId = item.doctors[i].doctorId;
    				break;
    			}
    		}
    		var queryDoc = {doctorId:lastDocId};
    		var upObj = {
    			$pull: {
    				patients: {
    					patientId: item._id
    				}
    			}
    		};

    		DpRelation.update(queryDoc, upObj, function(err, upDp) {
    			if (err) {
    				return res.status(500).send(err.errmsg)
    			}
    			// return res.json({resultpull:upDp});
    			if (upDp.n == 0) {
    				// return res.json({result: '未与其他医生或患者建立联系！'});
    				next();
    			}
    			else if (upDp.n == 1 && upDp.nModified == 0) {
    				// return res.json({result: '已删除！请勿重新删除！'});
    				next();
    			}
    			else if (upDp.n == 1 && upDp.nModified != 0) {
    				// return res.json({result: '删除成功'});
    				next();
    			}
    		}, {new: true});
    	}
	});
}
//2. patient表中修改
exports.bindingMyDoctor = function(req, res, next) {
	var _pId=req.body.patientId
	var _dId=req.body.doctorId
	if (_pId == null || _pId == ''|| _pId == undefined) {
		return res.json({result:'请填写patientId!'});
	}
	else if(_dId == null || _dId == ''|| _dId == undefined){
		return res.json({result:'请填写doctorId!'});
	}
	else{
		var queryD = { 
			userId: _dId
		};
		Doctor.getOne(queryD, function (err, doctor) {
			if (err) {
				console.log(err);
				return res.status(500).send('服务器错误, 用户查询失败!');
			}
			if (doctor == null) {
				return res.json({result:'不存在的医生ID！'});
			}
			var doc = doctor._id;
			var query = {
				userId: _pId
			};
			Patient.getOne(query, function (err, patient) {
				if (err) {
					console.log(err);
					return res.status(500).send('服务器错误, 用户查询失败!');
				}
				if (patient == null) {
					return res.json({result:'不存在的患者ID！'});
				}
				var doctorsList=patient.doctors
				var n=doctorsList.length
				// var flag=0
				for(var i=0;i<n;i++){
					doctorsList[i].invalidFlag=1
					// if(doctor.doctorId==_dId){
					// 	flag=1
					// 	doctor.invalidFlag=0
					// }
				}
				// if(flag==1){
				// 	return res.json({result:1,msg:"患者已匹配该主管医生！"});
				// }
				// else{
				var doctor_new={doctorId:doc,firstTime:new Date(),invalidFlag:0}
				doctorsList.push(doctor_new)
				// }
				var upObj = {$set:{doctors:doctorsList}};
				Patient.updateOne(query, upObj,function(err, patient) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					// res.json({results: 0,msg:"success!"});
					req.body.doctor_id = doc;
					req.body.patient_id = patient._id;
					req.body.patientname = patient.name;
					next();
				});
			});
		});
	}
}
//3. DpRelation表中医生绑定患者
exports.bindingPatient = function(req, res, next) {
	var doctorId = req.body.doctor_id;
	var patientId = req.body.patient_id;
	if (req.body.dpRelationTime == null || req.body.dpRelationTime == '') {
		var dpRelationTime = new Date();
	}
	else {
		var dpRelationTime = new Date(req.body.dpRelationTime);
	}
	// return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
	var query = {doctorId: doctorId};

	var upObj = {
		$push: {
			patients: {
				patientId: patientId, 
				dpRelationTime: dpRelationTime
			}
		}
	};

	DpRelation.update(query, upObj, function(err, uprelation) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (uprelation.n == 0) {
			var dpRelationData = {
    			doctorId: doctorId//, 
    // 			revisionInfo:{
				// 	operationTime:new Date(),
				// 	userId:"gy",
				// 	userName:"gy",
				// 	terminalIP:"10.12.43.32"
				// }
    		};
    		//return res.json({result:dpRelationData});
    		var newDpRelation = new DpRelation(dpRelationData);
			newDpRelation.save(function(err, dpRelationInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			DpRelation.update(query, upObj, function(err, updpRelation) {
					if (err) {
						return res.status(422).send(err.message);
					}
					else if (updpRelation.nModified == 0) {
						return res.json({result:'未成功修改！请检查输入是否符合要求！', results: updpRelation, flag:'0'});
					}
					else if (updpRelation.nModified == 1) {
						// return res.json({result:'修改成功', results: updpRelation, flag:'0'});
						req.body.userId = req.body.doctorId;
						req.body.role = 'doctor';
						req.body.postdata = {

  							"template_id":"F5UpddU9v4m4zWX8_NA9t3PU_9Yraj2kUxU07CVIT-M",
  							"url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab9c316b3076535d&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=newsufferer&#wechat_redirect",
  							
        					"data":{
            					"first": {
                					"value":"您好，有一位新患者添加您为他的主管医生。",
                					"color":"#173177"
                				},
                   				"keyword1":{
                       				"value":req.body.patientname,//患者姓名
                       				"color":"#173177"
                   				},
                   				"keyword2": {
                       				"value":commonFunc.getNowFormatSecond(),//添加的时间
                       				"color":"#173177"
                   				},
                   				"remark":{
                       				"value":"感谢您的使用！",
                       				"color":"#173177"
                   				}
           					}
						}
						next();
					}
					// return res.json({result:updpRelation});
				}, {new: true});
			});
		}
		else if (uprelation.nModified == 0) {
			return res.json({result:'未成功修改！请检查输入是否符合要求！', results: uprelation, flag:'1'});
		}
		else if (uprelation.nModified == 1) {
			// return res.json({result:'修改成功', results: uprelation, flag:'1'});
			req.body.userId = req.body.doctorId;
			req.body.role = 'test';
			req.body.postdata = {
				"template_id":"F5UpddU9v4m4zWX8_NA9t3PU_9Yraj2kUxU07CVIT-M",
				"url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab9c316b3076535d&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=newsufferer&#wechat_redirect",
  							
        		"data":{
            		"first": {
                		"value":"您好，有一位新患者添加您为他的主管医生。",
                		"color":"#173177"
                	},
                   	"keyword1":{
                       	"value":req.body.patientname,//患者姓名
                       	"color":"#173177"
                   	},
                   	"keyword2": {
                       	"value":commonFunc.getNowFormatSecond(),//添加的时间
                       	"color":"#173177"
                   	},
                   	"remark":{
                       	"value":"感谢您的使用！",
                       	"color":"#173177"
                   	}
           		}
			}
			// console.log(req.body.postdata);
			next();
		}
		// res.json({results: uprelation});
	}, {new: true});
}

//修改患者VIP状态 2017-05-04 GY
exports.changeVIP = function(req, res) {
	if (req.body.userId == null || req.body.userId == '') {
		return res.json({result:'请填写userId!'});
	}
	var query = {
		userId: req.body.userId
	};
	
	var upObj = {};
	if (req.body.VIP != null){
		upObj['VIP'] = req.body.VIP;
	}

	Patient.updateOne(query, upObj, function(err, upPatient) {
		if (err){
			return res.status(500).send(err.message);
		}
		if (upPatient == null) {
			return res.json({result:'修改失败，不存在的患者ID！'})
		}
		res.json({result: '修改成功', results: upPatient});
	}, {new: true});
}
