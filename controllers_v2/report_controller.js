// import parallel from 'async/parallel'
var async = require('async')
var Report = require('../models/report')
var Compliance = require('../models/compliance')

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

// 获取患者当前周月季年的测量记录 2017-07-26 lgf
exports.getVitalSigns = function (req, res) {
  var userRole = req.session.role
  var userId = req.session.userId
  var patientId = req.query.patientId || null
  var type = req.query.type || null
  var timeTemp = req.query.time || null
  var code = req.query.code || null
  var showType = req.query.showType || null // 周月季年
  var query = {}
  var query2 = {}
  if (showType !== null && showType !== '') {
    let startTime
    let startTimeTemp
    let currentTime = new Date(timeTemp)
    // console.log(currentTime)
    if (timeTemp !== null && timeTemp !== '') {
      if (showType === 'week') {
        let currentTimeDay = currentTime.getDay()
        console.log(currentTimeDay)
        startTimeTemp = new Date(currentTime - (currentTimeDay - 1) * 24 * 3600 * 1000)
        startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '08', '00', '00')  // 本周一零点
      }
      if (showType === 'month') {
        startTimeTemp = new Date(currentTime)
        startTimeTemp.setDate(1)
        console.log(startTimeTemp.getDate())
        startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '08', '00', '00')
      }
      if (showType === 'season') {
        let startTimeTempY = currentTime.getFullYear()
        let startTimeTempM = currentTime.getMonth()
        let startTimeTempD = currentTime.getDate()
        startTimeTempM = getQuarterStartMonth(startTimeTempM)
        startTime = new Date(startTimeTempY, startTimeTempM, startTimeTempD, '08', '00', '00')
        startTime.setDate(1)
      }
      if (showType === 'year') {
        startTime = new Date(currentTime)
        startTime.setMonth(0)
        startTime.setDate(1)
        startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '08', '00', '00')
      }
      console.log(startTime)
    }
    query = {
      'date': {$gte: startTime, $lt: currentTime} // >= <
    }
    query2 = {
      'date': {$gte: startTime, $lt: currentTime} // >= <
    }
  }
  if (userRole === 'patient') {
    query['userId'] = userId
    query2['userId'] = userId
  } else {
    if (patientId !== null && patientId !== '') {
      query['userId'] = patientId
      query2['userId'] = patientId
    } else {
      return res.json({result: '请填写patientId!'})
    }
  }
  if (type !== null && type !== '') {
    query['type'] = type
    query2['type'] = type
  }
  if (code !== null && code !== '') {
    query['code'] = code
    query2['code'] = code
  }
  // console.log(query)
  var opts = {'sort': '+date'}
  var fields = {
    '_id': 0,
    'userId': 0,
    'type': 0,
    'code': 0,
    'status': 0,
    '__v': 0
  }
  if (code === 'BloodPressure') {
    Compliance.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      // console.log(items)
      let dataBP = []
      let recordTimeTemp = []
      for (let i = 0; i < items.length; i++) {
        dataBP.push(items[i])
      }
      let dataSBP = []         // 收缩压 SBP
      let dataDBP = []         // 舒张压 DBP
      // 记录不为空
      if (dataBP.length !== 0) {
        for (let n = 0; n < dataBP.length; n++) {
          let str = dataBP[n].description
        // 一条记录中有多次测量数据
          let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
          let strArr2 = str.split(',')
          let strArr
          if (strArr1.length >= strArr2.length) {
            strArr = strArr1
          } else {
            strArr = strArr2
          }
          // print(dataBP[n].description)
          // print('strArr.length', strArr.length)
          for (let k = 0; k < strArr.length; k++) {
            dataSBP.push(Number(strArr[k].substr(0, str.indexOf('/'))))
            dataDBP.push(Number(strArr[k].substr(str.indexOf('/') + 1)))
            recordTimeTemp.push(new Date(dataBP[n].date))
          }
        }
      }
      let dateAndTime = {dataSBP, dataDBP, recordTimeTemp}
      res.json({results: dateAndTime})
    }, opts, fields)
  } else if (code === 'PeritonealDialysis') {
    let dataUF = [] // 腹膜超滤
    let dataUFTemp = []
    let dataUFAll = [] // 每天腹膜超滤总量
    let dataVol = []  // 尿量
    let dataVolTemp = []
    let dataVolAll = [] // 每天尿量总量
    let dataPV = []  // 腹膜出量
    let dataPVTemp = []
    let recordTimeTemp = []
    let recordTimeAll = []

    // 读取尿量
    query2.code = 'Vol'
    let recordTimeTemp1 = []
    let recordTimeAll1 = []
    console.log(query)
    console.log(query2)

    async.parallel([
      Compliance.getSome(query, function (err, items) {
        console.log('1')
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        // console.log(items)
        for (let i = 0; i < items.length; i++) {
          dataUF.push(items[i])
        }
        // 记录不为空
        if (dataUF.length !== 0) {
          for (let n = 0; n < dataUF.length; n++) {
            let str = dataUF[n].description
            // 一条记录中有多次测量数据
            let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
            let strArr2 = str.split(',')
            let strArr
            if (strArr1.length >= strArr2.length) {
              strArr = strArr1
            } else {
              strArr = strArr2
            }
            for (let k = 0; k < strArr.length; k++) {
              dataUFTemp.push(Number(strArr[k]))
              recordTimeTemp.push(new Date(dataUF[n].date))
            }
          }
          // console.log('recordTimeTemp', recordTimeTemp)
          if (recordTimeTemp.length === 1) {
            dataUFAll.push(dataUFTemp[0])
            recordTimeAll.push(recordTimeTemp[0])
          } else {
            let recordTime = new Date(recordTimeTemp[0])
            let tempUF = 0
            for (let n = 0; n < recordTimeTemp.length; n++) {
              if (recordTimeTemp[n].getTime() === recordTime.getTime()) {  // 时间的比较
                tempUF += dataUFTemp[n]
              } else {
                dataUFAll.push(tempUF)
                recordTimeAll.push(recordTime)
                tempUF = dataUFTemp[n]
              }
              recordTime = new Date(recordTimeTemp[n])
              // console.log('tempUF', tempUF)
              // console.log(dataUFAll)
              // console.log(recordTime)
              // console.log(recordTimeAll)
            }
            dataUFAll.push(tempUF)
            recordTimeAll.push(recordTime)
          }
        }
        console.log('dataUFAll1', dataUFAll)
        console.log('recordTimeAll', recordTimeAll)
        let UFdate = {dataUFAll, recordTimeAll}
        // res.json({results: UFdate})
      }, opts, fields),
      Compliance.getSome(query2, function (err, items) {
        console.log('2')
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        // console.log(items)
        for (let i = 0; i < items.length; i++) {
          dataVol.push(items[i])
        }
        // 记录不为空
        if (dataVol.length !== 0) {
          for (let n = 0; n < dataVol.length; n++) {
            let str = dataVol[n].description
          // 一条记录中有多次测量数据
            let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
            let strArr2 = str.split(',')
            let strArr
            if (strArr1.length >= strArr2.length) {
              strArr = strArr1
            } else {
              strArr = strArr2
            }
            for (let k = 0; k < strArr.length; k++) {
              dataVolTemp.push(Number(strArr[k]))
              recordTimeTemp1.push(new Date(dataVol[n].date))
            }
          }
          // console.log('dataVolTemp', dataVolTemp)
          // console.log('recordTimeTemp1', recordTimeTemp1)
          if (recordTimeTemp1.length === 1) {
            dataVolAll.push(dataVolTemp[0])
            recordTimeAll1.push(recordTimeTemp1[0])
          } else {
            let recordTime = new Date(recordTimeTemp1[0])
            let tempVol = 0
            for (let n = 0; n < recordTimeTemp1.length; n++) {
              if (recordTimeTemp1[n].getTime() === recordTime.getTime()) {  // 时间的比较
                tempVol += dataVolTemp[n]
              } else {
                dataVolAll.push(tempVol)
                recordTimeAll1.push(recordTime)
                tempVol = dataVolTemp[n]
              }
              recordTime = new Date(recordTimeTemp1[n])
              // console.log('tempVol', tempVol)
              // console.log(dataVolAll)
              // console.log(recordTime)
              // console.log(recordTimeAll1)
            }
            dataVolAll.push(tempVol)
            recordTimeAll1.push(recordTime)
          }
        }
        console.log('dataVolAll', dataVolAll)
        console.log('recordTimeAll1', recordTimeAll1)
        let VolDate = {dataVolAll, recordTimeAll1}
        // res.json({results: VolDate})
      }, opts, fields)
    ], function (err, results) {
      if (err) {
        return res.status(500).send(err.errmsg)
      } else {
        console.log('results', results)
      }
      // for (let i = 0; i < Things.length; i++) {
      //   Things[i]
      // }
    })
  } else {
    Compliance.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      // console.log(items)
      let data = []
      let recordTimeTemp = []
      for (let i = 0; i < items.length; i++) {
        data.push(items[i])
      }
      let dataTemp = []
      // 记录不为空
      if (data.length !== 0) {
        for (let n = 0; n < data.length; n++) {
          let str = data[n].description
        // 一条记录中有多次测量数据
          let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
          let strArr2 = str.split(',')
          let strArr
          if (strArr1.length >= strArr2.length) {
            strArr = strArr1
          } else {
            strArr = strArr2
          }
          // print(data[n].description)
          // print('strArr.length', strArr.length)
          for (let k = 0; k < strArr.length; k++) {
            dataTemp.push(Number(strArr[k]))
            recordTimeTemp.push(new Date(data[n].date))
          }
        }
      }
      let dateAndTime = {dataTemp, recordTimeTemp}
      res.json({results: dateAndTime})
    }, opts, fields)
  }
}

// 获得本季度的开端月份
function getQuarterStartMonth (nowMonth) {
  let quarterStartMonth = 0
  if (nowMonth < 3) {
    quarterStartMonth = 0
  }
  if (nowMonth > 2 && nowMonth < 6) {
    quarterStartMonth = 3
  }
  if (nowMonth > 5 && nowMonth < 9) {
    quarterStartMonth = 6
  }
  if (nowMonth > 8) {
    quarterStartMonth = 9
  }
  return quarterStartMonth
}
