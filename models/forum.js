
var mongoose = require('mongoose')

var forumSchema = new mongoose.Schema({
  postId: String,
  // type: Number,
  // board: Number,
  // status: Number,
  sponsorId: {
    type: String,
    ref: 'alluser'
  },
  sponsorName: String,
  title: String,
  // subject: String,
  time: Date,
  content: [],
  skimNum: Number,
  likesNum: Number,
  replyCount: Number,
  replies: [
    {
      commentId: String,
      // replyId: String,
      userId: String,
      userName: String,
      time: Date,
      depth: {type: Number, enum: [1, 2]}, // 回复层级
      content: String,
      replies: [
        {
          replyId: String,
          userId: String,
          userName: String,
          content: String,
          time: Date,
          at: String
        }
      ]
      // at: String
    }
  ],
  favoritesNum: Number,
  transferNum: Number,
  anonymous: {type: Number, enum: [1, 0]} // 1为匿名
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

Forum.removeOne = function (query, callback, opts) {
  var options = opts || {}

  forumModel
    .findOneAndRemove(query, options, function (err, results) {
      if (err) {
        return callback(err)
      }
      callback(null, results)
    })
}

module.exports = Forum
