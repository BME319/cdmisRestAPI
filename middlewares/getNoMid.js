
// var config = require('../config')
var DictNumber = require('../models/dictNumber')
var Numbering = require('../models/numbering')

var commonFunc = require('../middlewares/commonFunc')

exports.getNo = function (setType) {
  return function (req, res, next) {
    var _numberingType
    var _targetDate
    if (setType != null) {
      _numberingType = setType
    } else if (setType == null) {
      if (req.query.numberingType !== null && req.query.numberingType !== '') {
        _numberingType = req.query.numberingType
      } else if (req.body.numberingType !== null && req.body.numberingType !== '') {
        _numberingType = req.body.numberingType
      } else {
        _numberingType = null
      }
    }

    if (req.query.targetDate !== null && req.query.targetDate !== '') {
      _targetDate = req.query.targetDate
    } else if (req.body.targetDate !== null && req.body.targetDate !== '') {
      _targetDate = req.body.targetDate
    } else {
      _targetDate = null
    }

    if (_numberingType == null) {
      return res.json({results: '请输入numberingType!'})
    } else {
      if (_targetDate == null) {
        _targetDate = commonFunc.getNowFormatDate()
      }
      var query = {type: _numberingType}
      var Data
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
          var _AlphamericFlag = Data.alphamericFlag
          var _Date
          var _KeyDate
          var _TrnNumberingData
          var _TrnNumberingNo
          if (_DateFormat === 'YYMMDD') {
            _Date = _targetDate.substring(2, 8)
          } else if (_DateFormat === 'YYYYMMDD') {
            _Date = _targetDate
          }
          if (_Date == null) {
            _KeyDate = '99999999'
          } else {
            _KeyDate = _targetDate
          }
          var query1 = {type: _numberingType, date: _KeyDate}
          // console.log(query1)
          Numbering.updateOne(query1, {$inc: {number:1}}, function (err, item1) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            _TrnNumberingData = item1
            // console.log(_TrnNumberingData)
            if (_TrnNumberingData == null) {
              _TrnNumberingNo = 0
            } else {
              _TrnNumberingNo = _TrnNumberingData.number
            }
            // console.log(_TrnNumberingNo)
            _TrnNumberingNo = _TrnNumberingNo + 1
            var _Seq = _TrnNumberingNo
            if (_AlphamericFlag === 1) {
              _Seq = commonFunc.ConvAlphameric(_Seq)
            }
            if (_Seq.toString().length > _SeqLength) {
              _TrnNumberingNo = 1
              _Seq = 1
            }
            // console.log(_Seq)
            if (_Seq.toString().length < _SeqLength) {
              var n = _SeqLength - _Seq.toString().length
              while (n) {
                _Seq = '0' + _Seq
                n = n - 1
              }
            }
            var _Ret = _Initial + _Date + _Seq
            req.newId = _Ret
            return next()

          }, {upsert: true})
        }
      })
    }
  }
}
