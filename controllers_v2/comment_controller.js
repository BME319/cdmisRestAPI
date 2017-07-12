// 代码 查询评价 2017-03-30 GY
// 注释 2017-07-12 YQC

// var config = require('../config')
var Comment = require('../models/comment')

// 根据 doctorId 查询评价
exports.getCommentsByDoc = function (req, res) {
  // 提取doctorId
  var doctorObject = req.body.doctorObject
  // 评价获取函数参数设置
  var query = {doctorId: doctorObject._id}
  var opts = ''
  var fields = {'_id': 0, 'revisionInfo': 0}
  var populate = {path: 'patientId', select: {'_id': 0, 'revisionInfo': 0}}

  // 调用评价获取函数Comment.getSome，不出错返回评价内容，出错码500，服务器内部错误？
  Comment.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// 根据 counselId 查询评价
exports.getCommentsByCounselId = function (req, res) {
  // 提取counselId
  var _counselId = req.query.counselId
  // 评价获取函数参数设置
  var query = {}
  // 判断counselId存在则进入参数设置
  if (_counselId !== '' && _counselId !== undefined) {
    query['counselId'] = _counselId
  }
  var opts = ''
  var fields = {'_id': 0, 'revisionInfo': 0}
  // var populate = { path: 'patientId', select: {'_id': 0, 'revisionInfo': 0} }

  // 调用评价获取函数Comment.getSome，不出错返回评价内容，出错码500，服务器内部错误？
  Comment.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields)
}
