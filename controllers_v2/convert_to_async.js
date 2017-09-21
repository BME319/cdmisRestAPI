var async = require('async')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var testCtrl = require('../controllers_v2/convert_to_async')

// ------ patient/favoriteDoctor ------
exports.favoriteDoctorAsync = function (req, res, callback) {
  let patientId = req.session.userId
  let doctorId = req.body.doctorId || null
  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  let queryD = {role: 'doctor'}
  if (doctorId === null) {
    return res.json({msg: '请填写doctorId!', code: 1})
  } else {
    if (doctorId.substr(0, 1) === 'h') {  // 扫码获取医生docTDCUrl，再读取userId
      queryD['docTDCurl'] = doctorId
    } else if (doctorId.substr(0, 1) === 'U') { // 点击关注按钮直接获取医生的userId
      queryD['userId'] = doctorId
    } else {
      return res.json({msg: '请检查doctorId输入!', code: 1})
    }
  }
  let queryP = {userId: patientId, role: 'patient'}

  async.auto({
    getDoctor: function (callback) {
      Alluser.getOne(queryD, function (err, itemD) {
        if (itemD) {
          return callback(err, itemD)
        } else {
          return res.json({msg: '不存在的医生ID!', code: 1})
        }
      })
    },
    getPatient: function (callback) {
      Alluser.getOne(queryP, function (err, itemP) {
        if (itemP) {
          return callback(err, itemP)
        } else {
          return res.json({msg: '不存在的患者ID!', code: 1})
        }
      })
    },
    updateFD: ['getDoctor', 'getPatient', function (result, callback) {
      let doctorObjectId = result.getDoctor._id
      let favoriteDoctorsList = result.getPatient.doctors
      for (let i = 0; i < favoriteDoctorsList.length; i++) {
        if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
          return res.json({msg: '已关注该医生!', code: 1})
        }
      }
      let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0}
      favoriteDoctorsList.push(doctorNew)
      let upObj = {$set: {doctors: favoriteDoctorsList}}
      Alluser.updateOne(queryP, upObj, function (err, upPatient) {
        return callback(err, upPatient)
      })
    }],
    updateFP: ['getDoctor', 'getPatient', function (result, callback) {
      let doctorObjectId = result.getDoctor._id
      let patientObjectId = result.getPatient._id
      let query = {doctorId: doctorObjectId}
      let upObj = {
        $push: {
          patients: {
            patientId: patientObjectId,
            dpRelationTime: dpRelationTime
          }
        }
      }
      DpRelation.updateOne(query, upObj, function (err, upRelation) {
        return callback(err, upRelation)
      }, {new: true, upsert: true})
    }]
  }, function (err, results) {
    return callback(err, results)
  })
}

exports.favoriteDoctorAsyncTest = function (req, res) {
  testCtrl.favoriteDoctorAsync(req, res, function (err, results) {
    if (err) {
      return res.json({err: err, results: results})
    } else {
      return res.json({msg: '关注成功', data: results, code: 0})
    }
  })
}

// ------ nurse/bindingPatient ------
exports.bindingPatientAsync = function (req, res, callback) {
  let patientId = req.query.patientId || req.body.patientId || null
  if (patientId === null) {
    return res.json({result: '请填写patientId!'})
  }
  let queryP = {userId: patientId, role: 'patient'}
  let nurseId = req.body.nurseObjectId || null
  if (nurseId === null) {
    return res.json({result: '请填写nurseObjectId!'})
  }
  let queryN = {doctorId: nurseId}

  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime === null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }

  async.auto({
    getNurse: function (callback) {
      DpRelation.getOne(queryN, function (err, itemN) {
        if (itemN) {
          return callback(err, itemN)
        } else {
          return res.json({msg: '不存在的护士ID!', code: 1})
        }
      })
    },
    getPatient: function (callback) {
      Alluser.getOne(queryP, function (err, itemP) {
        if (itemP) {
          return callback(err, itemP)
        } else {
          return res.json({msg: '不存在的患者ID!', code: 1})
        }
      })
    },
    updateBP: ['getDoctor', 'getPatient', function (result, callback) {
      let patientsList = result.getPatient.patients
      for (let i = 0; i < patientsList.length; i++) {
        if (String(patientsList[i].patientId) === String(patientId)) {
          return res.json({msg: '已绑定过该患者!', code: 1})
        }
      }
      let patientObjectId = result.getPatient._id
      let upObj = {
        $push: {
          patients: {
            patientId: patientObjectId,
            dpRelationTime: dpRelationTime
          }
        }
      }
      DpRelation.updateOne(queryN, upObj, function (err, upRelation) {
        return callback(err, upRelation)
      }, {new: true, upsert: true})
    }]
  }, function (err, results) {
    return callback(err, results)
  })
}

exports.bindingPatientAsyncTest = function (req, res) {
  testCtrl.bindingPatientAsync(req, res, function (err, results) {
    if (err) {
      return res.json({err: err, results: results})
    } else {
      return res.json({msg: '绑定成功', data: results, code: 0})
    }
  })
}

// ------ new/newstemp ------

// ------ new/teamNewstemp ------

// ------ wechat/refund ------

// ------ services/message ------

// ------ communication/communication ------

// ------ communication/team ------

// ------ wechat/messageTemplate ------

// ------ wechat/download ------
