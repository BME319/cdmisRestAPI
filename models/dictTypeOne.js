
var mongoose = require('mongoose')

var dictTypeOneSchema = new mongoose.Schema({
  category: String,
  details: [
    { code: String,
      name: String,
      inputCode: String,
      description: String,
      invalidFlag: Number
    }
  ]
})

var dictTypeOneModel = mongoose.model('dictTypeOne', dictTypeOneSchema)

function DictTypeOne (dictTypeOne) {
  this.dictTypeOne = dictTypeOne
}

DictTypeOne.prototype.save = function (callback) {
  var dictTypeOne = this.dictTypeOne
  var newDictTypeOne = new dictTypeOneModel(dictTypeOne)
  newDictTypeOne.save(function (err, dictTypeOneItem) {
    if (err) {
      return callback(err)
    }
    callback(null, dictTypeOneItem)
  })
}

DictTypeOne.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictTypeOneModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dictTypeOneItem) {
    if (err) {
      return callback(err)
    }
    callback(null, dictTypeOneItem)
  })
}

DictTypeOne.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictTypeOneModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dictTypeOneItems) {
    if (err) {
      return callback(err)
    }
    callback(null, dictTypeOneItems)
  })
}

DictTypeOne.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dictTypeOneModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, updata) {
    if (err) {
      return callback(err)
    }
    callback(null, updata)
  })
}

module.exports = DictTypeOne
