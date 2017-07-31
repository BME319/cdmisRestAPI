
var mongoose = require('mongoose');

var openIdSchema = new mongoose.Schema({					
	doctorUserId: String, 
	patientOpenId: {type: String}, 
	time: Date,
	patientType: Number

});


var openIdModel = mongoose.model('openId', openIdSchema);

function OpenId(openId) {
	this.openId = openId;
}

OpenId.prototype.save = function(callback) {
	var openId = this.openId;
	var newOpenId = new openIdModel(openId);
	newOpenId.save(function(err, openIdItem) {
		if (err) {
			return callback(err);
		}
		callback(null, openIdItem);
	});
}

OpenId.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	openIdModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, openIdInfo) {
			if(err){
				return callback(err);
			}
			callback(null, openIdInfo);
		});
};


OpenId.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	openIdModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, openIds) {
			if(err) {
				return callback(err);
			}
			callback(null, openIds);
		});
};

OpenId.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	openIdModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, upopenId) {
			if(err){
				return callback(err);
			}
			callback(null, upopenId);
		});
};

OpenId.update = function (query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  openIdModel
  	.update(query, obj, options)
  	.populate(populate) 
  	.exec(function (err, upopenId) {
    	if (err) {
      		return callback(err);
    	}
    callback(null, upopenId);
  });
};

OpenId.removeOne = function(query, callback, opts) {
	var options = opts || {};

	openIdModel
		.findOneAndRemove(query, options, function(err, item) {
			if (err) {
				return callback(err);
			}
			callback(null, item);
		});
};

OpenId.remove = function(query, callback) {
	
	openIdModel
		.remove(query)
		.exec(function(err) {
			callback(err);
		});
};


module.exports = OpenId;

