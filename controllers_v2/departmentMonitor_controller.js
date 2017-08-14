var Alluser = require('../models/alluser')
var Department = require('../models/department')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Comment = require('../models/comment')
var DepartmentDaily = require('../models/departmentDaily')

exports.autoDepartmentDaily = function (req, res) {
  let date = new Date()
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  let d = date.getDate()
  let startTime = new Date(y+ '-' + m + '-' +d)
  let endTime = new Date((startTime / 1000 + 86400) * 1000)
  console.log(y,m,d,startTime)
  let array = [
    {$match: {department: {$ne: null}}},
    {
      $lookup: {
        from: 'doctorsincharges',
        localField: 'doctors',
        foreignField: 'doctorId',
        as: 'inchargeinfo'
      }
    },
    {
      $lookup: {
        from: 'dprelations',
        localField: 'doctors',
        foreignField: 'doctorId',
        as: 'dpinfo'
      }
    },
    {
      $project: {
        'district': 1,
        'hospital': 1,
        'department': 1,
        'doctors': 1,
        inchargeinfo: {
          $filter: {
            input: '$inchargeinfo',
            as: 'inchargeinfo',
            cond: {
              $and: [
                {$gte: ['$$inchargeinfo.end', date]},
                {$lt: ['$$inchargeinfo.start', date]},
                {$eq: ['$$inchargeinfo.invalidFlag', 1]},
                {$ne: ['$$inchargeinfo.patinetId', null]},
                {$ne: ['$$inchargeinfo.patientId', undefined]}
              ]
            }
          }
        },
        dpinfo: {
          $filter: {
            input: '$dpinfo',
            as: 'dpinfo',
            cond: {
              $and: [
                {$ne: ['$$dpinfo.patinets', null]},
                {$ne: ['$$dpinfo.patients', undefined]},
                {$ne: ['$$dpinfo.patients', []]}
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        'district': 1,
        'hospital': 1,
        'department': 1,
        'doctors': 1,
        'inchargeinfo': 1,
        dpinfo: '$dpinfo.patients',
        patientsincharge: '$inchargeinfo.patientId',
      }
    },
    {$unwind: { path: '$dpinfo', preserveNullAndEmptyArrays: true }},
    {$unwind: { path: '$dpinfo', preserveNullAndEmptyArrays: true }},
    {
      $group: {
        _id: {district: '$district', hospital: '$hospital', department: '$department'},
        doctors: {$first: '$doctors'},
        inchargeinfo: {$first: '$inchargeinfo'},
        patientsincharge: {$first: '$patientsincharge'},
        dpinfo: {$addToSet: '$dpinfo'}
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'patientsincharge',
        foreignField: '_id',
        as: 'VIPinfo'
      }
    },
    {
      $project: {
        'district': 1,
        'hospital': 1,
        'department': 1,
        'doctors': 1,
        'inchargeinfo': 1,
        'dpinfo': 1,
        'patientsincharge': 1,
        VIPinfo: {
          $filter: {
            input: '$VIPinfo',
            as: 'vipinfo',
            cond: {$eq: ['$$vipinfo.VIP', 1]}
          }
        }
      }
    },
    {
      $project: {
        'district': 1,
        'hospital': 1,
        'department': 1,
        'doctors': 1,
        'inchargeinfo': 1,
        'dpinfo': 1,
        // 'patientsincharge': 1,
        'VIPinfo': 1,
        inchargetoday: {
          $filter: {
            input: '$inchargeinfo',
            as: 'inchargeinfo',
            cond: {
              $and: [
                {$gte: ['$$inchargeinfo.dpRelationTime', startTime]},
                {$lt: ['$$inchargeinfo.dpRelationTime', endTime]}
              ]
            }
          }
        },
        dptoday: {
          $filter: {
            input: '$dpinfo',
            as: 'dpinfo',
            cond: {
              $and: [
                {$gte: ['$$dpinfo.dpRelationTime', startTime]},
                {$lt: ['$$dpinfo.dpRelationTime', endTime]}
              ]
            }
          }
        },
        VIPtoday: {
          $filter: {
            input: '$VIPinfo',
            as: 'vipinfo',
            cond: {
              $and: [
                {$gte: ['$$vipinfo.VIPStartTime', startTime]},
                {$lt: ['$$vipinfo.VIPStartTime', endTime]}
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        '_id': 0,
        district: '$_id.district',
        hospital: '$_id.hospital',
        department: '$_id.department',
        inchargeCount: {$size: '$inchargeinfo'},
        dpCount: {$size: '$dpinfo'},
        VIPCount: {$size: '$VIPinfo'},
        inchargeCounttoday: {$size: '$inchargetoday'},
        dpCounttoday: {$size: '$dptoday'},
        VIPCounttoday: {$size: '$VIPtoday'},
        date: date
      }
    }
  ]
  Department.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    // res.json({code: 0, data: results, msg: 'success'})
    DepartmentDaily.create(results, function (err, info) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      // res.json({code: 0, data: results, msg: 'success'})
    })
  })
}

exports.getPatientsCount = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (hospital === '') {
    res.status(400).json({code: 1, msg: '请输入医院'})
  } else if (department === '') {
    res.status(400).json({code: 1, msg: '请输入科室'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    // endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {district: district, hospital: hospital, department:department}},
      {
        $project: {
          'district': 1,
          'hospital': 1,
          'department': 1,
          'inchargeCount': 1,
          'dpCount': 1,
          'VIPCount': 1,
          'inchargeCounttoday': 1,
          'dpCounttoday': 1,
          'VIPCounttoday': 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      }
    ]
    DepartmentDaily.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      res.json({code: 0, data: results, msg: 'success'})
    })
  }
}

exports.getCurrentPatientsCount = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (hospital === '') {
    res.status(400).json({code: 1, msg: '请输入医院'})
  } else if (department === '') {
    res.status(400).json({code: 1, msg: '请输入科室'})
  } else {
    let array = [
      {$match: {district: district, hospital: hospital, department:department}},
      // 获取科室医生
      {
        $project: {
          'doctors': 1
        }
      },
      {$unwind: {path: '$doctors', preserveNullAndEmptyArrays: false}},
      {
        $lookup: {
          from: 'doctorsincharges',
          localField: 'doctors',
          foreignField: 'doctorId',
          as: 'inchargeinfo'
        }
      },
      {
        $project: {
          'doctors': 1,
          inchargeinfo: {
            $filter: {
              input: '$inchargeinfo',
              as: 'inchargeinfo',
              cond: {
                $and: [
                  {$eq: ['$$inchargeinfo.invalidFlag', 1]},
                  {$ne: ['$$inchargeinfo.patinetId', null]},
                  {$ne: ['$$inchargeinfo.patientId', undefined]}
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          'doctors': 1,
          'inchargeinfo': 1,
          patientsincharge: '$inchargeinfo.patientId',
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: 'patientsincharge',
          foreignField: '_id',
          as: 'VIPinfo'
        }
      },
      {
        $project: {
          'doctors': 1,
          'inchargeinfo': 1,
          'patientsincharge': 1,
          VIPinfo: {
            $filter: {
              input: '$VIPinfo',
              as: 'vipinfo',
              cond: {$eq: ['$$vipinfo.VIP', 1]}
            }
          }
        }
      },
      {
        $project: {
          'doctors': 1,
          inchargecount: {$size: '$inchargeinfo'},
          VIPcount: {$size: '$VIPinfo'}
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: 'doctors',
          foreignField: '_id',
          as: 'doctorinfo'
        }
      },
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          doctoruserId: '$doctorinfo.userId',
          doctorname: '$doctorinfo.name',
          'inchargecount': 1,
          'VIPcount': 1,
        }
      },
      {$sort: {inchargeCount: -1}}
    ]
    Department.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    res.json({code: 0, data: results, msg: 'success'})
  })
  }
}

exports.getScore = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (hospital === '') {
    res.status(400).json({code: 1, msg: '请输入医院'})
  } else if (department === '') {
    res.status(400).json({code: 1, msg: '请输入科室'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district, hospital: hospital, department:department}},
      // 获取科室医生
      {
        $project: {
          'doctors': 1
        }
      },
      {$unwind: {path: '$doctors', preserveNullAndEmptyArrays: false}},
      // 获取医生评价
      {
        $lookup: {
          from: 'comments',
          localField: 'doctors',
          foreignField: 'doctorId',
          as: 'commentinfo'
        }
      },
      {
        $project: {
          'doctors': 1,
          'commentinfo': {
            $filter: {
              input: '$commentinfo',
              as: 'commentinfo',
              cond: {
                $and: [
                  {$gte: ['$$commentinfo.time', startTime]},
                  {$lt: ['$$commentinfo.time', endTime]}
                ]
              }
            }
          }
        }
      },
      {$unwind: {path: '$commentinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          'doctors': 1,
          score: {
            $cond: {if: {$ne: ['$commentinfo', []]},
              then: '$commentinfo.totalScore',
              else: 'nocomment'
            }
          },
        }
      },
      {$unwind: {path: '$score', preserveNullAndEmptyArrays: true}},
      {
        $group: {
          _id: '$doctors',
          score: {$avg: '$score'}
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorinfo'
        }
      },
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          'score': 1,
          doctoruserId: '$doctorinfo.userId',
          doctorname: '$doctorinfo.name'
        }
      },
      {$sort: {score: -1}}
    ]
    Department.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      let i
      let count = 0
      let sum = 0
      for (i = 0; i < results.length; i++) {
        if (results[i].score !== 0 && results[i].score !== null) {
          count++
          sum = sum + results[i].score
        }
      }
      avgscore = sum/count
      res.json({code: 0, data: {results: results, avgscore: avgscore}, msg: 'success'})
    })
  }
}

exports.getNegComment = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (hospital === '') {
    res.status(400).json({code: 1, msg: '请输入医院'})
  } else if (department === '') {
    res.status(400).json({code: 1, msg: '请输入科室'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district, hospital: hospital, department:department}},
      // 获取科室医生
      {
        $project: {
          'doctors': 1
        }
      },
      {$unwind: {path: '$doctors', preserveNullAndEmptyArrays: true}},
      // 获取医生评价
      {
        $lookup: {
          from: 'comments',
          localField: 'doctors',
          foreignField: 'doctorId',
          as: 'commentinfo'
        }
      },
      {
        $project: {
          'doctors': 1,
          negcomment: {
            $filter: {
              input: '$commentinfo',
              as: 'commentinfo',
              cond: {
                $and: [
                  {$lt: ['$$commentinfo.totalScore', 4]},
                  {$ne: ['$$commentinfo.totalScore', null]},
                  {$ne: ['$$commentinfo.totalScore', undefined]}
                ]
              }
            }
          }
        }
      },
      {$unwind: {path: '$negcomment', preserveNullAndEmptyArrays: false}},
      {
        $project: {
          comment: '$negcomment.commentId',
          doctorId: '$negcomment.doctorId',
          patientId: '$negcomment.patientId',
          time: '$negcomment.time',
          content: '$negcomment.content',
          counselId: '$negcomment.counselId',
          totalScore: '$negcomment.totalScore'
        }
      },
      {$match: {time: {$gte: startTime, $lt: endTime}}},
      {
        $lookup: {
          from: 'allusers',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorinfo'
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patientinfo'
        }
      },
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$patientinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          'comment': 1,
          // doctorId: '$negcomment.doctorId',
          // patientId: '$negcomment.patientId',
          'time': 1,
          'content': 1,
          'counselId': 1,
          'totalScore': 1,
          doctorname: '$doctorinfo.name',
          dcotoruserId: '$doctorinfo.userId',
          patientname: '$patientinfo.name',
          patientuserId: '$patientinfo.userId'
        }
      }
    ]
    Department.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      res.json({code: 0, data: results, msg: 'success'})
    })
  }

}

exports.getCounselTimeout = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (hospital === '') {
    res.status(400).json({code: 1, msg: '请输入医院'})
  } else if (department === '') {
    res.status(400).json({code: 1, msg: '请输入科室'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district, hospital: hospital, department:department}},
      // 获取科室医生
      {
        $project: {
          'doctors': 1
        }
      },
      {$unwind: {path: '$doctors', preserveNullAndEmptyArrays: true}},
      {
        $lookup: {
          from: 'counselautochangestatuses',
          localField: 'doctors',
          foreignField: 'doctorId',
          as: 'timeout'
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: 'doctors',
          foreignField: '_id',
          as: 'doctorinfo'
        }
      },
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          doctorname: '$doctorinfo.name',
          dcotoruserId: '$doctorinfo.userId',
          timeoutCount: {$size: '$timeout'}
        }
      }
    ]
    Department.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      res.json({code: 0, data: results, msg: 'success'})
    })
  }
}

// exports.getActiveCount = function (req, res) {

// }