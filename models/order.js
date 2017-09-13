
var mongoose = require('mongoose')

var orderSchema = new mongoose.Schema({
  userId: String, // {type: mongoose.Schema.Types.ObjectId, ref:'user'},
  patientName: String,
  doctorId: String,
  doctorName: String,
  // userObject: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  // doctorObject: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  orderNo: String,
  ordertime: Date,
  money: Number,
  goodsInfo: {
    class: String,
    name: String,
    notes: String
  },
  // paystatus: 0：生成商户订单成功；1：生成预付单成功；2：支付成功；3：支付失败；4：取消订单；5：订单超时；6：退款处理中；7：退款关闭；8：退款异常；9：退款成功
  paystatus: {type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]},
  paytime: Date,
  refundNo: String, // 退款单号
  refundAppTime: Date, // 退款申请时间
  refundSucTime: Date, // 退款成功时间
  // patientName: String,

  // time: Date,
  type: {type: Number, enum: [1, 2, 3, 4, 5, 6]}, // 1 咨询,2 问诊,3 加急咨询,4 主管医生,5 面诊,6 咨询升级问诊
  freeFlag: {type: Number, enum: [0, 1]}, // 0收费，1免费
  docInChaObject: {type: mongoose.Schema.Types.ObjectId, ref: 'doctorsInCharge'},
  conselObject: {type: mongoose.Schema.Types.ObjectId, ref: 'counsel'},
  perDiagObject: {type: mongoose.Schema.Types.ObjectId, ref: 'personalDiag'}
})

var orderModel = mongoose.model('order', orderSchema)

function Order (order) {
  this.order = order
}

Order.prototype.save = function (callback) {
  var order = this.order
  var newOrder = new orderModel(order)
  newOrder.save(function (err, orderItem) {
    if (err) {
      return callback(err)
    }
    callback(null, orderItem)
  })
}

Order.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  orderModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, orderInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, orderInfo)
  })
}

Order.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  orderModel
  .find(query, _fields, options).sort({time: -1})
  .populate(_populate)
  .exec(function (err, orders) {
    if (err) {
      return callback(err)
    }
    callback(null, orders)
  })
}

Order.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  orderModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, uporder) {
    if (err) {
      return callback(err)
    }
    callback(null, uporder)
  })
}

Order.remove = function (query, callback) {
  orderModel
  .remove(query)
  .exec(function (err) {
    callback(err)
  })
}

Order.removeOne = function (query, callback, opts) {
  var options = opts || {}

  orderModel
  .findOneAndRemove(query, options, function (err, orderss) {
    if (err) {
      return callback(err)
    }
    callback(null, orderss)
  })
}

Order.aggregate = function (array, callback) {
  let _array = array || []
  orderModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

module.exports = Order
