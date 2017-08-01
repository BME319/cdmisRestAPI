var NurseInsuranceWork = require('../models/nurseInsuranceWork')

// 获取护士推送保险信息的患者列表  2017-08-01 lgf
exports.getInsuranceWork = function (req, res) {
  var nurseId = req.session.userId
  var query = {
    'nurseId': nurseId
  }
  let opts = {}
  let fields = {}
  let populate = {
    'path': 'patientId'
  }
  NurseInsuranceWork.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      return res.json({results: items})
    }
  }, opts, fields, populate)
}

// 插入护士推送保险信息  2017-08-01 lgf
exports.updateInsuranceWork = function (req, res, next) {
  var nurseId = req.session.userId
  var patientId = req.userObject._id
  var time
  if (req.body.time === null || req.body.time === '' || req.body.time === undefined) {
    time = new Date()
  } else {
    time = new Date(req.body.time)
  }
  var query = {
    'nurseId': nurseId,
    'patientId': patientId
  }
  var upObj = {
    $set: {
      'time': time
    }
  }
  NurseInsuranceWork.update(query, upObj, function (err, upInsuranceWork) {
    if (err) {
      return res.status(500).send(err.message)
    } else {
      return res.json({results: upInsuranceWork})
    }
  })
}
