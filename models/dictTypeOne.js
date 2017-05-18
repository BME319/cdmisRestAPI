
var mongoose = require('mongoose');

var dictTypeOneSchema = new mongoose.Schema({
	category: String,						
	details:[
    { code:String,
  		  name:String,
  		  inputCode:String,
  		  description:String,
        invalidFlag:Number
    }]

});


dictTypeOneModel = mongoose.model('dictTypeOne', dictTypeOneSchema);

function DictTypeOne(dictTypeOne) {
	this.dictTypeOne = dictTypeOne;
}

DictTypeOne.prototype.save = function(callback) {
	var dictTypeOne = this.dictTypeOne;
	var newDictTypeOne = new dictTypeOneModel(dictTypeOne);
	newDictTypeOne.save(function(err, dictTypeOneItem) {
		if (err) {
			return callback(err);
		}
		callback(null, dictTypeOneItem);
	});
}

DictTypeOne.getOne = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	dictTypeOneModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function(err, dictTypeOneItem) {
			if(err){
				return callback(err);
			}
			callback(null, dictTypeOneItem);
		});
};


DictTypeOne.getSome = function(query, callback, opts, fields, populate) {
	var options = opts || {};
	var fields = fields || null;
	var populate = populate || '';

	dictTypeOneModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function(err, dictTypeOneItems) {
			if(err) {
				return callback(err);
			}
			callback(null, dictTypeOneItems);
		});
};

DictTypeOne.updateOne = function(query, obj, callback, opts, populate) {
	var options = opts || {};
	var populate = populate || '';

	dictTypeOneModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function(err, updata) {
			if(err){
				return callback(err);
			}
			callback(null, updata);
		});
};




module.exports = DictTypeOne;