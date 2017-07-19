var mongoose = require('mongoose')

var expenseSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  doctorId: String,
  doctorName: String,
  time: Date,
  money: Number,
  type: String,
  status: Number
})

var expenseModel = mongoose.model('expense', expenseSchema)

function Expense (expense) {
  this.expense = expense
}

Expense.prototype.save = function (callback) {
  var expense = this.expense
  var newExpense = new expenseModel(expense)
  newExpense.save(function (err, expenseItem) {
    if (err) {
      return callback(err)
    }
    callback(null, expenseItem)
  })
}

Expense.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  expenseModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, expenseInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, expenseInfo)
  })
}

Expense.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  expenseModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, expenses) {
    if (err) {
      return callback(err)
    }
    callback(null, expenses)
  })
}

Expense.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  expenseModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upexpense) {
    if (err) {
      return callback(err)
    }
    callback(null, upexpense)
  })
}

Expense.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  expenseModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upexpense) {
      if (err) {
        return callback(err)
      }
      callback(null, upexpense)
    })
}

module.exports = Expense
