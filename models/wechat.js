// var mongodb = require('../helpers/mongodb');
// var config = require('../config')
// var crypto = require('crypto')
var request = require('request')
var mongoose = require('mongoose')

// var wxApiUserObject = config.wxDeveloperConfig.zdyyszbzx;

var wechatSchema = new mongoose.Schema({
  token: {
    type: String,
    require: true
  },
  expires_in: {
    type: Number
  },
  jsapi_ticket: {
    type: String
  },
  api_ticket: {
    type: String
  },
  type: {
    type: String,
    enum: ['access_token', 'web_access_token', 'web_refresh_Token']
  },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'test']
  },
  createAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 55 * 2  // 默认1小时50分过期, 每隔60秒删除记录(还要加上查询的时间)
  }
}, {versionKey: false})

// wechatSchema.index({ createAt: 1 }, { expireAfterSeconds: 7000 });
var wechatModel = mongoose.model('wechat', wechatSchema)

function Wechat (token) {
  this.token = token
};

Wechat.prototype.save = function (callback) {
  var token = this.token

  var newToken = new wechatModel(token)
  newToken.save(function (err, newToken) {
    if (err) {
      return callback(err)
    }
    callback(null, newToken)
  })
}

Wechat.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  wechatModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, wechatInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, wechatInfo)
    })
}

// base-access-token
Wechat.baseTokenManager = function (type) {
  // console.log(type || 'access_token');
  return function (req, res, next) {
    // console.log(req.headers);
    var query = {type: type || 'access_token', role: req.query.role || req.body.role}
    // var query = {type: type || 'access_token', role: req.session.role}
    var appid = req.wxApiUserObject.appid
    var secret = req.wxApiUserObject.appsecret

    wechatModel
    .findOne(query, function (err, tokenObject) {
      if (err) {
        return res.status(401).send('服务器错误, 微信令牌查询失败!')
      }

      if (tokenObject) {
        req.wxToken = tokenObject
        req.wxToken.appid = appid
        req.wxToken.secret = secret
        return next()
      }

      if (!type || type === 'access_token') {
        request.get({
          url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential' +
          '&appid=' + appid +
          '&secret=' + secret,
          json: true
        }, function (err1, response1, body1) {
          // console.log(body1);
          if (err1) return res.status(401).send('微信令牌获取失败!')

          request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?' +
            'access_token=' + body1.access_token +
            '&type=jsapi',
            json: true
          }, function (err2, response2, body2) {
            // console.log(body2);
            if (err2) return res.status(401).send('微信js票据获取失败!')

            // wechatModel.collection.insert({
            wechatModel.create({
              token: body1.access_token,
              expires_in: body1.expires_in,
              jsapi_ticket: body2.ticket,
              api_ticket: 'body3.ticket',
              type: type || 'access_token',
              role: req.query.role || req.body.role
              // role: req.session.role
            }, function (err, tokenObject) {
              if (err) return res.status(401).send('微信令牌保存失败!')
              req.wxToken = tokenObject
              req.wxToken.appid = appid
              req.wxToken.secret = secret
              return next()
            })
          })
        })
      }
    })
  }
}

module.exports = Wechat
