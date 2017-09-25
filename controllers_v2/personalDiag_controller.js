var PersonalDiag = require('../models/personalDiag')
var Alluser = require('../models/alluser')
// var commonFunc = require('../middlewares/commonFunc')
var Order = require('../models/order')
var Account = require('../models/account')
var request = require('request')
var webEntry = require('../settings').webEntry
var Message = require('../models/message')
var News = require('../models/news')

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
exports.cancelBookedPdsStep1 = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let now = new Date()
  let query = {}
  let queryU = {}
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
      status: {$in: [0, 6]},
      $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
    }
    queryU = {
      doctorId: doctorObjectId,
      status: 0,
      $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
    }
    if (new Date(startOfStart) - now > 86400000) {
      req.body.query = query
      req.body.queryU = queryU
      return next()
      // query = {
      //   doctorId: doctorObjectId,
      //   status: 0,
      //   $and: [{bookingDay: {$gte: startOfStart}}, {bookingDay: {$lt: endOfEnd}}]
      // }
    } else { // 停诊时间紧迫
      // query = {
      //   doctorId: doctorObjectId,
      //   status: 0,
      //   $and: [{bookingDay: {$gte: endOfTomorrow}}, {bookingDay: {$lt: endOfEnd}}]
      // }
      let queryPD = {$and: [{bookingDay: {$gte: today}}, {bookingDay: {$lte: endOfTomorrow}}], doctorId: doctorObjectId, status: 0}
      PersonalDiag.update(queryPD, upObjPD, function (err, upItemsPD) { // 一天内停诊人工处理
        if (err) {
          return res.status(500).send(err)
        } else {
          if (upItemsPD.n !== upItemsPD.nModified) {
            return res.json({result: '停诊时间添加失败', results: upItemsPD})
          } else {
            req.body.query = query
            req.body.queryU = queryU
            return next()
          }
        }
      }, {multi: true})
    }
  } else { // 删除排班取消面诊
    query = {
      doctorId: doctorObjectId,
      status: {$in: [0, 6]},
      $or: [{bookingDay: new Date(req.body.nmd)}, {bookingDay: new Date(req.body.nnmd)}],
      bookingTime: req.body.time
    }
    queryU = {
      doctorId: doctorObjectId,
      status: 0,
      $or: [{bookingDay: new Date(req.body.nmd)}, {bookingDay: new Date(req.body.nnmd)}],
      bookingTime: req.body.time
    }
    if (new Date(req.body.nmd) - now > 86400000) {
      req.body.query = query
      req.body.queryU = queryU
      return next()
      // query = {
      //   doctorId: doctorObjectId,
      //   status: 0,
      //   $or: [{bookingDay: new Date(req.body.nmd)}, {bookingDay: new Date(req.body.nnmd)}],
      //   bookingTime: req.body.time
      // }
    } else { // 排班取消时间紧迫
      // query = {
      //   doctorId: doctorObjectId,
      //   status: 0,
      //   bookingDay: new Date(req.body.nnmd),
      //   bookingTime: req.body.time
      // }
      let queryPD = {
        doctorId: doctorObjectId,
        status: 0,
        bookingDay: new Date(req.body.nmd),
        bookingTime: req.body.time
      }
      PersonalDiag.update(queryPD, upObjPD, function (err, upItemsPD) { // 一天内排班取消人工处理
        if (err) {
          return res.status(500).send(err)
        } else {
          if (upItemsPD.n !== upItemsPD.nModified) {
            return res.json({result: '取消面诊添加失败', results: upItemsPD})
          } else {
            req.body.query = query
            req.body.queryU = queryU
            return next()
          }
        }
      }, {multi: true})
    }
  }
}

exports.cancelBookedPdsStep2 = function (req, res) {
  let upObj = {$set: {status: 4}}
  let opts = ''
  let fields = {_id: 1, doctorId: 1, patientId: 1, bookingDay: 1, bookingTime: 1, diagId: 1}
  let populate = [
    {path: 'doctorId', select: {_id: 0, name: 1, userId: 1}},
    {path: 'patientId', select: {_id: 0, phoneNo: 1, userId: 1}}
  ]
  PersonalDiag.getSome(req.body.query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else if (items.length === 0) {
      if (req.body.suspendFlag) {
        return res.json({msg: '停诊时间添加成功', code: 0})
      } else {
        return res.json({msg: '面诊排班删除成功', code: 0})
      }
    } else {
      PersonalDiag.update(req.body.queryU, upObj, function (err, upItems) {
        if (err) {
          return res.status(500).send(err)
        } else {
          let now = new Date()
          let nowstr = now.getFullYear() + add0(now.getMonth() + 1) + add0(now.getDate()) + add0(now.getHours()) + add0(now.getMinutes()) + add0(now.getSeconds())
          // return res.json({msg: '测试中，待退款', code: 0, data: items})
          for (let item in items) {
            let toRefund = items[item]
            // 调用退款接口
            let queryO = {perDiagObject: toRefund._id, paystatus: 2}
            Order.getOne(queryO, function (err, itemO) { // 获取相应订单的订单号
              if (err) {
                return res.status(500).send(err)
              } else if (itemO !== null) {
                let orderNo = itemO.orderNo
                let money = itemO.money || null
                if (Number(money) !== 0) {
                  request({ // 调用微信退款接口
                    url: 'http://' + webEntry.domain + '/api/v2/wechat/refund',
                    method: 'POST',
                    body: {'role': 'appPatient', 'orderNo': orderNo, 'token': (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token)},
                    json: true
                  }, function (err, responseR) {
                    if (err) {
                      console.log(itemO.doctorName + '医生取消面诊，用户"' + itemO.patientName + '"退款失败，订单号为"' + itemO.orderNo + '"')
                      console.log(err)
                    } else if ((responseR.body.results || null) === null) {
                      console.log(itemO.doctorName + '医生取消面诊，用户"' + itemO.patientName + '"退款失败（微信接口调用失败），订单号为"' + itemO.orderNo + '"')
                    } else if (responseR.body.results.xml.return_code === 'SUCCESS' && responseR.body.results.xml.return_msg === 'OK') {
                      // return res.json({msg: '取消成功，请等待退款通知', data: req.body.PDInfo, code: 0})
                      console.log(itemO.doctorName + '医生取消面诊，用户"' + itemO.patientName + '"退款成功')
                    } else {
                      // return res.json({msg: '取消成功，退款失败，请联系管理员', data: req.body.PDInfo, code: 1})
                      console.log(itemO.doctorName + '医生取消面诊，用户"' + itemO.patientName + '"退款失败，订单号为"' + itemO.orderNo + '"')
                    }
                  })
                } else {
                  console.log(itemO.doctorName + '医生取消面诊，用户"' + itemO.patientName + '"订单免费，无需退款')
                }
                if ((toRefund.patientId || null) !== null) {
                  if ((toRefund.patientId.phoneNo || null) !== null) {
                    request({ // 调用短信发送接口
                      url: 'http://' + webEntry.domain + '/api/v2/services/message',
                      method: 'POST',
                      body: {
                        'phoneNo': toRefund.patientId.phoneNo,
                        'doctorName': toRefund.doctorId.name,
                        'day': new Date(toRefund.bookingDay).toLocaleDateString(),
                        'time': toRefund.bookingTime,
                        'orderMoney': Number(money),
                        'orderNo': orderNo,
                        'token': (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token),
                        'cancelFlag': 1
                      },
                      json: true
                    }, function (err, responseM) {
                      if (err) {
                        console.log('用户"' + itemO.patientName + '"短信发送失败,服务器err')
                        console.log(err)
                      } else if (Number(responseM.body.results) === 0) {
                        console.log('用户"' + itemO.patientName + '"短信发送成功')
                      } else {
                        console.log('用户"' + itemO.patientName + '"短信发送失败,接口返回err')
                      }
                    })
                  }
                  let bookingDay = new Date(new Date(toRefund.bookingDay).toLocaleDateString())
                  let PDTime
                  if (toRefund.bookingTime === 'Morning') {
                    PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
                  } else if (toRefund.bookingTime === 'Afternoon') {
                    PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
                  }
                  let newData = {
                    userId: toRefund.patientId.userId,
                    sendBy: toRefund.doctorId.userId,
                    type: 7,
                    messageId: 'M' + nowstr + item,
                    readOrNot: 0,
                    time: now,
                    title: new Date(toRefund.bookingDay).toLocaleDateString() + ',' + toRefund.doctorId.name + '医生面诊服务停诊',
                    description: '您预约' + toRefund.doctorId.name + '医生的' + PDTime + '时段的面诊服务因医生停诊取消，所付款项' + Number(money) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + orderNo + '。'
                  }
                  let newmessage = new Message(newData)
                  newmessage.save(function (err, newInfo) {
                    if (err) {
                      console.log(err)
                    }
                    let query = {userId: toRefund.patientId.userId, sendBy: toRefund.doctorId.userId}
                    let obj = {
                      $set: {
                        messageId: 'M' + nowstr + item,
                        readOrNot: 0,
                        userRole: 'patient',
                        type: 7,
                        time: now,
                        title: new Date(toRefund.bookingDay).toLocaleDateString() + ',' + toRefund.doctorId.name + '面诊停诊',
                        description: '您预约' + toRefund.doctorId.name + '医生的' + PDTime + '时段的面诊服务因医生停诊取消，所付款项' + Number(money) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + orderNo + '。'
                      }
                    }
                    News.updateOne(query, obj, function (err, upnews) {
                      if (err) {
                        console.log('用户"' + itemO.patientName + '"消息推送失败')
                        console.log(err)
                      } else {
                        console.log('用户"' + itemO.patientName + '"消息推送成功')
                      }
                    }, {upsert: true})
                  })
                }
              } else {
                // console.log('order for ' + toRefund.diagId + ' no need to refund')
              }
            })
          }
          if (req.body.suspendFlag) {
            // console.log('停诊时间添加成功')
            return res.json({result: '停诊时间添加成功', code: 0})
          } else {
            // console.log('面诊排班删除成功')
            return res.json({result: '面诊排班删除成功', code: 0})
          }
        }
      }, {multi: true})
    }
  }, opts, fields, populate)
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
  let query = {diagId: diagId, status: 0}
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
        PersonalDiag.updateOne(query, upObj, function (err, upItem) {
          if (err) {
            return res.status(500).send(err)
          } else if (upItem.nModified === 0) {
            return res.status(304).json({msg: 'Not Modified', code: 1})
          } else {
            return res.status(201).json({msg: 'Cancel Request Received', code: 1, data: upItem})
          }
        }, {new: true})
      } else { // 直接退款
        let upObj = {$set: {status: 3}}
        PersonalDiag.updateOne(query, upObj, function (err, upItem) {
          if (err) {
            return res.status(500).send(err)
          } else if (upItem.nModified === 0) {
            return res.status(304).json({msg: 'Not Modified', code: 1})
          } else {
            // return res.json({results: '取消成功'})
            req.body.PDInfo = upItem
            next()
          }
        }, {new: true})
      }
    }
  })
}

exports.updatePDCapacityUp = function (req, res) {
  let doctorObjectId = req.body.PDInfo.doctorId
  let bookingDay = req.body.PDInfo.bookingDay
  let bookingTime = req.body.PDInfo.bookingTime

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
      // return res.json({msg: '测试中，待退款', code: 0})
      let queryO = {perDiagObject: req.body.PDInfo._id}
      Order.getOne(queryO, function (err, itemO) { // 获取相应订单的订单号
        if (err) {
          return res.status(500).send(err)
        } else if (itemO !== null) {
          let orderNo = itemO.orderNo
          let money = itemO.money || null
          if (Number(money) !== 0) {
            request({ // 调用微信退款接口
              url: 'http://' + webEntry.domain + '/api/v2/wechat/refund',
              method: 'POST',
              body: {'role': 'appPatient', 'orderNo': orderNo, 'token': (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token)},
              json: true
            }, function (err, response) {
              if (err) {
                return res.status(500).send(err)
              } else if ((response.body.results || null) === null) {
                return res.json({msg: '取消成功，微信退款接口调用失败，请联系管理员', data: req.body.PDInfo, code: 1})
              } else if (response.body.results.xml.return_code === 'SUCCESS' && response.body.results.xml.return_msg === 'OK') {
                return res.json({msg: '取消成功，请等待退款通知', data: req.body.PDInfo, code: 0})
              } else {
                return res.json({msg: '取消成功，退款失败，请联系管理员', data: req.body.PDInfo, code: 1})
              }
            })
          } else {
            return res.json({msg: '取消成功', data: req.body.PDInfo, code: 0})
          }
        } else {
          return res.json({msg: '取消成功，退款失败，无法查询订单号', data: req.body.PDInfo, code: 0})
        }
      })
    }
  }, opts)
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
    if (status !== 5 && status !== 6) {
      return res.json({msg: '请检查status输入', code: 1})
    } else {
      query = {status: status}
    }
  } else {
    query = {$or: [{status: 5}, {status: 6}]}
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

// // 人工处理面诊退款
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
  PersonalDiag.updateOne(queryPD, upObj, function (err, upPD) {
    if (err) {
      return res.status(500).send(err)
    } else if (upPD === null) {
      return res.json({msg: '数据错误，请检查输入', code: 1})
    } else if (Number(upPD.status) === 8) {
      let queryO = {perDiagObject: upPD._id}
      Order.getOne(queryO, function (err, itemO) {
        if (err) {
          return res.status(500).send(err)
        } else if (itemO !== null) {
          let orderNo = itemO.orderNo
          let money = itemO.money || null
          if (Number(money) !== 0) {
            request({ // 调用微信退款接口
              url: 'http://' + webEntry.domain + '/api/v2/wechat/refund',
              method: 'POST',
              body: {'role': 'appPatient', 'orderNo': orderNo, 'token': (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token)},
              json: true
            }, function (err, responseR) {
              if (err) {
                return res.status(500).send(err)
              } else if ((responseR.body.results || null) === null) {
                return res.json({msg: '同意患者退款，退款失败，微信接口调用失败，请联系管理员', code: 1})
              } else if (responseR.body.results.xml.return_code === 'SUCCESS' && responseR.body.results.xml.return_msg === 'OK') {
                return res.json({msg: '同意患者退款，退款成功', code: 0})
              } else {
                return res.json({msg: '同意患者退款，退款失败，请联系管理员', code: 1})
              }
            })
          }
        }
      })
    } else if (Number(upPD.status) === 7) {
      return res.json({msg: '拒绝患者退款，请联系患者表明拒绝理由', code: 0})
    } else if (Number(upPD.status) === 9) {
      return res.json({msg: '通知患者完毕', code: 0})
    } else {
      return res.json({msg: '数据错误，请检查输入', code: 1})
    }
  }, {new: true})
}
