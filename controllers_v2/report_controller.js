// import parallel from 'async/parallel'
var async = require('async')
var Report = require('../models/report')
var Compliance = require('../models/compliance')
var Alluser = require('../models/alluser')
var LabtestImport = require('../models/labtestImport')

// 获取报表 2017-07-24 wf  修改 2017-07-28 lgf
exports.getReport = function (req, res) {
  var userRole = req.session.role
  var userId = req.session.userId
  var patientId = req.query.patientId || null
  var type = req.query.showType || req.query.type || null
  var timeTemp = req.query.time || null
  var itemType = req.query.code || req.query.itemType || null
  var modify = req.query.modify || null
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
  } else {
    return res.json({result: '请填写type!'})
  }
  console.log('type', type)
  if (modify !== null && modify !== '') {
    modify = Number(modify)
  } else {
    modify = 0
    // return res.json({result: '请填写modify!'})
  }
  if (timeTemp !== null && timeTemp !== '') {
    let currentTime = new Date(timeTemp)
    let time
    let startTimeTemp
    let startTime
    let endTime
    if (type === 'week') {  // '周报'
      let currentTimeDay = currentTime.getDay()
      if (currentTimeDay === 0) { currentTimeDay = 7 } // 周日从0置为7
      startTimeTemp = new Date(currentTime - (currentTimeDay - 1) * 24 * 3600 * 1000)
      startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '00', '00', '00')  // 本周一零点
      while (modify !== 0) {
        endTime = new Date(startTime)
        startTime = new Date(endTime - 7 * 24 * 3600 * 1000)
        modify++
      }
      req.startTime = new Date(startTime)
      req.endTime = new Date(endTime)
      let startTimeYear = startTime.getFullYear()
      let startTimeMonth = startTime.getMonth() + 1
      let monthWeek = getMonthWeek(startTime.getDate())
      if (startTimeMonth < 10) { startTimeMonth = '0' + startTimeMonth }
      time = String(startTimeYear) + String(startTimeMonth) + '_' + String(monthWeek)
    }
    if (type === 'month') {  // '月报'
      startTimeTemp = new Date(timeTemp)
      startTimeTemp.setDate(1)
      startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '00', '00', '00')
      while (modify !== 0) {
        startTime = new Date(getLastMonthYestdy(new Date(startTime)))
        time = String(startTime.getFullYear()) + String(add0(startTime.getMonth() + 1))
        modify++
      }
    }
    if (type === 'season') {  // '季报'
      let startTimeTempY = currentTime.getFullYear()
      let startTimeTempM = currentTime.getMonth()
      let startTimeTempD = currentTime.getDate()
      startTimeTempM = getQuarterStartMonth(startTimeTempM)
      startTime = new Date(startTimeTempY, startTimeTempM, startTimeTempD, '00', '00', '00')
      startTime.setDate(1)
      while (modify !== 0) {
        startTime = new Date(getLastSeason(new Date(startTime)))
        let quarterTemp = getQuarter(startTime.getMonth())
        time = String(startTime.getFullYear()) + '_' + String(quarterTemp)
        modify++
      }
    }
    if (type === 'year') {  // '年报'
      startTime = new Date(currentTime)
      startTime.setMonth(0)
      startTime.setDate(1)
      startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
      while (modify !== 0) {
        startTime = new Date(startTime.getFullYear() - 1, startTime.getMonth(), startTime.getDate(), '00', '00', '00')
        time = String(startTime.getFullYear())
        modify++
      }
    }
    // console.log('currentTime', currentTime)
    // console.log('startTime', startTime)
    // console.log('endTime', endTime)
    // console.log('time', time)
    query['time'] = time
  } else {
    return res.json({result: '请填写time!'})
  }
  // console.log('typeof time', typeof (time))
  if (itemType !== null && itemType !== '') {
    query['itemType'] = itemType
  } else {
    return res.json({result: '请填写itemType!'})
  }
  var fields = {}
  var opts = {}
  var populate = {'path': 'patientId', 'select': 'class'}
  // console.log(query)
  Report.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log('item', item)
    // console.log('req.startTime', req.startTime)
    // console.log('req.endTime', req.endTime)
    if (item === null) {
      return res.json({results: '不存在该段时间的报告!'})
    } else {
      let doctorReport = ''
      let doctorComment = ''
      if (item.doctorReport.length !== 0) {
        let rows = item.doctorReport
        rows.sort(function (a, b) {
          return Date.parse(b.insertTime) - Date.parse(a.insertTime) // 时间降序
        })
        doctorReport = rows[0].content
      }
      if (item.doctorComment.length !== 0) {
        let rows = item.doctorComment
        rows.sort(function (a, b) {
          return Date.parse(b.insertTime) - Date.parse(a.insertTime) // 时间降序
        })
        doctorComment = rows[0].content
      }
      if (itemType === 'DoctorReport') {
        return res.json({results: {item, doctorReport, doctorComment}})
      } else {
        let flag = {flagBP: true, flagWeight: true, flagVol: true, flagT: true, flagHR: true, flagVA: false, flagPD: false}
        if (item.patientId.class === null || item.patientId.class === '' || item.patientId.class === undefined) {
          return res.json({results: '请填写患者肾病类型!'})
        } else {
          if (item.patientId.class === 'class_5') { flag.flagVA = true }
          if (item.patientId.class === 'class_6') { flag.flagPD = true }
          let lab = {SCr: '', GFR: '', PRO: '', ALB: '', HB: ''}
          if (item.labTestArray.length !== 0) {
            for (let i = 0; i < item.labTestArray.length; i++) {
              switch (item.labTestArray[i]._type) {
                case 'SCr':
                  lab.SCr = {
                    'max': item.labTestArray[i].max,
                    'min': item.labTestArray[i].min
                  }
                  break
                case 'GFR':
                  lab.GFR = {
                    'max': item.labTestArray[i].max,
                    'min': item.labTestArray[i].min
                  }
                  break
                case 'PRO':
                  lab.PRO = {
                    'max': item.labTestArray[i].max,
                    'min': item.labTestArray[i].min
                  }
                  break
                case 'ALB':
                  lab.ALB = {
                    'max': item.labTestArray[i].max,
                    'min': item.labTestArray[i].min
                  }
                  break
                case 'HB':
                  lab.HB = {
                    'max': item.labTestArray[i].max,
                    'min': item.labTestArray[i].min
                  }
                  break
              }
            }
          }
          let startTime = req.startTime
          let endTime = req.endTime
          return res.json({results: {item, lab, doctorReport, doctorComment, flag, startTime, endTime}})
        }
      }
    }
  }, opts, fields, populate)
}
// 医生更新报表 2017-07-24 wf  修改 2017-08-04 lgf
// 不想更新多条时务必确保patientId、type、time、itemType有输入
exports.updateReport = function (req, res) {
  var userRole = req.session.role
  // var userId = req.session.userId
  var patientId = req.body.patientId || null
  var type = req.body.type || null
  var time = req.body.time || null
  var data = req.body.data || null
  let currentTime = new Date()
  let index = []
  // var labTestNewItem = req.body.labTestNewItem || null
  // var labTest = req.body.labTest || null
  // var doctorReport = req.body.doctorReport || null
  // reportType 0-正常 1-信息缺失 2-异常 3-修改
  // var reportType = req.body.reportType || null
  // var recommendValue1 = req.body.recommendValue1 || null
  // var recommendValue2 = req.body.recommendValue2 || null
  // var recommendValue3 = req.body.recommendValue3 || null
  // var recommendValue4 = req.body.recommendValue4 || null
  // if (labTestNewItem !== null && labTestNewItem !== '') {
  //   upData['labTestNewItem'] = labTestNewItem
  // }
  if (data === null || data === '') {
    return res.json({result: '请填写医生建议!'})
  }
  for (let i = 0; i < data.length; i++) {
    let query = {}
    if (userRole === 'patient') {
      return res.status(405).send('not authorized')
    } else {
      if (patientId !== null && patientId !== '') {
        query['userId'] = patientId
      } else {
        return res.json({result: '请填写patientId!'})
      }
    }
    if (type !== null && type !== '') {
      query['type'] = type
    }
    if (time !== null && time !== '') {
      query['time'] = time
    }
    let recommendValue11 = -1
    let recommendValue12 = -1
    let recommendValue13 = -1
    let recommendValue14 = -1
    let doctorReport = ''  // 需要修改为读取历史记录
    switch (data[i].itemType) {
      case 'BloodPressure':
        recommendValue11 = Number(data[i].recommendValue11)
        recommendValue12 = Number(data[i].recommendValue12)
        recommendValue13 = Number(data[i].recommendValue13)
        recommendValue14 = Number(data[i].recommendValue14)
        if (type === 'week') { doctorReport = '建议下周控制血压范围' + recommendValue11 + '-' + recommendValue12 + '/' + recommendValue13 + '-' + recommendValue14 }
        if (type === 'month') { doctorReport = '建议下月控制血压范围' + recommendValue11 + '-' + recommendValue12 + '/' + recommendValue13 + '-' + recommendValue14 }
        if (type === 'season') { doctorReport = '建议下一季度控制血压范围' + recommendValue11 + '-' + recommendValue12 + '/' + recommendValue13 + '-' + recommendValue14 }
        if (type === 'year') { doctorReport = '建议下一年控制血压范围' + recommendValue11 + '-' + recommendValue12 + '/' + recommendValue13 + '-' + recommendValue14 }
        break
      case 'Weight':
        recommendValue11 = Number(data[i].recommendValue11)
        recommendValue12 = Number(data[i].recommendValue12)
        if (type === 'week') { doctorReport = '建议下周控制体重范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'month') { doctorReport = '建议下月控制体重范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'season') { doctorReport = '建议下一季度控制体重范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'year') { doctorReport = '建议下一年控制体重范围' + recommendValue11 + '-' + recommendValue12 }
        break
      case 'Vol':
        // recommendValue11 = Number(data[i].recommendValue11)
        recommendValue11 = 500
        break
      case 'Temperature':
        // recommendValue11 = Number(data[i].recommendValue11)
        recommendValue11 = 37.3
        break
      case 'HeartRate':
        recommendValue11 = Number(data[i].recommendValue11)
        recommendValue12 = Number(data[i].recommendValue12)
        if (type === 'week') { doctorReport = '建议下周控制心率范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'month') { doctorReport = '建议下月控制心率范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'season') { doctorReport = '建议下一季度控制心率范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'year') { doctorReport = '建议下一年控制心率范围' + recommendValue11 + '-' + recommendValue12 }
        break
      case 'PeritonealDialysis':
        recommendValue11 = Number(data[i].recommendValue11)
        recommendValue12 = Number(data[i].recommendValue12)
        if (type === 'week') { doctorReport = '建议下周控制超滤量或出量范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'month') { doctorReport = '建议下月控制超滤量或出量范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'season') { doctorReport = '建议下一季度控制超滤量或出量范围' + recommendValue11 + '-' + recommendValue12 }
        if (type === 'year') { doctorReport = '建议下一年控制超滤量或出量范围' + recommendValue11 + '-' + recommendValue12 }
        break
      case 'LabTest':
        doctorReport = data[i].doctorReport
        break
      case 'DoctorReport':
        doctorReport = data[i].doctorReport || null
        if (doctorReport === null || doctorReport === '') {
          return res.json({result: '请填写医生报告!'})
        }
        break
      default:
        return res.json({result: '请填写正确的测量项目名称!'})
    }
    query['itemType'] = data[i].itemType
    let doctorComment = data[i].doctorComment || ''  // doctorComment为选填,医生未填写默认为空
    // doctorReport\doctorComment均修改为记录历史小结和点评
    let upData = {
      $push: {
        doctorReport: {
          content: doctorReport,
          doctorId: req.userObject._id,
          insertTime: new Date(currentTime)
        },
        doctorComment: {
          content: doctorComment,
          doctorId: req.userObject._id,
          insertTime: new Date(currentTime)
        }
      }
    }
    if (recommendValue11 !== -1) {
      upData['recommendValue11'] = recommendValue11
    }
    if (recommendValue12 !== -1) {
      upData['recommendValue12'] = recommendValue12
    }
    if (recommendValue13 !== -1) {
      upData['recommendValue13'] = recommendValue13
    }
    if (recommendValue14 !== -1) {
      upData['recommendValue14'] = recommendValue14
    }
    console.log(query)
    console.log(upData)
    Report.updateOne(query, upData, function (err, upmessage) {
      if (err) {
        if (res !== undefined) {
          return res.status(422).send(err.message)
        }
      }
      index.push(i)
      if (index.length === data.length) {  // data内的数据全部更新完再输出结果
        if (upmessage === null) {
          return res.json({msg: '未修改！请检查项目填写是否正确！', data: {}, code: 1})
        } else {
          return res.json({msg: '修改成功！', data: {}, code: 0})
        }
        // if (upmessage.n !== 0 && upmessage.nModified === 0) {
        //   if (res !== undefined) {
        //     return res.json({msg: '未修改！请检查修改目标是否与原来一致！', data: upmessage, code: 0})
        //   }
        // }
        // if (upmessage.n !== 0 && upmessage.nModified !== 0) {
        //   if (upmessage.n === upmessage.nModified) {
        //     if (res !== undefined) {
        //       return res.json({msg: '全部更新成功', data: upmessage, code: 1})
        //     }
        //   }
        //   if (res !== undefined) {
        //     return res.json({msg: '未全部更新！', data: upmessage, code: 0})
        //   }
        // }
      }
    }, {upsert: true})
  }

  // if (reportType !== null && reportType !== '') {
  //   reportType = Number(reportType)
  //   if (reportType === 0) {
  //     upData['labTest'] = '本周行血常规、尿常规、肝肾功能、血脂等检查未见明显异常'
  //     upData['doctorReport'] = '本周血压、体重、尿量、体温、血糖等控制良好，记录完整。建议下周控制血压、体重、血糖范围。建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
  //   }
  //   if (reportType === 1) {
  //     upData['labTest'] = '本周未行血常规、尿常规、肝肾功能、血脂等检查'
  //     upData['doctorReport'] = '本周血压、体重、尿量、体温、血糖记录不完整（低于一周2天），请及时记录。建议下周控制血压、体重、血糖范围，建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
  //   }
  //   if (reportType === 2) {
  //     upData['labTest'] = '本周行血常规、尿常规、肝肾功能、血脂等检查，提示肾功能、血红蛋白异常，（具体数值），请及时咨询医生或门诊就诊'
  //     upData['doctorReport'] = '本周发生高血压／少尿／体重过重／高血糖XX次。建议下周控制血压、体重、血糖范围。建议用药方案调整为／请继续目前用药，定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**'
  //   }
  //   if (reportType === 3) {
  //     if (labTest !== null && labTest !== '') {
  //       upData['labTest'] = labTest
  //     }
  //     if (doctorReport !== null && doctorReport !== '') {
  //       upData['doctorReport'] = doctorReport
  //     }
  //   }
  // }
}

// 获取患者当前和历史周月季年的测量记录 2017-07-26 lgf
exports.getVitalSigns = function (req, res, next) {
  var userRole = req.session.role
  var userId = req.session.userId
  var patientId = req.query.patientId || null
  var type = req.query.type || null
  var timeTemp = req.query.time || null
  var code = req.query.code || null
  var showType = req.query.showType || null // 周月季年
  var modify = req.query.modify || null // 调用历史测量数据的标签，0 当前 -1 前一段 -2
  var query = {}
  var query2 = {}
  var queryL = {}
  if (modify !== null && modify !== '') {
    modify = Number(modify)
  } else {
    modify = 0  // 默认查询当前
    // return res.json({result: '请填写modify!'})
  }
  if (showType !== null && showType !== '') {
    if (timeTemp !== null && timeTemp !== '') {
      let startTime
      let startTimeTemp
      let currentTime = new Date(timeTemp)
      // let endTime = new Date(timeTemp)
      if (showType === 'week') {
        let currentTimeDay = currentTime.getDay()
        if (currentTimeDay === 0) { currentTimeDay = 7 } // 周日从0置为7
        startTimeTemp = new Date(currentTime - (currentTimeDay - 1) * 24 * 3600 * 1000)
        startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '00', '00', '00')  // 本周一零点
        // console.log('startTime', startTime)
      }
      if (showType === 'month') {
        startTimeTemp = new Date(timeTemp)
        startTimeTemp.setDate(1)
        // console.log(startTimeTemp.getDate())
        startTime = new Date(startTimeTemp.getFullYear(), startTimeTemp.getMonth(), startTimeTemp.getDate(), '00', '00', '00')
        console.log('startTime', startTime)
      }
      if (showType === 'season') {
        let startTimeTempY = currentTime.getFullYear()
        let startTimeTempM = currentTime.getMonth()
        let startTimeTempD = currentTime.getDate()
        startTimeTempM = getQuarterStartMonth(startTimeTempM)
        startTime = new Date(startTimeTempY, startTimeTempM, startTimeTempD, '00', '00', '00')
        startTime.setDate(1)
      }
      if (showType === 'year') {
        startTime = new Date(currentTime)
        startTime.setMonth(0)
        startTime.setDate(1)
        startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
      }
      query = {
        'date': {$gte: startTime, $lt: currentTime} // >= <
      }
      query2 = {
        'date': {$gte: startTime, $lt: currentTime} // >= <
      }
      queryL = {
        'time': {$gte: startTime, $lt: currentTime} // >= <
      }
    } else {
      return res.json({result: '请填写当前时间!'})
    }
  } else {
    return res.json({result: '请填写展示图表类型!'})
  }
  if (userRole === 'patient') {
    query['userId'] = userId
    query2['userId'] = userId
    queryL['userId'] = userId
  } else {
    if (patientId !== null && patientId !== '') {
      query['userId'] = patientId
      query2['userId'] = patientId
      queryL['userId'] = patientId
    } else {
      return res.json({result: '请填写patientId!'})
    }
  }
  if (type !== null && type !== '') {
    query['type'] = type
    query2['type'] = type
  } else {
    return res.json({result: '请填写任务类型!'})
  }
  if (code !== null && code !== '') {
    query['code'] = code
    query2['code'] = code
  } else {
    return res.json({result: '请填写检测项目!'})
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
  let query3 = {
    'userId': patientId || userId,
    'role': 'patient'
  }
  if (code === 'BloodPressure') {
    if (modify === 0) {
      async.parallel({
        one: function (callback) {
          Alluser.getOne(query3, function (err, item) {
            callback(err, item)
          })
        },
        two: function (callback) {
          Compliance.getSome(query, function (err, items) {
            callback(err, items)
          }, opts, fields)
        }
      }, function (err, results) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (results.one === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          // console.log(items)
          let dataBP = []
          let recordTimeTemp = []
          for (let i = 0; i < results.two.length; i++) {
            dataBP.push(results.two[i])
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
          let data1 = dataSBP
          let data2 = dataDBP
          let recordTime = recordTimeTemp
          let flag = {flagBP: true, flagWeight: true, flagVol: true, flagT: true, flagHR: true, flagVA: false, flagPD: false}
          if (results.one.class === null || results.one.class === '' || results.one.class === undefined) {
            return res.json({results: '请填写患者肾病类型!'})
          } else {
            if (results.one.class === 'class_5') { flag.flagVA = true }
            if (results.one.class === 'class_6') { flag.flagPD = true }
            return res.json({results: {item: {data1, data2, recordTime}, flag}})
          }
        }
      })
    } else {
      Alluser.getOne(query3, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          next()
        }
      })
    }
  } else if (code === 'PeritonealDialysis') {
    if (modify === 0) {
      let dataUF = [] // 腹膜超滤
      let dataUFTemp = []
      let dataUFAll = [] // 每天腹膜超滤总量
      let dataVol = []  // 尿量
      let dataVolTemp = []
      let dataVolAll = [] // 每天尿量总量
      let dataPV = []  // 腹膜出量
      let recordTimeTemp = []
      let recordTimeAll = []

      // 读取尿量
      query2.code = 'Vol'
      let recordTimeTemp1 = []
      let recordTimeAll1 = []
      // console.log(query)
      // console.log(query2)
      // 并行数据流
      async.parallel({
        one: function (callback) {
          Alluser.getOne(query3, function (err, item) {
            callback(err, item)
          })
        },
        originDataUF: function (callback) {
          Compliance.getSome(query, function (err, items) {
            callback(err, items)
          }, opts, fields)
        },
        originDataVol: function (callback) {
          Compliance.getSome(query2, function (err, items) {
            callback(err, items)
          }, opts, fields)
        }
      }, function (err, results) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (results.one === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          // console.log(results.originDataUF)
          // console.log(results.originDataVol)
          // 超滤量
          for (let i = 0; i < results.originDataUF.length; i++) {
            dataUF.push(results.originDataUF[i])
          }
          // console.log('dataUF', dataUF)
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
          // console.log('dataUFAll', dataUFAll)
          // console.log('recordTimeAll', recordTimeAll)
          // let ufData = {dataUFAll, recordTimeAll}

          // 尿量
          for (let i = 0; i < results.originDataVol.length; i++) {
            dataVol.push(results.originDataVol[i])
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
          // console.log('dataVolAll', dataVolAll)
          // console.log('recordTimeAll1', recordTimeAll1)
          // let volData = {dataVolAll, recordTimeAll1}

          // 出量 = 当天超滤总量 + 当天尿量总量
          let record
          for (let i = 0; i < dataUFAll.length; i++) {
            record = new Date(recordTimeAll[i])
            for (let j = 0; j < dataVolAll.length; j++) {
              if (record.getTime() === recordTimeAll1[j].getTime()) {
                dataPV.push(dataUFAll[i] + dataVolAll[j])
                // console.log('dataPV', dataPV)
                continue
              }
            }
          }
          let data1 = dataUFAll
          let data2 = dataPV
          let recordTime = recordTimeAll
          let flag = {flagBP: true, flagWeight: true, flagVol: true, flagT: true, flagHR: true, flagVA: false, flagPD: false}
          if (results.one.class === null || results.one.class === '' || results.one.class === undefined) {
            return res.json({results: '请填写患者肾病类型!'})
          } else {
            if (results.one.class === 'class_5') { flag.flagVA = true }
            if (results.one.class === 'class_6') { flag.flagPD = true }
            return res.json({results: {item: {data1, data2, recordTime}, flag}})
          }
        }
      })
    } else {
      Alluser.getOne(query3, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          next()
        }
      })
    }
  } else if (code === 'LabTest') {
    if (modify === 0) {
      let labTestData = []
      let labTestRecordTime = []
      for (let j = 0; j < 5; j++) {
        switch (j) {
          case 0:
            queryL['type'] = 'SCr'
            break
          case 1:
            queryL['type'] = 'GFR'
            break
          case 2:
            queryL['type'] = 'PRO'
            break
          case 3:
            queryL['type'] = 'ALB'
            break
          case 4:
            queryL['type'] = 'HB'
            break
        }
        let optsL = {'sort': '+time'}
        async.parallel({
          one: function (callback) {
            Alluser.getOne(query3, function (err, item) {
              callback(err, item)
            })
          },
          two: function (callback) {
            LabtestImport.getSome(queryL, function (err, items) {
              callback(err, items)
            }, optsL)
          }
        }, function (err, results) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (results.one === null) {
            return res.json({results: '不存在的患者ID!'})
          } else {
            let labTemp = []
            let labRecordTimeTemp = []
            if (results.two.length !== 0) {
              for (let n = 0; n < results.two.length; n++) {
                labTemp.push(results.two[n].value)
                labRecordTimeTemp.push(new Date(results.two[n].time))
              }
            }
            labTestData.push({j, labTemp})
            labTestRecordTime.push({j, labRecordTimeTemp})
            // console.log('j', j)
            // console.log('labTestData', labTestData)
            if (labTestData.length === 5) {
              let flag = {flagBP: true, flagWeight: true, flagVol: true, flagT: true, flagHR: true, flagVA: false, flagPD: false}
              if (results.one.class === null || results.one.class === '' || results.one.class === undefined) {
                return res.json({results: '请填写患者肾病类型!'})
              } else {
                if (results.one.class === 'class_5') { flag.flagVA = true }
                if (results.one.class === 'class_6') { flag.flagPD = true }
                // return res.json({results: {item: {data1, recordTime}, flag}})
              }
              for (let i = 0; i < labTestData.length; i++) {
                switch (Number(labTestData[i].j)) {
                  case 0:
                    var data1 = labTestData[i].labTemp
                    var recordTime = labTestRecordTime[i].labRecordTimeTemp
                    break
                  case 1:
                    var data2 = labTestData[i].labTemp
                    var recordTime2 = labTestRecordTime[i].labRecordTimeTemp
                    break
                  case 2:
                    var data3 = labTestData[i].labTemp
                    var recordTime3 = labTestRecordTime[i].labRecordTimeTemp
                    break
                  case 3:
                    var data4 = labTestData[i].labTemp
                    var recordTime4 = labTestRecordTime[i].labRecordTimeTemp
                    break
                  case 4:
                    var data5 = labTestData[i].labTemp
                    var recordTime5 = labTestRecordTime[i].labRecordTimeTemp
                    break
                }
              }
              return res.json({results: {item: {data1, data2, data3, data4, data5, recordTime, recordTime2, recordTime3, recordTime4, recordTime5}, flag}})
            }
          }
        })
      }
    } else {
      Alluser.getOne(query3, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          next()
        }
      })
    }
  } else {
    if (modify === 0) {
      async.parallel({
        one: function (callback) {
          Alluser.getOne(query3, function (err, item) {
            callback(err, item)
          })
        },
        two: function (callback) {
          Compliance.getSome(query, function (err, items) {
            callback(err, items)
          }, opts, fields)
        }
      }, function (err, results) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (results.one === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          let data = []
          let recordTimeTemp = []
          for (let i = 0; i < results.two.length; i++) {
            data.push(results.two[i])
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
          let data1 = dataTemp
          let recordTime = recordTimeTemp
          let flag = {flagBP: true, flagWeight: true, flagVol: true, flagT: true, flagHR: true, flagVA: false, flagPD: false}
          if (results.one.class === null || results.one.class === '' || results.one.class === undefined) {
            return res.json({results: '请填写患者肾病类型!'})
          } else {
            if (results.one.class === 'class_5') { flag.flagVA = true }
            if (results.one.class === 'class_6') { flag.flagPD = true }
            return res.json({results: {item: {data1, recordTime}, flag}})
          }
        }
      })
    } else {
      Alluser.getOne(query3, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item === null) {
          return res.json({results: '不存在的患者ID!'})
        } else {
          next()
        }
      })
    }
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

// 获得月份所在季度
function getQuarter (nowMonth) {
  let quarter = 0
  if (nowMonth < 3) {
    quarter = 1
  }
  if (nowMonth > 2 && nowMonth < 6) {
    quarter = 2
  }
  if (nowMonth > 5 && nowMonth < 9) {
    quarter = 3
  }
  if (nowMonth > 8) {
    quarter = 4
  }
  return quarter
}

function getLastSeason (date) {
  let lastMonth1 = getLastMonthYestdy(date)
  let lastMonth2 = getLastMonthYestdy(new Date(lastMonth1))
  let lastMonth3 = getLastMonthYestdy(new Date(lastMonth2))
  return lastMonth3
}

function getMonthWeek (date) {
  return Math.floor((date - 1) / 7) + 1
}

function getLastMonthYestdy (date) {
  let daysInMonth = new Array([0], [31], [28], [31], [30], [31], [30], [31], [31], [30], [31], [30], [31])
  let strYear = date.getFullYear()
  let strDay = date.getDate()
  let strMonth = date.getMonth() + 1
  if (strYear % 4 === 0 && strYear % 100 !== 0) {
    daysInMonth[2] = 29
  }
  if (strMonth - 1 === 0) {
    strYear -= 1
    strMonth = 12
  } else {
    strMonth -= 1
  }
  strDay = daysInMonth[strMonth] >= strDay ? strDay : daysInMonth[strMonth]
  if (strMonth < 10) {
    strMonth = '0' + strMonth
  }
  if (strDay < 10) {
    strDay = '0' + strDay
  }
  let datastr = strYear + '-' + strMonth + '-' + strDay
  return datastr
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}
