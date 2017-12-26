var mongoose = require('mongoose')

var taskSchema = new mongoose.Schema({
  userId: String,
  sortNo: Number,
  name: String,
  date: {type: Date, index: true},
  description: String,
  invalidFlag: Number,
  task: [
    {
      _id: 0,
      type: {type: String, enum: ['Measure', 'ReturnVisit', 'LabTest', 'SpecialEvaluate']},
      details: [{
        code: String, // 详见tasks模板。。。
        instruction: String,
        content: String,
        startTime: Date,
        endTime: Date,
        times: Number,
        timesUnits: String,
        frequencyTimes: Number,
        frequencyUnits: String,
        status: Number
      }]
    }
  ],
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var TaskModel = mongoose.model('task', taskSchema)

function Task (task) {
  this.task = task
}

Task.prototype.save = function (callback) {
  var task = this.task
  var newTask = new TaskModel(task)
  newTask.save(function (err, taskItem) {
    if (err) {
      return callback(err)
    }
    callback(null, taskItem)
  })
}

Task.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  TaskModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, taskInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, taskInfo)
  })
}

Task.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  TaskModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, tasks) {
    if (err) {
      return callback(err)
    }
    callback(null, tasks)
  })
}

Task.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  TaskModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upTask) {
    if (err) {
      return callback(err)
    }
    callback(null, upTask)
  })
}

Task.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  TaskModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upTask) {
      if (err) {
        return callback(err)
      }
      callback(null, upTask)
    })
}

Task.removeOne = function (query, callback, opts) {
  var options = opts || {}

  TaskModel
  .findOneAndRemove(query, options, function (err, task) {
    if (err) {
      return callback(err)
    }
    callback(null, task)
  })
}

module.exports = Task
