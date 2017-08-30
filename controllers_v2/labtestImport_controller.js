// var config = require('../config')
var webEntry = require('../settings').webEntry
var Alluser = require('../models/alluser')
var HealthInfo = require('../models/healthInfo')
var LabtestImport = require('../models/labtestImport')
// var commonFunc = require('../middlewares/commonFunc')

// 根据录入状态获取患者信息列表, 2017-07-05 GY
exports.listByStatus = function (req, res) {
  let labtestImportStatus
  let fields = {}
  if (req.query.labtestImportStatus === null || req.query.labtestImportStatus === '' || req.query.labtestImportStatus === undefined) {
    return res.status(412).json({results: '请填写labtestImportStatus'})
  } else if (Number(req.query.labtestImportStatus) === 1) {
    labtestImportStatus = 1
    // 已录入的返回字段
    fields = {
      'userId': 1,
      'name': 1,
      'latestImportUserId': 1,
      'latestImportDate': 1,
      'latestUploadTime': 1,
      'labtestImportStatus': 1,
      'role': 1
    }
  } else if (Number(req.query.labtestImportStatus) === 0) {
    labtestImportStatus = 0
    // 未录入的返回字段
    fields = {
      'userId': 1, 'name': 1, 'picUploadTime': 1, 'labtestImportStatus': 1, 'role': 1
    }
  } else {
    return res.status(412).json({results: '非法输入'})
  }

  let limit
  let skip

  if (req.query.limit === undefined) {
    limit = 0
  } else {
    limit = Number(req.query.limit)
  }
  if (req.query.skip === undefined) {
    skip = 0
  } else {
    skip = Number(req.query.skip)
  }

  var opts = {limit: limit, skip: skip}
  var query = {
    labtestImportStatus: labtestImportStatus,
    role: 'patient'
  }
  var populate = {path: 'latestImportUserId', select: {userId: 1, name: 1}}

  // 以下为测试
  // var query = {
  //   $or: [
  //     {labtestImportStatus: labtestImportStatus},
  //     {labtestImportStatus: null}
  //   ]
  //   ,
  //   role: 'patient'
  // };

  if (req.query.name !== null && req.query.name !== '' && req.query.name !== undefined) {
    query['name'] = new RegExp(req.query.name)
  }

  var _Url = ''
  var labtestImportStatusUrl = 'labtestImportStatus=' + req.query.labtestImportStatus
  var limitUrl = ''
  var skipUrl = ''

  if (limit !== 0 || skip !== 0) {
    limitUrl = 'limit=' + String(limit)
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (labtestImportStatusUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (labtestImportStatusUrl !== '') {
      _Url = _Url + labtestImportStatusUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  let nexturl = webEntry.domain + '/api/v2/review/reviewInfo' + _Url

  Alluser.getSome(query, function (err, patients) {
    if (err) {
      return res.status(500).send(err)
    } else if (patients.length === 0) {
      return res.json({results: []})
    } else {
      return res.json({results: patients, nexturl: nexturl})
    }
  }, opts, fields, populate)
}

// 根据患者Id获取所有未录入化验信息图片 2017-07-06 GY
exports.photoList = function (req, res) {
  if (req.query.patientId === null || req.query.patientId === '' || req.query.patientId === undefined) {
    return res.status(412).json({results: '请填写patientId'})
  } else {
    var patientId = req.query.patientId
  }

  var query = {
    userId: patientId,
    importStatus: 0,
    type: 'Health_002'
  }
  // 以下为测试
  // var query = {
  //   importStatus: null,
  //   userId: patientId,
  //   type: 'Health_002'
  // };

  var opts = ''
  var fields = {
    'url': 1, 'description': 1, 'time': 1, 'insertTime': 1
  }

  HealthInfo.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    }
    if (items.length === 0) {
      return res.json({results: []})
    } else {
      // return res.json({results: items});
      var urls = []
      var k = 0
      for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items[i].url.length; j++) {
          if (items[i].url[j].status === 0) {
            urls[k] = items[i].url[j]
            k++
          }
        }
      }
      return res.json({results: urls})
    }
  }, opts, fields)
}

// 保存录入信息 2017-07-07 GY
exports.saveLabtest = function (req, res) {
  if (req.body.patientId === null || req.body.patientId === '' || req.body.patientId === undefined) {
    return res.status(412).json({results: '请填写patientId'})
  }
  if (req.body.photoId === null || req.body.photoId === '' || req.body.photoId === undefined) {
    return res.status(412).json({results: '请输入photoId'})
  }
  if (req.body.time === null || req.body.time === '' || req.body.time === undefined) {
    return res.status(412).json({results: '请输入化验时间time'})
  }
  if (req.body.insertTime === null || req.body.insertTime === '' || req.body.insertTime === undefined) {
    return res.status(412).json({results: '请输入图片上传时间insertTime'})
  }
  console.log(req.session)
  if (req.session.role.indexOf('health') === -1) {
    return res.status(401).json({results: '没有权限'})
  }
  var labtestData = {
    labtestId: req.newId,
    userId: req.body.patientId,
    photoId: req.body.photoId,
    time: new Date(req.body.time),
    importTime: new Date(),
    // importer: req.body.importer
    importer: req.session._id
  }
  if (req.body.type !== null && req.body.type !== '' && req.body.type !== undefined) {
    labtestData['type'] = req.body.type
  }
  if (req.body.value !== null && req.body.value !== '' && req.body.value !== undefined) {
    labtestData['value'] = req.body.value
  }
  if (req.body.unit !== null && req.body.unit !== '' && req.body.unit !== undefined) {
    labtestData['unit'] = req.body.unit
  }

  var newLabtest = new LabtestImport(labtestData)
  newLabtest.save(function (err, labtestInfo) {
    if (err) {
      if (err.name === 'ValidationError') {
        return res.status(412).send(err)
      } else {
        return res.status(500).send(err)
      }
    } else {
      return res.json({result: '录入成功', newResults: labtestInfo})
      // req.labtestInfo = labtestInfo
      // next();
    }
  })
}

// 修改录入的化验结果 2017-07-07 GY
exports.editLabtest = function (req, res) {
  if (req.body.labtestId === null || req.body.labtestId === '' || req.body.labtestId === undefined) {
    return res.status(412).json({results: '请填写labtestId'})
  }
  var query = {labtestId: req.body.labtestId}
  var upObj = {
    importer: req.session._id,
    importTime: new Date()
  }
  // 以下是测试
  // var upObj = {
  //   importer: req.body.importer,
  //   importTime: new Date()
  // }
  if (req.body.type !== null && req.body.type !== '' && req.body.type !== undefined) {
    upObj['type'] = req.body.type
  }
  if (req.body.value !== null && req.body.value !== '' && req.body.value !== undefined) {
    upObj['value'] = req.body.value
  }
  if (req.body.unit !== null && req.body.unit !== '' && req.body.unit !== undefined) {
    upObj['unit'] = req.body.unit
  }
  if (req.body.time !== null && req.body.time !== '' && req.body.time !== undefined) {
    upObj['time'] = new Date(req.body.time)
  }
  var opts = {new: true, runValidators: true}
  LabtestImport.updateOne(query, upObj, function (err, upres) {
    if (err) {
      if (err.name === 'ValidationError') {
        return res.status(412).send(err)
      } else {
        return res.status(500).send(err)
      }
    } else if (upres === null) {
      return res.status(404).json({results: '修改失败，不存在的记录'})
    } else {
      return res.json({results: '修改成功', upresults: upres})
    }
  }, opts)
}

// 根据患者ID获取化验信息 2017-07-07 GY
exports.getLabtest = function (req, res) {
  if (req.query.patientId === null || req.query.patientId === '' || req.query.patientId === undefined) {
    return res.status(412).json({results: '请填写patientId'})
  }
  var query = {userId: req.query.patientId}
  if (req.query.type !== null && req.query.type !== '' && req.query.type !== undefined) {
    query['type'] = req.query.type
  }
  if (req.query.time !== null && req.query.time !== '' && req.query.time !== undefined) {
    query['time'] = new Date(req.query.time)
  }
  var opts = {}
  console.log(req.query.sort)
  if (req.query.sort !== null && req.query.sort !== '' && req.query.sort !== undefined) {
    if (req.query.sort === '-time') {
      opts['sort'] = '-time'
    } else if (req.query.sort === 'time') {
      opts['sort'] = 'time'
    } else {
      return res.status(412).json({results: 'sort字段输入不合法'})
    }
  }
  var fields = {'photoId': 0}
  var populate = {
    path: 'importer',
    select: {
      'userId': 1, 'name': 1
    }
  }
  LabtestImport.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      return res.json({results: items})
    }
  }, opts, fields, populate)
}

// 根据化验信息获取对应图片 2017-07-07 GY
exports.photoByLabtest = function (req, res) {
  if (req.query.labtestId === null || req.query.labtestId === '' || req.query.labtestId === undefined) {
    return res.status(412).json({results: '请填写patientId'})
  }
  var querylabtest = {labtestId: req.query.labtestId}
  LabtestImport.getOne(querylabtest, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.status(404).json({results: '找不到这条记录'})
    } else if (item.photoId === undefined) {
      return res.status(404).json({results: '没有对应图片'})
    } else {
      var queryphoto = {'url.photoId': item.photoId}
      HealthInfo.getOne(queryphoto, function (err, photoitem) {
        if (err) {
          return res.status(500).send(err)
        } else if (photoitem === null) {
          return res.status(404).json({results: '找不到对应的图片'})
        } else {
          for (let i = 0; i < photoitem.url.length; i++) {
            if (photoitem.url[i].photoId === item.photoId) {
              var returnphoto = photoitem.url[i]
              break
            }
          }
          return res.json({results: returnphoto})
        }
      })
    }
  })
}

// 标识图片已录入 2017-07-07 GY
exports.pullurl = function (req, res, next) {
  let photoId = req.body.photoId || null
  if (photoId === null) {
    return res.status(412).json({results: '请填写photoId'})
  }
  var query = {'url.photoId': photoId}
  HealthInfo.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.status(404).json({results: '找不到对象'})
    } else {
      req.healthinfo_id = item._id
      for (let i = 0; i < item.url.length; i++) {
        if (item.url[i].photoId === photoId) {
          req.photoObj = item.url[i]
          break
        }
      }
      var upObj = {
        $pull: {
          url: {
            photoId: req.body.photoId
          }
        }
      }
      HealthInfo.update(query, upObj, function (err, upres) {
        if (err) {
          return res.status(500).send(err)
        } else if (upres.nModified === 1) {
          next()
        } else {
          return res.status(500).json({results: '删除数组元素失败', upresults: upres})
        }
      })
    }
  })
}
exports.pushurl = function (req, res, next) {
  req.photoObj.status = 1
  let photoType = req.body.photoType || null
  if (photoType !== null) {
    req.photoObj.photoType = photoType
  }
  var query = {_id: req.healthinfo_id}
  var upObj2 = {
    $push: {
      url: req.photoObj
    }
  }
  HealthInfo.update(query, upObj2, function (err, upres2) {
    if (err) {
      return res.status(500).send(err)
    } else if (upres2.nModified === 1) {
      // return res.json({results: '图片录入状态修改成功'})
      next()
    } else {
      return res.status(500).json({results: '增加数组元素失败', upresults: upres2})
    }
  })
}
exports.checkImportStatus = function (req, res, next) {
  var query = {_id: req.healthinfo_id}
  HealthInfo.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.status(500).json({err: 'healthinfoItem == null'})
    } else {
      var count = 0
      for (let i = 0; i < item.url.length; i++) {
        count++
        if (item.url[i].status === 0) {
          break
        }
      }
      if (count === item.url.length) {
        var upImportStatus = {importStatus: 1}
        var opts = {new: true}
        HealthInfo.updateOne(query, upImportStatus, opts, function (err, upres) {
          if (err) {
            return res.status(500).send(err)
          } else {
            // return res.json({results: '图片录入状态修改成功'})
            req.healthinfo = upres
            next()
          }
        })
      } else {
        return res.json({results: '图片录入状态修改成功'})
      }
    }
  })
}
// 检测对应user的未录入信息，如果为空则更新alluser表相关字段 2017-07-07 GY
exports.updateUserLatest = function (req, res) {
  var query = {
    userId: req.healthinfo.userId,
    importStatus: 0,
    type: 'Health_002'
  }

  HealthInfo.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else if (items.length === 0) {
      var querylabtest = {userId: req.healthinfo.userId}
      var opts1 = {sort: '-_id'}
      LabtestImport.getOne(querylabtest, function (err, labtestItem) {
        if (err) {
          return res.status(500).send(err)
        } else if (labtestItem === null) {
          return res.status(500).json({results: 'labtestItem == null'})
        } else {
          var queryuser = {userId: labtestItem.userId}
          var upObj = {
            labtestImportStatus: 1,
            latestImportUserId: labtestItem.importer,
            latestImportDate: labtestItem.importTime,
            latestUploadTime: req.healthinfo.insertTime
          }
          // console.log(upObj)
          var opts2 = {new: true, runValidators: true}
          Alluser.updateOne(queryuser, upObj, function (err, upres) {
            if (err) {
              return res.status(500).send(err)
            } else if (upres === null) {
              return res.status(500).json({results: 'upres == null'})
            } else {
              return res.json({results: '图片录入状态修改成功'})
            }
          }, opts2)
        }
      }, opts1)
    } else {
      return res.json({results: '图片录入状态修改成功'})
    }
  })
}

// 根据录入状态获取当前总人数 2017-07-15 GY
exports.countByStatus = function (req, res) {
  let status = req.query.labtestImportStatus || null
  let query = {}
  if (status === null) {
    return res.status(412).json({results: '请填写labtestImportStatus'})
  } else if (Number(status) === 1) {
    query = {
      labtestImportStatus: 1,
      role: 'patient'
    }
  } else if (Number(status) === 0) {
    query = {labtestImportStatus: 0, role: 'patient'}
  } else {
    return res.status(412).json({results: '非法输入'})
  }
  Alluser.countSome(query, function (err, count) {
    if (err) {
      return res.status(500).send(err)
    }
    return res.json({results: count})
  })
}
