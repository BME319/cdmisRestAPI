
var mongoose = require('mongoose')

var reportSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  type: String
  time: String

  role: {
    type: String,
    enum: ['doctor', 'patient']
  },
  time: Date,
  topic: String,
  content: String
})

var ReportModel = mongoose.model('report', reportSchema)

function Report (report) {
  this.report = report
}

Report.prototype.save = function (callback) {
  var report = this.report
  var newReport = new ReportModel(report)
  newReport.save(function (err, reportItem) {
    if (err) {
      return callback(err)
    }
    callback(null, reportItem)
  })
}

Report.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ReportModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, reportInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, reportInfo)
    })
}

Report.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ReportModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

Report.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ReportModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

Report.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ReportModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

module.exports = Report
