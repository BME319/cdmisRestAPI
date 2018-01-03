var config = require('../config')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var DoctorsInCharge = require('../models/doctorsInCharge')
var OpenIdTmp = require('../models/openId')
// var DictNumber = require('../models/dictNumber')
// var Numbering = require('../models/numbering')
var Refreshtoken = require('../models/refreshtoken')
var Sms = require('../models/sms')
var crypto = require('crypto')
var https = require('https')
var querystring = require('querystring')
// var xml2js = require('xml2js')
var webEntry = require('../settings').webEntry
var request = require('request')
var jwt = require('jsonwebtoken')
// var Patient = require('../models/patient')
var commonFunc = require('../middlewares/commonFunc')
var Errorlog = require('../models/errorlog')

var alluserCtrl = require('../controllers_v2/alluser_controller')
var wechatCtrl = require('../controllers_v2/wechat_controller')

// 验证主管、关注患者
exports.dprelation = function (type) {
  return function (req, res, next) {
    if (req.doctorItem) {
      let query = {doctorId: req.doctorItem._id}
      DpRelation.getOne(query, function (err, dpitem) {
        if (err) {
          return res.status(500).json({status: 1, msg: err})
        } else if (dpitem === null) {
          return res.status(401).json({status: 1, msg: '与患者无任何联系没有操作权限'})
        } else {
          let patientId = req.patientItem.userId
          Alluser.getOne({userId: patientId}, function (err, item) {
            if (err) {
              return res.status(500).json({status: 1, msg: err})
            } else if (item === null) {
              return res.status(500).json({status: 1, msg: 'not_found!'})
            } else {
              let patientFlag = 0
              let patientChargeFlag = 0
              if (dpitem.patients) {
                if (dpitem.patients.length) {
                  for (let i = 0; i < dpitem.patients.length; i++) {
                    if (JSON.stringify(dpitem.patients[i].patientId) === JSON.stringify(item._id)) {
                      patientFlag = 1
                      break
                    }
                  }
                }
              }
              if (dpitem.patientsInCharge) {
                if (dpitem.patientsInCharge.length) {
                  for (let i = 0; i < dpitem.patientsInCharge.length; i++) {
                    if (JSON.stringify(dpitem.patientsInCharge[i].patientId) === JSON.stringify(item._id)) {
                      patientChargeFlag = 1
                      break
                    }
                  }
                }
              }
              if ((type.indexOf('charge') + 1) && patientChargeFlag) {
                next()
              } else if ((type.indexOf('follow') + 1) && patientFlag) {
                next()
              } else {
                return res.status(401).json({status: 1, msg: '权限不足'})
              }
            }
          })
        }
      })
    } else {
      // 患者本身也有权限
      next()
    }
  }
}
