var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dictTypeTwoSchema = new Schema({
  category: {type: String, index: 1, required:true,unique:true},
  contents:[{
    _id: false,
  	type:{type:String},
  	typeName:{type:String},
  	details:[
      { 
        _id: false,
        code:String,
  		  name:String,
  		  inputCode:String,
  		  description:String,
        invalidFlag:Number}]
  	}]}
);

var dictTypeTwoModel = mongoose.model('dictTypeTwo', dictTypeTwoSchema);


function DictTypeTwo(dictTypeTwo) {
  this.dictTypeTwo = dictTypeTwo;
}

DictTypeTwo.prototype.save = function(callback) {
  var dictTypeTwo = this.dictTypeTwo;

  var newDictTypeTwo = new dictTypeTwoModel(dictTypeTwo);
  newDictTypeTwo.save(function(err, dictTypeTwoItem){
    if (err) {
      return callback(err);
    }
    callback(null, dictTypeTwoItem);
  });
}

DictTypeTwo.getOneCategory = function(query, callback, opts, fields, populate) {
  var options = opts || {};
  var fields = fields || null;
  var populate = populate || '';

  dictTypeTwoModel
    .find(query, fields, options)
    .populate(populate)
    .exec(function(err, dictTypeTwoItems) {
      if (err) {
        return callback(err);
      }
      
      callback(null, dictTypeTwoItems);
    });
};


module.exports = DictTypeTwo;
