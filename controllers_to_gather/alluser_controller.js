var Alluser = require('../models/alluser')

exports.updateAlluser = function (acl) {
  return function (req, res) {
    // let userId = req.body.userId
    let phoneNo = req.body.phoneNo || null
    let role = req.body.role || null
    let query = {phoneNo: phoneNo}
    let queryR = {phoneNo: phoneNo, role: role}
    
    // 1.判断是否新建用户（注册流程）

    // 2.确定需要修改的字段
    let upObj = {}

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
    if (workUnit !== null) {
      upObj['workUnit'] = workUnit
    }
    let openIdApp = req.body.openIdApp || null
    if (workUnit !== null) {
      upObj['workUnit'] = workUnit
    }
    let nation = req.body.nation || null
    if (nation !== null) {
      if role
      upObj['address.nation'] = nation
    }
    let province = req.body.province || null
    if (province !== null) {
      upObj['province'] = province
    }
    let city = req.body.city || null
    if (city !== null) {
      upObj['city'] = city
    }
    // 需要考虑角色不同放置于不同字段

    // 需要考虑是修改服务收费还是修改服务类型
    let serviceType = req.body.serviceType || null
    let charge = req.body.charge || null

    // 需要考虑是修改服务收费还是修改服务类型

    // 3.修改字段
    Alluser.updateOne(query, {$set: upObj}, function (err, item1) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      res.json({status: 0, results: item1, msg: 'success!'})
    })
    // 4.保存trace
    // 5.返回
  }
}