
var mongoose = require('mongoose')

var replySchema = new mongoose.Schema({
  postId: String,
  commentId: String,
  // replyId: String,
  userId: String,
  userName: String,
  time: Date,
  depth: {type: Number, enum: [1, 2]}, // 回复层级
  content: String,
  status: Number,
  replies: [
    {
      replyId: String,
      userId: String,
      userName: String,
      content: String,
      time: Date,
      status: Number,
      at: String,
      atName: String
    }
  ]
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

Reply.aggregate = function (array, callback) {
  let _array = array || []
  replyModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

module.exports = Reply
