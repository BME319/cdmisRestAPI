var request = require('request')
var config = require('../config')
var Patient = require('../models/patient')
var VitalSign = require('../models/vitalSign')
var Compliance = require('../models/compliance')
var Device = require('../models/device')

// 绑定设备
exports.bindingDevice = function (req, res) {
  var userId = req.session.userId || null
  var appId = req.body.appId || null
  var twoDimensionalCode = req.body.twoDimensionalCode || null

  // 无效输入报错
  if (userId === null || userId === '' || appId === null || appId === '' || twoDimensionalCode === null || twoDimensionalCode === '') {
    return res.status(400).send('invalid input')
  }

  // 发送请求
  request({
    method: 'POST',
    url: config.third_party_data.bloodpressure.get_device_url,
    body: 'appId=' + appId + '&twoDimensionalCode=' + twoDimensionalCode
  }, function (err, response, body) {
    // 对错误的处理
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // 将JSON字符串body变为对象
    body = JSON.parse(body)
    // errorCode为0表示绑定成功，对返回的设备信息进行存储
    if (body.errorCode === 0) {
      var sn = body.deviceInfo.sn
      var imei = body.deviceInfo.imei
      var deviceId = sn + imei

      var deviceData = {
        userId: userId,
        deviceId: deviceId,
        deviceType: 'sphygmomanometer',
        deviceName: '血压计',
        deviceInfo: body.deviceInfo
      }
      var newDevice = new Device(deviceData)
      // 输入callback,若无错，返回callback(null, deviceItem),若有错，返回callback(err)
      newDevice.save(function (err, Info) {
        // 对错误进行处理
        if (err) {
          // 处理duplicate key错误(errcode为11000)
          if (err.code === 11000) {
            // 获取该deviceID的设备信息
            Device.getOne({deviceId: deviceId}, function (err, item) {
              // 报错
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              if (item) {
                // 获取对应患者信息
                Patient.getOne({userId: item.userId}, function (err, patient) {
                  if (err) {
                    return res.status(500).send(err.errmsg)
                  }
                  // 若患者存在，则发送患者姓名；否则发送'患者不存在'
                  if (patient) {
                    res.json({results: patient.name})
                  } else {
                    res.json({results: '患者不存在'})
                  }
                  // res.json({results: patient.name + '已绑定该设备'});
                })
              } else {
                // res.json({results: '该设备已被绑定'});
                res.json({results: ''})
              }
            })
          } else {
            // 向前端发送500错误msg
            return res.status(500).send(err.errmsg)
          }
        } else {
          // 无错误，向前端发送设备信息
          res.json({results: body})
        }
      })
    } else {
      // send error msg to the front end
      res.json({results: body})
    }
  })
}

// 解绑设备
exports.debindingDevice = function (req, res) {
  var userId = req.session.userId || null
  var appId = req.body.appId || null
  var sn = req.body.sn || null
  var imei = req.body.imei || null
  // 无效输入报错
  if (userId === null || userId === '' || appId === null || appId === '' || sn === null || sn === '' || imei === null || imei === '') {
    return res.status(400).send('invalid input')
  }

  // 发送请求
  request({
    method: 'POST',
    url: config.third_party_data.bloodpressure.debinding_device_url,
    body: 'appId=' + appId + '&sn=' + sn
    // headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded'
    // },
  }, function (err, response, body) {
    // 对错误的处理
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // 将JSON字符串body变为对象
    body = JSON.parse(body)
    // errorCode为0表示解绑成功，移除数据库中信息
    if (body.errorCode === 0) {
      var deviceId = sn + imei
      var query = {userId: userId, deviceId: deviceId}

      Device.removeOne(query, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        res.json({results: body})
      })
    } else {
      // send error msg to the front end
      // res.statusCode = 500;
      res.json({results: body})
    }
  })
}

// 接收血压数据
exports.receiveBloodPressure = function (req, res) {
  // console.log('receiveBloodPressure')
  // var res_data = req.body;
  // console.log(res_data);
  var sn = req.body.sn
  var imei = req.body.imei
  var deviceId = sn + imei
  var query = {deviceId: deviceId}
  // console.log(sn)

  var results = {
    'code': 10,
    'status': 'fail',
    'msg': '提交失败',
    'data': {}
  }
  // 获取该deviceID的设备信息
  Device.getOne(query, function (err, item) {
    if (err) {
    // return res.status(500).send(err.errmsg);
      console.log('err')
      res.json(results)
    }
    if (item == null) {
    // res.json({results: {errorCode: 10, requestStatus: '设备不存在'}});
      console.log('null')
      res.json(results)
    } else {
      // 获取设备对应的患者ID
      var userId = item.userId
      // console.log(userId)
      var querypatient = {
        userId: userId
      }
      // 获取患者信息
      Patient.getOne(querypatient, function (err, patient) {
        if (err) {
        // return res.status(500).send(err.errmsg);
          console.log('err2')
          res.json(results)
        }
        if (patient == null) {
        // return res.status(400).send('user not exist');
          console.log('null2')
          res.json(results)
        } else {
          // 若患者存在，保存血压和心率数据到数据库
          saveBPdata(patient, req, results, res)
        }
      })
    }
  })
}

// 获取设备信息
exports.getDeviceInfo = function (req, res) {
  var userId = req.session.userId || null
  var deviceType = req.query.deviceType || null

  if (userId === null || userId === '') {
    return res.status(400).send('invalid input')
  }

  var query = {userId: userId}
  if (deviceType != null && deviceType !== '') {
    query['deviceType'] = deviceType
  }

  Device.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

// 保存血压等数据
function saveBPdata (patient, req, results, res) {
  var datetime = req.body.time
  var year = datetime.substring(0, 4)
  var month = datetime.substring(4, 6)
  var day = datetime.substring(6, 8)
  var hour = datetime.substring(8, 10)
  var minite = datetime.substring(10, 12)
  var second = datetime.substring(12, 14)

  var query = {
    patientId: patient._id,
    type: '血压',
    code: '血压',
    date: year + '-' + month + '-' + day
  }

  var upObj = {
    $push: {
      data: {
        time: year + '-' + month + '-' + day + ' ' + hour + ':' + minite + ':' + second,
        value: req.body.systolicpressure,
        value2: req.body.diastolicpressure
      }
    }
  }
  // console.log(query)
  // console.log(upObj)

  // 更新血压记录
  VitalSign.update(query, upObj, function (err, updata) {
    if (err) {
      // return res.status(422).send(err.message);
      res.json(results)
    }
    // console.log(updata)
    // if (updata.nModified == 0) {
    // console.log('err3');
    // res.json(results);
    // }
    // else if (updata.nModified == 1) {
    // results.code = 1;
    // results.status = 'success';
    // results.msg = '提交成功';
    // console.log('err4');
    // res.json(results);
    // }
    var query = {
      patientId: patient._id,
      type: '心率',
      code: '心率',
      date: year + '-' + month + '-' + day
    }

    var upObj = {
      $push: {
        data: {
          time: year + '-' + month + '-' + day + ' ' + hour + ':' + minite + ':' + second,
          value: req.body.pulse
        }
      }
    }
    // 更新心率记录
    VitalSign.update(query, upObj, function (err, updata) {
      if (err) {
        // return res.status(422).send(err.message);
        res.json(results)
      }
      // console.log(updata)

      // if (err) {
      //   // return res.status(422).send(err.message);
      //   res.json(results)
      // }

      var complianceQuery1 = {
        userId: patient.userId,
        type: 'Measure',
        code: 'HeartRate',
        date: new Date(year + '-' + month + '-' + day)
      }

      var upObj = {
        status: 0,
        description: req.body.pulse
      }
      // 更新compliance
      Compliance.update(complianceQuery1, upObj, function (err, upCompliance) {
        if (err) {
          return res.status(500).send(err.message)
        }
        if (upCompliance == null) {
          res.statusCode = 500
          return res.json({result: '修改失败！'})
        }

        var complianceQuery2 = {
          userId: patient.userId,
          type: 'Measure',
          code: 'BloodPressure',
          date: new Date(year + '-' + month + '-' + day)
        }

        Compliance.getOne(complianceQuery2, function (err, complianceitem) {
          if (err) {
            return res.status(500).send('查询失败')
          }
          // 查询不到，需要新建一个条目
          if (complianceitem == null) {
            var complianceData = {
              userId: patient.userId,
              type: 'Measure',
              code: 'BloodPressure',
              date: new Date(year + '-' + month + '-' + day),
              status: 1,
              description: req.body.systolicpressure + '/' + req.body.diastolicpressure
            }
            // return res.json({result:complianceData});
            var newCompliance = new Compliance(complianceData)
            newCompliance.save(function (err, complianceInfo) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              results.code = 1
              results.status = 'success'
              results.msg = '提交成功'
              // console.log('提交成功')
              res.json(results)
            })
          } else if (complianceitem != null) {
            // 查询到条目，添加data
            var upObj = {
              status: 0,
              description: complianceitem.description + ',' + req.body.systolicpressure + '/' + req.body.diastolicpressure
            }
            Compliance.updateOne(complianceQuery2, upObj, function (err, upCompliance) {
              if (err) {
                return res.status(500).send(err.message)
              }
              if (upCompliance == null) {
                res.statusCode = 500
                return res.json({result: '修改失败！'})
              }
              results.code = 1
              results.status = 'success'
              results.msg = '提交成功'
              // console.log('提交成功')
              res.json(results)
            })
          }
        })
      }, {upsert: true})
    }, {upsert: true})
  }, {upsert: true})
}
