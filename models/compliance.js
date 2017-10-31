var mongoose = require('mongoose')

var complianceSchema = new mongoose.Schema({
  userId: String,
  type: String,
  code: String,
  date: Date,
  status: Number,
  description: String
})

var ComplianceModel = mongoose.model('compliance', complianceSchema)

function Compliance (compliance) {
  this.compliance = compliance
}

Compliance.prototype.save = function (callback) {
  var compliance = this.compliance
  var newCompliance = new ComplianceModel(compliance)
  newCompliance.save(function (err, complianceItem) {
    if (err) {
      return callback(err)
    }
    callback(null, complianceItem)
  })
}

Compliance.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ComplianceModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, complianceInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, complianceInfo)
  })
}

Compliance.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  ComplianceModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, compliances) {
    if (err) {
      return callback(err)
    }
    callback(null, compliances)
  })
}

Compliance.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ComplianceModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upCompliance) {
    if (err) {
      return callback(err)
    }
    callback(null, upCompliance)
  })
}

Compliance.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  ComplianceModel
    .update(query, obj, options)
    .populate(populate)
    .exec(function (err, upcompliance) {
      if (err) {
        return callback(err)
      }
      callback(null, upcompliance)
    })
}

module.exports = Compliance
