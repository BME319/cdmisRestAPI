
var mongoose = require('mongoose')

var forumpSchema = new mongoose.Schema({
  postId: String,
  // type: Number,
  // board: Number,
  status: Number,
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
  // replies: [
  //   {
  //     commentId: String,
  //     // replyId: String,
  //     userId: String,
  //     userName: String,
  //     time: Date,
  //     depth: {type: Number, enum: [1, 2]}, // 回复层级
  //     content: String,
  //     status: Number,
  //     replies: [
  //       {
  //         replyId: String,
  //         userId: String,
  //         userName: String,
  //         content: String,
  //         time: Date,
  //         status: Number,
  //         at: String
  //       }
  //     ]
  //     // at: String
  //   }
  // ],
  favoritesNum: Number,
  transferNum: Number,
  anonymous: {type: Number, enum: [1, 0]} // 1为匿名
})

var forumpModel = mongoose.model('forump', forumpSchema)

function Forump (forump) {
  this.forump = forump
}

Forump.prototype.save = function (callback) {
  var forump = this.forump
  var newForump = new forumpModel(forump)
  newForump.save(function (err, forumpItem) {
    if (err) {
      return callback(err)
    }
    callback(null, forumpItem)
  })
}

Forump.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  forumpModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumpInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, forumpInfo)
  })
}

Forump.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  forumpModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumps) {
    if (err) {
      return callback(err)
    }
    callback(null, forumps)
  })
}

Forump.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  forumpModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upforump) {
    if (err) {
      return callback(err)
    }
    callback(null, upforump)
  })
}

Forump.aggregate = function (array, callback) {
  let _array = array || []
  forumpModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

Forump.removeOne = function (query, callback, opts) {
  var options = opts || {}

  forumpModel
    .findOneAndRemove(query, options, function (err, results) {
      if (err) {
        return callback(err)
      }
      callback(null, results)
    })
}

module.exports = Forump
