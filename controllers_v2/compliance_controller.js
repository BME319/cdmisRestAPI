// 代码 2017-04-17 GY
// 注释 2017-07-12 YQC

// var config = require('../config')
var Compliance = require('../models/compliance')

// exports.insertOne = function(req, res) {
// var data = {
//     userId: req.body.userId,
//     type: req.body.type,
//     code: req.body.code,
//     date: req.body.date,
//     status: req.body.status,
//     description: req.body.description
//   };

// var newCompliance = new Compliance(data);
// newCompliance.save(function(err, item) {
//  if (err) {
//         return res.status(500).send(err.errmsg);
//       }
//       res.json({results: item});
//   });
// }

// 根据日期获取任务执行情况
exports.getComplianceByDay = function (req, res) {
  // 请求数据提取
  var userId = req.session.userId
  var date = req.session.date
  var type = req.session.type
  var code = req.session.code
  // 判断查询参数定义并写入
  var query = {}
  if (userId !== '' && userId !== undefined) {
    query['userId'] = userId
  }
  if (date !== '' && date !== undefined) {
    query['date'] = date
  }
  if (type !== '' && type !== undefined) {
    query['type'] = type
  }
  if (code !== '' && code !== undefined) {
    query['code'] = code
  }
  // 调用任务执行情况获取函数Compliance.getSome
  Compliance.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
  })
}

// 获取任务执行情况
exports.getCompliance = function (req, res, next) {
  // 请求数据提取
  var userId = req.session.userId
  var date = req.session.date
  var type = req.session.type
  var code = req.session.code
  // 判断参数输入，无输入则提示
  if (type == null || type === '') {
    return res.json({result: '请填写type!'})
  }
  if (code == null || code === '') {
    return res.json({result: '请填写code!'})
  }
  if (userId == null || userId === '') {
    return res.json({result: '请填写userId!'})
  }
  if (date == null || date === '') {
    return res.json({result: '请填写date!'})
  }
  // return res.json({result:req.body});
  // 查询vitalsign表中是否存在已有对应日期的条目
  var query = {
    type: type,
    code: code,
    userId: userId,
    date: new Date(date)
  }
  // 调用任务执行情况获取函数Compliance.getOne获取一条任务执行条目
  Compliance.getOne(query, function (err, complianceItem) {
    if (err) {
      console.log(err)
      return res.status(500).send('查询失败')
    }

    // 查询不到已有条目则新建一个条目
    if (complianceItem == null) {
        // return res.json({result:req.body});
        // return res.status(200).send('查询不到');
      var complianceData = {
        type: type,
        code: code,
        userId: userId,
        date: new Date(date)
      }
        // return res.json({result:complianceData});
      // 新建compliance条目，调用save函数保存信息
      var newCompliance = new Compliance(complianceData)
      newCompliance.save(function (err, complianceInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        next()
      })
    } else if (complianceItem != null) {
      next()
    }
  })
}

// 更新任务执行情况
exports.updateCompliance = function (req, res) {
  var query = {
    userId: req.session.userId,
    type: req.session.type,
    code: req.session.code,
    date: new Date(req.session.date)
  }
  // 若存在更新状态与描述则写入
  var upObj = {}
  if (req.session.status != null) {
    upObj['status'] = req.session.status
  }
  if (req.session.description != null) {
    upObj['description'] = req.session.description
  }
  // return res.json({query: query, upObj: upObj});
  // 调用Compliance.updateOne函数更新数据
  Compliance.updateOne(query, upObj, function (err, upCompliance) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upCompliance == null) {
      return res.json({result: '修改失败！'})
    }
    res.json({result: '修改成功', results: upCompliance})
  }, {new: true})
}
