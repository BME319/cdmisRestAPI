var Alluser = require('../models/alluser')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Order = require('../models/order')
var Comment = require('../models/comment')

exports.getDistribution = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {role: 'doctor'}},
      {$match: {creationTime: {$gte: startTime, $lt: endTime}}}
    ]
    if (province === '') {
      array.push({
        $group: {
          _id: '$province',
          count: {$sum: 1}
        }
      })
    } else if (city === '') {
      array.push(
        {$match: {province: province}},
        {
          $group: {
            _id: '$city',
            count: {$sum: 1}
          }
        }
      )
    } else {
      array.push(
        {$match: {province: province}},
        {$match: {city: city}},
        {
          $group: {
            _id: '$workUnit',
            count: {$sum: 1}
          }
        }
      )
    }
    Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json({results: results})
    })
  }
}

exports.getLinegraph = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {role: 'doctor'}},
      {$match: {creationTime: {$gte: startTime, $lt: endTime}}},
      // {$sort: {creationTime: 1}},
      {
        $project: {
          creationTime: { $dateToString: { format: "%Y-%m-%d", date: "$creationTime" } },
        }
      },
      {
        $group: {
          _id: '$creationTime',
          count: {$sum: 1}
        }
      }
    ]
    if (province !== '' && city === '') {
      array.splice(
        0,
        0,
        {$match: {province: province}}
      )
    } else if (province !== '' && city !== '') {
      array.splice(
        0,
        0,
        {$match: {province: province}},
        {$match: {city: city}}
      )
    }
    console.log(array)
    Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      console.log(results)
      res.json({results: results})
    })
  }
}

exports.getWorkload = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  let date = req.query.date || ''
  let startdate = new Date(date)
  let enddate = new Date((startdate / 1000 + 86400) * 1000)
  limit = req.query.limit || ''
  skip = req.query.skip || ''

  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      // 角色为医生的用户
      {$match: {role: 'doctor'}},
      // 和dprelations关联
      {
        $lookup: {
          from: 'dprelations',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'dp'
        }
      },
      // 将dp数组的元素拆分
      {$unwind: { path: '$dp', preserveNullAndEmptyArrays: true }},
      // 根据医生id进行group，每个医生只保留一条记录
      {
        $group: {
          _id: '$_id',
          name: {$first: '$name'},
          province: {$first: '$province'},
          city: {$first: '$city'},
          hospital: {$first: '$workUnit'},
          userId: {$first: '$userId'},
          dpinfo: {$first: '$dp.patients'}
        }
      },
      // 将dpinfo中为空的记录设为[]
      // 因为$size操作符只能对数组使用
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          dpinfo: {
            $cond: {if: {$isArray: '$dpinfo'},
              then: '$dpinfo',
              else: []
            }
          }
        }
      },
      // 增加dpinfotoday
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          dpinfo: {
            $filter: {
              input: '$dpinfo',
              as: 'dpinfo',
              cond: {
                $and: [
                  {$gte: ['$$dpinfo.dpRelationTime', startTime]},
                  {$lt: ['$$dpinfo.dpRelationTime', endTime]},
                  {$ne: ['$$dpinfo.dpRelationTime', null]},
                  {$ne: ['$$dpinfo.dpRelationTime', undefined]}
                ]
              }
            }
          },
          dpinfotoday: {
            $filter: {
              input: '$dpinfo',
              as: 'dpinfo',
              cond: {
                $and: [
                  {$gte: ['$$dpinfo.dpRelationTime', startdate]},
                  {$lt: ['$$dpinfo.dpRelationTime', enddate]},
                  {$ne: ['$$dpinfo.dpRelationTime', null]},
                  {$ne: ['$$dpinfo.dpRelationTime', undefined]}
                ]
                // $lte: [ "$$dpinfo.dpRelationTime", new Date('2017-07-21') ]
              }
            }
          }
        }
      },
      // 关注数和今日关注数的计算
      {
        $project: {
          userId: '$userId',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          count: {$size: '$dpinfo'},
          counttoday: {$size: '$dpinfotoday'}
        }
      },
      // 和openid表关联
      {
        $lookup: {
          from: 'openids',
          localField: 'userId',
          foreignField: 'doctorUserId',
          as: 'open'
        }
      },
      // 增加opentoday
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          count: '$count',
          counttoday: '$counttoday',
          open: {
            $filter: {
              input: '$open',
              as: 'open',
              cond: {
                $and: [
                  {$gte: ['$$open.time', startTime]},
                  {$lt: ['$$open.time', endTime]},
                  {$ne: ['$$open.time', null]},
                  {$ne: ['$$open.time', undefined]}
                ]
              }
            }
          },
          opentoday: {
            $filter: {
              input: '$open',
              as: 'open',
              cond: {
                $and: [
                  {$gte: ['$$open.time', startdate]},
                  {$lt: ['$$open.time', enddate]},
                  {$ne: ['$$open.time', null]},
                  {$ne: ['$$open.time', undefined]}
                ]
                // $lte: [ "$$dpinfo.dpRelationTime", new Date('2017-07-21') ]
              }
            }
          }
        }
      },
      // 扫码未关注量和今日扫码未关注量的计算
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          count: '$count',
          counttoday: '$counttoday',
          open: {$size: '$open'},
          opentoday: {$size: '$opentoday'}
        }
      },
      // 关联counsel表
      {
        $lookup: {
          from: 'counsels',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'counsel'
        }
      },
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          count: '$count',
          counttoday: '$counttoday',
          open: '$open',
          opentoday: '$opentoday',
          consultation: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 1]},
                  {$gte: ['$$counsel.time', startTime]},
                  {$lt: ['$$counsel.time', endTime]}
                ]
              }
            }
          },
          communication: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 2]},
                  {$gte: ['$$counsel.time', startTime]},
                  {$lt: ['$$counsel.time', endTime]}
                ]
              }
            }
          },
          c2c: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 3]},
                  {$gte: ['$$counsel.time', startTime]},
                  {$lt: ['$$counsel.time', endTime]}
                ]
              }
            }
          },
          urgentcon: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 6]},
                  {$gte: ['$$counsel.time', startTime]},
                  {$lt: ['$$counsel.time', endTime]}
                ]
              }
            }
          },
          consultationtoday: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 1]},
                  {$gte: ['$$counsel.time', startdate]},
                  {$lt: ['$$counsel.time', enddate]}
                ]
              }
            }
          },
          communicationtoday: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 2]},
                  {$gte: ['$$counsel.time', startdate]},
                  {$lt: ['$$counsel.time', enddate]}
                ]
              }
            }
          },
          c2ctoday: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 3]},
                  {$gte: ['$$counsel.time', startdate]},
                  {$lt: ['$$counsel.time', enddate]}
                ]
              }
            }
          },
          urgentcontoday: {
            $filter: {
              input: '$counsel',
              as: 'counsel',
              cond: {
                $and: [
                  {$eq: ['$$counsel.status', 0]},
                  {$eq: ['$$counsel.type', 6]},
                  {$gte: ['$$counsel.time', startdate]},
                  {$lt: ['$$counsel.time', enddate]}
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'personaldiags',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'personaldiag'
        }
      },
      {
        $lookup: {
          from: 'doctorsincharges',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'doctorsincharge'
        }
      },
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          count: '$count',
          counttoday: '$counttoday',
          open: '$open',
          opentoday: '$opentoday',
          'consultation': 1,
          'consultationtoday': 1,
          'communication': 1,
          'communicationtoday': 1,
          'c2c': 1,
          'c2ctoday': 1,
          'urgentcon': 1,
          'urgentcontoday': 1,
          personaldiag: {
            $filter: {
              input: '$personaldiag',
              as: 'personaldiag',
              cond: {
                $and: [
                  {$eq: ['$$personaldiag.status', 0]},
                  {$gte: ['$$personaldiag.bookingDay', startTime]},
                  {$lt: ['$$personaldiag.bookingDay', endTime]}
                ]
              }
            }
          },
          doctorsincharge: {
            $filter: {
              input: '$doctorsincharge',
              as: 'doctorsincharge',
              cond: {
                $and: [
                  {$gte: ['$$doctorsincharge.dpRelationTime', startTime]},
                  {$lt: ['$$doctorsincharge.dpRelationTime', endTime]}
                ]
              }
            }
          },
          personaldiagtoday: {
            $filter: {
              input: '$personaldiag',
              as: 'personaldiag',
              cond: {
                $and: [
                  {$eq: ['$$personaldiag.status', 0]},
                  {$gte: ['$$personaldiag.bookingDay', startdate]},
                  {$lt: ['$$personaldiag.bookingDay', enddate]}
                ]
              }
            }
          },
          doctorsinchargetoday: {
            $filter: {
              input: '$doctorsincharge',
              as: 'doctorsincharge',
              cond: {
                $and: [
                  {$gte: ['$$doctorsincharge.dpRelationTime', startdate]},
                  {$lt: ['$$doctorsincharge.dpRelationTime', enddate]}
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: '$_id',
          'name': 1,
          'province': 1,
          'city': 1,
          'hospital': 1,
          userId: '$userId',
          count: '$count',
          counttoday: '$counttoday',
          open: '$open',
          opentoday: '$opentoday',
          consultation: {$size: '$consultation'},
          consultationtoday: {$size: '$consultationtoday'},
          communication: {$size: '$communication'},
          communicationtoday: {$size: '$communicationtoday'},
          c2c: {$size: '$c2c'},
          c2ctoday: {$size: '$c2ctoday'},
          urgentcon: {$size: '$urgentcon'},
          urgentcontoday: {$size: '$urgentcontoday'},
          personaldiag: {$size: '$personaldiag'},
          personaldiagtoday: {$size: '$personaldiagtoday'},
          doctorsincharge: {$size: '$doctorsincharge'},
          doctorsinchargetoday: {$size: '$doctorsinchargetoday'}
        }
      }
      // {$sort: {count: -1}},
      // {$skip: skip},
      // {$limit: limit}
    ]

    if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
      limit = Number(limit)
      skip = Number(skip)
      array.push(
        {$sort: {count: -1}},
        {$skip: skip},
        {$limit: limit}
      )
    }

    if (province !== '' && city === '') {
      array.push({$match: {province: province}})
    } else if (province !== '' && city !== '') {
      array.push({$match: {province: province, city: city}})
    }

    Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      console.log(results)
      res.json({results: results})
    })
  }
}

exports.getCounseltimeout = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  let limit = req.query.limit
  let skip = req.query.skip
  // let date = req.query.date || ''
  // let startdate = new Date(date)
  // let enddate = new Date((startdate / 1000 + 86400) * 1000)

  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {endTime: {$gte: startTime, $lt: endTime}}},
      // {
      //   $group: {
      //     _id: '$doctorId',
      //     count: {$sum: 1}
      //   }
      // },
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
      {
        $project: {
          'doctorId': 1,
          'patientId': 1,
          'time': 1,
          'endTime': 1,
          'type': 1,
          'help': 1,
          'doctorinfo.name': 1,
          'doctorinfo.userId': 1,
          'doctorinfo.province': 1,
          'doctorinfo.city': 1,
          'doctorinfo.workUnit': 1,
          'doctorinfo.phoneNo': 1,
          'patientinfo.name': 1
        }
      },
      {$unwind: { path: '$doctorinfo', preserveNullAndEmptyArrays: true }},
      {$unwind: { path: '$patientinfo', preserveNullAndEmptyArrays: true }},
      {
        $project: {
          'doctorId': 1,
          'patientId': 1,
          'time': 1,
          'endTime': 1,
          'type': 1,
          'help': 1,
          doctorname: '$doctorinfo.name',
          userId: '$doctorinfo.userId',
          province: '$doctorinfo.province',
          city: '$doctorinfo.city',
          hospital: '$doctorinfo.workUnit',
          phoneNo: '$doctorinfo.phoneNo',
          patientname: '$patientinfo.name'
        }
      }
      // {$sort: {time: 1}},
      // {$skip: skip},
      // {$limit: limit}
    ]

    if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
      limit = Number(limit)
      skip = Number(skip)
      array.push(
        {$sort: {count: -1}},
        {$skip: skip},
        {$limit: limit}
      )
    }

    if (province !== '' && city === '') {
      array.push({$match: {province: province}})
    } else if (province !== '' && city !== '') {
      array.push({$match: {province: province, city: city}})
    }

    Counselautochangestatus.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json({results: results})
    })
  }
}

exports.getScore = function (req, res) {
  let province = req.query.province || ''
  let city = req.query.city || ''
  let limit = req.query.limit
  let skip = req.query.skip
  // let startTime = req.query.startTime || ''
  // let endTime = req.query.endTime || ''

  // if (startTime === '') {
  //   res.status(400).send('请输入开始时间')
  // } else if (endTime === '') {
  //   res.status(400).send('请输入结束时间')
  // } else {
  //   startTime = new Date(startTime)
  //   endTime = new Date(endTime)
  //   endTime = new Date((endTime / 1000 + 86400) * 1000)
  let array = [
    {$match: {role: 'doctor'}},
    // {
    //   $lookup: {
    //     from: 'comments',
    //     localField: '_id',
    //     foreignField: 'doctorId',
    //     as: 'comments'
    //   }
    // },
    {
      $project: {
        doctorId: '$_id',
        doctorname: '$name',
        province: '$province',
        city: '$city',
        hospital: '$workUnit',
        score: '$score',
        'phoneNo': 1,
        'userId': 1
        // comments: {
        //   $filter: {
        //     input: '$comments',
        //     as: 'comment',
        //     cond: {
        //       $and: [
        //         {$gte: ['$$comment.time', startTime]},
        //         {$lt: ['$$comment.time', endTime]}
        //       ]
        //     }
        //   }
        // }
      }
    },
    // {
    //   $project: {
    //     'doctorId': 1,
    //     'doctorname': 1,
    //     'province': 1,
    //     'city': 1,
    //     'hospital': 1,
    //     'score': 1,
    //     'phoneNo': 1,
    //     'userId': 1,
    //     'comments.totalScore': 1,
    //     'comments.content': 1,
    //     'comments.time': 1,
    //     'comments.patientId': 1
    //   }
    // },
    // {
    //   $lookup: {
    //     from: 'allusers',
    //     localField: 'comments.patientId',
    //     foreignField: '_id',
    //     as: 'patientinfo'
    //   }
    // }
  ]
  if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
    limit = Number(limit)
    skip = Number(skip)
    array.push(
      {$sort: {count: -1}},
      {$skip: skip},
      {$limit: limit}
    )
  }
  if (province !== '' && city === '') {
    array.push({$match: {province: province}})
  } else if (province !== '' && city !== '') {
    array.push({$match: {province: province, city: city}})
  }

  Alluser.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    console.log(results)
    res.json({results: results})
  })
  //}
  
}

exports.getComment = function (req, res) {
  let doctoruserId = req.query.doctoruserId
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''

  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    Alluser.getOne({userId: doctoruserId}, function (err, alluserInfo) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      doctorId = alluserInfo._id
      let array = [
        {$match: {doctorId: doctorId}},
        {$match: {time: {$gte: startTime, $lt: endTime}}},
        {
          $lookup: {
            from: 'allusers',
            localField: 'patientId',
            foreignField: '_id',
            as: 'patientinfo'
          }
        },
        {
          $lookup: {
            from: 'allusers',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctorinfo'
          }
        },
        {$unwind: { path: '$doctorinfo', preserveNullAndEmptyArrays: true }},
        {$unwind: { path: '$patientinfo', preserveNullAndEmptyArrays: true }},
        {
          $project: {
            'time': 1,
            'content': 1,
            'totalScore': 8,
            patientId: '$patientinfo.userId',
            patientname: '$patientinfo.name',
            doctorname:　'$doctorinfo.name',
            doctorId: '$doctorinfo.userId',
            doctorphone: '$doctorinfo.phoneNo',
          }
        }
      ]
      Comment.aggregate(array, function (err, results) {
        if (err) {
          res.status(500).send(err.errmsg)
        }
        res.json({results: results})
      })
    })
  }
}

exports.getOrder = function (req, res) {
  let province = req.query.province || ''
  let city = req.query.city || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let limit = req.query.limit
  let skip = req.query.skip
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    endTime = new Date((endTime / 1000 + 86400) * 1000)
    let array = [
      {$match: {paytime: {$gte: startTime, $lt: endTime}, paystatus: 2}},
      {
        $lookup: {
          from: 'allusers',
          localField: 'doctorId',
          foreignField: 'userId',
          as: 'doctorinfo'
        }
      },
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          'userId': 1,
          'patientName': 1,
          'doctorId': 1,
          'doctorName': 1,
          'orderNo': 1,
          'paytime': 1,
          'type': 1,
          'money': 1,
          province: '$doctorinfo.province',
          city: '$doctorinfo.city',
          hospital: '$doctorinfo.workUnit'
        }
      },
      {
        $group: {
          _id: {doctoruserId: '$doctorId', doctorname: '$doctorName', province: '$province', city: '$city', hospital: '$hospital'},
          money: {$sum: '$money'},
          info: {$push: {userId: '$userId', patientname: '$patientName', orderNo: '$orderNo', paytime: '$paytime', type: '$type', money: '$money'}}
        }
      },
      {
        $project: {
          '_id': 0,
          doctorId: '$_id.doctoruserId',
          doctorname: '$_id.doctorname',
          province: '$_id.province',
          city: '$_id.city',
          hospital: '$_id.hospital',
          'money': 1,
          'info': 1
        }
      }
    ]

    if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
      limit = Number(limit)
      skip = Number(skip)
      array.push(
        {$sort: {count: -1}},
        {$skip: skip},
        {$limit: limit}
      )
    }

    if (province !== '' && city === '') {
      array.push({$match: {province: province}})
    } else if (province !== '' && city !== '') {
      array.push({$match: {province: province, city: city}})
    }

    Order.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json({results: results})
    })
  }
}
