var config = require('../config')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')

var Refreshtoken = require('../models/refreshtoken')

exports.verifyToken = function () {
  return function (req, res, next) {
    var token = (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token) || null

    // var token = jwt.sign(userPayload, config.tokenSecret, {algorithm:'HS256'},{expiresIn: config.TOKEN_EXPIRATION});

    if (token) {
      jwt.verify(token, config.tokenSecret, function (err, decoded) {
        // console.log(decoded.exp)
        // console.log(new Date())
        // console.log(decoded.exp < new Date())
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).send('TokenExpiredError')
          } else {
            return res.status(401).send(err)
          }
        } else if (decoded.exp < new Date()) {
          return res.status(401).send('TokenExpiredError')
        } else {
          req.session = decoded
          req.token = token
          // console.log(req.session)
          return next()
        }
      })
    } else {
      return res.status(401).send('无授权信息!')
    }
  }
}

// exports.refreshToken = function (req, res) {
//   var refreshToken = req.body.refresh_token || req.query.refresh_token
//   console.log(refreshToken)

//   var query = {refreshtoken: refreshToken}
//   Refreshtoken.getOne(query, function (err, item) {
//     if (err) {
//       return res.status(500).send('服务器错误, 凭证查询失败!')
//     }
//     if (item) {
//       var userPayload = JSON.parse(item.userPayload)

//       Refreshtoken.removeOne({refreshtoken: refreshToken}, function (err) {
//         if (err) {
//           return res.status(500).send(err.errmsg)
//         } else {
//           userPayload.exp = Date.now() + config.TOKEN_EXPIRATION * 1000
//           userPayload = JSON.stringify(userPayload)

//           var token = jwt.sign(userPayload, config.tokenSecret, {algorithm: 'HS256'}, {expiresIn: config.TOKEN_EXPIRATION})

//           var sha1 = crypto.createHash('sha1')
//           var refreshToken = sha1.update(token).digest('hex')

//           var refreshtokenData = {
//             refreshtoken: refreshToken,
//             userPayload: JSON.stringify(userPayload)
//           }

//           var newRefreshtoken = new Refreshtoken(refreshtokenData)
//           newRefreshtoken.save(function (err, Info) {
//             if (err) {
//               return res.status(500).send(err.errmsg)
//             } else {
//               return res.json({results: {token: token, refreshToken: refreshToken}})
//             }
//           })
//         }
//       })
//     } else {
//       return res.status(401).send('凭证不存在!')
//     }
//   })
// }

// 修改refreshToken方法：增加表中userId字段；remove操作在5秒后统一执行 GY 2017-09-08
exports.refreshToken = function (req, res) {
  var refreshToken = req.body.refresh_token || req.query.refresh_token
  // console.log(refreshToken)

  var query = {refreshtoken: refreshToken}
  Refreshtoken.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send('服务器错误, 凭证查询失败!')
    }
    if (item) {
      var userPayload = JSON.parse(item.userPayload)
      userPayload.exp = Date.now() + config.TOKEN_EXPIRATION * 1000
      // userPayload = JSON.stringify(userPayload)

      var token = jwt.sign(userPayload, config.tokenSecret, {algorithm: 'HS256'}, {expiresIn: config.TOKEN_EXPIRATION})

      var sha1 = crypto.createHash('sha1')
      var newrefreshToken = sha1.update(token).digest('hex')

      var refreshtokenData = {
        refreshtoken: newrefreshToken,
        userPayload: JSON.stringify(userPayload), 
        userId: item.userId
      }

      var newRefreshtoken = new Refreshtoken(refreshtokenData)
      newRefreshtoken.save(function (err, Info) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          return res.json({results: {token: token, refreshToken: newrefreshToken}})
        }
      })

      // setTimeout(function() {
      //   console.log('success')
      // }, 5000)
      setTimeout(function() {
        let timeout = new Date() - 11000
        let queryRM = {
          $or: [
            {refreshtoken: refreshToken}, 
            {
              userId: item.userId, 
              createAt: {$gt: timeout}
            }
          ]
        }
        // console.log(queryRM)
        Refreshtoken.remove(queryRM, function (err) {
          if (err) {
            console.log(err)
          }
          newRefreshtoken.save(function (err, Info) {
            if (err) {
              // return res.status(500).send(err.errmsg)
              console.log(err)
            } else {
              // return res.json({results: {token: token, refreshToken: newrefreshToken}})
            }
          })
        })
      }, 10000)

      // Refreshtoken.removeOne({refreshtoken: refreshToken}, function (err) {
      //   if (err) {
      //     return res.status(500).send(err.errmsg)
      //   } else {
          
      //   }
      // })
    } else {
      return res.status(401).send('凭证不存在!')
    }
  })
}

var getToken = function (headers) {
  if (headers && headers.authorization) {
    var authorization = headers.authorization
    var part = authorization.split(' ')
    if (part.length === 2) {
      var token = part[1]
      return token
    } else {
      return null
    }
  } else {
    return null
  }
}
