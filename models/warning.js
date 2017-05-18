var mongoose = require('mongoose');

var warningSchema = new mongoose.Schema({
	warningId: String,						
	patientId: String, 
	doctors: [String], 
	time: Date, 
	type: Number, 
	pushStatus: Number, 
	processStatus: Number, 
	title: String, 
	score: Number, 
	description: String,  
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var warningModel = mongoose.model('warning', warningSchema);

function Warning(warning) {
	this.warning = warning;
}

Warning.prototype.save = function(callback) {
	var warning = this.warning;
	var newWarning = new warningModel(warning);
	newWarning.save(function(err, warningItem) {
		if (err) {
			return callback(err);
		}
		callback(null, warningItem);
	});
}

Warning.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	warningModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, warningInfo) {
			if(err){
				return callback(err);
			}
			callback(null, warningInfo);
		});
};


Warning.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	warningModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, warnings) {
			if(err) {
				return callback(err);
			}
			callback(null, warnings);
		});
};

Warning.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	warningModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upwarning) {
			if(err){
				return callback(err);
			}
			callback(null, upwarning);
		});
};




module.exports = Warning;
