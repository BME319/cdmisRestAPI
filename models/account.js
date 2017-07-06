

var mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
	userId: String,						
	freeTimes: {type: Number, default: 3}, 
	times: [
	  {
	  	_id:0, 
		count: {type:Number},
		doctorId: {type:String} 
		// doctorId: {type:String, unique:true}
	  } 
	], 
	money: {type: Number, default: 0}, 
	expenseRecords:[
	  {
	  	time: Date, 
	  	type: {type:Number}, 
	  	money: Number, 
	  	title: String
	  }
	], 
	rechargeRecords: [
	  {
	  	time: Date, 
	  	money: Number, 
	  	title: String
	  }
	], 
	incomeRecords: [
	  {
	  	time: Date, 
	  	money: Number, 
	  	from: String
	  }
	], 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var accountModel = mongoose.model('account', accountSchema);


function Account(account) {
	this.account = account;
}

Account.prototype.save = function(callback) {
	var account = this.account;
	var newAccount = new accountModel(account);
	newAccount.save(function(err, accountItem) {
		if (err) {
			return callback(err);
		}
		callback(null, accountItem);
	});
}

Account.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	accountModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, accountInfo) {
			if(err){
				return callback(err);
			}
			callback(null, accountInfo);
		});
};


Account.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	accountModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, accounts) {
			if(err) {
				return callback(err);
			}
			callback(null, accounts);
		});
};

Account.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	accountModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upaccount) {
			if(err){
				return callback(err);
			}
			callback(null, upaccount);
		});
};

Account.update = function (query, obj, callback, opts, populate) {
  	var options = opts || {};
  	var populate = populate || '';

  	accountModel
  		.update(query, obj, options)
  		.populate(populate) 
  		.exec(function (err, upaccount) {
    		if (err) {
      			return callback(err);
    		}
    		callback(null, upaccount);
  		});
};


module.exports = Account;
