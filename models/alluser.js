
var mongoose = require('mongoose');

var alluserSchema = new mongoose.Schema({
	userId: {type:String, unique:true},					
	name: String,
	birthday: Date,
	gender: Number,
	IDNo: String,
	openId:  {type: String, unique: true, sparse : true},	//UnionId
	phoneNo: String,
	password:String,
	agreement:String,
	photoUrl:String,
	role:[String],
	loginStatus:Number,
	lastLogin:Date,
	TDCticket: String,
	TDCurl: String,
	invalidFlag: Number,
	MessageOpenId:{
		doctorWechat:String,
		patientWechat:String,
		doctorApp:String,
		patientApp:String,
		test:String
	},
	jpush:{
		registrationID:String,
		alias:String,
		tags:[String]
	},

	//doctor_info
	certificatePhotoUrl:String, //资格证书地址
	practisingPhotoUrl:String, //执业证书地址
	aliPayAccount: {
		type: String, 
		match: /(^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,51}[a-z0-9]+$)|(^1[3458]\d{9}$)/
	}, 
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

	//patient_info
	height: String,
	weight: String, 
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
	  	doctorId: {type: mongoose.Schema.Types.ObjectId, ref:'alluser'}, 
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
	  	doctor: {type: mongoose.Schema.Types.ObjectId, ref:'alluser'}
	  }
	], 
	lastVisit: {
		time: Date, 
		hospital: String, 
		diagnosis: String
	}, 
	workAmounts:Number, //工作量
	boardingTime:Date,//入职时间
	creationTime:Date,//创建时间


});


alluserModel = mongoose.model('alluser', alluserSchema);

function Alluser(alluser) {
	this.alluser = alluser;
}

Alluser.prototype.save = function(callback) {
	var alluser = this.alluser;
	var newAlluser = new alluserModel(alluser);
	newAlluser.save(function(err, alluserItem) {
		if (err) {
			return callback(err);
		}
		callback(null, alluserItem);
	});
}

Alluser.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	alluserModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, alluserInfo) {
			if(err){
				return callback(err);
			}
			callback(null, alluserInfo);
		});
};


Alluser.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	alluserModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, allusers) {
			if(err) {
				return callback(err);
			}
			callback(null, allusers);
		});
};

Alluser.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	alluserModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upalluser) {
			if(err){
				return callback(err);
			}
			callback(null, upalluser);
		});
};



module.exports = Alluser;