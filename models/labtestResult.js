
var mongoose = require('mongoose');

var labtestResultSchema = new mongoose.Schema({
  userId: String,						
  time: Date, 
  url: [String], 
  SCr: Number, //血肌酐 
  SCrunit: String, 
  GFR: Number, //肾小球滤过率
  GFRunit: String, 
  ALB: Number, //血白蛋白
  ALBunit: String, 
  PRO: Number, //尿蛋白
  PROunit: String
});


var labtestResultModel = mongoose.model('labtestResult', labtestResultSchema);

function LabtestResult(labtestResult) {
  this.labtestResult = labtestResult;
}

LabtestResult.prototype.save = function(callback) {
  var labtestResult = this.labtestResult;
  var newLabtestResult = new labtestResultModel(labtestResult);
  newLabtestResult.save(function(err, labtestResultItem) {
    if (err) {
      return callback(err);
    }
    callback(null, labtestResultItem);
  });
}

LabtestResult.getOne = function(query, callback, opts, fields, populate) {
  var options = opts || {};
  var fields = fields || null;
  var populate = populate || '';

  labtestResultModel
    .findOne(query, fields, opts)
    .populate(populate)
    .exec(function(err, labtestResultInfo) {
      if(err){
        return callback(err);
      }
      callback(null, labtestResultInfo);
    });
};


LabtestResult.getSome = function(query, callback, opts, fields, populate) {
  var options = opts || {};
  var fields = fields || null;
  var populate = populate || '';
  labtestResultModel
    .find(query, fields, options)
    .populate(populate)
    .exec(function(err, labtestResults) {
      if(err) {
        return callback(err);
      }
      callback(null, labtestResults);
    });
};

LabtestResult.updateOne = function(query, obj, callback, opts, populate) {
  var options = opts || {};
  var populate = populate || '';

  labtestResultModel
    .findOneAndUpdate(query, obj, options)
    .populate(populate)
    .exec(function(err, uplabtestResult) {
      if(err){
        return callback(err);
      }
      callback(null, uplabtestResult);
    });
};

LabtestResult.remove = function(query, callback) {
  labtestResultModel
    .remove(query)
    .exec(function(err) {
      callback(err);
    });

};

LabtestResult.removeOne = function(query, callback, opts) {
  var options = opts || {};

  labtestResultModel
    .findOneAndRemove(query, options, function(err, health) {
      if (err) {
        return callback(err);
      }
      callback(null, health);
    });
};


module.exports = LabtestResult;


