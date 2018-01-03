var Alluser = require('../models/alluser')

exports.getUserId = function(req, res) {
  let phoneNo = req.body.phoneNo
  Alluser.getOne({phoneNo: phoneNo}, function (err, item) {
    if (err) {
      return res.json({status: 1, msg: 'Server Error!'})
    } else if (item === null) {
      return res.json({status: 1, msg: '用户不存在'})
    } else {
      req.userId = item.userId
      req.name = item.name
      return next()
    }
  })
}