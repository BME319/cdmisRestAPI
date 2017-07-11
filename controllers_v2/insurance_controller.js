<<<<<<< HEAD
var	config = require('../config'),
  InsuranceMsg = require('../models/insuranceMsg')

// 更新或插入保险消息 2017-04-18 GY
exports.updateInsuranceMsg = function (req, res, next) {
  if (req.body.doctorId == null || req.body.doctorId == '') {
    return res.json({result: '请填写doctorId'})
  }
  if (req.body.patientId == null || req.body.patientId == '') {
    return res.json({resutl: '请填写patientId'})
  }
  if (req.body.insuranceId == null || req.body.insuranceId == '') {
    return res.json({resutl: '请填写insuranceId'})
  }

	// 为调用insertMessage方法传入参数
  req.body.userId = req.body.patientId
  req.body.sendBy = req.body.doctorId
	// 定义保险消息类型为5
  req.body.type = 5
	// return res.json({result: req.body})

  if (req.body.insDescription == null || req.body.insDescription == '') {
    var insDescription = ''
  }
  if (req.body.tiem == null || req.body.time == '') {
    var time = new Date()
  } else {
    var time = new Date(req.body.time)
=======
// var config = require('../config')
var InsuranceMsg = require('../models/insuranceMsg')

// 更新或插入保险消息 2017-04-18 GY
exports.updateInsuranceMsg = function (req, res, next) {
  if (req.body.doctorId === null || req.body.doctorId === '') {
    return res.json({result: '请填写doctorId'})
  }
  if (req.body.patientId === null || req.body.patientId === '') {
    return res.json({resutl: '请填写patientId'})
  }
  if (req.body.insuranceId === null || req.body.insuranceId === '') {
    return res.json({resutl: '请填写insuranceId'})
  }

 // 为调用insertMessage方法传入参数
  req.body.userId = req.body.patientId
  req.body.sendBy = req.body.doctorId
 // 定义保险消息类型为5
  req.body.type = 5
 // return res.json({result: req.body})

  if (req.body.insDescription === null || req.body.insDescription === '') {
    var insDescription = ''
  }
  var time
  if (req.body.tiem === null || req.body.time === '') {
    time = new Date()
  } else {
    time = new Date(req.body.time)
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }

  var doctorId = req.body.doctorId
  var patientId = req.body.patientId

<<<<<<< HEAD
	// return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
=======
 // return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
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

  InsuranceMsg.update(query, upObj, function (err, upinsurance) {
    if (err) {
      return res.status(422).send(err.message)
    }
<<<<<<< HEAD
    if (upinsurance.n == 0) {
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
      } else if (upIns.nModified == 0) {
        return res.json({result: '未成功修改！请检查输入是否符合要求！', results: upIns, flag: '0'})
      } else if (upIns.nModified == 1) {
						// return res.json({result:'修改成功', results: upIns, flag:'0'});
        next()
      }
					// return res.json({result:upIns});
    }, {new: true})
      })
    }		else if (upinsurance.nModified == 0) {
      return res.json({result: '未成功修改！请检查输入是否符合要求！', results: upinsurance, flag: '1'})
    } else if (upinsurance.nModified == 1) {
			// return res.json({result:'修改成功', results: upinsurance, flag:'1'});
      next()
    }
		// res.json({results: upinsurance});
=======
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
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }, {new: true})
}
exports.updateMsgCount = function (req, res, next) {
  var doctorId = req.body.doctorId
  var patientId = req.body.patientId
  var query = {doctorId: doctorId, patientId: patientId}
  var opts = ''
  var fields = ''
  var populate = ''

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}

    	var upObj = {count: item.insuranceMsg.length}
    	InsuranceMsg.updateOne(query, upObj, function (err, upInsMsg) {
      if (err) {
        return res.status(422).send(err.message)
      } else if (upInsMsg == null) {
        return res.json({result: '修改失败'})
      }			else {
				// return res.json({result: '修改成功', results:upInsMsg});
=======
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
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
        req.body.InsMsg = upInsMsg
        next()
      }
    }, {new: true})

<<<<<<< HEAD
    	// res.json({results:item});
=======
     // res.json({results:item});
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }, opts, fields, populate)
}

// 获取保险推送信息
exports.getInsMsg = function (req, res) {
<<<<<<< HEAD
  if (req.query.doctorId == null || req.query.doctorId == '') {
    return res.json({result: '请填写doctorId'})
  }
  if (req.query.patientId == null || req.query.patientId == '') {
=======
  if (req.query.doctorId === null || req.query.doctorId === '') {
    return res.json({result: '请填写doctorId'})
  }
  if (req.query.patientId === null || req.query.patientId === '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    return res.json({resutl: '请填写patientId'})
  }

  var query = {
    doctorId: req.query.doctorId,
    patientId: req.query.patientId
  }
  var opts = ''
  var fields = ''
  var populate = ''

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}
    	if (item == null) {
    		return res.json({results: null})
    	}    	else {
    		return res.json({results: item})
    	}
=======
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({results: null})
    } else {
      return res.json({results: item})
    }
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }, opts, fields, populate)
}

exports.setPrefer = function (req, res) {
  var preference = {
    status: req.body.status,
    time: req.body.date
  }
  var query = {patientId: req.body.patientId}

<<<<<<< HEAD
  InsuranceMsg.update(query, { $set: { preference: preference} }, function (err, item) {
=======
  InsuranceMsg.update(query, { $set: {preference: preference} }, function (err, item) {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    if (err) {
      return res.status(500).send(err.errmsg)
    }
        // if(item === null){
        //  return res.status(400).send('Patient do not exist!');
        // }
        // console.log(item);
    res.json({results: 'success'})
  }, {upsert: true})
}

exports.getPrefer = function (req, res) {
  var query = {patientId: req.query.patientId}

  InsuranceMsg.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
<<<<<<< HEAD
        	return res.status(400).send('Patient do not exist!')
=======
      return res.status(400).send('Patient do not exist!')
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    }
    res.json({results: item})
  })
}
