
var mongoose = require('mongoose')

var dictTaskSchema = new mongoose.Schema({
  type: String,
  typeName: String,
  details: [
    { code: String,
  		  name: String,
  		  description: String,
  		  content: String,
      invalidFlag: Number
    }]

})

dictTaskModel = mongoose.model('dictTask', dictTaskSchema)

function DictTask (dictTask) {
  this.dictTask = dictTask
}

DictTask.prototype.save = function (callback) {
  var dictTask = this.dictTask
  var newDictTask = new dictTaskModel(dictTask)
  newDictTask.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictTask.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictTaskModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, item) {
  if (err) {
    return callback(err)
  }
  callback(null, item)
})
}

DictTask.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictTaskModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, items) {
  if (err) {
    return callback(err)
  }
  callback(null, items)
})
}

DictTask.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  dictTaskModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, updata) {
  if (err) {
    return callback(err)
  }
  callback(null, updata)
})
}

module.exports = DictTask
