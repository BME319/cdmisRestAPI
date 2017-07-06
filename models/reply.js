
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

replyModel = mongoose.model('reply', replySchema)

function Reply (reply) {
  this.reply = reply
}

reply.prototype.save = function (callback) {
  var reply = this.reply
  var newreply = new replyModel(reply)
  newReply.save(function (err, replyItem) {
    if (err) {
      return callback(err)
    }
    callback(null, replyItem)
  })
}

reply.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  replyModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, replyInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, replyInfo)
})
}

reply.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  replyModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, replys) {
  if (err) {
    return callback(err)
  }
  callback(null, replys)
})
}

reply.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  replyModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upreply) {
  if (err) {
    return callback(err)
  }
  callback(null, upreply)
})
}

module.exports = Reply
