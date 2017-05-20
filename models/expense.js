var mongoose = require('mongoose');

var expenseSchema = new mongoose.Schema({
	patientId: String,
	patientName: String,
	doctorId: String,
	doctorName: String,
	time: Date, 
	money: Number,
	type: String
});


var expenseModel = mongoose.model('expense', expenseSchema);


function Expense(expense) {
	this.expense = expense;
}

Expense.prototype.save = function(callback) {
	var expense = this.expense;
	var newExpense = new expenseModel(expense);
	newExpense.save(function(err, expenseItem) {
		if (err) {
			return callback(err);
		}
		callback(null, expenseItem);
	});
}

Expense.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	expenseModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, expenseInfo) {
			if(err){
				return callback(err);
			}
			callback(null, expenseInfo);
		});
};


Expense.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	expenseModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, expenses) {
			if(err) {
				return callback(err);
			}
			callback(null, expenses);
		});
};

Expense.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	expenseModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upexpense) {
			if(err){
				return callback(err);
			}
			callback(null, upexpense);
		});
};

Expense.update = function (query, obj, callback, opts, populate) {
  	var options = opts || {};
  	var populate = populate || '';

  	expenseModel
  		.update(query, obj, options)
  		.populate(populate) 
  		.exec(function (err, upexpense) {
    		if (err) {
      			return callback(err);
    		}
    		callback(null, upexpense);
  		});
};


module.exports = Expense;
