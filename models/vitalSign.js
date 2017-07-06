
var mongoose = require('mongoose')

var vitalSignSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'patient'},
  type: String,
  code: String,
  date: Date,   // YYYY-MM-DD
  data: [
	  {
	  	_id: 0,
	  	time: Date,
	  	value: Number,
	  	value2: Number
	  }
  ],
  unit: String,
  revisionInfo: {
    operationTime: Date, // HH-MM-SS
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var vitalSignModel = mongoose.model('vitalSign', vitalSignSchema)

function VitalSign (vitalSign) {
  this.vitalSign = vitalSign
}

VitalSign.prototype.save = function (callback) {
  var vitalSign = this.vitalSign
  var newVitalSign = new vitalSignModel(vitalSign)
  newVitalSign.save(function (err, vitalSignItem) {
    if (err) {
      return callback(err)
    }
    callback(null, vitalSignItem)
  })
}

VitalSign.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  vitalSignModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, vitalSignInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, vitalSignInfo)
})
}

VitalSign.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  vitalSignModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, vitalSigns) {
  if (err) {
    return callback(err)
  }
  callback(null, vitalSigns)
})
}

VitalSign.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  vitalSignModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upvitalSign) {
  if (err) {
    return callback(err)
  }
  callback(null, upvitalSign)
})
}

VitalSign.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  vitalSignModel
  	.update(query, obj, options)
  	.populate(populate)
  	.exec(function (err, vitalSign) {
    	if (err) {
      		return callback(err)
    	}
    callback(null, vitalSign)
  })
}

module.exports = VitalSign
