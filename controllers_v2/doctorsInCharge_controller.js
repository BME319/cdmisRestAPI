var DoctorsInCharge = require('../models/doctorsInCharge')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var request = require('request')
var webEntry = require('../settings').webEntry
var Order = require('../models/order')

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
  DoctorsInCharge.updateOne(query, upObj, function (err, upDIC) {
    if (err) {
      return res.status(500).send(err)
    }
    if (upDIC === null) {
      return res.json({results: '找不到该患者'})
    } else {
      // return res.json({results: '审核完成'})
      if (Number(upDIC.invalidFlag) === 1) { // 审核结果为通过，给医生账户充钱
        req.body.docInChaObject = upDIC
        next()
      } else if (Number(upDIC.invalidFlag) === 3) { // 审核结果为拒绝，调用退款接口
        // return res.json({msg: '测试中，待退款', code: 0})
        let queryO = {docInChaObject: upDIC._id}
        Order.getOne(queryO, function (err, itemO) { // 获取相应订单的订单号
          if (err) {
            return res.status(500).send(err)
          } else {
            let orderNo = itemO.orderNo
            let money = itemO.money || null
            if (Number(money) !== 0) {
              request({ // 调用微信退款接口
                url: 'http://' + webEntry.domain + '/api/v2/wechat/refund',
                method: 'POST',
                body: {'role': 'appPatient', 'orderNo': orderNo, 'token': req.body.token},
                json: true
              }, function (err, response) {
                if (err) {
                  return res.status(500).send(err)
                } else if ((response.body.results || null) === null) {
                  return res.json({msg: '审核成功，已拒绝患者但退款失败，微信接口调用失败，请联系管理员', data: upDIC, code: 1})
                } else if (response.body.results.xml.return_code === 'SUCCESS' && response.body.results.xml.return_msg === 'OK') {
                  return res.json({msg: '审核成功，已拒绝患者并退款', data: upDIC, code: 0})
                } else {
                  return res.json({msg: '审核成功，已拒绝患者但退款失败，请联系管理员', data: upDIC, code: 1})
                }
              })
            } else {
              return res.json({msg: '审核成功，已拒绝患者', data: upDIC, code: 0})
            }
          }
        })
      }
    }
  }, {new: true})
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
  if (chargeDuration == null) {
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
  DpRelation.update(query, upObj, function (err, upRelation1) {
    if (err) {
      return res.status(422).send(err)
    } else if (upRelation1.n === 0) {
      let dpRelationData = {
        doctorId: doctorObjectId
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err)
        }
        DpRelation.update(query, upObj, function (err, upRelation2) {
          if (err) {
            return res.status(422).send(err)
          } else if (upRelation2.nModified === 0) {
            return res.json({result: '未申请成功！请检查输入是否符合要求！'})
          } else if (upRelation2.nModified === 1) {
            // return res.json({result: '申请成功，请等待审核！', results: upRelation2})
            next()
          }
        })
      })
    } else if (upRelation1.nModified === 0) {
      return res.json({result: '未申请成功！请检查输入是否符合要求！'})
    } else if (upRelation1.nModified === 1) {
      // return res.json({result: '申请成功，请等待审核！', results: upRelation1})
      next()
    }
  }, {new: true})
}

// 2017-07-20 YQC
// 获取患者的主管医生服务的状态
// exports.getDoctorsInCharge = function (req, res) {
//   let patientObjectId = req.body.patientObject._id
//   let queryDIC = {patientId: patientObjectId}
//   let opts = ''
//   let fields = {'_id': 0}
//   let populate = {path: 'doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}

//   DoctorsInCharge.getSome(queryDIC, function (err, itemsDIC) {
//     if (err) {
//       return res.status(500).send(err)
//     } else if (itemsDIC.length !== 0) {
//       for (let i = 0; i < itemsDIC.length; i++) {
//         if (Number(itemsDIC[i].invalidFlag) === 0) {
//           return res.json({message: '已申请主管医生，请等待审核!'})
//         } else if (Number(itemsDIC[i].invalidFlag) === 1) {
//           return res.json({message: '当前已有主管医生!', results: itemsDIC[i]})
//         }
//       }
//     }
//     res.json({message: '当前无主管医生且无申请!'})
//   }, opts, fields, populate)
// }
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
  let queryP = {patientId: patientObjectId, invalidFlag: 1}
  DoctorsInCharge.getOne(queryP, function (err, itemDIC) {
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
      DoctorsInCharge.update(queryP, upObj, function (err, upDIC) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upDIC.nModified === 0) {
          return res.status(400).json({results: '解绑医生不成功'})
        } else if (upDIC.nModified === 1) {
          // return res.json({results: '解绑医生成功'})
          req.body.doctorObjectId = itemDIC.doctorId
          next()
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
