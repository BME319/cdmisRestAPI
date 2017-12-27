var Alluser = require('../models/alluser')
var Trace = require('../models/trace')

var dataGatherFunc = {
  userIDbyPhone: function (phoneNo, role, callback) {
    let query = {phoneNo: phoneNo, role: role}
    Alluser.getOne(query, function (err, item) {
      let result
      if (err) {
        result = {status: 1, msg: 'Server Error!'}
      } else if (item === null) {
        result = {status: 1, msg: 'User not Exists!'}
      } else {
        result = {status: 0, userId: item.userId, _id: item._id, msg: 'UserId Got!'}
      }
      callback(err, result)
    })
  },
  traceRecord: function (phoneNo, apiName, params, outputs, callback) {
    let traceData = {
      phoneNo: phoneNo,
      apiName: apiName,
      time: new Date(),
      params: params,
      outputs: outputs
    }
    let newTrace = new Trace(traceData)
    newTrace.save(function (err, traceInfo) {
      let result
      if (err) {
        result = {status: 1, msg: 'Server Error!'}
      } else {
        result = {status: 0, msg: 'Trace Recorded!'}
      }
      callback(err, result)
    })
  }
}

module.exports = dataGatherFunc
