
// 3rd packages
var util = require('util')

exports.Checking = function (acl, numPathComponents, userId, actions) {
  function HttpError (errorCode, msg) {
    this.errorCode = errorCode
    this.message = msg
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
    this.constructor.prototype.__proto__ = Error.prototype
  }

  return function (req, res, next) {
    var _userId = userId
    var _actions = actions
    var url, resource

    if ((req.session) && (req.session.userId)) {
      _userId = req.session.userId
    } else if ((req.user) && (req.user.userId)) {
      _userId = req.user.userId
    } else {
      next(new HttpError(401, 'User not authenticated'))
      return
    }

    url = req.originalUrl.split('?')[0]
    // console.log('************* 1 ****************')
    // console.log(url)

    if (!numPathComponents) {
      resource = url
    } else {
      resource = url.split('/').slice(3, numPathComponents + 3).join('/')
    }

    if (!_actions) {
      _actions = req.method.toLowerCase()
    }

    acl.logger ? acl.logger.debug('Requesting ' + _actions + ' on ' + resource + ' by user ' + _userId) : null
    // console.log('************* 2 ****************')
    // console.log(_userId)
    // console.log('************* 3 ****************')
    // console.log(resource)
    // console.log('************* 4 ****************')
    // console.log(_actions)

    acl.isAllowed(_userId, resource, _actions, function (err, allowed) {
      if (err) {
        next(new Error('Error checking permissions to access resource'))
      } else if (allowed === false) {
        if (acl.logger) {
          acl.logger.debug('Not allowed ' + _actions + ' on ' + resource + ' by user ' + _userId)
          acl.allowedPermissions(_userId, resource, function (err, obj) {
            acl.logger.debug('Allowed permissions: ' + util.inspect(obj))
          })
        }
        next(new HttpError(403, 'Insufficient permissions to access resource'))
      } else {
        acl.logger ? acl.logger.debug('Allowed ' + _actions + ' on ' + resource + ' by user ' + _userId) : null
        next()
      }
    })
  }
}
