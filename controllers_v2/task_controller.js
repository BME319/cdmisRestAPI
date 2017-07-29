// 注释 2017-07-14 YQC
// var config = require('../config')
var Task = require('../models/task')

// 注释 获取多项任务(模版) 输入，userId（未输入则获取模版），sortNo（可选）；输出，返回多项任务（模版）
exports.getTasks = function (req, res) {
  var userId = req.query.userId
  var query = {userId: userId}

  Task.getSome(query, function (err, tasks) {
    if (err) {
      return res.status(500).send(err)
    }
    // 未输入userId则为管理员
    if (tasks.length === 0) {
      query = {userId: 'Admin'}
    }

    var sortNo = req.query.sortNo
    if (sortNo !== '') {
      query['sortNo'] = sortNo
    }

    Task.getSome(query, function (err, tasks) {
      if (err) {
        return res.status(500).send(err.errmsg)
      } else {
        return res.json({results: tasks})
      }
    })
  })
}

// 注释 用户修改某一任务的状态 输入，session.userId,sortNo,type,code,status;输出，修改相应任务状态
exports.updateStatus = function (req, res) {
  var userId = req.session.userId
  var sortNo = req.body.sortNo
  var type = req.body.type
  var code = req.body.code
  var status = req.body.status
      // console.log(sortNo);

  var query = {userId: userId, sortNo: sortNo}
  Task.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }

    // res.json({results: item});
    // console.log(item.task);
    // 查询到用户任务记录
    if (item != null) {
      var flag = 0
      // 查询参数对应任务并将其状态修改
      for (var i = 0; i < item.task.length; i++) {
        if (item.task[i].type === type) {
          for (var j = 0; j < item.task[i].details.length; j++) {
            if (item.task[i].details[j].code === code) {
                  // console.log(item.task[i].details[j].status);
              item.task[i].details[j].status = status
              flag = 1
              break
            }
          }
        }
        if (flag === 1) { break }
      }
      var upObj = {$set: {task: item.task}}

      Task.updateOne(query, upObj, function (err, task) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }

        res.json({results: 0})
      })
    } else { // 未查询到用户任务记录
      res.json({results: 1})
    }
  })
}

// 注释 修改任务起始时间
exports.updateStartTime = function (req, res) {
  var userId = req.body.userId
  var sortNo = req.body.sortNo
  var type = req.body.type
  var code = req.body.code
  var startTime = req.body.startTime

  var query = {userId: userId, sortNo: sortNo}
  Task.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    var flag = 0
    // res.json({results: item});
    // console.log(item.task);
    for (var i = 0; i < item.task.length; i++) {
      if (item.task[i].type === type) {
        for (var j = 0; j < item.task[i].details.length; j++) {
          if (item.task[i].details[j].code === code) {
            // console.log(item.task[i].details[j].status);
            item.task[i].details[j].status = 1
            item.task[i].details[j].startTime = startTime
            flag = 1
            break
          }
        }
      }
      if (flag === 1) { break }
    }
    var upObj = {$set: {task: item.task}}

    Task.updateOne(query, upObj, function (err, task) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }

      res.json({results: 0})
    })
  })
}

// 插入任务模板 2017-04-15 GY
// 注释 删除旧任务
exports.removeOldTask = function (req, res, next) {
  if (req.body.userId == null || req.body.userId === '') {
    return res.json({result: '请填写userId!'})
  }

  var query = {
    userId: req.body.userId
  }

  Task.removeOne(query, function (err, task) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // return res.json({results: task});
    next()
  })
}
// 注释 获取任务模版
exports.getTaskModel = function (req, res, next) {
  // var userId = 'Admin';
  var query = {userId: 'Admin', sortNo: req.body.sortNo}

  Task.getOne(query, function (err, task) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    req.body.task = task
    // return res.json({result:req.body.task});
    next()
  })
}
// 注释 更新任务模版
exports.insertTaskModel = function (req, res) {
  if (req.body.userId == null || req.body.userId === '') {
    return res.json({result: '请填写userId!'})
  }

  var task = req.body.task

  var taskData = {
    userId: req.body.userId,
    sortNo: req.body.sortNo,
    name: task.name,
    date: task.date,
    description: task.description,
    invalidFlag: task.invalidFlag,
    task: task.task
  }

  var newTask = new Task(taskData)
  newTask.save(function (err, taskInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({result: '插入成功', newResults: taskInfo})
  })
}

// 注释 根据userId获取任务 输入，session.id；输出，用户任务
exports.getUserTask = function (req, res) {
  // var userId = 'Admin';
  var query = {userId: req.query.userId}

  Task.getOne(query, function (err, task) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({result: task})
  })
}

// 根据userId, type, code修改任务内容 2017-04-17 GY
// 1. 保存需要修改内容的对应type元素
exports.getContent = function (req, res, next) {
  if (req.body.userId === 'Admin') {
    return res.json({result: '不允许修改的管理员模板！'})
  }
  if (req.body.userId == null || req.body.userId === '') {
    return res.json({result: '请输入userId!'})
  }
  if (req.body.type == null || req.body.type === '') {
    return res.json({result: '请输入type!'})
  }
  if (req.body.code == null || req.body.code === '') {
    return res.json({result: '请输入code!'})
  }

  var query = {userId: req.body.userId}

  Task.getOne(query, function (err, task) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (task == null) {
      return res.json({result: '请检查是否存在userId或该user是否已有模板!'})
    }
    var taskDetail = task.task
    var taskTypeDetail = null
    for (var i = 0; i < taskDetail.length; i++) {
      if (taskDetail[i].type === req.body.type) {
        taskTypeDetail = taskDetail[i].details
      }
    }
    if (taskTypeDetail == null) {
      return res.json({result: '请检查type是否符合要求!'})
    }

    req.body.taskTypeDetail = taskTypeDetail
    // return res.json({result: taskTypeDetail});

    next()
  })
}
// 2. 删除需要修改内容的对应type元素
exports.removeContent = function (req, res, next) {
  var query = {
    userId: req.body.userId
  }

  var upObj = {
    $pull: {
      task: {
        type: req.body.type
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Task.update(query, upObj, function (err, uptask) {
    if (err) {
      return res.status(422).send(err.message)
    }

    if (uptask.n !== 0 && uptask.nModified === 1) {
      // return res.json({result:'移除成功', results: uptask})
      next()
    }
  }, {new: true})
}
// 3. 修改任务内容
exports.updateContent = function (req, res) {
  var typeNew = req.body.taskTypeDetail
  // return res.json({typeNew: typeNew});
  for (var j = 0; j < typeNew.length; j++) {
    if (typeNew[j].code === req.body.code) {
      if (req.body.instruction != null && req.body.instruction !== '') {
        typeNew[j].instruction = req.body.instruction
      }
      if (req.body.content != null && req.body.content !== '') {
        typeNew[j].content = req.body.content
      }
      if (req.body.startTime != null && req.body.startTime !== '') {
        typeNew[j].startTime = new Date(req.body.startTime)
      }
      if (req.body.endTime != null && req.body.endTime !== '') {
        typeNew[j].endTime = new Date(req.body.endTime)
      }
      if (req.body.times != null && req.body.times !== '') {
        typeNew[j].times = req.body.times
      }
      if (req.body.timesUnits != null && req.body.timesUnits !== '') {
        typeNew[j].timesUnits = req.body.timesUnits
      }
      if (req.body.frequencyTimes != null && req.body.frequencyTimes !== '') {
        typeNew[j].frequencyTimes = req.body.frequencyTimes
      }
      if (req.body.frequencyUnits != null && req.body.frequencyUnits !== '') {
        typeNew[j].frequencyUnits = req.body.frequencyUnits
      }
      break
    }
  }
  if (j === typeNew.length) {
    return res.json({result: '请检查code是否正确!'})
  }
  // return res.json({result: '修改成功!', results:typeNew});

  var query = {
    userId: req.body.userId
  }

  var upObj = {
    $push: {
      task: {
        type: req.body.type,
        details: typeNew
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Task.update(query, upObj, function (err, uptask) {
    if (err) {
      return res.status(422).send(err.message)
    }

    if (uptask.n !== 0 && uptask.nModified === 1) {
      return res.json({result: '更新成功', results: uptask})
    }
  }, {new: true})
}
