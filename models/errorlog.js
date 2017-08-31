
var mongoose = require('mongoose')

var errorlogSchema = new mongoose.Schema({
  fieldInfo: String,
  userInfo: String,
  inputInfo: String,
  errorInfo: String,
  errorTime: Date

})

errorlogModel = mongoose.model('errorlog', errorlogSchema)

function Errorlog (errorlog) {
  this.errorlog = errorlog
}

Errorlog.prototype.save = function (callback) {
  var errorlog = this.errorlog
  var newErrorlog = new errorlogModel(errorlog)
  newErrorlog.save(function (err, errorlogItem) {
    if (err) {
      return callback(err)
    }
    callback(null, errorlogItem)
  })
}

Errorlog.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  errorlogModel
    .findOne(query, fields, opts)
    .populate(populate)
    .exec(function (err, errorlogInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, errorlogInfo)
    })
}

Errorlog.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  errorlogModel
    .find(query, fields, options)
    .populate(populate)
    .exec(function (err, errorlogs) {
      if (err) {
        return callback(err)
      }
      callback(null, errorlogs)
    })
}

Errorlog.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  errorlogModel
    .findOneAndUpdate(query, obj, options)
    .populate(populate)
    .exec(function (err, uperrorlog) {
      if (err) {
        return callback(err)
      }
      callback(null, uperrorlog)
    })
}

Errorlog.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  errorlogModel
    .update(query, obj, options)
    .populate(populate)
    .exec(function (err, uperrorlog) {
      if (err) {
        return callback(err)
      }
      callback(null, uperrorlog)
    })
}

module.exports = Errorlog
