var Alluser = require('../models/alluser')
var Team = require('../models/team')

// 获取对象 2017-07-22 YQC
// 获取用户对象
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    }
    if (user === null) {
      return res.status(404).send('User Not Found')
    } else if (req.session.role === 'patient') {
      req.body.patientObject = user
      next()
    } else if (req.session.role === 'doctor') {
      req.body.doctorObject = user
      next()
    } else {
      return res.status(400).send('Role of the User is neither a doctor nor a patient')
    }
  })
}
// 获取患者ID对象
exports.getPatientObject = function (req, res, next) {
  let patientId = req.body.patientId || req.query.patientId || null
  if (patientId === null) {
    return res.status(412).send('Please Check Input of patientId')
  }
  let query = {userId: patientId, role: 'patient'}
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      return res.status(500).send(err)
    }
    if (patient === null) {
      return res.status(404).send('Patient Not Found')
    } else {
      req.body.patientObject = patient
      next()
    }
  })
}
// 获取医生ID对象
exports.getDoctorObject = function (req, res, next) {
  let doctorId = req.body.doctorId || req.query.doctorId || null
  if (doctorId === null) {
    return res.status(412).json({results: '请填写doctorId'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctor === null) {
      return res.status(404).json({results: '找不到医生'})
    } else {
      req.body.doctorObject = doctor
      next()
    }
  })
}

// 获取某位医生的服务开启状态及收费情况
// 根据医生ID获取服务开启状态 2017-07-14 GY
exports.getServices = function (req, res) {
  let doctorId = req.session.userId || null
  let query = {}
  if (doctorId === null) {
    return res.status(412).json({results: '请输入doctorId'})
  } else {
    query['userId'] = doctorId
  }
  let opts = {}
  let fields = {
    userId: 1,
    counselStatus1: 1,
    counselStatus2: 1,
    counselStatus3: 1,
    counselStatus4: 1,
    counselStatus5: 1,
    charge1: 1,
    charge2: 1,
    charge3: 1,
    charge4: 1,
    charge5: 1,
    serviceSchedules: 1,
    serviceSuspendTime: 1,
    autoRelay: 1,
    relayTarget: 1
  }
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      // return res.json({results: doctorItem})
      let query = {$or: [{sponsorId: doctorId}, {'members.userId': doctorId}]}
      let opts = ''
      let fields = {_id: 0, teamId: 1, name: 1, sponsorName: 1}
      Team.getSome(query, function (err, items) {
        if (err) {
          return res.status(500).send(err)
        }
        res.json({results: doctorItem, teams: items})
      }, opts, fields)
    }
  }, opts, fields)
}

// 医生端使用的方法：开放修改及设置权限
// 修改服务开启状态 2017-07-14 GY
// 修改开启自动转发功能时的输出，增加所在队伍信息 2017-07-22 YQC
// 承接session.userId，输入修改的服务状态type，输出修改状态（和所在队伍信息）
exports.changeServiceStatus = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1':
          upObj = {counselStatus1: (!doctorItem.counselStatus1)}
          break
        case 'service2':
          upObj = {counselStatus2: (!doctorItem.counselStatus2)}
          break
        case 'service3':
          upObj = {counselStatus3: (!doctorItem.counselStatus3)}
          break
        case 'service4':
          upObj = {counselStatus4: (!doctorItem.counselStatus4)}
          break
        case 'service5':
          upObj = {counselStatus5: (!doctorItem.counselStatus5)}
          break
        case 'service6':
          upObj = {autoRelay: (!doctorItem.autoRelay)}
          break
        default:
          break
      }
      let opts = {
        new: true,
        runValidators: true,
        fields: {
          userId: 1,
          name: 1,
          counselStatus1: 1,
          counselStatus2: 1,
          counselStatus3: 1,
          counselStatus4: 1,
          counselStatus5: 1,
          charge1: 1,
          charge2: 1,
          charge3: 1,
          charge4: 1,
          charge5: 1,
          serviceSchedules: 1,
          serviceSuspendTime: 1,
          autoRelay: 1,
          relayTarget: 1
        }
      }
      Alluser.updateOne(query, upObj, function (err, upitem) {
        if (err) {
          return res.status(500).send(err)
        }
        if (upitem === null) {
          return res.status(404).json({results: '找不到对象'})
        } else {
          if (serviceType !== 'service6') {
            return res.json({results: upitem})
          } else {
            let query = {$or: [{sponsorId: req.session.userId}, {'members.userId': req.session.userId}]}
            let opts = ''
            let fields = {_id: 0, teamId: 1, name: 1, sponsorName: 1}
            Team.getSome(query, function (err, items) {
              if (err) {
                return res.status(500).send(err)
              }
              res.json({currentStatus: upitem, teams: items})
            }, opts, fields)
          }
        }
      }, opts)
    }
  })
}

// 设置服务收费费用 2017-07-14 GY
exports.setCharge = function (req, res) {
  let query = {
    userId: req.session.userId
  }
  let serviceType = req.body.serviceType || null
  if (serviceType === null || serviceType === '') {
    return res.status(412).json({results: '请输入要修改的serviceType'})
  }
  let charge = req.body.charge || null
  if (charge === null || charge === '') {
    return res.status(412).json({results: '请输入费用'})
  }
  let upObj = {}
  Alluser.getOne(query, function (err, doctorItem) {
    if (err) {
      return res.status(500).send(err)
    }
    if (doctorItem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      switch (serviceType) {
        case 'service1':
          if (doctorItem.counselStatus1 === 1) upObj = {charge1: charge}
          break
        case 'service2':
          if (doctorItem.counselStatus2 === 1) upObj = {charge2: charge}
          break
        case 'service3':
          if (doctorItem.counselStatus3 === 1) upObj = {charge3: charge}
          break
        case 'service4':
          if (doctorItem.counselStatus4 === 1) upObj = {charge4: charge}
          break
        case 'service5':
          if (doctorItem.counselStatus5 === 1) upObj = {charge5: charge}
          break
        default:
          break
      }
      if (JSON.stringify(upObj) === '{}') {
        return res.status(412).json({results: '请先开启服务'})
      } else {
        let opts = {
          new: true,
          runValidators: true,
          fields: {
            userId: 1,
            name: 1,
            counselStatus1: 1,
            counselStatus2: 1,
            counselStatus3: 1,
            counselStatus4: 1,
            counselStatus5: 1,
            charge1: 1,
            charge2: 1,
            charge3: 1,
            charge4: 1,
            charge5: 1,
            serviceSchedules: 1,
            serviceSuspendTime: 1,
            autoRelay: 1,
            relayTarget: 1
          }
        }
        Alluser.updateOne(query, upObj, function (err, upitem) {
          if (err) {
            return res.status(500).send(err)
          }
          if (upitem === null) {
            return res.status(404).json({results: '找不到对象'})
          } else {
            return res.json({results: upitem})
          }
        }, opts)
      }
    }
  })
}

// 设置自动转发团队 2017-07-15 GY
exports.setRelayTarget = function (req, res) {
  let query = {userId: req.session.userId}
  let upObj = {
    relayTarget: req.body.relayTarget
  }
  let opts = {
    new: true,
    runValidators: true,
    fields: {
      userId: 1,
      name: 1,
      counselStatus1: 1,
      counselStatus2: 1,
      counselStatus3: 1,
      counselStatus4: 1,
      counselStatus5: 1,
      charge1: 1,
      charge2: 1,
      charge3: 1,
      charge4: 1,
      charge5: 1,
      serviceSchedules: 1,
      serviceSuspendTime: 1,
      autoRelay: 1,
      relayTarget: 1
    }
  }
  Alluser.updateOne(query, upObj, function (err, upitem) {
    if (err) {
      if (err.name === 'CastError') {
        return res.status(412).json({results: '不符合要求的输入', path: err.path})
      } else {
        return res.status(500).send(err)
      }
    }
    if (upitem === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      let flag = 0
      for (let i = 0; i < upitem.relayTarget.length; i++) {
        if (JSON.stringify(upitem.relayTarget[i]) === '{}') { break }
        flag++
      }
      if (flag === upitem.relayTarget.length) {
        return res.json({results: upitem})
      } else {
        return res.status(412).json({results: '请检查输入'})
      }
    }
  }, opts)
}
