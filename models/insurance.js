var mongoose = require('mongoose')

var insuranceSchema = new mongoose.Schema({
  insuranceId: String,
  title: String,
  objects: String,
  periods: String,
  payway: String,
  advantage: String,
  examples: String,
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var insuranceModel = mongoose.model('insurance', insuranceSchema)

function Insurance (insurance) {
  this.insurance = insurance
}

Insurance.prototype.save = function (callback) {
  var insurance = this.insurance
  var newInsurance = new insuranceModel(insurance)
  newInsurance.save(function (err, insuranceItem) {
    if (err) {
      return callback(err)
    }
    callback(null, insuranceItem)
  })
}

Insurance.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  insuranceModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, insuranceInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, insuranceInfo)
  })
}

Insurance.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  insuranceModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, insurances) {
    if (err) {
      return callback(err)
    }
    callback(null, insurances)
  })
}

Insurance.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  insuranceModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upinsurance) {
    if (err) {
      return callback(err)
    }
    callback(null, upinsurance)
  })
}

module.exports = Insurance
