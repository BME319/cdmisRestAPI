var VitalSign = require('../models/vitalSign')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')

exports.insertvitalSign = function (req, res) {
    async.auto({
      getUser: function (callback) {
          dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
          return callback(err, item)
          })
      },
      insertvital: ['getUser', function (results, callback) {
        if (results.getUser.status === 0) {
          let patientId = results.getUser._id
          let date = req.body.date
          date = new Date(date)
          let datatime = req.body.datatime
          datatime = new Date(datatime)
          let type = req.body.type
          let datavalue = req.body.datavalue
          let code = req.body.code
          let unit = req.body.unit
          let query = {date: date, patientId: patientId, code: code}
          let obj = {}
          if (code === '血压'){
            let datavalue2 = req.body.datavalue2
            obj = {$set:{type: type, code: code, unit: unit}, $push:{data: {time: datatime, value1: datavalue, value2: datavalue2}}}
          } else {
            obj = {$set:{type: type, code: code, unit: unit}, $push:{data: {time: datatime, value: datavalue}}}
          }
          VitalSign.updateOne(query, obj, function (err, upforum) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              callback(null, {status: 0, msg: 'vitalSign/vitalSign接收成功'})
            }
          }, {upsert: true}) 
        } else if (results.getUser.status === -1) {
          callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
        } else {
          callback(null, {status: 1, msg: '系统错误'})
        }
      }],
      traceRecord: ['insertvital', function (results, callback) {
          let params = req.body
          let outputs = {status: results.insertvital.status, msg: results.insertvital.msg}
          dataGatherFunc.traceRecord(req.body.phoneNo, 'vitalSign/vitalSign', params, outputs, function (err, item) {
          return callback(err, item)
          })
      }]
    }, function (err, results) {
      if (err) {
          return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
          return res.json(results.insertvital)
      } else {
          return res.json({msg: 'Server Error!', status: 1})
      }
      })
}