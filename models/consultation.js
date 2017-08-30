
var mongoose = require('mongoose')

var consultationSchema = new mongoose.Schema({
  consultationId: {type: String, unique: true},
  sponsorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  time: Date,
  diseaseInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'counsel'},
  status: {type: Number, enum: [1, 0]}, // 进行中／关闭
  messages: [ // 好像并不在用
    {
      sender: String,
      receiver: String,
      time: Date,
      content: String
    }
  ],
  conclusion: String,
  teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'team'},
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var ConsultationModel = mongoose.model('consultation', consultationSchema)

function Consultation (consultation) {
  this.consultation = consultation
}

Consultation.prototype.save = function (callback) {
  var consultation = this.consultation
  var newConsultation = new ConsultationModel(consultation)
  newConsultation.save(function (err, consultationItem) {
    if (err) {
      return callback(err)
    }
    callback(null, consultationItem)
  })
}

Consultation.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ConsultationModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, consultationInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, consultationInfo)
  })
}

Consultation.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  ConsultationModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, consultations) {
    if (err) {
      return callback(err)
    }
    callback(null, consultations)
  })
}

Consultation.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ConsultationModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upconsultation) {
    if (err) {
      return callback(err)
    }
    callback(null, upconsultation)
  })
}

Consultation.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ConsultationModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upconsultation) {
      if (err) {
        return callback(err)
      }
      callback(null, upconsultation)
    })
}

module.exports = Consultation
