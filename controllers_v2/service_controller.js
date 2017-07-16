var Alluser = require('../models/alluser')

// 获取自己的服务开启状态 2017-07-14 GY
exports.getServices = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let opts = {}
  let fields = {
    userId: 1, counselStatus1: 1, counselStatus2: 1, counselStatus3: 1, 
    counselStatus4: 1, counselStatus5: 1, charge1: 1, charge2: 1, 
    charge3: 1, charge4: 1, charge5: 1, serviceSchedules: 1, 
    serviceSuspendTime: 1, autoRelay: 1, relayTarget: 1
  }
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      return res.json({results: doctorItem})
    }
  }, opts, fields)
}

// 修改服务开启状态 2017-07-14 GY
exports.changeServiceStatus = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1': 
          upObj = {counselStatus1: (!doctorItem.counselStatus1)}
          break
        case 'service2': 
          upObj = {counselStatus2: (!doctorItem.counselStatus2)}
          break
        case 'service3': 
          upObj = {counselStatus3: (!doctorItem.counselStatus3)}
          break
        case 'service4': 
          upObj = {counselStatus4: (!doctorItem.counselStatus4)}
          break
        case 'service5': 
          upObj = {counselStatus5: (!doctorItem.counselStatus5)}
          break
        case 'service6': 
          upObj = {autoRelay: (!doctorItem.autoRelay)}
          break
        default: 
          break
      }
      let opts = {
        new: true,
        runValidators: true,
        fields: {
          userId: 1, name: 1, counselStatus1: 1, counselStatus2: 1, 
          counselStatus3: 1, counselStatus4: 1, counselStatus5: 1, 
          charge1: 1, charge2: 1, charge3: 1, charge4: 1, charge5: 1, 
          serviceSchedules: 1, serviceSuspendTime: 1, autoRelay: 1, 
          relayTarget: 1
        }
      }
      Alluser.updateOne(query, upObj, function (err, upitem) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upitem === null) {
          return res.status(404).json({results: '找不到对象'})
        } else {
          return res.json({results: upitem})
        }
      }, opts)
    }
  })
}

// 设置服务收费费用 2017-07-14 GY
exports.setCharge = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let charge = req.body.charge || null
  if (charge === null || charge === '') {
    return res.status(412).json({results: '请输入费用'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1': 
          if (doctorItem.counselStatus1 === 1) upObj = {charge1: charge}
          break
        case 'service2': 
          if (doctorItem.counselStatus2 === 1) upObj = {charge2: charge}
          break
        case 'service3': 
          if (doctorItem.counselStatus3 === 1) upObj = {charge3: charge}
          break
        case 'service4': 
          if (doctorItem.counselStatus4 === 1) upObj = {charge4: charge}
          break
        case 'service5': 
          if (doctorItem.counselStatus5 === 1) upObj = {charge5: charge}
          break
        default: 
          break
      }
      if (JSON.stringify(upObj) === '{}') {
        return res.status(412).json({results: '请先开启服务'})
      } else {
        let opts = {
          new: true,
          runValidators: true,
          fields: {
            userId: 1, name: 1, counselStatus1: 1, counselStatus2: 1, 
            counselStatus3: 1, counselStatus4: 1, counselStatus5: 1, 
            charge1: 1, charge2: 1, charge3: 1, charge4: 1, charge5: 1, 
            serviceSchedules: 1, serviceSuspendTime: 1, autoRelay: 1, 
            relayTarget: 1
          }
        }
        Alluser.updateOne(query, upObj, function (err, upitem) {
          if (err) {
            return res.status(500).send(err)
          }
          if (upitem === null) {
            return res.status(404).json({results: '找不到对象'})
          } else {
            return res.json({results: upitem})
          }
        }, opts)
      }
    }
  })
}

// 设置自动转发团队 2017-07-15 GY
exports.setRelayTarget = function (req, res) {
  let query = {userId: req.session.userId}
  let upObj = {
    relayTarget: req.body.relayTarget
  }
  let opts = {
    new: true,
    runValidators: true,
    fields: {
      userId: 1, name: 1, counselStatus1: 1, counselStatus2: 1, 
      counselStatus3: 1, counselStatus4: 1, counselStatus5: 1, 
      charge1: 1, charge2: 1, charge3: 1, charge4: 1, charge5: 1, 
      serviceSchedules: 1, serviceSuspendTime: 1, autoRelay: 1, 
      relayTarget: 1
    }
  }
  Alluser.updateOne(query, upObj, function (err, upitem) {
    if (err) {
      if (err.name === 'CastError') {
        return res.status(412).json({results: '不符合要求的输入', path: err.path})
      } else {
        return res.status(500).send(err)
      }
      
    }
    if (upitem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      let flag = 0
      for (let i = 0; i < upitem.relayTarget.length; i++) {
        if (JSON.stringify(upitem.relayTarget[i]) === '{}')
          break
        flag++
      }
      if (flag === upitem.relayTarget.length) {
        return res.json({results: upitem})
      } else {
        return res.status(412).json({results: '请检查输入'})
      }
    }
  }, opts)
}

// 面诊服务排班时间表相关 2017-07-15 GY
// 设置排班时间表和加号数量 2017-07-15 GY
exports.setServiceSchedule = function (req, res) {
  let query = {userId: req.session.userId}
  let day = req.body.day || null
  let time = req.body.time || null
  let count = req.body.count || null
  let pullObj = {}
  let pushObj = {}
  if (day === null || time === null || count === null) {
    return res.status(412).json({results: '请输入day, time, count'})
  } else {
    pullObj = {
      $pull: {
        serviceSchedules: {
          day: day,
          time: time
        }
      }
    }
    pushObj = {
      $push: {
        serviceSchedules: {
          day: day,
          time: time,
          count: count
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      Alluser.update(query, pushObj, function (err, upschedule) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upschedule.n !== 0, upschedule.nModified === 0) {
          return res.status(400).json({results: '已经存在的schedule'})
        } else if (upschedule.nModified === 1) {
          return res.json({results: '修改成功'})
        }
      })
    }
  })
}
// 删除排班 2017-07-15 GY
exports.deleteServiceSchedule = function (req, res) {
  let query = {userId: req.session.userId}
  let day = req.body.day || null
  let time = req.body.time || null
  let pullObj = {}
  if (day === null || time === null) {
    return res.status(412).json({results: '请输入day, time'})
  } else {
    pullObj = {
      $pull: {
        serviceSchedules: {
          day: day,
          time: time
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (pullres.n === 1 && pullres.nModified === 0) {
      return res.status(400).json({results: '该时间没有排班'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
// 设置面诊停诊时间 2017-07-15 GY
exports.setServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let upObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else if ((new Date(start) - new Date(end)) > 0) {
    return res.status(400).json({results: '请确认停诊时间'})
  } else {
    upObj = {
      $addToSet: {
        serviceSuspendTime: {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }
  }
  Alluser.update(query, upObj, function (err, upsus) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upsus.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
// 删除面诊停诊时间 2017-07-15 GY
exports.deleteServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let pullObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else {
    pullObj = {
      $pull: {
        serviceSuspendTime: {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    }
    if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (pullres.n !== 0 && pullres.nModified === 0) {
      return res.status(404).json({results: '未设置的停诊时间'})
    } else {
      return res.json({results: '修改成功'})
    }
  })
}
