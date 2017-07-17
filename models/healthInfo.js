
var mongoose = require('mongoose')

var healthInfoSchema = new mongoose.Schema({
  userId: String,
  // type == 'Health_002'时为化验
  type: String,
  insertTime: Date,
  time: Date,
  // 修改原url字段
  // url: [String],
  url: [
    {
      // 图片ID，生成规则：userID+insertTime+url2位下标(U201701012017010112121200)
      photoId: String,
      // 图片实际链接
      photo: String,
      // 图片录入状态，0未录入，1已录入
      status: {type: Number, default: 0},
      photoType: String
      // 图片与数据是一对多的关系
      // resultId: [
      //   {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: 'labtestImport'
      //   }
      // ]
    }
  ],
  label: String,
  description: String,
  comments: String,
  // resultId: {type: mongoose.Schema.Types.ObjectId, ref:'labtestResult'},
  // 数据录入状态，0未录入，1已录入
  importStatus: {type: Number, default: 0},
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var healthInfoModel = mongoose.model('healthInfo', healthInfoSchema)

function HealthInfo (healthInfo) {
  this.healthInfo = healthInfo
}

HealthInfo.prototype.save = function (callback) {
  var healthInfo = this.healthInfo
  var newHealthInfo = new healthInfoModel(healthInfo)
  newHealthInfo.save(function (err, healthInfoItem) {
    if (err) {
      return callback(err)
    }
    callback(null, healthInfoItem)
  })
}

HealthInfo.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  healthInfoModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, healthInfoInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, healthInfoInfo)
    })
}

HealthInfo.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  healthInfoModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, healthInfos) {
      if (err) {
        return callback(err)
      }
      callback(null, healthInfos)
    })
}

HealthInfo.updateOne = function (query, obj, opts, callback, populate) {
  var options = opts || {}
  var _populate = populate || ''

  healthInfoModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, uphealthInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, uphealthInfo)
    })
}

HealthInfo.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  healthInfoModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, uphealthInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, uphealthInfo)
    })
}

HealthInfo.remove = function (query, callback) {
  healthInfoModel
    .remove(query)
    .exec(function (err) {
      callback(err)
    })
}

HealthInfo.removeOne = function (query, callback, opts) {
  var options = opts || {}

  healthInfoModel
    .findOneAndRemove(query, options, function (err, health) {
      if (err) {
        return callback(err)
      }
      callback(null, health)
    })
}

module.exports = HealthInfo
