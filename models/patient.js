
var mongoose = require('mongoose');

var patientSchema = new mongoose.Schema({					
	userId: {type:String, unique:true}, 
	name: String, 
	photoUrl: String, 
	birthday: Date, 
	gender: Number, 
	IDNo: String, 
	height: String, 
	// weight: String, 
	occupation: String, 
	bloodType: Number, 
	address: {
		nation: String, 
		province: String, 
		city: String
	}, 
	class: String, 
	class_info: [String], 
	operationTime: Date, 
	VIP: {type:Number, default:0}, 
	hypertension: Number,
	allergic: String, 
	doctors: [
	  {
	  	_id:0, 
	  	doctorId: {type: mongoose.Schema.Types.ObjectId, ref:'doctor'}, 
	  	firstTime: Date, 
	  	invalidFlag: Number
	  }
	], 
	diagnosisInfo: [
	  {
	  	_id:0, 
	  	name: String, 
	  	time: Date, 
	  	hypertension: Number, 
	  	progress: String, 
	  	operationTime: Date, 
	  	content: String, 
	  	doctor: {type: mongoose.Schema.Types.ObjectId, ref:'doctor'}
	  }
	], 
	lastVisit: {
		time: Date, 
		hospital: String, 
		diagnosis: String
	}, 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var patientModel = mongoose.model('patient', patientSchema);

function Patient(patient) {
	this.patient = patient;
}

Patient.prototype.save = function(callback) {
	var patient = this.patient;
	var newPatient = new patientModel(patient);
	newPatient.save(function(err, patientItem) {
		if (err) {
			return callback(err);
		}
		callback(null, patientItem);
	});
}

Patient.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	patientModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, patientInfo) {
			if(err){
				return callback(err);
			}
			callback(null, patientInfo);
		});
};


Patient.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	patientModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, patients) {
			if(err) {
				return callback(err);
			}
			callback(null, patients);
		});
};

Patient.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	patientModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, uppatient) {
			if(err){
				return callback(err);
			}
			callback(null, uppatient);
		});
};

Patient.update = function (query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  patientModel
  	.update(query, obj, options)
  	.populate(populate) 
  	.exec(function (err, patient) {
    	if (err) {
      		return callback(err);
    	}
    callback(null, patient);
  });
};


module.exports = Patient;

