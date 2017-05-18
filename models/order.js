
var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
	userId: String, //{type: mongoose.Schema.Types.ObjectId, ref:'user'}, 
	orderNo: String, 
	ordertime: Date, 
	money: Number, 
	goodsInfo:{
		class: String, 
		name: String, 
		notes: String
	}, 
	paystatus: Number, 
	paytime: Date
});


var orderModel = mongoose.model('order', orderSchema);

function Order(order) {
	this.order = order;
}

Order.prototype.save = function(callback) {
	var order = this.order;
	var newOrder = new orderModel(order);
	newOrder.save(function(err, orderItem) {
		if (err) {
			return callback(err);
		}
		callback(null, orderItem);
	});
}

Order.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	orderModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, orderInfo) {
			if(err){
				return callback(err);
			}
			callback(null, orderInfo);
		});
};


Order.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';
	orderModel
		.find(query, fields, options).sort({time:-1})
		.populate(populate)
		.exec(function(err, orders) {
			if(err) {
				return callback(err);
			}
			callback(null, orders);
		});
};

Order.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	orderModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, uporder) {
			if(err){
				return callback(err);
			}
			callback(null, uporder);
		});
};

Order.remove = function(query, callback) {
	orderModel
		.remove(query)
		.exec(function(err) {
			callback(err);
		});

};

Order.removeOne = function(query, callback, opts) {
	var options = opts || {};

	orderModel
		.findOneAndRemove(query, options, function(err, orderss) {
			if (err) {
				return callback(err);
			}
			callback(null, orderss);
		});
};

module.exports = Order;
