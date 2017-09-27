var request = require('request')
var xml2js = require('xml2js')
var moment = require('moment')
var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var async = require('async')

var config = require('../config')
var webEntry = require('../settings').webEntry
var commonFunc = require('../middlewares/commonFunc')
var Alluser = require('../models/alluser')
// var Doctor = require('../models/doctor')
var OpenIdTmp = require('../models/openId')
var Order = require('../models/order')
var Message = require('../models/message')
var News = require('../models/news')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Counsel = require('../models/counsel')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')

var wechatCtrl = require('../controllers_v2/wechat_controller')

// appid: wx8a6a43fb9585fb7c;secret: b23a4696c3b0c9b506891209d2856ab2

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

// var wxApiUserObject = config.wxDeveloperConfig.zdyyszbzx;

// 根据角色获取AppId
exports.chooseAppId = function (req, res, next) {
  var role = req.query.role || req.body.role
  // var role = req.session.role
  // console.log("test1");
  // console.log('role', role)
  if (role === 'doctor') {
    req.wxApiUserObject = config.wxDeveloperConfig.sjkshz
    next()
  } else if (role === 'patient') {
    req.wxApiUserObject = config.wxDeveloperConfig.ssgj
    next()
  } else if (role === 'test') {
    req.wxApiUserObject = config.wxDeveloperConfig.test
    next()
  } else if (role === 'appPatient') {
    req.wxApiUserObject = config.wxDeveloperConfig.appssgj
    next()
  } else if (role === 'appDoctor') {
    req.wxApiUserObject = config.wxDeveloperConfig.appsjkshz
    next()
  } else {
    return res.status(400).send('role do not exist!')
  }
}

// 加密签名signature检验
// 验证消息的确来自微信服务器
// 验证成功，原样返回echostr参数内容，则接入生效
exports.getServerSignature = function (req, res) {
  // signature微信加密签名，timestamp时间戳，nonce随机数，echostr随机字符串
  var signature = req.query.signature
  var timestamp = req.query.timestamp
  var nonce = req.query.nonce
  var token = config.getServerSignatureTOKEN
  var echostr = req.query.echostr

  // 将token、timestamp、nonce三个参数进行字典序排序
  var sha1Gen = crypto.createHash('sha1')
  // .sort()对数组元素进行字典排序, .join('')必须加参数空字符''
  var input = [token, timestamp, nonce].sort().join('')
  // 将三个参数字符串拼接成一个字符串进行sha1加密
  var sha1 = sha1Gen.update(input).digest('hex')

  // 若sha1与signature相等，返回echostr；否则返回400错误
  if (sha1 === signature) {
    res.status(200).send(echostr)
  } else {
    res.sendStatus(400)
  }

  // dataCheck = {
  //   token: token,
  //   timestamp: timestamp,
  //   nonce: nonce
  // };

  // var signStr = commonFunc.rawSort(dataCheck);
  // var tmpSign = commonFunc.convertToSha1(signStr, true);

  // if( tmpSign == signature ){
  //   return true;
  // }else{
  //   return false;
  // }
}

// exports.getAccessToken = function (req, res) {
//     // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

//     request.get({
//         url: 'https://api.weixin.qq.com/cgi-bin/token?' +
//         'grant_type=client_credential' +
//         '&appid=' + wxApiUserObject.appid +
//         '&secret=' + wxApiUserObject.appsecret,
//         json: true
//     }, function (err, response, body) {
//         if(err){
//             return res.status(403).send('获取授权失败' + err.errmsg);
//         }
//         res.json({results:body});

//     });
// };

// exports.getAccessTokenMid = function (req, res, next) {
//     // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

//     request.get({
//         url: 'https://api.weixin.qq.com/cgi-bin/token?' +
//         'grant_type=client_credential' +
//         '&appid=' + wxApiUserObject.appid +
//         '&secret=' + wxApiUserObject.appsecret,
//         json: true
//     }, function (err, response, body) {
//         if(err){
//             return res.status(403).send('获取授权失败' + err.errmsg);
//         }
//         req.wxTokenObj = body;
//         next();
//     });
// };

// exports.wxJsApiTicket = function(req, res, next) {

//   var api_url = wxApis.getticket + '?access_token=' + req.wxTokenObj.access_token + '&type=jsapi';

//   request({
//     method: 'GET',
//     url: api_url,
//     json: true
//   }, function(err, response, body) {

//     req.ticketObject = {
//       errcode: body.errcode,
//       errmsg: body.errmsg,
//       jsapi_ticket: body.ticket,
//       expires_in: body.expires_in
//     };
//    next();
//   });
// }

exports.settingConfig = function (req, res) {
  var ticketObject = req.wxToken || {}
  var requestUrl = req.query.url

  var paramData = {
    url: requestUrl,
    timestamp: commonFunc.createTimestamp(),
    noncestr: commonFunc.createNonceStr(),
    jsapi_ticket: ticketObject.jsapi_ticket
  }

  var signstr = commonFunc.rawSort(paramData)
  var signature = commonFunc.convertToSha1(signstr, false)

  res.json({results: {
    debug: false,
    appId: req.wxApiUserObject.appid,
    timestamp: paramData.timestamp,
    nonceStr: paramData.noncestr,
    signature: signature,
    jsApiList: []
  }})
}

// 获取用户信息的access_token
exports.gettokenbycode = function (req, res, next) {
  var paramObject = req.query || {}

  var code = paramObject.code
  var state = paramObject.state
  // console.log(code)
  var url = wxApis.oauth_access_token + '?appid=' + req.wxApiUserObject.appid +
            '&secret=' + req.wxApiUserObject.appsecret +
            '&code=' + code +
            '&grant_type=authorization_code'

  request.get({
    url: url,
    json: true
  }, function (err, response, body) {
    if (err) return res.status(401).send('换取网页授权access_token失败!')

    // console.log(body)
    var wechatData = {
      access_token: body.access_token,
      // express_in为凭证有效时间
      expires_in: body.expires_in,
      refresh_token: body.refresh_token,
      openid: body.openid,
      // scope用户授权的作用域
      scope: body.scope,
      unionid: body.unionid
    }
    // 如果网页授权作用域为snsapi_base,返回wechatData；否则进行下一步
    if (wechatData.scope === 'snsapi_base') {
      return res.json({results: wechatData})
    } else if (wechatData.scope === 'snsapi_userinfo') {
      req.wechatData = wechatData
      req.state = state

      next()
    } else {
      req.wechatData = wechatData
      req.state = state
      next()
    }
  })
}

// 返回token信息
exports.returntoken = function (req, res) {
  return res.json({result: req.wechatData})
}

// exports.refresh_token = function (req, res, next) {
//   var refreshToken = req.query.refresh_token

//   var apiUrl = wxApis.refresh_token + '?appid=' + paramData.appid + '&grant_type=refresh_token' + '&refresh_token=' + refreshToken

//   request({
//     method: 'GET',
//     url: apiUrl,
//     json: true
//   }, function (err, response, body) {
//     var wechatData = {
//       access_token: body.access_token, // 获取用户信息的access_token
//       expires_in: body.expires_in,
//       refresh_token: body.refresh_token,
//       openid: body.openid,
//       scope: body.scope//,
//             // unionid: body.unionid,
//             // api_type: 1
//     }
//     res.json(wechatData)
//     next()
//   })
// }

// 验证token
exports.verifyaccess_token = function (req, res, next) {
  var openid = req.query.openid
  var accessToken = req.query.access_token

  var apiUrl = wxApis.verifyaccess_token + '?access_token=' + accessToken + '&openid=' + openid

  request({
    method: 'GET',
    url: apiUrl,
    json: true
  }, function (err, response, body) {
    var wechatData = {
      access_token: body.access_token,
      expires_in: body.expires_in,
      refresh_token: body.refresh_token,
      openid: body.openid,
      scope: body.scope
    }
    // errcode为0，表示验证成功
    if (body.errcode === 0) {
      res.json(wechatData)
      next()
    } else {
      return res.status(401).send('验证access_token失败!')
    }
  })
}

// 获取用户信息
// 返回openid,nickname,sex,province,city,country,headimgurl,privilege,unionid
exports.getuserinfo = function (req, res) {
  var openid = req.wechatData.openid
  var accessToken = req.wechatData.access_token

  var apiUrl = wxApis.getuserinfo + '?access_token=' + accessToken + '&openid=' + openid + '&lang=zh_CN'

  request({
    method: 'GET',
    url: apiUrl,
    json: true
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    var wechatData = {
      openid: body.openid,
      nickname: body.nickname,
      sex: body.sex,
      province: body.province,
      city: body.city,
      country: body.country,
      headimgurl: body.headimgurl,
      privilege: body.privilege,
      unionid: body.unionid
    }
    res.json({results: wechatData})
  })
}

// 订单相关方法

// 统一下单   请求api获取prepay_id的值
exports.addOrder = function (req, res, next) {
  var orderObject = req.orderObject || {}
  orderObject['attach'] = '123'        // req.state;
  // console.log(orderObject);
  // console.log(req.body);
  var currentDate = new Date()
  var ymdhms = moment(currentDate).format('YYYYMMDDhhmmss')
  var outTradeNo = orderObject.orderNo
  var totalFee = parseInt(orderObject.money)

  // var detail = '<![CDATA[{"goods_detail":' + JSON.stringify(orderObject.goodsInfo) + '}]]>'
    // console.log(commonFunc.getClientIp(req).split(':')[3]);
  var paramData = {
    appid: req.wxApiUserObject.appid,   // 公众账号ID
    mch_id: req.wxApiUserObject.merchantid,   // 商户号

    nonce_str: commonFunc.randomString(32),   // 随机字符串

    body: req.body.body_description,    // 商品描述
    attach: orderObject.attach,    // 附加数据   state

    out_trade_no: outTradeNo,   // 商户订单号

    total_fee: totalFee,   // 标价金额
    // spbill_create_ip: req.body.ip,   // 终端IP
    spbill_create_ip: commonFunc.getClientIp(req),   // 终端IP
    time_start: ymdhms,     // 交易起始时间
    // 异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。
    notify_url: 'http://' + webEntry.domain + '/api/v2/wechat/payResult',   // 通知地址
    trade_type: req.body.trade_type    // 交易类型
    // openid: req.body.openid    // 用户标识
  }
  // console.log(paramData);
  // console.log(paramData.trade_type);
  if (paramData.trade_type === 'JSAPI') {
    // wechat pay
    paramData['openid'] = req.body.openid
  }

  var signStr = commonFunc.rawSort(paramData)
  signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey

  paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
  var xmlString = xmlBuilder.buildObject(paramData)

  request({
    url: wxApis.unifiedorder,
    method: 'POST',
    body: xmlString
  }, function (err, response, body) {
    var prepayId = ''
    // console.log(body)

    if (!err && response.statusCode === 200) {
      var parser = new xml2js.Parser()
      var data = {}
      parser.parseString(body, function (err, result) {
        data = result || {}
      })

      // 微信生成的预支付会话标识，用于后续接口调用中使用，该值有效期为2小时
      prepayId = data.xml.prepay_id
      req.prepay_id = prepayId
      // console.log(prepayId)
      next()

      // res.redirect('/zbtong/?#/shopping/wxpay/'+ orderObject.oid +'/' + data.xml.prepay_id);
    } else {
      return res.status(500).send('Error')
    }
  })
}

// 生成微信PaySign，用于发起微信支付请求
exports.getPaySign = function (req, res, next) {
  var prepayId = req.prepay_id
  var wcPayParams

  var signStr
  if (req.body.trade_type === 'JSAPI') {
    // wcPayParams['package'] = "prepay_id=" + prepay_id;
    wcPayParams = {
      'appId': req.wxApiUserObject.appid,     // 公众号名称，由商户传入
      'timeStamp': commonFunc.createTimestamp(),         // 时间戳，自1970年以来的秒数
      'nonceStr': commonFunc.createNonceStr(), // 随机串
      // 通过统一下单接口获取
      'package': 'prepay_id=' + prepayId,
      'signType': 'MD5'        // 微信签名方式
    }
    signStr = commonFunc.rawSort(wcPayParams)
    signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey
    wcPayParams.paySign = commonFunc.convertToMD5(signStr, true)  // 微信支付签名
    // console.log(wcPayParams);
    res.json({ results: {
      appId: req.wxApiUserObject.appid,
      timestamp: wcPayParams.timeStamp,
      nonceStr: wcPayParams.nonceStr,
      package: wcPayParams.package,
      signType: wcPayParams.signType,
      paySign: wcPayParams.paySign,
      prepay_id: req.prepay_id
    }})
  } else {
    wcPayParams = {
      'appid': req.wxApiUserObject.appid,     // 公众号名称，由商户传入
      'partnerid': req.wxApiUserObject.merchantid,
      'prepayid': prepayId,
      'timestamp': commonFunc.createTimestamp(),         // 时间戳，自1970年以来的秒数
      'noncestr': commonFunc.createNonceStr(), // 随机串
      // 通过统一下单接口获取
      'package': 'Sign=WXPay'
    }
    signStr = commonFunc.rawSort(wcPayParams)
    signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey
    wcPayParams.paySign = commonFunc.convertToMD5(signStr, true)  // 微信支付签名
    // console.log(wcPayParams);
    res.json({ results: {
      appId: req.wxApiUserObject.appid,
      timestamp: wcPayParams.timestamp,
      nonceStr: wcPayParams.noncestr,
      package: wcPayParams.package,
      paySign: wcPayParams.paySign,
      prepay_id: req.prepay_id
    }})
  }
}

// 支付结果通知
exports.payResult = function (req, res) {
  // console.log('payResult111')

  var body = ''
  var results = ''

  req.on('data', function (data) {
    body += data
    // console.log("partial: " + body);
  })
  req.on('end', function () {
    // console.log('finish: ' + body)
    var parser = new xml2js.Parser()
    var jsondata = {}

    parser.parseString(body, function (err, result) {
      jsondata = result || {}
    })
    // console.log(jsondata)
    var payRes = jsondata.xml
    var paytime = payRes.time_end[0]
    paytime = paytime.substr(0, 4) + '-' + paytime.substr(4, 2) + '-' + paytime.substr(6, 2) + 'T' + paytime.substr(8, 2) + ':' + paytime.substr(10, 2) + ':' + paytime.substr(12, 2)
    paytime = new Date(paytime)
    paytime = new Date(paytime.valueOf() - 8 * 60 * 60 * 1000)

    var orderNo = payRes.out_trade_no[0].split('-')[0]

    var query = {
      orderNo: orderNo
    }

    Order.getOne(query, function (err, item) {
      if (err) {
        results = err.errmsg
      } else {
            // res.json({results: item});
        var upObj
        if (payRes.result_code[0] === 'SUCCESS') {
          if (item.paystatus !== 2) {    // 非成功
            upObj = {
              paystatus: 2,
              paytime: paytime
            }

            Order.updateOne(query, {$set: upObj}, function (err, item) {
              if (err) {
                results = err.errmsg
              } else {
                results = 'success'
              }
            })
          } else {   // 成功
            results = 'success'
          }
        } else {       // payRes.result_code === 'FAIL'
          if (item.paystatus !== 3) {    // 非失败
            upObj = {
              paystatus: 3,
              paytime: paytime
            }

            Order.updateOne(query, {$set: upObj}, function (err, item) {
              if (err) {
                results = err.errmsg
              } else {
                results = 'success'
              }
            })
          } else {   // 失败
            results = 'success'
          }
        }
      }
    })
  })
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(results)
}

// 查询订单
exports.getWechatOrder = function (req, res) {
  var paramData = {
    appid: req.wxApiUserObject.appid,   // 公众账号ID
    mch_id: req.wxApiUserObject.merchantid,   // 商户号
    out_trade_no: req.query.orderNo,     // 商户订单号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type: 'MD5'
  }

  var signStr = commonFunc.rawSort(paramData)
  signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey

  paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
  var xmlString = xmlBuilder.buildObject(paramData)

  request({
    url: wxApis.orderquery,
    method: 'POST',
    body: xmlString
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      res.json({results: body})
    } else {
      return res.status(500).send('Error')
    }
  })
}

// 关闭订单
exports.closeWechatOrder = function (req, res) {
  var paramData = {
    appid: req.wxApiUserObject.appid,   // 公众账号ID
    mch_id: req.wxApiUserObject.merchantid,   // 商户号
    out_trade_no: req.query.orderNo,     // 商户订单号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type: 'MD5'
  }

  var signStr = commonFunc.rawSort(paramData)
  signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey

  paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
  var xmlString = xmlBuilder.buildObject(paramData)

  request({
    url: wxApis.closeorder,
    method: 'POST',
    body: xmlString
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      res.json({results: body})
    } else {
      return res.status(500).send('Error')
    }
  })
}

// 申请退款
exports.refund = function (req, res, next) {
  // 请求参数
  var paramData = {
    appid: req.wxApiUserObject.appid,   // 公众账号ID
    mch_id: req.wxApiUserObject.merchantid,   // 商户号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type: 'MD5',
    out_trade_no: req.orderDetail.orderNo,     // 商户订单号
    out_refund_no: req.orderDetail.refundNo,
    total_fee: req.orderDetail.money,
    refund_fee: req.orderDetail.money
    // op_user_id: req.wxApiUserObject.merchantid // 默认为商户号
  }

  var signStr = commonFunc.rawSort(paramData)
  signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey

  paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
  var xmlString = xmlBuilder.buildObject(paramData)

  // 读取商户证书
  var pfxpath = req.wxApiUserObject.pfxpath

  // console.log(wxApis.refund);
  // console.log(xmlString);
  // console.log(pfxpath);
  // console.log(req.wxApiUserObject.merchantid);
  // return res.json({result: 'finish'});

  request({
    url: wxApis.refund,
    method: 'POST',
    body: xmlString,
    agentOptions: {
      pfx: fs.readFileSync(pfxpath),
      passphrase: req.wxApiUserObject.merchantid
    }
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send(err)
    } else {
      // return res.json({results: body});
      var jsondata
      xml2js.parseString(body, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
        jsondata = result || {}
      })
      // return res.json({results: jsondata})
      req.refundData = jsondata
      next()
    }
  })

  // // https请求  //  refund:'/secapi/pay/refund',
  // var options = {
  //   hostname: 'api.mch.weixin.qq.com',
  //   port: 443,
  //   path: '/secapi/pay/refund',
  //   method: 'POST',
  //   // key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  //   cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
  // };

  // var req = https.request(options, (res) => {
  //   // console.log('statusCode:', res.statusCode);
  //   // console.log('headers:', res.headers);

  //   res.on('data', (d) => {
  //     // process.stdout.write(d);
  //     res.json({results:d});
  //   });
  // });
  // req.on('error', (e) => {
  //   console.error(e);
  // });
  // req.end();
}
// 申请退款后自动发消息 2017-07-14 GY
exports.refundMessage = function (req, res) {
  let messageData = {
    messageId: req.newId,
    userId: req.orderDetail.userId,
    type: 6,
    readOrNot: 0,
    sendBy: 'System',
    time: new Date(),
    title: '退款申请成功',
    description: '您的退款申请已成功提交，本系统有延迟，实际退款状态以微信支付通知为准'
  }
  let newsData = {
    messageId: req.newId,
    userId: req.orderDetail.userId,
    userRole: 'patient',
    // 以下面的为准
    // userRole: req.session.role,
    sendBy: 'System',
    readOrNot: 0,
    type: 6,
    time: messageData.time,
    title: messageData.title,
    description: messageData.description
  }

  let newMessage = new Message(messageData)
  let newNews = new News(newsData)
  newMessage.save(function (err, messageInfo) {
    if (err) {
      return res.status(500).send(err)
    }
    newNews.save(function (err, newsInfo) {
      if (err) {
        return res.status(500).send(err)
      }
      return res.json({results: req.refundData})
    })
  })
}

// 查询退款
exports.refundquery = function (req, res, next) {
  var paramData = {
    appid: req.wxApiUserObject.appid,   // 公众账号ID
    mch_id: req.wxApiUserObject.merchantid,   // 商户号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type: 'MD5',
    out_trade_no: req.orderDetail.orderNo     // 商户订单号
  }

  var signStr = commonFunc.rawSort(paramData)
  signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey

  paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
  var xmlString = xmlBuilder.buildObject(paramData)

  request({
    url: wxApis.refundquery,
    method: 'POST',
    body: xmlString
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send(err)
    } else {
      // return res.json({results: body});
      var jsondata
      xml2js.parseString(body, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
        jsondata = result || {}
      })

      if (jsondata.xml.return_code === 'FAIL') {
        return res.json({results: jsondata.xml})
      } else if (jsondata.xml.return_code === 'SUCCESS' && jsondata.xml.result_code === 'SUCCESS') {
        req.refundQueryMsg = jsondata.xml
        // console.log(req.refundQueryMsg);
        next()
      } else {
        return res.status(404).json({results: jsondata.xml})
      }
    }
  })
}

// 扫描订单 调用微信退款查询接口 更改订单状态 2017-07-16 GY
exports.autoRefundQuery = function () {
  let query = {paystatus: 6}
  let orderNos = []
  let wxApiUserObject = [config.wxDeveloperConfig.ssgj, config.wxDeveloperConfig.appssgj]
  // console.log(wxApiUserObject)
  function refundQuery (orderNosIndex, rolesIndex) {
    let paramData = {
      appid: wxApiUserObject[rolesIndex].appid,   // 公众账号ID
      mch_id: wxApiUserObject[rolesIndex].merchantid,   // 商户号
      nonce_str: commonFunc.randomString(32),   // 随机字符串
      sign_type: 'MD5',
      out_trade_no: orderNos[orderNosIndex]     // 商户订单号
    }
    let signStr = commonFunc.rawSort(paramData)
    signStr = signStr + '&key=' + wxApiUserObject[rolesIndex].merchantkey
    paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
    let xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
    let xmlString = xmlBuilder.buildObject(paramData)
    // console.log(paramData)

    request({
      url: wxApis.refundquery,
      method: 'POST',
      body: xmlString
    }, function (err, response, body) {
      if (err) {
        console.log(new Date(), err)
        // console.log(new Date(), 'debug_label_2')
        if (rolesIndex < wxApiUserObject.length - 1) {
          refundQuery(orderNosIndex, ++rolesIndex)
        } else if (orderNosIndex < orderNos.length - 1) {
          refundQuery(++orderNosIndex, 0)
        } else {
          let info = 'auto_refund_query_success:_' + orderNos.length + '_orders_query_success'
          console.log(new Date(), info, orderNos)
        }
      } else {
        let jsondata
        xml2js.parseString(body, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
          jsondata = result || {}
        })
        if (jsondata.xml.return_code === 'SUCCESS' && jsondata.xml.result_code === 'SUCCESS') {
          console.log(new Date(), jsondata.xml)
          // 修改数据库中订单状态
          let queryOrder = {orderNo: orderNos[orderNosIndex]}
          let upObj = {
            paystatus: 9,
            refundScuTime: new Date(jsondata.xml.refund_success_time_0)
          }
          Order.updateOne(queryOrder, upObj, function (err, uporder) {
            if (err) {
              console.log(new Date(), err)
              // console.log(new Date(), 'debug_label_3')
            }
            if (rolesIndex < wxApiUserObject.length - 1) {
              refundQuery(orderNosIndex, ++rolesIndex)
            } else if (orderNosIndex < orderNos.length - 1) {
              refundQuery(++orderNosIndex, 0)
            } else {
              let info = 'auto_refund_query_success:_' + orderNos.length + '_orders_query_success'
              console.log(new Date(), info, orderNos)
            }
          })
        } else {
          // return res.status(404).json({results: jsondata.xml})
          console.log(new Date(), jsondata.xml)
          // console.log('debug_label_1')
          if (rolesIndex < wxApiUserObject.length - 1) {
            refundQuery(orderNosIndex, ++rolesIndex)
          } else if (orderNosIndex < orderNos.length - 1) {
            refundQuery(++orderNosIndex, 0)
          } else {
            let info = 'auto_refund_query_success:_' + orderNos.length + '_orders_query_success'
            console.log(new Date(), info, orderNos)
          }
        }
      }
    })
  }

  Order.getSome(query, function (err, orderItems) {
    if (err) { console.log(new Date(), 'getOrderItemErr') }
    // console.log(orderItems)
    if (orderItems.length > 0) {
      for (let i = 0; i < orderItems.length; i++) { orderNos[i] = orderItems[i].orderNo }
      // console.log(orderNos)
      refundQuery(0, 0)
    } else {
      console.log(new Date(), 'auto_refund_query_success:_no_order_need_to_query')
    }
  })
}

// 超时结束并且未回复的咨询退款 2017-09-14 GY
exports.autoRefundCounsel = function () {
  function add0 (m) {
    return m < 10 ? '0' + m : m
  }
  function add00 (m) {
    return m < 10 ? '00' + m : (m < 100 ? '0' + m : m)
  }
  let now = new Date()
  let y = now.getFullYear()
  let m = now.getMonth() + 1
  let d = now.getDate()
  let h = now.getHours()

  let start_zone = now - 60 * 60 * 1000 - 2 * 60 * 1000
  // let start_zone = now - 24 * 60 * 60 * 1000
  let queryCounselId = {
    endTime: {$gt: start_zone, $lt: now},
    reply: 0
  }
  let fieldCACS = {counselId: 1}
  // 根据时间区间和0回复查询counselId，得到需要退款的咨询ID(array)
  Counselautochangestatus.getSome(queryCounselId, function (err, counselItems) {
    if (err) {
      console.log(new Date(), err)
    } else if (counselItems.length === 0) {
      console.log(now, 'auto_refund_success:_no_counsels_auto_ended')
    } else {
      let counselIds = []
      let counsel_ids = []
      // 遍历需要退款的ID，依次退款
      for (let i = 0; i < counselItems.length; i++) {
        if (counselItems[i].counselId) {
          let querycounsel_id = {counselId: counselItems[i].counselId}
          // 根据counselId查询counsels表中的_id
          Counsel.getOne(querycounsel_id, function (err, CounselItem) {
            if (err) {
              console.log(new Date(), err)
              if (i === counselItems.length - 1) {
                console.log(new Date(), 'auto_refund_success:_finish')
              }
            } else if (CounselItem === null) {
              console.log(new Date(), 'counselId_' + counselItems[i].counselId + '_not_found')
              if (i === counselItems.length - 1) {
                console.log(new Date(), 'auto_refund_success:_finish')
              }
            } else {
              // 注意order表里字段名：conselObject不是counselObject
              let queryOrder = {conselObject: CounselItem._id}
              // 根据counsels表中的_id查询需要进行退款的orderNo
              Order.getSome(queryOrder, function (err, orderItems) {
                if (err) {
                  console.log(new Date(), err)
                  if (i === counselItems.length - 1) {
                    console.log(new Date(), 'auto_refund_success:_finish')
                  }
                } else if (orderItems.length === 0) {
                  console.log(new Date(), 'counsel_id_' + CounselItem._id + '_not_found')
                  if (i === counselItems.length - 1) {
                    console.log(new Date(), 'auto_refund_success:_finish')
                  }
                } else {
                  for (let i = 0; i < orderItems.length; i++) {
                    // 验证订单支付状态
                    if (orderItems[i].paystatus === 2 && orderItems[i].freeFlag === 0) {
                      // 生成退款单号
                      let refundNo = 'Rauto' + y + add0(m) + add0(d) + add0(h) + add00(i)
                      // 尝试在所有商户提交退款请求
                      for (let value in config.wxDeveloperConfig) {
                        if (config.wxDeveloperConfig[value].pfxpath) {
                          // 请求参数
                          let paramData = {
                            appid: config.wxDeveloperConfig[value].appid,   // 公众账号ID
                            mch_id: config.wxDeveloperConfig[value].merchantid,   // 商户号
                            nonce_str: commonFunc.randomString(32),   // 随机字符串
                            sign_type: 'MD5',
                            out_trade_no: orderItems[i].orderNo,     // 商户订单号
                            out_refund_no: refundNo,
                            total_fee: orderItems[i].money,
                            refund_fee: orderItems[i].money
                          }

                          let signStr = commonFunc.rawSort(paramData)
                          signStr = signStr + '&key=' + config.wxDeveloperConfig[value].merchantkey

                          paramData.sign = commonFunc.convertToMD5(signStr, true)    // 签名
                          let xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
                          let xmlString = xmlBuilder.buildObject(paramData)

                          // 读取商户证书
                          let pfxpath = config.wxDeveloperConfig[value].pfxpath

                          // console.log(wxApis.refund);
                          // console.log(xmlString);
                          // console.log(pfxpath);
                          // console.log(req.wxApiUserObject.merchantid);
                          // return res.json({result: 'finish'});

                          request({
                            url: wxApis.refund,
                            method: 'POST',
                            body: xmlString,
                            agentOptions: {
                              pfx: fs.readFileSync(pfxpath),
                              passphrase: config.wxDeveloperConfig[value].merchantid
                            }
                          }, function (err, response, body) {
                            if (err) {
                              console.log(new Date(), err)
                            } else {
                              // return res.json({results: body});
                              var jsondata
                              xml2js.parseString(body, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
                                jsondata = result || {}
                              })
                              // return res.json({results: jsondata})
                              console.log(new Date(), 'orderNo:_' + orderItems[i].orderNo, jsondata)
                              // console.log(value)
                              if (i === counselItems.length - 1 && value === 'appsjkshz') {
                                console.log(new Date(), 'auto_refund_success:_finish')
                              }
                              // if (jsondata.xml.result_code === 'SUCCESS') {
                              //   break
                              // }
                            }
                          })
                        } else {
                          // console.log(value)
                          if (i === counselItems.length - 1 && value === 'appsjkshz') {
                            console.log(new Date(), 'auto_refund_success:_finish')
                          }
                        }
                      }
                    } else {
                      console.log(new Date(), 'orderNo:_' + orderItems[i].orderNo + '_order_paystatus_or_freeFlag_error:_not_allowed_refund')
                      if (i === counselItems.length - 1) {
                        console.log(new Date(), 'auto_refund_success:_finish')
                      }
                    }
                  }
                }
              })
            }
          })
        } else {
          if (i === counselItems.length - 1) {
            console.log(new Date(), 'auto_refund_success:_finish')
          }
        }
      }
    }
  }, '', fieldCACS)
}

// 测试函数用的
// exports.testxml = function (req, res) {
//     // var paramData = req.body.data;
//     var paramData = '<xml><appid><![CDATA[wx2421b1c4370ec43b]]></appid><mch_id><![CDATA[10000100]]></mch_id><nonce_str><![CDATA[TeqClE3i0mvn3DrK]]></nonce_str><out_refund_no_0><![CDATA[1415701182]]></out_refund_no_0><out_trade_no><![CDATA[1415757673]]></out_trade_no><refund_count>1</refund_count></xml>'

//     // var signStr = commonFunc.rawSort(paramData);
//     // signStr = signStr + '&key=' + req.wxApiUserObject.merchantkey;

//     // paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
//     // var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
//     // var xmlString = xmlBuilder.buildObject(paramData);
//     // console.log(xmlString)
//     // return res.json({result: xmlString});
//     // var parser = new xml2js.Parser();
//     // var jsondata = {};

//     // parser.parseString(xmlString, function(err, result) {
//     //   jsondata = result || {};
//     // });

//     xml2js.parseString(paramData, { explicitArray : false, ignoreAttrs : true }, function (err, result) {
//       jsondata = result || {};
//     })
//     // console.log(jsondata);
//     // return res.json({result: jsondata});
//     return res.status(400).json({result: jsondata});
// }

// 消息模板
exports.messageTemplate = function (req, res) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token

  if (req.body.userId !== '') {
    var query = {userId: req.body.userId}
    var role = req.query.role || req.body.role

    Alluser.getOne(query, function (err, item) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
          // res.json({results: item});
      if (item === null) {
        return res.status(400).send('user do not exist')
      }
      if (item.MessageOpenId === null) {
        return res.status(400).send('openId do not exist')
      }
      var messageOpenId
      // 患者或者医生在app绑定微信，是否也需要进行模板消息推送(暂时只在微信端推送消息模板)
      if (role === 'doctor') {
        messageOpenId = item.MessageOpenId.doctorWechat
      } else if (role === 'patient') {
        messageOpenId = item.MessageOpenId.patientWechat
      } else if (role === 'test') {
        messageOpenId = item.MessageOpenId.test
      }

      if (messageOpenId === null) {
        return res.status(400).send('openId do not exist')
      } else {
        var jsondata = {}
        jsondata = req.body.postdata
        jsondata.touser = messageOpenId

        request({
          url: wxApis.messageTemplate + '?access_token=' + token,
          method: 'POST',
          body: jsondata,
          json: true
        }, function (err, response, body) {
          if (!err && response.statusCode === 200) {
            res.json({results: body})
          } else {
            return res.status(500).send('Error')
          }
        })
      }
    })
  } else if (req.body.userId === '') {
    if (req.body.postdata.touser !== '') {
      request({
        url: wxApis.messageTemplate + '?access_token=' + token,
        method: 'POST',
        body: req.body.postdata,
        json: true
      }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
          res.json({results: body})
        } else {
          return res.status(500).send('Error')
        }
      })
    }
  }

  // var jsondata = req.body || {};
  // var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  // var xmlString = xmlBuilder.buildObject(jsondata);
}

// 下载
exports.download = function (req, res) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token
  var serverId = req.query.serverId
  var name = req.query.name

  var fileurl = wxApis.download + '?access_token=' + token + '&media_id=' + serverId
  var dir = './uploads/photos'

  request({
    url: fileurl,
    method: 'GET',
    json: true
  }, function (err, response) {
    if (!err && response.statusCode === 200) {
      request.head(fileurl, function (err, response1, body) {
        request(fileurl).pipe(fs.createWriteStream(dir + '/' + name))

        // console.log("Done: " + fileurl);
        res.json({results: 'success'})
      })
    }

    // if(!err && response.statusCode === 200) {
    //   download(fileurl, dir, name);
    //   console.log("Done: " + fileurl);
    //   res.json({results:"success"});
    // }

    // var imgData = "";
    // res.json(response.body);

    // response.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
    // response.on("data", function(chunk){
    //     imgData += chunk;
    //     console.log(chunk);
    // });

    // response.on("end", function(){
    //   fs.writeFile("./public/upload/downImg/name.jpg", imgData, "binary", function(err){
    //     if(err){
    //       return res.status(500).send('Error');
    //     }
    //     res.json({results:"success"});
    //   });
    // });
  })
}

// var download = function (url, dir, filename) {
//   request.head(url, function (err, res, body) {
//     request(url).pipe(fs.createWriteStream(dir + '/' + filename))
//   })
// }

// 消息管理--接收消息
exports.receiveTextMessage = function (req, res) {
  var body = ''
  var results = ''

  req.on('data', function (data) {
    body += data
    // console.log("partial: " + body);
  })
  req.on('end', function () {
    // console.log("*************************** finish : body ********************************");
    // console.log("finish: " + body);
    var parser = new xml2js.Parser()
    var jsondata = {}

    parser.parseString(body, function (err, result) {
      jsondata = result || {}
    })
    var MsgType = jsondata.xml.MsgType

    // console.log(jsondata);
    // console.log((jsondata.xml.EventKey[0] == '' || jsondata.xml.EventKey[0] == null));
    // 事件推送
    if (MsgType === 'event') {
      // 扫描带参数二维码事件    用户未关注时，进行关注后的事件推送 || 用户已关注时的事件推送
      if (jsondata.xml.Event === 'subscribe' || jsondata.xml.Event === 'SCAN') {
        // do something
        // console.log("*************************** inin ********************************");
        // console.log("inin");
        if (jsondata.xml.EventKey[0] !== null && jsondata.xml.EventKey[0] !== '') {
          var doctor_userId
          // console.log("*************************** jsondata ********************************");
          // console.log(jsondata);

          var patientType

          if (jsondata.xml.Event === 'subscribe') {
            doctor_userId = jsondata.xml.EventKey[0].split('_')[1]
            // 未注册
            patientType = 0
          }
          if (jsondata.xml.Event === 'SCAN') {
            doctor_userId = jsondata.xml.EventKey
            // 已注册
            patientType = 1
          }
          // console.log(doctor_userId)
          // 暂存医生和患者的openId
          var patient_openId = jsondata.xml.FromUserName
          var time = new Date()

          var openIdData = {
            doctorUserId: doctor_userId,
            patientOpenId: patient_openId,
            time: time,
            patientType: patientType
          }
          // console.log("*************************** openIdData ********************************");
          // console.log(openIdData);
          var newOpenIdTmp = new OpenIdTmp(openIdData)
          newOpenIdTmp.save(function (err, item) {
            if (err) {
              results = err.errmsg
              res.statusCode = 500
              res.write(results)
              res.end()
            } else {
              // results = 'success';
              // var query = { userId: doctor_userId };
              // Doctor.getOne(query, function (err, doctor) {
              //   if (err) {
              //     results = err;
              //     res.statusCode = 500;
              //     res.write(results);
              //     res.end();
              //   }
              //   if (doctor == null) {
              //     results = 'doctor not exist';
              //     res.statusCode = 500;
              //     res.write(results);
              //     res.end();
              //   }
              //   // console.log("*************************** doctor ********************************");
              //   // console.log(doctor)
              //   var name = doctor.name;
              //   var title = doctor.title;
              //   var workUnit = doctor.workUnit;

              //   var template = {
              //     "userId": patient_openId,
              //     "role": "patient",
              //     "postdata": {
              //       "touser": patient_openId,
              //       "template_id": "43kP7uwMZmr52j7Ptk8GLwBl5iImvmqmBbFNND_tDEg",
              //       "url": '',
              //       "data": {
              //         "first": {
              //           "value": "您现在已经绑定" + name + "医生为您的主管医生。",//医生姓名
              //           "color": "#173177"
              //         },
              //         "keyword1": {
              //           "value": name, //医生姓名
              //           "color": "#173177"
              //         },
              //         "keyword2": {
              //           "value": title, //医生职称
              //           "color": "#173177"
              //         },
              //         "keyword3": {
              //           "value": workUnit, //所在医院
              //           "color": "#173177"
              //         },

              //         "remark": {
              //           "value": "点击底栏【肾事管家】按钮进行注册，注册登录后可查看主管医生详情，并进行咨询问诊。",
              //           "color": "#173177"
              //         }
              //       }
              //     }
              //   };

              //   request({
              //     url: 'http://' + webEntry.domain + ':4060/api/v1/wechat/messageTemplate' + '?token=' + req.query.token || req.body.token,
              //     method: 'POST',
              //     body:template,
              //     json:true
              //   }, function(err, response){
              //     if(err){
              //       results = err;
              //     }
              //     else{

              //       if( jsondata.xml.Event == 'SCAN'){
              //         results = 'success';
              //       }
              //       else{
              //         // results = "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~";
              //         results = "您好，欢迎关注肾事管家~ \n \n 让每一位慢性肾病患者得到有效管理。\n \n 找名医进行咨询问诊，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patient&#wechat_redirect'>【肾事管家】 </a> ~ \n \n 定制私人肾病全程管理方案，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patientinsurance&#wechat_redirect'>【全程管理】</a> ~"

              //       }

              //     }

              //   });
              // });

              if (jsondata.xml.Event === 'SCAN') {
                results = 'success'
              } else {
                // 扫码关注
                // console.log("*************************** jsondata ********************************");
                // console.log(jsondata);
                var ToUserName = jsondata.xml.ToUserName[0]    // 开发者微信号
                var FromUserName = jsondata.xml.FromUserName[0]  // 发送方帐号（一个OpenID）
                var CreateTime = parseInt(jsondata.xml.CreateTime[0])
                // console.log(CreateTime);
                // var date = new Date();

                // console.log(ToUserName)
                // console.log(FromUserName)

                if (ToUserName === 'gh_38a170c4a996') {
                  // 医生服务号的开发者微信号
                  var res_json = {
                    ToUserName: FromUserName,
                    FromUserName: ToUserName,
                    // ToUserName: ToUserName,
                    // FromUserName: FromUserName,
                    CreateTime: CreateTime,
                    MsgType: 'text',
                    // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
                    Content: '您好，欢迎关注肾健康守护者联盟! \n 慢性肾病的专业管理及医护人员的学习交流平台'
                  }
                  // console.log(res_json)
                  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
                  var xmlString = xmlBuilder.buildObject(res_json)
                  // console.log(xmlString);
                  results = xmlString
                  // console.log("*************************** results ********************************")
                  // console.log(results)
                  res.statusCode = 200
                  res.write(results)
                  res.end()
                } else if (ToUserName === 'gh_b55234d77eb3') {
                  // 肾事管家的开发者微信号
                  var res_json = {
                    ToUserName: FromUserName,
                    FromUserName: ToUserName,
                    // ToUserName: ToUserName,
                    // FromUserName: FromUserName,
                    CreateTime: CreateTime,
                    MsgType: 'text',
                    // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
                    Content: "您好，欢迎关注肾事管家~ \n \n 让每一位慢性肾病患者得到有效管理。\n \n 找名医进行咨询问诊，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patient&#wechat_redirect'>【肾事管家】 </a> ~ \n \n 定制私人肾病全程管理方案，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patientinsurance&#wechat_redirect'>【全程管理】</a> ~"
                  }
                  // console.log(res_json)
                  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
                  var xmlString = xmlBuilder.buildObject(res_json)
                  // console.log(xmlString);
                  results = xmlString
                  // console.log("*************************** results ********************************")
                  // console.log(results)
                  res.statusCode = 200
                  res.write(results)
                  res.end()
                } else {
                  var res_json = {
                    ToUserName: FromUserName,
                    FromUserName: ToUserName,
                    // ToUserName: ToUserName,
                    // FromUserName: FromUserName,
                    CreateTime: CreateTime,
                    MsgType: 'text',
                    // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
                    Content: "您好，欢迎关注肾事管家~ \n \n 让每一位慢性肾病患者得到有效管理。\n \n 找名医进行咨询问诊，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patient&#wechat_redirect'>【肾事管家】 </a> ~ \n \n 定制私人肾病全程管理方案，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patientinsurance&#wechat_redirect'>【全程管理】</a> ~"
                  }
                  // console.log(res_json)
                  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
                  var xmlString = xmlBuilder.buildObject(res_json)
                  // console.log(xmlString);
                  results = xmlString
                  // console.log("*************************** results ********************************")
                  // console.log(results)
                  res.statusCode = 200
                  res.write(results)
                  res.end()
                }
              }
            }
          })
        } else if (jsondata.xml.EventKey[0] === '' || jsondata.xml.EventKey[0] === null) {
          // 手动关注
          // console.log("*************************** jsondata ********************************");
          // console.log(jsondata);
          var ToUserName = jsondata.xml.ToUserName[0]    // 开发者微信号
          var FromUserName = jsondata.xml.FromUserName[0]  // 发送方帐号（一个OpenID）
          var CreateTime = parseInt(jsondata.xml.CreateTime[0])
          // console.log(CreateTime);
          // var date = new Date();

          // console.log(ToUserName)
          // console.log(FromUserName)

          if (ToUserName === 'gh_38a170c4a996') {
            // 医生服务号的开发者微信号
            var res_json = {
              ToUserName: FromUserName,
              FromUserName: ToUserName,
              // ToUserName: ToUserName,
              // FromUserName: FromUserName,
              CreateTime: CreateTime,
              MsgType: 'text',
              // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
              Content: '您好，欢迎关注肾健康守护者联盟! \n 慢性肾病的专业管理及医护人员的学习交流平台'
            }
            // console.log(res_json)
            var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
            var xmlString = xmlBuilder.buildObject(res_json)
            // console.log(xmlString);
            results = xmlString
            // console.log("*************************** results ********************************")
            // console.log(results)
            res.statusCode = 200
            res.write(results)
            res.end()
          } else if (ToUserName === 'gh_b55234d77eb3') {
            // 肾事管家的开发者微信号
            var res_json = {
              ToUserName: FromUserName,
              FromUserName: ToUserName,
              // ToUserName: ToUserName,
              // FromUserName: FromUserName,
              CreateTime: CreateTime,
              MsgType: 'text',
              // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
              Content: "您好，欢迎关注肾事管家~ \n \n 让每一位慢性肾病患者得到有效管理。\n \n 找名医进行咨询问诊，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patient&#wechat_redirect'>【肾事管家】 </a> ~ \n \n 定制私人肾病全程管理方案，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patientinsurance&#wechat_redirect'>【全程管理】</a> ~"
            }
            // console.log(res_json)
            var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
            var xmlString = xmlBuilder.buildObject(res_json)
            // console.log(xmlString);
            results = xmlString
            // console.log("*************************** results ********************************")
            // console.log(results)
            res.statusCode = 200
            res.write(results)
            res.end()
          } else {
            var res_json = {
              ToUserName: FromUserName,
              FromUserName: ToUserName,
              // ToUserName: ToUserName,
              // FromUserName: FromUserName,
              CreateTime: CreateTime,
              MsgType: 'text',
              // Content: "您好，欢迎关注肾事管家~ \n 让每一位慢性肾病患者得到有效管理。\n 找名医进行咨询问诊，请点击底栏【肾事管家】~ \n 定制私人肾病全程管理方案，请点击底栏【全程管理】~"
              Content: "您好，欢迎关注肾事管家~ \n \n 让每一位慢性肾病患者得到有效管理。\n \n 找名医进行咨询问诊，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patient&#wechat_redirect'>【肾事管家】 </a> ~ \n \n 定制私人肾病全程管理方案，请点击底栏<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb830b12dc0fa74e5&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=patientinsurance&#wechat_redirect'>【全程管理】</a> ~"
            }
            // console.log(res_json)
            var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true})
            var xmlString = xmlBuilder.buildObject(res_json)
            // console.log(xmlString);
            results = xmlString
            // console.log("*************************** results ********************************")
            // console.log(results)
            res.statusCode = 200
            res.write(results)
            res.end()
          }
        } else {
          // EventKey为空
          results = 'EventKey Error'
          res.statusCode = 500
          res.write(results)
          res.end()
        }
      } else {
        results = 'success'
        res.statusCode = 200
        res.write(results)
        res.end()
      }
    } else {
      results = 'success'
      res.statusCode = 200
      res.write(results)
      res.end()
    }
  })
}

// 创建永久二维码
exports.createTDCticket = function (req, res, next) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token
  var jsondata = req.body.postdata

  request({
    url: wxApis.createTDCticket + '?access_token=' + token,
    method: 'POST',
    body: jsondata,
    json: true
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      // res.json({results:body});
      req.results = body
      next()
    } else {
      return res.status(500).send('Error')
    }
  })
}

exports.wxTestApiP = function (req, res) {
  console.log(req.body)
}

// 服务器端获取微信临时素材
exports.wxJsSdkReqMedia = function (req, res, next) {
    // console.log(req.query);
  if (!req.wxToken) {
    return res.status(404).send('微信令牌不存在!')
  }

  var img = req.body.img
  var d = new Date()
  var yyyy = moment(d).format('YYYY')
  var mm = moment(d).format('MM')
  var dd = moment(d).format('DD')
  var dest = path.join(__dirname, '../public/upload/sinokorea', yyyy, mm, dd)
  fs.ensureDirSync(dest)
  var name = 'sk_' + req.body.fileName.replace(/\s+/g, '-').toLowerCase().replace(/\.jpg/, '') + '_' + Date.now() + '.jpg'
  var filePath = dest + '/' + name
    // console.log(dest);

  request
        .get('https://api.weixin.qq.com/cgi-bin/media/get?access_token=' + req.wxToken.token + '&media_id=' + img)
        .on('response', function (res) {
            // console.log(res.statusCode) // 200
            // console.log(res.headers['content-type']) // 'image/jpeg'
        })
        .on('error', function (err) {
          console.log(err)
        })
        .pipe(fs.createWriteStream(filePath))
        .on('close', function () {  // 没有参数传入
            // return res.json({results: img});
          req.body.file = {
            path: filePath,
            name: name
          }
          next()
        })
}

// 自定义菜单接口 2017-06-12 GY
// 创建接口
exports.createCustomMenu = function (req, res) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token
  var jsondata = req.body.postdata // 请求内容

  request({
    url: wxApis.createCustomMenu + '?access_token=' + token,
    method: 'POST',
    body: jsondata,
    json: true
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send('Error')
    } else {
      res.json({results: body})
    }
  })
}
// 查询接口
exports.getCustomMenu = function (req, res) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token

  request({
    url: wxApis.getCustomMenu + '?access_token=' + token,
    method: 'GET'
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send('Error')
    } else {
      res.json({results: body})
    }
  })
}
// 删除接口
exports.deleteCustomMenu = function (req, res) {
  var tokenObject = req.wxToken || {}
  var token = tokenObject.token

  request({
    url: wxApis.deleteCustomMenu + '?access_token=' + token,
    method: 'GET'
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send('Error')
    } else {
      res.json({results: body})
    }
  })
}

// async改写 ------ POST wechat/refund ------ 已调试 ------ 2017-09-25 YQC
exports.wechatRefundAsync = function (params, callback) {
  let orderNo = params.orderNo || null
  let role = params.role || null
  let roleList = ['patient', 'doctor', 'appPatient', 'appDoctor', 'test']
  if (orderNo === null || role === null) {
    let err = '请填写orderNo/role'
    return callback(err)
  } else if (roleList.indexOf(role) === -1) {
    let err = 'role do not exist!'
    return callback(err)
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
      return callback(null, {newId: _Ret})
    }],
    checkPayStatus: function (callback) { // 查询该订单是否为“已支付”（paystatus = 2）状态
      let query = {orderNo: orderNo, paystatus: 2}
      Order.getOne(query, function (err, item) {
        if (item) {
          return callback(err, item)
        } else {
          let err = '不存在的订单'
          return callback(err)
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
          let err = '不存在的订单'
          return callback(err)
        }
      }, {new: true})
    }],
    chooseAppId: function (callback) {
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
        return callback(err, newsInfo)
      })
    }]
  }, function (err, results) {
    return callback(err, results)
  })
}

// async改写 调用wechatRefundAsync方式与结果处理 ------ 2017-09-25 YQC
exports.wechatRefundAsyncTest = function (req, res) {
  let params = {
    orderNo: req.body.orderNo, // 退款单号
    role: req.body.role // 退款应用角色，[默认appPatient
  }
  wechatCtrl.wechatRefundAsync(params, function (err, results) {
    if (err) {
      return res.json({msg: err, data: results, code: 1})
    } else {
      let refundResults = results.refund.xml || null
      if (refundResults !== null) {
        if (refundResults.return_code === 'SUCCESS' && refundResults.result_code === 'SUCCESS') {
          return res.json({msg: '退款成功', data: results, code: 0})
        } else {
          return res.json({msg: '退款失败', data: results, code: 1})
        }
      } else {
        return res.json({msg: '退款失败', data: results, code: 1})
      }
    }
  })
}
