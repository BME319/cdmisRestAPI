// 代码 2017-05-31 GY
// 功能 getAdvice-查询app建议 postAdvice-创建app建议
// 注释 2017-07-17 YQC

// var config = require('../config')
var commonFunc = require('../middlewares/commonFunc')
var Alluser = require('../models/alluser')
var Advice = require('../models/advice')

// 注释 管理员根据advisorId获取建议
// 注释 输入参数，advisorId；输出结果，相应用户的建议内容或所有建议内容
exports.getAdvice = function (req, res) {
  // 参数设置 若请求中advisorId存在则写入query，查询该用户提出的建议；不填写则query为空，查询所有用户建议
  let advisorId = req.query.advisorId || null
  let query = {userId: advisorId}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item == null && advisorId != null) {
      return res.json({result: '不存在的用户!'})
    } else if (item == null && advisorId == null) {
      query = {}
    }
    // 调用建议获取函数Advice.getSome，不出错则返回相应建议内容
    Advice.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err)
      }
      res.json({results: items})
    })
  })
}

// 用户创建建议
// 注释 承接tokenVerify中的session.userId/role，输入参数，topic，content；输出结果，创建并保存相应建议内容
exports.postAdvice = function (req, res) {
  // 参数设置 将userId写入query
  let userId = req.session.userId || null
  let role = req.session.role || null
  let query = {userId: userId}
  let topic = req.body.topic || null
  let content = req.body.content || null
  if (topic === null || content === null) {
    return res.status(412).json({results: '请填写topic,content'})
  }
  // 调用用户获取函数Alluser.getOne
  Alluser.getOne(query, function (err, item) {
    // 用户不存在或角色不匹配返回错误提示信息
    // 用户存在且角色匹配则根据请求内容写入建议数据参数
    if (err) {
      return res.status(500).send(err)
    } else if (item == null) {
      return res.json({result: '不存在的用户!'})
    } else if (item.role.indexOf(role) === -1) {
      return res.json({result: '用户与角色不匹配!'})
    } else {
      let queryA = {userId: req.session.userId, topic: topic, content: content}
      Advice.getOne(queryA, function (err, item) {
        if (err) {
          return res.status(500).send(err)
        } else if (item === null) {
          let adviceData = {
            userId: req.session.userId,
            role: req.session.role,
            time: commonFunc.getNowFormatSecond(),
            topic: topic,
            content: content
          }

          // 将建议内容保存
          var newAdvice = new Advice(adviceData)
          newAdvice.save(function (err, adviceInfo) {
            if (err) {
              return res.status(500).send(err)
            }
            res.json({result: '新建成功', newResults: adviceInfo})
          })
        } else {
          return res.json({results: '该建议已存在'})
        }
      })
    }
  })
}
