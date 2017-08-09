
// var  config = require('../config')
var Alluser = require('../models/alluser')
var HealthInfo = require('../models/healthInfo')

// 获得患者所有的健康信息 修改为医生端和患者端共用 2017-08-09 lgf
exports.getAllHealthInfo = function (req, res) {
  // var _userId = req.query.userId
  var _userId = req.session.userId
  var _role = req.session.role
  var patientId = req.query.patientId || null
  var query = {}
  if (_role === 'patient') {
    query['userId'] = _userId
  } else {
    if (patientId === null) {
      return res.json({result: '请填写patientId!'})
    } else {
      query['userId'] = patientId
    }
  }
  // var opts = {sort:-"time"};
  var opts = {'sort': {'time': -1, 'revisionInfo.operationTime': -1}}
  var fields = {'_id': 0, 'revisionInfo': 0}
  // var fields = {'_id':0};
  var populate = {'path': 'resultId'}

  HealthInfo.getSome(query, function (err, healthInfolist) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: healthInfolist})
  }, opts, fields, populate)
}

// 获得患者某条健康信息详情 修改为医生端和患者端共用 2017-08-09 lgf
exports.getHealthDetail = function (req, res) {
  var _userId = req.session.userId
  var _role = req.session.role
  var patientId = req.query.patientId || null
  var insertTime = req.query.insertTime || null
  var query = {}
  if (insertTime === null) {
    return res.json({result: '请填写insertTime!'})
  } else {
    let _insertTime = new Date(req.query.insertTime)       // session不包含insertTime
    query['insertTime'] = _insertTime
  }
  if (_role === 'patient') {
    query['userId'] = _userId
  } else {
    if (patientId === null) {
      return res.json({result: '请填写patientId!'})
    } else {
      query['userId'] = patientId
    }
  }
  var opts = ''
  var fields = {'_id': 0, 'revisionInfo': 0}
  var populate = {'path': 'resultId'}

  HealthInfo.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// exports.insertHealthInfo = function(req, res) {
//   var healthInfoData = {
//     userId: req.query.userId,
//     type: req.query.type,
//     insertTime: new Date(),
//     time: new Date(req.query.time),
//     url: req.query.url,
//     label: req.query.label,
//     description: req.query.description,
//     comments: req.query.comments,
//     revisionInfo:{
//       operationTime:new Date(),
//       userId:"a123",
//       userName:"chi",
//       terminalIP:"1234"
//     }
//   };

//   var newHealthInfo = new HealthInfo(healthInfoData);
//   newHealthInfo.save(function(err, healthInfoInfo) {
//     if (err) {
//       return res.status(500).send(err.errmsg);
//     }
//     res.json({results: healthInfoInfo});
//   });
// }

// 重写插入方法 2017-07-07 GY
exports.insertHealthInfo = function (req, res) {
  var healthInfoData = {
    // userId: req.body.userId,
    userId: req.session.userId,
    type: req.body.type,
    insertTime: new Date(),
    time: new Date(req.body.time),
    label: req.body.label
  }
  // 自动生成图片ID
  let urlObj = [
    {
      photo: '',
      photoId: ''
    }
  ]
  function add0 (m) {
    return m < 10 ? '0' + m : m
  }
  let y = healthInfoData.insertTime.getFullYear()
  let m = healthInfoData.insertTime.getMonth() + 1
  let d = healthInfoData.insertTime.getDate()
  let h = healthInfoData.insertTime.getHours()
  let mm = healthInfoData.insertTime.getMinutes()
  let s = healthInfoData.insertTime.getSeconds()
  let insertTimestr = y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s)

  if (req.body.url !== null && req.body.url !== '' && req.body.url !== undefined) {
    if (req.body.url.constructor === Array) {
      if (req.body.url.length > 10) {
        return res.status(412).json({results: '最多一次上传10张图片'})
      }
      for (let i = 0; i < req.body.url.length; i++) {
        // console.log(req.body.url[i].photo)
        urlObj[i].photo = req.body.url[i].photo
        // console.log(urlObj[i].photo)
        urlObj[i].photoId = healthInfoData.userId + insertTimestr + add0(i)
      }
      healthInfoData['url'] = urlObj
      console.log(healthInfoData)
    } else {
      return res.status(412).json({results: 'url需要是数组'})
    }
  }
  if (req.body.description !== null && req.body.description !== '' && req.body.description !== undefined) {
    healthInfoData['description'] = req.body.description
  }
  if (req.body.comments !== null && req.body.comments !== '' && req.body.comments !== undefined) {
    healthInfoData['comments'] = req.body.comments
  }

  var newHealthInfo = new HealthInfo(healthInfoData)
  newHealthInfo.save(function (err, healthInfo) {
    if (err) {
      return res.status(500).send(err)
    }
    // 如果是化验的健康信息，需要查找Alluser表并根据结果更新
    // 如果Alluser表中labtestImportStatus字段为1或null则更新为0并更新earliestUploadTime
    if (healthInfo.type === 'Health_002' && healthInfo.url.length !== 0) {
      var queryuser = {userId: healthInfo.userId, role: req.session.role}
      Alluser.getOne(queryuser, function (err, userItem) {
        if (err) {
          return res.status(500).send(err)
        } else if (userItem === null) {
          return res.status(404).json({results: '找不到对象'})
        } else if (userItem.labtestImportStatus === 0) {
          return res.json({results: healthInfo})
        } else if (userItem.labtestImportStatus === 1 || userItem.labtestImportStatus === null) {
          var upObj = {
            labtestImportStatus: 0,
            earliestUploadTime: healthInfo.insertTime
          }
          Alluser.updateOne(queryuser, upObj, function (err, upuser) {
            if (err) {
              return res.status(500).send(err)
            } else if (upuser === null) {
              return res.status(404).json({results: '找不到对象'})
            } else {
              return res.json({results: healthInfo})
            }
          })
        }
      })
    } else {
      //  如果不是化验的健康信息，直接返回
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      res.json({results: healthInfo})
    }
  })
}

// 重写修改方法 2017-07-07 GY
exports.modifyHealthDetail = function (req, res) {
  // var query = {userId: req.body.userId, insertTime: new Date(req.body.insertTime)}
  var query = {userId: req.session.userId, insertTime: new Date(req.body.insertTime)}
  var upObj = {}
  let urlObj = [
    {
      photo: '',
      photoId: ''
    }
  ]
  let insertTime = new Date(req.body.insertTime)
  function add0 (m) {
    return m < 10 ? '0' + m : m
  }
  let y = insertTime.getFullYear()
  let m = insertTime.getMonth() + 1
  let d = insertTime.getDate()
  let h = insertTime.getHours()
  let mm = insertTime.getMinutes()
  let s = insertTime.getSeconds()
  let insertTimestr = y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s)

  if (req.body.url !== null && req.body.url !== '' && req.body.url !== undefined) {
    if (req.body.url.constructor === Array) {
      // healthInfoData['url'] = req.body.url
      if (req.body.url.length > 10) {
        return res.status(412).json({results: '最多一次上传10张图片'})
      }
      for (let i = 0; i < req.body.url.length; i++) {
        urlObj[i].photo = req.body.url[i].photo
        urlObj[i].photoId = req.session.userId + insertTimestr + add0(i)  // 需要确认是谁进行健康信息的修改
      }
      upObj['url'] = urlObj
    } else {
      return res.status(412).json({results: 'url需要是数组'})
    }
  }
  if (req.body.type !== null && req.body.type !== '' && req.body.type !== undefined) {
    upObj['type'] = req.body.type
  }
  if (req.body.label !== null && req.body.label !== '' && req.body.label !== undefined) {
    upObj['label'] = req.body.label
  }
  if (req.body.time !== null && req.body.time !== '' && req.body.time !== undefined) {
    upObj['time'] = new Date(req.body.time)
  }
  if (req.body.description !== null && req.body.description !== '' && req.body.description !== undefined) {
    upObj['description'] = req.body.description
  }
  if (req.body.comments !== null && req.body.comments !== '' && req.body.comments !== undefined) {
    upObj['comments'] = req.body.comments
  }
  var opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}

  HealthInfo.updateOne(query, { $set: upObj }, opts, function (err, item1) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: 0, data: item1})
  })
}

// exports.modifyHealthDetail = function(req, res) {
//   var healthInfoData = {
//     userId: req.query.userId,
//     type: req.query.type,
//     time: new Date(req.query.time),
//     url: req.query.url,
//     label: req.query.label,
//     description: req.query.description,
//     comments: req.query.comments,
//     revisionInfo:{
//       operationTime:new Date(),
//       userId:"a123",
//       userName:"chi",
//       terminalIP:"1234"
//     }
//   };

//   var query = {userId:req.query.userId,insertTime:new Date(req.query.insertTime)};
//   var ops = {upsert:true}

//   HealthInfo.updateOne(query,{ $set: healthInfoData },ops,function(err, item1){
//     if (err) {
//       return res.status(500).send(err.errmsg);
//     }
//     res.json({results: 0,data:item1});
//   });
// }

// 删除患者某条健康信息 修改为医生端和患者端共用 2017-08-09 lgf
exports.deleteHealthDetail = function (req, res) {
  // var query = {userId: req.query.userId, insertTime: new Date(req.query.insertTime)}
  var _userId = req.session.userId
  var _role = req.session.role
  var patientId = req.body.patientId || null
  var insertTime = req.body.insertTime || null
  var query = {}
  if (insertTime === null) {
    return res.json({result: '请填写insertTime!'})
  } else {
    let _insertTime = new Date(insertTime)
    query['insertTime'] = _insertTime
  }
  if (_role === 'patient') {
    query['userId'] = _userId
  } else {
    if (patientId === null) {
      return res.json({result: '请填写patientId!'})
    } else {
      query['userId'] = patientId
    }
  }
  HealthInfo.removeOne(query, function (err, item1) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log('delete')
    res.json({results: 'success'})
  })
}
