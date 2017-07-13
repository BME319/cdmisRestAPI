
var	config = require('../config'),
  Counsel = require('../models/counsel'),
  Doctor = require('../models/doctor'),
  Comment = require('../models/comment'),
  Patient = require('../models/patient'),
  Consultation = require('../models/consultation')

// 根据状态、类型、获取咨询问诊信息 2017-03-28 GY
// 暂未实现计数
// status 和type 传入参数
exports.getCounsels = function (req, res) {
	// 查询条件
  var _doctorId = req.body.doctorObject._id
  var _status = req.query.status
  var _type = req.query.type
  var _name = req.query.name
  var _skip = req.query.skip
  var _limit = req.query.limit
  var query

  if (_skip == '' || _skip == undefined) {
    _skip = 0
  }
	// type和status可以为空
  if (_type == null && _status != null) {
    query = {doctorId: _doctorId, status: _status}
  } else if (_type != null && _status == null) {
    query = {doctorId: _doctorId, type: _type}
  } else if (_type == null && _status == null) {
    query = {doctorId: _doctorId}
  } else {
    query = {doctorId: _doctorId, status: _status, type: _type}
  }
	// if(_name!=""&&_name!=undefined){
	// 	query["patientId.name"]=_name;
	// }
  var opts = ''
  var fields = {'_id': 0, 'messages': 0, 'revisionInfo': 0}
	// 关联主表patient获取患者信息
  var populate = {path: 'patientId', select: {'_id': 0, 'revisionInfo': 0, 'doctors': 0}}
	// if(_name!=""&&_name!=undefined){
	// 	populate["match"]={"name":_name};
	// }
	// 模糊搜索
  var nameReg = new RegExp(_name)
  if (_name) {
    populate['match'] = {'name': nameReg}
  }
  console.log(populate)
  Counsel.getSome(query, function (err, item) {
    if (err) {
      		return res.status(500).send(err.errmsg)
    	}
    	var item1 = []
    	for (var i = 0; i < item.length; i++) {
    		if (item[i].patientId != null) {
    			if (_skip > 0)    			{
    				_skip--
    			}    			else {
    				if (_limit === '' || _limit === undefined) {
    					item1.push(item[i])
    				}    				else {
    					if (_limit > 0)    					{
    						item1.push(item[i])
    						_limit--
    					}
    				}
    			}
    		}
    	}
    	res.json({results: item1, count: item1.length})
  }, opts, fields, populate)
}

// 获取患者ID对象(用于咨询问卷方法) 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
  if (req.query.patientId == null || req.query.patientId == '') {
    if (req.body.patientId == null || req.body.patientId == '') {
      return res.json({result: '请填写patientId!'})
    } else {
      req.patientId = req.body.patientId
    }
  }	else {
    req.patientId = req.query.patientId
  }
  var query = {userId: req.patientId}
  Patient.getOne(query, function (err, patient) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (patient == null) {
        	return res.json({result: '不存在的患者ID！'})
    }
    req.body.patientObject = patient
    next()
  })
}
// 获取医生ID对象(用于咨询问卷方法) 2017-04-05 GY
exports.getDoctorObject = function (req, res, next) {
  if (req.query.doctorId == null || req.query.doctorId == '') {
    if (req.body.doctorId == null || req.body.doctorId == '') {
      return res.json({result: '请填写doctorId!'})
    } else {
      req.doctorId = req.body.doctorId
    }
  }	else {
    req.doctorId = req.query.doctorId
  }
  var query = {userId: req.doctorId}
  Doctor.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
        	return res.json({result: '不存在的医生ID！'})
    }
    req.body.doctorObject = doctor
    next()
  })
}
// 提交咨询问卷 2017-04-05 GY
// 增加选填字段 2017-04-13 GY
exports.saveQuestionaire = function (req, res) {
  if (req.body.type == null || req.body.type == '') {
    return res.json({result: '请填写type,咨询=1,问诊=2'})
  }

  var counselData = {
    counselId: req.newId, 						// counselpost01
    patientId: req.body.patientObject._id, 				// p01
    doctorId: req.body.doctorObject._id, 				// doc01
    type: req.body.type,
    time: new Date(),
    status: 1,
		// topic: req.body.topic,
		// content: req.body.content,
		// title: req.body.title,
    sickTime: req.body.sickTime,
		// visited: req.body.visited,
    symptom: req.body.symptom,
    symptomPhotoUrl: req.body.symptomPhotoUrl,
		// description: req.body.description,
		// drugs: req.body.drugs,
		// history: req.body.history,
    help: req.body.help//, 
		// comment: req.body.comment,

		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:"gy",
		// 	userName:"gy",
		// 	terminalIP:"10.12.43.32"
		// }
  }
  if (req.body.hospital != null && req.body.hospital != '') {
    counselData['hospital'] = req.body.hospital
  }
  if (req.body.visitDate != null && req.body.visitDate != '') {
    counselData['visitDate'] = new Date(req.body.visitDate)
  }
  if (req.body.diagnosis != null && req.body.diagnosis != '') {
    counselData['diagnosis'] = req.body.diagnosis
  }
  if (req.body.diagnosisPhotoUrl != null && req.body.diagnosisPhotoUrl != '') {
    counselData['diagnosisPhotoUrl'] = req.body.diagnosisPhotoUrl
  }

  var newCounsel = new Counsel(counselData)
  newCounsel.save(function (err, counselInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({result: '新建成功', results: counselInfo})
  })
}

exports.changeCounselStatus = function (req, res, next) {
  if (req.body.counselId == null || req.body.counselId == '') {
    return res.json({result: '请填写counselId!'})
  }
  var query = {
    counselId: req.body.counselId
  }

  var upObj = {
		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:'',
		// 	userName:'',
		// 	terminalIP:''
		// }
  }
  if (req.body.status != null) {
    upObj['status'] = req.body.status
  }

	// return res.json({query: query, upObj: upObj});
  Counsel.updateOne(query, upObj, function (err, upCounsel) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upCounsel == null) {
      return res.json({result: '修改失败，不存在的counselId！'})
    }
		// res.json({result: '修改成功', editResults:upCounsel});
    else {
			// req.counsel_id = upCounsel._id;
			// req.status = upCounsel.status;
      req.editResults = upCounsel
			// console.log(req.counsel_id, req.status);
      next()
    }
  }, {new: true})
}
exports.changeConsultationStatus = function (req, res) {
  var query = {diseaseInfo: req.editResults._id}
  var upObj = {status: req.editResults.status}
  var opts = {multi: true}

  Consultation.update(query, upObj, function (err, upitems) {
    if (err) {
      res.status(500).send(err.errmsg)
    } else if (upitems.ok == 0) {
      return res.status(500).send('数据库连接失败')
    } else {
      return res.json({result: '修改成功', editResults: req.editResults})
    }
  }, opts)
}

// 根据医生患者获取咨询问诊状态
exports.getStatus = function (req, res, next) {
	// if (req.query.type == null || req.query.type == '') {
	// 	if (req.body.type == null || req.body.type == '') {
	// 		return res.json({result: '请填写type!'});
	// 	}
	// 	else {
	// 		req.type = req.body.type;
	// 	}
	// }
	// else {
	// 	req.type = req.query.type;
	// }
  if (req.body.status === null || req.body.status === '' || req.body.status === undefined) {
    req.body.status = null
  } else {
    req.body.status = parseInt(req.body.status, 10)
  }
	// console.log(req.body.status)

  var query = {
    patientId: req.body.patientObject._id,
    doctorId: req.body.doctorObject._id//, 
		// type:req.type
  }
  if (req.query.type != null) {
    query['type'] = req.query.type
  } else if (req.body.type != null) {
    query['type'] = req.body.type
  }

	// 设置排序规则函数，时间降序
  function sortTime (a, b) {
    return b.time - a.time
  }

  var opts = ''
  var fields = {'_id': 0, 'messages': 0, 'revisionInfo': 0}
  var populate = {path: 'patientId doctorId', select: {'_id': 0, 'userId': 1, 'name': 1}}

  Counsel.getSome(query, function (err, items) {
    if (err) {
      		return res.status(500).send(err.errmsg)
    	}
    	if (items.length == 0) {
    		return res.json({result: '请填写咨询问卷!'})
    	}    	else {
    		var counsels = []
    		counsels = items.sort(sortTime)
    		req.body.counselId = counsels[0].counselId
    		if (req.body.status == null && req.body.changeType == null) {
    			return res.json({result: counsels[0]})
    		}    		else {
    			next()
    		}
    	}
    	// res.json({});
  }, opts, fields, populate)
}

exports.changeCounselType = function (req, res) {
  if (req.body.type == 1 && req.body.changeType === 'true') {
    var query = {
      counselId: req.body.counselId
    }
    var upObj = {
      type: 3
    }
  }	else {
    return res.json({result: '不可更改的类型!'})
  }

	// return res.json({query: query, upObj: upObj});
  Counsel.updateOne(query, upObj, function (err, upCounsel) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upCounsel == null) {
      return res.json({result: '修改失败，不存在的counselId！'})
    }
    res.json({result: '修改成功', editResults: upCounsel})
  }, {new: true})
}

exports.insertCommentScore = function (req, res) {
  var commentData = {
    commentId: req.newId, 						// counselpost01
    patientId: req.body.patientObject._id, 				// p01
    doctorId: req.body.doctorObject._id, 				// doc01
    time: new Date(),
    totalScore: req.body.totalScore,
    content: req.body.content,
    counselId: req.body.counselId
  }

  var newComment = new Comment(commentData)
  newComment.save(function (err, commentInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    var query = {counselId: req.body.counselId}
    var upObj = {comment: req.newId}

    Counsel.updateOne(query, upObj, function (err, upCounsel) {
      if (err) {
        return res.status(422).send(err.message)
      }
      if (upCounsel == null) {
        return res.json({result: '修改失败，不存在的counselId！'})
      }
      res.json({result: '成功', commentresults: commentInfo, CounselResults: upCounsel})
    }, {new: true})
  })
}
