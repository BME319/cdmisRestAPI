var HealthInfo = require('../models/healthInfo')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')

exports.insertHealthInfo = function (req, res) {
  async.auto({
    getUser: function (callback) {
        dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
        return callback(err, item)
        })
    },
    insertHealth: ['getUser', function (results, callback) {
      if (results.getUser.status === 0) {
        let Id = req.body.Id
        let userId = results.getUser.userId
        let time = req.body.time
        time = new Date(time)
        let type = req.body.type
        let label = req.body.label
        let url = req.body.url
        let description = req.body.description
        let query = {Id: Id}
        let obj = {userId: userId, time: time, type: type, label: label, url: url, description: description}
        HealthInfo.updateOne(query, obj, {upsert: true}, function (err, upforum) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'healthInfo/healthInfo接收成功'})
          }
        }) 
      } else {
        callback(null, {status: 1, msg: '系统错误,接收失败'})
      }
    }],
    traceRecord: ['insertHealth', function (results, callback) {
        let params = req.body
        let outputs = {status: results.insertHealth.status, msg: results.insertHealth.msg}
        dataGatherFunc.traceRecord(req.body.phoneNo, 'healthInfo/healthInfo', params, outputs, function (err, item) {
        return callback(err, item)
        })
    }]
  }, function (err, results) {
    if (err) {
        return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
        return res.json(results.insertHealth)
    } else {
        return res.json({msg: 'Server Error!', status: 1})
    }
    })
}

exports.deleteHealthInfo = function (req, res) {
    async.auto({
      getUser: function (callback) {
          dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
          return callback(err, item)
          })
      },
      deleteHealth: ['getUser', function (results, callback) {
        if (results.getUser.status === 0) {
          let Id = req.body.Id
          let userId = results.getUser.userId
          let query = {Id: Id, userId: userId}
          HealthInfo.removeOne(query, function (err, item1) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              callback(null, {status: 0, msg: 'healthInfo/deleteHealthDetail接收成功'})
            }
          })
        } else {
          callback(null, {status: 1, msg: '系统错误,接收失败'})
        }
      }],
      traceRecord: ['deleteHealth', function (results, callback) {
          let params = req.body
          let outputs = {status: results.deleteHealth.status, msg: results.deleteHealth.msg}
          dataGatherFunc.traceRecord(req.body.phoneNo, 'healthInfo/deleteHealthDetail', params, outputs, function (err, item) {
          return callback(err, item)
          })
      }]
    }, function (err, results) {
      if (err) {
          return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
          return res.json(results.deleteHealth)
      } else {
          return res.json({msg: 'Server Error!', status: 1})
      }
    })
}