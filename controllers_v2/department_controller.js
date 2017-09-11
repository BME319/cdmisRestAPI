var Department = require('../models/department')
// var Alluser = require('../models/alluser')

// 返回地区、地区负责人
exports.getDistrict = function (req, res) {
  let district = req.query.district || ''
  let portleader = req.query.portleader || ''
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let opts = {limit: limit, skip: skip, sort: '_id'}
  let query = {}
  // 若district为空，返回所有地区信息；若不为空，返回该地区信息
  if (district !== '') {
    query['district'] = {$regex: district}
  }
  if (portleader !== '') {
    query['portleader'] = portleader
  }
  let fields = {district: 1, portleader: 1}
  let populate = [
    {
      path: 'portleader',
      select: {'name': 1, 'userId': 1}
    }
  ]
  Department.getSome(query, fields, function (err, Info) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    Info = distinct(Info)
    res.json({results: Info})
  }, populate, opts)
}

// 返回地区、地区负责人、科室、医院、科室负责人
exports.getDepartment = function (req, res) {
  let district = req.query.district || ''
  let portleader = req.query.portleader || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let departLeader = req.query.departLeader || ''
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let opts = {limit: limit, skip: skip, sort: '_id'}
  let query = {}
  // 若district为空，返回所有科室信息；若不为空，返回该地区的科室信息
  if (district !== '') {
    query['district'] = {$regex: district}
  }
  if (portleader !== '') {
    query['portleader'] = portleader
  }
  if (department !== '') {
    query['department'] = {$regex: department}
  } else {
    query['department'] = {$ne: null}
  }
  if (hospital !== '') {
    query['hospital'] = {$regex: hospital}
  }
  if (departLeader !== '') {
    query['departLeader'] = departLeader
  }
  let fields = {district: 1, portleader: 1, department: 1, hospital: 1, departLeader: 1}
  let populate = {
    path: 'portleader departLeader',
    select: {'name': 1, 'userId': 1}
  }
  Department.getSome(query, fields, function (err, Info) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    res.json({results: Info})
  }, populate, opts)
}

// 输入地区、科室、医院，获取医生列表
exports.getDoctorList = function (req, res) {
  let district = req.query.district || ''
  let department = req.query.department || ''
  let hospital = req.query.hospital || ''
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let opts = {limit: limit, skip: skip, sort: '_id'}
  if (district === '') {
    res.status(400).send('请输入地区')
  } else if (department === '') {
    res.status(400).send('请输入科室')
  } else if (hospital === '') {
    res.status(400).send('请输入医院')
  } else {
    let query = {
      district: district,
      department: department,
      hospital: hospital
    }
    let fields = {district: 1, portleader: 1, department: 1, hospital: 1, departLeader: 1, doctors: 1}
    let populate = {
      path: 'portleader departLeader doctors',
      select: {'name': 1, 'userId': 1}
    }
    Department.getOne(query, fields, function (err, Info) {
      if (err) {
        res.status(500).send(err)
      }
      if (Info !== null) {
        res.json({results: Info.doctors})
      } else {
        res.status(500).send('没有医生')
      }
    }, populate, opts)
  }
}

// 更新地区信息
exports.updateDistrict = function (req, res) {
  let district = req.body.district || ''
  let newdistrict = req.body.new.newdistrict || ''
  let newportleader = req.body.new.newportleader || ''
  if (district === null || district === '') {
    res.status(400).send('请输入地区！')
  } else {
    let query = {district: district}
    let obj = {}
    if (newdistrict !== '') {
      obj['district'] = newdistrict
    }
    if (newportleader !== '') {
      obj['portleader'] = newportleader
    }
    Department.update(query, obj, function (err, Info) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      res.json('更新成功')
    }, {upsert: true, multi: true})
  }
}

// 输入科室、医院、地区，要更新的内容，更新科室信息
exports.updateDepartment = function (req, res) {
  let district = req.body.district || ''
  // let portleader = req.body.portleader || ''
  let hospital = req.body.hospital || ''
  let department = req.body.department || ''
  let newdepartment = req.body.new.newdepartment || ''
  let newdepartLeader = req.body.new.newdepartLeader || ''
  let newdoctors = req.body.new.newdoctors || ''
  if (department === '') {
    res.status(400).send('请输入科室')
  } else if (hospital === '') {
    res.status(400).send('请输入医院')
  } else if (district === '') {
    res.status(400).send('请输入地区')
  } else {
    let query1 = {
      district: district
    }
    let query = {}
    let obj = {}
    Department.getSome(query1, null, function (err, Info) {
      if (err) {
        res.status(500).send(err)
      }
      let portleader = Info[0].portleader
      // console.log('Info' + Info[0].department)
      if (Info[0].department !== undefined) {
        query = {
          department: department,
          hospital: hospital,
          portleader: portleader,
          district: district
        }
      } else {
        query = {
          district: district
        }
        obj['department'] = department
        obj['hospital'] = hospital
      }
      if (newdepartment !== '') {
        obj['department'] = newdepartment
      }
      if (newdepartLeader !== '') {
        obj['departLeader'] = newdepartLeader
      }
      if (newdoctors !== '') {
        obj['doctors'] = newdoctors
      }
      obj = {
        $set: obj
      }
      Department.update(query, obj, function (err, Info) {
        if (err) {
          res.status(500).send(err.errmsg)
        }
        res.json('更新成功')
      }, {upsert: true})
    })
  }
}

// 删除记录
exports.deleteRecord = function (req, res) {
  let district = req.body.district || ''
  let hospital = req.body.hospital || ''
  let department = req.body.department || ''
  let query = {}
  if (district !== '') {
    query['district'] = district
  }
  if (hospital !== '') {
    query['hospital'] = hospital
  }
  if (department !== '') {
    query['department'] = department
  }
  Department.remove(query, function (err, Info) {
    if (err) {
      res.status(500).send(err)
    }
    res.json('删除成功')
  })
}
function distinct (data) {
  let arr = []
  let arrCompare = []
  for (let i = 0; i < data.length; i++) {
    let district = data[i].district
    if (arrCompare.indexOf(district) === -1) {
      arr.push(data[i])
      arrCompare.push(data[i].district)
    }
  }
  return arr
}
