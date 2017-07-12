// 代码 查询建议 2017-05-31 GY
// 注释 2017-07-12 YQC

// var config = require('../config')
var commonFunc = require('../middlewares/commonFunc')
var User = require('../models/user')
var Advice = require('../models/advice')

// 根据userId获取建议
exports.getAdvice = function (req, res) {
  // 建议获取函数参数设置，若请求中userID存在则写入参数
  var query
  var _id = req.session.userId
  if (_id == null || _id === '') {
    query = {}
  } else {
    query = {userId: _id}
  }
  // 调用建议获取函数Advice.getSome，不出错返回建议内容，出错码500，服务器内部错误？
  Advice.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

// 根据userId创建建议
exports.postAdvice = function (req, res) {
  var _id = req.session.userId
  var _role = req.session.role

  if (_id == null || _id === '') {
    return res.json({result: '请填写userId!'})
  }
  if (_role == null || _role === '') {
    return res.json({result: '请填写role!'})
  }

  var query = {userId: _id}
  // 调用用户获取函数User.getOne
  User.getOne(query, function (err, item) {
    // 出错码500，服务器内部错误？
    // 不出错，用户不存在或角色不匹配返回提示信息
    // 不出错，用户存在且角色匹配则根据请求内容写入建议数据参数
    if (err) {
      return res.status(500).send(err)
    } else if (item == null) {
      return res.json({result: '不存在的用户!'})
    } else if (item.role.indexOf(_role) === -1) {
      return res.json({result: '用户与角色不匹配!'})
    } else {
      var adviceData = {
        userId: _id,
        role: _role,
        time: commonFunc.getNowFormatSecond(),
        topic: req.session.topic,
        content: req.session.content
      }

      // 将建议内容保存
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
