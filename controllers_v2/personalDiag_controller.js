var PersonalDiag = require('../models/personalDiag')
var Alluser = require('../models/alluser')
// var commonFunc = require('../middlewares/commonFunc')
var Order = require('../models/order')
var Account = require('../models/account')
// var request = require('request')
var webEntry = require('../settings').webEntry
var Message = require('../models/message')
var News = require('../models/news')

var async = require('async')
var wechatCtrl = require('../controllers_v2/wechat_controller')
var alluserCtrl = require('../controllers_v2/alluser_controller')

var getToken = function (headers) {
  if (headers && headers.authorization) {
    var authorization = headers.authorization
    var part = authorization.split(' ')
    if (part.length === 2) {
      var token = part[1]
      return token
    } else {
      return null
    }
  } else {
    return null
  }
}

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
  if (Number(total) <= 0) {
    return res.status(412).json({results: '请调用"删除排班"或"设置面诊停诊"的方法'})
  }
  let query = {userId: req.session.userId, serviceSchedules: {$elemMatch: {$and: [{day: day}, {time: time}]}}}
  Alluser.getOne(query, function (err, item) {
    let upObj = {}
    let opts = {new: true, runValidators: true, setDefaultsOnInsert: true}
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) { // 排班不存在，添加排班
      query = {userId: req.session.userId, role: 'doctor'}
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
    Alluser.updateOne(query, upObj, function (err, upItem) {
      if (err) {
        return res.status(500).send(err)
      } else if (upItem === null) {
        return res.status(404).json({results: '找不到对象'})
      } else {
        // return res.status(201).json({results: upItem})
        next()
      }
    }, opts)
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
  Alluser.getOne(query, function (err, item) {
    let upObj = {}
    let opts = {new: true, runValidators: true, setDefaultsOnInsert: true}
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) { // 排班不存在，设置面诊总量为零
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
    } else { // 排班存在，更新面诊总量为零
      upObj = {
        $set: {
          'serviceSchedules.$.total': 0
        }
      }
    }
    Alluser.updateOne(query, upObj, function (err, upItem) {
      if (err) {
        return res.status(500).send(err)
      } else if (upItem === null) {
        return res.status(404).json({results: '找不到对象'})
      // } else if (item === null) {
      //   return res.json({msg: '面诊排班删除成功', code: 0})
      } else {
        // return res.status(201).json({results: upItem})
        req.body.deleteFlag = 1
        next()
      }
    }, opts)
  })
}

// YQC 2017-07-28
exports.getDaysToUpdate = function (req, res, next) {
  let day = req.body.day || null
  let now = new Date()
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
  let nextModDay = new Date(now)
  if (now.getDay() > nextDayNo) {
    nextModDay.setDate(nextModDay.getDate() + 7 - now.getDay() + nextDayNo)
  } else {
    nextModDay.setDate(nextModDay.getDate() - now.getDay() + nextDayNo)
  }
  nextModDay = new Date(nextModDay.getFullYear(), nextModDay.getMonth(), nextModDay.getDate(), '00', '00', '00')
  // console.log(nextModDay)

  let nextNextModDay = new Date(now)
  if (now.getDay() > nextDayNo) {
    nextNextModDay.setDate(nextNextModDay.getDate() + 14 - now.getDay() + nextDayNo)
  } else {
    nextNextModDay.setDate(nextNextModDay.getDate() + 7 - now.getDay() + nextDayNo)
  }
  nextNextModDay = new Date(nextNextModDay.getFullYear(), nextNextModDay.getMonth(), nextNextModDay.getDate(), '00', '00', '00')
  // console.log(nextNextModDay)

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
  let nextModDay = new Date(new Date(req.body.nmd).toLocaleDateString())
  let time = req.body.time || null
  let total = req.body.total || null
  let place = req.body.place || null
  let queryD1 = {userId: req.session.userId, availablePDs: {$elemMatch: {$and: [{availableDay: nextModDay}, {availableTime: time}]}}}
  let upObjD1
  if (req.body.deleteFlag) {
    total = 0
    upObjD1 = {
      $set: {
        'availablePDs.$.total': 0,
        'availablePDs.$.count': 0
      }
    }
  } else {
    upObjD1 = {
      $set: {
        'availablePDs.$.total': total,
        'availablePDs.$.place': place,
        'availablePDs.$.count': 0
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
          // console.log('OK-11')
          next()
        }
      })
    } else {
      // console.log('OK-1')
      next()
    }
  })
}
// YQC 2017-07-28
exports.updateAvailablePD2 = function (req, res, next) {
  let nextNextModDay = new Date(new Date(req.body.nnmd).toLocaleDateString())
  let time = req.body.time || null
  let total = req.body.total || null
  let place = req.body.place || null
  let queryD2 = {userId: req.session.userId, availablePDs: {$elemMatch: {$and: [{availableDay: nextNextModDay}, {availableTime: time}]}}}
  let upObjD2
  if (req.body.deleteFlag) {
    total = 0
    upObjD2 = {
      $set: {
        'availablePDs.$.total': 0,
        'availablePDs.$.count': 0
      }
    }
  } else {
    upObjD2 = {
      $set: {
        'availablePDs.$.total': total,
        'availablePDs.$.place': place,
        'availablePDs.$.count': 0
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
          // console.log('OK-21')
          if (req.body.deleteFlag) {
            next()
          } else {
            return res.status(200).send('OK')
          }
        }
      })
    } else {
      // console.log('OK-2')
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
  let today = new Date(new Date().toLocaleDateString())
  let startOfStart = new Date(new Date(start).toLocaleDateString())
  let endOfEnd = new Date(new Date(end).toLocaleDateString())
  endOfEnd.setMilliseconds(endOfEnd.getMilliseconds() + 999)
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
exports.cancelBookedPds = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let now = new Date()
  let query = {} // 需退款
  let opts = ''
  let fields = {_id: 1, doctorId: 1, patientId: 1, bookingDay: 1, bookingTime: 1, diagId: 1}
  let populate = [
    {path: 'doctorId', select: {_id: 0, name: 1, userId: 1}},
    {path: 'patientId', select: {_id: 0, phoneNo: 1, userId: 1}}
  ]
  let fieldsO = {_id: 0, money: 1, orderNo: 1, perDiagObject: 1, paystatus: 1}
  let populateO = {
    path: 'perDiagObject',
    select: {_id: 1, doctorId: 1, patientId: 1, bookingDay: 1, bookingTime: 1, diagId: 1},
    populate: [
      {path: 'doctorId', select: {_id: 0, name: 1, userId: 1}},
      {path: 'patientId', select: {_id: 0, phoneNo: 1, userId: 1}}
    ]
  }
  let queryU = {} // 需退款，无需人工通知
  let upObj = {$set: {status: 4}}
  let queryPD = null // 需退款，需人工通知
  let upObjPD = {$set: {status: 6}}
  if (req.body.suspendFlag) { // 设置停诊取消面诊
    let startOfStart = req.body.startOfStart
    let endOfEnd = req.body.endOfEnd
    let today = new Date(now.toLocaleDateString())
    let tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let endOfTomorrow = new Date(new Date(tomorrow).toLocaleDateString())
    endOfTomorrow.setMilliseconds(endOfTomorrow.getMilliseconds() + 999)
    query = {
      doctorId: doctorObjectId,
      status: 0,
      $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
    }
    if (new Date(startOfStart) - now > 86400000) {
      queryU = {
        doctorId: doctorObjectId,
        status: 0,
        $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
      }
    } else { // 停诊时间紧迫
      queryU = {
        doctorId: doctorObjectId,
        status: 0,
        $and: [{bookingDay: {$gte: endOfTomorrow}}, {bookingDay: {$lt: endOfEnd}}]
      }
      queryPD = {
        $and: [{bookingDay: {$gte: today}}, {bookingDay: {$lte: endOfTomorrow}}],
        doctorId: doctorObjectId,
        status: 0
      }
    }
  } else { // 删除排班取消面诊
    query = {
      doctorId: doctorObjectId,
      status: 0,
      $or: [{bookingDay: new Date(req.body.nmd)}, {bookingDay: new Date(req.body.nnmd)}],
      bookingTime: req.body.time
    }
    if (new Date(req.body.nmd) - now > 86400000) {
      queryU = {
        doctorId: doctorObjectId,
        status: 0,
        $or: [{bookingDay: new Date(req.body.nmd)}, {bookingDay: new Date(req.body.nnmd)}],
        bookingTime: req.body.time
      }
    } else { // 排班取消时间紧迫
      queryU = {
        doctorId: doctorObjectId,
        status: 0,
        bookingDay: new Date(req.body.nnmd),
        bookingTime: req.body.time
      }
      queryPD = {
        doctorId: doctorObjectId,
        status: 0,
        bookingDay: new Date(req.body.nmd),
        bookingTime: req.body.time
      }
    }
  }
  async.auto({
    getPDs: function (callback) {
      PersonalDiag.getSome(query, function (err, items){
        return callback(err, items)
      }, opts, fields, populate)
    },
    getOrders: ['getPDs', function (results, callback) {
      let getOrder = function (itemPD, icallback) {
        let queryO = {perDiagObject: itemPD._id, paystatus: 2}
        Order.getOne(queryO, function (err, itemO) {
          return icallback(err, itemO)
        }, opts, fieldsO, populateO)
      }
      async.concat(results.getPDs, getOrder, function(err, items) {
        return callback(err, items)
      })
    // }]
    }],
    refund: ['getOrders', function (results, callback) {
      let refund = function (itemO, icallback) {
        if ((itemO || null) !== null) {
          let money = itemO.money || null
          if (Number(money) !== 0) {
            let params = {
              orderNo: itemO.orderNo, // 退款单号
              role: 'appPatient'
            }
            wechatCtrl.wechatRefundAsync(params, function (err, result) {
              let refundResults = result.refund.xml || null
              if (refundResults !== null) {
                if (refundResults.return_code === 'SUCCESS' && refundResults.result_code === 'SUCCESS') {
                  return icallback(err, {msg: itemO.orderNo + '退款成功', data: refundResults, code: 0})
                } else {
                  return icallback(err, {msg: itemO.orderNo + '退款失败', data: refundResults, code: 1})
                }
              } else {
                return icallback(err, {msg: itemO.orderNo + '退款失败', data: refundResults, code: 1})
              }
            })
          } else {
            return icallback(null, {msg: itemO.orderNo + '金额为零，无需退款', code: 0})
          }
        }
      }
      async.concat(results.getOrders, refund, function(err, items) {
        return callback(err, items)
      })
    }],
    textMessage: ['refund', function (results, callback) {
      let text = function (itemO, icallback) {
        let params = {
          type: 'cancel',
          phoneNo: itemO.perDiagObject.patientId.phoneNo,
          bookingDay: new Date(itemO.perDiagObject.bookingDay).toLocaleDateString(),
          bookingTime: itemO.perDiagObject.bookingTime,
          doctorName: itemO.perDiagObject.doctorId.name,
          orderNo: itemO.orderNo, // 订单号
          orderMoney: itemO.money
        }
        alluserCtrl.servicesMessageAsync(params, function (err, result) {
          if (err) {
            return icallback(null, {err: err, code: 1})
          } else {
            return icallback(null, {data: result, code: 0})
          }
        })
      }
      async.concat(results.getOrders, text, function(err, items) {
        return callback(err, items)
      })
    }],
    messageAndNews: ['refund', function (results, callback) {
      let message = function (itemO, icallback) {
        let bookingDay = new Date(new Date(itemO.perDiagObject.bookingDay).toLocaleDateString())
        let PDTime
        if (itemO.perDiagObject.bookingTime === 'Morning') {
          PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
        } else if (itemO.perDiagObject.bookingTime === 'Afternoon') {
          PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
        }
        let newData = {
          userId: itemO.perDiagObject.patientId.userId,
          sendBy: itemO.perDiagObject.doctorId.userId,
          type: 7,
          messageId: 'M' + itemO.perDiagObject.diagId + 'CANCEL',
          readOrNot: 0,
          time: now,
          title: PDTime + ',' + itemO.perDiagObject.doctorId.name + '医生面诊服务停诊',
          description: '您预约' + itemO.perDiagObject.doctorId.name + '医生的' + PDTime + '时段的面诊服务因医生停诊取消，所付款项' + Number(itemO.money) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + itemO.orderNo + '。'
        }
        let newmessage = new Message(newData)
        newmessage.save(function (err, newInfo) {
          if (err) {
            return icallback(err)
          }
          let query = {userId: itemO.perDiagObject.patientId.userId, sendBy: itemO.perDiagObject.doctorId.userId}
          let obj = {
            $set: {
              messageId: 'M' + itemO.perDiagObject.diagId + 'CANCEL',
              readOrNot: 0,
              userRole: 'patient',
              type: 7,
              time: now,
              title: PDTime + ',' + itemO.perDiagObject.doctorId.name + '面诊停诊',
              description: '您预约' + itemO.perDiagObject.doctorId.name + '医生的' + PDTime + '时段的面诊服务因医生停诊取消，所付款项' + Number(itemO.money) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + itemO.orderNo + '。'
            }
          }
          News.updateOne(query, obj, function (err, upnews) {
            return icallback(err, upnews)
          }, {upsert: true})
        })
      }
      async.concat(results.getOrders, message, function(err, items) {
        return callback(err, items)
      })
    }],
    updatePDs1: ['refund', function (results, callback) {
      PersonalDiag.update(queryU, upObj, function (err, upPDs) {
        return callback(err, upPDs)
      }, {multi: true})
    }],
    updatePDs2: ['refund', function (results, callback) {
      if (queryPD !== null) {
        PersonalDiag.update(queryPD, upObjPD, function (err, upPDs) {
          return callback(err, upPDs)
        }, {multi: true})
      } else {
        return callback(null, '无需紧急通知')
      }
    }]
  }, function (err, results) {
    if (err) {
      return res.json({err: err, code: 1, data: results})
    } else {
      let msg = []
      if (Number(results.refund.code) === 1) {
        msg.push('退款失败')
      }
      if (Number(results.textMessage.code) === 1) {
        msg.push('短信发送失败')
      }
      return res.json({code: 0, msg: msg, data: results})
    }
  })
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}

// 删除面诊停诊时间 2017-07-15 GY
exports.deleteServiceSuspend = function (req, res) {
  let query = {userId: req.session.userId}
  let start = req.body.start || null
  let end = req.body.end || null
  let startOfStart = new Date(new Date(start).toLocaleDateString())
  let endOfEnd = new Date(new Date(end).toLocaleDateString())
  endOfEnd.setMilliseconds(endOfEnd.getMilliseconds() + 999)
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
    queryPD.bookingDay = new Date(new Date(queryDay).toLocaleDateString())
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
  // let bookingDay = new Date(new Date(req.body.day).toLocaleDateString()) || null
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
  let today = new Date(new Date().toLocaleDateString())
  let bookingDay = req.body.day || null
  let bookingTime = req.body.time || null
  if (doctorId === null || bookingDay === null || bookingTime === null) {
    return res.json({results: '请检查doctorId,day,time输入'})
  } else {
    bookingDay = new Date(new Date(req.body.day).toLocaleDateString())
    if (bookingDay < today) {
      return res.json({results: '请检查day输入正确'})
    }
  }

  let queryD = {userId: doctorId, availablePDs: {$elemMatch: {$and: [{availableDay: new Date(bookingDay)}, {availableTime: bookingTime}, {suspendFlag: 0}]}}}
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
      for (let i = 0; i < availablePDsList.length; i++) { // 取出该时段面诊信息
        if (new Date(availablePDsList[i].availableDay).toLocaleDateString() === new Date(bookingDay).toLocaleDateString() && String(availablePDsList[i].availableTime) === String(bookingTime)) {
          availablePD = availablePDsList[i]
          break
        }
      }

      let count = Number(availablePD.count || null)
      let total = Number(availablePD.total || null)
      req.body.place = availablePD.place
      if (count < total) { // 存在余量，可预约面诊
        let upDoc = {
          $inc: {
            'availablePDs.$.count': 1
          }
        }
        Alluser.update(queryD, upDoc, function (err, upDoctor) { // 占个号
          if (err) {
            return res.status(500).send(err)
          } else if (upDoctor.nModified !== 1) {
            return res.json({results: '面诊数量未更新成功，请检查输入', code: 1})
          } else if (upDoctor.nModified === 1) {
            // return res.json({results: '面诊数量更新成功'})
            next()
          }
        })
      } else { // 可预约面诊数量为零
        return res.json({results: '该时段预约已满，请更换预约时间', code: 1})
      }
    }
  }, fieldsD)
}

exports.newPersonalDiag = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let bookingDay = new Date(req.body.day).toLocaleDateString()
  let bookingTime = req.body.time
  let place = req.body.place

  let queryPD = {doctorId: doctorObjectId, patientId: patientObjectId, bookingDay: new Date(bookingDay), bookingTime: bookingTime, status: 0}
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
        bookingDay: new Date(bookingDay),
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
          req.body.successFlag = 1
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
  let today = new Date(new Date().toLocaleDateString())
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
          let dayTemp = new Date(new Date(ii).toLocaleDateString())
          objTemp['availableDay'] = dayTemp.getFullYear() + '-' + add0(dayTemp.getMonth() + 1) + '-' + add0(dayTemp.getDate())
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
        let dayTemp = new Date(new Date(availablePDsArray[j].availableDay).toLocaleDateString())
        objTemp['availableDay'] = dayTemp.getFullYear() + '-' + add0(dayTemp.getMonth() + 1) + '-' + add0(dayTemp.getDate())
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
  let today = new Date(new Date().toLocaleDateString())
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
          if (new Date(itemsPD[i].bookingDay).toLocaleDateString() === new Date(returns[k].availableDay).toLocaleDateString() && String(itemsPD[i].bookingTime) === String(returns[k].availableTime)) {
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
          // console.log(new Date(returns[jj].availableDay).toLocaleDateString(), ii.toLocaleDateString())
          // console.log(returns[jj].availableTime, period[kk])
          if (new Date(returns[jj].availableDay).toLocaleDateString() === ii.toLocaleDateString() & returns[jj].availableTime === period[kk]) {
            flag = 1
            break
          }
        }

        let objTemp = {}
        if (flag === 0) {
          let dayTemp = new Date(new Date(ii).toLocaleDateString())
          objTemp['availableDay'] = dayTemp.getFullYear() + '-' + add0(dayTemp.getMonth() + 1) + '-' + add0(dayTemp.getDate())
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
        return String(x.availableTime) > String(y.availableTime) ? -1 : 1
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
    queryPD.bookingDay = new Date(new Date(queryDay).toLocaleDateString())
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
  if (diagId === null) {
    return res.status(412).json({msg: 'Please Check Input of diagId', code: 1})
  }
  let query = {diagId: diagId, status: 0, patientId: req.session._id}
  let now = new Date()
  async.auto({
    getPD: function (callback) {
      PersonalDiag.getOne(query, function (err, item) {
        if (item !== null) {
          return callback(err, item)
        } else {
          let err = '不存在的PD'
          return callback(err, item)
        }
      })
    },
    updatePD: ['getPD', function (results, callback) {
      let bookingDay = new Date(results.getPD.bookingDay)
      let sixInBD = new Date(bookingDay)
      sixInBD.setHours(sixInBD.getHours() + 6)
      let upObj = {}
      if (new Date() >= sixInBD) { // 申请退款
        upObj = {$set: {status: 5}}
      } else { // 直接退款
        upObj = {$set: {status: 3}}
      }
      let populate = [
        {path: 'doctorId', select: {_id: 0, name: 1, userId: 1}},
        {path: 'patientId', select: {_id: 0, phoneNo: 1, userId: 1}}
      ]
      PersonalDiag.updateOne(query, upObj, function (err, upItem) {
        return callback(err, upItem)
      }, {new: true}, populate)
    }],
    updateAvailablePD: ['getPD', function (results, callback) {
      let doctorObjectId = results.getPD.doctorId
      let bookingDay = results.getPD.bookingDay
      let bookingTime = results.getPD.bookingTime
      let queryD = {_id: doctorObjectId, availablePDs: {$elemMatch: {$and: [{availableDay: bookingDay}, {availableTime: bookingTime}]}}}
      let upDoc = {$inc: {'availablePDs.$.count': -1}}
      let opts = {fields: {_id: 0, availablePDs: 1}, new: true}
      Alluser.updateOne(queryD, upDoc, function (err, upDoctor) {
        return callback(err, upDoctor)
      }, opts)
    }],
    getOrder: ['updatePD', function (results, callback) {
      if ((results.updatePD || null) !== null) {
        if ((results.updatePD.patientId || null) !== null && (results.updatePD.doctorId || null) !== null) {
          let queryO = {perDiagObject: results.updatePD._id}
          Order.getOne(queryO, function (err, itemO) {
            if (itemO === null) {
              let err = '无法查询订单'
              return callback(err)
            } else {
              return callback(err, itemO)
            }
          })
        } else {
          let err = 'PD数据错误，无法查询医生或患者'
          return callback(err)
        }
      } else {
        let err = '数据错误'
        return callback(err)
      }
    }],
    refund: ['getOrder', 'updateAvailablePD', function (results, callback) {
      if (Number(results.updatePD.status) === 3) {
        let money = results.getOrder.money || null
        if (Number(money) !== 0) {
          let params = {
            orderNo: results.getOrder.orderNo, // 退款单号
            role: 'appPatient'
          }
          wechatCtrl.wechatRefundAsync(params, function (err, result) {
            let refundResults = result.refund.xml || null
            if (refundResults !== null) {
              if (refundResults.return_code === 'SUCCESS' && refundResults.result_code === 'SUCCESS') {
                return callback(err, {msg: '退款成功', data: result, code: 0})
              } else {
                return callback(err, {msg: '退款失败', data: result, code: 1})
              }
            } else {
              return callback(err, {msg: '退款失败', data: result, code: 1})
            }
          })
        } else {
          return callback(null, {msg: '金额为零，无需退款', code: 0})
        }
      } else if (Number(results.updatePD.status) === 5) {
        return callback(null, '申请退款')
      } else {
        let err = '数据更新错误'
        return callback(err)
      }
    }],
    textMessage: ['refund', function (results, callback) {
      let params
      if (Number(results.updatePD.status) === 5) { // 申请退款 cancelRequest
        params = {
          type: 'cancelRequest',
          phoneNo: results.updatePD.patientId.phoneNo,
          bookingDay: new Date(results.updatePD.bookingDay).toLocaleDateString(),
          bookingTime: results.updatePD.bookingTime,
          doctorName: results.updatePD.doctorId.name
        }
      } else if (Number(results.updatePD.status) === 3) { // 直接退款 cancelRefund
        params = {
          type: 'cancelRefund',
          phoneNo: results.updatePD.patientId.phoneNo,
          bookingDay: new Date(results.updatePD.bookingDay).toLocaleDateString(),
          bookingTime: results.updatePD.bookingTime,
          doctorName: results.updatePD.doctorId.name,
          orderNo: results.getOrder.orderNo, // 退款订单号
          orderMoney: results.getOrder.money || 0 // 退款金额订单
        }
      } else {
        let err = '数据错误，请检查输入'
        return callback(err)
      }
      alluserCtrl.servicesMessageAsync(params, function (err, result) {
        if (err) {
          return callback(null, {err: err, code: 1})
        } else {
          return callback(null, {data: result, code: 0})
        }
      })
    }],
    messageAndNews: ['refund', function (results, callback) {
      let bookingDay = new Date(new Date(results.updatePD.bookingDay).toLocaleDateString())
      let PDTime
      if (results.updatePD.bookingTime === 'Morning') {
        PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
      } else if (results.updatePD.bookingTime === 'Afternoon') {
        PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
      }
      let newData = {
        userId: results.updatePD.patientId.userId,
        sendBy: results.updatePD.doctorId.userId,
        type: 7,
        messageId: 'M' + results.updatePD.diagId + 'CANCEL',
        readOrNot: 0,
        time: now,
        title: PDTime + ',' + results.updatePD.doctorId.name + '医生面诊服务停诊'
      }
      if (Number(results.updatePD.status) === 5) {
        newData['description'] = '尊敬的用户，您已提交“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊取消申请，专员会尽快进行审核。您可登录肾事管家预约更多面诊服务，感谢您的支持。'
      }
      if (Number(results.updatePD.status) === 3) {
        newData['description'] = '尊敬的用户，您已成功取消“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊服务，所付款项' + Number(results.getOrder.money || 0) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
      }
      let newmessage = new Message(newData)
      newmessage.save(function (err, newInfo) {
        if (err) {
          return callback(err)
        }
        let query = {userId: results.updatePD.patientId.userId, sendBy: results.updatePD.doctorId.userId}
        let obj = {
          $set: {
            messageId: 'M' + results.updatePD.diagId + 'CANCEL',
            readOrNot: 0,
            userRole: 'patient',
            type: 7,
            time: now,
            title: PDTime + ',' + results.updatePD.doctorId.name + '面诊停诊'
          }
        }
        if (Number(results.updatePD.status) === 5) {
          obj['$set']['description'] = '尊敬的用户，您已提交“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊取消申请，专员会尽快进行审核。您可登录肾事管家预约更多面诊服务，感谢您的支持。'
        }
        if (Number(results.updatePD.status) === 3) {
          obj['$set']['description'] = '尊敬的用户，您已成功取消“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊服务，所付款项' + Number(results.getOrder.money || 0) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
        }
        News.updateOne(query, obj, function (err, upnews) {
          return callback(err, upnews)
        }, {upsert: true})
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({err: err, code: 1, data: results})
    } else {
      let msg = []
      if (Number(results.refund.code) === 1) {
        msg.push('退款失败')
      }
      if (Number(results.textMessage.code) === 1) {
        msg.push('短信发送失败')
      }
      return res.json({code: 0, msg: msg, data: results})
    }
  })
}

/**
每日更新系列
*/
// 每日更新所有医生两周后当天的面诊可预约 YQC 2017-07-29
exports.autoAvailablePD = function () {
  console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '"每日更新所有医生两周后当天的面诊可预约列表"进程开始')
  let today = new Date(new Date().toLocaleDateString())
  let twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
  let todayNo = new Date().toDateString().split(' ')[0]
  // console.log(todayNo)
  let query = {'serviceSchedules.day': todayNo}
  Alluser.getSome(query, function (err, items) {
    if (err) {
      console.log(new Date() + ' --- 每日更新所有医生两周后当天的面诊可预约列表 --- ' + err)
    } else {
      if (items.length === 0) {
        console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + ' --- "每日更新所有医生两周后当天的面诊可预约列表"进程结束 --- ' + 'auto_available_personal_diagnosis_update_complete-zero')
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
                  console.log(new Date() + ' --- 每日更新所有医生两周后当天的面诊可预约列表 --- ' + err)
                } else if (upItem.nModified === 1) {
                  console.log(new Date() + ' --- 每日更新所有医生两周后当天的面诊可预约列表 --- ' + doctorId + '-' + twoWeeksLater.toLocaleDateString() + '-' + sSDoc[j].time + '-PD-Auto-Update-Complete-Succeed')
                } else {
                  console.log(new Date() + ' --- 每日更新所有医生两周后当天的面诊可预约列表 --- ' + doctorId + '-' + twoWeeksLater.toLocaleDateString() + '-' + sSDoc[j].time + '-PD-Auto-Update-Complete-Fail')
                }
              })
            }
          }
        }
        console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + ' --- "每日更新所有医生两周后当天的面诊可预约列表"进程结束 --- ' + 'auto_available_personal_diagnosis_update_complete-all')
      }
    }
  })
}

// 每日核销过期面诊PD
exports.autoOverduePD = function () {
  console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '"过期面诊自动核销"进程开始')
  let today = new Date(new Date().toLocaleDateString())
  let middleOfToday = new Date(today)
  middleOfToday.setHours(today.getHours() + 12)
  let query = {endTime: {$lte: middleOfToday}, status: 0}
  let upObj = {$set: {status: 2}}
  PersonalDiag.getSome(query, function (err, items) { // 获取需要自动核销的PD
    if (err) {
      console.log(new Date() + ' --- 过期面诊自动核销 --- ' + err)
    } else {
      let count = 0
      for (let item in items) { // 遍历所有需要自动核销的PD
        let itemPD = items[item]
        let PDId = itemPD._id
        PersonalDiag.updateOne({_id: PDId}, upObj, function (err, upPD) { // 修改PD状态
          if (err) {
            console.log(new Date() + ' --- 过期面诊自动核销 --- ' + err)
          } else {
            let queryO = {perDiagObject: PDId}
            Order.getOne(queryO, function (err, itemO) { // 获取相应订单的医生userId和订单金额
              if (err) {
                console.log(new Date() + ' --- 过期面诊自动核销 --- ' + err)
              } else if (itemO === null) {
                console.log(new Date() + ' --- 过期面诊自动核销 --- ' + 'order for ' + itemPD.diagId + ' not found')
              } else {
                let doctorId = itemO.doctorId
                let money = Number(itemO.money) / 100
                let queryA = {userId: doctorId}
                let upObjA = {$inc: {money: money}}
                Account.updateOne(queryA, upObjA, function (err, upAccount) { // 给相应医生账户充值
                  if (err) {
                    console.log(new Date() + ' --- 过期面诊自动核销 --- ' + err)
                  } else {
                    console.log(new Date() + ' --- 过期面诊自动核销 --- ' + doctorId + 'recharges with' + money)
                    count++
                  }
                }, {upsert: true})
              }
            })
          }
        })
      }
      console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + ' "过期面诊自动核销"进程结束 --- \n' + items.length + ' Entries Found, and ' + count + ' Entries Successfully Modified.')
    }
  })
}

/**
人工处理
*/
// 获取需要人工处理退款的面诊列表
exports.manualRefundAndNoticeList = function (req, res) {
  let status = req.query.status || null
  let query
  if (status !== null) {
    status = Number(status)
    if (status !== 5 && status !== 6 && status !== 7 && status !== 8 && status !== 9) {
      return res.json({msg: '请检查status输入', code: 1})
    } else {
      query = {status: status}
    }
  } else {
    query = {$or: [{status: 5}, {status: 6}, {status: 7}, {status: 8}, {status: 9}]}
  }

  PersonalDiag.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      let listPD = []
      for (let item in items) {
        listPD.push(items[item]._id)
      }
      let queryO = {perDiagObject: {$in: listPD}}
      let opts = ''
      let skip = req.query.skip || null
      let limit = req.query.limit || null
      if (limit !== null && skip !== null) {
        opts = {limit: Number(limit), skip: Number(skip), sort: '_id'}
      } else if (limit === null && skip === null) {
        opts = {sort: '_id'}
      } else {
        return res.json({msg: '请确认skip,limit的输入是否正确', code: 1})
      }
      let fields = {_id: 0, orderNo: 1, money: 1, paystatus: 1, perDiagObject: 1}
      let populate = {
        path: 'perDiagObject',
        select: {_id: 0, code: 0},
        populate: [
          {path: 'patientId', select: {'_id': 0, 'name': 1, 'phoneNo': 1, 'gender': 1}},
          {path: 'doctorId', select: {'_id': 0, 'name': 1, 'phoneNo': 1, 'gender': 1}}
        ]
      }
      Order.getSome(queryO, function (err, itemsO) {
        if (err) {
          return res.status(500).send(err)
        } else {
          return res.json({data: itemsO, code: 0})
        }
      }, opts, fields, populate)
    }
  })
}

// 人工处理面诊退款/停诊通知
exports.manualRefundAndNotice = function (req, res) {
  let diagId = req.body.diagId || null
  if (diagId === null) {
    return res.json({code: 1, msg: '请填写diagId!'})
  }
  let reviewResult = req.body.reviewResult || null
  if (reviewResult === null) {
    return res.json({code: 1, msg: '请填写reviewResult!'})
  }
  let queryPD = {diagId: diagId}
  let upObj
  if (reviewResult === 'consent') {
    upObj = {$set: {status: 8}}
    queryPD['status'] = 5
  } else if (reviewResult === 'reject') {
    upObj = {$set: {status: 7}}
    queryPD['status'] = 5
  } else if (reviewResult === 'notice') {
    upObj = {$set: {status: 9}}
    queryPD['status'] = 6
  } else {
    return res.json({code: 1, msg: '请检查reviewResult的输入'})
  }
  let populate = [
    {path: 'doctorId', select: {_id: 0, name: 1, userId: 1}},
    {path: 'patientId', select: {_id: 0, phoneNo: 1, userId: 1}}
  ]
  let now = new Date()
  async.auto({
    updatePD: function (callback) {
      PersonalDiag.updateOne(queryPD, upObj, function (err, upPD) {
        return callback(err, upPD)
      }, {new: true}, populate)
    },
    getOrder: ['updatePD', function (results, callback) {
      if ((results.updatePD || null) !== null) {
        if ((results.updatePD.patientId || null) !== null && (results.updatePD.doctorId || null) !== null) {
          let queryO = {perDiagObject: results.updatePD._id}
          Order.getOne(queryO, function (err, itemO) {
            if (itemO === null) {
              let err = '无法查询订单'
              return callback(err)
            } else {
              return callback(err, itemO)
            }
          })
        } else {
          let err = 'PD数据错误，无法查询医生或患者'
          return callback(err)
        }
      } else {
        let err = '数据错误，请检查输入'
        return callback(err)
      }
    }],
    refund: ['getOrder', function (results, callback) {
      if (Number(results.updatePD.status) === 8) {
        let money = results.getOrder.money || null
        if (Number(money) !== 0) {
          let params = {
            orderNo: results.getOrder.orderNo, // 退款单号
            role: 'appPatient'
          }
          wechatCtrl.wechatRefundAsync(params, function (err, result) {
            let refundResults = result.refund.xml || null
            if (refundResults !== null) {
              if (refundResults.return_code === 'SUCCESS' && refundResults.result_code === 'SUCCESS') {
                return callback(err, {msg: '退款成功', data: refundResults, code: 0})
              } else {
                return callback(err, {msg: '退款失败', data: refundResults, code: 1})
              }
            } else {
              return callback(err, {msg: '退款失败', data: refundResults, code: 1})
            }
          })
        } else {
          return callback(null, {msg: '金额为零，无需退款', code: 0})
        }
      } else {
        return callback(null, {msg: '无需退款', code: 0})
      }
    }],
    textMessage: ['refund', function (results, callback) {
      let params
      if (Number(results.updatePD.status) === 7) { // 拒绝退款 cancelReject
        params = {
          type: 'cancelReject',
          phoneNo: results.updatePD.patientId.phoneNo,
          bookingDay: new Date(results.updatePD.bookingDay).toLocaleDateString(),
          bookingTime: results.updatePD.bookingTime,
          doctorName: results.updatePD.doctorId.name,
          orderNo: results.getOrder.orderNo // 订单号
        }
      } else if (Number(results.updatePD.status) === 8) { // 同意退款 cancelRefund
        params = {
          type: 'cancelRefund',
          phoneNo: results.updatePD.patientId.phoneNo,
          bookingDay: new Date(results.updatePD.bookingDay).toLocaleDateString(),
          bookingTime: results.updatePD.bookingTime,
          doctorName: results.updatePD.doctorId.name,
          orderNo: results.getOrder.orderNo, // 退款订单号
          orderMoney: results.getOrder.money || 0 // 退款金额订单
        }
      } else if (Number(results.updatePD.status) === 9) { // 通知停诊
        return callback(null, '通知患者状态更新完毕')
      } else {
        let err = '数据错误，请检查输入'
        return callback(err)
      }
      alluserCtrl.servicesMessageAsync(params, function (err, result) {
        if (err) {
          return callback(null, {err: err, code: 1})
        } else {
          return callback(null, {data: result, code: 0})
        }
      })
    }],
    messageAndNews: ['refund', function (results, callback) {
      let bookingDay = new Date(new Date(results.updatePD.bookingDay).toLocaleDateString())
      let PDTime
      if (results.updatePD.bookingTime === 'Morning') {
        PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
      } else if (results.updatePD.bookingTime === 'Afternoon') {
        PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
      }
      let newData = {
        userId: results.updatePD.patientId.userId,
        sendBy: results.updatePD.doctorId.userId,
        type: 7,
        messageId: 'M' + results.updatePD.diagId + 'REVIEW',
        readOrNot: 0,
        time: now,
        title: PDTime + ',' + results.updatePD.doctorId.name + '医生面诊服务停诊'
      }
      if (Number(results.updatePD.status) === 7) {
        newData['description'] = '尊敬的用户，您提交“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊取消申请未通过审核，如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
      }
      if (Number(results.updatePD.status) === 8) {
        newData['description'] = '尊敬的用户，您已成功取消“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊服务，所付款项' + Number(results.getOrder.money || 0) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
      }
      if (Number(results.updatePD.status) === 9) {
        return callback(null, '通知患者状态更新完毕')
      } 
      let newmessage = new Message(newData)
      newmessage.save(function (err, newInfo) {
        if (err) {
          return callback(err)
        }
        let query = {userId: results.updatePD.patientId.userId, sendBy: results.updatePD.doctorId.userId}
        let obj = {
          $set: {
            messageId: 'M' + results.updatePD.diagId + 'REVIEW',
            readOrNot: 0,
            userRole: 'patient',
            type: 7,
            time: now,
            title: PDTime + ',' + results.updatePD.doctorId.name + '面诊停诊'
          }
        }
        if (Number(results.updatePD.status) === 7) {
          obj['$set']['description'] = '尊敬的用户，您提交“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊取消申请未通过审核，如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
        }
        if (Number(results.updatePD.status) === 8) {
          obj['$set']['description'] = '尊敬的用户，您已成功取消“' + results.updatePD.doctorId.name + '医生，' + PDTime + '时段”的面诊服务，所付款项' + Number(results.getOrder.money || 0) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + results.getOrder.orderNo + '。'
        }
        News.updateOne(query, obj, function (err, upnews) {
          return callback(err, upnews)
        }, {upsert: true})
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({err: err, code: 1, data: results})
    } else {
      let msg = []
      if (Number(results.refund.code) === 1) {
        msg.push('退款失败')
      }
      if (Number(results.textMessage.code) === 1) {
        msg.push('短信发送失败')
      }
      return res.json({code: 0, msg: msg, data: results})
    }
  })
}
