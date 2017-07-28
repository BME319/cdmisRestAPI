var mongoose = require('mongoose')

var counselautochangestatusSchema = new mongoose.Schema({
    counselId: String,
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alluser'
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alluser'
    },
    time: Date,
    sickTime: String,
    symptom: String,
    help: String,
    hospital: String,
    visitDate: Date,
    diagnosis: String,
    departLeader: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alluser'    
      }
    ],
    endTime: Date
})

var counselautochangestatusModel = mongoose.model('counselautochangestatus', counselautochangestatusSchema)

function Counselautochangestatus (counselautochangestatus) {
  this.counselautochangestatus = counselautochangestatus
}

Counselautochangestatus.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  counselautochangestatusModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      callback(null, results)
    })
}

Counselautochangestatus.aggregate = function (array, callback) {
  let _array = array || []
  counselautochangestatusModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      console.log(results)
      callback(null, results)
    })
}

Counselautochangestatus.getOne = function (query, callback) {

  counselautochangestatusModel
    .findOne(query)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      callback(null, results)
    })
}

module.exports = Counselautochangestatus