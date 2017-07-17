// 代码 2017-03-30 GY
// 功能 getCommentsByDoc-根据doctorId查询评价 getCommentsByCounselId-根据counselId查询评价
// 注释 2017-07-17 YQC

// var config = require('../config')
var Comment = require('../models/comment')
var Alluser = require('../models/alluser')

// 获取医生ID对象，并添加自动转发标记 2017-07-15 GY
exports.getDoctorObject = function (req, res, next) {
  let doctorId = req.body.doctorId || req.query.doctorId || null
  if (doctorId === null) {
    return res.status(412).json({results: '请填写doctorId'})
  } else {
    req.doctorId = doctorId
  }
  let query = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctor === null) {
      return res.status(404).json({results: '不存在的医生ID'})
    } else {
      if (doctor.autoRelay === 1) {
        req.body.autoRelayFlag = 1
        req.body.relayTarget = doctor.relayTarget
      }
      req.body.doctorObject = doctor
      next()
    }
  })
}

// 注释 患者根据doctorId查询医生评价
// 注释 承接doctorObject._id；输出结果，相应医生的评价
exports.getCommentsByDoc = function (req, res) {
  // 参数设置 隐藏患者ID信息
  let doctorObject = req.body.doctorObject
  let query = {doctorId: doctorObject._id}
  let opts = ''
  let fields = {'_id': 0, 'revisionInfo': 0}
  let populate = {path: 'patientId', select: {'_id': 0, 'revisionInfo': 0}}

  // 调用评价获取函数Comment.getSome，不出错返回评价内容，出错码500，服务器内部错误？
  Comment.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// 注释 ；输入，counselId;输出，相应评价条目
exports.getCommentsByCounselId = function (req, res) {
  // 参数设置 判断counselId则进入查询参数设置
  let _counselId = req.query.counselId || null
  let query = {}
  if (_counselId !== null) {
    query['counselId'] = _counselId
  }
  let opts = ''
  let fields = {'_id': 0, 'revisionInfo': 0}
  // let populate = { path: 'patientId', select: {'_id': 0, 'revisionInfo': 0} }

  // 调用评价获取函数Comment.getSome，不出错返回评价内容，出错码500，服务器内部错误？
  Comment.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item.length === 0) {
      return res.status(404).json({results: '不存在的咨询ID'})
    } else {
      res.json({results: item})
    }
  }, opts, fields)
}
