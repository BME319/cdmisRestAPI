var async = require('async')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var testCtrl = require('../controllers_v2/convert_to_async')

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
    let err = '请填写doctorId!'
    callback(err)
  } else {
    if (doctorId.substr(0, 1) === 'h') {  // 扫码获取医生docTDCUrl，再读取userId
      queryD['docTDCurl'] = doctorId
      // console.log('queryD', queryD)
    } else if (doctorId.substr(0, 1) === 'U') { // 点击关注按钮直接获取医生的userId
      queryD['userId'] = doctorId
    } else {
      let err = '请检查doctorId输入！!'
      callback(err)
    }
  }
  let queryP = {userId: patientId, role: 'patient'}

  async.auto({
    getDoctor: function (callback) {
      Alluser.getOne(queryD, function (err, itemD) {
        callback(err, itemD)
      })
    },
    getPatient: function (callback) {
      Alluser.getOne(queryP, function (err, itemP) {
        callback(err, itemP)
      })
    },
    updateFD: ['getDoctor', 'getPatient', function (result, callback) {
      let itemD = result.getDoctor || null
      if (itemD) {
        let doctorObjectId = result.getDoctor._id
        let favoriteDoctorsList = result.getPatient.doctors
        for (let i = 0; i < favoriteDoctorsList.length; i++) {
          if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
            let err = '已关注该医生!'
            callback(err)
          }
        }
        let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0}
        favoriteDoctorsList.push(doctorNew)
        let upObj = {$set: {doctors: favoriteDoctorsList}}
        Alluser.updateOne(queryP, upObj, function (err, upPatient) {
          callback(err, upPatient)
        })
      } else {
        let err = '不存在的医生ID!'
        callback(err)
      }
    }],
    updateFP: ['getDoctor', 'getPatient', function (result, callback) {
      let itemD = result.getDoctor || null
      if (itemD) {
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
          callback(err, upRelation)
        }, {new: true, upsert: true})
      } else {
        let err = '不存在的医生ID!'
        callback(err)
      }
    }]
  }, function (err, results) {
    callback(err, results)
  })
}

exports.test = function (req, res) {
  testCtrl.favoriteDoctorAsync(req, res, function (err, results) {
    if (err) {
      console.log(err)
      return res.send(err)
    } else {
      return res.json({msg: '关注成功', data: results, code: 0})
    }
  })
}
