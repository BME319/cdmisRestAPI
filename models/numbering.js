var mongoose = require('mongoose')

var numberingSchema = new mongoose.Schema({
  type: Number,
  date: Number,
  number: Number
})

var numberingModel = mongoose.model('numbering', numberingSchema)

function Numbering (numbering) {
  this.numbering = numbering
}

Numbering.prototype.save = function (callback) {
  var numbering = this.numbering
  var newNumbering = new numberingModel(numbering)
  newNumbering.save(function (err, numberingItem) {
    if (err) {
      return callback(err)
    }
    callback(null, numberingItem)
  })
}

Numbering.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  numberingModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, numberingInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, numberingInfo)
})
}

Numbering.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  numberingModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, numberings) {
  if (err) {
    return callback(err)
  }
  callback(null, numberings)
})
}

Numbering.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  numberingModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upnumbering) {
  if (err) {
    return callback(err)
  }
  callback(null, upnumbering)
})
}

module.exports = Numbering
