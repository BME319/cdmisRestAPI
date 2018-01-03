var Alluser = require('../models/alluser')
var async = require('async')
var dataGatherFunc = require('../middlewares/dataGatherFunc')

exports.getUserId = function (phoneNo, role) {
  return function (req, res, next) {
    async.auto({
      checkUser: function (callback) {
        let query = {phoneNo: phoneNo, role: role}
        let result
        Alluser.getOne(query, function (err, item) {
          if (err) {
            result = {status: 1, msg: 'Server Error!'}
          } else if (item === null) {
            result = {status: -1, msg: 'User not Exists!'}
          } else {
            result = {status: 0, userId: item.userId, _id: item._id, msg: 'UserId Got!'}
          }
          return callback(err, result)
        })
      },
      checkNo: ['checkUser', function (results, callback) {
        if (results.checkUser.status === -1) {
          dataGatherFunc.getSeriesNo(1, function (err, num) {
            return callback(err, num)
          })
        } else {
          return callback(null)
        }
      }],
      newUser: ['checkNo', function (results, callback) {
        if (results.checkUser.status === -1) {
          let userData = {
            userId: results.checkNo,
            phoneNo: phoneNo,
            role: [role]
          }
          let newAlluser = new Alluser(userData)
          newAlluser.save(function (err, info) {
            return callback(err, {status: 0, userId: info.userId, _id: info._id, msg: 'UserId Created!'})
            // let userId = results.checkNo
            // let roles = role

            // if (userId && roles) {
            //   acl.addUserRoles(userId, roles, function (err) {
            //     if (err) {
            //       return res.status(500).send(err.errmsg)
            //     }
            //     res.json({results: 0, userNo: _userNo, mesg: 'Alluser Register Success!'})
            //   })
            // } else {
            //   return res.status(400).send('empty inputs')
            // }
          })
        } else {
          return callback(null)
        }
      }]
    }, function (err, results) {
      if (results.checkUser.status === 0) {
        req.userId = results.checkUser.userId
        return next()
      } else if (results.newUser.status === 0) {
        req.userId = results.newUser.userId
        return next()
      } else {
        return res.json({status: 1, msg: '操作失败!'})
      }
    })
  }
}
