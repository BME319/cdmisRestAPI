var Alluser = require('../models/alluser')
var DictDistrict = require('../models/dictDistrict')
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

    let array = [
      {$match: {role: 'patient'}},
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}},
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
    if (province === '') {
      array.push({
        $group: {
          _id: '$province',
          count: {$sum: 1}
        }
      })
    } else if (city === ''){
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
    let array = [
      {$match: {role: 'patient'}},
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}},
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
          'creationTime': 1,
          province: {$ifNull: ['$provinceinfo.name', '未知']},
          city: {$ifNull: ['$cityinfo.name', '未知']},
          district: {$ifNull: ['$districtinfo.name', '未知']}
        }
      }
    ]
    if (province === '') {
      array.push(
        {
        $group: {
          _id: {year: {$year: '$creationTime'}, month: {$month: '$creationTime'}, day: {$dayOfMonth: '$creationTime'}},
          count: {$sum: 1}
        }
      })
    } else if (city === ''){
      array.push(
        {$match: {province: province}},
        {
          $group: {
          _id: {year: {$year: '$creationTime'}, month: {$month: '$creationTime'}, day: {$dayOfMonth: '$creationTime'}},
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
          _id: {year: {$year: '$creationTime'}, month: {$month: '$creationTime'}, day: {$dayOfMonth: '$creationTime'}},
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
  let classNo = req.query.classNo
  let array = [
    {$match: {class: classNo, role: 'patient'}},
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class':1,
        content: '$diagnosisInfo.content',
        doctor: '$doctors.doctorId'
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'doctor',
        foreignField: '_id',
        as: 'docotorinfo'
      }
    },
    {
      $project: {
        '_id': 1,
        'name': 1,
        'creationTime': 1,
        'class':1,
        'content': 1,
        'doctor': 1,
        doctorname: '$docotorinfo.name'
      }
    }
  ]
  Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json({results: results})
    })

}