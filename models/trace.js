var mongoose = require('mongoose')

var traceSchema = new mongoose.Schema({
  phoneNo: String,
  apiName: String,
  time: Date,
  params: {},
  outputs: {}
})

var TraceModel = mongoose.model('trace', traceSchema)

function Trace (trace) {
  this.trace = trace
}

Trace.prototype.save = function (callback) {
  var trace = this.trace

  var newTrace = new TraceModel(trace)
  newTrace.save(function (err, traceItem) {
    if (err) {
      return callback(err)
    }
    callback(null, traceItem)
  })
}

Trace.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  TraceModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, traceInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, traceInfo)
    })
}

Trace.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  TraceModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, traces) {
      if (err) {
        return callback(err)
      }
      callback(null, traces)
    })
}

Trace.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  TraceModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upTrace) {
      if (err) {
        return callback(err)
      }
      callback(null, upTrace)
    })
}

module.exports = Trace
