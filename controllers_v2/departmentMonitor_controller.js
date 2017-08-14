var Alluser = require('../models/alluser')
var Department = require('../models/department')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Comment = require('../models/comment')

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
      // 获取科室医生
      {
        $project: {
          'doctors': 1
        }
      },
      {$unwind: {path: '$doctors', preserveNullAndEmptyArrays: true}},
      // 获取每位医生主管患者数
      {
        $lookup: {
          from: 'doctorsincharges',
          localField: 'doctors',
          foreignField: 'doctorId',
          as: 'inchargeinfo'
        }
      },
      {$unwind: {path: '$inchargeinfo', preserveNullAndEmptyArrays: false}},
      {
        $project: {
          'dpRelationTime': '$inchargeinfo.dpRelationTime',
          'start': '$inchargeinfo.start',
          'end': '$inchargeinfo.end'
        }
      },
      {$match: {dpRelationTime: {$gte: startTime, $lt: endTime}}}
    ]
    Department.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      //res.json({code: 0, data: results, msg: 'success'})
      
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
      {$unwind: {path: '$commentinfo', preserveNullAndEmptyArrays: true}},
      // {
      //   $project: {
      //     'doctors': 1,
      //     totalScore: '$commentinfo.totalScore'
      //   }
      // },
      // {
      //   $group: {
      //     _id: '$doctors',
      //     score: {$sum: '$totalScore'}
      //   }
      // }
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