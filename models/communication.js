
var mongoose = require('mongoose')

var communicationSchema = new mongoose.Schema({
  messageNo: String,
  messageType: {type: Number, enum: [1, 2]}, // 1单聊，2群聊
  sendStatus: Number,
  readStatus: Number,
  sendBy: String,
  receiver: String,
  sendDateTime: Date,
  title: String,
  content: mongoose.Schema.Types.Mixed,
  // newsType: 11 医-患 12 医-医 13 医-团队 15 病例讨论
  newsType: {
    type: String,
    enum: ['11', '12', '13', '15']
  }
})

var CommunicationModel = mongoose.model('communication', communicationSchema)

function Communication (communication) {
  this.communication = communication
}

Communication.prototype.save = function (callback) {
  var communication = this.communication
  var newCommunication = new CommunicationModel(communication)
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

  CommunicationModel
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
  CommunicationModel
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

  CommunicationModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upCommunication) {
    if (err) {
      return callback(err)
    }
    callback(null, upCommunication)
  })
}

Communication.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  CommunicationModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upCommunication) {
      if (err) {
        return callback(err)
      }
      callback(null, upCommunication)
    })
}

Communication.create = function (docs, callback) {
  CommunicationModel.create(docs, function (err, communicationInfos) {
    if (err) {
      return callback(err)
    }
    callback(null, communicationInfos)
  })
}

module.exports = Communication
