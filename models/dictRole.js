
var mongoose = require('mongoose')

var dictRoleSchema = new mongoose.Schema({
  code: String,
  name: String,
  sortNo: Number,
  description: String,
  invalidFlag: Number

})

dictRoleModel = mongoose.model('dictRole', dictRoleSchema)

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
  var fields = fields || null
  var populate = populate || ''

  dictRoleModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, item) {
  if (err) {
    return callback(err)
  }
  callback(null, item)
})
}

DictRole.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictRoleModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, items) {
  if (err) {
    return callback(err)
  }
  callback(null, items)
})
}

DictRole.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  dictRoleModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, updata) {
  if (err) {
    return callback(err)
  }
  callback(null, updata)
})
}

module.exports = DictRole
