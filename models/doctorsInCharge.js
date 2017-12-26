
var mongoose = require('mongoose')

var doctorsInChargeSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  dpRelationTime: Date, // 患者申请主管医生服务的时间
  invalidFlag: Number, // 服务状态，待审核0、当前1、历史2、被拒3
  rejectReason: String, // 医生拒绝的理由
  length: Number, // 服务时长，以月为单位
  start: Date, // 服务起始时间，即医生通过患者申请时刻
  end: Date // 服务截止时间
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
