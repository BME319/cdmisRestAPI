var mongoose = require('mongoose')

var apiRecordSchema = new mongoose.Schema({
  userId: String,
  time: Date,
  api: String,
  method: String,
  role: String
})

var apiRecordModel = mongoose.model('apiRecord', apiRecordSchema)

function ApiRecord (apiRecord) {
  this.apiRecord = apiRecord
}

ApiRecord.prototype.save = function (callback) {
  var apiRecord = this.apiRecord
  var newApiRecord = new apiRecordModel(apiRecord)
  newApiRecord.save(function (err, apiRecordItem) {
    if (err) {
      return callback(err)
    }
    callback(null, apiRecordItem)
  })
}

ApiRecord.getOne = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  apiRecordModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, apiRecordInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, apiRecordInfo)
    })
}

ApiRecord.getSome = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  // var _populate2 = populate2 || ''
  apiRecordModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, apiRecordInfos) {
      if (err) {
        return callback(err)
      }
      console.log(apiRecordInfos)
      callback(null, apiRecordInfos)
    })
}

ApiRecord.updateOne = function (query, obj, opts, callback, populate) {
  var options = opts || {}
  var _populate = populate || ''

  apiRecordModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, apiRecordInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, apiRecordInfo)
    })
}

ApiRecord.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  apiRecordModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, apiRecordInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, apiRecordInfo)
    })
}

ApiRecord.remove = function (query, callback) {
  apiRecordModel
    .remove(query)
    .exec(function (err) {
      callback(err)
    })
}

ApiRecord.removeOne = function (query, callback, opts) {
  var options = opts || {}

  apiRecordModel
    .findOneAndRemove(query, options, function (err, apiRecord) {
      if (err) {
        return callback(err)
      }
      callback(null, apiRecord)
    })
}

ApiRecord.aggregate = function (array, callback) {
  let _array = array || []
  apiRecordModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      console.log(results)
      callback(null, results)
    })
}

ApiRecord.create = function (query, callback) {
  apiRecordModel.create(query, function (err, info) {
    if (err) {
        return callback(err)
    }
    callback(null, info)
  })
}

module.exports = ApiRecord