var Alluser = require('../models/alluser')
var Trace = require('../models/trace')
var async = require('async')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')
var commonFunc = require('../middlewares/commonFunc')

var dataGatherFunc = {
  userIDbyPhone: function (phoneNo, role, callback) {
    let query = {}
    if ((role || null) !== null) {
      query = {phoneNo: phoneNo, role: role}
    } else {
      query = {phoneNo: phoneNo}
    }
    let result
    Alluser.getOne(query, function (err, item) {
      if (err) {
        result = {status: 1, msg: 'Server Error!'}
      } else if (item === null) {
        result = {status: -1, msg: 'User not Exists!'}
      } else {
        result = {status: 0, userId: item.userId, _id: item._id, role: item.role, item: item, msg: 'UserId Got!'}
      }
      return callback(err, result)
    })
  },
  traceRecord: function (phoneNo, apiName, params, outputs, callback) {
    let traceData = {
      phoneNo: phoneNo,
      apiName: apiName,
      time: new Date(),
      params: params,
      outputs: outputs
    }
    let newTrace = new Trace(traceData)
    newTrace.save(function (err, traceInfo) {
      let result
      if (err) {
        result = {status: 1, msg: 'Server Error!'}
      } else {
        result = {status: 0, msg: 'Trace Recorded!'}
      }
      callback(err, result)
    })
  },
  getSeriesNo: function (numType, callback) {
    let targetDate = commonFunc.getNowFormatDate()
    async.auto({
      getDict: function (callback) {
        let query = {type: numType}
        DictNumber.getOne(query, function (err, item) {
          return callback(err, item)
        })
      },
      getSeries: ['getDict', function (results, callback) {
        let _DateFormat = results.getDict.dateFormat
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
        let query = {type: numType, date: _KeyDate}
        Numbering.updateOne(query, {$inc: {number: 1}}, function (err, item) {
          return callback(err, item)
        }, {upsert: true, new: true})
      }],
      getNo: ['getDict', 'getSeries', function (results, callback) { // 获取new messageId
        let _Initial = results.getDict.initStr

        let _Date
        let _DateFormat = results.getDict.dateFormat
        if (_DateFormat === 'YYMMDD') {
          _Date = targetDate.substring(2, 8)
        } else if (_DateFormat === 'YYYYMMDD') {
          _Date = targetDate
        }

        let _TrnNumberingNo
        if (results.getSeries === null) {
          _TrnNumberingNo = 0
        } else {
          _TrnNumberingNo = results.getSeries.number
        }
        let _Seq = _TrnNumberingNo

        let _SeqLength = results.getDict.seqLength
        let _AlphamericFlag = results.getDict.alphamericFlag
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
      }]
    }, function (err, results) {
      return callback(err, results.getNo.newId)
    })
  }
}

module.exports = dataGatherFunc
