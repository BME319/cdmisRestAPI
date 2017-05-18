var mongoose = require('mongoose');

var insuranceMsgSchema = new mongoose.Schema({
	doctorId: String,
	patientId: String,
	insuranceMsg:[{
		insuranceId: String,
		time: Date,
		description: String}],
	count: {type:Number, default:0},
	preference:{
		status:Number,
		time:Date
	}
});


var insuranceMsgModel = mongoose.model('insuranceMsg', insuranceMsgSchema);

function InsuranceMsg(insuranceMsg) {
	this.insuranceMsg = insuranceMsg;
}

InsuranceMsg.prototype.save = function(callback) {
	var insuranceMsg = this.insuranceMsg;
	var newInsuranceMsg = new insuranceMsgModel(insuranceMsg);
	newInsuranceMsg.save(function(err, insuranceMsgItem) {
		if (err) {
			return callback(err);
		}
		callback(null, insuranceMsgItem);
	});
}

InsuranceMsg.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	insuranceMsgModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, insuranceMsgInfo) {
			if(err){
				return callback(err);
			}
			callback(null, insuranceMsgInfo);
		});
};


InsuranceMsg.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	insuranceMsgModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, insuranceMsgs) {
			if(err) {
				return callback(err);
			}
			callback(null, insuranceMsgs);
		});
};

InsuranceMsg.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	insuranceMsgModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upinsuranceMsg) {
			if(err){
				return callback(err);
			}
			callback(null, upinsuranceMsg);
		});
};

InsuranceMsg.update = function (query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  insuranceMsgModel
  	.update(query, obj, options)
  	.populate(populate) 
  	.exec(function (err, upinsuranceMsg) {
    	if (err) {
      		return callback(err);
    	}
    callback(null, upinsuranceMsg);
  });
};


module.exports = InsuranceMsg;
