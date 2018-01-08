var Compliance = require('../models/compliance')
var Alluser = require('../models/alluser')
var Trace = require('../models/trace')
var errorHandler = require('../middlewares/errorHandler')

exports.pUserIDbyPhone = function (req, res, next) {
  let phoneNo = req.body.phoneNo || null
  if (phoneNo === null) {
    req.outputs = {status: 1, msg: '请输入phoneNo!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  } else {
    let query = {phoneNo: req.body.phoneNo, role: 'patient'}
    Alluser.getOne(query, function (err, item) {
      if (err) {
        // return res.json({status: 1, msg: '操作失败!'})
        req.outputs = {status: 1, msg: err}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else if (item === null) {
        // return res.json({status: 1, msg: '不存在该患者!'})
        req.outputs = {status: 1, msg: '不存在该患者!'}
        errorHandler.makeError(2, req.outputs)(req, res, next)
      } else {
        req.item = item
        return next()
      }
    })
  }
}

// 获取任务执行情况
// 输入date，type，code；输出结果，任务执行条目不存在则新建
exports.getCompliance = function (req, res, next) {
  // 请求数据提取
  let userId = req.item.userId || null
  let date = req.body.date || null
  let type = req.body.type || null
  let code = req.body.code || null
  // 判断参数输入，无输入则提示
  if (type == null) {
    // return res.json({status: 1, msg: '请填写type!'})
    req.outputs = {status: 1, msg: '请填写type!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  if (code == null) {
    // return res.json({status: 1, msg: '请填写code!'})
    req.outputs = {status: 1, msg: '请填写code!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  if (userId == null) {
    // return res.json({status: 1, msg: '请填写userId!'})
    req.outputs = {status: 1, msg: '请填写userId!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  if (date == null) {
    // return res.json({status: 1, msg: '请填写date!'})
    req.outputs = {status: 1, msg: '请填写date!'}
    errorHandler.makeError(2, req.outputs)(req, res, next)
  }
  // return res.json({result:req.body});
  // 查询compliance表中是否存在已有对应日期的条目
  let query = {
    type: type,
    code: code,
    userId: userId,
    date: new Date(date)
  }
  // 调用任务执行情况获取函数Compliance.getOne获取一条任务执行条目
  Compliance.getOne(query, function (err, complianceItem) {
    if (err) {
      // console.log(err)
      // return res.status(500).json({status: 1, msg: '查询失败'})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }

    // 查询不到已有条目则新建一个条目，查询到存在条目则进入updateCompliance
    if (complianceItem == null) {
      let complianceData = {
        type: type,
        code: code,
        userId: userId,
        date: new Date(date)
      }
      // 新建compliance条目，调用save函数保存信息
      let newCompliance = new Compliance(complianceData)
      newCompliance.save(function (err, complianceInfo) {
        if (err) {
          // return res.status(500).json({status: 1, msg: err.errmsg})
          req.outputs = {status: 1, msg: err}
          errorHandler.makeError(2, req.outputs)(req, res, next)
        }
        next()
      })
    } else if (complianceItem != null) {
      next()
    }
  })
}

// 更新任务执行情况 输入可选，status，description；输出结果，修改任务执行情况
exports.updateCompliance = function (req, res, next) {
  let query = {
    userId: req.item.userId || null,
    type: req.body.type || null,
    code: req.body.code || null,
    date: new Date(req.body.date)
  }
  // 若存在更新状态与描述则写入
  let upObj = {}
  let status = req.body.status || null
  let description = req.body.description || null
  if (status != null) {
    upObj['status'] = Number(status)
  }
  if (description != null) {
    upObj['description'] = description
  }
  // return res.json({query: query, upObj: upObj});
  // 调用Compliance.updateOne函数更新数据
  Compliance.updateOne(query, upObj, function (err, upCompliance) {
    if (err) {
      // return res.status(422).json({status: 1, msg: err.errmsg})
      req.outputs = {status: 1, msg: err}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    if (upCompliance == null) {
      // return res.json({status: 1, msg: '修改失败！'})
      req.outputs = {status: 1, msg: '修改失败！'}
      errorHandler.makeError(2, req.outputs)(req, res, next)
    }
    // return res.json({status: 0, msg: '修改成功！'})
    req.status = 0
    req.msg = '修改成功！'
    return next()
  }, {new: true})
}
