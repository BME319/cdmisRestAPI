
// var dbUrl = '121.43.107.106:28000/cdmis'
// var dbUrl = 'localhost:27017/ir'
// var dbUrl = 'localhost:27018/cdmis' // 本地代码调试
var dbUrl = 'localhost:28000/cdmis' // 服务器代码调试
print(dbUrl)
db = connect(dbUrl)
db.auth('rest', 'zjubme319')

// Alluser
var query = {
  'role': 'patient'
}
var fields = ''
var patientCursor = db.allusers.find(query, fields)
// patientCursor.forEach(printjson)
var patient = []
while (patientCursor.hasNext()) {
  patient.push(patientCursor.next())
}
// print(patient.length)

var type = ''
var time = ''
var currentTime = new Date()
// 周
// var currentTime = new Date('2017', '04', '29', '00', '00', '00')  // 2017-05-29  22-28 201705_4
// var currentTime = new Date('2017', '07', '21', '00', '00', '00')
// var currentTime = new Date('2017', '07', '28', '00', '00', '00')
// 月
// var currentTime = new Date('2017', '08', '01', '00', '00', '00')
// 季
// var currentTime = new Date('2017', '09', '01', '00', '00', '00')
// 年
// var currentTime = new Date('2018', '00', '01', '00', '00', '00')

var currentYear = currentTime.getFullYear()
var currentMonth = currentTime.getMonth() + 1  // 0代表1月
var currentDate = currentTime.getDate()  // 日期
var currentDay = currentTime.getDay()  // 获取当前星期
// print(currentYear)
// print('currentMonth', currentMonth)
// print(currentDate)
// print(currentDay)
// print(currentTime)

if (currentDay === 1) {
  var lastWeek = new Date(currentTime - 7 * 24 * 3600 * 1000)
  let lastWeekYear = lastWeek.getFullYear()
  let lastWeekMonth = lastWeek.getMonth() + 1
  let monthWeek = getMonthWeek(lastWeek.getDate())
  var lastTwoWeeks = new Date(lastWeek - 7 * 24 * 3600 * 1000)
  let lastTwoWeeksY = lastTwoWeeks.getFullYear()
  let lastTwoWeeksM = lastTwoWeeks.getMonth() + 1
  let monthWeek1 = getMonthWeek(lastTwoWeeks.getDate())
  type = 'week'
  // print(type)
  if (lastWeekMonth < 10) { lastWeekMonth = '0' + lastWeekMonth }
  if (lastTwoWeeksM < 10) { lastTwoWeeksM = '0' + lastTwoWeeksM }
  // print(lastWeek)
  // print(monthWeek)
  // print(lastTwoWeeks)
  // print(monthWeek1)
  time = String(lastWeekYear) + String(lastWeekMonth) + '_' + String(monthWeek)
  // print(time)
  let time1 = String(lastTwoWeeksY) + String(lastTwoWeeksM) + '_' + String(monthWeek1)
  // print(time1)

  // 周报
  // 遍历所有患者
  for (let i = 0; i < patient.length; i++) {
    // print(patient[i].userId)
    // 周报血压
    let recordDays = 0
    let recordTimes = 0
    let weekSBP = []         // 收缩压 SBP
    let weekDBP = []         // 舒张压 DBP
    let average1 = 0
    let average2 = 0
    let recommendValue1 = 110  // 默认值，数据库读取更新
    let recommendValue2 = 140
    let recommendValue3 = 60
    let recommendValue4 = 90
    let outOfRangeTimes1 = 0
    let outOfRangeTime1 = []
    let recordTimeTemp = []  // 所有记录的记录时间
    let max1 = 0
    let min1 = 0
    let max2 = 0
    let min2 = 0
    let queryR = {
      'userId': patient[i].userId,
      'type': 'week',
      'time': time1,
      'itemType': 'BloodPressure'
    }
    let lastTwoWeeksReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoWeeksReport.length !== 0) {
      if (lastTwoWeeksReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      }
      if (lastTwoWeeksReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      }
      if (lastTwoWeeksReport[0].recommendValue13 !== undefined) {
        recommendValue3 = lastTwoWeeksReport[0].recommendValue13
      }
      if (lastTwoWeeksReport[0].recommendValue14 !== undefined) {
        recommendValue4 = lastTwoWeeksReport[0].recommendValue14
      }
    }
    query = {
      'code': 'BloodPressure',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串,如125/75
    var weekBPCursor = db.compliances.find(query, fields)
    var weekBP = []
    while (weekBPCursor.hasNext()) {
      weekBP.push(weekBPCursor.next())
    }
    // print('weekBP.length', weekBP.length)

      // var str = '125/75'
      // str1 = str.substr(0, str.indexOf('/'))
      // str2 = str.substr(str.indexOf('/') + 1)
      // print(Number(str1))
      // print(Number(str2))

    // 记录不为空
    if (weekBP.length !== 0) {
      let recordTime = new Date(weekBP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < weekBP.length; n++) {
        let str = weekBP[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekBP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekSBP.push(Number(strArr[k].substr(0, str.indexOf('/'))))
          weekDBP.push(Number(strArr[k].substr(str.indexOf('/') + 1)))
          recordTimeTemp.push(new Date(weekBP[n].date))
        }
      // weekSBP[i] = Number(strArr[0].substr(0, str.indexOf('/')))
      // weekDBP[i] = Number(strArr[0].substr(str.indexOf('/') + 1))

        if (recordTime !== (new Date(weekBP[n].date))) { recordDays++ }
        recordTime = new Date(weekBP[n].date)
      }
      recordTimes = weekSBP.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, weekSBP)
      min1 = Math.min.apply(null, weekSBP)
      max2 = Math.max.apply(null, weekDBP)
      min2 = Math.min.apply(null, weekDBP)
      average1 = average(weekSBP)
      average2 = average(weekDBP)
      // print('average1', average1)
      // print('average2', average2)
      outOfRangeTimes1 = outOfRange(weekSBP, recommendValue1, recommendValue2, weekDBP, recommendValue3, recommendValue4)
      outOfRangeTime(weekSBP, recommendValue1, recommendValue2, weekDBP, recommendValue3, recommendValue4, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'BloodPressure',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        'recommendValue3': recommendValue3,
        'recommendValue4': recommendValue4,
        // 'recommendValue11': 110,
        // 'recommendValue12': 140,
        // 'recommendValue13': 60,
        // 'recommendValue14': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': weekSBP,
        'data2': weekDBP,
        'recordTime': recordTimeTemp
      }
    )

    // 周报体重
    recordDays = 0
    recordTimes = 0
    // var weekWeight = []
    average1 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    let averageBMI = 0
    let changeRatio = 0
    let changeRatioBMI = 0
    var weekWeightTemp = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'week',
      'time': time1,
      'itemType': 'Weight'
    }
    lastTwoWeeksReport = db.reports.find(queryR, fields).toArray()
    // print('lastTwoWeeksReport', lastTwoWeeksReport.length)
    if (lastTwoWeeksReport.length !== 0) {
      // recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      // recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      if (lastTwoWeeksReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      }
      if (lastTwoWeeksReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      }
      // print('lastTwoWeeksReport.recommendValue11', lastTwoWeeksReport[0].recommendValue11)
    }
    query = {
      'code': 'Weight',
      'userId': patient[i].userId, // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串，一条记录可能包含多个测量值
    var weekWeightCursor = db.compliances.find(query, fields)
    var weekWeight = []
    while (weekWeightCursor.hasNext()) {
      weekWeight.push(weekWeightCursor.next())
    }
    // print('weekWeight.length', weekWeight.length)

    // 读取上周周报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      'time': time1
    }
    fields = {}
    var weeksReportCursor = db.reports.find(query, fields)
    var weeksReport = []
    while (weeksReportCursor.hasNext()) {
      weeksReport.push(weeksReportCursor.next())
    }
    // print('weeksReport.length', weeksReport.length)
    // 读取身高
    query = {
      'role': 'patient',
      'userId': patient[i].userId
    }
    fields = {}
    let height = db.allusers.find(query, fields).toArray()
    let heightTemp = height[0].height
    // print('height', heightTemp)

    // 读取的体重记录不为空
    if (weekWeight.length !== 0) {
      let recordTime = new Date(weekWeight[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < weekWeight.length; n++) {
        let str = weekWeight[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekWeight[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekWeightTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(weekWeight[n].date))
        }

        if (recordTime !== (new Date(weekWeight[n].date))) { recordDays++ }
        recordTime = new Date(weekWeight[n].date)
      }
      recordTimes = weekWeightTemp.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, weekWeightTemp)
      min1 = Math.min.apply(null, weekWeightTemp)
      average1 = average(weekWeightTemp)
      if (heightTemp !== 0) {
        averageBMI = ~~(average1 / Math.pow(heightTemp / 100, 2) * 100) / 100
      } else {
        averageBMI = 0 // 无身高数据，置0
      }
      // print('average1', average1)
      // print('averageBMI', averageBMI)
      if (weeksReport.length !== 0) {
        let lastWeekAverage = weeksReport[0].average1
        let lastWeekAverageBMI = weeksReport[0].averageBMI
        if (lastWeekAverage) {
          changeRatio = ~~((average1 - lastWeekAverage) * 100 / lastWeekAverage * 100) / 100
        }
        if (lastWeekAverageBMI) {
          changeRatioBMI = ~~((averageBMI - lastWeekAverageBMI) * 100 / lastWeekAverageBMI * 100) / 100
        }
      }
      // print('changeRatio', changeRatio)
      // print('changeRatioBMI', changeRatioBMI)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Weight',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'averageBMI': averageBMI,
        'changeRatio': changeRatio,
        'changeRatioBMI': changeRatioBMI,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 70,
        // 'recommendValue12': 90,
        'data1': weekWeightTemp,
        'recordTime': recordTimeTemp
      }
    )
    // 周报尿量
    recordDays = 0
    // var recordTimes = 0
    var weekVol = []   // 尿量
    average1 = 0
    recommendValue1 = 500
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    query = {
      'code': 'Vol',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var weekVolCursor = db.compliances.find(query, fields)
    while (weekVolCursor.hasNext()) {
      weekVol.push(weekVolCursor.next())
    }
    // print('weekVol.length', weekVol.length)

    // 记录不为空
    var weekVolTemp = []
    if (weekVol.length !== 0) {
      let recordTime = new Date(weekVol[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < weekVol.length; n++) {
        let str = weekVol[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekVol[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekVolTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(weekVol[n].date))
        }

        if (recordTime !== (new Date(weekVol[n].date))) { recordDays++ }
        recordTime = new Date(weekVol[n].date)
      }
      // print(weekVolTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, weekVolTemp)
      min1 = Math.min.apply(null, weekVolTemp)
      average1 = average(weekVolTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeVol(weekVolTemp, recommendValue1)
      outOfRangeTimeVol(weekVolTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Vol',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': weekVolTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 周报体温
    recordTimes = 0
    var weekT = []
    recommendValue1 = 37.3 // 高于37.3为发热
    outOfRangeTimes1 = 0   // 发热次数
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    query = {
      'code': 'Temperature',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var weekTCursor = db.compliances.find(query, fields)
    while (weekTCursor.hasNext()) {
      weekT.push(weekTCursor.next())
    }
    // print('weekT.length', weekT.length)

    // 记录不为空
    let weekTTemp = []
    if (weekT.length !== 0) {
      for (let n = 0; n < weekT.length; n++) {
        let str = weekT[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekT[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekTTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(weekT[n].date))
        }
      }
      recordTimes = weekTTemp.length
      // print('weekTTemp', weekTTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      outOfRangeTimes1 = outOfRangeT(weekTTemp, recommendValue1)
      outOfRangeTimeT(weekTTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Temperature',
        'recordTimes': recordTimes,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': weekTTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 周报心率
    recordDays = 0
    recordTimes = 0
    var weekP = []   // 心率
    average1 = 0
    recommendValue1 = 60  // 数据库读取
    recommendValue2 = 100
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'week',
      'time': time1,
      'itemType': 'HeartRate'
    }
    lastTwoWeeksReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoWeeksReport.length !== 0) {
      // recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      // recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      if (lastTwoWeeksReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      }
      if (lastTwoWeeksReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      }
    }
    query = {
      'code': 'HeartRate',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var weekPCursor = db.compliances.find(query, fields)
    while (weekPCursor.hasNext()) {
      weekP.push(weekPCursor.next())
    }
    // print('weekP.length', weekP.length)

    // 记录不为空
    var weekPTemp = []
    if (weekP.length !== 0) {
      let recordTime = new Date(weekP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < weekP.length; n++) {
        let str = weekP[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekPTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(weekP[n].date))
        }

        if (recordTime !== (new Date(weekP[n].date))) { recordDays++ }
        recordTime = new Date(weekP[n].date)
      }
      recordTimes = weekPTemp.length
      // print(weekPTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, weekPTemp)
      min1 = Math.min.apply(null, weekPTemp)
      average1 = average(weekPTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeP(weekPTemp, recommendValue1, recommendValue2)
      outOfRangeTimeP(weekPTemp, recommendValue1, recommendValue2, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'HeartRate',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': weekPTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 周报腹透
    recordDays = 0
    var weekPD = []   // 腹透
    average1 = 0
    average2 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    max2 = 0
    min2 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'week',
      'time': time1,
      'itemType': 'PeritonealDialysis'
    }
    lastTwoWeeksReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoWeeksReport.length !== 0) {
      // recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      // recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      if (lastTwoWeeksReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoWeeksReport[0].recommendValue11
      }
      if (lastTwoWeeksReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoWeeksReport[0].recommendValue12
      }
    }
    query = {
      'code': 'PeritonealDialysis',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastWeek, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var weekPDCursor = db.compliances.find(query, fields)
    while (weekPDCursor.hasNext()) {
      weekPD.push(weekPDCursor.next())
    }
    // print('weekPD.length', weekPD.length)

    // 记录不为空
    var weekPDTemp = []
    let dataUFAll = []
    let dataPV = []
    let recordTimeAll = []
    if (weekPD.length !== 0) {
      let recordTime = new Date(weekPD[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < weekPD.length; n++) {
        let str = weekPD[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(weekPD[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          weekPDTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(weekPD[n].date))
        }

        if (recordTime !== (new Date(weekPD[n].date))) { recordDays++ }
        recordTime = new Date(weekPD[n].date)
      }
      // print(weekPDTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)

      recordTime = new Date(recordTimeTemp[0])
      let tempUF = 0
      dataUFAll = []
      recordTimeAll = []
      for (let n = 0; n < recordTimeTemp.length; n++) {
        if (recordTimeTemp[n].getTime() === recordTime.getTime()) {  // 时间的比较
          tempUF += weekPDTemp[n]
        } else {
          dataUFAll.push(tempUF)
          recordTimeAll.push(recordTime)
          tempUF = weekPDTemp[n]
        }
        recordTime = new Date(recordTimeTemp[n])
        // console.log('tempUF', tempUF)
        // console.log(dataUFAll)
        // console.log(recordTime)
        // console.log(recordTimeAll)
      }
      dataUFAll.push(tempUF)
      recordTimeAll.push(recordTime)
      let query2 = {}
      let vol = []
      dataPV = []
      let volTemp = 0
      let startTime
      let endTime
      for (let n = 0; n < dataUFAll.length; n++) {
        startTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), recordTimeAll[n].getDate(), '00', '00', '00')
        endTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), String(Number(recordTimeAll[n].getDate())), '23', '59', '59')
        query2 = {
          'code': 'Vol',
          'userId': patient[i].userId,  // Alluser.userId
          'date': {$gte: startTime, $lt: endTime}
        }
        // print('recordTimeAll[n]', recordTimeAll[n])
        // print('startTime', startTime)
        // print('endTime', endTime)
        vol = db.compliances.find(query2, fields).toArray()
        // let volCursor = db.compliances.find(query2, fields)
        // while (volCursor.hasNext()) {
        //   vol.push(volCursor.next())
        // }
        for (let j = 0; j < vol.length; j++) {
          volTemp += Number(vol[j].description)
          // print('vol[j].description', vol[j].description)
          // print('vol[j].date', vol[j].date)
        }
        dataPV.push(volTemp + dataUFAll[n])
        // print('dataUFAll[n]', dataUFAll[n])
        volTemp = 0
        // vol = []
      }
      // print('dataPV', dataPV)
      max1 = Math.max.apply(null, dataUFAll)
      min1 = Math.min.apply(null, dataUFAll)
      average1 = average(dataUFAll)
      // print('average1', average1)
      max2 = Math.max.apply(null, dataPV)
      min2 = Math.min.apply(null, dataPV)
      average2 = average(dataPV)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'PeritonealDialysis',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'data1': dataUFAll,
        'data2': dataPV,
        'recordTime': recordTimeAll
      }
    )

    // 周报化验
    let min = 0
    let max = 0
    let labTestArray = []
    let labTestData = []
    let labTestRecordTime = []
    let _type
    for (let j = 0; j < 5; j++) {
      switch (j) {
        case 0:
          query = {
            'type': 'SCr',
            'userId': patient[i].userId,
            'time': {$gte: lastWeek, $lt: currentTime}
          }
          _type = 'SCr'
          break
        case 1:
          query = {
            'type': 'GFR',
            'userId': patient[i].userId,
            'time': {$gte: lastWeek, $lt: currentTime}
          }
          _type = 'GFR'
          break
        case 2:
          query = {
            'type': 'PRO',
            'userId': patient[i].userId,
            'time': {$gte: lastWeek, $lt: currentTime}
          }
          _type = 'PRO'
          break
        case 3:
          query = {
            'type': 'ALB',
            'userId': patient[i].userId,
            'time': {$gte: lastWeek, $lt: currentTime}
          }
          _type = 'ALB'
          break
        case 4:
          query = {
            'type': 'HB',
            'userId': patient[i].userId,
            'time': {$gte: lastWeek, $lt: currentTime}
          }
          _type = 'HB'
          break
      }
      let fields = {}
      let weekLab = db.labtestimports.find(query, fields).toArray()
      let weekLabTemp = []
      let weekRecordTimeTemp = []
      if (weekLab.length !== 0) {
        for (let n = 0; n < weekLab.length; n++) {
          weekLabTemp.push(weekLab[n].value)
          weekRecordTimeTemp.push(new Date(weekLab[n].time))
        }
        max = Math.max.apply(null, weekLabTemp)
        min = Math.min.apply(null, weekLabTemp)
        labTestArray.push({_type, max, min})
      }
      labTestData.push(weekLabTemp)
      labTestRecordTime.push(weekRecordTimeTemp)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'LabTest',
        'labTestArray': labTestArray,
        'data1': labTestData[0],
        'data2': labTestData[1],
        'data3': labTestData[2],
        'data4': labTestData[3],
        'data5': labTestData[4],
        'recordTime': labTestRecordTime[0],
        'recordTime2': labTestRecordTime[1],
        'recordTime3': labTestRecordTime[2],
        'recordTime4': labTestRecordTime[3],
        'recordTime5': labTestRecordTime[4]
      }
    )
  }
  printjson({'result': 'insertWeekReport_success', 'insertWeekReport_item': patient.length, 'insertWeekReport_time': currentTime})
}

if (currentDate === 1) {
  type = 'month'
  // print(type)
  let lastMonthStr = getLastMonthYestdy(currentTime)
  let strArr = lastMonthStr.split('-')
  var lastMonth = new Date(strArr[0], String(Number(strArr[1]) - 1), strArr[2], '00', '00', '00')
  // print(lastMonth)
  let lastMonthY = lastMonth.getFullYear()
  let lastMonthM = lastMonth.getMonth() + 1
  if (lastMonthM < 10) { lastMonthM = '0' + lastMonthM }
  time = String(lastMonthY) + String(lastMonthM)
  // print('time', time)
  let lastTwoMonthsStr = getLastMonthYestdy(lastMonth)
  strArr = lastTwoMonthsStr.split('-')
  var lastTwoMonths = new Date(strArr[0], String(Number(strArr[1]) - 1), strArr[2], '00', '00', '00')
  // print(lastTwoMonths)
  let lastTwoMonthsY = lastTwoMonths.getFullYear()
  let lastTwoMonthsM = lastTwoMonths.getMonth() + 1
  if (lastTwoMonthsM < 10) { lastTwoMonthsM = '0' + lastTwoMonthsM }
  let time1 = String(lastTwoMonthsY) + String(lastTwoMonthsM)
  // print('time1', time1)

  // 月报
  // 遍历所有患者
  for (let i = 0; i < patient.length; i++) {
    // print(patient[i].userId)
    // 月报血压
    let recordDays = 0
    let recordTimes = 0
    let monthSBP = []         // 收缩压 SBP
    let monthDBP = []         // 舒张压 DBP
    let average1 = 0
    let average2 = 0
    let recommendValue1 = 110  // 数据库读取
    let recommendValue2 = 140
    let recommendValue3 = 60
    let recommendValue4 = 90
    let outOfRangeTimes1 = 0
    let outOfRangeTime1 = []
    let recordTimeTemp = []  // 所有记录的记录时间
    let max1 = 0
    let min1 = 0
    let max2 = 0
    let min2 = 0
    let queryR = {
      'userId': patient[i].userId,
      'type': 'month',
      'time': time1,
      'itemType': 'BloodPressure'
    }
    let lastTwoMonthsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoMonthsReport.length !== 0) {
      if (lastTwoMonthsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      }
      if (lastTwoMonthsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      }
      if (lastTwoMonthsReport[0].recommendValue13 !== undefined) {
        recommendValue3 = lastTwoMonthsReport[0].recommendValue13
      }
      if (lastTwoMonthsReport[0].recommendValue14 !== undefined) {
        recommendValue4 = lastTwoMonthsReport[0].recommendValue14
      }
      // recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      // recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      // recommendValue3 = lastTwoMonthsReport[0].recommendValue13
      // recommendValue4 = lastTwoMonthsReport[0].recommendValue14
    }
    query = {
      'code': 'BloodPressure',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串,如125/75
    var monthBPCursor = db.compliances.find(query, fields)
    var monthBP = []
    while (monthBPCursor.hasNext()) {
      monthBP.push(monthBPCursor.next())
    }
    // print('monthBP.length', monthBP.length)

    // 记录不为空
    if (monthBP.length !== 0) {
      let recordTime = new Date(monthBP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < monthBP.length; n++) {
        let str = monthBP[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthBP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthSBP.push(Number(strArr[k].substr(0, str.indexOf('/'))))
          monthDBP.push(Number(strArr[k].substr(str.indexOf('/') + 1)))
          recordTimeTemp.push(new Date(monthBP[n].date))
        }
        if (recordTime !== (new Date(monthBP[n].date))) { recordDays++ }
        recordTime = new Date(monthBP[n].date)
      }
      recordTimes = monthSBP.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, monthSBP)
      min1 = Math.min.apply(null, monthSBP)
      max2 = Math.max.apply(null, monthDBP)
      min2 = Math.min.apply(null, monthDBP)
      average1 = average(monthSBP)
      average2 = average(monthDBP)
      // print('average1', average1)
      // print('average2', average2)
      outOfRangeTimes1 = outOfRange(monthSBP, recommendValue1, recommendValue2, monthDBP, recommendValue3, recommendValue4)
      outOfRangeTime(monthSBP, recommendValue1, recommendValue2, monthDBP, recommendValue3, recommendValue4, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)

      // 从周报中获取超出范围次数
      let startTimeTmp = new Date(lastMonth)
      let endTimeTmp = new Date(lastMonth.getTime() + (7 - lastMonth.getDay()) * 24 * 3600 * 1000)  // 周日零点
      let yesterDay = new Date(currentTime - 24 * 3600 * 1000)
      // print('startTimeTmp', startTimeTmp)
      // print('endTimeTmp', endTimeTmp)
      // print('yesterDay', yesterDay)
      outOfRangeTimes1 = 0
      outOfRangeTime1 = []
      while (Number(startTimeTmp.getTime()) <= Number(yesterDay.getTime())) {
        let timeTmp = new Date(startTimeTmp - (startTimeTmp.getDay() - 1) * 24 * 3600 * 1000)
        let timeTmpY = timeTmp.getFullYear()
        let timeTmpM = timeTmp.getMonth() + 1
        if (timeTmpM < 10) { timeTmpM = '0' + timeTmpM }
        let monthWeek = getMonthWeek(timeTmp.getDate())
        let timeWeek = String(timeTmpY) + String(timeTmpM) + '_' + String(monthWeek)
        queryR = {
          'userId': patient[i].userId,
          'type': 'week',
          'time': timeWeek,
          'itemType': 'BloodPressure'
        }
        // let recommendValue1Tmp = recommendValue1
        // let recommendValue2Tmp = recommendValue2
        // let recommendValue3Tmp = recommendValue3
        // let recommendValue4Tmp = recommendValue4
        let weekReport = db.reports.find(queryR, fields).toArray()
        if (weekReport.length !== 0) {
          // let data1Tmp = weekReport[0].data1
          // let data2Tmp = weekReport[0].data2
          // recommendValue1Tmp = weekReport[0].recommendValue1
          // recommendValue2Tmp = weekReport[0].recommendValue2
          // recommendValue3Tmp = weekReport[0].recommendValue3
          // recommendValue4Tmp = weekReport[0].recommendValue4
          // for (let j = startTimeTmp.getDay() - 1; j < endTimeTmp.getDay(); j++) {
          //   if (data1Tmp < recommendValue1Tmp || data1Tmp > recommendValue2Tmp || data2Tmp < recommendValue3Tmp || data2Tmp > recommendValue4Tmp) {
          //     outOfRangeTimes1++
          //   }
          // }
          outOfRangeTimes1 += weekReport[0].outOfRangeTimes1
          for (let j = 0; j < weekReport[0].outOfRangeTime1.length; j++) {
            outOfRangeTime1.push(weekReport[0].outOfRangeTime1[j])
          }
        }
        // print(outOfRangeTimes1)
        // else { // 无周报数据则从compliance取数据 }
        // print('recommendValue1Tmp', recommendValue1Tmp)
        startTimeTmp = new Date(endTimeTmp.getTime() + 24 * 3600 * 1000)
        // print('startTimeTmp', startTimeTmp)
        endTimeTmp = new Date(startTimeTmp.getTime() + (7 - startTimeTmp.getDay()) * 24 * 3600 * 1000)
        if (Number(endTimeTmp.getTime()) > Number(yesterDay.getTime())) {
          endTimeTmp = new Date(yesterDay)
        }
        // print('endTimeTmp', endTimeTmp)
      }
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'BloodPressure',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        'recommendValue3': recommendValue3,
        'recommendValue4': recommendValue4,
        // 'recommendValue11': 110,
        // 'recommendValue12': 140,
        // 'recommendValue13': 60,
        // 'recommendValue14': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': monthSBP,
        'data2': monthDBP,
        'recordTime': recordTimeTemp
      }
    )

    // 月报体重
    recordDays = 0
    recordTimes = 0
    // var monthWeight = []
    average1 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    let averageBMI = 0
    let changeRatio = 0
    let changeRatioBMI = 0
    var monthWeightTemp = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'month',
      'time': time1,
      'itemType': 'Weight'
    }
    lastTwoMonthsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoMonthsReport.length !== 0) {
      // recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      // recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      if (lastTwoMonthsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      }
      if (lastTwoMonthsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'Weight',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串，一条记录可能包含多个测量值
    var monthWeightCursor = db.compliances.find(query, fields)
    var monthWeight = []
    while (monthWeightCursor.hasNext()) {
      monthWeight.push(monthWeightCursor.next())
    }
    // print('monthWeight.length', monthWeight.length)

    // 读取上月月报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      'time': time1
    }
    fields = {}
    var monthsReportCursor = db.reports.find(query, fields)
    var monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)

    // 读取身高
    query = {
      'role': 'patient',
      'userId': patient[i].userId
    }
    fields = {}
    let height = db.allusers.find(query, fields).toArray()
    let heightTemp = height[0].height
    // print('height', heightTemp)

    // 读取的体重记录不为空
    if (monthWeight.length !== 0) {
      let recordTime = new Date(monthWeight[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < monthWeight.length; n++) {
        let str = monthWeight[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthWeight[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthWeightTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(monthWeight[n].date))
        }

        if (recordTime !== (new Date(monthWeight[n].date))) { recordDays++ }
        recordTime = new Date(monthWeight[n].date)
      }
      recordTimes = monthWeightTemp.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, monthWeightTemp)
      min1 = Math.min.apply(null, monthWeightTemp)
      average1 = average(monthWeightTemp)
      if (heightTemp !== 0) {
        averageBMI = ~~(average1 / Math.pow(heightTemp / 100, 2) * 100) / 100
      } else {
        averageBMI = 0 // 无身高数据，置0
      }
      // print('average1', average1)
      // print('averageBMI', averageBMI)
      if (monthsReport.length !== 0) {
        let lastMonthAverage = monthsReport[0].average1
        let lastMonthAverageBMI = monthsReport[0].averageBMI
        if (lastMonthAverage) {
          changeRatio = ~~((average1 - lastMonthAverage) * 100 / lastMonthAverage * 100) / 100
        }
        if (lastMonthAverageBMI) {
          changeRatioBMI = ~~((averageBMI - lastMonthAverageBMI) * 100 / lastMonthAverageBMI * 100) / 100
        }
      }
      // print('changeRatio', changeRatio)
      // print('changeRatioBMI', changeRatioBMI)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Weight',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'averageBMI': averageBMI,
        'changeRatio': changeRatio,
        'changeRatioBMI': changeRatioBMI,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 70,
        // 'recommendValue12': 90,
        'data1': monthWeightTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 月报尿量
    recordDays = 0
    // var recordTimes = 0
    var monthVol = []   // 尿量
    average1 = 0
    recommendValue1 = 500
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    query = {
      'code': 'Vol',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var monthVolCursor = db.compliances.find(query, fields)
    while (monthVolCursor.hasNext()) {
      monthVol.push(monthVolCursor.next())
    }
    // print('monthVol.length', monthVol.length)

    // 记录不为空
    var monthVolTemp = []
    if (monthVol.length !== 0) {
      let recordTime = new Date(monthVol[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < monthVol.length; n++) {
        let str = monthVol[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthVol[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthVolTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(monthVol[n].date))
        }

        if (recordTime !== (new Date(monthVol[n].date))) { recordDays++ }
        recordTime = new Date(monthVol[n].date)
      }
      // print(monthVolTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, monthVolTemp)
      min1 = Math.min.apply(null, monthVolTemp)
      average1 = average(monthVolTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeVol(monthVolTemp, recommendValue1)
      outOfRangeTimeVol(monthVolTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Vol',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': monthVolTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 月报体温
    recordTimes = 0
    var monthT = []
    recommendValue1 = 37.3 // 高于37.3为发热
    outOfRangeTimes1 = 0   // 发热次数
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    query = {
      'code': 'Temperature',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var monthTCursor = db.compliances.find(query, fields)
    while (monthTCursor.hasNext()) {
      monthT.push(monthTCursor.next())
    }
    // print('monthT.length', monthT.length)

    // 记录不为空
    let monthTTemp = []
    if (monthT.length !== 0) {
      for (let n = 0; n < monthT.length; n++) {
        let str = monthT[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthT[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthTTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(monthT[n].date))
        }
      }
      recordTimes = monthTTemp.length
      // print('monthTTemp', monthTTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      outOfRangeTimes1 = outOfRangeT(monthTTemp, recommendValue1)
      outOfRangeTimeT(monthTTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Temperature',
        'recordTimes': recordTimes,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': monthTTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 月报心率
    recordDays = 0
    recordTimes = 0
    var monthP = []   // 心率
    average1 = 0
    recommendValue1 = 60  // 数据库读取
    recommendValue2 = 100
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'month',
      'time': time1,
      'itemType': 'HeartRate'
    }
    lastTwoMonthsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoMonthsReport.length !== 0) {
      // recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      // recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      if (lastTwoMonthsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      }
      if (lastTwoMonthsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'HeartRate',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var monthPCursor = db.compliances.find(query, fields)
    while (monthPCursor.hasNext()) {
      monthP.push(monthPCursor.next())
    }
    // print('monthP.length', monthP.length)

    // 记录不为空
    var monthPTemp = []
    if (monthP.length !== 0) {
      let recordTime = new Date(monthP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < monthP.length; n++) {
        let str = monthP[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthPTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(monthP[n].date))
        }

        if (recordTime !== (new Date(monthP[n].date))) { recordDays++ }
        recordTime = new Date(monthP[n].date)
      }
      recordTimes = monthPTemp.length
      // print(monthPTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, monthPTemp)
      min1 = Math.min.apply(null, monthPTemp)
      average1 = average(monthPTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeP(monthPTemp, recommendValue1, recommendValue2)
      outOfRangeTimeP(monthPTemp, recommendValue1, recommendValue2, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)

      // 从周报中获取超出范围次数
      let startTimeTmp = new Date(lastMonth)
      let endTimeTmp = new Date(lastMonth.getTime() + (7 - lastMonth.getDay()) * 24 * 3600 * 1000)  // 周日零点
      let yesterDay = new Date(currentTime.getTime() - 24 * 3600 * 1000)
      // print('startTimeTmp', startTimeTmp)
      // print('endTimeTmp', endTimeTmp)
      // print('yesterDay', yesterDay)
      outOfRangeTimes1 = 0
      outOfRangeTime1 = []
      while (Number(startTimeTmp.getTime()) <= Number(yesterDay.getTime())) {
        let timeTmp = new Date(startTimeTmp - (startTimeTmp.getDay() - 1) * 24 * 3600 * 1000)
        let timeTmpY = timeTmp.getFullYear()
        let timeTmpM = timeTmp.getMonth() + 1
        if (timeTmpM < 10) { timeTmpM = '0' + timeTmpM }
        let monthWeek = getMonthWeek(timeTmp.getDate())
        let timeWeek = String(timeTmpY) + String(timeTmpM) + '_' + String(monthWeek)
        queryR = {
          'userId': patient[i].userId,
          'type': 'week',
          'time': timeWeek,
          'itemType': 'HeartRate'
        }
        let weekReport = db.reports.find(queryR, fields).toArray()
        if (weekReport.length !== 0) {
          // let data1Tmp = weekReport[0].data1
          // let recommendValue1Tmp = weekReport[0].recommendValue1
          // let recommendValue2Tmp = weekReport[0].recommendValue2
          // for (let j = startTimeTmp.getDay() - 1; j < endTimeTmp.getDay(); j++) {
          //   if (data1Tmp < recommendValue1Tmp || data1Tmp > recommendValue2Tmp) {
          //     outOfRangeTimes1++
          //   }
          // }
          outOfRangeTimes1 += weekReport[0].outOfRangeTimes1
          for (let j = 0; j < weekReport[0].outOfRangeTime1.length; j++) {
            outOfRangeTime1.push(weekReport[0].outOfRangeTime1[j])
          }
        }
        // print('outOfRangeTimes1', outOfRangeTimes1)
        startTimeTmp = new Date(endTimeTmp.getTime() + 24 * 3600 * 1000)
        // print('startTimeTmp', startTimeTmp)
        endTimeTmp = new Date(startTimeTmp.getTime() + (7 - startTimeTmp.getDay()) * 24 * 3600 * 1000)
        if (Number(endTimeTmp.getTime()) > Number(yesterDay.getTime())) {
          endTimeTmp = new Date(yesterDay)
        }
        // print('endTimeTmp', endTimeTmp)
      }
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'HeartRate',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': monthPTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 月报腹透
    recordDays = 0
    var monthPD = []   // 腹透
    average1 = 0
    average2 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    max2 = 0
    min2 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'month',
      'time': time1,
      'itemType': 'PeritonealDialysis'
    }
    lastTwoMonthsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoMonthsReport.length !== 0) {
      // recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      // recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      if (lastTwoMonthsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoMonthsReport[0].recommendValue11
      }
      if (lastTwoMonthsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoMonthsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'PeritonealDialysis',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastMonth, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    let monthPDCursor = db.compliances.find(query, fields)
    while (monthPDCursor.hasNext()) {
      monthPD.push(monthPDCursor.next())
    }
    // print('monthPD.length', monthPD.length)

    // 记录不为空
    var monthPDTemp = []
    let dataUFAll = []
    let dataPV = []
    let recordTimeAll = []
    if (monthPD.length !== 0) {
      let recordTime = new Date(monthPD[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < monthPD.length; n++) {
        let str = monthPD[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(monthPD[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          monthPDTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(monthPD[n].date))
        }

        if (recordTime !== (new Date(monthPD[n].date))) { recordDays++ }
        recordTime = new Date(monthPD[n].date)
      }
      // print(monthPDTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)

      recordTime = new Date(recordTimeTemp[0])
      let tempUF = 0
      dataUFAll = []
      recordTimeAll = []
      for (let n = 0; n < recordTimeTemp.length; n++) {
        if (recordTimeTemp[n].getTime() === recordTime.getTime()) {  // 时间的比较
          tempUF += monthPDTemp[n]
        } else {
          dataUFAll.push(tempUF)
          recordTimeAll.push(recordTime)
          tempUF = monthPDTemp[n]
        }
        recordTime = new Date(recordTimeTemp[n])
        // console.log('tempUF', tempUF)
        // console.log(dataUFAll)
        // console.log(recordTime)
        // console.log(recordTimeAll)
      }
      dataUFAll.push(tempUF)
      recordTimeAll.push(recordTime)

      let query2 = {}
      dataPV = []
      let vol = []
      let volTemp = 0
      let startTime
      let endTime
      for (let n = 0; n < dataUFAll.length; n++) {
        startTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), recordTimeAll[n].getDate(), '00', '00', '00')
        endTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), String(Number(recordTimeAll[n].getDate())), '23', '59', '59')
        query2 = {
          'code': 'Vol',
          'userId': patient[i].userId,  // Alluser.userId
          'date': {$gte: startTime, $lt: endTime}
        }
        // print('recordTimeAll[n]', recordTimeAll[n])
        // print('startTime', startTime)
        // print('endTime', endTime)
        vol = db.compliances.find(query2, fields).toArray()
        for (let j = 0; j < vol.length; j++) {
          volTemp += Number(vol[j].description)
        }
        dataPV.push(volTemp + dataUFAll[n])
        // print('dataUFAll[n]', dataUFAll[n])
        volTemp = 0
      }
      print('dataPV', dataPV)
      max1 = Math.max.apply(null, dataUFAll)
      min1 = Math.min.apply(null, dataUFAll)
      average1 = average(dataUFAll)
      max2 = Math.max.apply(null, dataPV)
      min2 = Math.min.apply(null, dataPV)
      average2 = average(dataPV)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'PeritonealDialysis',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'data1': dataUFAll,
        'data2': dataPV,
        'recordTime': recordTimeAll
      }
    )

    // 月报化验
    let min = 0
    let max = 0
    let labTestArray = []
    let labTestData = []
    let labTestRecordTime = []
    let _type
    for (let j = 0; j < 5; j++) {
      switch (j) {
        case 0:
          query = {
            'type': 'SCr',
            'userId': patient[i].userId,
            'time': {$gte: lastMonth, $lt: currentTime}
          }
          _type = 'SCr'
          break
        case 1:
          query = {
            'type': 'GFR',
            'userId': patient[i].userId,
            'time': {$gte: lastMonth, $lt: currentTime}
          }
          _type = 'GFR'
          break
        case 2:
          query = {
            'type': 'PRO',
            'userId': patient[i].userId,
            'time': {$gte: lastMonth, $lt: currentTime}
          }
          _type = 'PRO'
          break
        case 3:
          query = {
            'type': 'ALB',
            'userId': patient[i].userId,
            'time': {$gte: lastMonth, $lt: currentTime}
          }
          _type = 'ALB'
          break
        case 4:
          query = {
            'type': 'HB',
            'userId': patient[i].userId,
            'time': {$gte: lastMonth, $lt: currentTime}
          }
          _type = 'HB'
          break
      }
      let fields = {}
      let monthLab = db.labtestimports.find(query, fields).toArray()
      let monthLabTemp = []
      let monthRecordTimeTemp = []
      if (monthLab.length !== 0) {
        for (let n = 0; n < monthLab.length; n++) {
          monthLabTemp.push(monthLab[n].value)
          monthRecordTimeTemp.push(new Date(monthLab[n].time))
        }
        max = Math.max.apply(null, monthLabTemp)
        min = Math.min.apply(null, monthLabTemp)
        labTestArray.push({_type, max, min})
      }
      labTestData.push(monthLabTemp)
      labTestRecordTime.push(monthRecordTimeTemp)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'LabTest',
        'labTestArray': labTestArray,
        'data1': labTestData[0],
        'data2': labTestData[1],
        'data3': labTestData[2],
        'data4': labTestData[3],
        'data5': labTestData[4],
        'recordTime': labTestRecordTime[0],
        'recordTime2': labTestRecordTime[1],
        'recordTime3': labTestRecordTime[2],
        'recordTime4': labTestRecordTime[3],
        'recordTime5': labTestRecordTime[4]
      }
    )
  }
  printjson({'result': 'insertMonthReport_success', 'insertMonthReport_item': patient.length, 'insertMonthReport_time': currentTime})
}

if (currentDate === 1 && (currentMonth % 3 === 1)) {
  let lastSeasonStr = getLastSeason(currentTime)
  let strArr = lastSeasonStr.split('-')
  var lastSeason = new Date(strArr[0], String(Number(strArr[1]) - 1), strArr[2], '00', '00', '00')
  // print(lastSeason)
  let lastSeasonY = lastSeason.getFullYear()
  let lastSeasonM = lastSeason.getMonth() + 1
  let lastSeasonS = Math.floor(lastSeasonM / 3) + 1
  var monthsInSeason = []
  for (let i = 0; i < 3; i++) {
    monthsInSeason[i] = String(lastSeasonY) + String(add0(lastSeasonM + i))
  }
  // print(monthsInSeason)
  type = 'season'
  // print(type)
  time = String(lastSeasonY) + '_' + String(lastSeasonS)
  // print('time', time)

  let lastTwoSeasonsStr = getLastSeason(lastSeason)
  strArr = lastTwoSeasonsStr.split('-')
  var lastTwoSeasons = new Date(strArr[0], String(Number(strArr[1]) - 1), strArr[2], '00', '00', '00')
  // print(lastTwoSeasons)
  let lastTwoSeasonsY = lastTwoSeasons.getFullYear()
  let lastTwoSeasonsM = lastTwoSeasons.getMonth() + 1
  let lastTwoSeasonsS = Math.floor(lastTwoSeasonsM / 3) + 1
  let time1 = String(lastTwoSeasonsY) + '_' + String(lastTwoSeasonsS)
  // print('time1', time1)

  // 季报
  // 遍历所有患者
  for (let i = 0; i < patient.length; i++) {
    // print(patient[i].userId)
    // 季报血压
    let recordDays = 0
    let recordTimes = 0
    let seasonSBP = []         // 收缩压 SBP
    let seasonDBP = []         // 舒张压 DBP
    let average1 = 0
    let average2 = 0
    let recommendValue1 = 110  // 数据库读取
    let recommendValue2 = 140
    let recommendValue3 = 60
    let recommendValue4 = 90
    let outOfRangeTimes1 = 0
    let outOfRangeTime1 = []
    let recordTimeTemp = []  // 所有记录的记录时间
    let max1 = 0
    let min1 = 0
    let max2 = 0
    let min2 = 0
    let bestControlMonth = 0         // 控制最佳月份 季年报
    let worstControlMonth = 0        // 控制最差月份 季年报
    let mostCompleteRecordMonth = 0  // 记录最完整月份 季年报
    let worstCompleteRecordMonth = 0 // 记录最差月份 季年报
    let queryR = {
      'userId': patient[i].userId,
      'type': 'season',
      'time': time1,
      'itemType': 'BloodPressure'
    }
    let lastTwoSeasonsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoSeasonsReport.length !== 0) {
      if (lastTwoSeasonsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      }
      if (lastTwoSeasonsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      }
      if (lastTwoSeasonsReport[0].recommendValue13 !== undefined) {
        recommendValue3 = lastTwoSeasonsReport[0].recommendValue13
      }
      if (lastTwoSeasonsReport[0].recommendValue14 !== undefined) {
        recommendValue4 = lastTwoSeasonsReport[0].recommendValue14
      }
    }
    query = {
      'code': 'BloodPressure',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串,如125/75
    var seasonBPCursor = db.compliances.find(query, fields)
    var seasonBP = []
    while (seasonBPCursor.hasNext()) {
      seasonBP.push(seasonBPCursor.next())
    }
    // print('seasonBP.length', seasonBP.length)

    // 记录不为空
    if (seasonBP.length !== 0) {
      let recordTime = new Date(seasonBP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < seasonBP.length; n++) {
        let str = seasonBP[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonBP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonSBP.push(Number(strArr[k].substr(0, str.indexOf('/'))))
          seasonDBP.push(Number(strArr[k].substr(str.indexOf('/') + 1)))
          recordTimeTemp.push(new Date(seasonBP[n].date))
        }
        if (recordTime !== (new Date(seasonBP[n].date))) { recordDays++ }
        recordTime = new Date(seasonBP[n].date)
      }
      recordTimes = seasonSBP.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, seasonSBP)
      min1 = Math.min.apply(null, seasonSBP)
      max2 = Math.max.apply(null, seasonDBP)
      min2 = Math.min.apply(null, seasonDBP)
      average1 = average(seasonSBP)
      average2 = average(seasonDBP)
      // print('average1', average1)
      // print('average2', average2)
      outOfRangeTimes1 = outOfRange(seasonSBP, recommendValue1, recommendValue2, seasonDBP, recommendValue3, recommendValue4, outOfRangeTime1)
      outOfRangeTime(seasonSBP, recommendValue1, recommendValue2, seasonDBP, recommendValue3, recommendValue4, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 调取本季各月的月报
    query = {
      'itemType': 'BloodPressure',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInSeason[0]},
        {'time': monthsInSeason[1]},
        {'time': monthsInSeason[2]}
      ]
    }
    fields = {}
    var monthsReportCursor = db.reports.find(query, fields)
    var monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    let outOfRangeTimes1Temp = []
    let recordTimeTemp1 = []
    let recordDaysTemp = []
    let recordDaysTimeTemp = []
    let recordFlag = 0 // Flag: 0为没有数据记录，1为有数据记录
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    for (let p = 0; p < monthsReport.length; p++) {
      outOfRangeTimes1 += monthsReport[p].outOfRangeTimes1 // 从月报获取超出范围次数
      for (let k = 0; k < monthsReport[p].outOfRangeTime1.length; k++) {
        outOfRangeTime1.push(monthsReport[p].outOfRangeTime1[k])
      }
      if (monthsReport[p].recordDays !== 0) {
        outOfRangeTimes1Temp.push(monthsReport[p].outOfRangeTimes1)
        recordTimeTemp1.push(monthsReport[p].time)
        recordDaysTemp.push(monthsReport[p].recordDays)
        recordDaysTimeTemp.push(monthsReport[p].time)
        if (monthsReport[p].recordDays !== 0) { recordFlag = 1 }
      }
    }
    // print(outOfRangeTimes1Temp)
    // print('recordFlag', recordFlag)

    if (recordFlag) {
      // 控制最佳标准未定，后续修改
      let min = Math.min.apply(null, outOfRangeTimes1Temp)
      let max = Math.max.apply(null, outOfRangeTimes1Temp)
      let m = getIndex(outOfRangeTimes1Temp, min)
      bestControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('bestControlMonth', bestControlMonth)
      m = getIndex(outOfRangeTimes1Temp, max)
      worstControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('worstControlMonth', worstControlMonth)
      min = Math.min.apply(null, recordDaysTemp)
      max = Math.max.apply(null, recordDaysTemp)
      m = getIndex(recordDaysTemp, min)
      worstCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('worstCompleteRecordMonth', worstCompleteRecordMonth)
      m = getIndex(recordDaysTemp, max)
      mostCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('mostCompleteRecordMonth', mostCompleteRecordMonth)
    }

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'BloodPressure',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        'recommendValue3': recommendValue3,
        'recommendValue4': recommendValue4,
        // 'recommendValue11': 110,
        // 'recommendValue12': 140,
        // 'recommendValue13': 60,
        // 'recommendValue14': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        // 'bestControlMonth': bestControlMonth,
        // 'worstControlMonth': worstControlMonth,
        // 'mostCompleteRecordMonth': mostCompleteRecordMonth,
        // 'worstCompleteRecordMonth': worstCompleteRecordMonth
        'data1': seasonSBP,
        'data2': seasonDBP,
        'recordTime': recordTimeTemp
      }
    )

    // 季报体重
    recordDays = 0
    recordTimes = 0
    average1 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    let averageBMI = 0
    let changeRatio = 0
    let changeRatioBMI = 0
    var seasonWeightTemp = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    bestControlMonth = 0         // 控制最佳月份 季年报
    worstControlMonth = 0        // 控制最差月份 季年报
    mostCompleteRecordMonth = 0  // 记录最完整月份 季年报
    worstCompleteRecordMonth = 0 // 记录最差月份 季年报
    queryR = {
      'userId': patient[i].userId,
      'type': 'season',
      'time': time1,
      'itemType': 'Weight'
    }
    lastTwoSeasonsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoSeasonsReport.length !== 0) {
      // recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      // recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      if (lastTwoSeasonsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      }
      if (lastTwoSeasonsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'Weight',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串，一条记录可能包含多个测量值
    var seasonWeightCursor = db.compliances.find(query, fields)
    var seasonWeight = []
    while (seasonWeightCursor.hasNext()) {
      seasonWeight.push(seasonWeightCursor.next())
    }
    // print('seasonWeight.length', seasonWeight.length)

    // 读取上季季报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      'time': time1
    }
    fields = {}
    var seasonsReportCursor = db.reports.find(query, fields)
    var seasonsReport = []
    while (seasonsReportCursor.hasNext()) {
      seasonsReport.push(seasonsReportCursor.next())
    }
    // print('seasonsReport.length', seasonsReport.length)

    // 读取身高
    query = {
      'role': 'patient',
      'userId': patient[i].userId
    }
    fields = {}
    let height = db.allusers.find(query, fields).toArray()
    let heightTemp = height[0].height

    // 读取的体重记录不为空
    if (seasonWeight.length !== 0) {
      let recordTime = new Date(seasonWeight[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < seasonWeight.length; n++) {
        let str = seasonWeight[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonWeight[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonWeightTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(seasonWeight[n].date))
        }

        if (recordTime !== (new Date(seasonWeight[n].date))) { recordDays++ }
        recordTime = new Date(seasonWeight[n].date)
      }
      recordTimes = seasonWeightTemp.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, seasonWeightTemp)
      min1 = Math.min.apply(null, seasonWeightTemp)
      average1 = average(seasonWeightTemp)
      if (heightTemp !== 0) {
        averageBMI = ~~(average1 / Math.pow(heightTemp / 100, 2) * 100) / 100
      } else {
        averageBMI = 0 // 无身高数据，置0
      }
      // print('average1', average1)
      // print('averageBMI', averageBMI)
      if (seasonsReport.length !== 0) {
        let lastSeasonAverage = seasonsReport[0].average1
        let lastSeasonAverageBMI = seasonsReport[0].averageBMI
        if (lastSeasonAverage) {
          changeRatio = ~~((average1 - lastSeasonAverage) * 100 / lastSeasonAverage * 100) / 100
        }
        if (lastSeasonAverageBMI) {
          changeRatioBMI = ~~((average1 - lastSeasonAverageBMI) * 100 / lastSeasonAverageBMI * 100) / 100
        }
      }
      // print('changeRatio', changeRatio)
      // print('changeRatioBMI', changeRatioBMI)
    }

    // 调取本季各月的月报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInSeason[0]},
        {'time': monthsInSeason[1]},
        {'time': monthsInSeason[2]}
      ]
    }
    fields = {}
    monthsReportCursor = db.reports.find(query, fields)
    monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    let average1Temp = []
    recordTimeTemp1 = []
    recordDaysTemp = []
    recordDaysTimeTemp = []
    recordFlag = 0 // Flag: 0为没有数据记录，1为有数据记录
    for (let p = 0; p < monthsReport.length; p++) {
      if (monthsReport[p].recordDays !== 0) {
        average1Temp.push(monthsReport[p].average1)
        recordTimeTemp1.push(monthsReport[p].time)
        recordDaysTemp.push(monthsReport[p].recordDays)
        recordDaysTimeTemp.push(monthsReport[p].time)
        if (monthsReport[p].recordDays !== 0) { recordFlag = 1 }
      }
    }
    // print(average1Temp)
    // print('recordFlag', recordFlag)

    if (recordFlag) {
      // 控制最佳标准未定，暂定为平均值，后续修改
      let min = Math.min.apply(null, average1Temp)
      let max = Math.max.apply(null, average1Temp)
      let m = getIndex(average1Temp, min)
      bestControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('bestControlMonth', bestControlMonth)
      m = getIndex(average1Temp, max)
      worstControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('worstControlMonth', worstControlMonth)
      min = Math.min.apply(null, recordDaysTemp)
      max = Math.max.apply(null, recordDaysTemp)
      m = getIndex(recordDaysTemp, min)
      worstCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('worstCompleteRecordMonth', worstCompleteRecordMonth)
      m = getIndex(recordDaysTemp, max)
      mostCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('mostCompleteRecordMonth', mostCompleteRecordMonth)
    }

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Weight',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'averageBMI': averageBMI,
        'changeRatio': changeRatio,
        'changeRatioBMI': changeRatioBMI,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 70,
        // 'recommendValue12': 90,
        // 'bestControlMonth': bestControlMonth,
        // 'worstControlMonth': worstControlMonth,
        // 'mostCompleteRecordMonth': mostCompleteRecordMonth,
        // 'worstCompleteRecordMonth': worstCompleteRecordMonth
        'data1': seasonWeightTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 季报尿量
    recordDays = 0
    // var recordTimes = 0
    var seasonVol = []   // 尿量
    average1 = 0
    recommendValue1 = 500
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    query = {
      'code': 'Vol',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var seasonVolCursor = db.compliances.find(query, fields)
    while (seasonVolCursor.hasNext()) {
      seasonVol.push(seasonVolCursor.next())
    }
    // print('seasonVol.length', seasonVol.length)

    // 记录不为空
    var seasonVolTemp = []
    if (seasonVol.length !== 0) {
      let recordTime = new Date(seasonVol[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < seasonVol.length; n++) {
        let str = seasonVol[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonVol[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonVolTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(seasonVol[n].date))
        }

        if (recordTime !== (new Date(seasonVol[n].date))) { recordDays++ }
        recordTime = new Date(seasonVol[n].date)
      }
      // print(seasonVolTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, seasonVolTemp)
      min1 = Math.min.apply(null, seasonVolTemp)
      average1 = average(seasonVolTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeVol(seasonVolTemp, recommendValue1)
      outOfRangeTimeVol(seasonVolTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Vol',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': seasonVolTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 季报体温
    recordTimes = 0
    var seasonT = []
    recommendValue1 = 37.3 // 高于37.3为发热
    outOfRangeTimes1 = 0   // 发热次数
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    let outOfRangeMonth = [] // 超出范围月份
    query = {
      'code': 'Temperature',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var seasonTCursor = db.compliances.find(query, fields)
    while (seasonTCursor.hasNext()) {
      seasonT.push(seasonTCursor.next())
    }
    // print('seasonT.length', seasonT.length)

    // 记录不为空
    let seasonTTemp = []
    if (seasonT.length !== 0) {
      for (let n = 0; n < seasonT.length; n++) {
        let str = seasonT[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonT[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonTTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(seasonT[n].date))
        }
      }
      recordTimes = seasonTTemp.length
      // print('seasonTTemp', seasonTTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      outOfRangeTimes1 = outOfRangeT(seasonTTemp, recommendValue1)
      outOfRangeTimeT(seasonTTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 调取本季各月的月报
    query = {
      'itemType': 'Temperature',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInSeason[0]},
        {'time': monthsInSeason[1]},
        {'time': monthsInSeason[2]}
      ]
    }
    fields = {}
    monthsReportCursor = db.reports.find(query, fields)
    monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    for (let q = 0; q < monthsReport.length; q++) {
      if (monthsReport[q].outOfRangeTimes1 > 0) {
        outOfRangeMonth.push(Number(monthsReport[q].time.substr(4, 2)))
      }
    }
    // print(outOfRangeMonth)
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Temperature',
        'recordTimes': recordTimes,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        // 'outOfRangeMonth': outOfRangeMonth,
        'data1': seasonTTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 季报心率
    recordDays = 0
    recordTimes = 0
    var seasonP = []   // 心率
    average1 = 0
    recommendValue1 = 60  // 数据库读取
    recommendValue2 = 100
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'season',
      'time': time1,
      'itemType': 'HeartRate'
    }
    lastTwoSeasonsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoSeasonsReport.length !== 0) {
      // recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      // recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      if (lastTwoSeasonsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      }
      if (lastTwoSeasonsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'HeartRate',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var seasonPCursor = db.compliances.find(query, fields)
    while (seasonPCursor.hasNext()) {
      seasonP.push(seasonPCursor.next())
    }
    // print('seasonP.length', seasonP.length)

    // 记录不为空
    var seasonPTemp = []
    if (seasonP.length !== 0) {
      let recordTime = new Date(seasonP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < seasonP.length; n++) {
        let str = seasonP[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonPTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(seasonP[n].date))
        }

        if (recordTime !== (new Date(seasonP[n].date))) { recordDays++ }
        recordTime = new Date(seasonP[n].date)
      }
      recordTimes = seasonPTemp.length
      // print(seasonPTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, seasonPTemp)
      min1 = Math.min.apply(null, seasonPTemp)
      average1 = average(seasonPTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeP(seasonPTemp, recommendValue1, recommendValue2)
      outOfRangeTimeP(seasonPTemp, recommendValue1, recommendValue2, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)

      // 调取本季各月的月报
      query = {
        'itemType': 'HeartRate',
        'userId': patient[i].userId,
        '$or': [
          {'time': monthsInSeason[0]},
          {'time': monthsInSeason[1]},
          {'time': monthsInSeason[2]}
        ]
      }
      fields = {}
      monthsReportCursor = db.reports.find(query, fields)
      monthsReport = []
      while (monthsReportCursor.hasNext()) {
        monthsReport.push(monthsReportCursor.next())
      }
      outOfRangeTimes1 = 0
      outOfRangeTime1 = []
      for (let q = 0; q < monthsReport.length; q++) {
        outOfRangeTimes1 += monthsReport[q].outOfRangeTimes1
        for (let k = 0; k < monthsReport[q].outOfRangeTime1.length; k++) {
          outOfRangeTime1.push(monthsReport[q].outOfRangeTime1[k])
        }
      }
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'HeartRate',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': seasonPTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 季报腹透
    recordDays = 0
    var seasonPD = []   // 腹透
    average1 = 0
    average2 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    max2 = 0
    min2 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'season',
      'time': time1,
      'itemType': 'PeritonealDialysis'
    }
    lastTwoSeasonsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoSeasonsReport.length !== 0) {
      // recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      // recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      if (lastTwoSeasonsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoSeasonsReport[0].recommendValue11
      }
      if (lastTwoSeasonsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoSeasonsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'PeritonealDialysis',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastSeason, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    let seasonPDCursor = db.compliances.find(query, fields)
    while (seasonPDCursor.hasNext()) {
      seasonPD.push(seasonPDCursor.next())
    }
    // print('seasonPD.length', seasonPD.length)

    // 记录不为空
    var seasonPDTemp = []
    let dataUFAll = []
    let dataPV = []
    let recordTimeAll = []
    if (seasonPD.length !== 0) {
      let recordTime = new Date(seasonPD[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < seasonPD.length; n++) {
        let str = seasonPD[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(seasonPD[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          seasonPDTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(seasonPD[n].date))
        }

        if (recordTime !== (new Date(seasonPD[n].date))) { recordDays++ }
        recordTime = new Date(seasonPD[n].date)
      }
      // print(seasonPDTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)

      recordTime = new Date(recordTimeTemp[0])
      let tempUF = 0
      // dataUFAll = []
      // recordTimeAll = []
      for (let n = 0; n < recordTimeTemp.length; n++) {
        if (recordTimeTemp[n].getTime() === recordTime.getTime()) {  // 时间的比较
          tempUF += seasonPDTemp[n]
        } else {
          dataUFAll.push(tempUF)
          recordTimeAll.push(recordTime)
          tempUF = seasonPDTemp[n]
        }
        recordTime = new Date(recordTimeTemp[n])
        // console.log('tempUF', tempUF)
        // console.log(dataUFAll)
        // console.log(recordTime)
        // console.log(recordTimeAll)
      }
      dataUFAll.push(tempUF)
      recordTimeAll.push(recordTime)

      let query2 = {}
      // var dataPV = []
      let vol = []
      let volTemp = 0
      let startTime
      let endTime
      for (let n = 0; n < dataUFAll.length; n++) {
        startTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), recordTimeAll[n].getDate(), '00', '00', '00')
        endTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), String(Number(recordTimeAll[n].getDate())), '23', '59', '59')
        query2 = {
          'code': 'Vol',
          'userId': patient[i].userId,  // Alluser.userId
          'date': {$gte: startTime, $lt: endTime}
        }
        // print('recordTimeAll[n]', recordTimeAll[n])
        // print('startTime', startTime)
        // print('endTime', endTime)
        vol = db.compliances.find(query2, fields).toArray()
        for (let j = 0; j < vol.length; j++) {
          volTemp += Number(vol[j].description)
        }
        dataPV.push(volTemp + dataUFAll[n])
        // print('dataUFAll[n]', dataUFAll[n])
        volTemp = 0
      }
      // print('dataPV', dataPV)
      max1 = Math.max.apply(null, dataUFAll)
      min1 = Math.min.apply(null, dataUFAll)
      average1 = average(dataUFAll)
      max2 = Math.max.apply(null, dataPV)
      min2 = Math.min.apply(null, dataPV)
      average2 = average(dataPV)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'PeritonealDialysis',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'data1': dataUFAll,
        'data2': dataPV,
        'recordTime': recordTimeAll
      }
    )

    // 季报化验
    let min = 0
    let max = 0
    let labTestArray = []
    let labTestData = []
    let labTestRecordTime = []
    let _type
    for (let j = 0; j < 5; j++) {
      switch (j) {
        case 0:
          query = {
            'type': 'SCr',
            'userId': patient[i].userId,
            'time': {$gte: lastSeason, $lt: currentTime}
          }
          _type = 'SCr'
          break
        case 1:
          query = {
            'type': 'GFR',
            'userId': patient[i].userId,
            'time': {$gte: lastSeason, $lt: currentTime}
          }
          _type = 'GFR'
          break
        case 2:
          query = {
            'type': 'PRO',
            'userId': patient[i].userId,
            'time': {$gte: lastSeason, $lt: currentTime}
          }
          _type = 'PRO'
          break
        case 3:
          query = {
            'type': 'ALB',
            'userId': patient[i].userId,
            'time': {$gte: lastSeason, $lt: currentTime}
          }
          _type = 'ALB'
          break
        case 4:
          query = {
            'type': 'HB',
            'userId': patient[i].userId,
            'time': {$gte: lastSeason, $lt: currentTime}
          }
          _type = 'HB'
          break
      }
      let fields = {}
      let seasonLab = db.labtestimports.find(query, fields).toArray()
      let seasonLabTemp = []
      let seasonRecordTimeTemp = []
      if (seasonLab.length !== 0) {
        for (let n = 0; n < seasonLab.length; n++) {
          seasonLabTemp.push(seasonLab[n].value)
          seasonRecordTimeTemp.push(new Date(seasonLab[n].time))
        }
        max = Math.max.apply(null, seasonLabTemp)
        min = Math.min.apply(null, seasonLabTemp)
        labTestArray.push({_type, max, min})
      }
      labTestData.push(seasonLabTemp)
      labTestRecordTime.push(seasonRecordTimeTemp)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'LabTest',
        'labTestArray': labTestArray,
        'data1': labTestData[0],
        'data2': labTestData[1],
        'data3': labTestData[2],
        'data4': labTestData[3],
        'data5': labTestData[4],
        'recordTime': labTestRecordTime[0],
        'recordTime2': labTestRecordTime[1],
        'recordTime3': labTestRecordTime[2],
        'recordTime4': labTestRecordTime[3],
        'recordTime5': labTestRecordTime[4]
      }
    )
  }
  printjson({'result': 'insertSeasonReport_success', 'insertSeasonReport_item': patient.length, 'insertSeasonReport_time': currentTime})
}

if (currentMonth === 1 && currentDate === 1) {
  let lastYearY = currentYear - 1
  var lastYear = new Date(lastYearY, currentMonth - 1, currentDate, '00', '00', '00')
  // print(lastYear)
  var monthsInYear = []
  for (let i = 0; i < 12; i++) {
    monthsInYear[i] = String(lastYearY) + String(add0(1 + i))
  }
  // print(monthsInYear)
  type = 'year'
  // print(type)
  time = String(lastYearY)
  // print('time', time)

  let lastTwoYearsY = currentYear - 2
  var lastTwoYears = new Date(lastTwoYearsY, currentMonth - 1, currentDate, '00', '00', '00')
  // print(lastTwoYears)
  var time1 = String(lastTwoYearsY)
  // print('time1', time1)

  // 年报血压
  // 遍历所有患者
  for (let i = 0; i < patient.length; i++) {
    // print(patient[i].userId)
    // 年报血压
    var recordDays = 0
    var recordTimes = 0
    var yearSBP = []         // 收缩压 SBP
    var yearDBP = []         // 舒张压 DBP
    var average1 = 0
    var average2 = 0
    var recommendValue1 = 110  // 数据库读取
    var recommendValue2 = 140
    var recommendValue3 = 60
    var recommendValue4 = 90
    var outOfRangeTimes1 = 0
    var outOfRangeTime1 = []
    var recordTimeTemp = []  // 所有记录的记录时间
    var max1 = 0
    var min1 = 0
    var max2 = 0
    var min2 = 0
    var bestControlMonth = 0         // 控制最佳月份 季年报
    var worstControlMonth = 0        // 控制最差月份 季年报
    var mostCompleteRecordMonth = 0  // 记录最完整月份 季年报
    var worstCompleteRecordMonth = 0 // 记录最差月份 季年报
    let queryR = {
      'userId': patient[i].userId,
      'type': 'year',
      'time': time1,
      'itemType': 'BloodPressure'
    }
    let lastTwoYearsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoYearsReport.length !== 0) {
      if (lastTwoYearsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoYearsReport[0].recommendValue11
      }
      if (lastTwoYearsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoYearsReport[0].recommendValue12
      }
      if (lastTwoYearsReport[0].recommendValue13 !== undefined) {
        recommendValue3 = lastTwoYearsReport[0].recommendValue13
      }
      if (lastTwoYearsReport[0].recommendValue14 !== undefined) {
        recommendValue4 = lastTwoYearsReport[0].recommendValue14
      }
    }
    query = {
      'code': 'BloodPressure',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串,如125/75
    var yearBPCursor = db.compliances.find(query, fields)
    var yearBP = []
    while (yearBPCursor.hasNext()) {
      yearBP.push(yearBPCursor.next())
    }
    // print('yearBP.length', yearBP.length)

    // 记录不为空
    if (yearBP.length !== 0) {
      let recordTime = new Date(yearBP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < yearBP.length; n++) {
        let str = yearBP[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearBP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearSBP.push(Number(strArr[k].substr(0, str.indexOf('/'))))
          yearDBP.push(Number(strArr[k].substr(str.indexOf('/') + 1)))
          recordTimeTemp.push(new Date(yearBP[n].date))
        }
        if (recordTime !== (new Date(yearBP[n].date))) { recordDays++ }
        recordTime = new Date(yearBP[n].date)
      }
      recordTimes = yearSBP.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, yearSBP)
      min1 = Math.min.apply(null, yearSBP)
      max2 = Math.max.apply(null, yearDBP)
      min2 = Math.min.apply(null, yearDBP)
      average1 = average(yearSBP)
      average2 = average(yearDBP)
      // print('average1', average1)
      // print('average2', average2)
      outOfRangeTimes1 = outOfRange(yearSBP, recommendValue1, recommendValue2, yearDBP, recommendValue3, recommendValue4, outOfRangeTime1)
      outOfRangeTime(yearSBP, recommendValue1, recommendValue2, yearDBP, recommendValue3, recommendValue4, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 调取本年中各月的月报
    query = {
      'itemType': 'BloodPressure',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInYear[0]},
        {'time': monthsInYear[1]},
        {'time': monthsInYear[2]},
        {'time': monthsInYear[3]},
        {'time': monthsInYear[4]},
        {'time': monthsInYear[5]},
        {'time': monthsInYear[6]},
        {'time': monthsInYear[7]},
        {'time': monthsInYear[8]},
        {'time': monthsInYear[9]},
        {'time': monthsInYear[10]},
        {'time': monthsInYear[11]}
      ]
    }
    fields = {}
    var monthsReportCursor = db.reports.find(query, fields)
    var monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    let outOfRangeTimes1Temp = []
    let recordTimeTemp1 = []
    let recordDaysTemp = []
    let recordDaysTimeTemp = []
    let recordFlag = 0 // Flag: 0为没有数据记录，1为有数据记录
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    for (let p = 0; p < monthsReport.length; p++) {
      outOfRangeTimes1 += monthsReport[p].outOfRangeTimes1   // 从月报获取超出范围次数
      for (let k = 0; k < monthsReport[p].outOfRangeTime1.length; k++) {
        outOfRangeTime1.push(monthsReport[p].outOfRangeTime1[k])
      }
      outOfRangeTimes1Temp.push(monthsReport[p].outOfRangeTimes1)
      recordTimeTemp1.push(monthsReport[p].time)
      recordDaysTemp.push(monthsReport[p].recordDays)
      recordDaysTimeTemp.push(monthsReport[p].time)
      if (monthsReport[p].recordDays !== 0) { recordFlag = 1 }
    }
    // print(outOfRangeTimes1Temp)
    // print('recordFlag', recordFlag)

    if (recordFlag) {
      // 控制最佳标准未定，后续修改
      let min = Math.min.apply(null, outOfRangeTimes1Temp)
      let max = Math.max.apply(null, outOfRangeTimes1Temp)
      let m = getIndex(outOfRangeTimes1Temp, min)
      bestControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('bestControlMonth', bestControlMonth)
      m = getIndex(outOfRangeTimes1Temp, max)
      worstControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('worstControlMonth', worstControlMonth)
      min = Math.min.apply(null, recordDaysTemp)
      max = Math.max.apply(null, recordDaysTemp)
      m = getIndex(recordDaysTemp, min)
      worstCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('worstCompleteRecordMonth', worstCompleteRecordMonth)
      m = getIndex(recordDaysTemp, max)
      mostCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('mostCompleteRecordMonth', mostCompleteRecordMonth)
    }

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'BloodPressure',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        'recommendValue3': recommendValue3,
        'recommendValue4': recommendValue4,
        // 'recommendValue11': 110,
        // 'recommendValue12': 140,
        // 'recommendValue13': 60,
        // 'recommendValue14': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        // 'bestControlMonth': bestControlMonth,
        // 'worstControlMonth': worstControlMonth,
        // 'mostCompleteRecordMonth': mostCompleteRecordMonth,
        // 'worstCompleteRecordMonth': worstCompleteRecordMonth
        'data1': yearSBP,
        'data2': yearDBP,
        'recordTime': recordTimeTemp
      }
    )

    // 年报体重
    recordDays = 0
    recordTimes = 0
    average1 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    let averageBMI = 0
    let changeRatio = 0
    let changeRatioBMI = 0
    var yearWeightTemp = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    bestControlMonth = 0         // 控制最佳月份 季年报
    worstControlMonth = 0        // 控制最差月份 季年报
    mostCompleteRecordMonth = 0  // 记录最完整月份 季年报
    worstCompleteRecordMonth = 0 // 记录最差月份 季年报
    queryR = {
      'userId': patient[i].userId,
      'type': 'year',
      'time': time1,
      'itemType': 'Weight'
    }
    lastTwoYearsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoYearsReport.length !== 0) {
      // recommendValue1 = lastTwoYearsReport[0].recommendValue11
      // recommendValue2 = lastTwoYearsReport[0].recommendValue12
      if (lastTwoYearsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoYearsReport[0].recommendValue11
      }
      if (lastTwoYearsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoYearsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'Weight',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串，一条记录可能包含多个测量值
    var yearWeightCursor = db.compliances.find(query, fields)
    var yearWeight = []
    while (yearWeightCursor.hasNext()) {
      yearWeight.push(yearWeightCursor.next())
    }
    // print('yearWeight.length', yearWeight.length)

    // 读取上年年报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      'time': time1
    }
    fields = {}
    var yearsReportCursor = db.reports.find(query, fields)
    var yearsReport = []
    while (yearsReportCursor.hasNext()) {
      yearsReport.push(yearsReportCursor.next())
    }
    // print('yearsReport.length', yearsReport.length)

    // 读取身高
    query = {
      'role': 'patient',
      'userId': patient[i].userId
    }
    fields = {}
    let height = db.allusers.find(query, fields).toArray()
    let heightTemp = height[0].height

    // 读取的体重记录不为空
    if (yearWeight.length !== 0) {
      let recordTime = new Date(yearWeight[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < yearWeight.length; n++) {
        let str = yearWeight[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearWeight[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearWeightTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(yearWeight[n].date))
        }

        if (recordTime !== (new Date(yearWeight[n].date))) { recordDays++ }
        recordTime = new Date(yearWeight[n].date)
      }
      recordTimes = yearWeightTemp.length
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, yearWeightTemp)
      min1 = Math.min.apply(null, yearWeightTemp)
      average1 = average(yearWeightTemp)
      if (heightTemp !== 0) {
        averageBMI = ~~(average1 / Math.pow(heightTemp / 100, 2) * 100) / 100
      } else {
        averageBMI = 0 // 无身高数据，置0
      }
      // print('average1', average1)
      // print('averageBMI', averageBMI)
      if (yearsReport.length !== 0) {
        let lastYearAverage = yearsReport[0].average1
        let lastYearAverageBMI = yearsReport[0].averageBMI
        if (lastYearAverage) {
          changeRatio = ~~(Math.abs((average1 - lastYearAverage) * 100 / lastYearAverage) * 100) / 100
        }
        if (lastYearAverageBMI) {
          changeRatioBMI = ~~(Math.abs((averageBMI - lastYearAverageBMI) * 100 / lastYearAverageBMI) * 100) / 100
        }
      }
      // print('changeRatio', changeRatio)
      // print('changeRatioBMI', changeRatioBMI)
    }

    // 调取本年中各月的月报
    query = {
      'itemType': 'Weight',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInYear[0]},
        {'time': monthsInYear[1]},
        {'time': monthsInYear[2]},
        {'time': monthsInYear[3]},
        {'time': monthsInYear[4]},
        {'time': monthsInYear[5]},
        {'time': monthsInYear[6]},
        {'time': monthsInYear[7]},
        {'time': monthsInYear[8]},
        {'time': monthsInYear[9]},
        {'time': monthsInYear[10]},
        {'time': monthsInYear[11]}
      ]
    }
    fields = {}
    monthsReportCursor = db.reports.find(query, fields)
    monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    let average1Temp = []
    recordTimeTemp1 = []
    recordDaysTemp = []
    recordDaysTimeTemp = []
    recordFlag = 0 // Flag: 0为没有数据记录，1为有数据记录
    for (let p = 0; p < monthsReport.length; p++) {
      if (monthsReport[p].recordDays !== 0) {
        average1Temp.push(monthsReport[p].average1)
        recordTimeTemp1.push(monthsReport[p].time)
        recordDaysTemp.push(monthsReport[p].recordDays)
        recordDaysTimeTemp.push(monthsReport[p].time)
        if (monthsReport[p].recordDays !== 0) { recordFlag = 1 }
      }
    }
    // print(average1Temp)
    // print('recordFlag', recordFlag)

    if (recordFlag) {
      // 控制最佳标准未定，暂定为平均值，后续修改
      let min = Math.min.apply(null, average1Temp)
      let max = Math.max.apply(null, average1Temp)
      let m = getIndex(average1Temp, min)
      bestControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('bestControlMonth', bestControlMonth)
      m = getIndex(average1Temp, max)
      worstControlMonth = Number(recordTimeTemp1[m].substr(4, 2))
      // print('worstControlMonth', worstControlMonth)
      min = Math.min.apply(null, recordDaysTemp)
      max = Math.max.apply(null, recordDaysTemp)
      m = getIndex(recordDaysTemp, min)
      worstCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('worstCompleteRecordMonth', worstCompleteRecordMonth)
      m = getIndex(recordDaysTemp, max)
      mostCompleteRecordMonth = Number(recordDaysTimeTemp[m].substr(4, 2))
      // print('mostCompleteRecordMonth', mostCompleteRecordMonth)
    }

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Weight',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'averageBMI': averageBMI,
        'changeRatio': changeRatio,
        'changeRatioBMI': changeRatioBMI,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 70,
        // 'recommendValue12': 90,
        // 'bestControlMonth': bestControlMonth,
        // 'worstControlMonth': worstControlMonth,
        // 'mostCompleteRecordMonth': mostCompleteRecordMonth,
        // 'worstCompleteRecordMonth': worstCompleteRecordMonth
        'data1': yearWeightTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 年报尿量
    recordDays = 0
    // var recordTimes = 0
    var yearVol = []   // 尿量
    average1 = 0
    recommendValue1 = 500
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    query = {
      'code': 'Vol',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var yearVolCursor = db.compliances.find(query, fields)
    while (yearVolCursor.hasNext()) {
      yearVol.push(yearVolCursor.next())
    }
    // print('yearVol.length', yearVol.length)

    // 记录不为空
    var yearVolTemp = []
    if (yearVol.length !== 0) {
      let recordTime = new Date(yearVol[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < yearVol.length; n++) {
        let str = yearVol[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearVol[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearVolTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(yearVol[n].date))
        }

        if (recordTime !== (new Date(yearVol[n].date))) { recordDays++ }
        recordTime = new Date(yearVol[n].date)
      }
      // print(yearVolTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, yearVolTemp)
      min1 = Math.min.apply(null, yearVolTemp)
      average1 = average(yearVolTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeVol(yearVolTemp, recommendValue1)
      outOfRangeTimeVol(yearVolTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Vol',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': yearVolTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 年报体温
    recordTimes = 0
    var yearT = []
    recommendValue1 = 37.3 // 高于37.3为发热
    outOfRangeTimes1 = 0   // 发热次数
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    let outOfRangeMonth = []
    query = {
      'code': 'Temperature',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var yearTCursor = db.compliances.find(query, fields)
    while (yearTCursor.hasNext()) {
      yearT.push(yearTCursor.next())
    }
    // print('yearT.length', yearT.length)

    // 记录不为空
    let yearTTemp = []
    if (yearT.length !== 0) {
      for (let n = 0; n < yearT.length; n++) {
        let str = yearT[n].description
      // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearT[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearTTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(yearT[n].date))
        }
      }
      recordTimes = yearTTemp.length
      // print('yearTTemp', yearTTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      outOfRangeTimes1 = outOfRangeT(yearTTemp, recommendValue1)
      outOfRangeTimeT(yearTTemp, recommendValue1, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)
    }
    // 调取本年中各月的月报
    query = {
      'itemType': 'Temperature',
      'userId': patient[i].userId,
      '$or': [
        {'time': monthsInYear[0]},
        {'time': monthsInYear[1]},
        {'time': monthsInYear[2]},
        {'time': monthsInYear[3]},
        {'time': monthsInYear[4]},
        {'time': monthsInYear[5]},
        {'time': monthsInYear[6]},
        {'time': monthsInYear[7]},
        {'time': monthsInYear[8]},
        {'time': monthsInYear[9]},
        {'time': monthsInYear[10]},
        {'time': monthsInYear[11]}
      ]
    }
    fields = {}
    monthsReportCursor = db.reports.find(query, fields)
    monthsReport = []
    while (monthsReportCursor.hasNext()) {
      monthsReport.push(monthsReportCursor.next())
    }
    // print('monthsReport.length', monthsReport.length)
    for (let q = 0; q < monthsReport.length; q++) {
      if (monthsReport[q].outOfRangeTimes1 > 0) {
        outOfRangeMonth.push(Number(monthsReport[q].time.substr(4, 2)))
      }
    }
    // print(outOfRangeMonth)

    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'Temperature',
        'recordTimes': recordTimes,
        'recommendValue1': recommendValue1,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        // 'outOfRangeMonth': outOfRangeMonth,
        'data1': yearTTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 年报心率
    recordDays = 0
    recordTimes = 0
    var yearP = []   // 心率
    average1 = 0
    recommendValue1 = 60  // 数据库读取
    recommendValue2 = 100
    outOfRangeTimes1 = 0
    outOfRangeTime1 = []
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'year',
      'time': time1,
      'itemType': 'HeartRate'
    }
    lastTwoYearsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoYearsReport.length !== 0) {
      // recommendValue1 = lastTwoYearsReport[0].recommendValue11
      // recommendValue2 = lastTwoYearsReport[0].recommendValue12
      if (lastTwoYearsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoYearsReport[0].recommendValue11
      }
      if (lastTwoYearsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoYearsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'HeartRate',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    var yearPCursor = db.compliances.find(query, fields)
    while (yearPCursor.hasNext()) {
      yearP.push(yearPCursor.next())
    }
    // print('yearP.length', yearP.length)

    // 记录不为空
    var yearPTemp = []
    if (yearP.length !== 0) {
      let recordTime = new Date(yearP[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < yearP.length; n++) {
        let str = yearP[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearP[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearPTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(yearP[n].date))
        }

        if (recordTime !== (new Date(yearP[n].date))) { recordDays++ }
        recordTime = new Date(yearP[n].date)
      }
      recordTimes = yearPTemp.length
      // print(yearPTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordTimes', recordTimes)
      // print('recordDays', recordDays)
      max1 = Math.max.apply(null, yearPTemp)
      min1 = Math.min.apply(null, yearPTemp)
      average1 = average(yearPTemp)
      // print('average1', average1)
      outOfRangeTimes1 = outOfRangeP(yearPTemp, recommendValue1, recommendValue2)
      outOfRangeTimeP(yearPTemp, recommendValue1, recommendValue2, recordTimeTemp, outOfRangeTime1)
      // print('outOfRangeTimes', outOfRangeTimes1)
      // print('outOfRangeTime', outOfRangeTime1.length)

      // 调取本年中各月的月报
      query = {
        'itemType': 'HeartRate',
        'userId': patient[i].userId,
        '$or': [
          {'time': monthsInYear[0]},
          {'time': monthsInYear[1]},
          {'time': monthsInYear[2]},
          {'time': monthsInYear[3]},
          {'time': monthsInYear[4]},
          {'time': monthsInYear[5]},
          {'time': monthsInYear[6]},
          {'time': monthsInYear[7]},
          {'time': monthsInYear[8]},
          {'time': monthsInYear[9]},
          {'time': monthsInYear[10]},
          {'time': monthsInYear[11]}
        ]
      }
      fields = {}
      monthsReportCursor = db.reports.find(query, fields)
      monthsReport = []
      while (monthsReportCursor.hasNext()) {
        monthsReport.push(monthsReportCursor.next())
      }
      outOfRangeTimes1 = 0
      outOfRangeTime1 = []
      for (let p = 0; p < monthsReport.length; p++) {
        outOfRangeTimes1 += monthsReport[p].outOfRangeTimes1
        for (let k = 0; k < monthsReport[p].outOfRangeTime1.length; k++) {
          outOfRangeTime1.push(monthsReport[p].outOfRangeTime1[k])
        }
      }
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'HeartRate',
        'recordDays': recordDays,
        'recordTimes': recordTimes,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'outOfRangeTimes1': outOfRangeTimes1,
        'outOfRangeTime1': outOfRangeTime1,
        'data1': yearPTemp,
        'recordTime': recordTimeTemp
      }
    )

    // 年报腹透
    recordDays = 0
    var yearPD = []   // 腹透
    average1 = 0
    average2 = 0
    recommendValue1 = 0  // 数据库读取
    recommendValue2 = 0
    recordTimeTemp = []  // 所有记录的记录时间
    max1 = 0
    min1 = 0
    max2 = 0
    min2 = 0
    queryR = {
      'userId': patient[i].userId,
      'type': 'year',
      'time': time1,
      'itemType': 'PeritonealDialysis'
    }
    lastTwoYearsReport = db.reports.find(queryR, fields).toArray()
    if (lastTwoYearsReport.length !== 0) {
      // recommendValue1 = lastTwoYearsReport[0].recommendValue11
      // recommendValue2 = lastTwoYearsReport[0].recommendValue12
      if (lastTwoYearsReport[0].recommendValue11 !== undefined) {
        recommendValue1 = lastTwoYearsReport[0].recommendValue11
      }
      if (lastTwoYearsReport[0].recommendValue12 !== undefined) {
        recommendValue2 = lastTwoYearsReport[0].recommendValue12
      }
    }
    query = {
      'code': 'PeritonealDialysis',
      'userId': patient[i].userId,  // Alluser.userId
      'date': {$gte: lastYear, $lt: currentTime} // >= <
    }
    fields = {
      '_id': 0,
      'userId': 0,
      'type': 0,
      'code': 0,
        // 'date': 0,
      'status': 0
    }
    // 获取到的数据为字符串
    let yearPDCursor = db.compliances.find(query, fields)
    while (yearPDCursor.hasNext()) {
      yearPD.push(yearPDCursor.next())
    }
    // print('yearPD.length', yearPD.length)

    // 记录不为空
    var yearPDTemp = []
    let dataUFAll = []
    let dataPV = []
    let recordTimeAll = []
    if (yearPD.length !== 0) {
      let recordTime = new Date(yearPD[0].date)  // 记录时间用于判断记录天数   // 没记录时为undefined，报错
      for (let n = 0; n < yearPD.length; n++) {
        let str = yearPD[n].description
        // 一条记录中有多次测量数据
        let strArr1 = str.split('，')  // 逗号的格式，可能中文和英文都要添加判断
        let strArr2 = str.split(',')
        let strArr
        if (strArr1.length >= strArr2.length) {
          strArr = strArr1
        } else {
          strArr = strArr2
        }
        // print(yearPD[n].description)
        // print('strArr.length', strArr.length)
        for (let k = 0; k < strArr.length; k++) {
          yearPDTemp.push(Number(strArr[k]))
          recordTimeTemp.push(new Date(yearPD[n].date))
        }

        if (recordTime !== (new Date(yearPD[n].date))) { recordDays++ }
        recordTime = new Date(yearPD[n].date)
      }
      // print(yearPDTemp)
      // print('recordTimeTemp', recordTimeTemp)
      // print('recordDays', recordDays)

      recordTime = new Date(recordTimeTemp[0])
      let tempUF = 0
      dataUFAll = []
      recordTimeAll = []
      for (let n = 0; n < recordTimeTemp.length; n++) {
        if (recordTimeTemp[n].getTime() === recordTime.getTime()) {  // 时间的比较
          tempUF += yearPDTemp[n]
        } else {
          dataUFAll.push(tempUF)
          recordTimeAll.push(recordTime)
          tempUF = yearPDTemp[n]
        }
        recordTime = new Date(recordTimeTemp[n])
        // console.log('tempUF', tempUF)
        // console.log(dataUFAll)
        // console.log(recordTime)
        // console.log(recordTimeAll)
      }
      dataUFAll.push(tempUF)
      recordTimeAll.push(recordTime)

      let query2 = {}
      dataPV = []
      let vol = []
      let volTemp = 0
      let startTime
      let endTime
      for (let n = 0; n < dataUFAll.length; n++) {
        startTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), recordTimeAll[n].getDate(), '00', '00', '00')
        endTime = new Date(recordTimeAll[n].getFullYear(), recordTimeAll[n].getMonth(), String(Number(recordTimeAll[n].getDate())), '23', '59', '59')
        query2 = {
          'code': 'Vol',
          'userId': patient[i].userId,  // Alluser.userId
          'date': {$gte: startTime, $lt: endTime}
        }
        // print('recordTimeAll[n]', recordTimeAll[n])
        // print('startTime', startTime)
        // print('endTime', endTime)
        vol = db.compliances.find(query2, fields).toArray()
        for (let j = 0; j < vol.length; j++) {
          volTemp += Number(vol[j].description)
        }
        dataPV.push(volTemp + dataUFAll[n])
        // print('dataUFAll[n]', dataUFAll[n])
        volTemp = 0
      }
      // print('dataPV', dataPV)
      max1 = Math.max.apply(null, dataUFAll)
      min1 = Math.min.apply(null, dataUFAll)
      average1 = average(dataUFAll)
      max2 = Math.max.apply(null, dataPV)
      min2 = Math.min.apply(null, dataPV)
      average2 = average(dataPV)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'PeritonealDialysis',
        'recordDays': recordDays,
        'average1': average1,
        'max1': max1,
        'min1': min1,
        'average2': average2,
        'max2': max2,
        'min2': min2,
        'recommendValue1': recommendValue1,
        'recommendValue2': recommendValue2,
        // 'recommendValue11': 60,
        // 'recommendValue12': 90,
        'data1': dataUFAll,
        'data2': dataPV,
        'recordTime': recordTimeAll
      }
    )

    // 年报化验
    let min = 0
    let max = 0
    let labTestArray = []
    let labTestData = []
    let labTestRecordTime = []
    let _type
    for (let j = 0; j < 5; j++) {
      switch (j) {
        case 0:
          query = {
            'type': 'SCr',
            'userId': patient[i].userId,
            'time': {$gte: lastYear, $lt: currentTime}
          }
          _type = 'SCr'
          break
        case 1:
          query = {
            'type': 'GFR',
            'userId': patient[i].userId,
            'time': {$gte: lastYear, $lt: currentTime}
          }
          _type = 'GFR'
          break
        case 2:
          query = {
            'type': 'PRO',
            'userId': patient[i].userId,
            'time': {$gte: lastYear, $lt: currentTime}
          }
          _type = 'PRO'
          break
        case 3:
          query = {
            'type': 'ALB',
            'userId': patient[i].userId,
            'time': {$gte: lastYear, $lt: currentTime}
          }
          _type = 'ALB'
          break
        case 4:
          query = {
            'type': 'HB',
            'userId': patient[i].userId,
            'time': {$gte: lastYear, $lt: currentTime}
          }
          _type = 'HB'
          break
      }
      let fields = {}
      let yearLab = db.labtestimports.find(query, fields).toArray()
      let yearLabTemp = []
      let yearRecordTimeTemp = []
      if (yearLab.length !== 0) {
        for (let n = 0; n < yearLab.length; n++) {
          yearLabTemp.push(yearLab[n].value)
          yearRecordTimeTemp.push(new Date(yearLab[n].time))
        }
        max = Math.max.apply(null, yearLabTemp)
        min = Math.min.apply(null, yearLabTemp)
        labTestArray.push({_type, max, min})
      }
      labTestData.push(yearLabTemp)
      labTestRecordTime.push(yearRecordTimeTemp)
    }
    // 插入数据
    db.reports.insert(
      {
        'patientId': patient[i]._id,
        'userId': patient[i].userId,
        'type': type,
        'time': time,
        'itemType': 'LabTest',
        'labTestArray': labTestArray,
        'data1': labTestData[0],
        'data2': labTestData[1],
        'data3': labTestData[2],
        'data4': labTestData[3],
        'data5': labTestData[4],
        'recordTime': labTestRecordTime[0],
        'recordTime2': labTestRecordTime[1],
        'recordTime3': labTestRecordTime[2],
        'recordTime4': labTestRecordTime[3],
        'recordTime5': labTestRecordTime[4]
      }
    )
  }
  printjson({'result': 'insertYearReport_success', 'insertYearReport_item': patient.length, 'insertYearReport_time': currentTime})
}

function average (arr) {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return ~~(sum / arr.length * 100) / 100  // 保留两位小数
}

function outOfRange (arr1, a1, a2, arr2, a3, a4) {
  let count = 0
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1 || arr1[i] > a2 || arr2[i] < a3 || arr2[i] > a4) {
      count++
    }
  }
  return count
}

function outOfRangeT (arr1, a1) {
  let count = 0
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] > a1) {
      count++
    }
  }
  return count
}

function outOfRangeP (arr1, a1, a2) {
  let count = 0
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1 || arr1[i] > a2) {
      count++
    }
  }
  return count
}

function outOfRangeVol (arr1, a1) {
  let count = 0
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1) {
      count++
    }
  }
  return count
}

function outOfRangeTime (arr1, a1, a2, arr2, a3, a4, arr3, arr4) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1 || arr1[i] > a2 || arr2[i] < a3 || arr2[i] > a4) {
      arr4.push(new Date(arr3[i]))
    }
  }
}

function outOfRangeTimeT (arr1, a1, arr2, arr3) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] > a1) {
      arr3.push(new Date(arr2[i]))
    }
  }
}

function outOfRangeTimeP (arr1, a1, a2, arr2, arr3) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1 || arr1[i] > a2) {
      arr3.push(new Date(arr2[i]))
    }
  }
}

function outOfRangeTimeVol (arr1, a1, arr2, arr3) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < a1) {
      arr3.push(new Date(arr2[i]))
    }
  }
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

function getLastSeason (date) {
  let lastMonth1 = getLastMonthYestdy(date)
  let lastMonth2 = getLastMonthYestdy(new Date(lastMonth1))
  let lastMonth3 = getLastMonthYestdy(new Date(lastMonth2))
  return lastMonth3
}

function getIndex (arr, a) {
  let j
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === a) {
      j = i
      return j
    }
  }
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}
