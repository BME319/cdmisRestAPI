
var mongoose = require('mongoose')

var messageSchema = new mongoose.Schema({
  messageId: String,
  userId: String,

  sendBy: String,
  readOrNot: Number,
  // 支付1，警报2，任务3，患者保险消息5, 患者退款消息6, 医生提醒更新主管患者任务9, 群体教育消息8, 审核消息7
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

Message.create = function (docs, callback) {
  messageModel.create(docs, function (err, messageInfos) {
    if (err) {
      return callback(err)
    }
    callback(null, messageInfos)
  })
}

module.exports = Message
