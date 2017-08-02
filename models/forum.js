
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
  skimNum: Number,
  likesNum: Number,
  replyCount: Number,
  replies: [],
  favoritesNum: Number,
  transferNum: Number,
  // 1为匿名
  anonymous: Number
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

Forum.aggregate = function (array, callback) {
  let _array = array || []
  forumModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      console.log(results)
      callback(null, results)
    })
}

module.exports = Forum
