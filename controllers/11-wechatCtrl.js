var config = require('../config'),
    request = require('request'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    commonFunc = require('../middlewares/commonFunc'),
    Consumption = require('../models/consumption'),
    Wechat = require('../models/wechat');

var wxApis = {
	oauth_access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
  unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  baseToken: 'https://api.weixin.qq.com/cgi-bin/token',
  getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
};



var wxApiUserObject = config.wxDeveloperConfig.ybt;


exports.getPaymentOrder = function(req, res, next) {
  var query = {
    _id: req.orderObject.oid,
    orderStatus: 1
  };

  Consumption.getOne(query, function(err, consItem) {
    if (consItem) {
      req.orderObject['order'] = {
        orderSn: consItem.outRecptNum,
        payAmount: parseFloat(consItem.money || 0),
        goods_detail: []
      };

      for(var i =0; i < consItem.items.length; i++) {
        req.orderObject['order'].goods_detail.push({
          goods_id: consItem.items[i].pdId,
          wxpay_goods_id: consItem.items[i].pdSn,
          goods_name: consItem.items[i].pdSn,
          quantity: consItem.items[i].pdQuantity,
          price: consItem.items[i].pdPrice
        });
      }    

      next();
    } else {
      return res.status(422).send('订单不存在');
    }
    
  })
}




exports.wxpayRawParams = function(req, res, next) {
  var rawData = [];
  var rawString = [];
  var size = 0;
  req.on('data', function (data) {
    rawString.push(data.toString('utf-8'));
    rawData.push(data);
    size += data.length;
  });

  req.on('end', function () {
    req.rawString = rawString.join('');
    req.rawData = Buffer.concat(rawData, size);
    next();
  });
  
}

exports.checkWxPaySign = function(req, res, next) {

  var rawString = req.rawString;  

  var parser = new xml2js.Parser({explicitArray: false});
  var data = {};

  parser.parseString(rawString, function(err, result) {        
    if (err) {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    }
    data = (result && result.xml) || {};
  });


  if (data.result_code == 'SUCCESS' && data.return_code == 'SUCCESS') {
    var sign = data.sign;
    delete data.sign;
    var signStr = commonFunc.rawSort(data);
    signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
    var genSign = commonFunc.convertToMD5(signStr, true);

    if ( sign == genSign) {   
      data.sign = sign;
      req.payDataObject = data;   
      next();
    } else {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    }
  } else {
    return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
  }

  
  

}

exports.operatorPayResult = function(req, res) {
  var payDataObject = req.payDataObject;
  var ordersn = payDataObject.out_trade_no.split('-')[0];
  var currentDate = new Date();

  var query = {
    consType: 'selfshopping',
    outRecptNum: ordersn,
    'orderStatus': 1
  }

  var upObj = {
    '$set': {
      orderStatus: 2,
    },
    '$push': {
      orderPayment: {
        payType: 3,
        payName: '微信支付-公众号支付-' + wxApiUserObject.appid,
        payPrice: payDataObject.total_fee,
        payNo: payDataObject.transaction_id,
        payInceAmountType: payDataObject.trade_type,
        payInceIdNo: payDataObject.openid,
        payInceID: payDataObject.mch_id,
        payInceAmountText: payDataObject.out_trade_no
      }
    }
  }


  Consumption.updateOne(query, upObj, function(err, upCons) {
    
    if (err || !upCons) {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    } else {
      return res.status(422).send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    }    
  });

  
}
