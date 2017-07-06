
var mongoose = require('mongoose')

var dictRamatchSchema = new mongoose.Schema({
  role: String,
  description: String,
  invalidFlag: Number,
  authority: [{
    main: String,
    details: [String]
  }]
})

dictRamatchModel = mongoose.model('dictRamatch', dictRamatchSchema)

function DictRamatch (dictRamatch) {
  this.dictRamatch = dictRamatch
}

DictRamatch.prototype.save = function (callback) {
  var dictRamatch = this.dictRamatch
  var newDictRamatch = new dictRamatchModel(dictRamatch)
  newDictRamatch.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictRamatch.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictRamatchModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, item) {
  if (err) {
    return callback(err)
  }
  callback(null, item)
})
}

DictRamatch.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictRamatchModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, items) {
  if (err) {
    return callback(err)
  }
  callback(null, items)
})
}

DictRamatch.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  dictRamatchModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, updata) {
  if (err) {
    return callback(err)
  }
  callback(null, updata)
})
}

module.exports = DictRamatch
