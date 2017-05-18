var mongoose = require('mongoose');

var smsSchema = new mongoose.Schema({
	mobile: String,						
	smsType: String, 
	randNum: Number,
	Expire: Number,
	insertTime: Date
});


var smsModel = mongoose.model('sms', smsSchema);

function Sms(sms) {
	this.sms = sms;
}

Sms.prototype.save = function(callback) {
	var sms = this.sms;
	var newSms = new smsModel(sms);
	newSms.save(function(err, smsItem) {
		if (err) {
			return callback(err);
		}
		callback(null, smsItem);
	});
}

Sms.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	smsModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, smsInfo) {
			if(err){
				return callback(err);
			}
			callback(null, smsInfo);
		});
};


Sms.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	smsModel
		.find(query, fields, options).sort({time:-1})
		.populate(populate)
		.exec(function(err, smss) {
			if(err) {
				return callback(err);
			}
			callback(null, smss);
		});
};

Sms.updateOne = function(query, obj, opts, callback, populate) {
	var options = opts || {};
	var populate = populate || '';

	smsModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upsms) {
			if(err){
				return callback(err);
			}
			callback(null, upsms);
		});
};

Sms.remove = function(query, callback) {
	smsModel
		.remove(query)
		.exec(function(err) {
			callback(err);
		});

};

Sms.removeOne = function(query, callback, opts) {
	var options = opts || {};

	smsModel
		.findOneAndRemove(query, options, function(err, smsss) {
			if (err) {
				return callback(err);
			}
			callback(null, smsss);
		});
};

module.exports = Sms;
