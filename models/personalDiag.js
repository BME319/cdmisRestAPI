var mongoose = require('mongoose')

var personalDiagSchema = new mongoose.Schema({
  diagId: String,
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  code: String,
  // 添加预约时段字段 结构 “YYYY-MM-DD-1"（某日上午）或“YYYY-MM-DD-2"（某日下午）YQC 2017-07-27
  bookingPeriod: String,
  creatTime: Date,
  // 过期时间
  endTime: Date,
  // 面诊确认时间
  time: Date,
  // 0: 未开始，1: 已完成，2: 未进行自动结束
  status: {type: Number, default: 0}
})

var PersonalDiagModel = mongoose.model('personalDiag', personalDiagSchema)

function PersonalDiag (personalDiag) {
  this.personalDiag = personalDiag
}

PersonalDiag.prototype.save = function (callback) {
  var personalDiag = this.personalDiag
  var newPersonalDiag = new PersonalDiagModel(personalDiag)
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

  PersonalDiagModel
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
  PersonalDiagModel
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

  PersonalDiagModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upPersonalDiag) {
    if (err) {
      return callback(err)
    }
    callback(null, upPersonalDiag)
  })
}

PersonalDiag.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  PersonalDiagModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upPersonalDiag) {
      if (err) {
        return callback(err)
      }
      callback(null, upPersonalDiag)
    })
}

PersonalDiag.count = function (query, callback) {
  PersonalDiagModel
  .count(query)
  .count(function (err, total) {
    if (err) {
      return callback(err)
    }
    callback(null, total)
  })
}

module.exports = PersonalDiag
