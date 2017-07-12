
var mongoose = require('mongoose')

var messageSchema = new mongoose.Schema({
  messageId: String,
  userId: String,

  sendBy: String,
  readOrNot: Number,

  type: Number,
  time: Date,
  title: String,
  description: String,
  url: String
})

var messageModel = mongoose.model('message', messageSchema)

function Message (message) {
  this.message = message
}

Message.prototype.save = function (callback) {
  var message = this.message
  var newMessage = new messageModel(message)
  newMessage.save(function (err, messageItem) {
    if (err) {
      return callback(err)
    }
    callback(null, messageItem)
  })
}

Message.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  messageModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, messageInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, messageInfo)
  })
}

Message.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  messageModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, messages) {
    if (err) {
      return callback(err)
    }
    callback(null, messages)
  })
}

Message.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  messageModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upmessage) {
    if (err) {
      return callback(err)
    }
    callback(null, upmessage)
  })
}

Message.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  messageModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upmessage) {
      if (err) {
        return callback(err)
      }
      callback(null, upmessage)
    })
}

module.exports = Message
