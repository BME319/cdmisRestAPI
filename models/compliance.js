var mongoose = require('mongoose');

var complianceSchema = new mongoose.Schema({
	userId: String,						
	type: String, 
	code: String, 
	date: Date, 
	status: Number, 
	description: String
	
});


var complianceModel = mongoose.model('compliance', complianceSchema);

function Compliance(compliance) {
	this.compliance = compliance;
}

Compliance.prototype.save = function(callback) {
	var compliance = this.compliance;
	var newCompliance = new complianceModel(compliance);
	newCompliance.save(function(err, complianceItem) {
		if (err) {
			return callback(err);
		}
		callback(null, complianceItem);
	});
}

Compliance.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	complianceModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, complianceInfo) {
			if(err){
				return callback(err);
			}
			callback(null, complianceInfo);
		});
};


Compliance.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	complianceModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, compliances) {
			if(err) {
				return callback(err);
			}
			callback(null, compliances);
		});
};

Compliance.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	complianceModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upcompliance) {
			if(err){
				return callback(err);
			}
			callback(null, upcompliance);
		});
};




module.exports = Compliance;
