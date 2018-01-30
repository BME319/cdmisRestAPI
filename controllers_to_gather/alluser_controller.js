var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var async = require('async')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var errorHandler = require('../middlewares/errorHandler')

// 验证主管、关注患者
exports.dprelation = function (type) {
  return function (req, res, next) {
    if (req.doctorItem) {
      let query = {doctorId: req.doctorItem._id}
      DpRelation.getOne(query, function (err, dpitem) {
        if (err) {
          // return res.status(500).json({status: 1, msg: err})
          req.outputs = {status: 1, msg: err}
          errorHandler.makeError(2, req.outputs)(req, res, next)
        } else if (dpitem === null) {
          // return res.status(401).json({status: 1, msg: '与患者无任何联系没有操作权限'})
          req.outputs = {status: 1, msg: '与患者无任何联系没有操作权限'}
          // console.log('req.outputs', req.outputs)
          errorHandler.makeError(2, req.outputs)(req, res, next)
        } else {
          let patientId = req.patientItem.userId
          Alluser.getOne({userId: patientId}, function (err, item) {
            if (err) {
              // return res.status(500).json({status: 1, msg: err})
              req.outputs = {status: 1, msg: err}
              errorHandler.makeError(2, req.outputs)(req, res, next)
            } else if (item === null) {
              // return res.status(500).json({status: 1, msg: 'not_found!'})
              req.outputs = {status: 1, msg: 'not_found!'}
              errorHandler.makeError(2, req.outputs)(req, res, next)
            } else {
              let patientFlag = 0
              let patientChargeFlag = 0
              if (dpitem.patients) {
                if (dpitem.patients.length) {
                  for (let i = 0; i < dpitem.patients.length; i++) {
                    if (JSON.stringify(dpitem.patients[i].patientId) === JSON.stringify(item._id)) {
                      patientFlag = 1
                      break
                    }
                  }
                }
              }
              if (dpitem.patientsInCharge) {
                if (dpitem.patientsInCharge.length) {
                  for (let i = 0; i < dpitem.patientsInCharge.length; i++) {
                    if (JSON.stringify(dpitem.patientsInCharge[i].patientId) === JSON.stringify(item._id)) {
                      patientChargeFlag = 1
                      break
                    }
                  }
                }
              }
              if ((type.indexOf('charge') + 1) && patientChargeFlag) {
                next()
              } else if ((type.indexOf('follow') + 1) && patientFlag) {
                next()
              } else {
                // return res.status(401).json({status: 1, msg: '权限不足'})
                req.outputs = {status: 1, msg: '权限不足'}
                errorHandler.makeError(2, req.outputs)(req, res, next)
              }
            }
          })
        }
      })
    } else {
      // 患者本身也有权限
      next()
    }
  }
}

exports.updateAlluser = function (acl) {
  return function (req, res) {
    let phoneNo = req.body.phoneNo || null
    if (phoneNo === null) {
      return res.json({msg: '请检查输入,phoneNo', status: 1})
    }
    let _role = req.body.role || null
    // let queryD = {phoneNo: phoneNo, role: 'doctor'}
    // let queryP = {phoneNo: phoneNo, role: 'patient'}
    async.auto({
      getUser: function (cb) {
        // 检查是否需要新建用户
        dataGatherFunc.userIDbyPhone(phoneNo, null, function (err, item) {
          if (item.status === -1) { // 需要新建用户
            if (_role !== null) {
              async.auto({
                getNo: function (callback) {
                  dataGatherFunc.getSeriesNo(1, function (err, num) {
                    callback(err, num)
                  })
                },
                newUser: ['getNo', function (results, callback) {
                  let query = {phoneNo: phoneNo}
                  let upUser = {userId: results.getNo, $push: {role: _role}}
                  Alluser.updateOne(query, upUser, function (err, info) {
                    callback(err, info)
                  }, {upsert: true, new: true})
                }],
                aclAdd: ['getNo', function (results, callback) {
                  acl.addUserRoles(results.getNo, _role, function (err) {
                    callback(err)
                  })
                }]
              }, function (err, results) {
                return cb(err, {status: 0, userId: results.newUser.userId, _id: results.newUser._id, role: results.newUser.role, item: results.newUser, msg: 'UserId Created!'})
              })
            } else {
              return res.json({msg: '请检查输入,role', status: 1})
            }
          } else if (item.status === 0 && _role !== null && item.role.indexOf(_role) === -1) { // 需要添加用户角色
            async.auto({
              newUser: function (results, callback) {
                let query = {phoneNo: phoneNo}
                let upUser = {$push: {role: _role}}
                Alluser.updateOne(query, upUser, function (err, info) {
                  callback(err, info)
                }, {upsert: true, new: true})
              },
              aclAdd: function (results, callback) {
                acl.addUserRoles(item.userId, _role, function (err) {
                  callback(err)
                })
              }
            }, function (err, results) {
              return cb(err, {status: 0, userId: results.newUser.userId, _id: results.newUser._id, role: results.newUser.role, item: results.newUser, msg: 'UserId Created!'})
            })
          } else { // 不需要新建用户
            return cb(err, item)
          }
        })
      },
      getKeywords: ['getUser', function (results, callback) {
        let upObj = {}
        let role = _role || results.getUser.role
        // 2.确定需要修改的字段
        let name = req.body.name || null
        if (name !== null) {
          upObj['name'] = name
        }
        let gender = req.body.gender || null
        if (gender !== null) {
          upObj['gender'] = gender
        }
        let workUnit = req.body.workUnit || null
        if (workUnit !== null) {
          upObj['workUnit'] = workUnit
        }
        let workAmounts = req.body.workAmounts || null
        if (workAmounts !== null) {
          upObj['workAmounts'] = workAmounts
        }
        let creationTime = req.body.creationTime || null
        if (creationTime !== null) {
          upObj['creationTime'] = new Date(creationTime)
        }
        let password = req.body.password || null
        if (password !== null) {
          upObj['password'] = password
        }
        let unionId = req.body.unionId || null
        if (unionId !== null) {
          upObj['openId'] = unionId
        }
        let allergic = req.body.allergic || null
        if (allergic !== null) {
          upObj['allergic'] = allergic
        }
        let IDNo = req.body.IDNo || null
        if (IDNo !== null) {
          upObj['IDNo'] = IDNo
        }
        let height = req.body.height || null
        if (height !== null) {
          upObj['height'] = height
        }
        let weight = req.body.weight || null
        if (weight !== null) {
          upObj['weight'] = weight
        }
        let occupation = req.body.occupation || null
        if (occupation !== null) {
          upObj['occupation'] = occupation
        }
        let bloodType = req.body.bloodType || null
        if (bloodType !== null) {
          upObj['bloodType'] = bloodType
        }
        let photoUrl = req.body.photoUrl || null
        if (photoUrl !== null) {
          upObj['photoUrl'] = photoUrl
        }
        let birthday = req.body.birthday || null
        if (birthday !== null) {
          upObj['birthday'] = new Date(birthday)
        }
        let certificatePhotoUrl = req.body.certificatePhotoUrl || null
        if (certificatePhotoUrl !== null) {
          upObj['certificatePhotoUrl'] = certificatePhotoUrl
        }
        let practisingPhotoUrl = req.body.practisingPhotoUrl || null
        if (practisingPhotoUrl !== null) {
          upObj['practisingPhotoUrl'] = practisingPhotoUrl
        }
        let title = req.body.title || null
        if (title !== null) {
          upObj['title'] = title
        }
        let job = req.body.job || null
        if (job !== null) {
          upObj['job'] = job
        }
        let department = req.body.department || null
        if (department !== null) {
          upObj['department'] = department
        }
        let major = req.body.major || null
        if (major !== null) {
          upObj['major'] = major
        }
        let description = req.body.description || null
        if (description !== null) {
          upObj['description'] = description
        }

        // 需要考虑角色不同放置于不同字段
        let openIdWechat = req.body.openIdWechat || null
        if (openIdWechat !== null) {
          if (role === 'patient' || role.indexOf('patient') !== -1) {
            upObj['MessageOpenId.patientWechat'] = openIdWechat
          } else if (role === 'doctor' || role.indexOf('doctor') !== -1) {
            upObj['MessageOpenId.doctorWechat'] = openIdWechat
          }
        }
        let openIdApp = req.body.openIdApp || null
        if (openIdApp !== null) {
          if (role === 'patient' || role.indexOf('patient') !== -1) {
            upObj['MessageOpenId.patientApp'] = openIdApp
          } else if (role === 'doctor' || role.indexOf('doctor') !== -1) {
            upObj['MessageOpenId.doctorApp'] = openIdApp
          }
        }
        let nation = req.body.nation || null
        if (nation !== null) {
          if (role === 'patient' || role.indexOf('patient') !== -1) {
            upObj['address.nation'] = nation
          }
        }
        let province = req.body.province || null
        if (province !== null) {
          if (role === 'patient' || role.indexOf('patient') !== -1) {
            upObj['address.province'] = province
          } else if (role === 'doctor' || role.indexOf('doctor') !== -1) {
            upObj['province'] = province
          }
        }
        let city = req.body.city || null
        if (city !== null) {
          if (role === 'patient' || role.indexOf('patient') !== -1) {
            upObj['address.city'] = city
          } else if (role === 'doctor' || role.indexOf('doctor') !== -1) {
            upObj['city'] = city
          }
        }
        // 需要考虑角色不同放置于不同字段

        // 需要考虑是修改服务收费还是修改服务类型
        if (role === 'doctor' || role.indexOf('doctor') !== -1) {
          let serviceType = req.body.serviceType || null
          let charge = req.body.charge || null
          if (charge !== null) {
            switch (serviceType) {
              case 'service1':
                upObj = {charge1: charge}
                break
              case 'service2':
                upObj = {charge2: charge}
                break
              case 'service3':
                upObj = {charge3: charge}
                break
              case 'service4':
                upObj = {charge4: charge}
                break
              case 'service5':
                upObj = {charge5: charge}
                break
              default:
                break
            }
          } else {
            let doctorItem = results.getUser.item
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
          }
        }
        // 需要考虑是修改服务收费还是修改服务类型
        return callback(null, upObj)
      }],
      editInfo: ['getKeywords', function (results, callback) {
        // 3.修改字段
        let query = {phoneNo: phoneNo}
        Alluser.updateOne(query, {$set: results.getKeywords}, function (err, item1) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'alluser/alluser接收成功'})
          }
        })
      }],
      traceRecord: ['editInfo', function (results, callback) {
        // 4.保存trace
        let params = req.body
        let outputs = results.editInfo
        dataGatherFunc.traceRecord(phoneNo, 'alluser/alluser', params, outputs, function (err, item) {
          return callback(err, item)
        })
      }]
    }, function (err, results) {
      // 5.返回
      if (err) {
        return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
        return res.json(results.editInfo)
      } else {
        return res.json({msg: 'Server Error!', status: 1})
      }
    })
  }
}

exports.groupPatient = function (req, res) {
  let phoneNo = req.body.phoneNo || null
  let label = req.body.label || null
  let time = req.body.time || null
  // if (phoneNo === null || label === null) {
  //   return res.json({msg: '请检查输入,phoneNo/label', status: 1})
  // }
  let flag = req.body.flag || null
  if (phoneNo === null || label === null || flag === null) {
    return res.json({msg: '请检查输入,phoneNo/label/flag', status: 1})
  }
  let upObj = {}
  if (label === 'VIP') {
    // upObj = {VIP: 1}
    if (flag === 1) {
      upObj = {VIP: 1}
    } else {
      upObj = {VIP: 0}
    }
  } else {
    // upObj = {$push: {labels: {label: label, time: new Date(time || new Date())}}}
    if (flag === 1) {
      upObj = {$push: {labels: {label: label, time: new Date(time || new Date())}}}
    } else {
      upObj = {$pull: {labels: {label: label}}}
    }
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(phoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    group: ['getPatient', function (results, callback) {
      if (results.getPatient.status === 0) {
        let query = {_id: results.getPatient._id}
        Alluser.updateOne(query, upObj, function (err, item) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'doctor/groupPatient接收成功'})
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['group', function (results, callback) {
      let params = req.body
      let outputs = results.group
      dataGatherFunc.traceRecord(req.body.phoneNo, 'doctor/groupPatient', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    // 5.返回
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.group)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}
