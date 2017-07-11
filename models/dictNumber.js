var mongoose = require('mongoose')

var dictNumberSchema = new mongoose.Schema({
  type: Number,
  initStr: String,
  dateFormat: String,
  seqLength: Number,
  alphamericFlag: Number,
  description: String
})

var dictNumberModel = mongoose.model('dictNumber', dictNumberSchema)

function DictNumber (dictNumber) {
  this.dictNumber = dictNumber
}

DictNumber.prototype.save = function (callback) {
  var dictNumber = this.dictNumber
  var newDictNumber = new dictNumberModel(dictNumber)
  newDictNumber.save(function (err, dictNumberItem) {
    if (err) {
      return callback(err)
    }
    callback(null, dictNumberItem)
  })
}

DictNumber.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dictNumberModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dictNumberInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, dictNumberInfo)
  })
}

DictNumber.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  dictNumberModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dictNumbers) {
    if (err) {
      return callback(err)
    }
    callback(null, dictNumbers)
  })
}

DictNumber.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dictNumberModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, updictNumber) {
    if (err) {
      return callback(err)
    }
    callback(null, updictNumber)
  })
}

module.exports = DictNumber
