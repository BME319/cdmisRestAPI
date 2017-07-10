// var config = require('../config')
var webEntry = require('../settings').webEntry
var Patient = require('../models/patient')
var Account = require('../models/account')
var Expense = require('../models/expense')

<<<<<<< HEAD
var	config = require('../config'),
  webEntry = require('../settings').webEntry,
  Patient = require('../models/patient'),
  Account = require('../models/account'),
  Expense = require('../models/expense')

exports.getDocRecords = function (req, res) {
	// 查询条件
  var query = {doctorId: req.query.doctorId}

  var limit = Number(req.query.limit)
  var skip = Number(req.query.skip)

  var opts = {limit: limit, skip: skip, sort: '-time'}
  var fields = {'_id': 0, 'doctorId': 0, 'doctorName': 0, 'patientId': 0}

  var _Url = ''
  var userIdUrl = 'doctorId=' + req.query.doctorId
  var limitUrl = ''
  var skipUrl = ''

  if (limit != null && limit != undefined) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip != null && skip != undefined) {
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (userIdUrl != '' || limitUrl != '' || skipUrl != '') {
    _Url = _Url + '?'
    if (userIdUrl != '') {
      _Url = _Url + userIdUrl + '&'
    }
    if (limitUrl != '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl != '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  req.body.nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v1/expense/getDocRecords' + _Url

  Expense.getSome(query, function (err, item) {
    if (err) {
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: item, nexturl: req.body.nexturl})
=======
exports.getDocRecords = function (req, res) {
  // 查询条件
  var query = {doctorId: req.query.doctorId}

  var limit = Number(req.query.limit)
  var skip = Number(req.query.skip)

  var opts = {limit: limit, skip: skip, sort: '-time'}
  var fields = {'_id': 0, 'doctorId': 0, 'doctorName': 0, 'patientId': 0}

  var _Url = ''
  var userIdUrl = 'doctorId=' + req.query.doctorId
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
  req.body.nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v1/expense/getDocRecords' + _Url

  Expense.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item, nexturl: req.body.nexturl})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }, opts, fields)
}

exports.rechargeDoctor = function (req, res) {
  var _chargetype = req.body.type
  var _pid = req.body.patientId
  var _pName = req.body.patientName
  var _did = req.body.doctorId
  var _dName = req.body.doctorName
  var _money = Number(req.body.money)
<<<<<<< HEAD
  if (_chargetype === '' || _chargetype == undefined || _money === '' || _money == undefined || _pid === '' || _pid == undefined || _did === '' || _did == undefined || _dName === '' || _dName == undefined) {
    return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、费用、病人id姓名-patientId、医生id姓名-doctorId、doctorName'})
  } else {
    	var query = {
    		userId: _pid
    	}
    	var query1 = {
    		userId: _did
    	}
    	Patient.getOne(query, function (err, patient) {
	        if (err) {
	            return res.status(500).send('服务器错误, 用户查询失败!')
	        }
	        if (patient == null) {
	        	return res.json({result: '不存在的患者ID！'})
	        }
	        _pName = patient.name
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
	                    if (item1 == null) {
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
	                            if (upaccount.nModified == 0) {
	                                return res.json({result: '请获取账户信息确认是否修改成功'})
	                            } else if (upaccount.nModified != 0) {
	                                return res.json({result: '修改成功', updateResult: upaccount})
	                            }
	                        })
	                    }
	                })
	            }
	        })
	    })
=======
  if (_chargetype === '' || _chargetype === undefined || _money === '' || _money === undefined || _pid === '' || _pid === undefined || _did === '' || _did === undefined || _dName === '' || _dName === undefined) {
    return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、费用、病人id姓名-patientId、医生id姓名-doctorId、doctorName'})
  } else {
    var query = {
      userId: _pid
    }
    var query1 = {
      userId: _did
    }
    Patient.getOne(query, function (err, patient) {
      if (err) {
        return res.status(500).send('服务器错误, 用户查询失败!')
      }
      if (patient === null) {
        return res.json({result: '不存在的患者ID！'})
      }
      _pName = patient.name
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
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }
}
