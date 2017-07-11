
var mongoose = require('mongoose')

var refreshtokenSchema = new mongoose.Schema({
  refreshtoken: String,
  userPayload: String,
  createAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 365  // 默认365天过期
      // expires: 60 * 5  // 默认2 weeks过期
  }
}, {versionKey: false})

var refreshtokenModel = mongoose.model('refreshtoken', refreshtokenSchema)

function Refreshtoken (refreshtoken) {
  this.refreshtoken = refreshtoken
}

Refreshtoken.prototype.save = function (callback) {
  var refreshtoken = this.refreshtoken
  var newRefreshtoken = new refreshtokenModel(refreshtoken)
  newRefreshtoken.save(function (err, refreshtokenItem) {
    if (err) {
      return callback(err)
    }
    callback(null, refreshtokenItem)
  })
}

Refreshtoken.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  refreshtokenModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, refreshtokenInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, refreshtokenInfo)
  })
}

Refreshtoken.removeOne = function (query, callback, opts) {
  var options = opts || {}

  refreshtokenModel
  .findOneAndRemove(query, options, function (err, refreshtokenInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, refreshtokenInfo)
  })
}

module.exports = Refreshtoken
