var	config = require('../config'),
	Team = require('../models/team'), 
	News = require('../models/news');

//根据类型查询消息链接 2017-04-05 GY 
exports.getNews = function(req, res) {

	if (req.query.userId == null || req.query.userId == '') {
		return res.json({result: '请填写userId'});
	}
	// if (req.query.type == null || req.query.type == '') {
	// 	return res.json({resutl: '请填写type'});
	// }

	var userId = req.query.userId;
	var type = req.query.type;

	if (userId == null || userId == '') {
        return res.json({result:'请填写userId!'});
    }

	var query = {"$or":[{userId:userId},{sendBy:userId}]};

	if (type != '' && type != undefined) {
        query["type"] = type
    }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};

	News.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, opts);
}

exports.getNewsByReadOrNot = function(req, res) {

	if (req.query.userId == null || req.query.userId == '') {
		return res.json({result: '请填写userId'});
	}
	if (req.query.readOrNot == null || req.query.readOrNot == '') {
		return res.json({resutl: '请填写readOrNot'});
	}

	var userId = req.query.userId;
	var type = req.query.type;
	var _readOrNot = req.query.readOrNot;
	if (userId == null || userId == '') {
        return res.json({result:'请填写userId!'});
    }

	var query = {userId:userId,readOrNot:_readOrNot};

	if (type != '' && type != undefined) {
        query["type"] = type
    }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
	var opts = {'sort':'-_id'};

	News.getSome(query, function(err, items) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: items});
	}, opts);
}

function insertOneNews(userId,sendBy,req,res) {
	// if (req.body.userId == null || req.body.userId == '') {
	// 	return res.json({result: '请填写userId'});
	// }
	// if (req.body.sendBy == null || req.body.sendBy == '') {
	// 	return res.json({result: '请填写sendBy'});
	// }
	// if (req.body.readOrNot == null || req.body.readOrNot == '') {
	// 	return res.json({resutl: '请填写readOrNot'});
	// }
	// var readOrNot = 0;
	// return res.json({messageId:req.newId})
	// console.log("11");
	// var ret=1;

	var newData = {
		// userId: req.body.userId,
		// sendBy: req.body.sendBy,
		userId: userId,
		sendBy: sendBy,
		readOrNot: req.body.readOrNot
	};
	var query1 = {
		userId:userId,
		sendBy:sendBy
	};
	var query2 = {
		sendBy:userId,
		userId:sendBy
	};
	if (req.body.type != null){
		newData['type'] = req.body.type;
		query1['type'] = req.body.type;
		query2['type'] = req.body.type;
	}
	if (req.body.messageId != null){
		newData['messageId'] = req.body.messageId;
	}
	if (req.body.time != null && req.body.time != ''){
		newData['time'] = new Date(req.body.time);
	}
	else {
		newData['time'] = new Date();
	}
	if (req.body.title != null){
		newData['title'] = req.body.title;
	}
	if (req.body.description != null){
		newData['description'] = req.body.description;
	}
	if (req.body.url != null){
		newData['url'] = req.body.url;
	}

	// return res.json({messageData:messageData})

	News.getOne(query1, function(err, item1) {
        if (err) {
        	if(res!=undefined){
        		return res.status(500).send(err.errmsg);}
            // return 500;
        }
        if(item1==null){
        	// console.log(123);
    		News.getOne(query2, function(err, item2) {
		        if (err) {
		        	if(res!=undefined){
		            return res.status(500).send(err.errmsg);}
		            // return 500;
		        }
		        if(item2==null){
		        	//insert
		        	var newnew = new News(newData);
					newnew.save(function(err, newInfo) {
						if (err) {
							if(res!=undefined){
					  		return res.status(500).send(err.errmsg);}
					  		// return 500;
						}
						var newResults = newInfo;
						if(res!=undefined){
						res.json({result:'新建成功', newResults: newResults});}
						// return 0;
					});
		        }
		        else{
		        	//update query2
		        	News.update(query2,newData, function(err, upmessage) {
						if (err){
							if(res!=undefined){
							return res.status(422).send(err.message);}
							// return 422;
						}
						
						if (upmessage.n != 0 && upmessage.nModified == 0) {
							if(res!=undefined){
							return res.json({result:'未修改！请检查修改目标是否与原来一致！', results: upmessage});
							}
							// return 1;
						}
						if (upmessage.n != 0 && upmessage.nModified != 0) {
							if (upmessage.n == upmessage.nModified) {
								if(res!=undefined){
								return res.json({result:'全部更新成功', results: upmessage});
								}
								// return 0;
							}
							if(res!=undefined){
							return res.json({result: '未全部更新！', results: upmessage});
							}
							// return 2;
						}
						
					});
		        }
		    });
        }
        else{
        	//update query1
			//return res.json({query: query, upObj: upObj});
			News.update(query1, newData, function(err, upmessage) {
				if (err){
					if(res!=undefined){
					return res.status(422).send(err.message);
					}
					// return 422;
				}
				
				if (upmessage.n != 0 && upmessage.nModified == 0) {
					if(res!=undefined){
					return res.json({result:'未修改！请检查修改目标是否与原来一致！', results: upmessage});
					}
					// return 1;
				}
				if (upmessage.n != 0 && upmessage.nModified != 0) {
					if (upmessage.n == upmessage.nModified) {
						if(res!=undefined){
							return res.json({result:'全部更新成功', results: upmessage});
						}
						// return 0;
					}
					if(res!=undefined){
					return res.json({result: '未全部更新！', results: upmessage});
					}
					// return 2;
				}
				
			});
        	// res.json({results: item});
        }
    });
}
exports.insertNews = function(req, res) {
	if (req.body.userId === null || req.body.userId === '') {
		return res.json({result: '请填写userId'});
	}
	if (req.body.sendBy === null || req.body.sendBy === '') {
		return res.json({result: '请填写sendBy'});
	}
	if (req.body.readOrNot === null || req.body.readOrNot === '') {
		return res.json({resutl: '请填写readOrNot'});
	}
	var userId=req.body.userId;
	var sendBy=req.body.sendBy;
	return insertOneNews(userId,sendBy,req,res);
	// console.log(status_code);
	// if(status_code === 0){
	// 	return res.json({result:'全部更新成功'});
	// }
	// if(status_code === 1){
	// 	return res.json({result:'未修改！请检查修改目标是否与原来一致！'});
	// }
	// if(status_code === 2){
	// 	return res.json({result: '未全部更新！'});
	// }
	// if(status_code === 422){
	// 	return res.status(422).send(422);
	// }
	// if(status_code === 500){
	// 	return res.status(500).send(500);
	// }

}
exports.insertTeamNews = function(req, res) {
	if (req.body.userId === null || req.body.userId === '') {
		return res.json({result: '请填写userId'});
	}
	if (req.body.sendBy === null || req.body.sendBy === '') {
		return res.json({result: '请填写sendBy'});
	}
	if (req.body.type === null || req.body.type === '') {
		return res.json({resutl: '请填写type'});
	}
	var userId=req.body.userId;
	var sendBy=req.body.sendBy;
	req.body.readOrNot=1;
	insertOneNews(userId,sendBy,req, res);
	req.body.readOrNot=0;
	var TeamId=userId;
	var query = { 
        teamId: TeamId
    };
    var DocId;
    //req.body.status = _status;
    Team.getOne(query, function (err, team1) {
        if (err) {
            console.log(err);
            // return res.status(500).send('服务器错误, 用户查询失败!');
            return 500;
        }
        if (team1 == null) {
			var TeamId=req.body.type;
			var query = { 
			    teamId: TeamId
			};
			//req.body.status = _status;
			Team.getOne(query, function (err, team2) {
			    if (err) {
			        console.log(err);
			        // return res.status(500).send('服务器错误, 用户查询失败!');
			        return 500;
			    }
			    if (team2 == null) {
			    	// return res.json({result:'不存在的teamId!'})
			    	return 1;
			    }
			    else{
				    //sendMesg
				    Doctors=team2.members;
				    Doctors.push({"userId":team2.sponsorId});
				    console.log(Doctors);
			        for(var i=0;i<Doctors.length;i++)
			        {
			        	DocId=Doctors[i].userId;
			        	if(DocId!=req.body.sendBy){
			        		insertOneNews(DocId,userId,req);
			        	}
			        }
			    }
			});
        }
        else{
	        //sendMesg
	        Doctors=team1.members;
		    Doctors.push({"userId":team1.sponsorId});
	        for(var i=0;i<Doctors.length;i++)
	        {
	        	DocId=Doctors[i].userId;
	        	if(DocId!=req.body.sendBy){
	        		insertOneNews(DocId,userId,req);
	        	}
	        }
	    }
    });
	
}