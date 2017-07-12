
var mongoose = require('mongoose')

var adviceSchema = new mongoose.Schema({
  userId: String,
  role: {
    type: String,
    enum: ['doctor', 'patient']
  },
  time: Date,
  topic: String,
  content: String
})

var adviceModel = mongoose.model('advice', adviceSchema)

function Advice (advice) {
  this.advice = advice
}

Advice.prototype.save = function (callback) {
  var advice = this.advice

  var newAdvice = new adviceModel(advice)
  newAdvice.save(function (err, adviceItem) {
    if (err) {
      return callback(err)
    }
    callback(null, adviceItem)
  })
}

Advice.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  adviceModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, adviceInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, adviceInfo)
    })
}

Advice.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  adviceModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, advices) {
      if (err) {
        return callback(err)
      }
      callback(null, advices)
    })
}

Advice.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  adviceModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upadvice) {
      if (err) {
        return callback(err)
      }
      callback(null, upadvice)
    })
}

Advice.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  adviceModel
      .update(query, obj, options)
      .populate(_populate)
      .exec(function (err, upadvice) {
        if (err) {
          return callback(err)
        }
        callback(null, upadvice)
      })
}

module.exports = Advice
