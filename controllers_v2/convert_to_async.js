var testCtrl = require('../controllers_v2/convert_to_async')

var async = require('async')
var fs = require('fs')
var request = require('request')

var Message = require('../models/message')
var News = require('../models/news')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var Order = require('../models/order')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')

var commonFunc = require('../middlewares/commonFunc')
var config = require('../config')
var wxApis = {
  // 获取用户信息的access_token
  oauth_access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
  // 统一下单
  unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  // 请求调用微信接口 需要的access_token
  baseToken: 'https://api.weixin.qq.com/cgi-bin/token',
  // 请求调用微信接口 需要的ticket
  getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
  getusercode: 'https://open.weixin.qq.com/connect/oauth2/authorize',
  refresh_token: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
  getuserinfo: 'https://api.weixin.qq.com/sns/userinfo',
  verifyaccess_token: 'https://api.weixin.qq.com/sns/auth',
  // 查询订单
  orderquery: 'https://api.mch.weixin.qq.com/pay/orderquery',
  // 关闭订单
  closeorder: 'https://api.mch.weixin.qq.com/pay/closeorder',
  // 申请退款
  refund: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
  // 查询退款
  refundquery: 'https://api.mch.weixin.qq.com/pay/refundquery',
  // 发送消息模板
  messageTemplate: 'https://api.weixin.qq.com/cgi-bin/message/template/send',
  // download
  download: 'http://file.api.weixin.qq.com/cgi-bin/media/get',
  // createTDCticket 创建永久二维码
  createTDCticket: 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
  // 自定义菜单
  // 创建
  createCustomMenu: 'https://api.weixin.qq.com/cgi-bin/menu/create',
  // 查询
  getCustomMenu: 'https://api.weixin.qq.com/cgi-bin/menu/get',
  // 删除
  deleteCustomMenu: 'https://api.weixin.qq.com/cgi-bin/menu/delete'
}
var xml2js = require('xml2js')

// ------ POST patient/favoriteDoctor ------ 已调试
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

// ------ POST nurse/bindingPatient ------ 未调试
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

// ------ POST new/news(temp) ------

// ------ POST new/teamNews(temp) ------

// ------ POST wechat/refund ------ 未调试
exports.wechatRefundAsync = function (req, res, callback) {
  let orderNo = req.body.orderNo || null
  if (orderNo === null) {
    return res.status(412).send('请填写orderNo')
  }
  let targetDate = commonFunc.getNowFormatDate()
  async.auto({
    getDict9: function (callback) {
      let query = {type: 9}
      DictNumber.getOne(query, function (err, item) {
        return callback(err, item)
      })
    },
    getSeries9: ['getDict9', function (results, callback) {
      let _DateFormat = results.getDict9.dateFormat
      let _Date = null
      if (_DateFormat === 'YYMMDD') {
        _Date = targetDate.substring(2, 8)
      } else if (_DateFormat === 'YYYYMMDD') {
        _Date = targetDate
      }
      let _KeyDate = '99999999'
      if ((_Date || null) !== null) {
        _KeyDate = targetDate
      }
      let query = {type: 9, date: _KeyDate}
      Numbering.updateOne(query, {$inc: {number: 1}}, function (err, item) {
        return callback(err, item)
      }, {upsert: true, new: true})
    }],
    getNo9: ['getDict9', 'getSeries9', function (results, callback) { // 获取new messageId
      let _Initial = results.getDict9.initStr

      let _Date
      let _DateFormat = results.getDict9.dateFormat
      if (_DateFormat === 'YYMMDD') {
        _Date = targetDate.substring(2, 8)
      } else if (_DateFormat === 'YYYYMMDD') {
        _Date = targetDate
      }

      let _TrnNumberingNo
      if (results.getSeries9 === null) {
        _TrnNumberingNo = 0
      } else {
        _TrnNumberingNo = results.getSeries9.number
      }
      let _Seq = _TrnNumberingNo

      let _SeqLength = results.getDict9.seqLength
      let _AlphamericFlag = results.getDict9.alphamericFlag
      if (_AlphamericFlag === 1) {
        _Seq = commonFunc.ConvAlphameric(_Seq)
      }
      if (_Seq.toString().length > _SeqLength) {
        _TrnNumberingNo = 1
        _Seq = 1
      }
      // console.log(_Seq)
      if (_Seq.toString().length < _SeqLength) {
        let n = _SeqLength - _Seq.toString().length
        while (n) {
          _Seq = '0' + _Seq
          n = n - 1
        }
      }
      let _Ret = _Initial + _Date + _Seq
      callback(null, {newId: _Ret})
    }],
    checkPayStatus: function (callback) { // 查询该订单是否为“已支付”（paystatus = 2）状态
      let query = {orderNo: orderNo, paystatus: 2}
      Order.getOne(query, function (err, item) {
        if (item) {
          return callback(err, item)
        } else {
          return res.status(400).send('不存在的订单')
        }
      })
    },
    changeRefundStatus: ['checkPayStatus', 'getNo9', function (results, callback) { // 将订单状态修改为6 退款处理中
      let query = {orderNo: orderNo}
      let upObj = {
        paystatus: 6, // 退款处理中
        refundNo: results.getNo9.newId,
        refundAppTime: new Date()
      }
      Order.updateOne(query, upObj, function (err, upOrder) {
        if (upOrder) {
          return callback(err, upOrder)
        } else {
          return res.status(400).send('不存在的订单')
        }
      }, {new: true})
    }],
    chooseAppId: function (callback) {
      let role = req.query.role || req.body.role
      if (role === 'doctor') {
        return callback(null, config.wxDeveloperConfig.sjkshz)
        // req.wxApiUserObject = config.wxDeveloperConfig.sjkshz
      } else if (role === 'patient') {
        return callback(null, config.wxDeveloperConfig.ssgj)
        // req.wxApiUserObject = config.wxDeveloperConfig.ssgj
      } else if (role === 'test') {
        return callback(null, config.wxDeveloperConfig.test)
        // req.wxApiUserObject = config.wxDeveloperConfig.test
      } else if (role === 'appPatient') {
        return callback(null, config.wxDeveloperConfig.appssgj)
        // req.wxApiUserObject = config.wxDeveloperConfig.appssgj
      } else if (role === 'appDoctor') {
        return callback(null, config.wxDeveloperConfig.appsjkshz)
        // req.wxApiUserObject = config.wxDeveloperConfig.appsjkshz
      } else {
        return res.status(400).send('role do not exist!')
      }
    },
    refund: ['changeRefundStatus', 'chooseAppId', function (results, callback) {
      let paramData = {
        appid: results.chooseAppId.appid,   // 公众账号ID
        mch_id: results.chooseAppId.merchantid,   // 商户号
        nonce_str: commonFunc.randomString(32),   // 随机字符串
        sign_type: 'MD5',
        out_trade_no: results.changeRefundStatus.orderNo,     // 商户订单号
        out_refund_no: results.changeRefundStatus.refundNo,
        total_fee: results.changeRefundStatus.money,
        refund_fee: results.changeRefundStatus.money
      }

      let signStr = commonFunc.rawSort(paramData)
      signStr = signStr + '&key=' + results.chooseAppId.merchantkey

      paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
      let xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
      let xmlString = xmlBuilder.buildObject(paramData)

      // 读取商户证书
      let pfxpath = results.chooseAppId.pfxpath

      request({
        url: wxApis.refund,
        method: 'POST',
        body: xmlString,
        agentOptions: {
          pfx: fs.readFileSync(pfxpath),
          passphrase: results.chooseAppId.merchantid
        }
      }, function (err, response, body) {
        if (err) {
          return callback(err)
        } else {
          xml2js.parseString(body, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
            return callback(err, result || {})
          })
        }
      })
    }],
    refundMessage: ['refund', 'getNo9', function (results, callback) {
      let messageData = {
        messageId: results.getNo9.newId,
        userId: results.changeRefundStatus.userId,
        type: 6,
        readOrNot: 0,
        sendBy: 'System',
        time: new Date(),
        title: '退款申请成功',
        description: '您的退款申请已成功提交，本系统有延迟，实际退款状态以微信支付通知为准'
      }

      let newMessage = new Message(messageData)
      newMessage.save(function (err, messageInfo) {
        return callback(err, messageInfo)
      })
    }],
    refundNews: ['refundMessage', function (results, callback) {
      let newsData = {
        messageId: results.getNo9.newId,
        userId: results.changeRefundStatus.userId,
        userRole: 'patient',
        // 以下面的为准
        // userRole: req.session.role,
        sendBy: 'System',
        readOrNot: 0,
        type: 6,
        time: results.refundMessage.time,
        title: results.refundMessage.title,
        description: results.refundMessage.description
      }

      let newNews = new News(newsData)
      newNews.save(function (err, newsInfo) {
        callback(err, newsInfo)
      })
    }]
  }, function (err, results) {
    return callback(err, results)
  })
}

// ------ POST services/message ------

// ------ POST communication/communication ------

// ------ GET communication/team ------

// ------ POST wechat/messageTemplate ------

// ------ GET wechat/download ------
