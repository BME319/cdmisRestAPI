var mongoose = require('mongoose')

var personalDiagSchema = new mongoose.Schema({
  diagId: String, // 面诊编号
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  code: String, // 验证码
  bookingDay: Date, // 预约日期，数据存储为东八区当日零点
  bookingTime: {type: String, enum: ['Morning', 'Afternoon']}, // 面诊预约时间段
  place: String, // 面诊地点
  creatTime: Date, // 预约操作时间
  endTime: Date, // 面诊过期时间
  time: Date, // 面诊确认时间
  status: {type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5, 6]} // 面诊状态 0: 待核销，1: 医生完成核销，2: 过期自动核销，3: 患者取消，直接退款，4: 医生停诊或取消，直接退款，5: 患者申请取消，等待人工处理，6: 医生停诊，等待人工处理
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
