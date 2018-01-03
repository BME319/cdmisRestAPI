var Trace = require('../models/trace')

exports.traceRecord = function (apiName) {
  return function (req, res) {
    let outputs = {status: req.status, msg: req.msg}
    let traceData = {
      phoneNo: req.body.phoneNo,
      apiName: apiName,
      time: new Date(),
      params: req.body,
      outputs: outputs
    }
    let newTrace = new Trace(traceData)
    newTrace.save(function (err, traceInfo) {
      if (err) {
        return res.json({status: 1, msg: '操作失败!'})
      } else {
        return res.json({status: 0, msg: '操作成功!'})
      }
    })
  }
}
