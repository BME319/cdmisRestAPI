var Task = require('../models/task')
var Alluser = require('../models/alluser')
var errorHandler = require('../middlewares/errorHandler')

exports.dpUserIDbyPhone = function (req, res, next) {
  let phoneNo = req.body.phoneNo || null
  if (phoneNo === null) {
    console.log('HttpError')
    req.outputs = {status: 1, msg: '请输入phoneNo!'}
    next(errorHandler.makeError(2, req.outputs))
    return
    // req.status = 1
    // req.msg = '请输入phoneNo!'
    // return next(traceRecord.traceRecord('tasks/task'))
  }
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let query1 = {phoneNo: phoneNo, role: 'patient'}
  let query2 = {phoneNo: doctorPhoneNo, role: 'doctor'}
  Alluser.getOne(query1, function (err, patientItem) {
    if (err) {
      return res.json({status: 1, msg: '服务器错误!'})
    } else if (patientItem === null) {
      return res.json({status: 1, msg: '不存在该患者!'})
    } else {
      req.patientItem = patientItem
      if (doctorPhoneNo === null) {
        req.doctorItem = null
        return next()
      } else {
        Alluser.getOne(query2, function (err, doctorItem) {
          if (err) {
            return res.json({status: 1, msg: '服务器错误!'})
          } else if (doctorItem === null) {
            return res.json({status: 1, msg: '不存在该医生!'})
          } else {
            req.doctorItem = doctorItem
            return next()
          }
        })
      }
    }
  })
}

exports.pUserIDbyPhone = function (req, res, next) {
  let phoneNo = req.body.phoneNo || null
  if (phoneNo === null) {
    // console.log('HttpError')
    req.outputs = {status: 1, msg: '请输入phoneNo!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
    // req.status = 1
    // req.msg = '请输入phoneNo!'
    // next(traceRecord.traceRecord('tasks/task')(req, res))
  } else {
    let query = {phoneNo: req.body.phoneNo, role: 'patient'}
    Alluser.getOne(query, function (err, patientItem) {
      if (err) {
        // return res.json({status: 1, msg: '操作失败!'})
        req.outputs = {status: 1, msg: err}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else if (patientItem === null) {
        // return res.json({status: 1, msg: '不存在该患者!'})
        req.outputs = {status: 1, msg: '不存在该患者!'}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else {
        req.patientItem = patientItem
        return next()
      }
    })
  }
}

exports.checkTask = function (req, res, next) {
  var query = {userId: req.patientItem.userId}
  Task.getOne(query, function (err, task) {
    if (err) {
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    if (task === null) {
      let newTaskDetail = [{
        type: 'Measure',
        details: []
      }]

      let taskData = {
        userId: req.patientItem.userId,
        description: '',
        invalidFlag: 0,
        date: new Date(),
        task: newTaskDetail
      }

      var newTask = new Task(taskData)
      newTask.save(function (err, taskInfo) {
        if (err) {
          req.outputs = {status: 1, msg: err}
          errorHandler.makeError(2, req.outputs)(req, res, next)
        }
        // console.log('taskInfo', taskInfo)
        req.body.taskDetail = taskInfo.task
        return next()
      })
    } else {
      req.body.taskDetail = task.task
      return next()
    }
  })
}

exports.updateTask = function (req, res, next) {
  var typeNew = req.body.taskDetail
  let taskNew = req.body.tasks

  let measureList = []
  let returnVisitList = []
  let labTestList = []
  let specialEvaluateList = []

  // console.log('taskNew', taskNew)
  for (let k = 0; k < taskNew.length; k++) {
    let type = taskNew[k].type || null
    let code = taskNew[k].code || null

    if (type === null) {
      req.outputs = {status: 1, msg: '请输入type!'}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    if (code === null) {
      req.outputs = {status: 1, msg: '请输入code!'}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }

    if (type === 'Measure') {
      measureList.push(taskNew[k])
    }
    if (type === 'ReturnVisit') {
      returnVisitList.push(taskNew[k])
    }
    if (type === 'LabTest') {
      labTestList.push(taskNew[k])
    }
    if (type === 'SpecialEvaluate') {
      specialEvaluateList.push(taskNew[k])
    }
  }

  let taskList = [
    {
      type: 'Measure',
      details: measureList
    },{
      type: 'ReturnVisit',
      details: returnVisitList
    },{
      type: 'LabTest',
      details: labTestList
    },{
      type: 'SpecialEvaluate',
      details: specialEvaluateList
    }
  ]

console.log('taskList', taskList)
  // for (var j = 0; j < typeNew.length; j++) {
  //   if (typeNew[j].code === req.body.code) {
  //     if (req.body.instruction != null && req.body.instruction !== '') {
  //       typeNew[j].instruction = req.body.instruction
  //     }
  //     if (req.body.content != null && req.body.content !== '') {
  //       typeNew[j].content = req.body.content
  //     }
  //     if (req.body.startTime != null && req.body.startTime !== '') {
  //       typeNew[j].startTime = new Date(req.body.startTime)
  //     }
  //     if (req.body.endTime != null && req.body.endTime !== '') {
  //       typeNew[j].endTime = new Date(req.body.endTime)
  //     }
  //     if (req.body.times != null && req.body.times !== '') {
  //       typeNew[j].times = req.body.times
  //     }
  //     if (req.body.timesUnits != null && req.body.timesUnits !== '') {
  //       typeNew[j].timesUnits = req.body.timesUnits
  //     }
  //     if (req.body.frequencyTimes != null && req.body.frequencyTimes !== '') {
  //       typeNew[j].frequencyTimes = req.body.frequencyTimes
  //     }
  //     if (req.body.frequencyUnits != null && req.body.frequencyUnits !== '') {
  //       typeNew[j].frequencyUnits = req.body.frequencyUnits
  //     }
  //     break
  //   }
  // }
  // if (j === typeNew.length) {
  //   // return res.json({status: 1, msg: '请检查code是否正确!'})
  //   req.outputs = {status: 1, msg: '请检查code是否正确!'}
  //   errorHandler.makeError(2, req.outputs)(req, res, next)
  // }

  var query = {
    userId: req.patientItem.userId,
    task: {$elemMatch: {type: 'Measure'}}
  }

  var upObj = {
    $set:{
      'task.$': {type: 'Measure', details: measureList}
    }
  }

  Task.update(query, upObj, function (err, uptask) {
    if (err) {
      // return res.status(422).json({status: 1, msg: err.message})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    console.log('uptask', uptask)
    if (uptask.n !== 0 && uptask.nModified === 1) {
      // return res.json({status: 0, msg: '更新成功'})
      req.status = 0
      req.msg = '操作成功！'
      return next()
    } else {
      req.status = 0
      req.msg = '未成功修改！'
      return next()
    }
  }, {new: true, upsert: true})
}

// 1. 保存需要修改内容的对应type元素
exports.getContent = function (req, res, next) {
  if (req.patientItem.userId === 'Admin') {
    // return res.json({status: 1, msg: '不允许修改的管理员模板！'})
    req.outputs = {status: 1, msg: '不允许修改的管理员模板！'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  // if (req.patientItem.userId == null || req.patientItem.userId === '') {
  //   return res.json({status: 1, msg: '请输入userId!'})
  // }

  let type = req.body.type || null
  // let code = req.body.code || null
  if (type === null) {
    // return res.json({status: 1, msg: '请输入type!'})
    req.outputs = {status: 1, msg: '请输入type!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  // if (code === null) {
  //   // return res.json({status: 1, msg: '请输入code!'})
  //   req.outputs = {status: 1, msg: '请输入code!'}
  //   errorHandler.makeError(2, req.outputs)(req, res, next)
  // }

  var query = {userId: req.patientItem.userId}

  Task.getOne(query, function (err, task) {
    if (err) {
      // return res.status(500).json({status: 1, msg: err.errmsg})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    // console.log('task', task)
    if (task == null) {
      // return res.json({status: 1, msg: '请检查是否存在userId或该user是否已有模板!'})
      // req.outputs = {status: 1, msg: '请检查是否存在userId或该user是否已有模板!'}
      // errorHandler.makeError(2, req.outputs)(req, res, next)

      let newTaskDetail = [{
        type: 'Measure',
        details: [
          {
            code: 'Temperature'
          }, {
            code: 'Weight'
          }, {
            code: 'BloodPressure'
          }, {
            code: 'Vol'
          }, {
            code: 'HeartRate'
          }, {
            code: 'PeritonealDialysis'
          }
        ]
      }]

      let taskData = {
        userId: req.patientItem.userId,
        description: '',
        invalidFlag: 0,
        date: new Date(),
        task: newTaskDetail
      }

      // console.log('taskData1', taskData)
      var newTask = new Task(taskData)
      newTask.save(function (err, taskInfo) {
        if (err) {
          req.outputs = {status: 1, msg: err}
          errorHandler.makeError(2, req.outputs)(req, res, next)
        }
        // console.log('taskInfo', taskInfo.task[0].details)
        let taskDetail = taskInfo.task
        let taskTypeDetail = null
        for (let i = 0; i < taskDetail.length; i++) {
          if (taskDetail[i].type === req.body.type) {
            taskTypeDetail = taskDetail[i].details
          }
        }
        // console.log('taskTypeDetail1', taskTypeDetail)
        if (taskTypeDetail == null) {
          req.outputs = {status: 1, msg: '请检查type是否符合要求!'}
          errorHandler.makeError(2, req.outputs)(req, res, next)
        }
        req.body.taskTypeDetail = taskTypeDetail
        // console.log('req.body.taskTypeDetail1', req.body.taskTypeDetail)
        next()
      })
    } else {
      let taskDetail = task.task
      let taskTypeDetail = null
      for (let i = 0; i < taskDetail.length; i++) {
        if (taskDetail[i].type === req.body.type) {
          taskTypeDetail = taskDetail[i].details
        }
      }
      // console.log('taskTypeDetail2', taskTypeDetail)
      if (taskTypeDetail == null) {
        // return res.json({status: 1, msg: '请检查type是否符合要求!'})
        req.outputs = {status: 1, msg: '请检查type是否符合要求!'}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      }
      req.body.taskTypeDetail = taskTypeDetail
      // console.log('req.body.taskTypeDetail2', req.body.taskTypeDetail)
      next()
    }
  })
}

// 2. 删除需要修改内容的对应type元素
exports.removeContent = function (req, res, next) {
  var query = {
    userId: req.patientItem.userId
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
      // return res.status(422).json({status: 1, msg: err.message})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }

    if (uptask.n !== 0 && uptask.nModified === 1) {
      // return res.json({result:'移除成功', results: uptask})
      next()
    }
  }, {new: true})
}

// 3. 修改任务内容
exports.updateContent = function (req, res, next) {
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
    // return res.json({status: 1, msg: '请检查code是否正确!'})
    req.outputs = {status: 1, msg: '请检查code是否正确!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }

  var query = {
    userId: req.patientItem.userId
  }

  var upObj = {
    $push: {
      task: {
        type: req.body.type,
        details: typeNew
      }
    },
    $set: {
      date: new Date()
    }
  }

  Task.update(query, upObj, function (err, uptask) {
    if (err) {
      // return res.status(422).json({status: 1, msg: err.message})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }

    if (uptask.n !== 0 && uptask.nModified === 1) {
      // return res.json({status: 0, msg: '更新成功'})
      req.status = 0
      req.msg = '操作成功！'
      return next()
    }
  }, {new: true})
}
