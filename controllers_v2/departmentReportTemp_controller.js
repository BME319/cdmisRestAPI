
var Department = require('../models/department')
var Counsel = require('../models/counsel')
var PersonalDiag = require('../models/personalDiag')
var Report = require('../models/report')
var DpRelation = require('../models/dpRelation')

// 计算查询起止时间
exports.getPeriodTime = function (req, res, next) {
  let reportType = req.query.reportType || null   // 报表类型
  let currentTime = new Date()
  let startTime = new Date(currentTime)
  let endTime = new Date(currentTime)
  let modify = req.query.modify || null
  if (modify === null) {
    return res.json({result: '请输入modify！'})
  } else {
    modify = Number(modify)
  }
  if (reportType === null) {
    return res.json({result: '请输入reportType！'})
  } else {
    if (reportType === 'week') {
      let currentTimeDay = currentTime.getDay()
      let currentTimeTmp = new Date(currentTime - (currentTimeDay - 1) * 24 * 3600 * 1000)
      startTime = new Date(currentTimeTmp.getFullYear(), currentTimeTmp.getMonth(), currentTimeTmp.getDate(), '00', '00', '00')
      while (modify !== 0) {
        endTime = new Date(startTime)
        startTime = new Date(endTime - 7 * 24 * 3600 * 1000)
        modify++
      }
    }
    if (reportType === 'month') {
      console.log('reportType', reportType)
      startTime.setDate(1)
      startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
      while (modify !== 0) {
        endTime = new Date(startTime)
        startTime = new Date(getLastMonthYestdy(new Date(startTime)))
        startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
        modify++
      }
    }
    if (reportType === 'season') {
      let startTimeM = startTime.getMonth()
      startTimeM = getQuarterStartMonth(startTimeM)
      startTime = new Date(startTime.getFullYear(), startTimeM, startTime.getDate(), '00', '00', '00')
      startTime.setDate(1)
      while (modify !== 0) {
        endTime = new Date(startTime)
        startTime = new Date(getLastSeason(new Date(startTime)))
        startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
        modify++
      }
    }
    if (reportType === 'year') {
      startTime.setMonth(0)
      startTime.setDate(1)
      startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), '00', '00', '00')
      while (modify !== 0) {
        endTime = new Date(startTime)
        startTime = new Date(startTime.getFullYear() - 1, startTime.getMonth(), startTime.getDate(), '00', '00', '00')
        modify++
      }
    }
  }
  req.startTime = new Date(startTime)
  req.endTime = new Date(endTime)
  console.log('startTime', req.startTime)
  console.log('endTime', req.endTime)
  next()
}

// 获取具体医生普通咨询/加急咨询总数
exports.getDocCounsel = function (req, res) {
  let doctorObjectId = req.query.doctorObjectId
  let type = req.query.type || null           // 咨询类型
  let modify = Number(req.query.modify)
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)
  let oneDocSumList = []                      // 具体医生每日咨询总量列表
  let endTimeTmp = new Date(endTime)          // 某日终止时间
  let startTimeTmp                            // 某日起始时间
  if (modify === 0) {
    startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
  } else {
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
  console.log('modify', modify)
  console.log('startTimeTmp', startTimeTmp)
  console.log('endTimeTmp', endTimeTmp)

  let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
  for (let k = 0; k < days; k++) {
    let queryC = {
      'doctorId': doctorObjectId,
      'type': type,
      'time': {$gte: startTimeTmp, $lt: endTimeTmp}
    }
    console.log('queryC', queryC)
    PersonalDiag.getSome(queryC, function (err, items) {
      if (err) {
        return res.status(500).send(err)
      }
      let day = days - k
      let sumTmp = items.length
      oneDocSumList.push({day, sumTmp})
      if (oneDocSumList.length === days) {
        return res.json({data: {oneDocSumList}, msg: '获取成功！', code: 1})
      }
    })
    endTimeTmp = new Date(startTimeTmp)
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
}

// 获取具体医生的预约面诊数
exports.getDocPD = function (req, res) {
  let doctorObjectId = req.query.doctorObjectId
  let modify = Number(req.query.modify)
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)
  let oneDocSumList = []                      // 具体医生每日预约面诊数列表
  let endTimeTmp = new Date(endTime)          // 某日终止时间
  let startTimeTmp                            // 某日起始时间
  if (modify === 0) {
    startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
  } else {
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
  console.log('modify', modify)
  console.log('startTimeTmp', startTimeTmp)
  console.log('endTimeTmp', endTimeTmp)

  let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
  for (let k = 0; k < days; k++) {
    let queryPD = {
      'doctorId': doctorObjectId,
      '$or': [
        {'status': 1},
        {'status': 2}
      ],
      'creatTime': {$gte: startTimeTmp, $lt: endTimeTmp}
    }
    console.log('queryPD', queryPD)
    PersonalDiag.getSome(queryPD, function (err, items) {
      if (err) {
        return res.status(500).send(err)
      }
      let day = days - k
      let sumTmp = items.length
      oneDocSumList.push({day, sumTmp})
      if (oneDocSumList.length === days) {
        return res.json({data: {oneDocSumList}, msg: '获取成功！', code: 1})
      }
    })
    endTimeTmp = new Date(startTimeTmp)
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
}

// 获取具体医生点评患者周／月／季／年报数量
exports.getDocRepComment = function (req, res) {
  let doctorObjectId = req.query.doctorObjectId
  let modify = Number(req.query.modify)
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)
  let oneDocSumList = []                      // 具体医生每日点评患者周／月／季／年报数量
  let endTimeTmp = new Date(endTime)          // 某日终止时间
  let startTimeTmp                            // 某日起始时间
  if (modify === 0) {
    startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
  } else {
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
  console.log('modify', modify)
  console.log('startTimeTmp', startTimeTmp)
  console.log('endTimeTmp', endTimeTmp)

  let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
  for (let k = 0; k < days; k++) {
    let queryD = {'doctorId': doctorObjectId}
    let populate = {
      'path': 'patientsInCharge.patientId',
      'select': {'userId': 1}
    }
    DpRelation.getOne(queryD, function (err, item) {
      if (err) {
        return res.status(500).send(err)
      }
      let patientsList = item.patientsInCharge
      if (patientsList.length === 0) {  // 医生无主管的患者
        let day = days - k
        let sumTmp = 0
        oneDocSumList.push({day, sumTmp})
        if (oneDocSumList.length === days) {
          return res.json({data: {oneDocSumList}, msg: '获取成功！', code: 1})
        }
      }
      for (let i = 0; i < patientsList.length; i++) {
        let queryR = {
          'userId': patientsList[i].patientId.userId,
          'itemType': 'DoctorReport'
          // 'type': 'week',                   // 周月季年点评数分开存？
          // 'doctorReport.insertTime': {$gte: startTimeTmp, $lt: endTimeTmp}
        }
        console.log('queryR', queryR)
        Report.getSome(queryR, function (err, items) {
          if (err) {
            return res.status(500).send(err)
          }
          let day = days - k
          let sumTmp = items.length
          oneDocSumList.push({day, sumTmp})
          if (oneDocSumList.length === days) {
            return res.json({data: {oneDocSumList}, msg: '获取成功！', code: 1})
          }
        })
      }
    }, '', '', populate)
    endTimeTmp = new Date(startTimeTmp)
    startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
  }
}

// function getOneDocCounsel (doctorObjectId, type, startTime, endTime, req, res) {
//   let query = {
//     'doctorId': doctorObjectId,
//     'type': type,
//     'time': {$gte: startTime, $lt: endTime}
//   }
//   Counsel.getSome(query, function (err, items) {
//     if (err) {
//       return res.status(500).send(err)
//     }
//     let docCounselLen = items.length
//     console.log('docCounselLen', docCounselLen)
//     req.docCounselLen = docCounselLen
//     console.log('docCounselLen', req.docCounselLen)
//     // return req.docCounselLen
//   })
// }

// 获取科室普通咨询/加急咨询总数
exports.getDepartmentCounsel = function (req, res) {
  let district = req.query.district || null
  let hospital = req.query.hospital || null
  let department = req.query.department || null
  let type = req.query.type || null               // 咨询类型
  let modify = Number(req.query.modify)
  // let reportType = req.query.reportType || null   // 报表类型
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)

  let query = {}
  if (district === null) {
    return res.json({result: '请输入district！'})
  } else {
    query['district'] = district
  }
  if (hospital === null) {
    return res.json({result: '请输入hospital！'})
  } else {
    query['hospital'] = hospital
  }
  if (department === null) {
    return res.json({result: '请输入department！'})
  } else {
    query['department'] = department
  }
  if (type === null) {
    return res.json({result: '请输入type！'})
  }
  let fields = ''
  Department.getOne(query, fields, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    let doctorsList = item.doctors
    // 医生列表加入科室主任
    for (let i = 0; i < item.departLeader.length; i++) {
      doctorsList.push(item.departLeader[i])
    }
    let docCounselSumList = []                  // 科室每日咨询总量列表
    let oneDocSumList = []                      // 某个医生每日咨询总量列表
    let endTimeTmp = new Date(endTime)          // 某日终止时间
    let startTimeTmp                            // 某日起始时间
    if (modify === 0) {
      startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
    } else {
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
    console.log('modify', modify)
    console.log('startTimeTmp', startTimeTmp)
    console.log('endTimeTmp', endTimeTmp)

    // while (endTimeTmp.getTime() !== startTime.getTime()) {
    let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
    for (let k = 0; k < days; k++) {
      let counselSum = 0
      let docCounselList = []                   // 每个医生咨询的列表
      for (let i = 0; i < doctorsList.length; i++) {
        let doctorObjectId = doctorsList[i]
        // counselSum += getOneDocCounsel(doctorObjectId, type, startTime, endTime)
        let queryC = {
          'doctorId': doctorObjectId,
          'type': type,
          'time': {$gte: startTimeTmp, $lt: endTimeTmp}
        }
        console.log('queryC', queryC)
        Counsel.getSome(queryC, function (err, items) {
          if (err) {
            return res.status(500).send(err)
          }
          let day = days - k
          let sumTmp = items.length
          docCounselList.push(sumTmp)
          oneDocSumList.push({doctorObjectId, day, sumTmp})
          // console.log('docCounselList', docCounselList)
          if (docCounselList.length === doctorsList.length) {
            for (let j = 0; j < docCounselList.length; j++) {
              counselSum += docCounselList[j]
            }
            // let day = days - k
            docCounselSumList.push({day, counselSum})
            if (docCounselSumList.length === days) {
              return res.json({data: {docCounselSumList}, msg: '获取成功！', code: 1})
            }
          }
        })
      }
      endTimeTmp = new Date(startTimeTmp)
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
  })
}

// 获取科室预约面诊数
exports.getDepartmentPD = function (req, res) {
  let district = req.query.district || null
  let hospital = req.query.hospital || null
  let department = req.query.department || null
  let modify = Number(req.query.modify)
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)

  let query = {}
  if (district === null) {
    return res.json({result: '请输入district！'})
  } else {
    query['district'] = district
  }
  if (hospital === null) {
    return res.json({result: '请输入hospital！'})
  } else {
    query['hospital'] = hospital
  }
  if (department === null) {
    return res.json({result: '请输入department！'})
  } else {
    query['department'] = department
  }
  let fields = ''
  Department.getOne(query, fields, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    let doctorsList = item.doctors
    // 医生列表加入科室主任
    for (let i = 0; i < item.departLeader.length; i++) {
      doctorsList.push(item.departLeader[i])
    }
    let docsPDSumList = []                      // 科室每日咨询总量列表
    let endTimeTmp = new Date(endTime)          // 某日终止时间
    let startTimeTmp                            // 某日起始时间
    if (modify === 0) {
      startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
    } else {
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
    console.log('modify', modify)
    console.log('startTimeTmp', startTimeTmp)
    console.log('endTimeTmp', endTimeTmp)

    let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
    for (let k = 0; k < days; k++) {
      let pdSum = 0
      let docsPDList = []                   // 每个医生预约面诊的列表
      for (let i = 0; i < doctorsList.length; i++) {
        let doctorObjectId = doctorsList[i]
        let queryPD = {
          'doctorId': doctorObjectId,
          '$or': [
            {'status': 1},
            {'status': 2}
          ],
          'creatTime': {$gte: startTimeTmp, $lt: endTimeTmp}
        }
        console.log('queryPD', queryPD)
        PersonalDiag.getSome(queryPD, function (err, items) {
          if (err) {
            return res.status(500).send(err)
          }
          let day = days - k
          let sumTmp = items.length
          docsPDList.push(sumTmp)
          if (docsPDList.length === doctorsList.length) {
            for (let j = 0; j < docsPDList.length; j++) {
              pdSum += docsPDList[j]
            }
            docsPDSumList.push({day, pdSum})
            if (docsPDSumList.length === days) {
              return res.json({data: {docsPDSumList}, msg: '获取成功！', code: 1})
            }
          }
        })
      }
      endTimeTmp = new Date(startTimeTmp)
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
  })
}

// 获取科室点评患者周／月／季／年报数量
exports.getDepartRepComment = function (req, res) {
  let district = req.query.district || null
  let hospital = req.query.hospital || null
  let department = req.query.department || null
  let modify = Number(req.query.modify)
  let startTime = new Date(req.startTime)
  let endTime = new Date(req.endTime)

  let query = {}
  if (district === null) {
    return res.json({result: '请输入district！'})
  } else {
    query['district'] = district
  }
  if (hospital === null) {
    return res.json({result: '请输入hospital！'})
  } else {
    query['hospital'] = hospital
  }
  if (department === null) {
    return res.json({result: '请输入department！'})
  } else {
    query['department'] = department
  }
  let fields = ''
  Department.getOne(query, fields, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    let doctorsList = item.doctors
    // 医生列表加入科室主任
    for (let i = 0; i < item.departLeader.length; i++) {
      doctorsList.push(item.departLeader[i])
    }
    let docsWeekRCSumList = []                      // 科室每日点评报表总量列表
    let docsMonthRCSumList = []
    let docsSeasonRCSumList = []
    let docsYearRCSumList = []
    let endTimeTmp = new Date(endTime)          // 某日终止时间
    let startTimeTmp                            // 某日起始时间
    if (modify === 0) {
      startTimeTmp = new Date(endTimeTmp.getFullYear(), endTimeTmp.getMonth(), endTimeTmp.getDate(), '00', '00', '00')
    } else {
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
    console.log('modify', modify)
    console.log('startTimeTmp', startTimeTmp)
    console.log('endTimeTmp', endTimeTmp)

    let days = Math.ceil((endTime - startTime) / (24 * 3600 * 1000))
    for (let k = 0; k < days; k++) {
      // let rcSum = 0
      let docsWeekRCList = []                   // 每个医生点评报表的列表
      let docsMonthRCList = []
      let docsSeasonRCList = []
      let docsYearRCList = []
      for (let i = 0; i < doctorsList.length; i++) {
        let doctorObjectId = doctorsList[i]
        // let queryD = {'doctorId': doctorObjectId}
        // let docRCSum = 0                   // 某个医生某天点评报表总数
        let docsWeekRCSum = 0
        let docsMonthRCSum = 0
        let docsSeasonRCSum = 0
        let docsYearRCSum = 0
        // let populate = {
        //   'path': 'patientsInCharge.patientId',
        //   'select': {'userId': 1}
        // }
        let queryR = {
          'itemType': 'DoctorReport',
          // 'type': 'week',                   // 分别存储周月季年点评数
          'doctorReport.doctorId': doctorObjectId,
          'doctorReport.insertTime': {$gte: startTimeTmp, $lt: endTimeTmp}
        }
        Report.getSome(queryR, function (err, items) {
          if (err) {
            return res.status(500).send(err)
          }
          console.log('items', items)
          let sumWeekTmp = 0
          let sumMonthTmp = 0
          let sumSeasonTmp = 0
          let sumYearTmp = 0
          for (let j = 0; j < items.length; j++) {
            if (items[j].type === 'week') {
              for (let n = 0; n < items[j].doctorReport.length; n++) {
                let insertTime = new Date(items[j].doctorReport[n].insertTime)
                if (insertTime.getTime() >= startTimeTmp.getTime() && insertTime.getTime() < endTimeTmp.getTime()) {
                  sumWeekTmp++
                }
              }
            }
            if (items[j].type === 'month') {
              for (let n = 0; n < items[j].doctorReport.length; n++) {
                let insertTime = new Date(items[j].doctorReport[n].insertTime)
                if (insertTime.getTime() >= startTimeTmp.getTime() && insertTime.getTime() < endTimeTmp.getTime()) {
                  sumMonthTmp++
                }
              }
            }
            if (items[j].type === 'season') {
              for (let n = 0; n < items[j].doctorReport.length; n++) {
                let insertTime = new Date(items[j].doctorReport[n].insertTime)
                console.log('startTimeTmp', startTimeTmp)
                console.log('insertTime', insertTime)
                console.log('endTimeTmp', endTimeTmp)
                console.log(Number(insertTime.getTime()) < Number(endTimeTmp.getTime()))
                if (Number(insertTime.getTime()) >= Number(startTimeTmp.getTime()) && Number(insertTime.getTime()) < Number(endTimeTmp.getTime())) {
                  sumSeasonTmp++
                  console.log('sumSeasonTmp', sumSeasonTmp)
                }
              }
            }
            if (items[j].type === 'year') {
              for (let n = 0; n < items[j].doctorReport.length; n++) {
                let insertTime = new Date(items[j].doctorReport[n].insertTime)
                if (insertTime.getTime() >= startTimeTmp.getTime() && insertTime.getTime() < endTimeTmp.getTime()) {
                  sumYearTmp++
                }
              }
            }
          }
          docsWeekRCList.push(sumWeekTmp)
          docsMonthRCList.push(sumMonthTmp)
          docsSeasonRCList.push(sumSeasonTmp)
          docsYearRCList.push(sumYearTmp)
          if (docsWeekRCList.length === doctorsList.length) {
            for (let n = 0; n < doctorsList.length; n++) {
              docsWeekRCSum += docsWeekRCList[n]
              docsMonthRCSum += docsMonthRCList[n]
              docsSeasonRCSum += docsSeasonRCList[n]
              docsYearRCSum += docsYearRCList[n]
            }
          }
          let day = days - k
          docsWeekRCSumList.push({day, docsWeekRCSum})
          docsMonthRCSumList.push({day, docsMonthRCSum})
          docsSeasonRCSumList.push({day, docsSeasonRCSum})
          docsYearRCSumList.push({day, docsYearRCSum})
          if (docsWeekRCSumList.length === days) {
            return res.json({data: {docsWeekRCSumList, docsMonthRCSumList, docsSeasonRCSumList, docsYearRCSumList}, msg: '获取成功！', code: 1})
          }
        })
        // DpRelation.getOne(queryD, function (err, item) {
        //   if (err) {
        //     return res.status(500).send(err)
        //   }
        //   let patientsList = item.patientsInCharge  // 医生主管的患者列表
        //   let patientsRCList = []
        //   console.log('patientsList', patientsList)
        //   if (patientsList.length === 0) {  // 医生无主管的患者
        //     let day = days - k
        //     docsRCList.push(docRCSum)
        //     console.log('docsRCList', docsRCList)
        //     if (docsRCList.length === doctorsList.length) {
        //       for (let j = 0; j < docsRCList.length; j++) {
        //         rcSum += docsRCList[j]
        //       }
        //       docsRCSumList.push({day, rcSum})
        //       if (docsRCSumList.length === days) {
        //         return res.json({data: {docsRCSumList}, msg: '获取成功！', code: 1})
        //       }
        //     }
        //   }
        //   for (let n = 0; n < patientsList.length; n++) {
        //     let queryR = {
        //       'userId': patientsList[n].patientId.userId,
        //       'itemType': 'DoctorReport',
        //       // 'type': 'week',                   // 分别存储周月季年点评数
        //       'doctorReport.insertTime': {$gte: startTimeTmp, $lt: endTimeTmp}
        //     }
        //     console.log('queryR', queryR)
        //     Report.getSome(queryR, function (err, items) {
        //       if (err) {
        //         return res.status(500).send(err)
        //       }
        //       let day = days - k
        //       let sumTmp = items.length
        //       console.log('items', items)
        //       patientsRCList.push(sumTmp)
        //       if (patientsRCList.length === patientsList.length) {
        //         // console.log(patientsRCList.length)
        //         for (let j = 0; j < patientsRCList.length; j++) {
        //           docRCSum += patientsRCList[j]
        //         }
        //         docsRCList.push(docRCSum)
        //         console.log('docsRCList', docsRCList)
        //         if (docsRCList.length === doctorsList.length) {
        //           for (let j = 0; j < docsRCList.length; j++) {
        //             rcSum += docsRCList[j]
        //           }
        //           docsRCSumList.push({day, rcSum})
        //           if (docsRCSumList.length === days) {
        //             return res.json({data: {docsRCSumList}, msg: '获取成功！', code: 1})
        //           }
        //         }
        //       }
        //     })
        //   }
        // }, '', '', populate)
      }
      endTimeTmp = new Date(startTimeTmp)
      startTimeTmp = new Date(endTimeTmp - 24 * 3600 * 1000)
    }
  })
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
