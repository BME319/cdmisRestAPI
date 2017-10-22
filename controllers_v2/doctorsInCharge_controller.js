var DoctorsInCharge = require('../models/doctorsInCharge')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
// var request = require('request')
// var webEntry = require('../settings').webEntry
var Order = require('../models/order')
var async = require('async')

var alluserCtrl = require('../controllers_v2/alluser_controller')
var wechatCtrl = require('../controllers_v2/wechat_controller')

// var getToken = function (headers) {
//   if (headers && headers.authorization) {
//     var authorization = headers.authorization
//     var part = authorization.split(' ')
//     if (part.length === 2) {
//       var token = part[1]
//       return token
//     } else {
//       return null
//     }
//   } else {
//     return null
//   }
// }

/**
医生端
*/
// 获取申请主管医生服务的患者列表 2017-07-19 YQC
exports.getPatientsToReview = function (req, res) {
  let doctorId = req.session.userId
  let queryD = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    }
    if (itemD === null) {
      return res.json({results: '医生不存在！'})
    }
    let doctorObjectId = itemD._id

    let queryR = {doctorId: doctorObjectId}
    let opts = ''
    let fields = {'_id': 0, 'patientsInCharge': 1}
    let populate = {path: 'patientsInCharge.patientId', select: {'_id': 0, 'userId': 1, 'photoUrl': 1, 'name': 1, 'gender': 1, 'birthday': 1, 'class': 1, 'class_info': 1}}
    DpRelation.getOne(queryR, function (err, itemR) {
      if (err) {
        return res.status(500).send(err)
      } else if (itemR === null) {
        return res.json({results: '无主管医生服务待审核的患者！', numberToReview: 0})
      } else {
        let listToFilter = itemR.patientsInCharge || []
        let patientsList = []
        for (let i = 0; i < listToFilter.length; i++) {
          // console.log(Number(listToFilter[i].invalidFlag))
          if (Number(listToFilter[i].invalidFlag) === 0) {
            patientsList.push(listToFilter[i])
          }
        }
        if (patientsList.length === 0) {
          return res.json({results: '无主管医生服务待审核的患者！', numberToReview: patientsList.length})
        } else {
          res.json({results: patientsList, numberToReview: patientsList.length})
        }
      }
    }, opts, fields, populate)
  })
}

// 通过或拒绝主管医生申请：patient, dpRelation表数据修改
// 输入：患者ID；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
// 2017-07-21 YQC
exports.reviewPatientInCharge = function (req, res, next) {
  let reviewResult = req.body.reviewResult || null
  if (reviewResult === null) {
    return res.json({code: 1, msg: '请填写reviewResult!'})
  }
  let rejectReason = req.body.rejectReason || null
  if (reviewResult === 'reject') {
    if (rejectReason === null) {
      return res.json({code: 1, msg: '请填写rejectReason!'})
    }
  } else if (reviewResult !== 'consent') {
    return res.json({code: 1, msg: '请检查reviewResult的输入'})
  }
  let patientObjectId = req.body.patientObject._id
  let queryDIC = {patientId: patientObjectId, invalidFlag: 0}
  DoctorsInCharge.getOne(queryDIC, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      return res.json({results: '该患者未申请主管医生服务'})
    } else {
      let chargeDuration = itemDIC.length
      let start = new Date()
      let end = new Date(String(start))
      end.setMonth(start.getMonth() + chargeDuration)
      let doctorObjectId = req.body.doctorObject._id
      let queryR = {doctorId: doctorObjectId, patientsInCharge: {$elemMatch: {$and: [{patientId: patientObjectId}, {invalidFlag: 0}]}}}
      let upObj
      if (reviewResult === 'reject') {
        upObj = {
          $set: {
            'patientsInCharge.$.invalidFlag': 3,
            'patientsInCharge.$.rejectReason': rejectReason
          }
        }
      } else if (reviewResult === 'consent') {
        upObj = {
          $set: {
            'patientsInCharge.$.invalidFlag': 1,
            'patientsInCharge.$.start': start,
            'patientsInCharge.$.end': end
          }
        }
      }
      DpRelation.update(queryR, upObj, function (err, upRelation) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upRelation.n === 0) {
          return res.json({results: '找不到该医生'})
        } else if (upRelation.nModified !== 1) {
          return res.json({results: '该患者未申请主管医生服务'})
        } else {
          // return res.json({results: '更新患者申请成功'})
          req.body.serviceStart = start
          req.body.serviceEnd = end
          next()
        }
      })
    }
  })
}

exports.updateDoctorInCharge = function (req, res, next) {
  let start = req.body.serviceStart
  let end = req.body.serviceEnd
  let patientObjectId = req.body.patientObject._id
  let reviewResult = req.body.reviewResult || null
  let rejectReason = req.body.rejectReason || null

  let query = {patientId: patientObjectId, invalidFlag: 0}
  let upObj
  if (reviewResult === 'reject') {
    upObj = {
      $set: {
        invalidFlag: 3,
        rejectReason: rejectReason
      }
    }
  } else if (reviewResult === 'consent') {
    upObj = {
      $set: {
        invalidFlag: 1,
        start: start,
        end: end
      }
    }
  }
  let populate = [
    {path: 'doctorId', select: {_id: 0, name: 1}},
    {path: 'patientId', select: {_id: 0, phoneNo: 1}}
  ]
  DoctorsInCharge.updateOne(query, upObj, function (err, upDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (upDIC === null) {
      return res.json({results: '找不到该患者'})
    } else {
      let queryO = {docInChaObject: upDIC._id}
      Order.getOne(queryO, function (err, itemO) {
        if (err) {
          return res.status(500).send(err)
        } else if (itemO !== null) {
          if (Number(upDIC.invalidFlag) === 1) { // 审核结果为通过，给医生账户充钱
            // 更新alluser DIC字段
            let queryP = {_id: patientObjectId}
            let upObjP = {$set: {doctorInCharge: req.body.doctorObject._id}}
            Alluser.updateOne(queryP, upObjP, function (err, upP) {
              if (err) {
                return res.status(500).send(err)
              } else {
                req.body.docInChaObject = upDIC
                if ((upDIC.patientId || null) !== null) {
                  if ((upDIC.patientId.phoneNo || null) !== null) {
                    let params = {
                      type: 'consent',
                      phoneNo: upDIC.patientId.phoneNo,
                      doctorName: upDIC.doctorId.name,
                      start: new Date(upDIC.start).getFullYear() + '年' + (new Date(upDIC.start).getMonth() + 1) + '月' + new Date(upDIC.start).getDate() + '日',
                      end: new Date(upDIC.end).getFullYear() + '年' + (new Date(upDIC.end).getMonth() + 1) + '月' + new Date(upDIC.end).getDate() + '日',
                      orderNo: itemO.orderNo
                    }
                    alluserCtrl.servicesMessageAsync(params, function (err, results) {
                      if (err) {
                        console.log({msg: err, data: results, code: 1})
                      }
                    })
                  }
                }
                return next()
              }
            })
          } else if (Number(upDIC.invalidFlag) === 3) { // 审核结果为拒绝，调用退款接口
            let orderNo = itemO.orderNo
            let money = itemO.money || null
            if (Number(money) !== 0) {
              let params = {
                orderNo: orderNo, // 退款单号
                role: 'appPatient'
              }
              wechatCtrl.wechatRefundAsync(params, function (err, result) {
                if (err) {
                  console.log(new Date() + ' --- 主管医生审核拒绝，短信发送 --- ERROR: ' + err)
                } else {
                  let refundResults = result.refund.xml || null
                  if (refundResults !== null) {
                    if (refundResults.return_code === 'SUCCESS' && refundResults.result_code === 'SUCCESS') {
                      console.log(new Date() + ' --- 主管医生审核拒绝，短信发送 --- 用户"' + itemO.patientName + '"退款成功')
                    } else {
                      console.log(new Date() + ' --- 主管医生审核拒绝，短信发送 --- 用户"' + itemO.patientName + '"退款失败，订单号为"' + itemO.orderNo + '"')
                    }
                  } else {
                    console.log(new Date() + ' --- 主管医生审核拒绝，短信发送 --- 微信接口调用失败，用户"' + itemO.patientName + '"退款失败，订单号为"' + itemO.orderNo + '"')
                  }
                }
                if ((upDIC.patientId || null) !== null) {
                  if ((upDIC.patientId.phoneNo || null) !== null) {
                    let params = {
                      type: 'reject',
                      phoneNo: upDIC.patientId.phoneNo,
                      doctorName: upDIC.doctorId.name,
                      orderNo: itemO.orderNo, // 退款订单号
                      orderMoney: itemO.money, // 退款金额订单
                      reason: upDIC.rejectReason
                    }
                    alluserCtrl.servicesMessageAsync(params, function (err, results) {
                      if (err) {
                        console.log({msg: err, data: results, code: 1})
                      }
                      return res.json({msg: '审核成功，已拒绝患者', data: upDIC, code: 0})
                    })
                  }
                }
              })
            } else {
              return res.json({msg: '审核成功，已拒绝患者', data: upDIC, code: 0})
            }
          }
        } else {
          return res.json({msg: '数据错误，无法查询订单号', data: upDIC, code: 0})
        }
      })
    }
  }, {new: true}, populate)
}

/**
患者端
*/
// 2017-07-18 YQC
// 主管医生申请：patient, dpRelation表数据修改
// 输入：医生ID和购买时长；修改内容：alluser.doctorsInCharge, dpRelation.patientsInCharge
exports.addDoctorInCharge = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let chargeDuration = req.body.chargeDuration || null
  if (chargeDuration === null) {
    return res.json({result: '请填写chargeDuration!'})
  }
  let queryDIC = {doctorId: doctorObjectId, patientId: patientObjectId}
  DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemsDIC.length !== 0) {
      for (let iDIC = 0; iDIC < itemsDIC.length; iDIC++) {
        if (Number(itemsDIC[iDIC].invalidFlag) === 0) {
          return res.json({result: '已申请主管医生，请等待审核!'})
        } else if (Number(itemsDIC[iDIC].invalidFlag) === 1 && String(itemsDIC[iDIC].doctorId) === String(doctorObjectId)) {
          return res.json({result: '申请医生对象已是主管医生!'})
        }
      }
    }
    // new DIC
    let doctorInCharge = {
      patientId: patientObjectId,
      doctorId: doctorObjectId,
      dpRelationTime: new Date(),
      invalidFlag: 0,
      length: chargeDuration
    }
    let newDoctorInCharge = new DoctorsInCharge(doctorInCharge)
    newDoctorInCharge.save(function (err, doctorInChargeInfo) {
      if (err) {
        return res.status(500).send(err)
      } else {
        // return res.json({message: '新建成功', results: doctorInChargeInfo})
        req.body.dpRelationTime = doctorInChargeInfo.dpRelationTime
        req.body.docInChaObject = doctorInChargeInfo._id
        req.body.patientId = req.session.userId
        req.body.type = 4
        next()
      }
    })
  })
}

exports.addPatientInCharge = function (req, res, next) {
  let doctorObjectId = req.body.doctorObject._id
  let patientObjectId = req.body.patientObject._id
  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  let query = {doctorId: doctorObjectId}
  let upObj = {
    $push: {
      patientsInCharge: {
        patientId: patientObjectId,
        dpRelationTime: dpRelationTime,
        invalidFlag: 0,
        length: req.body.chargeDuration
      }
    }
  }
  DpRelation.updateOne(query, upObj, function (err, upRelation1) {
    if (err) {
      return res.status(422).send(err)
    } else {
      let params = {
        type: 'request',
        phoneNo: req.body.patientObject.phoneNo,
        doctorName: req.body.doctorObject.name,
        duration: req.body.chargeDuration + '个月' // 服务时长
      }
      alluserCtrl.servicesMessageAsync(params, function (err, results) {
        if (err) {
          console.log({msg: err, data: results, code: 1})
        }
        next()
      })
    }
  }, {new: true, upsert: true})
}

// 2017-07-20 YQC
// 获取患者的主管医生服务的状态
/**
  exports.getDoctorsInCharge = function (req, res) {
    let patientObjectId = req.body.patientObject._id
    let queryDIC = {patientId: patientObjectId}
    let opts = ''
    let fields = {'_id': 0}
    let populate = {path: 'doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}

    DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
      if (err) {
        return res.status(500).send(err)
      } else if (itemsDIC.length !== 0) {
        for (let i = 0; i < itemsDIC.length; i++) {
          if (Number(itemsDIC[i].invalidFlag) === 0) {
            return res.json({message: '已申请主管医生，请等待审核!'})
          } else if (Number(itemsDIC[i].invalidFlag) === 1) {
            return res.json({message: '当前已有主管医生!', results: itemsDIC[i]})
          }
        }
      }
      res.json({message: '当前无主管医生且无申请!'})
    }, opts, fields, populate)
  }
*/
exports.getDoctorsInCharge = function (req, res, next) {
  let patientObjectId = req.body.patientObject._id
  let queryDIC = {patientId: patientObjectId}
  let opts = ''
  let fields = {'_id': 0}
  let populate = {path: 'doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}

  DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemsDIC.length !== 0) {
      for (let i = 0; i < itemsDIC.length; i++) {
        if (Number(itemsDIC[i].invalidFlag) === 0) {
          return res.json({message: '已申请主管医生，请等待审核!'})
        } else if (Number(itemsDIC[i].invalidFlag) === 1) {
          // 用于区别是否是 vitalSign插入数据后进行警戒值提醒而获取主管医生 2017-08-22 lgf
          if (req.isOutOfRange) {
            req.body.userId = itemsDIC[i].doctorId.userId
            req.body.sendBy = 'System'
            // console.log('req.body.userId', req.body.userId)
            // 定义警戒值消息类型为2
            req.body.type = 2
            req.body.title = '警戒值提醒'
            req.body.description = req.body.patientObject.name + '患者的' + req.itemType + '项目不达标,测量值为' + req.measureData + ',该项正常值为' + req.recommend
            req.body.url = req.session.userId
            // console.log('req.body.description', req.body.description)
            return next()
          } else {
            return res.json({message: '当前已有主管医生!', results: itemsDIC[i]})
          }
        }
      }
    }
    res.json({message: '当前无主管医生且无申请!'})
  }, opts, fields, populate)
}

// 2017-07-20 YQC
// 删除主管医生
exports.deleteDoctorInCharge = function (req, res, next) {
  let patientObjectId = req.body.patientObject._id
  let query = {patientId: patientObjectId, invalidFlag: 1}
  DoctorsInCharge.getOne(query, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      return res.status(404).json({results: '患者当前无主管医生'})
    } else {
      let upObj = {
        $set: {
          invalidFlag: 2
        }
      }
      DoctorsInCharge.update(query, upObj, function (err, upDIC) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upDIC.nModified === 0) {
          return res.status(400).json({results: '解绑医生不成功'})
        } else if (upDIC.nModified === 1) {
          // return res.json({results: '解绑医生成功'})
          // 更新alluser DIC字段
          let queryP = {_id: patientObjectId}
          let upObjP = {$unset: {doctorInCharge: 1}}
          Alluser.updateOne(queryP, upObjP, function (err, upP) {
            if (err) {
              return res.status(500).send(err)
            } else {
              req.body.doctorObjectId = itemDIC.doctorId
              next()
            }
          })
        }
      })
    }
  })
}

exports.deletePatientInCharge = function (req, res) {
  let patientObjectId = req.body.patientObject._id
  let doctorObjectId = req.body.doctorObjectId
  let queryR = {doctorId: doctorObjectId, patientsInCharge: {$elemMatch: {$and: [{patientId: patientObjectId}, {invalidFlag: 1}]}}}
  let upObj = {
    $set: {
      'patientsInCharge.$.invalidFlag': 2
    }
  }
  DpRelation.update(queryR, upObj, function (err, upRelation) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upRelation.n === 0) {
      return res.json({results: '没有该医生的主管医生服务'})
    } else if (upRelation.nModified !== 1) {
      return res.json({results: '修改失败'})
    } else {
      // return res.json({results: '解绑患者成功'})
      return res.json({results: '取消主管医生服务成功'})
    }
  })
}

// 判断关系
exports.relation = function (req, res) {
  let patientId = req.session.userId
  let patientObjectId = req.body.patientObject._id
  let doctorObjectId = req.body.doctorObject._id
  let queryDIC = {
    patientId: patientObjectId,
    invalidFlag: 1,
    doctorId: doctorObjectId
  }
  let DICRelation
  let FDRelation
  DoctorsInCharge.getOne(queryDIC, function (err, itemDIC) {
    if (err) {
      return res.status(500).send(err)
    } else if (itemDIC === null) {
      DICRelation = 0
    } else {
      DICRelation = 1
    }
    let queryPFD = {
      userId: patientId,
      role: 'patient',
      doctors: {$elemMatch: {doctorId: doctorObjectId}}
    }
    Alluser.getOne(queryPFD, function (err, itemPFD) {
      if (err) {
        return res.status(500).send(err)
      } else if (itemPFD === null) {
        FDRelation = 0
      } else {
        FDRelation = 1
      }
      res.json({DIC: DICRelation, FD: FDRelation})
    })
  })
}

/**
过期取消主管关系
*/
exports.autoRelease = function () {
  console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '"主管服务过期自动取消"进程开始 ---')
  let today = new Date(new Date().toLocaleDateString())
  let endOfToday = new Date(today)
  endOfToday.setHours(today.getHours() + 24)
  let query = {end: {$lt: endOfToday}, invalidFlag: 1}
  let upObj = {$set: {invalidFlag: 2}}
  let opts = ''
  let fields = {_id: 1, patientId: 1, doctorId: 1}
  let populate = [
    {path: 'patientId', select: {'_id': 1, 'name': 1}},
    {path: 'doctorId', select: {'_id': 1, 'name': 1}}
  ]
  let autoReleaseFun = function (item, callback) {
    async.parallel({
      updateDIC: function (callback) {
        DoctorsInCharge.updateOne({_id: item._id}, upObj, function (err, upDIC) {
          callback(err)
        })
      },
      updateDPR: function (callback) {
        if ((item.doctorId || null) !== null && (item.patientId || null) !== null) {
          let queryR = {doctorId: item.doctorId._id, patientsInCharge: {$elemMatch: {$and: [{patientId: item.patientId._id}, {invalidFlag: 1}]}}}
          let upObjR = {
            $set: {
              'patientsInCharge.$.invalidFlag': 2
            }
          }
          DpRelation.updateOne(queryR, upObjR, function (err, upRelation) {
            callback(err)
          })
        } else {
          console.log(new Date() + ' --- 主管服务过期自动取消 --- ' + 'The DIC entry ' + item._id + ' has ERROR!')
        }
      },
      updateAlluser: function (callback) { // 更新alluser DIC字段
        let queryP = {_id: item.patientId._id}
        let upObjP = {$unset: {doctorInCharge: 1}}
        Alluser.updateOne(queryP, upObjP, function (err, upP) {
          callback(err)
        })
      }
    }, function (err) {
      if (err) {
        console.log(new Date() + ' --- 主管服务过期自动取消 --- ' + item.doctorId.name + '医生与' + item.patientId.name + '患者主管服务到期取消失败，原因为：\n' + err)
      } else {
        console.log(new Date() + ' --- 主管服务过期自动取消 --- ' + item.doctorId.name + '医生与' + item.patientId.name + '患者主管服务到期取消成功')
      }
      callback(err)
    })
  }

  DoctorsInCharge.getSome(query, function (err, items) { // 获取需要自动核销的PD
    if (err) {
      console.log(new Date() + ' --- 主管服务过期自动取消 --- ' + err)
    } else if (items.length > 0) {
      async.each(items, autoReleaseFun, function (err) {
        if (err) {
          console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '"主管服务过期自动取消"进程结束，任务未全部完成，原因为：\n' + err)
        } else {
          console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '"主管服务过期自动取消"进程结束，任务全部完成 ---')
        }
      })
    } else {
      console.log(new Date() + ' --- ' + new Date().toLocaleDateString() + '无主管服务过期,"主管服务过期自动取消"进程结束 ---')
    }
  }, opts, fields, populate)
}
