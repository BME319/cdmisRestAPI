
var mongoose = require('mongoose')

var dictAuthoritySchema = new mongoose.Schema({
  code: String,
  name: String,
  sortNo: Number,
  description: String,
  invalidFlag: Number,

  details: [{
    code: String,
    name: String,
    sortNo: Number,
    description: String,
    invalidFlag: Number
  }]

})

var dictAuthorityModel = mongoose.model('dictAuthority', dictAuthoritySchema)

function DictAuthority (dictAuthority) {
  this.dictAuthority = dictAuthority
}

DictAuthority.prototype.save = function (callback) {
  var dictAuthority = this.dictAuthority
  var newDictAuthority = new dictAuthorityModel(dictAuthority)
  newDictAuthority.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictAuthority.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictAuthorityModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictAuthority.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictAuthorityModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, items) {
    if (err) {
      return callback(err)
    }
    callback(null, items)
  })
}

DictAuthority.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dictAuthorityModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, updata) {
    if (err) {
      return callback(err)
    }
    callback(null, updata)
  })
}

module.exports = DictAuthority
