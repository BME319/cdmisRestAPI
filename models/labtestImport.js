var mongoose = require('mongoose')

var labtestImportSchema = new mongoose.Schema({
  userId: String,
  labtestId: String,
  time: Date,
  type: {
    type: String,
    // SCr血肌酐, 单位umol/L, mg/dL
    // GFR肾小球滤过率, ml/min
    // ALB血白蛋白, g/L
    // PRO尿蛋白, mg/d
    // LEU白细胞
    // NIT亚硝酸盐
    // UBG尿胆原
    // PH酸碱度
    // ERY潜血
    // SG比重值
    // BIL胆红素
    // VC抗坏血酸
    // KET酮体
    // GLU葡萄糖
    // HB血红蛋白
    enum: ['SCr', 'GFR', 'ALB', 'PRO', 'LEU', 'NIT', 'UBG', 'PH', 'ERY', 'SG', 'BIL', 'VC', 'KET', 'GLU', 'HB']
  },
  value: Number,
  valueStr: String,
  status: Number,
  unit: String,
  importer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'alluser'
  },
  importTime: Date,
  photoId: String
  // SCr: Number, //血肌酐
  // SCrunit: String,
  // GFR: Number, //肾小球滤过率
  // GFRunit: String,
  // ALB: Number, //血白蛋白
  // ALBunit: String,
  // PRO: Number, //尿蛋白
  // PROunit: String
})

var labtestImportModel = mongoose.model('labtestImport', labtestImportSchema)

function LabtestImport (labtestImport) {
  this.labtestImport = labtestImport
}

LabtestImport.prototype.save = function (callback) {
  var labtestImport = this.labtestImport
  var newLabtestImport = new labtestImportModel(labtestImport)
  newLabtestImport.save(function (err, labtestImportItem) {
    if (err) {
      return callback(err)
    }
    callback(null, labtestImportItem)
  })
}

LabtestImport.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  labtestImportModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, labtestImportInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, labtestImportInfo)
    })
}

LabtestImport.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  labtestImportModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, labtestImports) {
      if (err) {
        return callback(err)
      }
      callback(null, labtestImports)
    })
}

LabtestImport.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  labtestImportModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, uplabtestImport) {
      if (err) {
        return callback(err)
      }
      callback(null, uplabtestImport)
    })
}

LabtestImport.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  labtestImportModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, uplabtestImport) {
      if (err) {
        return callback(err)
      }
      callback(null, uplabtestImport)
    })
}

LabtestImport.create = function (query, callback) {
  labtestImportModel.create(query, function (err, uplabtestImport) {
    if (err) {
        return callback(err)
    }
    callback(null, uplabtestImport)
  })
}

LabtestImport.remove = function (query, callback) {
  labtestImportModel
    .remove(query)
    .exec(function (err) {
      callback(err)
    })
}

LabtestImport.removeOne = function (query, callback, opts) {
  var options = opts || {}

  labtestImportModel
    .findOneAndRemove(query, options, function (err, health) {
      if (err) {
        return callback(err)
      }
      callback(null, health)
    })
}

module.exports = LabtestImport
