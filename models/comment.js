var mongoose = require('mongoose')

var commentSchema = new mongoose.Schema({
  commentId: String,
  counselId: String,
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'doctor'},
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'patient'},
  type: Number,
  time: Date,
  helpScore: Number,
  attitudeScore: Number,
  speedScore: Number,
  totalScore: {type: Number, default: 10},
  topic: String,
  expense: String,
  content: String,
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var CommentModel = mongoose.model('comment', commentSchema)

function Comment (comment) {
  this.comment = comment
}

Comment.prototype.save = function (callback) {
  var comment = this.comment

  var newComment = new CommentModel(comment)
  newComment.save(function (err, commentItem) {
    if (err) {
      return callback(err)
    }
    callback(null, commentItem)
  })
}

Comment.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  CommentModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, commentInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, commentInfo)
    })
}

Comment.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  CommentModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, comments) {
      if (err) {
        return callback(err)
      }
      callback(null, comments)
    })
}

Comment.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  CommentModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upComment) {
      if (err) {
        return callback(err)
      }
      callback(null, upComment)
    })
}

Comment.aggregate = function (array, callback) {
  let _array = array || []
  CommentModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      console.log(results)
      callback(null, results)
    })
}

module.exports = Comment
