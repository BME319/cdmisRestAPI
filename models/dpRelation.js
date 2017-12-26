var mongoose = require('mongoose')

var dpRelationSchema = new mongoose.Schema({
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  patients: [
    {
      _id: 0,
      patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      labels: [String],
      dpRelationTime: Date
    }
  ],
  patientsInCharge: [
    {
      _id: 0,
      patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      labels: [String],
      dpRelationTime: Date,
      invalidFlag: {type: Number, enum: [0, 1, 2, 3]}, // 2历史、1当前、0待审核、3已拒绝
      rejectReason: String,
      length: Number, // 时长数字类型以月为单位
      start: Date, // 有效的起止时间
      end: Date
    }
  ],
  doctors: [
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      lastTalkTime: Date
    }
  ],
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var dpRelationModel = mongoose.model('dpRelation', dpRelationSchema)

function DpRelation (dpRelation) {
  this.dpRelation = dpRelation
}

DpRelation.prototype.save = function (callback) {
  var dpRelation = this.dpRelation
  var newDpRelation = new dpRelationModel(dpRelation)
  newDpRelation.save(function (err, dpRelationItem) {
    if (err) {
      return callback(err)
    }
    callback(null, dpRelationItem)
  })
}

DpRelation.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  dpRelationModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dpRelationInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, dpRelationInfo)
  })
}

DpRelation.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  dpRelationModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, dpRelations) {
    if (err) {
      return callback(err)
    }
    callback(null, dpRelations)
  })
}

DpRelation.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dpRelationModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, updpRelation) {
    if (err) {
      return callback(err)
    }
    callback(null, updpRelation)
  })
}

DpRelation.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  dpRelationModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, updpRelation) {
      if (err) {
        return callback(err)
      }
      callback(null, updpRelation)
    })
}

module.exports = DpRelation
