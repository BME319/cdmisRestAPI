
var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Communication = require('../models/communication'), 
	Counsel = require('../models/counsel'), 
	Team = require('../models/team'), 
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor'), 
	Consultation = require('../models/consultation'), 
	DpRelation = require('../models/dpRelation'),
	request = require('request');

//根据counselId获取counsel表除messages外的信息 2017-03-31 GY 
exports.getCounselReport = function(req, res) {
	if (req.query.counselId == null || req.query.counselId == '') {
        return res.json({result:'请填写counselId!'});
    }
	//查询条件
	var _counselId = req.query.counselId;
	var query = {counselId:_counselId};

	//设置参数
	var opts = '';
	var fields = {'_id':0, 'messages':0, 'revisionInfo':0};
	var populate = {path: 'doctorId patientId', select:{'_id':0, 'userId':1, 'name':1}};

	Counsel.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//根据teamId获取team表所有信息 2017-03-31 GY 
exports.getTeam = function(req, res) {
	if (req.query.teamId == null || req.query.teamId == '') {
        return res.json({result:'请填写teamId!'});
    }
	//查询条件
	var _teamId = req.query.teamId;
	var query = {teamId:_teamId};

	//设置参数
	var opts = '';
	var fields = {'_id':0, 'revisionInfo':0};
	var populate = '';

	Team.getOne(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	}, opts, fields, populate);
}

//新建组 2017-04-06 GY
exports.newTeam = function(req, res) {
	var teamData = {
		// teamId: req.newId,
		teamId: req.body.teamId,						
		name: req.body.name, 
		sponsorId: req.body.sponsorId, 
		sponsorName: req.body.sponsorName, 
		sponsorPhoto: req.body.sponsorPhoto, 
		photoAddress: req.body.photoAddress, 
		// members: [
	 //  		{
	 //  			userId: String, 
	 //  			name: String
	 //  		}
		// ], 
		// time: new Date(), 
		description: req.body.description, 
		// number: req.body., 

		revisionInfo:{
			operationTime:new Date(),
			userId:"gy",
			userName:"gy",
			terminalIP:"10.12.43.32"
		}
	};
	if (req.body.time == null || req.body.time == '') {
		teamData['time'] = new Date();
	}
	else {
		teamData['time'] = new Date(req.body.time);
	}
	
	var newTeam = new Team(teamData);
	newTeam.save(function(err, teamInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({result:'新建成功', newResults: teamInfo});
	});
}

exports.deleteTeam = function(req, res) {
	var _teamId=req.body.teamId
    var query = {teamId:_teamId};
    Team.remove(query, function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
    res.json({result:0,msg:'delete success', data: item});
	});
}

//新建会诊 2017-04-06 GY
exports.checkTeam = function (req, res, next) {
	if (req.body.teamId == null || req.body.teamId == '') {
        return res.json({result:'请填写teamId!'});
    }
    var query = { 
        teamId: req.body.teamId
    };
    Team.getOne(query, function (err, team) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 团队查询失败!');
        }
        if (team == null) {
        	return res.json({result:'不存在的teamID！'});
        }
        req.body.teamObject = team;
        next();
    });
};

exports.checkCounsel = function (req, res, next) {
	if (req.body.counselId == null || req.body.counselId == '') {
        return res.json({result:'请填写counselId!'});
    }
    var query = { 
        counselId: req.body.counselId
    };
    Counsel.getOne(query, function (err, counsel) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 咨询信息查询失败!');
        }
        if (counsel == null) {
        	return res.json({result:'不存在的counselID！'});
        }
        req.body.diseaseInfo = counsel;
        next();
    });
};
exports.checkPatient = function (req, res, next) {
	if (req.body.patientId == null || req.body.patientId == '') {
        return res.json({result:'请填写patientId!'});
    }
    var query = { 
        userId: req.body.patientId
    };
    Patient.getOne(query, function (err, patient) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 患者查询失败!');
        }
        if (patient == null) {
        	return res.json({result:'不存在的patientID！'});
        }
        req.body.patientObject = patient;
        next();
    });
};
exports.checkDoctor = function (req, res, next) {
	if (req.body.sponsorId == null || req.body.sponsorId == '') {
        return res.json({result:'请填写sponsorId!'});
    }
    var query = { 
        userId: req.body.sponsorId
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 医生查询失败!');
        }
        if (doctor == null) {
        	return res.json({result:'不存在的doctorID！'});
        }
        req.body.sponsorObject = doctor;
        next();
    });
};
exports.newConsultation = function(req, res) {

	if (req.body.status == null || req.body.status == '') {
		//无status参数传入时，自动设置为进行中，定义为1
		var status = 1;
	}
	else {
		var status = req.body.status;
	}

	var consultationData = {
		// consultationId: req.newId,
		consultationId: req.body.consultationId,						
		sponsorId: req.body.sponsorObject._id, 
		patientId: req.body.patientObject._id, 
		time: new Date(), 
		diseaseInfo: req.body.diseaseInfo._id, 
		status:status,
		// messages: [
	 //  	  {
	 //  		sender: String, 
	 //  		receiver: String, 
	 //  		time: Date, 
	 //  		content: String
	 //  	  }
		// ], 
		// conclusion: String, 
		teamId: req.body.teamObject._id//, 

		// revisionInfo:{
		// 	operationTime:new Date(),
		// 	userId:"gy",
		// 	userName:"gy",
		// 	terminalIP:"10.12.43.32"
		// }
	};
	
	var newConsultation = new Consultation(consultationData);
	newConsultation.save(function(err, consultationInfo) {
		if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: consultationInfo});
	});
}

//根据ID获取consultation
exports.getConsultation = function(req, res) {
	if (req.query.consultationId == null || req.query.consultationId == '') {
        return res.json({result:'请填写consultationId!'});
    }
    var query = {
		consultationId: req.query.consultationId
	};
	var opts = '';
	var fields = '';
	var populate = {
		'path': 'patientId diseaseInfo sponsorId', 
		'select': {
			'diagnosisInfo':0, 'doctors':0, 'revisionInfo':0
		}
	}
	Consultation.getOne(query, function(err, item) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (item == null) {
			return res.json({result:'不存在的consultationId!'});
		}
		res.json({result: item});
	}, fields, opts, populate);
}

//根据consultationId更新conclusion 2017-04-06 GY
exports.conclusion = function(req, res) {
	if (req.body.consultationId == null || req.body.consultationId == '') {
        return res.json({result:'请填写consultationId!'});
    }
    if (req.body.conclusion == null || req.body.conclusion == '') {
        return res.json({result:'请填写conclusion!'});
    }
    if (req.body.status == null || req.body.status == '') {
    	//无status参数传入时，自动设置为已完成
    	var status = 0;
    }
    else {
    	var status = req.body.status;
    }

	var query = {
		consultationId: req.body.consultationId
	};
	
	var upObj = {
		conclusion: req.body.conclusion, 
		status: status
	};
	//return res.json({query: query, upObj: upObj});
	Consultation.updateOne(query, upObj, function(err, upConclusion) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upConclusion == null) {
			return res.json({result:'更新结论失败'});
		}
		res.json({result:'更新结论成功', results: upConclusion});
	}, {new: true});
}

//给team表中members字段增加组员 2017-04-06 GY
exports.insertMember = function(req, res, next) {
	if (req.body.teamId == null || req.body.teamId == '') {
        return res.json({result:'请填写teamId!'});
    }
	var query = {
		teamId: req.body.teamId
	};
	
	var upObj = {
		$addToSet: {
			members: {
				$each: req.body.members
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Team.update(query, upObj, function(err, upmember) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upmember.nModified == 0 && upmember.n == 0) {
            return res.json({result:'未成功修改！请检查输入是否符合要求！', results:upmember});
        }
		if (upmember.nModified == 0 && upmember.n != 0) {
            return res.json({result:'未成功修改！请检查是否成员已添加！', results:upmember});
        }
        if (upmember.nModified != 0) {
            // return res.json({result:'新建或修改成功', results:upmember});
            next();
        }
		// res.json({results: upmember});
	}, {new: true});
}
//更新成员数量
exports.updateNumber = function(req, res) {
	var query = {teamId: req.body.teamId};
	Team.getOne(query, function (err, team) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 团队查询失败!');
        }

        number = team.members.length + 1;

        var upObj = {number: number}; 

        Team.updateOne(query, upObj, function(err, upteam) {
        	if (err){
				return res.status(422).send(err.message);
			}
			else {
				return res.json({result: '更新成员成功', results: upteam});
			}
        }, {new:true});
        // res.json({results:team});
    });
}

//删除team表中members字段指定组员 2017-04-06 GY
exports.removeMember = function(req, res, next) {
	if (req.body.teamId == null || req.body.teamId == '') {
        return res.json({result:'请填写teamId!'});
    }
	var query = {
		teamId: req.body.teamId
	};
	
	var upObj = {
		$pull: {
			members: {
				userId:req.body.membersuserId
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	Team.update(query, upObj, function(err, upmember) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (upmember.n == 0 && upmember.nModified == 0) {
			return res.json({result:'未成功移除，请检查组是否存在！', results: upmember})
		}
		if (upmember.n != 0 && upmember.nModified == 0) {
			return res.json({result:'未成功移除，请检查成员是否存在！', results: upmember})
		}
		if (upmember.nModified != 0) {
			// return res.json({result:'移除成功', results: upmember});
			next();
		}

		// res.json({results: upmember});
	}, {new: true});
}

//更新医生与医生的最后交流时间
exports.getDoctor1Object = function (req, res, next) {
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
        	return res.json({result:'不存在的doctorId！'});
        }
        req.body.doctorObject = doctor;
        next();
    });
};
exports.getDoctor2Object = function (req, res, next) {
	if (req.body.doctorId2 == null || req.body.doctorId2 == '') {
		return res.json({result:'请填写doctorId2!'});
	}
    var query = { 
        userId: req.body.doctorId2
    };
    Doctor.getOne(query, function (err, doctor) {
        if (err) {
            console.log(err);
            return res.status(500).send('服务器错误, 用户查询失败!');
        }
        if (doctor == null) {
        	return res.json({result:'不存在的doctorId2！'});
        }
        req.body.doctor2Object = doctor;
        next();
    });
};
exports.removeDoctor = function(req, res, next) {
	var query = {
		doctorId: req.body.doctorObject._id
	};
	
	var upObj = {
		$pull: {
			doctors: {
				doctorId:req.body.doctor2Object._id
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	DpRelation.update(query, upObj, function(err, updpRelation) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (updpRelation.n == 0) {
			// return res.json({result: updpRelation});
			var dpRelationData = {
    			doctorId: req.body.doctorObject._id
    		};
    		//return res.json({result:dpRelationData});
    		var newDpRelation = new DpRelation(dpRelationData);
			newDpRelation.save(function(err, dpRelationInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			// return res.json({result: dpRelationInfo});
    			next();
			});
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 0) {
		 	// return res.json({result:'未成功移除，请检查成员是否存在！', results: updpRelation})
		 	next();
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 1) {
			// return res.json({result:'移除成功', results: updpRelation})
			next();
		}
		
	}, {new: true});
}
exports.removeDoctor2 = function(req, res, next) {
	var query = {
		doctorId: req.body.doctor2Object._id
	};
	
	var upObj = {
		$pull: {
			doctors: {
				doctorId:req.body.doctorObject._id
			}
		}
	};
	//return res.json({query: query, upObj: upObj});
	DpRelation.update(query, upObj, function(err, updpRelation) {
		if (err){
			return res.status(422).send(err.message);
		}
		if (updpRelation.n == 0) {
			// return res.json({result: updpRelation});
			var dpRelationData = {
    			doctorId: req.body.doctor2Object._id
    		};
    		//return res.json({result:dpRelationData});
    		var newDpRelation = new DpRelation(dpRelationData);
			newDpRelation.save(function(err, dpRelationInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			// return res.json({result: dpRelationInfo});
    			next();
			});
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 0) {
		 	// return res.json({result:'未成功移除，请检查成员是否存在！', results: updpRelation})
		 	next();
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 1) {
			// return res.json({result:'移除成功', results: updpRelation})
			next();
		}
		
	}, {new: true});
}
exports.updateLastTalkTime2 = function(req, res, next) {

	var query = {
		doctorId: req.body.doctor2Object._id
	};
	
	var upObj = {
		$addToSet:{
			doctors:{
				doctorId:req.body.doctorObject._id, 
				lastTalkTime:new Date(req.body.lastTalkTime)
			}
		}
	};

	//return res.json({query: query, upObj: upObj});
	DpRelation.update(query, upObj, function(err, updpRelation) {
		if (err){
			return res.status(422).send(err.message);
		}
		
		if (updpRelation.n != 0 && updpRelation.nModified == 0) {
			// return res.json({result:'', results: updpRelation})
			next();
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 1) {
			// return res.json({result:'更新成功', results: updpRelation})
			next();
		}
		
	});
}
exports.updateLastTalkTime = function(req, res) {

	var query = {
		doctorId: req.body.doctorObject._id
	};
	
	var upObj = {
		$addToSet:{
			doctors:{
				doctorId:req.body.doctor2Object._id, 
				lastTalkTime:new Date(req.body.lastTalkTime)
			}
		}
	};

	//return res.json({query: query, upObj: upObj});
	DpRelation.update(query, upObj, function(err, updpRelation) {
		if (err){
			return res.status(422).send(err.message);
		}
		
		if (updpRelation.n != 0 && updpRelation.nModified == 0) {
			return res.json({result:'', results: updpRelation})
		}
		if (updpRelation.n != 0 && updpRelation.nModified == 1) {
			return res.json({result:'更新成功', results: updpRelation})
		}
		
	}, {new: true});
}

//根据ID及type存储交流记录 2017-04-21 GY 
exports.postCommunication = function(req, res) {
	
	var commmunicationData = {
		messageNo:req.newId,
		messageType: req.body.messageType, 
		sendBy: req.body.sendBy, 
		receiver: req.body.receiver, 
		sendDateTime: req.body.content.createTimeInMillis, 
		content: req.body.content
	};
	

	var newCommunication = new Communication(commmunicationData);
	newCommunication.save(function(err, communicationInfo) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}

        var msg=communicationInfo.content;
        // do not save into news

        if(msg.contentType == 'custom' && (msg.content.type == 'count-notice'||msg.content.type == 'counsel-upgrade')){

        	return res.json({result:'新建成功', newResults: communicationInfo});
        }
        if(msg.targetType=='single'){
        	console.log("111");
            request({
                url:'http://' + webEntry.domain + ':4050/new/insertNews',
                method:'POST',
                body:bodyGen(msg,communicationInfo['messageNo']),
                json:true
            },function(err,response){
                if(err) return res.status(500).send(err);
                return res.json({result:'新建成功', newResults: communicationInfo});
            });
        }else{
            request({
                url:'http://' + webEntry.domain + ':4050/new/insertTeamNews',
                method:'POST',
                body:bodyGen(msg,communicationInfo['_id']),
                json:true
            },function(err,response){
                // console.log('err');
                // console.log(err);
                // console.log('res');
                // console.log(response);
                if(err) return res.status(500).send(err);
                return res.json({result:'新建成功', newResults: communicationInfo});
            });
        }

    	// res.json({result:'新建成功', newResults: communicationInfo});
	});
}
// exports.postCommunication = function(req, res) {
	
// 	var commmunicationData = {
// 		messageType: req.body.messageType, 
// 		sendBy: req.body.sendBy, 
// 		receiver: req.body.receiver, 
// 		sendDateTime: req.body.content.createTimeInMillis, 
// 		content: req.body.content
// 	};
	

// 	var newCommunication = new Communication(commmunicationData);
// 	newCommunication.save(function(err, communicationInfo) {
// 		if (err) {
//       		return res.status(500).send(err.errmsg);
//     	}
//     	res.json({result:'新建成功', newResults: communicationInfo});
// 	});
// }

//根据ID及type获取交流记录 2017-04-21 GY 
exports.getCommunication = function(req, res) {

	var messageType = Number(req.query.messageType);
	var id1 = req.query.id1;
	var id2 = req.query.id2;

	var limit = Number(req.query.limit);
	var skip = Number(req.query.skip);

	var opts = {limit: limit, skip:skip, sort:'-_id'};

	var _Url = '';
	var messageTypeUrl = 'messageType=' + String(messageType);
	var id1Url = 'id1=' + id1;
	var id2Url = 'id2=' + id2;
	var limitUrl = '';
	var skipUrl = '';

	if (limit != null && limit != undefined) {
		limitUrl = 'limit=' + String(limit);
	}
	if (skip != null && skip != undefined) {
		skipUrl = 'skip=' + String(skip + limit);
	}
	if (messageTypeUrl != '' || id1Url != '' || id2Url != '' || limitUrl != '' || skipUrl != '') {
		_Url = _Url + '?'
		if (messageTypeUrl != '') {
			_Url = _Url + messageTypeUrl + '&';
		}
		if (id1Url != '') {
			_Url = _Url + id1Url + '&';
		}
		if (id2Url != '') {
			_Url = _Url + id2Url + '&';
		}
		if (limitUrl != '') {
			_Url = _Url + limitUrl + '&';
		}
		if (skipUrl != '') {
			_Url = _Url + skipUrl + '&';
		}
		_Url = _Url.substr(0, _Url.length - 1)
	}
	var nexturl = webEntry.domain + ':' + webEntry.restPort + '/communication/getCommunication' + _Url

	if (messageType === 2) {
		var query = {receiver: id2};

		Communication.getSome(query, function(err, items) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (items.length == 0){
				return res.json({results: '没有更多了!'});
			}
			else {
				return res.json({results: items, nexturl: nexturl});
			}
		}, opts);
	}
	else if (messageType === 1) {
		var query = {
			$or: [
				{sendBy: id1, receiver: id2}, 
				{sendBy: id2, receiver: id1}
			]
		};

		Communication.getSome(query, function(err, items) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (items.length == 0){
				return res.json({results: '没有更多了!'});
			}
			else {
				return res.json({results: items, nexturl: nexturl});
			}
		}, opts);
	}
}

function isID(str){
    var pat = /^[DUP][0-9]{12}$/;
    if(pat.test(str)) return str;
    return null;
}
function bodyGen(msg,MESSAGE_ID){
    // type define 4 种
    // 11:医-患
    // 12:医-医
    // 13:医-团队
    // teamId as type:医-会诊
    var msgType=msg.contentType,
        isSingle = msg.targetType=='single',
        receiver=msg.targetID,
        sender =  isID(msg.fromID) || isID(msg.fromName),
        content = {},
        desc='';

    var body={
        userId:receiver,
        sendBy:sender,
        type:msg.newsType,
        title:'',
        description:'',
        readOrNot:0,
        url:'',
        messageId:MESSAGE_ID //从post communication/postCommunication response取
    }
    if(msgType=='custom'){
        if(msg.content.contentStringMap){
            msgType=msg.content.contentStringMap.type;
            // content=JSON.parse(msg.content.contentStringMap);
        }else{
            msgType=msg.content.type;
            // content = msg.content;
        }
        // msgType=content.type;
    }
    //body.description
    switch(msgType){
        case 'text':desc=msg.content.text;break;
        case 'image':desc='[图片]';break;
        case 'voice':desc='[语音]';break;
        case 'card':desc = isSingle?'[咨询消息]':'[会诊消息]';break;
        case 'contact':desc='[联系人名片]';break;
        case 'endl':desc='[咨询结束]';break;
        default:break;
    }
    // if(!isSingle) desc=msg.fromName + ':' +desc;
    body.description=desc;
    //body.title
    if(isSingle){
    	var twoUser={};
    	twoUser[msg.fromID]=msg.targetName;
    	twoUser[msg.targetID]=msg.fromName;
    	body.title=JSON.stringify(twoUser);
    }
    else body.title = msg.targetName;

    // var sendInfo={
    // 	userId:msg.fromID,
    // 	name:msg.fromName
    // }
    body.url = JSON.stringify(msg);
    return body;
}