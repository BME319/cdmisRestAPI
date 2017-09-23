var Message = require('../models/message')
var News = require('../models/news')
var Counselautochangestatus = require('../models/counselautochangestatus')
var webEntry = require('../settings').webEntry

exports.autoCounselNews = function () {
  let enddate = new Date()
  let startdate = new Date((enddate / 1000 - 86400) * 1000)
  let y = enddate.getFullYear()
  let m = enddate.getMonth() + 1
  let d = enddate.getDate()
  let h = enddate.getHours()
  let mm = enddate.getMinutes()
  let s = enddate.getSeconds()
  let nowstr = y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s)
  let array = [
    {$match: {endTime: {$gte: startdate, $lt: enddate}}},
    {$unwind: '$departLeader'},
    {
      $lookup: {
        from: 'allusers',
        localField: 'departLeader',
        foreignField: '_id',
        as: 'leadername'
      }
    },
    {$unwind: {path: '$leadername', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        departLeader: '$departLeader',
        leadername: '$leadername.name',
        leaderuserId: '$leadername.userId',
        'type': 1,
        'time': 1,
        'timeouttype': 1
      }
    },
    {
      $group: {
        _id: '$leaderuserId',
        count: {$sum: 1}
      }
    }
  ]
  Counselautochangestatus.aggregate(array, function (err, results) {
    if (err) {
      console.log(new Date(), err)
    }
    console.log(results)
    // res.json({results: results})
    for (let i = 0; i < results.length; i++) {
      let newData = {
        userId: results[i]._id,
        sendBy: 'U201700000000',
        messageId: 'M' + nowstr + i,
        readOrNot: 0,
        userRole: 'doctor',
        type: 14,
        time: enddate,
        title: y + '-' + m + '-' + d + '超时未回复医生报告',
        description: '超时未回复医生数为' + results[i].count,
        url: 'http://' +  webEntry.domain + '/api/v2/departmentcounsel?date=' + y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s + '&departLeaderId=' + results[i]._id
      }
      let newmessage = new Message(newData)
      newmessage.save(function (err, newInfo) {
        if (err) {
          if (res !== undefined) {
            console.log(new Date(), err)
          }
        }
        let query = {userId: results[i]._id, sendBy: 'U201700000000'}
        let obj = {
          $set: {
            messageId: 'M' + nowstr + i,
            readOrNot: 0,
            userRole: 'doctor',
            type: 14,
            time: enddate,
            title: y + '-' + m + '-' + d + '超时未回复医生报告',
            description: '超时未回复医生数为' + results[i].count,
            url: 'http://'+ webEntry.domain + '/api/v2/departmentcounsel?date=' + y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s + '&departLeaderId=' + results[i]._id
          }
        }
        News.updateOne(query, obj, function (err, upnews) {
          if (err) {
            if (res !== undefined) {
              console.log(new Date(), err)
            }
          }
          else if (i === results.length - 1) {
            console.log(new Date(), 'autoCounselNews_success')
          }
        }, {upsert: true})
      })
    }
  })
}

exports.getDepartmentCounsel = function (req, res) {
  let departLeaderId = req.query.departLeaderId || ''
  let date = req.query.date || ''
  let enddate = new Date(date)
  let startdate = new Date((enddate / 1000 - 86400) * 1000)
  // console.log(typeof (departLeaderId))

  let array = [
    {$match: {endTime: {$gte: startdate, $lt: enddate}}},
    {$unwind: '$departLeader'},
    {
      $lookup: {
        from: 'allusers',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctorname'
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patientname'
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'departLeader',
        foreignField: '_id',
        as: 'leadername'
      }
    },
    {$unwind: {path: '$patientname', preserveNullAndEmptyArrays: true}},
    {$unwind: {path: '$doctorname', preserveNullAndEmptyArrays: true}},
    {$unwind: {path: '$leadername', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        patientId: '$patientId',
        patientname: '$patientname.name',
        doctorId: '$doctorId',
        doctorname: '$doctorname.name',
        departLeader: '$departLeader',
        leadername: '$leadername.name',
        leaderuserId: '$leadername.userId',
        'type': 1,
        'time': 1,
        'timeouttype': 1
      }
    },
    {$match: {leaderuserId: departLeaderId}}
    // // {
    // //   $group: {
    // //     _id: {leaderId: '$departLeader', leadername: '$leadername'},
    // //     record: {$push: {doctorId: '$doctorId', doctorname: '$doctorname', patientId: '$patientId', patientname: '$patientname', time: '$time'}}
    // //   }
    // // }
  ]
  Counselautochangestatus.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    res.json({results: results})
  })
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}
