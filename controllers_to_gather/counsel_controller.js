var Comment = require('../models/comment')
// var Counsel = require('../models/counsel')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')
exports.insertCommentScore = function (req, res) {
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
      if (results.getPatient.status !== 1 && results.getDoctor.status !== 1) {
        let commentData = {
          commentId: req.newId,
          patientId: results.getPatient._id,
          doctorId: results.getDoctor._id,
          time: new Date(),
          totalScore: req.body.totalScore * 2, // 0-5转换为0-10
          content: req.body.content // ,
          // counselId: req.body.counselId
        }
        let newComment = new Comment(commentData)
        newComment.save(function (err, commentInfo) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: '评价成功'})
          }
          // let query = {counselId: req.body.counselId}
          // let upObj = {comment: req.newId}
          // Counsel.updateOne(query, upObj, function (err, upCounsel) {
          //   if (err) {
          //     return res.status(422).send(err.message)
          //   }
          //   if (upCounsel == null) {
          //     return res.json({result: '修改失败，不存在的counselId！'})
          //   }
          //   res.json({result: '成功', commentresults: commentInfo, CounselResults: upCounsel})
          // }, {new: true})
        })
      } else {
        callback(null, {status: 1, msg: '用户不存在，获取用户ID失败'})
      }
    }],
    traceRecord: ['insertScore', function (results, callback) {
      let params = req.body
      let outputs = {status: results.insertScore.status, msg: results.insertScore.msg}
      dataGatherFunc.traceRecord(req.body.PhoneNo, 'counsel/commentScore', params, outputs, function (err, item) {
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
