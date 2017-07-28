var Alluser = require('../models/alluser')
var Counselautochangestatus = require('../models/counselautochangestatus')
var Order = require('../models/order')

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
    let array = [
      {$match: {role: 'doctor'}},
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}}
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
    let array = [
      {$match: {role: 'doctor'}},
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}},
      {
        $group: {
          _id: {year: {$year: '$creationTime'}, month: {$month: '$creationTime'}, day: {$dayOfMonth: '$creationTime'}},
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
  let province = req.query.province || ''
  let city = req.query.city || ''
  let date = req.query.date || ''
  let startdate = new Date(date)
  let enddate = new Date((startdate / 1000 + 86400) * 1000)

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
        dpinfo: '$dpinfo',
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
        open: '$open',
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
                {$eq: ['$$counsel.type', 1]}
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
                {$eq: ['$$counsel.type', 2]}
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
                {$eq: ['$$counsel.type', 3]}
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
                {$eq: ['$$counsel.type', 6]}
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
        urgentcontoday: {$size: '$urgentcontoday'}
      }
    }
    // {
    //   $match: {'counsel.status': { $eq: 0}}
    // }
  ]

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

exports.getCounseltimeout = function (req, res) {
  let province = req.query.province || ''
  let city = req.query.city || ''
  let date = req.query.date || ''
  let startdate = new Date(date)
  let enddate = new Date((startdate / 1000 + 86400) * 1000)

  let array = [
    {$match: {endTime: {$gte: startdate, $lt: enddate}}},
    {
      $group: {
        _id: '$doctorId',
        count: {$sum: 1}
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
    {
      $project: {
        '_id': 1,
        'count': 1,
        'doctorinfo.name': 1,
        'doctorinfo.province': 1,
        'doctorinfo.city': 1,
        'doctorinfo.workUnit': 1
      }
    },
    {$unwind: { path: '$doctorinfo', preserveNullAndEmptyArrays: true }},
    {
      $project: {
        '_id': 1,
        'count': 1,
        name: '$doctorinfo.name',
        province: '$doctorinfo.province',
        city: '$doctorinfo.city',
        hospital: '$doctorinfo.workUnit'
      }
    }
  ]

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

exports.getDepartmentCounsel = function (req, res) {
  let date = req.query.date || ''
  let startdate = new Date(date)
  let enddate = new Date((startdate / 1000 + 86400) * 1000)

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
        leadername: '$leadername.name'
      }
    },
    {
      $group: {
        _id: {leaderId: '$departLeader', leadername: '$leadername'},
        record: {$push: {doctorId: '$doctorId', doctorname: '$doctorname', patientId: '$patientId', patientname: '$patientname', time: '$time'}}
      }
    }
  ]
  Counselautochangestatus.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    res.json({results: results})
  })
}

exports.getScore = function (req, res) {
  let province = req.query.province || ''
  let city = req.query.city || ''

  let array = [
    {$match: {role: 'doctor'}},
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'doctorId',
        as: 'comments'
      }
    },
    {
      $project: {
        doctorId: '$_id',
        doctorname: '$name',
        province: '$province',
        city: '$city',
        hospital: '$workUnit',
        score: '$score',
        // comments: {score: '$comments.totalScore', content: '$comments.content', time: '$comments.time'}
        'comments.totalScore': 1,
        'comments.content': 1,
        'comments.time': 1,
        'comments.patientId': 1
      }
    }
  ]
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

exports.getOrder = function (req, res) {
  let province = req.query.province || ''
  let city = req.query.city || ''
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    let array = [
      {$match: {paytime: {$gt: new Date(startTime), $lt: new Date(endTime)}, paystatus: 2}},
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
          'info': 1
        }
      }
    ]

    if (province !== '' && city === '') {
      array.push({$match: {province: province}})
    } else if (province !== '' && city !== '') {
      array.push({$match: {province: province, city: city}})
    }

    Order.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      console.log(results)
      res.json({results: results})
    })
  }
}
