// 代码 2017-04-06 GY
// 注释 2017-07-13 YQC
// 函数功能 查询体征记录，新建体征记录

var config = require('../config')
// var xml2js = require('xml2js')
var VitalSign = require('../models/vitalSign')
var request = require('request')
var Alluser = require('../models/alluser')

// 获取患者对象
exports.getPatientObject = function (req, res, next) {
  let patientId = req.body.patientId || req.query.patientId || null
  if (patientId === null) {
    return res.status(412).json({results: '请填写patientId'})
  }
  let query = {userId: patientId, role: 'patient'}
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      return res.status(500).send(err)
    } else if (patient === null) {
      return res.status(404).json({results: '找不到患者'})
    } else {
      req.body.patientObject = patient
      next()
    }
  })
}

// 根据userId和type查询体征记录
// 注释 输入，type，承接patientObject；输出相应患者的相应体征类型的记录
exports.getVitalSigns = function (req, res) {
  if (req.query.type == null || req.query.type === '' || req.query.type === undefined) {
    return res.json({result: '请填写type!'})
  }
  // 设置查询条件
  let query = {
    patientId: req.body.patientObject._id,
    type: req.query.type
  }
  let opts = ''
  let fields = {'_id': 0, 'revisionInfo': 0}
  let populate = {path: 'patientId', select: {'_id': 0, 'userId': 1}}
  // 调用体征查询函数VitalSign.getSome输出体征记录内容
  VitalSign.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      res.json({results: items})
    }
  }, opts, fields, populate)
}

// 获取对象 2017-07-22 YQC
// 获取用户对象
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    } else if (user === null) {
      return res.status(404).json({results: '找不到用户'})
    } else if (req.session.role === 'patient') {
      req.body.patientObject = user
      next()
    } else if (req.session.role === 'doctor') {
      req.body.doctorObject = user
      next()
    } else {
      return res.status(400).json({results: '登录角色不是医生或患者'})
    }
  })
}

// 新建体征记录
// 注释 根据患者的类型，编码，单位和日期查询体征记录，判断该记录是否存在，不存在则新建体征记录
// 输入，type，code，unit，date；输出，（查询不到相应记录则新建对应体征记录）进入数据插入函数
exports.getVitalSign = function (req, res, next) {
  if (req.body.type === null || req.body.type === '' || req.body.type === undefined) {
    return res.json({result: '请填写type!'})
  }
  if (req.body.code === null || req.body.code === '' || req.body.code === undefined) {
    return res.json({result: '请填写code!'})
  }
  if (req.body.unit === null || req.body.unit === '' || req.body.unit === undefined) {
    return res.json({result: '请填写unit!'})
  }
  if (req.body.date === null || req.body.date === '' || req.body.date === undefined) {
    return res.json({result: '请填写date!'})
  }
  // return res.json({result:req.body});
  // 查询vitalsign表中是否存在已有对应日期的条目
  var queryVital = {
    patientId: req.body.patientObject._id,
    type: req.body.type,
    code: req.body.code,
    unit: req.body.unit,
    date: new Date(req.body.date)
  }
  VitalSign.getOne(queryVital, function (err, vitalSignItem) {
    if (err) {
      return res.status(500).send('查询失败')
    } else if (vitalSignItem === null) { // 查询不到，需要新建一个条目
      // return res.json({result:req.body});
      // return res.status(200).send('查询不到');
      var vitalSignData = {
        patientId: req.body.patientObject._id,
        type: req.body.type,
        code: req.body.code,
        unit: req.body.unit,
        date: new Date(req.body.date)
      }
      // return res.json({result:vitalSignData});
      var newVitalSign = new VitalSign(vitalSignData)
      newVitalSign.save(function (err, vitalSignInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          next()
        }
      })
    } else if (vitalSignItem !== null) { // 查询到条目，添加data
      next()
    }
  })
}
// 注释 根据患者提供的数据采集时间和数据数值更新相应体征记录的数值
// 输入，datatime，datavalue，datavalue2（用于血压）；输出体征数据更新
// 修改 插入数据时判断同一时刻的体征数据是否存在，存在则更新数据，不存在则新建数据 YQC 2017-07-24
exports.insertData = function (req, res) {
  if (req.body.datatime === null || req.body.datatime === '' || req.body.datatime === undefined) {
    return res.json({result: '请填写datatime!'})
  }
  if (req.body.datavalue === null || req.body.datavalue === '' || req.body.datavalue === undefined) {
    return res.json({result: '请填写datavalue!'})
  }
  let querySet = {
    patientId: req.body.patientObject._id,
    type: req.body.type,
    code: req.body.code,
    date: new Date(req.body.date),
    data: {$elemMatch: {time: new Date(req.body.datatime)}}
  }
  let setObj = {
    $set: {
      'data.$.value': req.body.datavalue,
      'data.$.value2': req.body.datavalue2 || ''
    }
  }

  // return res.json({query: query, upObj: upObj});
  VitalSign.update(querySet, setObj, function (err, update) {
    if (err) {
      return res.status(422).send(err.message)
    } else if (update.n === 0) {
      let queryPush = {
        patientId: req.body.patientObject._id,
        type: req.body.type,
        code: req.body.code,
        date: new Date(req.body.date)
      }
      let pushObj = {
        $push: {
          data: {
            time: new Date(req.body.datatime),
            value: req.body.datavalue
          }
        }
      }
      // datavalue2用于存储血压值
      if (req.body.datavalue2 !== null && req.body.datavalue2 !== '' && req.body.datavalue2 !== undefined) {
        pushObj['$push']['data']['value2'] = req.body.datavalue2
      }
      VitalSign.update(queryPush, pushObj, function (err, push) {
        if (err) {
          return res.status(422).send(err.message)
        } else if (push.nModified === 0) {
          return res.json({result: '未成功修改！请检查输入是否符合要求！', results: push})
        } else if (push.nModified === 1) {
          return res.json({result: '新建或修改成功', results: push})
        }
      }, {new: true})
    } else if (update.nModified === 0) {
      return res.json({result: '未成功修改！请检查输入是否符合要求！', results: update})
    } else if (update.nModified === 1) {
      return res.json({result: '新建或修改成功', results: update})
    }
  })
}

// 注释 第三方获取血压数据
exports.receiveBloodPressure = function (req, res) {
  var jsondata = req.body
  request({
    method: 'POST',
    url: config.third_party_data.bloodpressure.get_bp_data_url,
    body: jsondata,
    json: true
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: body})
  })
}
