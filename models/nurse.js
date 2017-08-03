
var mongoose = require('mongoose')

var nurseInsuranceWorkSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  nurseId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  time: Date // 推送时间
})

var nurseInsuranceWorkModel = mongoose.model('nurseInsuranceWork', nurseInsuranceWorkSchema)

function NurseInsuranceWork (nurseInsuranceWork) {
  this.nurseInsuranceWork = nurseInsuranceWork
}

NurseInsuranceWork.prototype.save = function (callback) {
  var nurseInsuranceWork = this.nurseInsuranceWork
  var newNurseInsuranceWork = new NurseInsuranceWork(nurseInsuranceWork)
  newNurseInsuranceWork.save(function (err, nurseInsuranceWorkItem) {
    if (err) {
      return callback(err)
    }
    callback(null, nurseInsuranceWorkItem)
  })
}

NurseInsuranceWork.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  nurseInsuranceWorkModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, nurseInsuranceWorkInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, nurseInsuranceWorkInfo)
    })
}

NurseInsuranceWork.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  nurseInsuranceWorkModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, upNurseInsuranceWork) {
      if (err) {
        return callback(err)
      }
      callback(null, upNurseInsuranceWork)
    })
}

NurseInsuranceWork.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  nurseInsuranceWorkModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upNurseInsuranceWork) {
      if (err) {
        return callback(err)
      }
      callback(null, upNurseInsuranceWork)
    })
}

NurseInsuranceWork.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  nurseInsuranceWorkModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upNurseInsuranceWork) {
      if (err) {
        return callback(err)
      }
      callback(null, upNurseInsuranceWork)
    })
}

module.exports = NurseInsuranceWork
