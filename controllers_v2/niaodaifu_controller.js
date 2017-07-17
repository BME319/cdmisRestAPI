
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
  var mode = 1
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
  var flag = 1

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
    insertTime: myDate
  }

  var obj = {
    type: 'Health_002',
    time: createdTime,
    url: [
      {
        photoId: userbind + _createdTime + '00',
        status: 1
      }
    ],
    label: '化验',
    description: desc,
    comments: suggestion,
    importStatus: 1,
    revisionInfo: {
      operationTime: createdTime,
      userId: userbind
    }
  }

  // 存入healthInfo
  HealthInfo.updateOne(query, obj, {upsert: true, runValidators: true}, function (err, Info) {
    if (err) {
      res.json({status: 1, err: err})
    } else {
      flag = 0
    }
  })

  function sortNumber (a, b) {
    return a.id - b.id
  }
  data = data.sort(sortNumber)

  var obj2 = [
    {
      type: 'LEU',
      valueStr: data[0].result,
      status: data[0].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'NIT',
      valueStr: data[1].result,
      status: data[1].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'UBG',
      valueStr: data[2].result,
      status: data[2].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'PRO',
      valueStr: data[3].result,
      status: data[3].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'PH',
      valueStr: data[4].result,
      status: data[4].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'ERY',
      valueStr: data[5].result,
      status: data[5].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'SG',
      valueStr: data[6].result,
      status: data[6].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'BIL',
      valueStr: data[7].result,
      status: data[7].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'VC',
      valueStr: data[8].result,
      status: data[8].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'KET',
      valueStr: data[9].result,
      status: data[9].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    },
    {
      type: 'GLU',
      valueStr: data[10].result,
      status: data[10].status,
      importer: '59672961611ae0e26c61cc77',
      photoId: userbind + _createdTime + '00'
    }
  ]
  // 存入labtestImport
  insertLab(0)

  function insertLab (i) {
    var _numberingType = 11
    var _targetDate = commonFunc.getNowFormatDate()
    console.log('_targetData:' + _targetDate)
    var query = {type: _numberingType}
    var Data
    var No
    DictNumber.getOne(query, function (err, item) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      Data = item
      if (Data == null) {
        return res.json({results: '请输入正确的numberingType!'})
      } else {
        var _Initial = Data.initStr
        var _DateFormat = Data.dateFormat
        var _SeqLength = Data.seqLength
        // var _AlphamericFlag = Data.alphamericFlag
        var _Date
        var _KeyDate
        var _TrnNumberingData
        var _TrnNumberingNo
        if (_DateFormat === 'YYMMDD') {
          _Date = _targetDate.substring(2, 8)
        } else if (_DateFormat === 'YYYYMMDD') {
          _Date = _targetDate
        }
        console.log(_Date)
        if (_Date == null) {
          _KeyDate = '99999999'
        } else {
          _KeyDate = _targetDate
        }
        var query1 = {type: _numberingType, date: _KeyDate}
        console.log(query1)
        Numbering.getOne(query1, function (err, item1) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          _TrnNumberingData = item1
          if (_TrnNumberingData == null) {
            _TrnNumberingNo = 0
          } else {
            _TrnNumberingNo = _TrnNumberingData.number
          }
          _TrnNumberingNo = _TrnNumberingNo + 1
          var _Seq = _TrnNumberingNo
          console.log('_Seq:' + _Seq)
          if (_Seq.toString().length > _SeqLength) {
            _TrnNumberingNo = 1
            _Seq = 1
          }
          if (_TrnNumberingNo === 1) {
            var numberingData = {
              type: _numberingType,
              date: _KeyDate,
              number: _TrnNumberingNo
            }

            var newNumbering = new Numbering(numberingData)
            newNumbering.save(function (err, Info) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
            })
          } else {
            Numbering.updateOne(query1, { $set: { number: _TrnNumberingNo } }, function (err, item1) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
            })
          }
          if (_Seq.toString().length < _SeqLength) {
            var n = _SeqLength - _Seq.toString().length
            while (n) {
              _Seq = '0' + _Seq
              n = n - 1
            }
          }
          var _Ret = _Initial + _Date + _Seq
          No = _Ret
          console.log(No)
          let query2 = {
            userId: userbind,
            importTime: myDate,
            labtestId: No
          }

          LabtestImport.updateOne(query2, obj2[i], function (err, Info) {
            if (err) {
              res.json({status: 1, err: err})
            } else {
              // return res.json({status: 0})
              if(i < obj2.length -1){
                insertLab(++i)
              } else {
                console.log(i)
                return res.json({status: 0})
              }             
            }
          }, {upsert: true, runValidators: true})
        })
      }
    })
  }
}
