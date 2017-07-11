var mongoose = require('mongoose')

var taskSchema = new mongoose.Schema({
  userId: String,
  sortNo: Number,
  name: String,
  date: Date,
  description: String,
  invalidFlag: Number,
  task: [
	  {
	  	_id: 0,
	  	type: {type: String},
	    details: [{
	    	code: String,
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

var taskModel = mongoose.model('task', taskSchema)

function Task (task) {
  this.task = task
}

Task.prototype.save = function (callback) {
  var task = this.task
  var newTask = new taskModel(task)
  newTask.save(function (err, taskItem) {
    if (err) {
      return callback(err)
    }
    callback(null, taskItem)
  })
}

Task.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  taskModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, taskInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, taskInfo)
})
}

Task.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  taskModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, tasks) {
  if (err) {
    return callback(err)
  }
  callback(null, tasks)
})
}

Task.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  taskModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, uptask) {
  if (err) {
    return callback(err)
  }
  callback(null, uptask)
})
}

Task.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  taskModel
  	.update(query, obj, options)
  	.populate(populate)
  	.exec(function (err, uptask) {
    	if (err) {
      		return callback(err)
    	}
    callback(null, uptask)
  })
}

Task.removeOne = function (query, callback, opts) {
  var options = opts || {}

  taskModel
		.findOneAndRemove(query, options, function (err, task) {
  if (err) {
    return callback(err)
  }
  callback(null, task)
})
}

module.exports = Task
