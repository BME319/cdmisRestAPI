var Alluser = require('../models/alluser')
var Department = require('../models/department')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Comment = require('../models/comment')
var DepartmentDaily = require('../models/departmentDaily')

exports.getPatientsCount = function (req, res) {
  let district = req.query.district || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    // endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {district: district}},
      {
        $project: {
          'district': 1,
          'inchargeCount': 1,
          'dpCount': 1,
          'VIPCount': 1,
          'inchargeCounttoday': 1,
          'dpCounttoday': 1,
          'VIPCounttoday': 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      },
      {
        $group: {
          _id: '$date',
          inchargeCount: {$sum: '$inchargeCount'},
          dpCount: {$sum: '$dpCount'},
          VIPCount: {$sum: '$VIPCount'},
          inchargeCounttoday: {$sum: '$inchargeCounttoday'},
          dpCounttoday: {$sum: '$dpCounttoday'},
          VIPCounttoday: {$sum: '$VIPCounttoday'}
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

exports.getDepartmentPatientsCount = function (req, res) {
  let district = req.query.district || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    // endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {district: district}},
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
      },
    //   {
    //     $group: {
    //       _id: {hospital: '$hospital', department: '$department'},
    //       inchargeCount: {$push: '$inchargeCount'}
    //     }
    //   },
      {
        $group: {
          _id: {hospital: '$hospital', department: '$department', date: '$date'},
          inchargeCount: {$sum: '$inchargeCount'},
          dpCount: {$sum: '$dpCount'},
          VIPCount: {$sum: '$VIPCount'},
          inchargeCounttoday: {$sum: '$inchargeCounttoday'},
          dpCounttoday: {$sum: '$dpCounttoday'},
          VIPCounttoday: {$sum: '$VIPCounttoday'}
        }
      },
      {$sort: {'_id.department': 1}}
    ]
    DepartmentDaily.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      res.json({code: 0, data: results, msg: 'success'})
    })
  }
}

exports.getScore = function (req, res) {
  let district = req.query.district || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district}},
      // 获取地区医生
      {
        $project: {
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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
          _id: {hospital: '$hospital', department: '$department'},
          score: {$avg: '$score'}
        }
      },
      {$sort: {score: -1}}
    ]
    Department.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      res.json({code: 0, data: results, msg: 'success'})
    })
  }
}

exports.getNegComment = function (req, res) {
  let district = req.query.district || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district}},
      // 获取科室医生
      {
        $project: {
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (district === '') {
    res.status(400).json({code: 1, msg: '请输入地区'})
  } else if (startTime === '') {
    res.status(400).json({code: 1, msg: '请输入开始时间'})
  } else if (endTime === '') {
    res.status(400).json({code: 1, msg: '请输入结束时间'})
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    let array = [
      {$match: {district: district}},
      // 获取科室医生
      {
        $project: {
          'hospital': 1,
          'department': 1,
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
          'hospital': 1,
          'department': 1,
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