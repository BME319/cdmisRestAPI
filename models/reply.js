
var mongoose = require('mongoose')

var replySchema = new mongoose.Schema({
  userName: String,
  subject: String,
  time: Date,
  depth: Number,
  content: String,
  replies: [],
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var replyModel = mongoose.model('reply', replySchema)

function Reply (reply) {
  this.reply = reply
}

Reply.prototype.save = function (callback) {
  var reply = this.reply
  var newReply = new replyModel(reply)
  newReply.save(function (err, replyItem) {
    if (err) {
      return callback(err)
    }
    callback(null, replyItem)
  })
}

Reply.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  replyModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, replyInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, replyInfo)
  })
}

Reply.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  replyModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, replys) {
    if (err) {
      return callback(err)
    }
    callback(null, replys)
  })
}

Reply.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  replyModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upreply) {
    if (err) {
      return callback(err)
    }
    callback(null, upreply)
  })
}

module.exports = Reply
