
var mongoose = require('mongoose')

var visitInfoSchema = new mongoose.Schema({
  userId: String,
  visitId: String,
  time: Date,
  hospital: String,
  diagnosis: String,
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

visitInfoModel = mongoose.model('visitInfo', visitInfoSchema)

function VisitInfo (visitInfo) {
  this.visitInfo = visitInfo
}

VisitInfo.prototype.save = function (callback) {
  var visitInfo = this.visitInfo
  var newVisitInfo = new visitInfoModel(visitInfo)
  newVisitInfo.save(function (err, visitInfoItem) {
    if (err) {
      return callback(err)
    }
    callback(null, visitInfoItem)
  })
}

VisitInfo.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  visitInfoModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, visitInfoInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, visitInfoInfo)
})
}

VisitInfo.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  visitInfoModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, visitInfos) {
  if (err) {
    return callback(err)
  }
  callback(null, visitInfos)
})
}

VisitInfo.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  visitInfoModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upvisitInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, upvisitInfo)
})
}

module.exports = VisitInfo
