var mongoose = require('mongoose')

var forumpuserinfoSchema = new mongoose.Schema({
  userId: String,
  posts: [
    {
      postId: String,
      time: Date
    }
  ],
  favorites: [
    {
      postId: String,
      time: Date
    }
  ]
})

var forumpuserinfoModel = mongoose.model('forumpuserinfo', forumpuserinfoSchema)

function Forumpuserinfo (forumpuserinfo) {
  this.forumpuserinfo = forumpuserinfo
}

Forumpuserinfo.prototype.save = function (callback) {
  var forumpuserinfo = this.forumpuserinfo
  var newForumpuserinfo = new forumpuserinfoModel(forumpuserinfo)
  newForumpuserinfo.save(function (err, forumpuserinfoItem) {
    if (err) {
      return callback(err)
    }
    callback(null, forumpuserinfoItem)
  })
}

Forumpuserinfo.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  forumpuserinfoModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumpuserinfoInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, forumpuserinfoInfo)
  })
}

Forumpuserinfo.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  forumpuserinfoModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumpuserinfos) {
    if (err) {
      return callback(err)
    }
    callback(null, forumpuserinfos)
  })
}

Forumpuserinfo.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  forumpuserinfoModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upforumpuserinfo) {
    if (err) {
      return callback(err)
    }
    callback(null, upforumpuserinfo)
  })
}

Forumpuserinfo.aggregate = function (array, callback) {
  let _array = array || []
  forumpuserinfoModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

module.exports = Forumpuserinfo