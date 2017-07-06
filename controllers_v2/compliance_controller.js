
var config = require('../config')
var Compliance = require('../models/compliance')

// exports.insertOne = function(req, res) {
// 	var data = {
//     userId: req.body.userId,
//     type: req.body.type,
//     code: req.body.code,
//     date: req.body.date,
//     status: req.body.status,
//     description: req.body.description
//   };

// 	var newCompliance = new Compliance(data);
// 	newCompliance.save(function(err, item) {
// 		if (err) {
//       		return res.status(500).send(err.errmsg);
//     	}
//     	res.json({results: item});
// 	});
// }

exports.getComplianceByDay = function (req, res) {
  userId = req.query.userId
  date = req.query.date
  type = req.query.type
  code = req.query.code

  query = {}
  if (userId != '' && userId != undefined) {
    query['userId'] = userId
  }
  if (date != '' && date != undefined) {
    query['date'] = date
  }
  if (type != '' && type != undefined) {
    query['type'] = type
  }
  if (code != '' && code != undefined) {
    query['code'] = code
  }
  Compliance.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
  })
}

// 写入任务执行情况 2017-04-17 GY
exports.getCompliance = function (req, res, next) {
  if (req.body.type == null || req.body.type == '') {
    return res.json({result: '请填写type!'})
  }
  if (req.body.code == null || req.body.code == '') {
    return res.json({result: '请填写code!'})
  }
  if (req.body.userId == null || req.body.userId == '') {
    return res.json({result: '请填写userId!'})
  }
  if (req.body.date == null || req.body.date == '') {
    return res.json({result: '请填写date!'})
  }
  // return res.json({result:req.body});
  // 查询vitalsign表中是否存在已有对应日期的条目
  var query = {
    type: req.body.type,
    code: req.body.code,
    userId: req.body.userId,
    date: new Date(req.body.date)
  }
  Compliance.getOne(query, function (err, complianceitem) {
    if (err) {
      console.log(err)
      return res.status(500).send('查询失败')
    }

      // 查询不到，需要新建一个条目
    if (complianceitem == null) {
        // return res.json({result:req.body});
        // return res.status(200).send('查询不到');
      var complianceData = {
        type: req.body.type,
        code: req.body.code,
        userId: req.body.userId,
        date: new Date(req.body.date)
      }
        // return res.json({result:complianceData});
      var newCompliance = new Compliance(complianceData)
      newCompliance.save(function (err, complianceInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        next()
      })
    }
      // 查询到条目，添加data
    else if (complianceitem != null) {
      next()
    }
  })
}

// 写入任务执行情况 2017-04-17 GY
exports.updateCompliance = function (req, res) {
  var query = {
    userId: req.body.userId,
    type: req.body.type,
    code: req.body.code,
    date: new Date(req.body.date)
  }

  var upObj = {}
  if (req.body.status != null) {
    upObj['status'] = req.body.status
  }
  if (req.body.description != null) {
    upObj['description'] = req.body.description
  }
  // return res.json({query: query, upObj: upObj});
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
