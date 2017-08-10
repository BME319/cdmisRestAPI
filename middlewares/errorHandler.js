var domain = require('domain')
var fs = require('fs')
var bunyan = require('bunyan')

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
