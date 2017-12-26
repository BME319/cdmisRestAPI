
var Version = require('../models/version')

// 获取版本信息
exports.getVersionInfo = function (req, res) {
  var versionName = req.query.versionName
  var versionType = req.query.versionType || null
  var query
  // 若versionType为空，返回无效输入错误信息
  if (versionType === null || versionType === '') {
    return res.status(400).send('invalid input')
  }
  
  // 若versionName为空，从version表中获取versionName
  if (versionName === null || versionName === '') {
    query = {versionType: versionType}
    Version.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      res.json({results: {status: 0, msg: items}})
    })
  } else {
    // 返回最新的versionName
    var opts = { sort: '-_id' }
    query = {versionType: versionType}
    Version.getSome(query, function (err, items) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (items.length === 0) {
        return res.status(400).send('版本号不存在')
      } else {
        if (items[0].versionName === versionName) {
          // 返回当前为最新的信息
          res.json({results: {status: 0, msg: 'latest'}})
        } else {
          res.json({results: {status: 0, msg: [items[0]]}})
        }
      }
    }, opts)
  }
}

// 插入版本信息
exports.insertVersionInfo = function (req, res) {
  var versionId = req.newId
  var versionType = req.body.versionType
  var versionName = req.body.versionName || null
  var time = new Date()
  var content = req.body.content || null

  // 若输入为空，返回无效输入错误信息
  if (versionName === null || versionName === '' || content === null || content === '' || versionType === null || versionType === '') {
    return res.status(400).send('invalid input')
  }

  var versionData = {
    versionId: versionId,
    versionType: versionType,
    versionName: versionName,
    time: time,
    content: content
  }
  var newVersion = new Version(versionData)
  // 版本信息存入version表
  newVersion.save(function (err, Info) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: Info})
  })
}
