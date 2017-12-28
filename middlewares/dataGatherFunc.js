var Alluser = require('../models/alluser')
var Trace = require('../models/trace')
var async = require('async')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')
var commonFunc = require('../middlewares/commonFunc')

var dataGatherFunc = {
  userIDbyPhone: function (phoneNo, role, callback) {
    async.auto({
      checkUser: function (callback) {
        let query = {phoneNo: phoneNo, role: role}
        let result
        Alluser.getOne(query, function (err, item) {
          if (err) {
            result = {status: 1, msg: 'Server Error!'}
          } else if (item === null) {
            result = {status: -1, msg: 'User not Exists!'}
          } else {
            result = {status: 0, userId: item.userId, _id: item._id, msg: 'UserId Got!'}
          }
          return callback(err, result)
        })
      },
      checkNo: ['checkUser', function (results, callback) {
        if (results.checkUser.status === -1) {
          dataGatherFunc.getSeriesNo(1, function (err, num) {
            return callback(err, num)
          })
        } else {
          return callback(null)
        }
      }],
      newUser: ['checkNo', function (results, callback) {
        if (results.checkUser.status === -1) {
          let userData = {
            userId: results.checkNo,
            phoneNo: phoneNo,
            role: [role]
          }
          let newAlluser = new Alluser(userData)
          newAlluser.save(function (err, info) {
            return callback(err, {status: 0, userId: info.userId, _id: info._id, msg: 'UserId Created!'})
            // let userId = results.checkNo
            // let roles = role

            // if (userId && roles) {
            //   acl.addUserRoles(userId, roles, function (err) {
            //     if (err) {
            //       return res.status(500).send(err.errmsg)
            //     }
            //     res.json({results: 0, userNo: _userNo, mesg: 'Alluser Register Success!'})
            //   })
            // } else {
            //   return res.status(400).send('empty inputs')
            // }
          })
        } else {
          return callback(null)
        }
      }]
    }, function (err, results) {
      if (results.checkUser.status === 0) {
        return callback(err, results.checkUser)
      } else if (results.newUser.status === 0) {
        return callback(err, results.newUser)
      } else {
        return callback(err, {status: 1, msg: 'Server Error!'})
      }
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
    console.log(traceData)
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
