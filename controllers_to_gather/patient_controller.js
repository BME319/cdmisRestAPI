var async = require('async')
var docInfoForPat = {
  _id: 0,
  charge1: 1,
  charge2: 1,
  charge3: 1,
  charge4: 1,
  charge5: 1,
  counselStatus1: 1,
  counselStatus2: 1,
  counselStatus3: 1,
  counselStatus4: 1,
  counselStatus5: 1,
  count1: 1,
  count2: 1,
  department: 1,
  gender: 1,
  name: 1,
  score: 1,
  title: 1,
  userId: 1,
  workUnit: 1,
  description: 1,
  major: 1,
  photoUrl: 1,
  schedules: 1,
  suspendTime: 1
}
// var config = require('../config')
// var webEntry = require('../settings').webEntry
var Alluser = require('../models/alluser')
// var Patient = require('../models/patient')
// var Doctor = require('../models/doctor')
// var DpRelation = require('../models/dpRelation')
// var User = require('../models/user')
var commonFunc = require('../middlewares/commonFunc')
// var Counsel = require('../models/counsel')
var VitalSign = require('../models/vitalSign')
// var DoctorsInCharge = require('../models/doctorsInCharge')
var errorHandler = require('../middlewares/errorHandler')

exports.dpUserIDbyPhone = function (req, res, next) {
  let phoneNo = req.body.phoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let query1 = {phoneNo: phoneNo, role: 'patient'}
  let query2 = {phoneNo: doctorPhoneNo, role: 'doctor'}
  if (phoneNo === null) {
    req.outputs = {status: 1, msg: '请输入phoneNo!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  } else {
    Alluser.getOne(query1, function (err, patientItem) {
      if (err) {
        // return res.json({status: 1, msg: '操作失败!'})
        req.outputs = {status: 1, msg: err}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else if (patientItem === null) {
        // return res.json({status: 1, msg: '不存在该患者!'})
        req.outputs = {status: 1, msg: '不存在该患者!'}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else {
        req.patientItem = patientItem
        if (doctorPhoneNo === null) {
          req.doctorItem = null
        } else {
          Alluser.getOne(query2, function (err, doctorItem) {
            if (err) {
              // return res.json({status: 1, msg: '操作失败!'})
              req.outputs = {status: 1, msg: err}
              errorHandler.makeError(2, req.outputs)(req, res, next)
            } else if (doctorItem === null) {
              // return res.json({status: 1, msg: '不存在该医生!'})
              req.outputs = {status: 1, msg: '不存在该医生!'}
              errorHandler.makeError(2, req.outputs)(req, res, next)
            } else {
              req.doctorItem = doctorItem
              return next()
            }
          })
        }
      }
    })
  }
}

exports.insertDiagnosis = function (req, res, next) {
  // 医生和患者的id获取有点问题，暂时未修改
  let query = {
    userId: req.patientItem.userId,
    role: 'patient'
  }

  let diagName = req.body.diagname || null
  let diagProgress = req.body.diagProgress || null
  let diagContent = req.body.diagContent || null
  let diagTime
  let diagOperationTime
  let diagHypertension

  if (req.body.diagtime == null || req.body.diagtime === '' || req.body.diagtime === undefined) {
    diagTime = new Date()
  } else {
    diagTime = new Date(req.body.diagtime)
  }
  if (req.body.diagoperationTime == null || req.body.diagoperationTime === '' || req.body.diagoperationTime === undefined) {
    diagOperationTime = new Date('1900-01-01')
  } else {
    diagOperationTime = new Date(req.body.diagoperationTime)
  }
  if (req.body.diaghypertension == null || req.body.diaghypertension === '' || req.body.diaghypertension === undefined) {
  // 前端定义默认高血压否为2
    diagHypertension = 2
  } else {
    diagHypertension = req.body.diaghypertension
  }

  var upObj = {
    $push: {
      diagnosisInfo: {
        name: diagName,
        time: diagTime,
        hypertension: diagHypertension,
        progress: diagProgress,
        operationTime: diagOperationTime,
        content: diagContent,
        doctor: req.doctorItem._id // req.body.doctorObject._id
      }
    }
  }

  Alluser.update(query, upObj, function (err, updiag) {
    if (err) {
      // return res.status(422).json({status: 1, msg: err.message})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    if (updiag.nModified === 0) {
      // return res.json({status: 1, msg: '未成功修改！请检查输入是否符合要求！'})
      req.outputs = {status: 1, msg: '未成功修改！请检查输入是否符合要求！'}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    req.body.userId = req.patientItem.userId
    req.body.class = diagName
    req.body.class_info = diagProgress
    req.body.hypertension = diagHypertension
    next()
  }, {new: true})
}

// 修改患者个人信息
// 修改 患者修改个人体重信息时加入体征测量数据的操作
exports.editPatientDetail = function (req, res, next) {
  // let patientId
  // 一样的问题
  // if (req.session.role === 'doctor') {
  //   patientId = req.body.patientId || null
  //   if (patientId === null) {
  //     return res.json({results: '请填写patientId!'})
  //   }
  // } else if (req.session.role === 'patient') {
  //   patientId = req.session.userId
  // }
  let query = {
    userId: req.patientItem.userId,
    role: 'patient'
  }

  let upObj = {}

  if (req.body.name !== null && req.body.name !== '' && req.body.name !== undefined) {
    upObj['name'] = req.body.name
  }
  if (req.body.photoUrl !== null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    upObj['photoUrl'] = commonFunc.removePrefix(req.body.photoUrl)
  }
  if (req.body.birthday !== null && req.body.birthday !== '' && req.body.birthday !== undefined) {
    upObj['birthday'] = new Date(req.body.birthday)
  }
  if (req.body.gender !== null && req.body.gender !== '' && req.body.gender !== undefined) {
    upObj['gender'] = req.body.gender
  }
  if (req.body.IDNo !== null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    upObj['IDNo'] = req.body.IDNo
  }
  if (req.body.height === '') {
    upObj['height'] = undefined
  } else if (req.body.height !== null && req.body.height !== '' && req.body.height !== undefined) {
    upObj['height'] = req.body.height
  }
  if (req.body.weight === '') {
    upObj['weight'] = undefined
  } else if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined) {
    upObj['weight'] = req.body.weight
  }
  if (req.body.occupation !== null && req.body.occupation !== '' && req.body.occupation !== undefined) {
    upObj['occupation'] = req.body.occupation
  }
  if (req.body.bloodType !== null && req.body.bloodType !== '' && req.body.bloodType !== undefined) {
    upObj['bloodType'] = req.body.bloodType
  }
  if (req.body.nation !== null && req.body.nation !== '' && req.body.nation !== undefined) {
    upObj['address.nation'] = req.body.nation
  }
  if (req.body.province !== null && req.body.province !== '' && req.body.province !== undefined) {
    upObj['address.province'] = req.body.province
  }
  if (req.body.city !== null && req.body.city !== '' && req.body.city !== undefined) {
    upObj['address.city'] = req.body.city
  }
  if (req.body.class !== null && req.body.class !== '' && req.body.class !== undefined) {
    upObj['class'] = req.body.class
  }
  if (req.body.class_info !== null && req.body.class_info !== '' && req.body.class_info !== undefined) {
    upObj['class_info'] = req.body.class_info
  }
  if (req.body.operationTime === '') {
    upObj['operationTime'] = undefined
  } else if (req.body.operationTime !== null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    upObj['operationTime'] = new Date(req.body.operationTime)
  }
  if (req.body.hypertension !== null && req.body.hypertension !== '' && req.body.hypertension !== undefined) {
    upObj['hypertension'] = req.body.hypertension
  }
  if (req.body.allergic !== null && req.body.allergic !== '' && req.body.allergic !== undefined) {
    upObj['allergic'] = req.body.allergic
  }
  if (req.body.lastVisit !== null && req.body.lastVisit !== '' && req.body.lastVisit !== undefined) {
    if (req.body.lastVisit.time === '') {
      upObj['lastVisit.time'] = undefined
    } else if (req.body.lastVisit.time !== null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      upObj['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital === '') {
      upObj['lastVisit.hospital'] = undefined
    } else if (req.body.lastVisit.hospital !== null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      upObj['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis === '') {
      upObj['lastVisit.diagnosis'] = undefined
    } else if (req.body.lastVisit.diagnosis !== null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
      upObj['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis
    }
  }

  Alluser.updateOne(query, upObj, function (err, upPatient) {
    if (err) {
      // return res.status(422).json({status: 1, msg: err.message})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    if (upPatient == null) {
      return res.json({status: 1, msg: '修改失败，不存在的患者ID！'})
    }
    upPatient.photoUrl = commonFunc.adaptPrefix(upPatient.photoUrl)
    let date = req.body.date || null   // 区别是通过vitalSign插入体重信息，还是通过修改个人信息插入体重信息

    let dataTime = req.body.datatime || null
    if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined && date === null && dataTime === null) {
      var queryVital = {
        patientId: upPatient._id,
        type: '体重',
        code: '体重',
        unit: 'kg',
        date: commonFunc.getNowDate()
      }
      let upVital = {}
      let opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
      // console.log(queryVital)
      VitalSign.updateOne(queryVital, upVital, function (err, upweight) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          let queryWeight = {
            patientId: upPatient._id,
            type: upweight.type,
            code: upweight.code,
            date: new Date(upweight.date)
          }
          let upWeight = {
            $push: {
              data: {
                time: new Date(),
                value: req.body.weight
              }
            }
          }
          VitalSign.update(queryWeight, upWeight, function (err, updata) {
            if (err) {
              return res.status(500).json({status: 1, msg: err.message})
            } else {
              return res.json({status: 0, msg: '修改成功'})
            }
          })
        }
      }, opts)
    } else if (date !== null && dataTime !== null) {  // 体征数据进行后续警戒值判断
      return next()
    } else {  // 修改除体重数据外的患者信息返回
      // return res.json({status: 0, msg: '修改成功'})
      req.status = 0
      req.msg = '修改成功!'
      return next()
    }
  }, {new: true})
}
