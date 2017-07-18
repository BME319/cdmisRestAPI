// 代码 2017-04-17 GY
// 功能 getComplianceByDay-获取某日任务执行情况 getCompliance-updateCompliance更新任务执行情况
// 注释 2017-07-17 YQC

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

// 获取任务执行情况
// 注释 输入可选，userId，date，type，code；输出结果，相应任务执行情况
exports.getComplianceByDay = function (req, res) {
  // 请求数据提取
  let userId = req.query.userId || null
  let date = req.query.date || null
  let type = req.query.type || null
  let code = req.query.code || null
  // 判断查询参数定义并写入
  let query = {}
  if (userId !== null) {
    query['userId'] = userId
  }
  if (date !== null) {
    query['date'] = new Date(date)
  }
  if (type !== null) {
    query['type'] = type
  }
  if (code !== null) {
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
// 注释 承接session.userId，输入date，type，code；输出结果，任务执行条目不存在则新建
exports.getCompliance = function (req, res, next) {
  // 请求数据提取
  let userId = req.session.userId || null
  let date = req.body.date || null
  let type = req.body.type || null
  let code = req.body.code || null
  // 判断参数输入，无输入则提示
  if (type == null) {
    return res.json({result: '请填写type!'})
  }
  if (code == null) {
    return res.json({result: '请填写code!'})
  }
  if (userId == null) {
    return res.json({result: '请填写userId!'})
  }
  if (date == null) {
    return res.json({result: '请填写date!'})
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
      console.log(err)
      return res.status(500).send('查询失败')
    }

    // 查询不到已有条目则新建一个条目，查询到存在条目则进入updateCompliance
    if (complianceItem == null) {
        // return res.json({result:req.body});
        // return res.status(200).send('查询不到');
      let complianceData = {
        type: type,
        code: code,
        userId: userId,
        date: new Date(date)
      }
        // return res.json({result:complianceData});
      // 新建compliance条目，调用save函数保存信息
      let newCompliance = new Compliance(complianceData)
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

// 更新任务执行情况 输入可选，status，description；输出结果，修改任务执行情况
exports.updateCompliance = function (req, res) {
  let query = {
    userId: req.session.userId || null,
    type: req.body.type || null,
    code: req.body.code || null,
    date: new Date(req.body.date)
  }
  // 若存在更新状态与描述则写入
  let upObj = {}
  let status = req.body.status || null
  let description = req.body.description || null
  if (status != null) {
    upObj['status'] = status
  }
  if (description != null) {
    upObj['description'] = description
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
