var Report = require('../models/report')

// 获取报表 2017-07-24 wf
exports.getReport = function (req, res) {
  var userRole = req.session.role
  var userId = req.session.userId
  var patientId = req.query.patientId || null
  var type = req.query.type || null
  var time = req.query.time || null
  var itemType = req.query.itemType || null
  var query = {}
  if (userRole === 'patient') {
    query['userId'] = userId
  } else {
    if (patientId !== null && patientId !== '') {
      query['userId'] = patientId
    }
  }
  if (type !== null && type !== '') {
    query['type'] = type
  }
  if (time !== null && time !== '') {
    query['time'] = time
  }
  if (itemType !== null && itemType !== '') {
    query['itemType'] = itemType
  }
  var opts = {} // 'sort': '-time'
  // console.log(query)
  Report.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log(items)
    res.json({results: items})
  }, opts)
}
// y医生更新报表 2017-07-24 wf
// 不想更新多条时务必确保patientId、type、time、itemType有输入
exports.updateReport = function (req, res) {
  var userRole = req.session.role
  // var userId = req.session.userId
  var patientId = req.body.patientId || null
  var type = req.body.type || null
  var time = req.body.time || null
  var itemType = req.body.itemType || null

  var recommendValue1 = req.body.recommendValue1 || null
  var recommendValue2 = req.body.recommendValue2 || null
  var recommendValue3 = req.body.recommendValue3 || null
  var recommendValue4 = req.body.recommendValue4 || null
  var recommendValue11 = req.body.recommendValue11 || null
  var recommendValue12 = req.body.recommendValue12 || null
  var recommendValue13 = req.body.recommendValue13 || null
  var recommendValue14 = req.body.recommendValue14 || null

  var labTestNewItem = req.body.labTestNewItem || null
  var labTest = req.body.labTest || null
  var doctorReport = req.body.doctorReport || null
  // reportType 0-正常 1-信息缺失 2-异常 3-修改
  var reportType = req.body.reportType || null
  var query = {}
  if (userRole === 'patient') {
    return res.status(405).send('not authorized')
  } else {
    if (patientId !== null && patientId !== '') {
      query['userId'] = patientId
    }
  }
  // console.log(req.body.patientId)
  // console.log(query)
  if (type !== null && type !== '') {
    query['type'] = type
  }
  if (time !== null && time !== '') {
    query['time'] = time
  }
  if (itemType !== null && itemType !== '') {
    query['itemType'] = itemType
  }
  var upData = {}
  if (recommendValue1 !== null && recommendValue1 !== '') {
    upData['recommendValue1'] = recommendValue1
  }
  if (recommendValue2 !== null && recommendValue2 !== '') {
    upData['recommendValue2'] = recommendValue2
  }
  if (recommendValue3 !== null && recommendValue3 !== '') {
    upData['recommendValue3'] = recommendValue3
  }
  if (recommendValue4 !== null && recommendValue4 !== '') {
    upData['recommendValue4'] = recommendValue4
  }
  if (recommendValue11 !== null && recommendValue11 !== '') {
    upData['recommendValue11'] = recommendValue11
  }
  if (recommendValue12 !== null && recommendValue12 !== '') {
    upData['recommendValue12'] = recommendValue12
  }
  if (recommendValue13 !== null && recommendValue13 !== '') {
    upData['recommendValue13'] = recommendValue13
  }
  if (recommendValue14 !== null && recommendValue14 !== '') {
    upData['recommendValue14'] = recommendValue14
  }
  if (labTestNewItem !== null && labTestNewItem !== '') {
    upData['labTestNewItem'] = labTestNewItem
  }
  if (reportType !== null && reportType !== '') {
    reportType = Number(reportType)
    if (reportType === 0) {
      upData['labTest'] = '本周行血常规、尿常规、肝肾功能、血脂等检查未见明显异常'
      upData['doctorReport'] = '本周血压、体重、尿量、体温、血糖等控制良好，记录完整。建议下周控制血压、体重、血糖范围。建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
    }
    if (reportType === 1) {
      upData['labTest'] = '本周未行血常规、尿常规、肝肾功能、血脂等检查'
      upData['doctorReport'] = '本周血压、体重、尿量、体温、血糖记录不完整（低于一周2天），请及时记录。建议下周控制血压、体重、血糖范围，建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
    }
    if (reportType === 2) {
      upData['labTest'] = '本周行血常规、尿常规、肝肾功能、血脂等检查，提示肾功能、血红蛋白异常，（具体数值），请及时咨询医生或门诊就诊'
      upData['doctorReport'] = '本周发生高血压／少尿／体重过重／高血糖XX次。建议下周控制血压、体重、血糖范围。建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
    }
    if (reportType === 3) {
      if (labTest !== null && labTest !== '') {
        upData['labTest'] = labTest
      }
      if (doctorReport !== null && doctorReport !== '') {
        upData['doctorReport'] = doctorReport
      }
    }
  }
  console.log(upData)
  Report.update(query, upData, function (err, upmessage) {
    if (err) {
      if (res !== undefined) {
        return res.status(422).send(err.message)
      }
    }
    if (upmessage.n !== 0 && upmessage.nModified === 0) {
      if (res !== undefined) {
        return res.json({result: '未修改！请检查修改目标是否与原来一致！', results: upmessage})
      }
    }
    if (upmessage.n !== 0 && upmessage.nModified !== 0) {
      if (upmessage.n === upmessage.nModified) {
        if (res !== undefined) {
          return res.json({result: '全部更新成功', results: upmessage})
        }
      }
      if (res !== undefined) {
        return res.json({result: '未全部更新！', results: upmessage})
      }
    }
  })
}
