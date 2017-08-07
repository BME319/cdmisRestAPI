// var config = require('../config')
var InsuranceMsg = require('../models/insuranceMsg')
// var Alluser = require('../models/alluser')
var Policy = require('../models/policy')

// 更新或插入保险消息 ,医生向患者推送 2017-04-18 GY
exports.updateInsuranceMsg = function (req, res, next) {
  // if (req.body.doctorId === null || req.body.doctorId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写doctorId'})
  // }
  if (req.body.patientId === null || req.body.patientId === '' || req.body.patientId === undefined) {
    return res.json({resutl: '请填写patientId'})
  }

  if (req.body.insuranceId === null || req.body.insuranceId === '' || req.body.insuranceId === undefined) {
    return res.json({resutl: '请填写insuranceId'})
  }

 // 为调用insertMessage方法传入参数，患者从message中查看推送信息
  req.body.userId = req.body.patientId
  // req.body.sendBy = req.body.doctorId
  req.body.sendBy = req.session.userId
 // 定义保险消息类型为5
  req.body.type = 5
 // return res.json({result: req.body})

  if (req.body.insDescription === null || req.body.insDescription === '' || req.body.insDescription === undefined) {
    var insDescription = ''
  }
  var time
  if (req.body.time === null || req.body.time === '' || req.body.time === undefined) {
    time = new Date()
  } else {
    time = new Date(req.body.time)
  }

  // var doctorId = req.body.doctorId
  var doctorId = req.session.userId
  var patientId = req.body.patientId

 // return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
  var query = {doctorId: doctorId, patientId: patientId}
  var upObj = {
    $push: {
      insuranceMsg: {
        insuranceId: req.body.insuranceId,
        time: time,
        description: insDescription
      }
    }
  }
  // console.log(query)
  InsuranceMsg.update(query, upObj, function (err, upinsurance) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upinsurance.n === 0) {
      var insuranceData = {
        doctorId: doctorId,
        patientId: patientId
      }
      // return res.json({result:insuranceData});
      var newInsuranceMsg = new InsuranceMsg(insuranceData)
      newInsuranceMsg.save(function (err, insuranceInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        InsuranceMsg.update(query, upObj, function (err, upIns) {
          if (err) {
            return res.status(422).send(err.message)
          } else if (upIns.nModified === 0) {
            return res.json({result: '未成功修改！请检查输入是否符合要求！', results: upIns, flag: '0'})
          } else if (upIns.nModified === 1) {
            // return res.json({result:'修改成功', results: upIns, flag:'0'});
            next()
          }
          // return res.json({result:upIns});
          // }
        }, {new: true})
      })
    } else if (upinsurance.nModified === 0) {
      return res.json({result: '未成功修改！请检查输入是否符合要求！', results: upinsurance, flag: '1'})
    } else if (upinsurance.nModified === 1) {
   // return res.json({result:'修改成功', results: upinsurance, flag:'1'});
      next()
    }
  // res.json({results: upinsurance});
  }, {new: true})
}
exports.updateMsgCount = function (req, res, next) {
  // var doctorId = req.body.doctorId
  var doctorId = req.session.userId
  var patientId = req.body.patientId
  var query = {doctorId: doctorId, patientId: patientId}
  var opts = ''
  var fields = ''
  var populate = ''

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }

    var upObj = {count: item.insuranceMsg.length}
    InsuranceMsg.updateOne(query, upObj, function (err, upInsMsg) {
      if (err) {
        return res.status(422).send(err.message)
      } else if (upInsMsg === null) {
        return res.json({result: '修改失败'})
      } else {
    // return res.json({result: '修改成功', results:upInsMsg});
        req.body.InsMsg = upInsMsg
        next()
      }
    }, {new: true})

     // res.json({results:item});
  }, opts, fields, populate)
}

// 获取保险推送信息
exports.getInsMsg = function (req, res) {
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    return res.json({result: '请填写doctorId'})
  }
  // if (req.query.patientId === null || req.query.patientId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({resutl: '请填写patientId'})
  // }

  var query = {
    doctorId: req.query.doctorId,
    // patientId: req.query.patientId
    patientId: req.session.userId
  }
  var opts = ''
  var fields = ''
  var populate = ''

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({results: null})
    } else {
      return res.json({results: item})
    }
  }, opts, fields, populate)
}

// 设置保险购买意向
// 添加新建policy条目 2017-08-07 YQC
exports.setPrefer = function (req, res) {
  var preference = {
    status: req.body.status,
    time: req.body.date
  }
  // console.log(req.session.userId)
  // var query = {patientId: req.body.patientId}
  var query = {patientId: req.session.userId}
  // console.log(query)

  InsuranceMsg.update(query, { $set: {preference: preference} }, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      let queryP = {
        patientId: req.body.patientObject._id
      }
      Policy.getSome(queryP, function (err, items) {
        if (err) {
          return res.status(500).send(err)
        } else {
          let inProcessNo = 0
          for (let policyItem in items) {
            if (items[policyItem].status === 1 || items[policyItem].status === 2 || items[policyItem].status === 0) {
              inProcessNo = inProcessNo + 1
            }
          }
          if (inProcessNo !== 0) {
            return res.json({msg: '已设置意向，请等候保险专员联系'})
          } else {
            var policyData = {
              patientId: req.body.patientObject._id,
              status: 0,
              followUps: [{
                time: new Date(),
                type: 0,
                content: '该患者设置了保险购买意向，请尽快分配保险专员进行沟通联系。'
              }]
            }
            var newPolicy = new Policy(policyData)
            newPolicy.save(function (err, PInfo) {
              if (err) {
                return res.status(500).send(err)
              } else {
                return res.json({msg: '设置意向成功，请等候保险专员联系'})
              }
            })
          }
        }
      })
    }
  }, {upsert: true})
}

// 获取保险购买意向
exports.getPrefer = function (req, res) {
  // var query = {patientId: req.query.patientId}
  var query = {patientId: req.session.userId}

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.status(400).send('Patient do not exist!')
    }
    res.json({results: item})
  })
}
