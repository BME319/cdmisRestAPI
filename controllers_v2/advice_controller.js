// 代码 查询app建议 2017-05-31 GY
// 注释 2017-07-12 YQC

// var config = require('../config')
var commonFunc = require('../middlewares/commonFunc')
var Alluser = require('../models/alluser')
var Advice = require('../models/advice')

// 根据advisorId获取建议
// 注释 输入参数，advisorId；输出结果，相应建议内容
exports.getAdvice = function (req, res) {
  // 建议获取函数参数设置，若请求中userID存在则写入参数
  var query
  var advisorId = req.query.advisorId || null
  if (advisorId == null || advisorId === '') {
    query = {}
  } else {
    query = {userId: advisorId}
  }
  // 调用建议获取函数Advice.getSome，不出错返回建议内容
  Advice.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

// 根据userId创建建议
// 注释 输入参数，userId,role,topic,content；输出结果，创建并保存相应建议内容
exports.postAdvice = function (req, res) {
  var userId = req.session.userId || null
  var role = req.session.role || null

  if (userId == null || userId === '') {
    return res.json({result: '请填写userId!'})
  }
  if (role == null || role === '') {
    return res.json({result: '请填写role!'})
  }

  var query = {userId: userId}
  // 调用用户获取函数User.getOne
  Alluser.getOne(query, function (err, item) {
    // 不出错，用户不存在或角色不匹配返回提示信息
    // 不出错，用户存在且角色匹配则根据请求内容写入建议数据参数
    if (err) {
      return res.status(500).send(err)
    } else if (item == null) {
      return res.json({result: '不存在的用户!'})
    } else if (item.role.indexOf(role) === -1) {
      return res.json({result: '用户与角色不匹配!'})
    } else {
      var adviceData = {
        userId: req.body.userId,
        role: req.body.role,
        time: commonFunc.getNowFormatSecond(),
        topic: req.body.topic,
        content: req.body.content
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
