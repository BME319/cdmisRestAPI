// var config = require('../config')
// var Doctor = require('../models/doctor')
var Order = require('../models/order')
var Alluser = require('../models/alluser')
var Account = require('../models/account')
var webEntry = require('../settings').webEntry
// var commonFunc = require('../middlewares/commonFunc')

// 获取订单信息
exports.getOrder = function (req, res) {
  var _orderNo = req.query.orderNo || null
  // console.log(_orderNo)
  var query = {}
  var populate = [{path: 'conselObject', select: 'status -_id'}, {path: 'perDiagObject', select: 'status code bookingDay bookingTime place diagId -_id'}, {path: 'docInChaObject', select: 'invalidFlag -_id'}]
  if (_orderNo !== null && _orderNo !== '') {
    query['orderNo'] = _orderNo
  } else {
    var role = req.session.role
    var userId = req.session.userId

    var fields
    var userIdUrl = 'token=' + req.token

    var patientName = req.query.patientName || null
    var doctorName = req.query.doctorName || null
    var time = req.query.time || null
    var money = req.query.money || null
    var type = req.query.type || null
    // var status = req.query.status || null

    if (role === 'patient') {
      query = {userId: userId}
    // field设定是否显示相应列
      fields = {'_id': 0, 'doctorId': 0, 'patientName': 0, 'userId': 0}
    // userIdUrl = 'patientId=' + userId
    }
    if (role === 'doctor') {
      query = {doctorId: userId}
      fields = {'_id': 0, 'doctorId': 0, 'doctorName': 0, 'userId': 0}
    // userIdUrl = 'doctorId=' + userId
    }
    if (patientName !== '' && patientName !== null) {
      query['patientName'] = { $regex: patientName }
    }
    if (doctorName !== '' && doctorName !== null) {
      query['doctorName'] = { $regex: doctorName }
    }
    if (time !== '' && time !== null) {
      query['paytime'] = time
    }
    if (money !== '' && money !== null) {
      query['money'] = money
    }
    if (type !== '' && type !== null) {
      query['type'] = type
    }
    // if (status !== '' && status !== null) {
    //   query['status'] = status
    // }
    var limit = Number(req.query.limit)
    var skip = Number(req.query.skip)

  // limit为分页显示个数，skip为跳过历史记录的个数，sort按时间降序排列
    var opts = {limit: limit, skip: skip, sort: '-ordertime'}

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
    var nexturl = webEntry.domain + '/api/v2/order/order' + _Url
  }
  Order.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item, nexturl: nexturl})
  }, opts, fields, populate)
}

exports.getOrderNo = function (req, res, next) {
  var doctorId = req.body.doctorId || null
  var patientId = req.body.patientId || null
  var paystatus = Number(2)
  var type = req.body.type || null
  if (type !== null) {
    type = Number(type)
  }
  // var _orderNo = req.query.orderNo || null
  if (doctorId === null || patientId === null) {
    return res.json({result: 1, msg: '请输入doctorId、patientId'})
  }
  var query = {userId: patientId, doctorId: doctorId, paystatus: paystatus, type: type}
  if (type === 1 || type === 2 || type === 3 || type === 6) {
    query['conselObject'] = {$exists: false}
  }
  if (type === 4) {
    query['docInChaObject'] = {$exists: false}
  }
  if (type === 5) {
    query['perDiagObject'] = {$exists: false}
  }
  Order.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else if (item === null) {
      return res.status(404).json({result: '更新订单错误：无法查询到订单请重新尝试或联系管理员'})
    } else {
      req.body.orderNo = item.orderNo
      next()
    }
  })
}

exports.getchangeOrderNo = function (req, res, next) {
  var doctorId = req.body.doctorId || null
  var patientId = req.body.patientId || null
  var paystatus = Number(2)
  var type = req.body.newtype || null
  if (type !== null) {
    type = Number(type)
  }
  // var _orderNo = req.query.orderNo || null
  if (doctorId === null || patientId === null) {
    return res.json({result: 1, msg: '请输入doctorId、patientId'})
  }
  var query = {userId: patientId, doctorId: doctorId, paystatus: paystatus, type: type}
  Order.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else if (item.length === 0) {
      return res.status(404).json({result: '更新订单错误：无法查询到订单请重新尝试或联系管理员'})
    } else {
      req.body.orderNo = item[0].orderNo
      next()
    }
  }, {sort: {_id: -1}})
}

exports.insertOrder = function (req, res, next) {
  let isIncharge = req.isIncharge
  // var money = req.body.money || null
  var money = req.body.money
  if (money === null || money === '') {
    return res.status(403).send('invalid input money')
  }
  var type = req.body.type || null
  if (type === null || type === '') {
    return res.status(403).send('invalid input type')
  }
  type = Number(type)
  var freeFlag = req.body.freeFlag
  if (freeFlag === null || freeFlag === '' || freeFlag === undefined) {
    return res.status(403).send('invalid input freeFlag')
  }
  freeFlag = Number(freeFlag)
  var query = {
    userId: req.body.doctorId
  }
  // Doctor.getOne(query, function (err, doctor) {
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
            // console.log(err);
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor === null) {
      return res.json({result: '不存在的医生ID！'})
    } else {
      var trueMoney
      if (req.body.class === '01') {
        // 咨询服务
        trueMoney = doctor.charge1 * 100
      } else if (req.body.class === '02') {
        // 问诊服务
        trueMoney = doctor.charge2 * 100
      } else if (req.body.class === '03') {
        // 咨询升级问诊
        trueMoney = doctor.charge2 * 100 - doctor.charge1 * 100
      } else if (req.body.class === '04') {
        // 主管医生
        let month = req.body.month || 0
        if (month === 0) {
          return res.json({result: '购买主管医生的服务时间输入错误！'})
        }
        trueMoney = doctor.charge4 * 100 * month
      } else if (req.body.class === '05') {
        // 面诊
        trueMoney = doctor.charge5 * 100
      } else if (req.body.class === '06') {
        // 加急咨询
        trueMoney = doctor.charge3 * 100
      } else if (req.body.class === '07') {
        // 咨询升级加急咨询
        trueMoney = doctor.charge3 * 100 - doctor.charge1 * 100
      } else {
        return res.status(403).send('服务类型不存在!')
      }
      if (isIncharge) {
        if (req.body.class === '01' || req.body.class === '02' || req.body.class === '03') {
          trueMoney = 0
          money = 0
          freeFlag = 1
        }
      }
      
      if (money !== trueMoney) {
        return res.status(403).send('服务费用不匹配!')
      } else {
        var paystatus
        if (trueMoney === 0 || freeFlag === 1) {
          paystatus = 2
        } else {
          paystatus = 0
        }
        var currentDate = new Date()
        if (currentDate <= new Date('2017-09-01')) {
          paystatus = 2
          // return res.json({ results: {
          //   status: 0,
          //   msg: '现在为免费体验期，不收取任何费用'
          // }})
        }
        var orderData = {
          userId: req.session.userId,
          patientName: req.userObject.name,
          // userObject: req.userObject._id,
          doctorId: req.body.doctorId,
          doctorName: req.doctorObject.name,
          orderNo: req.newId, // req.body.orderNo,
          ordertime: new Date(),
          money: money,
          goodsInfo: {
            class: req.body.class,
            name: req.body.name,
            notes: req.body.notes
          },
                    // paystatus:req.body.paystatus,
          paystatus: paystatus,   // req.body.paystatus,
          type: type,
          freeFlag: freeFlag,
          paytime: new Date()
        }

        var newOrder = new Order(orderData)
        newOrder.save(function (err, item) {
          if (err) {
            // console.log(err)
            return res.status(500).send(err.errmsg)
          }
                    // res.json({results: item});
          if (req.isIncharge) {
            return res.json({results: {status: 1, msg: '该医生为您的主管医生，无需支付'}})
          } else if (trueMoney === 0) {
            return res.json({results: {status: 1, msg: '支付金额为0，无需进行支付'}})
          } else if (freeFlag === 1) {
            // 有免费次数
            return res.json({results: {status: 1, msg: '本次服务免费'}})
          } else if (currentDate <= new Date('2017-09-01')) {
            return res.json({results: {status: 1, msg: '现在为免费体验期，不收取任何费用'}})
          } else {
            req.orderObject = item
            next()
          }
        })
      }
    }
  })
}

// 更新订单信息
exports.updateOrder = function (req, res) {
  var query = {orderNo: req.body.orderNo}
  var paystatus = req.body.paystatus || null
  var docInChaObject = req.body.docInChaObject || null
  var conselObject = req.body.conselObject || null
  var perDiagObject = req.body.perDiagObject || null
  var upObj = {}
  if (paystatus !== '' && paystatus !== null) {
    paystatus = Number(paystatus)
    upObj['paystatus'] = paystatus
    upObj['paytime'] = new Date(req.body.paytime)
  }
  if (docInChaObject !== '' && docInChaObject !== null) {
    upObj['docInChaObject'] = docInChaObject
  }
  if (conselObject !== '' && conselObject !== null) {
    upObj['conselObject'] = conselObject
  }
  if (perDiagObject !== '' && perDiagObject !== null) {
    upObj['perDiagObject'] = perDiagObject
  }
  Order.updateOne(query, {$set: upObj}, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    // console.log(item.paystatus)
    // console.log(conselObject)
    if (item.paystatus === 2 && conselObject !== null) {
      var query1 = {
        userId: item.doctorId
      }
      Account.getOne(query1, function (err, item1) {
        if (err) {
          return res.status(500).send(err)
        }
        if (item1 === null) {
          var accountData = {
            userId: item.doctorId,
            money: item.money / 100
          }
          var newAccount = new Account(accountData)
          newAccount.save(function (err, accountInfo) {
            if (err) {
              return res.status(500).send(err)
            } else {
              res.json({result: 'success!'})
            }
          })
        } else {
          var upObj = {
            $inc: {
              money: item.money / 100
              // money: item.money
            }
          }
          Account.update(query1, upObj, function (err, upaccount) {
            if (err) {
              return res.status(500).send(err)
            }
            if (upaccount.nModified === 0) {
              return res.json({result: '请获取账户信息确认是否修改成功', results: req.body.counselInfo})
            } else if (upaccount.nModified !== 0) {
              return res.json({result: '修改成功', updateResult: upaccount, results: req.body.counselInfo})
            }
          })
        }
      })
    } else {
      if (req.body.counselInfo) {
        return res.json({result: '新建成功', results: req.body.counselInfo})
      } else if (req.body.PDinfo) {
        return res.json({result: '新建成功', results: req.body.PDinfo})
      } else {
        res.json({results: item, msg: 'success!'})
      }
      // res.json({results: item, msg: 'success!'})
    }
  }, {new: true})
}

// 修改订单状态前验证是否符合条件 2017-06-19 GY
exports.checkPayStatus = function (type) {
  return function (req, res, next) {
    var query = {orderNo: req.body.orderNo}

    Order.getOne(query, function (err, item) {
      if (err) {
        return res.status(500).send(err)
      }
      if (item === null) {
        return res.status(400).send('不存在的订单')
      } else if ((type === 'refund') && (item.paystatus === 2)) {
        // 可以申请退款
        req.orderDetail = item
        next()
      } else if ((type === 'refundquery') && (item.paystatus === 6 || item.paystatus === 7 || item.paystatus === 8 || item.paystatus === 9)) {
        // 可以查询退款
        req.orderDetail = item
        next()
      } else {
        return res.status(412).send('错误的支付状态')
      }
    })
  }
}

// 退款时对存储的订单进行操作 2017-06-19 GY
exports.refundChangeStatus = function (status) {
  return function (req, res, next) {
    var _status
    if (status === undefined) {
      _status = req.refundQueryMsg.refund_status_0
    } else {
      _status = status
    }
    var query = {orderNo: req.body.orderNo}
        // console.log(_status);
    var upObj
    if (_status === 'refundApplication') {
      upObj = {
        paystatus: 6, // 退款处理中
        refundNo: req.newId,
        refundAppTime: new Date()
      }
    } else if (_status === 'REFUNDCLOSE') {
      upObj = {
        paystatus: 7 // 退款关闭
      }
    } else if (_status === 'CHANGE') {
      upObj = {
        paystatus: 8 // 退款异常
      }
    } else if (_status === 'SUCCESS') {
      upObj = {
        paystatus: 9, // 退款成功
        refundSucTime: new Date(req.refundQueryMsg.refund_success_time_0)
      }
    } else if (_status === 'PROCESSING') {
      upObj = ''
    } else {
      return res.status(500).send('订单修改状态出错')
    }

    var opts = {new: true}

    Order.updateOne(query, upObj, function (err, uporder) {
      if (err) {
        return res.status(500).send(err)
      }
      if (uporder === null) {
        return res.status(400).send('不存在的订单')
      } else {
        req.orderDetail = uporder
                // return res.json({results: uporder});
        if (status === 'refundApplication') {
          next()
        } else {
          return res.json({orderDetail: uporder, wechatDetail: req.refundQueryMsg})
        }
      }
    }, opts)
  }
}

// 查询患者是否已付款但未填写咨询问卷 2017-09-14 JYF
exports.checkCounsel = function (req, res) {
  let userId = req.session.userId
  let doctorId = req.query.doctorId
  let array = [
    {$match: {userId: userId, doctorId: doctorId, paystatus: 2, conselObject: {$eq: null}}},
    {$match: {$or: [{type: 1}, {type: 2}, {type: 3}, {type: 6}, {type: 7}]}},
    {$project: {'type': 1, '_id': 0}}
  ]
  Order.aggregate(array, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null || item.length === 0) {
      res.json({msg:'nonexistence'})
    } else {
      res.json({results: item})
    }
  })
}
