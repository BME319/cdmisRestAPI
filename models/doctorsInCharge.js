
var mongoose = require('mongoose')

var doctorsInChargeSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  dpRelationTime: Date,
  // 历史2、当前1、待审核0、被拒3
  invalidFlag: Number,
  rejectReason: String,
  // 时长数字类型以月为单位
  length: Number,
  // 有效的起止时间
  start: Date,
  end: Date
})

var DoctorsInChargeModel = mongoose.model('doctorsInCharge', doctorsInChargeSchema)

function DoctorsInCharge (doctorsInCharge) {
  this.doctorsInCharge = doctorsInCharge
}

DoctorsInCharge.prototype.save = function (callback) {
  var doctorsInCharge = this.doctorsInCharge

  var newDoctorsInCharge = new DoctorsInChargeModel(doctorsInCharge)
  newDoctorsInCharge.save(function (err, doctorsInChargeItem) {
    if (err) {
      return callback(err)
    }
    callback(null, doctorsInChargeItem)
  })
}

DoctorsInCharge.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  DoctorsInChargeModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, doctorsInChargeInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, doctorsInChargeInfo)
    })
}

DoctorsInCharge.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  DoctorsInChargeModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, doctorsInCharges) {
      if (err) {
        return callback(err)
      }
      callback(null, doctorsInCharges)
    })
}

DoctorsInCharge.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  DoctorsInChargeModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upDoctorsInCharge) {
      if (err) {
        return callback(err)
      }
      callback(null, upDoctorsInCharge)
    })
}

DoctorsInCharge.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  DoctorsInChargeModel
      .update(query, obj, options)
      .populate(_populate)
      .exec(function (err, upDoctorsInCharge) {
        if (err) {
          return callback(err)
        }
        callback(null, upDoctorsInCharge)
      })
}

module.exports = DoctorsInCharge
