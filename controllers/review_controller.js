var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Doctor = require('../models/doctor'), 
	Team = require('../models/team'), 
	DpRelation = require('../models/dpRelation'), 
	Consultation = require('../models/consultation'), 
	Counsel = require('../models/counsel'), 
	Comment = require('../models/comment'), 
	User = require('../models/user'), 
	commonFunc = require('../middlewares/commonFunc');

//保存审核信息 2017-06-27 GY
exports.reviewInfo = function (req, res) {
  if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'});
  }
  if (req.body.reviewerId === null || req.body.reviewerId === '' || req.body.reviewerId === undefined) {
    return res.status(412).json({results: '请填写reviewerId'});
  }
  var queryReviewer = {userId: req.body.reviewerId};
  User.getOne(queryReviewer, function (err, reviewItem) {
    if (err) {
      return res.status(500).send(err);
    }
    if (reviewItem === null || reviewItem === undefined || reviewItem === '') {
      return res.status(401).json({results: 'reviewer查找失败'});
    }
    else if (reviewItem.role.indexOf('reviewer') === -1) {
      return res.status(401).json({results:'无审核权限'});
    }
    else {
      var reviewerId = reviewItem._id;
      if (req.body.reviewDate === null || req.body.reviewDate === '' || req.body.reviewDate === undefined) {
        var reviewDate = commonFunc.getNowDate();
      }
      else {
        var reviewDate = req.body.reviewTime;
      }
      if (req.body.reviewStatus == 1 || req.body.reviewStatus == 2) {
        var status = req.body.reviewStatus;
      }
      else {
        return res.status(400).json({results: '无效的审核状态'});
      }
      var queryDoctor = {userId: req.body.doctorId};
      var upObj = {
        reviewStatus: status, 
	      reviewDate: reviewDate, 
	      reviewerId: reviewerId, 
	      reviewContent: req.body.reviewContent, 
      };
      var opts = {new: true};
      Doctor.updateOne(queryDoctor, upObj, function (err, upReview) {
        if (err) {
          return res.status(500).send(err);
        }
        if (upReview === null) {
          return res.status(421).json({results: '不存在的doctorId'});
        }
        else {
          return res.json({results: '审核信息保存成功', editResults: upReview});
        } 
      }, opts);
    }
  });
}

//根据医生ID获取资质证书相关信息 2017-06-27 GY
exports.certificate = function (req, res) {
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'});
  }
  var query = {userId: req.query.doctorId};
  var opts = '';
  var fields = {
    'userId':1, 'name':1, 'certificatePhotoUrl':1, 'description':1, 'major':1
  };
  Doctor.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err);
    }
    if (item === null) {
      return res.status(400).json({results: '不存在的doctorId'});
    }
    else {
      return res.json({results: item});
    }
  }, opts, fields);
}