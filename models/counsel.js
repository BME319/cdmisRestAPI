
var mongoose = require('mongoose')

var counselSchema = new mongoose.Schema({
  counselId: {type: String, unique: true},
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  type: {type: Number, enum: [1, 2, 3, 6]}, // 咨询=1,问诊=2,咨询升级问诊=3,加急咨询=6
  time: Date,
  status: {type: Number, enum: [1, 0]}, // 进行中／关闭
  topic: String, // 好像并不在用
  content: String, // 好像并不在用
  title: String, // 好像并不在用
  sickTime: String,
  visited: Number,
  hospital: String,
  visitDate: Date,
  diagnosis: String,
  diagnosisPhotoUrl: [String],
  symptom: String,
  symptomPhotoUrl: [String],
  descirption: String, // 好像并不在用
  help: String,
  comment: String, // 好像并不在用
  messages: [ // 好像并不在用
    {
      sender: String,
      receiver: String,
      time: Date,
      content: String
    }
  ],
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var CounselModel = mongoose.model('counsel', counselSchema)

function Counsel (counsel) {
  this.counsel = counsel
}

Counsel.prototype.save = function (callback) {
  var counsel = this.counsel
  var newCounsel = new CounselModel(counsel)
  newCounsel.save(function (err, counselItem) {
    if (err) {
      return callback(err)
    }
    callback(null, counselItem)
  })
}

Counsel.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  CounselModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, counselInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, counselInfo)
  })
}

Counsel.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  CounselModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, counsels) {
    if (err) {
      return callback(err)
    }
    callback(null, counsels)
  })
}

Counsel.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  CounselModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upcounsel) {
    if (err) {
      return callback(err)
    }
    callback(null, upcounsel)
  })
}

module.exports = Counsel
