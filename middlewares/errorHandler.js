var domain = require('domain')
var fs = require('fs')
var bunyan = require('bunyan')
var commonFunc = require('../middlewares/commonFunc')

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
    log.error(req.url)
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

  var data = {
    method: method,
    apiUrl: apiUrl,
    args: args,
    user: user,
    role: role,
    ip: ip,
    webState: webState,
    userProxy: userProxy,
    err: errStack
  }

  fs.appendFile('./logs/log4front.txt', data, 'utf8', function (appendErr) {
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
