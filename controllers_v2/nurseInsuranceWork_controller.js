// var NurseInsuranceWork = require('../models/nurseInsuranceWork')
var Alluser = require('../models/alluser')
var OpenIdTmp = require('../models/openId')
var DpRelation = require('../models/dpRelation')

var nurseInsuranceWorkCtrl = require('../controllers_v2/nurseInsuranceWork_controller')

var async = require('async')

// 获取护士推送保险信息的患者列表  2017-08-01 lgf
exports.getInsurancePatientsList = function (req, res) {
  var nurseId = req.userObject._id
  var query = {
    'doctorId': nurseId
  }
  let opts = {'sort': '-patients.dpRelationTime'}
  let fields = {}
  let populate = {
    'path': 'patients.patientId',
    'select': {
      'userId': 1,
      'name': 1,
      'photoUrl': 1,
      'gender': 1,
      'class': 1,
      'birthday': 1,
      '_id': 0
    }
  }
  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log('item', item)
    if (item === null) {
      return res.json({data: {}, msg: '该护士无绑定患者！', code: 1})
    } else {
      let rows = item.patients
      rows.sort(function (a, b) {
        return Date.parse(b.dpRelationTime) - Date.parse(a.dpRelationTime) // 时间降序
      })
      return res.json({data: rows, msg: '获取患者列表成功！', code: 1})
    }
  }, opts, fields, populate)
}

// 查询临时绑定关系
exports.checkBinding = function (req, res, next) {
  var nurseId = req.session.userId
  var query = {
    'userId': nurseId,
    'role': 'nurse'
  }
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item !== null) {
      if (item.openId !== null && item.openId !== '' && item.openId !== undefined) {
        let query2 = {
          'patientOpenId': item.openId
        }
        OpenIdTmp.getOne(query2, function (err, item1) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (item1 !== null) {
            req.body.patientId = item1.doctorUserId   // 患者端 患者扫医生，绑定医生； 护士端 护士扫患者，绑定患者
            req.body.nurseObjectId = item._id
            req.body.dpRelationTime = new Date(item1.time)
            req.body.nurseOpenId = item.openId
            // console.log('item1', item1)
            next()
          } else {
            return res.json({data: {}, msg: '无临时绑定数据，扫码失败！', code: 0})
          }
        })
      } else {
        return res.json({data: {}, msg: '请填写个人信息中的openId!', code: 0})
      }
    }
  })
}

// 绑定护士和患者
exports.bindingPatient = function (req, res) {
  var nurseId = req.body.nurseObjectId
  var patientId = req.patientObject._id
  var dpRelationTime = req.body.dpRelationTime || null
  if (req.body.dpRelationTime === null || req.body.dpRelationTime === '') {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  var query = {'doctorId': nurseId}

  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(422).send(err.message)
    }
    // console.log('item', item)
    // console.log('patientId', patientId)
    if (item !== null) {
      var patientsList = item.patients
      // console.log('patientsList', patientsList)
      for (let i = 0; i < patientsList.length; i++) {
        if (String(patientsList[i].patientId) === String(patientId)) {
          req.isBinding = 1 // 是否绑定过该患者的标志，1表示已绑定过 0表示未绑定过
          return res.json({msg: '已绑定过该患者!', code: 1})
          // return next()
        }
      }
    }
    // console.log('req.isBinding', req.isBinding)
    var upObj = {
      $push: {
        patients: {
          patientId: patientId,
          dpRelationTime: dpRelationTime
        }
      }
    }
    DpRelation.updateOne(query, upObj, function (err, updpRelation) {
      if (err) {
        return res.status(422).send(err.message)
      } else {
        req.isBinding = 0
        // console.log('req.isBinding2', req.isBinding)
        // next()
        return res.json({msg: '绑定患者成功！', results: updpRelation, code: 0})
      }
    }, {upsert: true})
  })
}

// 删除临时绑定数据
exports.deleteOpenIdTmp = function (req, res) {
  let query = {
    'doctorUserId': req.body.patientId,
    'patientOpenId': req.body.nurseOpenId
  }
  OpenIdTmp.remove(query, function (err) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (req.isBinding) {
      return res.json({data: {}, msg: '已绑定过该患者!', code: 1})
    } else {
      return res.json({data: {}, msg: '绑定患者成功！', code: 0})
    }
  })
}

// async改写 ------ POST nurse/bindingPatient ------ 已调试 ------ 2017-09-25 YQC
exports.bindingPatientAsync = function (params, callback) {
  let patientId = params.patientId || null
  if (patientId === null) {
    let err = '请填写patientId!'
    return callback(err)
  }
  let queryP = {userId: patientId, role: 'patient'}
  let nurseId = params.nurseObjectId || null
  if (nurseId === null) {
    let err = '请填写nurseObjectId!'
    return callback(err)
  }
  let queryN = {doctorId: nurseId}

  let dpRelationTime = params.dpRelationTime || null
  if (dpRelationTime === null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(dpRelationTime)
  }

  async.auto({
    getNurse: function (callback) {
      DpRelation.getOne(queryN, function (err, itemN) {
        return callback(err, itemN)
      })
    },
    getPatient: function (callback) {
      Alluser.getOne(queryP, function (err, itemP) {
        if (itemP) {
          return callback(err, itemP)
        } else {
          let err = '不存在的患者ID!'
          return callback(err)
        }
      })
    },
    updateBP: ['getNurse', 'getPatient', function (results, callback) {
      let itemN = results.getNurse || null
      if (itemN !== null) {
        let patientsList = itemN.patients || []
        for (let i = 0; i < patientsList.length; i++) {
          if (String(patientsList[i].patientId) === String(results.getPatient._id)) {
            let err = '已绑定过该患者!'
            return callback(err)
          }
        }
      }

      let patientObjectId = results.getPatient._id
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

// async改写 调用bindingPatientAsync方式与结果处理 ------ 2017-09-25 YQC
exports.bindingPatientAsyncTest = function (req, res) {
  let params = {
    patientId: req.query.patientId || req.body.patientId || null, // 患者userId
    nurseObjectId: req.session._id || null, // 护士_id
    dpRelationTime: req.body.dpRelationTime || null // 绑定时间
  }
  nurseInsuranceWorkCtrl.bindingPatientAsync(params, function (err, results) {
    if (err) {
      return res.json({msg: err, data: results, code: 1})
    } else {
      return res.json({msg: '绑定成功', data: results, code: 0})
    }
  })
}
