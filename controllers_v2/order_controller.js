<<<<<<< HEAD
var	config = require('../config'),
  Doctor = require('../models/doctor'),
  Order = require('../models/order')
=======
// var config = require('../config')
var Doctor = require('../models/doctor')
var Order = require('../models/order')
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
var commonFunc = require('../middlewares/commonFunc')

exports.getOrder = function (req, res) {
  var _orderNo = req.query.orderNo
  var query = {orderNo: _orderNo}

  Order.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

exports.insertOrder = function (req, res, next) {
  var money = req.body.money || null
<<<<<<< HEAD
  if (money === null || money == '') {
=======
  if (money === null || money === '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    return res.status(403).send('invalid input')
  }

  var query = {
    userId: req.body.notes
  }
  Doctor.getOne(query, function (err, doctor) {
    if (err) {
            // console.log(err);
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
<<<<<<< HEAD
    if (doctor == null) {
      return res.json({result: '不存在的医生ID！'})
    } else {
      var true_money
      if (req.body.class == '01') {
        true_money = doctor.charge1 * 100
      } else if (req.body.class == '02') {
        true_money = doctor.charge2 * 100
      } else if (req.body.class == '03') {
        true_money = doctor.charge2 * 100 - doctor.charge1 * 100
      } else {
        return res.status(403).send('服务类型不存在!')
      }
      if (money != true_money) {
        return res.status(403).send('服务费用不匹配!')
      } else {
        var paystatus
        if (true_money == 0) {
=======
    if (doctor === null) {
      return res.json({result: '不存在的医生ID！'})
    } else {
      var trueMoney
      if (req.body.class === '01') {
        trueMoney = doctor.charge1 * 100
      } else if (req.body.class === '02') {
        trueMoney = doctor.charge2 * 100
      } else if (req.body.class === '03') {
        trueMoney = doctor.charge2 * 100 - doctor.charge1 * 100
      } else {
        return res.status(403).send('服务类型不存在!')
      }
      if (money !== trueMoney) {
        return res.status(403).send('服务费用不匹配!')
      } else {
        var paystatus
        if (trueMoney === 0) {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
          paystatus = 2
        } else {
          paystatus = 0
        }
        var orderData = {
          userId: req.body.userId,
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
          paytime: new Date(req.body.paytime)
        }

        var newOrder = new Order(orderData)
        newOrder.save(function (err, item) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
                    // res.json({results: item});
<<<<<<< HEAD
          if (true_money == 0) {
            return res.json({results: { status: 1, msg: '支付金额为0，无需进行支付'}})
=======
          if (trueMoney === 0) {
            return res.json({results: {status: 1, msg: '支付金额为0，无需进行支付'}})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
          } else {
            req.orderObject = item
            next()
          }
        })
      }
    }
  })
}

exports.updateOrder = function (req, res) {
  var query = {orderNo: req.body.orderNo}
  var upObj = {
    paystatus: req.body.paystatus,
    paytime: new Date(req.body.paytime)
  }
  Order.updateOne(query, {$set: upObj}, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: item, msg: 'success!'})
  })
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
<<<<<<< HEAD
      } else if ((type == 'refund') && (item.paystatus === 2)) {
                // 可以申请退款
        next()
      } else if ((type == 'refundquery') && (item.paystatus === 6 || item.paystatus === 7 || item.paystatus === 8 || item.paystatus === 9)) {
=======
      } else if ((type === 'refund') && (item.paystatus === 2)) {
                // 可以申请退款
        next()
      } else if ((type === 'refundquery') && (item.paystatus === 6 || item.paystatus === 7 || item.paystatus === 8 || item.paystatus === 9)) {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
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
<<<<<<< HEAD
    if (status === undefined) {
      var _status = req.refundQueryMsg.refund_status_0
    } else {
      var _status = status
=======
    var _status
    if (status === undefined) {
      _status = req.refundQueryMsg.refund_status_0
    } else {
      _status = status
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    }
    var query = {orderNo: req.body.orderNo}
        // console.log(_status);
    var upObj
    if (_status === 'refundApplication') {
      upObj = {
        paystatus: 6, // 退款处理中
        refundNo: req.newId,
        refundAppTime: new Date(commonFunc.getNowFormatSecond())
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

<<<<<<< HEAD
    if (_status === 'refundApplication') {
      var upObj = {
        paystatus: 6, // 退款处理中
        refundNo: req.newId,
        refundAppTime: new Date(commonFunc.getNowFormatSecond())
      }
    } else if (_status === 'REFUNDCLOSE') {
      var upObj = {
        paystatus: 7 // 退款关闭
      }
    } else if (_status === 'CHANGE') {
      var upObj = {
        paystatus: 8 // 退款异常
      }
    } else if (_status === 'SUCCESS') {
      var upObj = {
        paystatus: 9, // 退款成功
        refundSucTime: new Date(req.refundQueryMsg.refund_success_time_0)
      }
    } else if (_status === 'PROCESSING') {
      var upObj = ''
    } else {
      return res.status(500).send('订单修改状态出错')
    }

=======
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
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
