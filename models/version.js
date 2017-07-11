
var mongoose = require('mongoose')

var versionSchema = new mongoose.Schema({
  versionId: { type: String,	require: true},
  versionType: {type: String, require: true},
  versionName: { type: String,	require: true},
  time: Date,
  content: { type: String,	require: true}
})

var versionModel = mongoose.model('version', versionSchema)

function Version (version) {
  this.version = version
}

Version.prototype.save = function (callback) {
  var version = this.version
  var newVersion = new versionModel(version)
  newVersion.save(function (err, versionItem) {
    if (err) {
      return callback(err)
    }
    callback(null, versionItem)
  })
}

Version.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  versionModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, versionInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, versionInfo)
})
}

Version.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  versionModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, versions) {
  if (err) {
    return callback(err)
  }
  callback(null, versions)
})
}

Version.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  versionModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upversion) {
  if (err) {
    return callback(err)
  }
  callback(null, upversion)
})
}

Version.update = function (query, obj, callback, opts, populate) {
  	var options = opts || {}
  	var populate = populate || ''

  	versionModel
  		.update(query, obj, options)
  		.populate(populate)
  		.exec(function (err, upversion) {
    		if (err) {
      			return callback(err)
    		}
    		callback(null, upversion)
  		})
}

module.exports = Version
