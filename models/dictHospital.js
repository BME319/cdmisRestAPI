
var mongoose = require('mongoose')

var dictHospitalSchema = new mongoose.Schema({
  locationCode: String,
  hospitalCode: String,
  hospitalName: String,
  province: String,
  city: String,
  district: String,
  alias: String,
  inputCode: String
})

dictHospitalModel = mongoose.model('dictHospital', dictHospitalSchema)

function DictHospital (dictHospital) {
  this.dictHospital = dictHospital
}

DictHospital.prototype.save = function (callback) {
  var dictHospital = this.dictHospital
  var newDictHospital = new dictHospitalModel(dictHospital)
  newDictHospital.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

DictHospital.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictHospitalModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, item) {
  if (err) {
    return callback(err)
  }
  callback(null, item)
})
}

DictHospital.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  dictHospitalModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, items) {
  if (err) {
    return callback(err)
  }
  callback(null, items)
})
}

DictHospital.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  dictHospitalModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, updata) {
  if (err) {
    return callback(err)
  }
  callback(null, updata)
})
}

module.exports = DictHospital
