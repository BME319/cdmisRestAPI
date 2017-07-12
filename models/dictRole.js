
var mongoose = require('mongoose')

var dictRoleSchema = new mongoose.Schema({
  code: String,
  name: String,
  sortNo: Number,
  description: String,
  invalidFlag: Number

})

var dictRoleModel = mongoose.model('dictRole', dictRoleSchema)

function DictRole (dictRole) {
  this.dictRole = dictRole
}

DictRole.prototype.save = function (callback) {
  var dictRole = this.dictRole
  var newDictRole = new dictRoleModel(dictRole)
  newDictRole.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictRole.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictRoleModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictRole.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictRoleModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, items) {
    if (err) {
      return callback(err)
    }
    callback(null, items)
  })
}

DictRole.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dictRoleModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, updata) {
    if (err) {
      return callback(err)
    }
    callback(null, updata)
  })
}

module.exports = DictRole
