
var mongoose = require('mongoose');

var doctorSchema = new mongoose.Schema({
	userId: {type:String, unique:true}, 
	name: String, 
	photoUrl:String, 
	certificatePhotoUrl:String, //资格证书地址
	practisingPhotoUrl:String, //执业证书地址
	birthday: Date, 
	gender: Number, 
	IDNo: String, 
	province: String, 
	city: String,
	district: String,
	workUnit: String, 
	title: String, 
	job: String, 
	department: String, 
	major: String, 
	description: String, 
	score: Number, 
	charge1: {type:Number, default:30}, 
	charge2: {type:Number, default:50}, 
	count1: {type:Number, default:0}, 
	count2: {type:Number, default:0}, 
	teams: [String], 
	schedules: [
		{
			_id: 0,
			day: String, 
			time: String
		}
	], 
	suspendTime: [
		{
			_id: 0,
			start: Date, 
			end: Date
		}
	], 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var doctorModel = mongoose.model('doctor', doctorSchema);

function Doctor(doctor) {
	this.doctor = doctor;
}

Doctor.prototype.save = function(callback) {
	var doctor = this.doctor;
	var newDoctor = new doctorModel(doctor);
	newDoctor.save(function(err, doctorItem) {
		if (err) {
			return callback(err);
		}
		callback(null, doctorItem);
	});
}

Doctor.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	doctorModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, doctorInfo) {
			if(err){
				return callback(err);
			}
			callback(null, doctorInfo);
		});
};


Doctor.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	doctorModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, doctors) {
			if(err) {
				return callback(err);
			}
			callback(null, doctors);
		});
};

Doctor.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	doctorModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, updoctor) {
			if(err){
				return callback(err);
			}
			callback(null, updoctor);
		});
};

Doctor.update = function (query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  doctorModel
  	.update(query, obj, options)
  	.populate(populate) 
  	.exec(function (err, updoctor) {
    	if (err) {
      		return callback(err);
    	}
    callback(null, updoctor);
  });
};


Doctor.count = function(query, callback) {
	doctorModel
		.count(query)
		.count(function(err, total) {
			if(err){
				return callback(err);
			}
			callback(null, total);
		});
};


module.exports = Doctor;
