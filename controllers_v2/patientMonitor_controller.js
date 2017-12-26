var Alluser = require('../models/alluser')
// var DictDistrict = require('../models/dictDistrict')
var InsuranceMsg = require('../models/insuranceMsg')

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
      {$match: {role: 'patient'}},
      {$match: {creationTime: {$gte: startTime, $lt: endTime}}},
      {
        $project: {
          '_id': 1,
          provinceNo: {$concat: [{$substr: ['$IDNo', 0, 2]}, '0000']},
          cityNo: {$concat: [{$substr: ['$IDNo', 0, 4]}, '00']},
          districtNo: {$substr: ['$IDNo', 0, 6]}
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'provinceNo',
          foreignField: 'code',
          as: 'provinceinfo'
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'cityNo',
          foreignField: 'code',
          as: 'cityinfo'
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'districtNo',
          foreignField: 'code',
          as: 'districtinfo'
        }
      },
      {$unwind: {path: '$provinceinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$cityinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$districtinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          '_id': 1,
          province: {$ifNull: ['$provinceinfo.name', '未知']},
          city: {$ifNull: ['$cityinfo.name', '未知']},
          district: {$ifNull: ['$districtinfo.name', '未知']}
        }
      }
    ]
    if (province === '' && city === '') {
      array.push({
        $group: {
          _id: '$province',
          count: {$sum: 1}
        }
      })
    } else if (city === '' && province !== '') {
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
        // {$match: {province: province}},
        {$match: {city: city}},
        {
          $group: {
            _id: '$district',
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
      {$match: {role: 'patient'}},
      {$match: {creationTime: {$gte: startTime, $lt: endTime}}},
      {
        $project: {
          '_id': 1,
          'creationTime': 1,
          provinceNo: {$concat: [{$substr: ['$IDNo', 0, 2]}, '0000']},
          cityNo: {$concat: [{$substr: ['$IDNo', 0, 4]}, '00']},
          districtNo: {$substr: ['$IDNo', 0, 6]}
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'provinceNo',
          foreignField: 'code',
          as: 'provinceinfo'
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'cityNo',
          foreignField: 'code',
          as: 'cityinfo'
        }
      },
      {
        $lookup: {
          from: 'dictdistricts',
          localField: 'districtNo',
          foreignField: 'code',
          as: 'districtinfo'
        }
      },
      {$unwind: {path: '$provinceinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$cityinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$districtinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          '_id': 1,
          creationTime: { $dateToString: { format: '%Y-%m-%d', date: '$creationTime' } },
          province: {$ifNull: ['$provinceinfo.name', '未知']},
          city: {$ifNull: ['$cityinfo.name', '未知']},
          district: {$ifNull: ['$districtinfo.name', '未知']}
        }
      }
    ]
    if (province === '' && city === '') {
      array.push(
        {
          $group: {
            _id: '$creationTime',
            count: {$sum: 1}
          }
        })
    } else if (province !== '' && city === '') {
      array.push(
        {$match: {province: province}},
        {
          $group: {
            _id: '$creationTime',
            count: {$sum: 1}
          }
        }
      )
    } else {
      array.push(
        // {$match: {province: province}},
        {$match: {city: city}},
        {
          $group: {
            _id: '$creationTime',
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

exports.getInsurance = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  let limit = req.query.limit
  let skip = req.query.skip

  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === '') {
    res.status(400).send('请输入结束时间')
  } else {
    let array = [
      {
        $project: {
          'patientId': 1,
          'doctorId': 1,
          status: '$preference.status',
          time: '$preference.time'
        }
      },
      {$match: {status: 1}},
      {$match: {time: {$gt: new Date(startTime), $lt: new Date(endTime)}}},
      {
        $lookup: {
          from: 'allusers',
          localField: 'patientId',
          foreignField: 'userId',
          as: 'patientinfo'
        }
      },
      {
        $lookup: {
          from: 'allusers',
          localField: 'doctorId',
          foreignField: 'userId',
          as: 'doctorinfo'
        }
      },
      {$unwind: {path: '$patientinfo', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
      {
        $project: {
          'patientId': 1,
          'doctorId': 1,
          'status': 1,
          'time': 1,
          patientname: '$patientinfo.name',
          patientphone: '$patientinfo.phoneNo',
          patientuserId: '$patientinfo.userId',
          doctoruserId: '$doctorinfo.userId',
          doctorname: '$doctorinfo.name',
          doctorphone: '$doctorinfo.phoneNo',
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
    } else if (province === '' && city !== '') {
      array.push({$match: {city: city}})
    }

    if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
      limit = Number(limit)
      skip = Number(skip)
      array.push(
        //{$sort: {count: -1}},
        {$skip: skip},
        {$limit: limit}
      )
    }
    InsuranceMsg.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json({results: results})
    })
  }
}

exports.getPatientsByClass = function (req, res) {
  let classNo = req.query.classNo || ''
  let limit = req.query.limit
  let skip = req.query.skip
  let array = [
    {$match: {role: 'patient'}},
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class': 1,
        'userId': 1,
        content: '$diagnosisInfo.content'
      }
    },
    {
      $lookup: {
        from: 'doctorsincharges',
        localField: '_id',
        foreignField: 'patientId',
        as: 'doctorsincharge'
      }
    },
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class': 1,
        'userId': 1,
        'content': 1,
        doctorsincharge: {
          $filter: {
            input: '$doctorsincharge',
            as: 'doctorsincharge',
            cond: {$eq: ['$$doctorsincharge.invalidFlag', 1]}
          }
        }
      }
    },
    {$unwind: {path: '$doctorsincharge', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class': 1,
        'userId': 1,
        'content': 1,
        doctorsincharge: '$doctorsincharge.doctorId'
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'doctorsincharge',
        foreignField: '_id',
        as: 'doctorinfo'
      }
    },
    {$unwind: {path: '$doctorinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class': 1,
        'userId': 1,
        'content': 1,
        'doctorsincharge': 1,
        doctorname: '$doctorinfo.name',
        doctorhospital: '$doctorinfo.workUnit'
      }
    }
  ]


  if (classNo !== '') {
    array.splice(
      0,
      0,
      {$match: {class: classNo}}
    )
  }
  if (limit !== '' && skip !== '' && limit !== undefined && skip !== undefined) {
    limit = Number(limit)
    skip = Number(skip)
    array.push(
      {$sort: {creationTime: -1}},
      {$skip: skip},
      {$limit: limit}
    )
  }
  Alluser.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    res.json({results: results})
  })
}
