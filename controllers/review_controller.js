var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Doctor = require('../models/doctor'), 
	Team = require('../models/team'), 
	DpRelation = require('../models/dpRelation'), 
	Consultation = require('../models/consultation'), 
	Counsel = require('../models/counsel'), 
	Comment = require('../models/comment'), 
	User = require('../models/user'), 
  Alluser = require('../models/alluser'), 
	commonFunc = require('../middlewares/commonFunc');

var async = require('async')

//保存审核信息 2017-06-27 GY
exports.postReviewInfo = function (req, res) {
  if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'});
  }
  if (req.body.reviewerId === null || req.body.reviewerId === '' || req.body.reviewerId === undefined) {
    return res.status(412).json({results: '请填写reviewerId'});
  }
  var queryReviewer = {userId: req.body.reviewerId};
  Alluser.getOne(queryReviewer, function (err, reviewItem) {
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
exports.getCertificate = function (req, res) {
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

//根据是否审核获取信息列表 2017-06-27 GY
exports.getReviewInfo = function (req, res) {
  if (req.query.reviewStatus === null || req.query.reviewStatus === '' || req.query.reviewStatus === undefined) {
    return res.status(412).json({results: '请填写reviewStatus'});
  }
  else if (Number(req.query.reviewStatus) === 1) {
    var query = {
      $or: [
        {reviewStatus: 1}, 
        {reviewStatus: 2}
      ]
    }
  }
  else if (Number(req.query.reviewStatus) === 0) {
    var query = {reviewStatus: 0};
  }
  else {
    return res.status(412).json({results: '非法输入'});
  }
  var opts = '';
  var fields = {
    'userId':1, 'name':1, 'gender':1, 'birthday':1, 'province':1, 'city':1, 'workUnit':1, 
    'department':1, 'title':1, 'IDNo':1, 'registerTime':1, 'reviewStatus':1, 'reviewDate':1, 
    'reviewerId':1, 'reviewContent':1, 'user_id':1
  };
  var populate = {'path':'reviewerId user_id', 'select':{'userId':1, 'userName':1, 'phoneNo':1}};
  Doctor.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err);
    }
    if (items.length === 0) {
      return res.json({results: []});
    }
    else {
      return res.json({results: items});
      // 下面注释的版本是随便玩玩的不要在意GY
      // var phoneNos = [];
      // // phoneNos = items;
      // var index = 0;
      // function getPhoneNos(index) {
      //   // for (let i = 0; i < items.length; i ++) {
      //     let queryPhone = {userId: items[index].userId};
      //     User.getOne(queryPhone, function (err, userItem) {
      //       if (err) {
      //         return res.status(500).send(err);
      //       }
      //       if (userItem === null) {
      //         return res.status(500).json({results: '请联系管理员检查数据是否出错'});
      //       }
      //       else {
      //         // phoneNos[i] = userItem.phoneNo;
      //         phoneNos.push({phoneNo:userItem.phoneNo, item:items[index]});
      //         // phoneNos.prototype.phoneNo = userItem.phoneNo;
      //         console.log(items[index].phoneNo);
      //         console.log(items[index]);
      //         console.log(typeof(items[index]), typeof(items))
      //         if (index < items.length - 1) {
      //           ++index;
      //           getPhoneNos(index);
      //         }
      //         else {
      //           return res.json({results: items, phoneNos: phoneNos});
      //         }              
      //       }
      //     });
      //     // console.log(phoneNos[i])
      //   // }
      //   // console.log(phoneNos);
      // }
      // getPhoneNos(index);
      // // return res.json({results: 'finish'});
    }
  }, opts, fields, populate);
}