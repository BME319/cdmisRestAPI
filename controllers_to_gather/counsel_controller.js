var Comment = require('../models/comment')
var Counsel = require('../models/counsel')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')
exports.insertCommentScore = function (req, res) {
  let patientPhoneNo = req.body.phoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let totalScore = req.body.totalScore || null
  let content = req.body.content || null
  if (patientPhoneNo === null || doctorPhoneNo  === null || totalScore  === null || content  === null || typeof totalScore !== 'number') {
    return res.json({msg: '请检查输入,phoneNo/doctorPhoneNo/totalScore/content', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    getDoctor: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.doctorPhoneNo, 'doctor', function (err, item) {
        return callback(err, item)
      })
    },
    insertScore: ['getPatient', 'getDoctor', function (results, callback) {
      if (results.getPatient.status === 0 && results.getDoctor.status === 0) {
        dataGatherFunc.getSeriesNo(3, function (err, num) {
          if (err) {
            callback(null, {status: 1, msg: '系统错误,接收失败'})
          } else {
            let commentData = {
              commentId: num,
              patientId: results.getPatient._id,
              doctorId: results.getDoctor._id,
              time: new Date(),
              totalScore: totalScore * 2, // 0-5转换为0-10
              content: content
            }
            let newComment = new Comment(commentData)
            newComment.save(function (err, commentInfo) {
              if (err) {
                callback(null, {status: 1, msg: err})
              } else {
                callback(null, {status: 0, msg: 'counsel/commentScore接收成功'})
              }
            })
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else if (results.getDoctor.status === -1) {
        callback(null, {status: 1, msg: '用户（医生）不存在，请检查doctorPhoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['insertScore', function (results, callback) {
      let params = req.body
      let outputs = results.insertScore
      dataGatherFunc.traceRecord(req.body.phoneNo, 'counsel/commentScore', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.insertScore)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.saveQuestionnaire = function (req, res) {
  let patientPhoneNo = req.body.phoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let type = req.body.type || null
  let help = req.body.help || null
  if (patientPhoneNo === null || doctorPhoneNo  === null || type  === null) {
    return res.json({msg: '请检查输入,phoneNo/doctorPhoneNo/type/help', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    getDoctor: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.doctorPhoneNo, 'doctor', function (err, item) {
        return callback(err, item)
      })
    },
    questionnaire: ['getPatient', 'getDoctor', function (results, callback) {
      if (results.getPatient.status === 0 && results.getDoctor.status === 0) {
        dataGatherFunc.getSeriesNo(2, function (err, num) {
          if (err) {
            callback(null, {status: 1, msg: '系统错误,接收失败'})
          } else {
            let counselData = {
              counselId: num,
              patientId: results.getPatient._id,
              doctorId: results.getDoctor._id,
              time: new Date(),
              type: type,
              help: help,
              status: 1
            }
            var newCounsel = new Counsel(counselData)
            newCounsel.save(function (err, counselInfo) {
              if (err) {
                callback(null, {status: 1, msg: err})
              } else {
                callback(null, {status: 0, msg: 'counsel/questionnaire接收成功'})
              }
            })
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else if (results.getDoctor.status === -1) {
        callback(null, {status: 1, msg: '用户（医生）不存在，请检查doctorPhoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['questionnaire', function (results, callback) {
      let params = req.body
      let outputs = results.questionnaire
      dataGatherFunc.traceRecord(req.body.phoneNo, 'counsel/questionnaire', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.questionnaire)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}
