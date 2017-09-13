
// 慢病管理 REST 2017-03-14 池胜强 创建文档

// import necessary 3rd modules
var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var log4js = require('./controllers/log_controller')
var sio = require('socket.io')
var path = require('path')
var acl = require('acl')
var swaggerJSDoc = require('swagger-jsdoc')

// import necessary self-defined modules
var swaggerSetting = require('./swaggerSetting')
var webEntry = require('./settings').webEntry

var _config = webEntry.config || 'config'
var domain = webEntry.domain
// var domainName = webEntry.domainName
  // route = webEntry.route || 'default'

var config = require('./' + _config)
var dbUri = webEntry.dbUri
var restPort = webEntry.restPort
    // routes = require('./routes/'+route),     // 2017年6月22日停止使用
// var routesV1 = require('./routes/routes_v1')  // 2017年8月24日停止使用
var routesV2 = require('./routes/routes_v2')

// 数据库连接
var db = mongoose.connection
if (typeof (db.db) === 'undefined') {
  mongoose.connect(dbUri)
}
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log(dbUri + ' MongoDB connected!')
})

acl = new acl(new acl.mongodbBackend(db.db, 'rbac_'))

// node服务
var app = express()

// app.engine('.html', require('ejs').__express);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'html');
app.set('port', restPort)
// app.set('trust proxy', 'loopback, localhost');

app.use(bodyParser.json({ limit: config.bodyParserJSONLimit }))
app.use(bodyParser.urlencoded({ extended: true }))
log4js.configure()
app.use(log4js.useLog())
// app.use(expressValidator());
// app.use(useragent.express());

// 跨域访问
app.all('*', function (req, res, next) {
  var domain = req.headers.origin || null
  if (domain !== null) {
    res.setHeader('Access-Control-Allow-Origin', domain)
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
    res.setHeader('Pragma', 'no-cache') // HTTP 1.0.
    res.setHeader('Expires', '0') // Proxies.
  }
  // if (config.Access_Control_Allow_Origin.indexOf(domain) > -1) {
    // res.setHeader('Access-Control-Allow-Origin', domain)
    // res.setHeader('Access-Control-Allow-Credentials', true)
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT')
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')

    // res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
    // res.setHeader('Pragma', 'no-cache') // HTTP 1.0.
    // res.setHeader('Expires', '0') // Proxies.
  // }
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
// app.use('/upload', qt.static(path.join(__dirname, 'public/upload'), {
//  type: 'resize',
//  quality: 0.9
// }));

// 路由设置
// routes(app, webEntry, acl);
// routesV1(app, webEntry, acl)
routesV2(app, webEntry, acl)

app.use('/public', express.static('./public')).use('/lib', express.static('../lib'))

app.get('/chat', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/chat.html'))
})

// 用于swagger-jsdoc 的初始化并将适当的元数据添加到swagger规范。
// 添加路由以提供swagger规范
// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(swaggerSetting.options)

// serve swagger
app.get('/swagger.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
  console.log('serve Swagger successful!')
})

// 找不到正确路由时，执行以下操作
app.all('/*', function (req, res, next) {
  // res.sendFile('main.html', { root: __dirname + '/public/build/www' });
  // res.sendFile('main.html', { root: __dirname + '/public' });
  res.send('Router Error!')
})

// app.use(function (err, req, res, next) {
//  var meta = '[' + new Date() + '] ' + req.url + '\n';
//  errorLog.write(meta + err.stack + '\n');
//  next();
// });

var server = app.listen(app.get('port'))
var io = sio(server)
try {
  // console.log(path.resolve(__dirname, webEntry.path, 'routesIO', (webEntry.routeIO || 'default')));
  require(path.resolve(__dirname, webEntry.path, 'routesSocketIO', (webEntry.routesSocketIO || 'default')))(io, webEntry)
} catch (e) {
  console.log(e)
}

// 定时任务相关 testing 2017-07-16 GY
var schedule = require('node-schedule')
// 自动扫描退款申请的订单，调用退款查询接口，如果退款成功修改订单状态 2017-07-16 GY
var wechatCtrl = require('./controllers_v2/wechat_controller')
schedule.scheduleJob('0 0 * * * *', wechatCtrl.autoRefundQuery)

// 自动扫描所有任务方案，3个月以上无操作时，提醒对应主管医生调整方案 2017-07-26 GY
var taskCtrl = require('./controllers_v2/task_controller')
schedule.scheduleJob('30 0 8 * * *', taskCtrl.remindChangeTask)

var personalDiagCtrl = require('./controllers_v2/personalDiag_controller')
// 每天23:00更新医生的可预约面诊availablePDs 2017-08-03 YQC
schedule.scheduleJob('0 0 23 * * *', personalDiagCtrl.autoAvailablePD)

// 每日23:30自动更新过期面诊PD YQC
schedule.scheduleJob('0 30 23 * * *', personalDiagCtrl.autoOverduePD)

var doctorsInChargeCtrl = require('./controllers_v2/doctorsInCharge_controller')
// 每日23:30自动更新过期主管服务 2017-09-13 YQC
schedule.scheduleJob('0 30 23 * * *', doctorsInChargeCtrl.autoRelease)

// 每天08:00自动推送科室咨询超时未回复 2017-08-05 JYF
var counseltimeoutCtrl = require('./controllers_v2/counseltimeout_controller')
schedule.scheduleJob('0 0 8 * * *', counseltimeoutCtrl.autoCounselNews)

// 每天23:00自动统计当日科室医生工作量 2017-08-11 JYF
var departmentMonitorCtrl = require('./controllers_v2/departmentMonitor_controller')
schedule.scheduleJob('0 0 23 * * *', departmentMonitorCtrl.autoDepartmentDaily)

// 每天8:00自动推送给患者和医生咨询或问诊超时自动结束的微信模板消息 2017-09-07 lgf
var counselCtrl = require('./controllers_v2/counsel_controller')
schedule.scheduleJob('30 0 8 * * *', counselCtrl.counselAutoEndMsg)
