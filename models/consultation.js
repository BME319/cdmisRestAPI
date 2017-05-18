
var mongoose = require('mongoose');

var consultationSchema = new mongoose.Schema({
	consultationId: {type:String, unique:true},						
	sponsorId: {type: mongoose.Schema.Types.ObjectId, ref:'doctor'}, 
	patientId: {type: mongoose.Schema.Types.ObjectId, ref:'patient'}, 
	time: Date, 
	diseaseInfo: {type: mongoose.Schema.Types.ObjectId, ref:'counsel'}, 
	status:Number,
	messages: [
	  {
	  	sender: String, 
	  	receiver: String, 
	  	time: Date, 
	  	content: String
	  }
	], 
	conclusion: String, 
	teamId: {type: mongoose.Schema.Types.ObjectId, ref:'team'}, 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var consultationModel = mongoose.model('consultation', consultationSchema);

function Consultation(consultation) {
	this.consultation = consultation;
}

Consultation.prototype.save = function(callback) {
	var consultation = this.consultation;
	var newConsultation = new consultationModel(consultation);
	newConsultation.save(function(err, consultationItem) {
		if (err) {
			return callback(err);
		}
		callback(null, consultationItem);
	});
}

Consultation.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	consultationModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, consultationInfo) {
			if(err){
				return callback(err);
			}
			callback(null, consultationInfo);
		});
};


Consultation.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	consultationModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, consultations) {
			if(err) {
				return callback(err);
			}
			callback(null, consultations);
		});
};

Consultation.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	consultationModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upconsultation) {
			if(err){
				return callback(err);
			}
			callback(null, upconsultation);
		});
};




module.exports = Consultation;
