
var mongoose = require('mongoose')
var Reply = require('../models/reply')

var forumSchema = new mongoose.Schema({
  postId: String,
  type: Number,
  board: Number,
  status: Number,
  sponsorId: String,
  sponsorName: String,
  title: String,
  subject: String,
  time: Date,
  content: [],
  hits: Number,
  praises: Number,
  replyCount: Number,
  replies: [Reply],
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var forumModel = mongoose.model('forum', forumSchema)

function Forum (forum) {
  this.forum = forum
}

Forum.prototype.save = function (callback) {
  var forum = this.forum
  var newForum = new forumModel(forum)
  newForum.save(function (err, forumItem) {
    if (err) {
      return callback(err)
    }
    callback(null, forumItem)
  })
}

Forum.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  forumModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, forumInfo)
  })
}

Forum.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  forumModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forums) {
    if (err) {
      return callback(err)
    }
    callback(null, forums)
  })
}

Forum.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  forumModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upforum) {
    if (err) {
      return callback(err)
    }
    callback(null, upforum)
  })
}

module.exports = Forum
