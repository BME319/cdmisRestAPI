// var NurseInsuranceWork = require('../models/nurseInsuranceWork')
var Alluser = require('../models/alluser')
var OpenIdTmp = require('../models/openId')
var DpRelation = require('../models/dpRelation')

// 获取护士推送保险信息的患者列表  2017-08-01 lgf
exports.getInsurancePatientsList = function (req, res) {
  var nurseId = req.userObject._id
  var query = {
    'doctorId': nurseId
  }
  let opts = {}
  let fields = {}
  let populate = {
    'path': 'patientId'
  }
  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log('item', item)
    if (item === null) {
      return res.json({data: {}, msg: '该护士无绑定患者！', code: 1})
    } else {
      return res.json({data: item.patients, msg: '获取患者列表成功！', code: 1})
    }
  }, opts, fields, populate)
}

// 插入护士推送保险信息  2017-08-01 lgf
// exports.updateInsuranceWork = function (req, res, next) {
//   var nurseId = req.session.userId
//   var patientId = req.userObject._id
//   var time
//   if (req.body.time === null || req.body.time === '' || req.body.time === undefined) {
//     time = new Date()
//   } else {
//     time = new Date(req.body.time)
//   }
//   var query = {
//     'nurseId': nurseId,
//     'patientId': patientId
//   }
//   var upObj = {
//     $set: {
//       'time': time
//     }
//   }
//   NurseInsuranceWork.update(query, upObj, function (err, upInsuranceWork) {
//     if (err) {
//       return res.status(500).send(err.message)
//     } else {
//       return res.json({results: upInsuranceWork})
//     }
//   })
// }

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
            req.body.dpRelationTime = Date()
            req.body.nurseOpenId = item.openId
            // console.log('item1', item1)
            next()
          } else {
            return res.json('无临时绑定数据！')
          }
        })
      } else {
        return res.json('请填写个人信息中的openId!')
      }
    }
  })
}

// 绑定护士和患者
exports.bindingPatient = function (req, res, next) {
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
    console.log('patientId', patientId)
    if (item !== null) {
      var patientsList = item.patients
      console.log('patientsList', patientsList)
      for (let i = 0; i < patientsList.length; i++) {
        if (String(patientsList[i].patientId) === String(patientId)) {
          return res.json({data: {}, msg: '已绑定过该患者!', code: 0})
          // next()
        }
      }
    }
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
        next()
        // return res.json({msg: '绑定患者成功！', results: updpRelation, code: 1})
      }
      // return res.json({result:updpRelation})
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
    return res.json({data: {}, msg: '绑定患者成功！删除临时数据成功!', code: 1})
  })
}
