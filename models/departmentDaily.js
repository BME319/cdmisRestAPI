var mongoose = require('mongoose')

var departmentDailySchema = new mongoose.Schema({
  district: String,
  department: String,
  hospital: String,
  inchargeCount: Number,
  inchargeCounttoday: Number,
  dpCount: Number,
  dpCounttoday: Number,
  VIPCount: Number,
  VIPCounttoday: Number,
  date: Date
})

var departmentDailyModel = mongoose.model('departmentDaily', departmentDailySchema)

function DepartmentDaily (departmentDaily) {
  this.departmentDaily = departmentDaily
}

DepartmentDaily.prototype.save = function (callback) {
  var departmentDaily = this.departmentDaily
  var newDepartmentDaily = new departmentDailyModel(departmentDaily)
  newDepartmentDaily.save(function (err, departmentDailyItem) {
    if (err) {
      return callback(err)
    }
    callback(null, departmentDailyItem)
  })
}

DepartmentDaily.getOne = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  departmentDailyModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, departmentDailyInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentDailyInfo)
    })
}

DepartmentDaily.getSome = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  // var _populate2 = populate2 || ''
  departmentDailyModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, departmentDailyInfos) {
      if (err) {
        return callback(err)
      }
      // console.log(departmentDailyInfos)
      callback(null, departmentDailyInfos)
    })
}

DepartmentDaily.updateOne = function (query, obj, opts, callback, populate) {
  var options = opts || {}
  var _populate = populate || ''

  departmentDailyModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, departmentDailyInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentDailyInfo)
    })
}

DepartmentDaily.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  departmentDailyModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, departmentDailyInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentDailyInfo)
    })
}

DepartmentDaily.remove = function (query, callback) {
  departmentDailyModel
    .remove(query)
    .exec(function (err) {
      callback(err)
    })
}

DepartmentDaily.removeOne = function (query, callback, opts) {
  var options = opts || {}

  departmentDailyModel
    .findOneAndRemove(query, options, function (err, departmentDaily) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentDaily)
    })
}

DepartmentDaily.aggregate = function (array, callback) {
  let _array = array || []
  departmentDailyModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

DepartmentDaily.create = function (query, callback) {
  departmentDailyModel.create(query, function (err, info) {
    if (err) {
        return callback(err)
    }
    callback(null, info)
  })
}

module.exports = DepartmentDaily