
var mongoose = require('mongoose');

var deviceSchema = new mongoose.Schema({
	userId: String,
  	deviceId: {
  		type: String,
  		required: true,
  		unique: true
  	},
  	deviceType: {
    	type: String,
    	enum: ['sphygmomanometer']
  	},
	deviceInfo: mongoose.Schema.Types.Mixed
});

deviceModel = mongoose.model('device', deviceSchema);

function Device(device) {
	this.device = device;
}

Device.prototype.save = function(callback) {
	var device = this.device;
	var newDevice = new deviceModel(device);
	newDevice.save(function(err, deviceItem) {
		if (err) {
			return callback(err);
		}
		callback(null, deviceItem);
	});
}

Device.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	deviceModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, deviceInfo) {
			if(err){
				return callback(err);
			}
			callback(null, deviceInfo);
		});
};


Device.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	deviceModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, devices) {
			if(err) {
				return callback(err);
			}
			callback(null, devices);
		});
};

Device.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	deviceModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, updevice) {
			if(err){
				return callback(err);
			}
			callback(null, updevice);
		});
};

Device.update = function (query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  deviceModel
  	.update(query, obj, options)
  	.populate(populate) 
  	.exec(function (err, updevice) {
    	if (err) {
      		return callback(err);
    	}
    callback(null, updevice);
  });
};


Device.removeOne = function(query, callback, opts) {
	var options = opts || {};

	deviceModel
		.findOneAndRemove(query, options, function(err, device) {
			if (err) {
				return callback(err);
			}
			callback(null, device);
		});
};


module.exports = Device;