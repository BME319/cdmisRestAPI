var HealthInfo = require('../models/healthInfo')
var LabtestImport = require('../models/labtestImport')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')

exports.insertLabtest = function (req, res) {
    async.auto({
      getUser: function (callback) {
          dataGatherFunc.userIDbyPhone(req.body.phoneNo, 'patient', function (err, item) {
          return callback(err, item)
          })
      },
      insertLab: ['getUser', function (results, callback) {
        if (results.getUser.status === 0) {
          let labtestId = req.body.id
          let userId = results.getUser.userId
          let time = req.body.time
          time = new Date(time)
          let type = req.body.type
          let value = req.body.value
          let url = req.body.url || ''
          let unit = req.body.unit
          let query = {labtestId: labtestId}
          let obj = {userId: userId, time: time, type: type, value: value, unit: unit}
          if (url !== '') {
            obj['photoId'] = url
          }
          LabtestImport.updateOne(query, obj, function (err, upforum) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              callback(null, {status: 0, msg: 'labtestImport接收成功'})
            }
          }, {upsert: true}) 
        } else if (results.getUser.status === -1) {
          callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
        } else {
          callback(null, {status: 1, msg: '系统错误'})
        }
      }],
      traceRecord: ['insertLab', function (results, callback) {
          let params = req.body
          let outputs = {status: results.insertLab.status, msg: results.insertLab.msg}
          dataGatherFunc.traceRecord(req.body.phoneNo, 'labtestImport', params, outputs, function (err, item) {
          return callback(err, item)
          })
      }]
    }, function (err, results) {
      if (err) {
          return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
          return res.json(results.insertLab)
      } else {
          return res.json({msg: 'Server Error!', status: 1})
      }
      })
}

exports.editLabtest = function (req, res) {
    async.auto({
      getUser: function (callback) {
          dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
          return callback(err, item)
          })
      },
      editLab: ['getUser', function (results, callback) {
        if (results.getUser.status === 0) {
          let labtestId = req.body.id
          let userId = results.getUser.userId
          let time = req.body.time
          time = new Date(time)
          let type = req.body.type
          let value = req.body.value
          let unit = req.body.unit
          let query = {labtestId: labtestId}
          let obj = {$set:{userId: userId, time: time, type: type, value: value, unit: unit}}
          LabtestImport.updateOne(query, obj, function (err, upforum) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              callback(null, {status: 0, msg: 'labtestImport/edit接收成功'})
            }
          }, {upsert: true}) 
        } else if (results.getUser.status === -1) {
          callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
        } else {
          callback(null, {status: 1, msg: '系统错误'})
        }
      }],
      traceRecord: ['editLab', function (results, callback) {
          let params = req.body
          let outputs = {status: results.editLab.status, msg: results.editLab.msg}
          dataGatherFunc.traceRecord(req.body.phoneNo, 'labtestImport/edit', params, outputs, function (err, item) {
          return callback(err, item)
          })
      }]
    }, function (err, results) {
      if (err) {
          return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
          return res.json(results.editLab)
      } else {
          return res.json({msg: 'Server Error!', status: 1})
      }
      })
}