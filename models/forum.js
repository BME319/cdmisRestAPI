
var mongoose = require('mongoose');

var forumSchema = new mongoose.Schema({
	postId:String,
	type:Number,
	board:Number,
	status:Number,
	sponsorId:String,
	sponsorName:String,
	title:String,
	subject:String,
	time:Date,
	content:[],
	hits:Number,
	praises:Number,
	replyCount:Number,
	replies:[Reply],
	revisionInfo:{	
		operationTime:Date,
		userId:String,
		userName:String,
		terminalIP:String
	}
});


forumModel = mongoose.model('forum', forumSchema);

function Forum(forum) {
	this.forum = forum;
}

forum.prototype.save = function(callback) {
	var forum = this.forum;
	var newforum = new forumModel(forum);
	newForum.save(function(err, forumItem) {
		if (err) {
			return callback(err);
		}
		callback(null, forumItem);
	});
}

forum.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	forumModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, forumInfo) {
			if(err){
				return callback(err);
			}
			callback(null, forumInfo);
		});
};


forum.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	forumModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, forums) {
			if(err) {
				return callback(err);
			}
			callback(null, forums);
		});
};

forum.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	forumModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upforum) {
			if(err){
				return callback(err);
			}
			callback(null, upforum);
		});
};




module.exports = Forum;