// var Alluser = require('../models/alluser')
var async = require('async')
var dataGatherFunc = require('../middlewares/dataGatherFunc')

exports.updateAlluser = function (acl) {
  return function (req, res) {
    let phoneNo = req.body.phoneNo || null
    if (phoneNo === null) {
      return res.json({msg: '请检查输入,phoneNo', status: 1})
    }
    // let role = req.body.role || null
    // let queryD = {phoneNo: phoneNo, role: 'doctor'}
    // let queryP = {phoneNo: phoneNo, role: 'patient'}

    // let outputs
    // async.auto({
    //   checkNew: function (callback) {
    //     async.auto({
    //       getPatient: function (callback) {
    //         dataGatherFunc.userIDbyPhone(phoneNo, 'patient', function (err, item) {
    //           return callback(err, item)
    //         })
    //       },
    //       getDoctor: function (callback) {
    //         dataGatherFunc.userIDbyPhone(phoneNo, 'doctor', function (err, item) {
    //           return callback(err, item)
    //         })
    //       }
    //     })
    //   }
    // })
    // // 1.判断是否新建用户（注册流程）

    // // 2.确定需要修改的字段
    // let upObj = {}

    // let name = req.body.name || null
    // if (name !== null) {
    //   upObj['name'] = name
    // }
    // let gender = req.body.gender || null
    // if (gender !== null) {
    //   upObj['gender'] = gender
    // }
    // let workUnit = req.body.workUnit || null
    // if (workUnit !== null) {
    //   upObj['workUnit'] = workUnit
    // }
    // let workAmounts = req.body.workAmounts || null
    // if (workAmounts !== null) {
    //   upObj['workAmounts'] = workAmounts
    // }
    // let creationTime = req.body.creationTime || null
    // if (creationTime !== null) {
    //   upObj['creationTime'] = new Date(creationTime)
    // }
    // let password = req.body.password || null
    // if (password !== null) {
    //   upObj['password'] = password
    // }
    // let unionId = req.body.unionId || null
    // if (unionId !== null) {
    //   upObj['openId'] = unionId
    // }
    // let allergic = req.body.allergic || null
    // if (allergic !== null) {
    //   upObj['allergic'] = allergic
    // }
    // let IDNo = req.body.IDNo || null
    // if (IDNo !== null) {
    //   upObj['IDNo'] = IDNo
    // }
    // let height = req.body.height || null
    // if (height !== null) {
    //   upObj['height'] = height
    // }
    // let weight = req.body.weight || null
    // if (weight !== null) {
    //   upObj['weight'] = weight
    // }
    // let occupation = req.body.occupation || null
    // if (occupation !== null) {
    //   upObj['occupation'] = occupation
    // }
    // let bloodType = req.body.bloodType || null
    // if (bloodType !== null) {
    //   upObj['bloodType'] = bloodType
    // }
    // let photoUrl = req.body.photoUrl || null
    // if (photoUrl !== null) {
    //   upObj['photoUrl'] = photoUrl
    // }
    // let birthday = req.body.birthday || null
    // if (birthday !== null) {
    //   upObj['birthday'] = new Date(birthday)
    // }
    // let certificatePhotoUrl = req.body.certificatePhotoUrl || null
    // if (certificatePhotoUrl !== null) {
    //   upObj['certificatePhotoUrl'] = certificatePhotoUrl
    // }
    // let practisingPhotoUrl = req.body.practisingPhotoUrl || null
    // if (practisingPhotoUrl !== null) {
    //   upObj['practisingPhotoUrl'] = practisingPhotoUrl
    // }
    // let title = req.body.title || null
    // if (title !== null) {
    //   upObj['title'] = title
    // }
    // let job = req.body.job || null
    // if (job !== null) {
    //   upObj['job'] = job
    // }
    // let department = req.body.department || null
    // if (department !== null) {
    //   upObj['department'] = department
    // }
    // let major = req.body.major || null
    // if (major !== null) {
    //   upObj['major'] = major
    // }
    // let description = req.body.description || null
    // if (description !== null) {
    //   upObj['description'] = description
    // }

    // // 需要考虑角色不同放置于不同字段
    // let openIdWechat = req.body.openIdWechat || null
    // if (openIdWechat !== null) {
    //   if (role === 'patient') {
    //     upObj['MessageOpenId.patientWechat'] = openIdWechat
    //   } else if (role === 'doctor') {
    //     upObj['MessageOpenId.doctorWechat'] = openIdWechat
    //   } else {
    //     outputs = {status: 1, msg: '请检查role输入'}
    //   }
    // }
    // let openIdApp = req.body.openIdApp || null
    // if (openIdApp !== null) {
    //   if (role === 'patient') {
    //     upObj['MessageOpenId.patientApp'] = openIdApp
    //   } else if (role === 'doctor') {
    //     upObj['MessageOpenId.doctorApp'] = openIdApp
    //   } else {
    //     outputs = {status: 1, msg: '请检查role输入'}
    //   }
    // }
    // let nation = req.body.nation || null
    // if (nation !== null) {
    //   if (role === 'patient') {
    //     upObj['address.nation'] = nation
    //   } else {
    //     outputs = {status: 1, msg: '请检查role输入'}
    //   }
    // }
    // let province = req.body.province || null
    // if (province !== null) {
    //   if (role === 'patient') {
    //     upObj['address.province'] = province
    //   } else if (role === 'doctor') {
    //     upObj['province'] = province
    //   } else {
    //     outputs = {status: 1, msg: '请检查role输入'}
    //   }
    // }
    // let city = req.body.city || null
    // if (city !== null) {
    //   if (role === 'patient') {
    //     upObj['address.city'] = city
    //   } else if (role === 'doctor') {
    //     upObj['city'] = city
    //   } else {
    //     outputs = {status: 1, msg: '请检查role输入'}
    //   }
    // }
    // // 需要考虑角色不同放置于不同字段

    // // 需要考虑是修改服务收费还是修改服务类型
    // let serviceType = req.body.serviceType || null
    // let charge = req.body.charge || null
    // if (charge !== null) {
    //   switch (serviceType) {
    //     case 'service1':
    //       upObj = {charge1: charge}
    //       break
    //     case 'service2':
    //       upObj = {charge2: charge}
    //       break
    //     case 'service3':
    //       upObj = {charge3: charge}
    //       break
    //     case 'service4':
    //       upObj = {charge4: charge}
    //       break
    //     case 'service5':
    //       upObj = {charge5: charge}
    //       break
    //     default:
    //       break
    //   }
    // } else {
    //   switch (serviceType) {
    //     case 'service1':
    //       upObj = {counselStatus1: (!doctorItem.counselStatus1)}
    //       break
    //     case 'service2':
    //       upObj = {counselStatus2: (!doctorItem.counselStatus2)}
    //       break
    //     case 'service3':
    //       upObj = {counselStatus3: (!doctorItem.counselStatus3)}
    //       break
    //     case 'service4':
    //       upObj = {counselStatus4: (!doctorItem.counselStatus4)}
    //       break
    //     case 'service5':
    //       upObj = {counselStatus5: (!doctorItem.counselStatus5)}
    //       break
    //     case 'service6':
    //       upObj = {autoRelay: (!doctorItem.autoRelay)}
    //       break
    //     default:
    //       break
    //   }
    // }
    // // 需要考虑是修改服务收费还是修改服务类型

    // // 3.修改字段
    // Alluser.updateOne(query, {$set: upObj}, function (err, item1) {
    //   if (err) {
    //     return res.status(500).send(err.errmsg)
    //   }
    //   res.json({status: 0, results: item1, msg: 'success!'})
    // })
    // // 4.保存trace
    // // 5.返回
    let outputs = {status: 0, msg: 'alluser/alluser已接收未写入'}
    async.auto({
      traceRecord: function (callback) {
        let params = req.body
        dataGatherFunc.traceRecord(phoneNo, 'alluser/alluser', params, outputs, function (err, item) {
          return callback(err, item)
        })
      }
    }, function (err, results) {
      if (err) {
        return res.json({msg: err, status: 1})
      } else if (results.traceRecord.status === 0) {
        return res.json(outputs)
      } else {
        return res.json({msg: 'Server Error!', status: 1})
      }
    })
  }
}
