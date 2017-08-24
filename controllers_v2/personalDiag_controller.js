var PersonalDiag = require('../models/personalDiag')
var Alluser = require('../models/alluser')
var commonFunc = require('../middlewares/commonFunc')
var Order = require('../models/order')
var Account = require('../models/account')
var request = require('request')
var webEntry = require('../settings').webEntry

/**
医生端
*/
// 面诊服务排班时间表相关 2017-07-15 GY
// 设置排班时间表和加号数量 2017-07-15 GY
// 添加place字段，更改排班更新／添加方法 2017-08-07 YQC
// 输入，排班日期／时段／加号数量，输出，添加面诊排班信息
exports.setServiceSchedule = function (req, res, next) {
  let day = req.body.day || null
  let time = req.body.time || null
  let total = req.body.total || null
  let place = req.body.place || null
  if (day === null || time === null || total === null || place === null) {
    return res.status(412).json({results: '请输入day, time, total, place'})
  }
  let query = {userId: req.session.userId, serviceSchedules: {$elemMatch: {$and: [{day: day}, {time: time}]}}}
  let upObj = {}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) { // 排班不存在，添加排班
      // return res.status(404).json({results: '找不到对象'})
      query = {userId: req.session.userId}
      upObj = {
        $push: {
          serviceSchedules: {
            day: day,
            time: time,
            total: total,
            place: place
          }
        }
      }
    } else { // 排班存在，更新排班
      upObj = {
        $set: {
          'serviceSchedules.$.total': total,
          'serviceSchedules.$.place': place
        }
      }
    }
    Alluser.update(query, upObj, function (err, upItem) {
      if (err) {
        return res.status(500).send(err)
      } else if (upItem.n === 0) {
        return res.status(404).json({results: '找不到对象'})
      } else {
        // return res.status(201).json({results: upItem})
        next()
      }
    })
  })
}

// 删除排班 2017-07-15 GY
// 更改排班删除方法 2017-08-07 YQC
// 输入，排班日期／时段；输出，删除面诊排班信息
exports.deleteServiceSchedule = function (req, res, next) {
  let day = req.body.day || null
  let time = req.body.time || null
  if (day === null || time === null) {
    return res.status(412).json({results: '请输入day, time'})
  }
  let query = {userId: req.session.userId, serviceSchedules: {$elemMatch: {$and: [{day: day}, {time: time}]}}}
  let upObj = {}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) { // 排班不存在，添加排班
      // return res.status(404).json({results: '找不到对象'})
      query = {userId: req.session.userId}
      upObj = {
        $push: {
          serviceSchedules: {
            day: day,
            time: time,
            total: 0
          }
        }
      }
    } else { // 排班存在，更新排班
      upObj = {
        $set: {
          'serviceSchedules.$.total': 0
        }
      }
    }
    Alluser.update(query, upObj, function (err, upItem) {
      if (err) {
        return res.status(500).send(err)
      } else if (upItem.n === 0) {
        return res.status(404).json({results: '找不到对象'})
      } else {
        // return res.status(201).json({results: upItem})
        req.body.deleteFlag = 1
        next()
      }
    })
  })
}

// YQC 2017-07-28
exports.getDaysToUpdate = function (req, res, next) {
  let day = req.body.day || null
  let today = new Date(new Date().toDateString())
  let nextDayNo
  switch (day) {
    case 'Mon':
      nextDayNo = 1
      break
    case 'Tue':
      nextDayNo = 2
      break
    case 'Wed':
      nextDayNo = 3
      break
    case 'Thu':
      nextDayNo = 4
      break
    case 'Fri':
      nextDayNo = 5
      break
    case 'Sat':
      nextDayNo = 6
      break
    case 'Sun':
      nextDayNo = 7
      break
    default:
      return res.json({message: 'Wrong Input'})
  }
  let nextModDay = new Date(today)
  if (today.getDay() > nextDayNo) {
    nextModDay.setDate(nextModDay.getDate() + 7 - today.getDay() + nextDayNo)
  } else {
    nextModDay.setDate(nextModDay.getDate() - today.getDay() + nextDayNo)
  }

  let nextNextModDay = new Date(today)
  if (today.getDay() > nextDayNo) {
    nextNextModDay.setDate(nextNextModDay.getDate() + 14 - today.getDay() + nextDayNo)
  } else {
    nextNextModDay.setDate(nextNextModDay.getDate() + 7 - today.getDay() + nextDayNo)
  }
  req.body.nmd = nextModDay
  req.body.nnmd = nextNextModDay
  let query = {userId: req.session.userId, role: 'doctor'}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (req.body.deleteFlag) {
      next()
    } else {
      let serviceSuspendTime = item.serviceSuspendTime || []
      for (let i = 0; i < serviceSuspendTime.length; i++) {
        if (serviceSuspendTime[i].start <= nextModDay && serviceSuspendTime[i].end > nextModDay) {
          req.body.nextSuspend = 1
        }
        if (serviceSuspendTime[i].start <= nextNextModDay && serviceSuspendTime[i].end > nextNextModDay) {
          req.body.nextNextSuspend = 1
        }
      }
      next()
    }
  })
}

// YQC 2017-07-28
exports.updateAvailablePD1 = function (req, res, next) {
  let nextModDay = new Date(req.body.nmd)
  let time = req.body.time || null
  let total = req.body.total || null
  let place = req.body.place || null
  let queryD1 = {userId: req.session.userId, availablePDs: {$elemMatch: {$and: [{availableDay: nextModDay}, {availableTime: time}]}}}
  let upObjD1
  if (req.body.deleteFlag) {
    upObjD1 = {
      $set: {
        'availablePDs.$.total': 0
      }
    }
  } else {
    upObjD1 = {
      $set: {
        'availablePDs.$.total': total,
        'availablePDs.$.place': place
      }
    }
    if (req.body.nextSuspend) {
      upObjD1.$set['availablePDs.$.suspendFlag'] = 1
    }
  }
  Alluser.update(queryD1, upObjD1, function (err, upDoc1) {
    if (err) {
      return res.status(500).send(err)
    } else if (upDoc1.n === 0) {
      // return res.status(404).send('Doctor Not Found-1')
      let queryD11 = {userId: req.session.userId}
      let pushObj11 = {
        $push: {
          availablePDs: {
            availableTime: time,
            availableDay: nextModDay,
            total: total,
            place: place
          }
        }
      }
      if (req.body.nextSuspend) {
        pushObj11.$push.availablePDs.suspendFlag = 1
      }
      Alluser.update(queryD11, pushObj11, function (err, upDoc11) {
        if (err) {
          return res.status(500).send(err)
        } else {
          console.log('OK-11')
          next()
        }
      })
    } else {
      console.log('OK-1')
      next()
    }
  })
}
// YQC 2017-07-28
exports.updateAvailablePD2 = function (req, res, next) {
  let nextNextModDay = new Date(req.body.nnmd)
  let time = req.body.time || null
  let total = req.body.total || null
  let place = req.body.place || null
  let queryD2 = {userId: req.session.userId, availablePDs: {$elemMatch: {$and: [{availableDay: nextNextModDay}, {availableTime: time}]}}}
  let upObjD2
  if (req.body.deleteFlag) {
    upObjD2 = {
      $set: {
        'availablePDs.$.total': 0
      }
    }
  } else {
    upObjD2 = {
      $set: {
        'availablePDs.$.total': total,
        'availablePDs.$.place': place
      }
    }
    if (req.body.nextNextSuspend) {
      upObjD2.$set['availablePDs.$.suspendFlag'] = 1
    }
  }
  Alluser.update(queryD2, upObjD2, function (err, upDoc2) {
    if (err) {
      return res.status(500).send(err)
    } else if (upDoc2.n === 0) {
      // return res.status(404).send('Doctor Not Found-2')
      let queryD21 = {userId: req.session.userId}
      let pushObj21 = {
        $push: {
          availablePDs: {
            availableTime: time,
            availableDay: nextNextModDay,
            total: total,
            place: place
          }
        }
      }
      if (req.body.nextNextSuspend) {
        pushObj21.$push.availablePDs.suspendFlag = 1
      }
      Alluser.update(queryD21, pushObj21, function (err, upDoc21) {
        if (err) {
          return res.status(500).send(err)
        } else {
          console.log('OK-21')
          if (req.body.deleteFlag) {
            next()
          } else {
            return res.status(200).send('OK')
          }
        }
      })
    } else {
      console.log('OK-2')
      if (req.body.deleteFlag) {
        next()
      } else {
        return res.status(200).send('OK')
      }
    }
  })
}

// 设置面诊停诊时间 2017-07-15 GY
exports.setServiceSuspend = function (req, res, next) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let today = new Date(new Date().toDateString())
  let startOfStart = new Date(new Date(start).toDateString())
  let endOfEnd = new Date(end)
  endOfEnd.setDate(endOfEnd.getDate() + 1)
  endOfEnd = new Date(endOfEnd.toDateString())
  endOfEnd.setMilliseconds(endOfEnd.getMilliseconds() - 1)
  let upObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else if ((startOfStart - endOfEnd) > 0 || (startOfStart - today) < 0) {
    return res.status(400).json({results: '请确认停诊时间'})
  } else {
    upObj = {
      $addToSet: {
        serviceSuspendTime: {
          start: startOfStart,
          end: endOfEnd
        }
      }
    }
  }
  Alluser.update(query, upObj, function (err, upSus) {
    if (err) {
      return res.status(500).send(err)
    } else if (upSus.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (upSus.nModified === 0) {
      return res.json({results: '该时段已停诊'})
    } else {
      // return res.json({results: '停诊时间添加成功'})
      req.body.startOfStart = startOfStart
      req.body.endOfEnd = endOfEnd
      next()
    }
  })
}
// 停诊状态更新
exports.suspendAvailablePds = function (req, res, next) {
  let startOfStart = req.body.startOfStart
  let endOfEnd = req.body.endOfEnd
  let doctorId = req.session.userId
  let query = {userId: doctorId, availablePDs: {$elemMatch: {$and: [{availableDay: {$gte: startOfStart}}, {availableDay: {$lt: endOfEnd}}]}}}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      // return res.status(404).json({results: '找不到对象'})
      return res.json({results: '停诊时间添加成功'})
    } else {
      let aPDList = item.availablePDs
      for (let i = 0; i < aPDList.length; i++) {
        if (aPDList[i].availableDay >= startOfStart && aPDList[i].availableDay < endOfEnd) {
          aPDList[i]['suspendFlag'] = 1
          aPDList[i]['count'] = 0
        }
      }
      // return res.json({results: aPDList})
      let upObj = {
        $set: {
          availablePDs: aPDList
        }
      }
      Alluser.update(query, upObj, function (err, upItem) {
        if (err) {
          return res.status(500).send(err)
        } else if (upItem.nModified === 0) {
          return res.json({results: '停诊状态更新失败'})
        } else {
          // return res.json({results: '停诊状态更新成功'})
          req.body.suspendFlag = 1
          next()
        }
      })
    }
  })
}

// 已预约面诊取消
exports.cancelBookedPds = function (req, res) {
  let doctorObjectId = req.body.doctorObject._id
  let now = new Date()
  let query = {}
  let upObjPD = {$set: {status: 6}}
  if (req.body.suspendFlag) { // 设置停诊取消面诊
    let startOfStart = req.body.startOfStart
    let endOfEnd = req.body.endOfEnd
    let today = new Date(now.toDateString())
    let tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
    endOfTomorrow = new Date(endOfTomorrow.toDateString())
    endOfTomorrow.setMilliseconds(endOfTomorrow.getMilliseconds() - 1)
    if (new Date(startOfStart) - now > 86400000) {
      query = {
        doctorId: doctorObjectId,
        status: 0,
        $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
      }
    } else { // 停诊时间紧迫
      query = {
        doctorId: doctorObjectId,
        status: 0,
        $and: [{bookingDay: {$gte: endOfTomorrow}}, {bookingDay: {$lt: endOfEnd}}]
      }
      let queryPD = {$and: [{bookingDay: {$gte: today}}, {bookingDay: {$lte: endOfTomorrow}}], doctorId: doctorObjectId, status: 0}
      PersonalDiag.update(queryPD, upObjPD, function (err, upItemsPD) { // 一天内停诊人工处理
        if (err) {
          return res.status(500).send(err)
        } else {
          if (upItemsPD.n !== upItemsPD.nModified) {
            return res.json({result: '停诊时间添加失败', results: upItemsPD})
          }
        }
      }, {multi: true})
    }
  } else { // 删除排班取消面诊
    if (new Date(req.body.nmd) - now > 86400000) {
      query = {
        doctorId: doctorObjectId,
        status: 0,
        $or: [{bookingDay: req.body.nmd}, {bookingDay: req.body.nnmd}],
        bookingTime: req.body.time
      }
    } else { // 排班取消时间紧迫
      query = {
        doctorId: doctorObjectId,
        status: 0,
        bookingDay: req.body.nnmd,
        bookingTime: req.body.time
      }
      let queryPD = {
        doctorId: doctorObjectId,
        status: 0,
        bookingDay: req.body.nmd,
        bookingTime: req.body.time
      }
      PersonalDiag.update(queryPD, upObjPD, function (err, upItemsPD) { // 一天内排班取消人工处理
        if (err) {
          return res.status(500).send(err)
        } else {
          if (upItemsPD.n !== upItemsPD.nModified) {
            return res.json({result: '停诊时间添加失败', results: upItemsPD})
          }
        }
      }, {multi: true})
    }
  }

  // let upObj = {$set: {status: 4}}
  PersonalDiag.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else if (items.length === 0) {
      if (req.body.suspendFlag) {
        return res.json({msg: '停诊时间添加成功', code: 0})
      } else {
        return res.json({msg: '面诊排班删除成功', code: 0})
      }
    } else {
      return res.json({msg: '测试中，待退款', code: 0, data: items})
      // for (let item in items) {
      //   let toRefund = items[item]
      //   // 调用退款接口
      // }
    }
  })

  // PersonalDiag.update(query, upObj, function (err, upItems) {
  //   if (err) {
  //     return res.status(500).send(err)
  //   } else {
  //     if (req.body.suspendFlag) {
  //       return res.json({result: '停诊时间添加成功', results: upItems})
  //     } else {
  //       return res.json({result: '面诊排班删除成功', results: upItems})
  //     }
  //   }
  // }, {multi: true})
}

// 删除面诊停诊时间 2017-07-15 GY
exports.deleteServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let startOfStart = new Date(new Date(start).toDateString())
  let endOfEnd = new Date(end)
  endOfEnd.setDate(endOfEnd.getDate() + 1)
  endOfEnd = new Date(endOfEnd.toDateString())
  endOfEnd.setMilliseconds(endOfEnd.getMilliseconds() - 1)
  let pullObj = {}
  if (start === null || end === null) {
    return res.status(412).json({results: '请输入start, end'})
  } else {
    pullObj = {
      $pull: {
        serviceSuspendTime: {
          start: startOfStart,
          end: endOfEnd
        }
      }
    }
  }
  Alluser.update(query, pullObj, function (err, pullres) {
    if (err) {
      return res.status(500).send(err)
    } else if (pullres.n === 0) {
      return res.status(404).json({results: '找不到对象'})
    } else if (pullres.nModified === 0) {
      return res.status(404).json({results: '未设置的停诊时间'})
    } else {
      // return res.json({results: '停诊时间删除成功'})
      let queryD = {userId: req.session.userId, availablePDs: {$elemMatch: {$and: [{availableDay: {$gte: startOfStart}}, {availableDay: {$lt: endOfEnd}}]}}}
      Alluser.getOne(queryD, function (err, item) {
        if (err) {
          return res.status(500).send(err)
        } else if (item === null) {
          return res.json({results: '停诊状态更新成功'})
        } else {
          let aPDList = item.availablePDs
          for (let i = 0; i < aPDList.length; i++) {
            if (aPDList[i].availableDay >= startOfStart && aPDList[i].availableDay < endOfEnd && aPDList[i].suspendFlag === 1) {
              aPDList[i]['suspendFlag'] = 0
              aPDList[i]['count'] = 0
            }
          }
          let upObj = {
            $set: {
              availablePDs: aPDList
            }
          }
          Alluser.update(queryD, upObj, function (err, upItem) {
            if (err) {
              return res.status(500).send(err)
            } else if (upItem.nModified === 0) {
              return res.json({results: '停诊状态更新失败'})
            } else {
              return res.json({results: '停诊状态更新成功'})
            }
          })
        }
      })
    }
  })
}

// 获取排班信息 2017-07-19 YQC
// 承接session.userId；输出相应医生的面诊排班信息
exports.getMySchedules = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let query = {userId: doctorId}
  let opts = ''
  let fields = {'_id': 0, 'serviceSchedules': 1, 'schedules': 1}

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

// 根据day，time，status查询预约面诊的患者
exports.getPDPatients = function (req, res) {
  let doctorObjectId = req.body.doctorObject._id
  let queryDay = req.query.day || null
  let queryTime = req.query.time || null
  let status = Number(req.query.status || null)
  let queryPD = {doctorId: doctorObjectId}
  let opts = ''
  let fields = {_id: 0, doctorId: 0, code: 0}
  let populate = {path: 'patientId', select: {_id: 0, doctorsInCharge: 0, doctors: 0, schedules: 0, serviceSchedules: 0, availablePDs: 0}}
  if (status === 0 || status === 1 || status === 2 || status === 3 || status === 4) {
    queryPD.status = status
  }
  if (queryDay !== null) {
    queryPD.bookingDay = new Date(new Date(queryDay).toDateString())
  }
  if (queryTime !== null) {
    queryPD.bookingTime = queryTime
  }
  PersonalDiag.getSome(queryPD, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      return res.status(200).json({results: items})
    }
  }, opts, fields, populate)
}

// 确认收到面诊：personalDiag表修改
// 输入：code；修改内容：personalDiag.status, time
exports.confirmPD = function (req, res, next) {
  // let doctorObjectId = req.body.doctorObject._id
  // let patientObjectId = req.body.patientObject._id
  // let bookingDay = new Date(new Date(req.body.day).toDateString()) || null
  // let bookingTime = req.body.time || null
  let diagId = req.body.diagId || null
  let code = req.body.code || null
  // if (bookingDay === null || bookingTime === null || code === null) {
  //   return res.status(412).send('Please Check Input of day, time, code')
  // }
  if (diagId === null || code === null) {
    return res.status(412).send('Please Check Input of diagId, code')
  }

  // let query = {patientId: patientObjectId, doctorId: doctorObjectId, bookingDay: bookingDay, bookingTime: bookingTime}
  let query = {diagId: diagId}
  PersonalDiag.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else {
      if (item === null) {
        return res.status(404).send('PD Not Found')
      } else if (item.code !== code) {
        return res.status(406).send('Wrong Code')
      } else {
        let upObj = {$set: {status: 1}}
        PersonalDiag.updateOne(query, upObj, function (err, upItem) {
          if (err) {
            return res.status(500).send(err)
          } else if (upItem.nModified === 0) {
            return res.status(304).send('Not Modified')
          } else {
            // return res.status(201).send('Confirmation Success')
            req.body.perDiagObject = upItem
            next()
          }
        }, {new: true})
      }
    }
  })
}

/**
患者端
*/
// 面诊申请：修改面诊计数，新建面诊表数据
// 输入：医生ID和day, time 修改内容：alluser.serviceSchedules.count+1, new personalDiag
// 返回：personalDiag.code, endTime
exports.updatePDCapacityDown = function (req, res, next) {
  let doctorId = req.body.doctorId || null
  let today = new Date(new Date().toDateString())
  let bookingDay = new Date(new Date(req.body.day).toDateString()) || null
  let bookingTime = req.body.time || null
  if (doctorId === null || bookingDay === null || bookingTime === null || bookingDay < today) {
    return res.json({results: '请检查doctorId,day,time输入'})
  }

  let queryD = {userId: doctorId, availablePDs: {$elemMatch: {$and: [{availableDay: bookingDay}, {availableTime: bookingTime}, {suspendFlag: 0}]}}}
  let fieldsD = {_id: 0, availablePDs: 1}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemD === null) {
      return res.json({results: '该医生该时段面诊服务未开放'})
    } else {
      // return res.send(itemD)
      let availablePDsList = itemD.availablePDs || []
      let availablePD = null
      for (let i = 0; i < availablePDsList.length; i++) {
        if (String(availablePDsList[i].availableDay) === String(bookingDay) && String(availablePDsList[i].availableTime) === String(bookingTime)) {
          availablePD = availablePDsList[i]
          break
        }
      }
      let count = availablePD.count || 0
      let total = availablePD.total || 0
      req.body.place = availablePD.place
      if (count < total) { // 存在余量，可预约面诊
        let upDoc = {
          $set: {
            'availablePDs.$.count': count + 1
          }
        }
        Alluser.update(queryD, upDoc, function (err, upDoctor) { // 占个号
          if (err) {
            return res.status(500).send(err)
          } else if (upDoctor.nModified === 0) {
            return res.json({results: '面诊数量未更新成功，请检查输入'})
          } else if (upDoctor.nModified !== 0) {
            // return res.json({results: '面诊数量更新成功'})
            next()
          }
        })
      } else { // 可预约面诊数量为零
        return res.json({results: '该时段预约已满，请更换预约时间'})
      }
    }
  }, fieldsD)
}

exports.newPersonalDiag = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let bookingDay = new Date(new Date(req.body.day).toDateString())
  let bookingTime = req.body.time
  let place = req.body.place

  let queryPD = {doctorId: doctorObjectId, patientId: patientObjectId, bookingDay: bookingDay, bookingTime: bookingTime, status: 0}
  PersonalDiag.getOne(queryPD, function (err, itemPD) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else if (itemPD === null) { // 新建面诊预约
      // 截止时间为预约日期第二天的中午
      let endTime = new Date(bookingDay)
      endTime.setDate(endTime.getDate() + 1)
      endTime.setHours(endTime.getHours() + 12)
      // 创建验证码
      let random = Math.random()
      let min = 100000
      let max = 1000000
      let code = Math.floor(min + (max - min) * random)

      let PDData = {
        diagId: req.newId,
        doctorId: doctorObjectId,
        patientId: patientObjectId,
        bookingDay: bookingDay,
        bookingTime: bookingTime,
        place: place,
        code: code,
        creatTime: new Date(),
        endTime: endTime,
        status: 0 // 0: 未开始
      }
      var newPersonalDiag = new PersonalDiag(PDData)
      newPersonalDiag.save(function (err, pDInfo) {
        if (err) {
          return res.status(500).send(err)
        } else {
          // res.json({result: '预约成功', newResults: PDInfo})
          req.body.perDiagObject = pDInfo._id
          req.body.patientId = req.session.userId
          req.body.type = 5
          req.body.code = code
          req.body.smsType = 5
          next()
        }
      })
    } else { // 已有面诊撤回面诊数量占位
      let doctorId = req.body.doctorId
      let queryD = {userId: doctorId, availablePDs: {$elemMatch: {$and: [{availableDay: bookingDay}, {availableTime: bookingTime}]}}}
      let upDoc = {
        $inc: {
          'availablePDs.$.count': -1
        }
      }
      Alluser.update(queryD, upDoc, function (err, upDoctor) {
        if (err) {
          return res.status(500).send(err)
        } else if (upDoctor.n === 0) {
          return res.json({results: '找不到医生'})
        } else if (upDoctor.nModified === 0) {
          return res.json({results: '面诊数量未更新成功，请检查输入'})
        } else if (upDoctor.nModified !== 0) {
          return res.json({results: '当前时段已预约该医生'})
        }
      })
    }
  })
}

// 患者获取某医生可预约面诊
exports.getAvailablePD = function (req, res, next) {
  let doctorId = req.query.doctorId
  let today = new Date(new Date().toDateString())
  let twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)

  let query = {userId: doctorId, $and: [{'availablePDs.availableDay': {$gte: today}}, {'availablePDs.availableDay': {$lt: twoWeeksLater}}]}
  let opts = ''
  let fields = {_id: 0, availablePDs: 1}
  Alluser.getOne(query, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemD === null) {
      let returns = []
      let period = ['Morning', 'Afternoon']
      for (let ii = today; ii < twoWeeksLater; ii.setDate(ii.getDate() + 1)) {
        for (let kk in period) {
          let objTemp = {}
          let dayTemp = commonFunc.convertToFormatDate(new Date(ii))
          objTemp['availableDay'] = dayTemp.slice(0, 4) + '-' + dayTemp.slice(4, 6) + '-' + dayTemp.slice(6, 8)
          objTemp['availableTime'] = period[kk]
          objTemp['margin'] = 0
          returns.push(objTemp)
        }
      }
      return res.status(200).json({results: returns})
    } else {
      let availablePDsList = itemD.availablePDs || []
      let availablePDsArray = []
      for (let i = 0; i < availablePDsList.length; i++) {
        if (availablePDsList[i].availableDay >= today && availablePDsList[i].availableDay < twoWeeksLater) {
          availablePDsArray.push(availablePDsList[i])
        }
      }
      let returns = []
      for (let j = 0; j < availablePDsArray.length; j++) {
        let objTemp = {}
        let dayTemp = commonFunc.convertToFormatDate(new Date(availablePDsArray[j].availableDay))
        objTemp['availableDay'] = dayTemp.slice(0, 4) + '-' + dayTemp.slice(4, 6) + '-' + dayTemp.slice(6, 8)
        objTemp['availableTime'] = availablePDsArray[j].availableTime
        objTemp['suspendFlag'] = availablePDsArray[j].suspendFlag
        objTemp['margin'] = availablePDsArray[j].total - availablePDsArray[j].count
        objTemp['place'] = availablePDsArray[j].place
        returns.push(objTemp)
      }
      req.body.returns = returns
      next()
    }
  }, opts, fields)
}

exports.sortAndTagPDs = function (req, res) {
  let returns = req.body.returns
  let today = new Date(new Date().toDateString())
  let twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
  let queryPD = {
    doctorId: req.body.doctorObject._id,
    patientId: req.body.patientObject._id,
    $and: [{bookingDay: {$gte: today}}, {bookingDay: {$lt: twoWeeksLater}}],
    status: 0
  }
  PersonalDiag.getSome(queryPD, function (err, itemsPD) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemsPD.length !== 0) {
      for (let i = 0; i < itemsPD.length; i++) {
        for (let k = 0; k < returns.length; k++) {
          if (String(itemsPD[i].bookingDay) === String(new Date(new Date(returns[k].availableDay).toDateString())) && itemsPD[i].bookingTime === returns[k].availableTime) {
            returns[k]['diagId'] = itemsPD[i].diagId
          }
        }
      }
    }
    let period = ['Morning', 'Afternoon']
    for (let ii = today; ii < twoWeeksLater; ii.setDate(ii.getDate() + 1)) {
      for (let kk in period) {
        let flag = Number
        for (let jj = 0; jj < returns.length; jj++) {
          flag = 0
          // console.log(new Date(returns[jj].availableDay).toDateString(), ii.toDateString())
          // console.log(returns[jj].availableTime, period[kk])
          if (new Date(returns[jj].availableDay).toDateString() === ii.toDateString() & returns[jj].availableTime === period[kk]) {
            flag = 1
            break
          }
        }

        let objTemp = {}
        if (flag === 0) {
          let dayTemp = commonFunc.convertToFormatDate(new Date(ii))
          objTemp['availableDay'] = dayTemp.slice(0, 4) + '-' + dayTemp.slice(4, 6) + '-' + dayTemp.slice(6, 8)
          objTemp['availableTime'] = period[kk]
          objTemp['margin'] = 0
          returns.push(objTemp)
        }
      }
    }
    returns.sort(function (x, y) {
      if (x.availableDay > y.availableDay) {
        return 1
      } else if (x.availableDay === y.availableDay) {
        return x.availableTime > y.availableTime ? -1 : 1
      } else if (x.availableDay < y.availableDay) {
        return -1
      }
    })
    return res.status(200).json({results: returns})
  })
}
// 患者查看已预约的面诊信息
exports.getMyPDs = function (req, res) {
  let patientObjectId = req.body.patientObject._id
  let queryDay = req.query.day || null
  let queryTime = req.query.time || null
  let status = Number(req.query.status || null)
  let queryPD = {patientId: patientObjectId}
  let opts = ''
  let fields = {_id: 0, patientId: 0}
  let populate = {path: 'doctorId', select: {_id: 0, doctorsInCharge: 0, doctors: 0, teams: 0, schedules: 0, serviceSchedules: 0, availablePDs: 0}}
  if (status === 0 || status === 1 || status === 2 || status === 3 || status === 4) {
    queryPD.status = status
  }
  if (queryDay !== null) {
    queryPD.bookingDay = new Date(new Date(queryDay).toDateString())
  }
  if (queryTime !== null) {
    queryPD.bookingTime = queryTime
  }
  PersonalDiag.getSome(queryPD, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else if (items.length === 0) {
      return res.status(404).send('PDs Not Found')
    } else {
      return res.status(200).json({results: items})
    }
  }, opts, fields, populate)
}

// 患者取消预约
exports.cancelMyPD = function (req, res, next) {
  let diagId = req.body.diagId || null
  let appRole = req.body.appRole || null
  if (diagId === null || appRole === null) {
    return res.status(412).json({msg: 'Please Check Input of diagId, appRole', code: 1})
  }
  let query = {diagId: diagId}
  PersonalDiag.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else {
      let bookingDay = new Date(item.bookingDay)
      let sixInBD = new Date(bookingDay)
      sixInBD.setHours(sixInBD.getHours() + 6)
      if (new Date() >= sixInBD) { // 申请退款
        // return res.status(406).send('Exceeds the Time Limit')
        let upObj = {$set: {status: 5}}
        PersonalDiag.update(query, upObj, function (err, upItem) {
          if (err) {
            return res.status(500).send(err)
          } else if (upItem.nModified === 0) {
            return res.status(304).json({msg: 'Not Modified', code: 1})
          } else {
            return res.status(201).json({msg: 'Cancel Request Received', code: 1})
          }
        })
      } else { // 直接退款
        let upObj = {$set: {status: 3}}
        PersonalDiag.update(query, upObj, function (err, upItem) {
          if (err) {
            return res.status(500).send(err)
          } else if (upItem.nModified === 0) {
            return res.status(304).json({msg: 'Not Modified', code: 1})
          } else {
            // return res.json({results: '取消成功'})
            req.body.PDInfo = item
            next()
          }
        })
      }
    }
  })
}

exports.updatePDCapacityUp = function (req, res) {
  let doctorObjectId = req.body.PDInfo.doctorId
  let bookingDay = req.body.PDInfo.bookingDay
  let bookingTime = req.body.PDInfo.bookingTime
  let appRole = req.body.appRole || null

  let queryD = {_id: doctorObjectId, availablePDs: {$elemMatch: {$and: [{availableDay: bookingDay}, {availableTime: bookingTime}]}}}
  let upDoc = {
    $inc: {
      'availablePDs.$.count': -1
    }
  }
  let opts = {fields: {_id: 0, availablePDs: 1}}
  Alluser.update(queryD, upDoc, function (err, upDoctor) {
    if (err) {
      return res.status(500).send(err)
    } else if (upDoctor.nModified === 0) {
      return res.status(304).json({msg: 'Not Modified', code: 1})
    } else if (upDoctor.nModified !== 0) {
      // return res.status(201).send('Cancel Success')
      // 调用退款接口
      return res.json({msg: '测试中，待退款', code: 0})
      // let queryO = {perDiagObject: req.body.PDInfo._id}
      // Order.getOne(queryO, function (err, itemO) { // 获取相应订单的订单号
      //   if (err) {
      //     return res.status(500).send(err)
      //   } else {
      //     let orderNo = itemO.orderNo
      //     request({ // 调用微信退款接口
      //       url: 'http://' + webEntry.domain + ':' + webEntry.restPort + '/api/v2/wechat/refund',
      //       method: 'POST',
      //       body: {'role': appRole, 'orderNo': orderNo, 'token': req.body.token},
      //       json: true
      //     }, function (err, response) {
      //       if (err) {
      //         return res.status(500).send(err)
      //       } else {
      //         console.log(response)
      //         return res.json({msg: '取消成功，请等待退款通知', data: req.body.PDInfo, code: 0})
      //       }
      //     })
      //   }
      // })
    }
  }, opts)
}

/**
每日更新系列
*/
// 每日更新所有医生两周后当天的面诊可预约 YQC 2017-07-29
exports.autoAvailablePD = function (req, res) {
  console.log(new Date())
  let today = new Date(new Date().toDateString())
  let twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
  let todayNo = new Date().toDateString().split(' ')[0]
  // console.log(todayNo)
  let query = {'serviceSchedules.day': todayNo}
  Alluser.getSome(query, function (err, items) {
    if (err) {
      console.log(err)
    } else {
      if (items.length === 0) {
        console.log('auto_available_personal_diagnosis_update_complete-0')
      } else {
        for (let i = 0; i < items.length; i++) { // 遍历所有当天需要新增面诊的医生
          let itemDoc = items[i]
          let sTDoc = itemDoc.serviceSuspendTime || []
          let suspendFlag = 0
          for (let k = 0; k < sTDoc.length; k++) { // 停诊判断
            if (sTDoc[k].start <= twoWeeksLater && sTDoc[k].end > twoWeeksLater) {
              suspendFlag = 1
              break
            }
          }
          let sSDoc = itemDoc.serviceSchedules || []
          // let timeToUpdate = []
          for (let j = 0; j < sSDoc.length; j++) { // 遍历某医生所有面诊时间段
            if (sSDoc[j].day === todayNo) {
              // timeToUpdate.push(sSDoc[j].time)
              let doctorId = itemDoc.userId
              let queryD = {userId: doctorId}
              let upObj = {
                $addToSet: {
                  availablePDs: {
                    availableTime: sSDoc[j].time,
                    availableDay: twoWeeksLater,
                    total: sSDoc[j].total,
                    suspendFlag: suspendFlag,
                    place: sSDoc[j].place,
                    count: 0
                  }
                }
              }
              Alluser.update(queryD, upObj, function (err, upItem) {
                if (err) {
                  console.log(err)
                } else if (upItem.nModified === 1) {
                  console.log(doctorId + '-' + twoWeeksLater.toDateString() + '-' + sSDoc[j].time + '-PD-Auto-Update-Complete-1')
                } else {
                  console.log(doctorId + '-' + twoWeeksLater.toDateString() + '-' + sSDoc[j].time + '-PD-Auto-Update-Complete-0')
                }
              })
            }
          }
        }
        console.log('auto_available_personal_diagnosis_update_complete-all')
      }
    }
  })
}

// 每日核销过期面诊PD
exports.autoOverduePD = function (req, res) {
  console.log(new Date())
  let today = new Date(new Date().toDateString())
  let middleOfToday = new Date(today)
  middleOfToday.setHours(today.getHours() + 12)
  let query = {endTime: {$lte: middleOfToday}, status: 0}
  let upObj = {$set: {status: 2}}
  PersonalDiag.getSome(query, function (err, items) { // 获取需要自动核销的PD
    if (err) {
      console.log(err)
    } else {
      let count = 0
      for (let item in items) { // 遍历所有需要自动核销的PD
        let itemPD = items[item]
        let PDId = itemPD._id
        PersonalDiag.updateOne({_id: PDId}, upObj, function (err, upPD) { // 修改PD状态
          if (err) {
            console.log(err)
          } else {
            let queryO = {perDiagObject: PDId}
            Order.getOne(queryO, function (err, itemO) { // 获取相应订单的医生userId和订单金额
              if (err) {
                console.log(err)
              } else {
                let doctorId = itemO.doctorId
                let money = Number(itemO.money)
                let queryA = {userId: doctorId}
                let upObjA = {$inc: {money: money}}
                Account.updateOne(queryA, upObjA, function (err, upAccount) { // 给相应医生账户充值
                  if (err) {
                    console.log(err)
                  } else {
                    console.log(doctorId + 'recharges with' + money)
                    count++
                  }
                }, {upsert: true})
              }
            })
          }
        })
      }
      console.log(items.length + ' Entries Found, and ' + count + ' Entries Successfully Modified.')
    }
  })
}
