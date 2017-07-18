// var config = require('../config')
var webEntry = require('../settings').webEntry
// var Patient = require('../models/patient')
var Account = require('../models/account')
var Expense = require('../models/expense')
var Alluser = require('../models/alluser')

exports.getRecords = function (req, res) {
  // 查询条件
  var role = req.session.role
  var userId = req.session.userId
  var query
  var fields
  var userIdUrl = 'token=' + req.token

  var patientName = req.query.patientName || null
  var doctorName = req.query.doctorName || null
  var time = req.query.time || null
  var money = req.query.money || null
  var type = req.query.type || null
  var status = req.query.status || null

  if (role === 'patient') {
    query = {patientId: userId}
    fields = {'_id': 0, 'doctorId': 0, 'patientName': 0, 'patientId': 0}
    // userIdUrl = 'patientId=' + userId
  }
  if (role === 'doctor') {
    query = {doctorId: userId}
    fields = {'_id': 0, 'doctorId': 0, 'doctorName': 0, 'patientId': 0}
    // userIdUrl = 'doctorId=' + userId
  }

  if (patientName !== '' && patientName !== null) {
    query['patientName'] = { $regex: patientName }
  }
  if (doctorName !== '' && doctorName !== null) {
    query['doctorName'] = { $regex: doctorName }
  }
  if (time !== '' && time !== null) {
    query['time'] = time
  }
  if (money !== '' && money !== null) {
    query['money'] = money
  }
  if (type !== '' && type !== null) {
    query['type'] = type
  }
  if (status !== '' && status !== null) {
    query['status'] = status
  }
  var limit = Number(req.query.limit)
  var skip = Number(req.query.skip)

  var opts = {limit: limit, skip: skip, sort: '-time'}

  var _Url = ''
  var limitUrl = ''
  var skipUrl = ''

  if (limit !== null && limit !== undefined) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip !== null && skip !== undefined) {
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (userIdUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (userIdUrl !== '') {
      _Url = _Url + userIdUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  var nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v2/expense/records' + _Url

  Expense.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item, nexturl: nexturl})
  }, opts, fields)
}

exports.rechargeDoctor = function (req, res) {
  var _chargetype = req.body.type || null
  var _status = req.body.status || null
  var _pid = req.session.userId || null
  var _pName
  var _did = req.doctorId || null
  var _dName
  var _money = req.body.money || null
  if (_chargetype === '' || _chargetype === null || _status === '' || _status === null || _money === '' || _money === null || _pid === '' || _pid === null || _did === '' || _did === null) {
    return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、费用、病人id-patientId、医生id-doctorId'})
  } else {
    _money = Number(_money)
    var query = {
      userId: _pid
    }
    var query1 = {
      userId: _did
    }
    Alluser.getOne(query, function (err, patient) {
      if (err) {
        return res.status(500).send('服务器错误, 用户查询失败!')
      }
      if (patient === null) {
        return res.json({result: '不存在的患者ID！'})
      }
      Alluser.getOne(query1, function (err, doctor) {
        if (err) {
          return res.status(500).send('服务器错误, 用户查询失败!')
        }
        if (patient === null) {
          return res.json({result: '不存在的医生ID！'})
        }
        _pName = patient.name
        _dName = doctor.name
        var expenseData = {
          patientId: _pid,
          patientName: _pName,
          doctorId: _did,
          doctorName: _dName,
          time: new Date(),
          money: _money,
          type: _chargetype
        }
        var newExpense = new Expense(expenseData)
        newExpense.save(function (err, expenseInfo) {
          if (err) {
            return res.status(500).send(err.errmsg)
          } else {
          // res.json({result:"success!"});
            Account.getOne(query1, function (err, item1) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              if (item1 === null) {
                var accountData = {
                  userId: _did,
                  money: _money
                }
                var newAccount = new Account(accountData)
                newAccount.save(function (err, accountInfo) {
                  if (err) {
                    return res.status(500).send(err.errmsg)
                  } else {
                    res.json({result: 'success!'})
                  }
                })
              } else {
                var _money1 = _money + item1.money
                var upObj = {
                  $set: {money: _money1}
                }
                Account.update(query1, upObj, function (err, upaccount) {
                  if (err) {
                    return res.status(500).send(err.errmsg)
                  }
                  if (upaccount.nModified === 0) {
                    return res.json({result: '请获取账户信息确认是否修改成功'})
                  } else if (upaccount.nModified !== 0) {
                    return res.json({result: '修改成功', updateResult: upaccount})
                  }
                })
              }
            })
          }
        })
      })
    })
  }
}
