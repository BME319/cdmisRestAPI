var	config = require('../config'),
  webEntry = require('../settings').webEntry,
  Alluser = require('../models/alluser'), 
  commonFunc = require('../middlewares/commonFunc');

var async = require('async')

//保存审核信息 2017-07-05 GY
exports.postReviewInfo = function (req, res) {
  if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'});
  }
  if (req.body.adminId === null || req.body.adminId === '' || req.body.adminId === undefined) {
    return res.status(412).json({results: '请填写adminId'});
  }
  var queryAdmin = {userId: req.body.adminId};
  Alluser.getOne(queryAdmin, function (err, reviewItem) {
    if (err) {
      return res.status(500).send(err);
    }
    if (reviewItem === null || reviewItem === undefined || reviewItem === '') {
      return res.status(401).json({results: 'admin查找失败'});
    }
    else if (reviewItem.role.indexOf('admin') === -1) {
      return res.status(401).json({results:'无审核权限'});
    }
    else {
      var adminId = reviewItem._id;
      if (req.body.reviewDate === null || req.body.reviewDate === '' || req.body.reviewDate === undefined) {
        var reviewDate = commonFunc.getNowDate();
      }
      else {
        var reviewDate = req.body.reviewDate;
      }
      if (req.body.reviewStatus === 1 || req.body.reviewStatus === 2) {
        var status = req.body.reviewStatus;
      }
      else {
        return res.status(400).json({results: '无效的审核状态'});
      }
      var queryDoctor = {userId: req.body.doctorId};
      
      Alluser.getOne(queryDoctor, function (err, doctorItem) {
        if (err) {
          return res.status(500).send(err);
        }
        var upObj = {
          reviewStatus: status, 
          reviewDate: reviewDate, 
          adminId: adminId
        };
        if (req.body.reviewContent !== null && req.body.reviewContent !== '' && req.body.reviewContent !== undefined) {
            upObj['reviewContent'] = req.body.reviewContent;
        }
        var opts = {
          new: true, 
          fields: {
            'class_info':0, 'VIP':0, 'doctors':0, 'diagnosisInfo':0
          }
        };
        Alluser.updateOne(queryDoctor, upObj, function (err, upReview) {
          if (err) {
            return res.status(500).send(err);
          }
          if (upReview === null) {
            return res.status(404).json({results: '不存在的doctorId'});
          }
          else {
            return res.json({results: '审核信息保存成功', editResults: upReview});
          } 
        }, opts);
      });
    }
  });
}

//根据医生ID获取资质证书相关信息 2017-07-05 GY
exports.getCertificate = function (req, res) {
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'});
  }
  var query = {userId: req.query.doctorId};
  var opts = '';
  var fields = {
    'userId':1, 'name':1, 'gender':1, 'certificatePhotoUrl':1, 'description':1, 'major':1, 'role':1
  };
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err);
    }
    if (item === null) {
      return res.status(404).json({results: '不存在的userId'});
    }
    else if (item.role.indexOf('doctor') === -1) {
      return res.status(404).json({results: 'userId存在但角色不是doctor'})
    }
    else {
      return res.json({results: item});
    }
  }, opts, fields);
}

//根据是否审核获取信息列表 2017-07-05 GY
exports.getReviewInfo = function (req, res) {
  if (req.query.reviewStatus === null || req.query.reviewStatus === '' || req.query.reviewStatus === undefined) {
    return res.status(412).json({results: '请填写reviewStatus'});
  }
  else if (Number(req.query.reviewStatus) === 1) {
    var query = {
      $or: [
        {reviewStatus: 1}, 
        {reviewStatus: 2}
      ], 
      role: 'doctor'
    }
  }
  else if (Number(req.query.reviewStatus) === 0) {
    var query = {reviewStatus: 0, role: 'doctor'};
  }
  else {
    return res.status(412).json({results: '非法输入'});
  }

  if (req.query.limit === undefined) {
    var limit = 0;
  }
  else {
    var limit = Number(req.query.limit);
  }
  if (req.query.skip === undefined) {
    var skip = 0;
  }
  else {
    var skip = Number(req.query.skip);
  }
  
  var opts = {limit: limit, skip:skip};
  var fields = {
    'userId':1, 'name':1, 'gender':1, 'birthday':1, 'province':1, 'city':1, 'workUnit':1, 
    'department':1, 'title':1, 'IDNo':1, 'reviewStatus':1, 'reviewDate':1, 
    'adminId':1, 'reviewContent':1, 'phoneNo':1, 'role':1, 'creationTime':1
  };
  var populate = {'path':'adminId', 'select':{'userId':1, 'name':1}};

  var _Url = '';
	var reviewStatusUrl = 'reviewStatus=' + req.query.reviewStatus;
	var limitUrl = '';
	var skipUrl = '';

	if (limit !== 0 || skip !== 0) {
		limitUrl = 'limit=' + String(limit);
    skipUrl = 'skip=' + String(skip + limit);
	}
	if (reviewStatusUrl != '' || limitUrl != '' || skipUrl != '') {
		_Url = _Url + '?';
		if (reviewStatusUrl != '') {
			_Url = _Url + reviewStatusUrl + '&';
		}
		if (limitUrl != '') {
			_Url = _Url + limitUrl + '&';
		}
		if (skipUrl != '') {
			_Url = _Url + skipUrl + '&';
		}
		_Url = _Url.substr(0, _Url.length - 1)
	}
	nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v2/review/reviewInfo' + _Url; 

  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err);
    }
    if (items.length === 0) {
      return res.json({results: []});
    }
    else {
      return res.json({results: items, nexturl: nexturl});
    }
  }, opts, fields, populate);
}