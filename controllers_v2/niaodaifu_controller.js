
var commonFunc = require('../middlewares/commonFunc')
var config = require('../config')
var HealthInfo = require('../models/healthInfo.js')
var LabtestImport = require('../models/labtestImport.js')
// var getNo = require('../models/getNo')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')

exports.getLoginParam = function (req, res) {
  var client = req.query.client || null
  var userbind = req.query.userbind || null

  if (client === null || client === '') {
    return res.status(403).send('client不能为空')
  }
  if (userbind === null || userbind === '') {
    return res.status(403).send('userbind不能为空')
  }

  var appkey
  var appsecret
  if (client === 'Android') {
    appkey = config.niaodaifuDevConfig.Android.appid
    appsecret = config.niaodaifuDevConfig.Android.appSecret
  } else if (client === 'iOS') {
    appkey = config.niaodaifuDevConfig.iOS.appid
    appsecret = config.niaodaifuDevConfig.Android.appSecret
  } else {
    return res.status(403).send('client输入不正确')
  }

  // var atime = new Date().getTime();
  var atime = Date.parse(new Date())
  atime = atime / 1000
  var mode = 2
  var redirectUri = req.query.redirect_uri || 'http://121.43.107.106:4060'
  var sign = getSign(appkey, appsecret, atime)

  var results = {
    appkey: appkey,
    sign: sign,
    atime: atime,
    userbind: userbind,
    mode: mode,
    redirect_uri: redirectUri
  }
  res.json({results: results})
}

function getSign (appkey, appsecret, atime) {
  var step1 = appkey + ':' + appsecret
  var step2 = commonFunc.convertToMD5(step1, false)
  var step3 = step2.substring(8, 24)
  var step4 = step3 + ':' + atime
  var step5 = commonFunc.convertToMD5(step4, false)
  return step5
}

exports.receiveData = function (req, res) {
  console.log('receiveNiaodaifu')
  console.log(req.body)

  var userbind = req.body.userbind
  var desc = req.body.desc
  var suggestion = req.body.suggestion
  var data = req.body.data
  var created = req.body.created

  // 根据时间戳生成时间对象
  var createdTime = new Date(created * 1000)
  var Y = createdTime.getFullYear()
  var M = (createdTime.getMonth() + 1 < 10 ? '0' + (createdTime.getMonth() + 1) : createdTime.getMonth() + 1)
  var D = createdTime.getDate()
  var h = createdTime.getHours()
  var m = createdTime.getMinutes()
  var s = createdTime.getSeconds()
  var _createdTime = Y + M + D + h + m + s

  var myDate = new Date()

  var query = {
    userId: userbind,
    time: createdTime
  }

  var obj = {
    type: 'Health_002',
    insertTime: myDate,
    // url: [
    //   {
    //     photoId: userbind + _createdTime + '00',
    //     status: 1
    //   }
    // ],
    label: '化验',
    description: desc + '\n' + '建议：' + suggestion,
    //comments: suggestion,
    importStatus: 1,
    revisionInfo: {
      operationTime: createdTime,
      userId: userbind
    }
  }

  // 存入healthInfo
  HealthInfo.updateOne(query, obj, {upsert: true}, function (err, Info) {
    if (err) {
      res.json({status: 1, err: err})
    } else {
      //return res.json({status: 0})
      data = data.sort(sortNumber)
      labtestId = req.newId
      var obj2 = [
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '01',
          type: 'LEU',
          valueStr: data[0].result,
          status: data[0].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '02',
          type: 'NIT',
          valueStr: data[1].result,
          status: data[1].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '03',
          type: 'UBG',
          valueStr: data[2].result,
          status: data[2].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '04',
          type: 'PRO',
          valueStr: data[3].result,
          status: data[3].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '05',
          type: 'PH',
          valueStr: data[4].result,
          status: data[4].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '06',
          type: 'ERY',
          valueStr: data[5].result,
          status: data[5].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '07',
          type: 'SG',
          valueStr: data[6].result,
          status: data[6].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '08',
          type: 'BIL',
          valueStr: data[7].result,
          status: data[7].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '09',
          type: 'VC',
          valueStr: data[8].result,
          status: data[8].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '10',
          type: 'KET',
          valueStr: data[9].result,
          status: data[9].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        },
        {
          userId: userbind,
          time: createdTime,
          importTime: myDate,
          labtestId: labtestId + '11',
          type: 'GLU',
          valueStr: data[10].result,
          status: data[10].status,
          importer: '59672961611ae0e26c61cc77',
          photoId: userbind + _createdTime + '00'
        }
      ]
      // 存入labtestImport
      //var query2
      //insertLab(0, obj2, labtestId)
      LabtestImport.create(obj2, function (err, Info) {
        if(err) {
          res.json({status: 1, err: err})
        } else {
          return res.json({status: 0})
        }
      })
    }
  })
}
function sortNumber (a, b) {
  return a.id - b.id
}
