
var mongoose = require('mongoose')

var departmentSchema = new mongoose.Schema({
  district: String,
  portleader: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alluser'
    }
  ],
  department: String,
  hospital: String,
  departLeader: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alluser'
    }
  ],
  doctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alluser'
    }
  ]
})

var departmentModel = mongoose.model('department', departmentSchema)

function Department (department) {
  this.department = department
}

Department.prototype.save = function (callback) {
  var department = this.department
  var newDepartment = new departmentModel(department)
  newDepartment.save(function (err, departmentItem) {
    if (err) {
      return callback(err)
    }
    callback(null, departmentItem)
  })
}

Department.getOne = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  departmentModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, departmentInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentInfo)
    })
}

Department.getSome = function (query, fields, callback, populate, opts) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  // var _populate2 = populate2 || ''
  departmentModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, departmentInfos) {
      if (err) {
        return callback(err)
      }
      console.log(departmentInfos)
      callback(null, departmentInfos)
    })
}

Department.updateOne = function (query, obj, opts, callback, populate) {
  var options = opts || {}
  var _populate = populate || ''

  departmentModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, departmentInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentInfo)
    })
}

Department.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  departmentModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, departmentInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, departmentInfo)
    })
}

Department.remove = function (query, callback) {
  departmentModel
    .remove(query)
    .exec(function (err) {
      callback(err)
    })
}

Department.removeOne = function (query, callback, opts) {
  var options = opts || {}

  departmentModel
    .findOneAndRemove(query, options, function (err, department) {
      if (err) {
        return callback(err)
      }
      callback(null, department)
    })
}

module.exports = Department