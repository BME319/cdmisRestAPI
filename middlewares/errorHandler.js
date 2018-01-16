var domain = require('domain')
var fs = require('fs')
var bunyan = require('bunyan')
var commonFunc = require('../middlewares/commonFunc')
var Trace = require('../models/trace')

var log = bunyan.createLogger({
  name: 'kidney',
  streams: [
    {
      type: 'rotating-file',
      level: 'info',
      // stream: process.stdout            // log INFO and above to stdout
      path: './logs/info.json',
      period: '1d'   // daily rotation
    },
    {
      type: 'rotating-file',
      level: 'warn',
      path: './logs/warn.json',  // log ERROR and above to a file
      period: '1d'   // daily rotation
    },
    {
      type: 'rotating-file',
      level: 'error',
      path: './logs/error.json',  // log ERROR and above to a file
      period: '1d'   // daily rotation
    }
  ]
})

// 引入一个domain的中间件，将每一个请求都包裹在一个独立的domain中
// domain来处理异常
exports.error = function (req, res, next) {
  var d = domain.create()
  log.info(req.method + ' ' + req.url)
  // 监听domain的错误事件
  d.on('error', function (err) {
    // logger.error(err)
    res.statusCode = 500
    res.json({sucess: false, messag: '服务器异常'})
    // res.json({sucess: false, messag: JSON.stringify(err)})
    console.log('test domain')
    // console.log(err)
    // console.log(req)
    log.error('= ------------------------------------------------------------')
    log.error(err)
    log.error(req.method + ' ' + req.url)
    log.error(req.query || req.body)
    log.error(req.session)
    // log.error({
    //   methodName: req.name,
    //   error: err,
    //   args: req.query || req.body,
    //   user: req.session
    // })

    // fs.appendFile('./logs/log.txt', err, 'utf8', function (appendErr) {
    //   if (appendErr) {
    //     console.log(appendErr)
    //   }
    // })
    // d.dispose()
  })

  d.add(req)
  d.add(res)
  d.run(next)
}

exports.allError = function (req, res, next) {
  var d = domain.create()
  log.info(req.method + ' ' + req.url)
  // 监听domain的错误事件
  d.on('error', function (err) {
    // logger.error(err)
    res.statusCode = 500
    // res.json({sucess: false, messag: '服务器异常'})
    console.log('test domain')
    // console.log(err)
    // console.log(req)
    log.error('= ------------------------------------------------------------')
    log.error(err)
    log.error(req.method + ' ' + req.url)
    log.error(req.query || req.body)
  })

  d.add(req)
  d.add(res)
  d.run(next)
}

exports.makeError = function (numPathComponents, outputs) {
  function HttpError (errorCode, msg) {
    this.errorCode = errorCode
    this.message = msg
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
    this.constructor.prototype.__proto__ = Error.prototype
  }

  return function (req, res, next) {
    // console.log('checkError')
    let resource
    let url = req.originalUrl.split('?')[0]

    if (!numPathComponents) {
      resource = url
    } else {
      resource = url.split('/').slice(3, numPathComponents + 3).join('/')
    }
    let traceData = {
      phoneNo: req.body.phoneNo,
      apiName: resource,
      time: new Date(),
      params: req.body,
      outputs: outputs
    }
    let newTrace = new Trace(traceData)
    newTrace.save(function (err, traceInfo) {
      if (err) {
        // res.json({status: 1, msg: '操作失败!'})
        next(new HttpError(403, 'api saving error'))
      } else {
        // return res.json({status: 1, msg: '操作失败!'})
        // console.log('outputs', outputs)
        return res.json({status: outputs.status, msg: outputs.msg})
      }
    })
  }
}

exports.insertLog = function (req, res) {
  var errStack = req.body.errStack || null
  var method = req.body.method || null
  var apiUrl = req.body.url || null
  var args = req.body.args || null
  var user = req.body.userId || null
  var role = req.body.role || null
  var ip = commonFunc.getClientIp(req)
  var webState = req.body.webState
  var userProxy = req.body.userProxy

  // var data = 'method: ' + method + "\n"
  // data = data + 'apiUrl: ' + apiUrl + '\n' + 'args: ' + args + '\n' + 'user: ' + user + '\n' + 'role: ' + role + '\n' + 'ip: ' + ip + '\n' + 'webState: ' + webState + '\n' + 'userProxy: ' + userProxy + '\n' + 'err: ' + errStack + '\n'

  var data = {
    method: method,
    apiUrl: apiUrl,
    args: args,
    user: user,
    role: role,
    ip: ip,
    webState: webState,
    userProxy: userProxy,
    time: new Date(),
    err: errStack
  }

  fs.appendFile('./logs/log4front.json', JSON.stringify(data, null, 4), 'utf8', function (appendErr) {
    if (appendErr) {
      console.log(appendErr)
    }
    res.json({results: {msg: '日志记录成功', code: 0, data: ''}})
  })

    // log.error('= ------------------------------------------------------------')
    // log.error(errStack)
    // log.error(req.url)
    // log.error(req.query || req.body)
    // log.error(req.session)
}
