
var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	commentId: String,
	counselId: String,
	doctorId: {type: mongoose.Schema.Types.ObjectId, ref:'doctor'}, 
	patientId: {type: mongoose.Schema.Types.ObjectId, ref:'patient'}, 
	type: Number, 
	time: Date, 
	helpScore: Number, 
	attitudeScore: Number, 
	speedScore: Number, 
	totalScore: {type:Number, default:10}, 
	topic: String, 
	expense: String, 
	content: String, 
	revisionInfo:{
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


var commentModel = mongoose.model('comment', commentSchema);

function Comment(comment) {
	this.comment = comment;
}

Comment.prototype.save = function(callback) {
	var comment = this.comment;
	var newComment = new commentModel(comment);
	newComment.save(function(err, commentItem) {
		if (err) {
			return callback(err);
		}
		callback(null, commentItem);
	});
}

Comment.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	commentModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, commentInfo) {
			if(err){
				return callback(err);
			}
			callback(null, commentInfo);
		});
};


Comment.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	commentModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, comments) {
			if(err) {
				return callback(err);
			}
			callback(null, comments);
		});
};

Comment.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	commentModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upcomment) {
			if(err){
				return callback(err);
			}
			callback(null, upcomment);
		});
};




module.exports = Comment;
