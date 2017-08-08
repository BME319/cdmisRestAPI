var mongoose = require('mongoose')

var forumuserinfoSchema = new mongoose.Schema({
  userId: String,
  posts:[],
  favorites:[]
})

var forumuserinfoModel = mongoose.model('forumuserinfo', forumuserinfoSchema)

function Forumuserinfo (forumuserinfo) {
  this.forumuserinfo = forumuserinfo
}

Forumuserinfo.prototype.save = function (callback) {
  var forumuserinfo = this.forumuserinfo
  var newForumuserinfo = new forumuserinfoModel(forumuserinfo)
  newForumuserinfo.save(function (err, forumuserinfoItem) {
    if (err) {
      return callback(err)
    }
    callback(null, forumuserinfoItem)
  })
}

Forumuserinfo.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  forumuserinfoModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumuserinfoInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, forumuserinfoInfo)
  })
}

Forumuserinfo.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  forumuserinfoModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, forumuserinfos) {
    if (err) {
      return callback(err)
    }
    callback(null, forumuserinfos)
  })
}

Forumuserinfo.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  forumuserinfoModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upforumuserinfo) {
    if (err) {
      return callback(err)
    }
    callback(null, upforumuserinfo)
  })
}

Forumuserinfo.aggregate = function (array, callback) {
  let _array = array || []
  forumuserinfoModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      console.log(results)
      callback(null, results)
    })
}

module.exports = Forumuserinfo