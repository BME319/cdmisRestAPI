var mongoose = require('mongoose')

var personalDiagSchema = new mongoose.Schema({
  diagId: String, 
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, 
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, 
  code: String, 
  creatTime: Date,
  // 过期时间
  endTime: Date,
  // 面诊确认时间
  time: Date, 
  // 0: 未开始，1: 已完成，2: 未进行自动结束
  status: {type: Number, default: 0}
})

var personalDiagModel = mongoose.model('personalDiag', personalDiagSchema)

function PersonalDiag (personalDiag) {
  this.personalDiag = personalDiag
}

PersonalDiag.prototype.save = function (callback) {
  var personalDiag = this.personalDiag
  var newPersonalDiag = new personalDiagModel(personalDiag)
  newPersonalDiag.save(function (err, personalDiagItem) {
    if (err) {
      return callback(err)
    }
    callback(null, personalDiagItem)
  })
}

PersonalDiag.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  personalDiagModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, personalDiagInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, personalDiagInfo)
  })
}

PersonalDiag.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  personalDiagModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, personalDiags) {
    if (err) {
      return callback(err)
    }
    callback(null, personalDiags)
  })
}

PersonalDiag.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  personalDiagModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, uppersonalDiag) {
    if (err) {
      return callback(err)
    }
    callback(null, uppersonalDiag)
  })
}

PersonalDiag.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  personalDiagModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, uppersonalDiag) {
      if (err) {
        return callback(err)
      }
      callback(null, uppersonalDiag)
    })
}

PersonalDiag.count = function (query, callback) {
  personalDiagModel
  .count(query)
  .count(function (err, total) {
    if (err) {
      return callback(err)
    }
    callback(null, total)
  })
}

module.exports = PersonalDiag
