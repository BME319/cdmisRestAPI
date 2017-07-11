
var mongoose = require('mongoose')

var communicationSchema = new mongoose.Schema({
  messageNo: String,
  messageType: Number,
  sendStatus: Number,
  readStatus: Number,
  sendBy: String,
  receiver: String,
  sendDateTime: Date,
  title: String,
  content: mongoose.Schema.Types.Mixed,
  newsType: String
})

var communicationModel = mongoose.model('communication', communicationSchema)

function Communication (communication) {
  this.communication = communication
}

Communication.prototype.save = function (callback) {
  var communication = this.communication
  var newCommunication = new communicationModel(communication)
  newCommunication.save(function (err, communicationItem) {
    if (err) {
      return callback(err)
    }
    callback(null, communicationItem)
  })
}

Communication.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  communicationModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, communicationInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, communicationInfo)
  })
}

Communication.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  communicationModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, communications) {
    if (err) {
      return callback(err)
    }
    callback(null, communications)
  })
}

Communication.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  communicationModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upcommunication) {
    if (err) {
      return callback(err)
    }
    callback(null, upcommunication)
  })
}

Communication.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  communicationModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upcommunication) {
      if (err) {
        return callback(err)
      }
      callback(null, upcommunication)
    })
}

module.exports = Communication
