var	config = require('../config'),
  commonFunc = require('../middlewares/commonFunc'),
  User = require('../models/user'),
  Advice = require('../models/advice')

// 根据userId取出意见，或取出所有意见 2017-05-31 GY
exports.getAdvice = function (req, res) {
  if (req.query.userId == null || req.query.userId == '') {
    var query = {}
  } else {
    	var query = {userId: req.query.userId}
  }

  Advice.getSome(query, function (err, item) {
    if (err) {
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: item})
  })
}

// 存入意见 2017-05-31 GY
exports.postAdvice = function (req, res) {
  if (req.body.userId == null || req.body.userId == '') {
    return res.json({result: '请填写userId!'})
  }
  if (req.body.role == null || req.body.role == '') {
    return res.json({result: '请填写role!'})
  }

  var query = {userId: req.body.userId}

  User.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item == null) {
      return res.json({result: '不存在的用户!'})
    } else if (item.role.indexOf(req.body.role) == -1) {
      return res.json({result: '用户与角色不匹配!'})
    } else {
      var adviceData = {
        userId: req.body.userId,
        role: req.body.role,
        time: commonFunc.getNowFormatSecond(),
        topic: req.body.topic,
        content: req.body.content
      }

      var newAdvice = new Advice(adviceData)
      newAdvice.save(function (err, adviceInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        res.json({result: '新建成功', newResults: adviceInfo})
      })
    }
  })
}
