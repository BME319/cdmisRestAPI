// 代码 2017-03-29 GY
// 修改 患者详情，只输出最新的诊断内容 2017-05-14 GY
// 注释 2017-07-17 YQC

// var config = require('../config')
var webEntry = require('../settings').webEntry
var Alluser = require('../models/alluser')
// var Patient = require('../models/patient')
// var Doctor = require('../models/doctor')
var DpRelation = require('../models/dpRelation')
// var User = require('../models/user')
var commonFunc = require('../middlewares/commonFunc')
var Counsel = require('../models/counsel')
var VitalSign = require('../models/vitalSign')

// 患者查询自身详细信息
// 注释 承接session.userId；输出患者信息，最新体重和最新诊断
exports.getPatientDetail = function (req, res) {
  let userId = req.session.userId || null
  if (userId == null) {
    return res.json({result: '请填写userId!'})
  }
  // 查询参数
  let query = {userId: userId, role: 'patient'}
  let fields = {'revisionInfo': 0, 'doctors': 0}
  let populate = {path: 'diagnosisInfo.doctor', select: {'_id': 0, 'userId': 1, 'name': 1, 'workUnit': 1, 'department': 1}}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({results: item})
    } else if (item.name === undefined) {
      return res.json({results: '没有填写个人信息'})
    } else {
      // 输出最新的诊断内容
      let recentDiagnosis = []
      if (item.diagnosisInfo.length !== 0) {
        recentDiagnosis[0] = item.diagnosisInfo[item.diagnosisInfo.length - 1]
      }
      // 禁止输出item.diagnosisInfo
      // item.diagnosisInfo = [];
      // return res.json({results: item, recentDiagnosis:recentDiagnosis});

  // 取体征表中最近体重值
      let queryWeight = {patientId: item._id, type: 'Weight'}
      let optsWeight = {sort: '-_id'}
      VitalSign.getSome(queryWeight, function (err, vitalitems) {
        if (err) {
          return res.status(500).send(err)
        }
        let patientWeight
        if (vitalitems.length === 0) {
          patientWeight = 0
        } else {
          patientWeight = vitalitems[0].data[vitalitems[0].data.length - 1].value
        }
        return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis})
      }, optsWeight)
    }
      // res.json({results: item});
  }, '', fields, populate)
}

// 根据医院和医生姓名（选填）获取医生信息
// 注释 输入医生name，province，city，district，workUnit；输出，医生信息列表
exports.getDoctorLists = function (req, res) {
  // 查询条件
  let _province = req.query.province || null
  let _city = req.query.city || null
  let _district = req.query.district || null

  let _workUnit = req.query.workUnit || null
  let _name = req.query.name || null

  let _limit = Number(req.query.limit)
  let _skip = Number(req.query.skip)

  // var query;
  // //name选填
  // if ((_name == null || _name == '') && (_workUnit == null || _workUnit == '')){
  //   query = {};
  // }
  // else if((_name == null || _name == '') && _workUnit != null){
  //   query = {workUnit:_workUnit};
  // }
  // else if (_name != null && (_workUnit == null || _workUnit == '')){
  //   query = {name:_name};
  // }
  // else{
  //   query = {workUnit:_workUnit, name:_name};
  // }

  let query = {role: 'doctor'}
  if (_province != null) {
    query['province'] = _province
  }
  if (_city != null) {
    query['city'] = _city
  }
  if (_district != null) {
    query['district'] = _district
  }
  if (_workUnit != null) {
    query['workUnit'] = _workUnit
  }
  // if(_name != ""&&_name!=null)
  // {
  //   query["name"] = _name

  // }
  // 模糊搜索方式 2017-06-22 GY
  if (_name) {
    query.name = new RegExp(_name)
  }
  // 输出内容
  let option = {limit: _limit, skip: _skip, sort: -'_id'}
  let fields = {'_id': 0, 'revisionInfo': 0}

  let populate = ''
  let _workUnitUrl = ''
  let _nameUrl = ''
  let _limitUrl = ''
  let _skipUrl = ''
  let _Url = ''
  // 检查查询条件存在并设定
  if (_workUnit != null) {
    _workUnitUrl = 'workUnit=' + _workUnit
  }
  if (_name != null) {
    _nameUrl = 'name=' + _name
  }
  if (_limit != null) {
    _limitUrl = 'limit=' + String(_limit)
  }
  if (_skip != null) {
    _skipUrl = 'skip=' + String(_skip + _limit)
  }
  // 路径尾部添加查询条件
  if (_workUnitUrl !== '' || _nameUrl !== '' || _limitUrl !== '' || _skipUrl !== '') {
    _Url = _Url + '?'
    if (_workUnitUrl !== '') {
      _Url = _Url + _workUnitUrl + '&'
    }
    if (_nameUrl !== '') {
      _Url = _Url + _nameUrl + '&'
    }
    if (_limitUrl !== '') {
      _Url = _Url + _limitUrl + '&'
    }
    if (_skipUrl !== '') {
      _Url = _Url + _skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  var nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v2/patient/getDoctorLists' + _Url
  // ？？？
  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }

    res.json({results: items, nexturl: nexturl})
  }, option, fields, populate)
}

// 通过patient表中userId返回PatientObject 2017-03-30 GY
// 修改：增加判断不存在ID情况 2017-04-05 GY
exports.getPatientObject = function (req, res, next) {
  let patientId = req.sesion.userId
  if (patientId == null || patientId === '') {
    return res.json({result: '请填写userId!'})
  }
  var query = {
    userId: patientId,
    role: 'patient'
  }
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (patient == null) {
      return res.json({result: '不存在的患者ID！'})
    }
    req.body.patientObject = patient
    next()
  })
}

// 注释 承接session.userId，输出patientObject
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    }
    if (user === null) {
      return res.status(404).json({results: '找不到对象'})
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

// 获取患者的所有关注医生 2017-07-19 YQC
exports.getMyFavoriteDoctors = function (req, res) {
  let query = {userId: req.session.userId, role: 'patient'}
  var opts = ''
  var fields = {'_id': 0, 'doctors': 1}
  var populate = {path: 'doctors.doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    console.log(item.doctors)
    if (item.doctors.length === 0) {
      return res.json({results: '未关注任何医生！'})
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// 获取患者的所有医生 2017-03-30 GY
// 2017-04-05 GY 修改：按照要求更换查询表
exports.getMyDoctor = function (req, res) {
  if (req.session.userId == null || req.query.userId === '') {
    return res.json({result: '请填写userId!'})
  }
  // 查询条件
  // var patientObject = req.body.patientObject;
  var _patientId = req.session.userId
  var query = {userId: _patientId}

  var opts = ''
  var fields = {'_id': 0, 'doctors': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  var ret = {}
  var populate = {path: 'doctors.doctorId', select: {'_id': 0, 'IDNo': 0, 'revisionInfo': 0, 'teams': 0}}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
      // console.log(item.doctors.length)
    for (var i = 0; i < item.doctors.length; i++) {
      if (item.doctors[i].invalidFlag === 0) {
        ret = item.doctors[i]
        break
      }
    }
    res.json({results: ret})
  }, opts, fields, populate)
}

// 查询咨询记录 2017-03-30 GY
exports.getCounselRecords = function (req, res) {
  // 查询条件
  var patientObject = req.body.patientObject
  var query = {'patientId': patientObject._id}

  var opts = ''
  var fields = {'_id': 0, 'doctorId': 1, 'time': 1, 'messages': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  var populate = {path: 'doctorId', select: {'_id': 0, 'userId': 1, 'name': 1, 'photoUrl': 1}}

  Counsel.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// 获取患者ID对象(用于新建患者方法) 2017-04-06 GY
exports.checkPatientId = function (req, res, next) {
  let query = {
    userId: req.session.userId
  }
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (patient != null) {
      return res.json({result: '已存在的患者ID！'})
    }
        // req.body.patientObject = patient;
    next()
  })
}
// 新建患者个人信息 2017-04-06 GY
exports.newPatientDetail = function (req, res) {
  let birthday = req.body.birthday || null
  let bloodType = req.body.bloodType || null
  let hypertension = req.body.hypertension || null
  if (birthday == null) {
    return res.json({result: '请填写birthday!'})
  }
  if (bloodType == null) {
    return res.json({result: '请填写bloodType!'})
  }
  if (hypertension == null) {
    return res.json({result: '请填写hypertension!'})
  }
  var patientData = {
    userId: req.session.userId,
    name: req.body.name || null,
    gender: req.body.gender || null,
    bloodType: bloodType,
    hypertension: hypertension,
    allergic: req.body.allergic || null,
    class: req.body.class || null,
    class_info: req.body.class_info || null,
    birthday: new Date(birthday)
  // revisionInfo:{
  //   operationTime:new Date(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
  }
  if (req.body.photoUrl != null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    patientData['photoUrl'] = req.body.photoUrl
  }
  if (req.body.IDNo != null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    patientData['IDNo'] = req.body.IDNo
  }
  if (req.body.height != null && req.body.height !== '' && req.body.height !== undefined) {
    patientData['height'] = req.body.height
  }
  if (req.body.weight != null && req.body.weight !== '' && req.body.weight !== undefined) {
    patientData['weight'] = req.body.weight
  }
  if (req.body.occupation != null && req.body.occupation !== '' && req.body.occupation !== undefined) {
    patientData['occupation'] = req.body.occupation
  }
  if (req.body.nation != null && req.body.nation !== '' && req.body.nation !== undefined) {
    patientData['address.nation'] = req.body.nation
  }
  if (req.body.province != null && req.body.province !== '' && req.body.province !== undefined) {
    patientData['address.province'] = req.body.province
  }
  if (req.body.city != null && req.body.city !== '' && req.body.city !== undefined) {
    patientData['address.city'] = req.body.city
  }
  if (req.body.operationTime != null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    patientData['operationTime'] = req.body.operationTime
  }
  if (req.body.lastVisit != null && req.body.lastVisit !== '' && req.body.lastVisit !== undefined) {
    if (req.body.lastVisit.time != null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      patientData['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital != null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      patientData['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis != null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
      patientData['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis
    }
  }
  // return res.status(200).send(counselData);
  var newPatient = new Alluser(patientData)
  newPatient.save(function (err, patientInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (req.body.weight != null && req.body.weight !== '' && req.body.weight !== undefined) {
      let timenow = commonFunc.getNowFormatSecond()
      let queryVital = {
        patientId: patientInfo._id,
        type: 'Weight',
        code: 'Weight_1',
        unit: 'kg',
        date: commonFunc.getNowDate()
      }
      let upObj = {}
      let opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
      VitalSign.updateOne(queryVital, upObj, function (err, upweight) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          let query = {
            patientId: patientInfo._id,
            type: upweight.type,
            code: upweight.code,
            date: new Date(upweight.date)
          }
          let upObj = {
            $push: {
              data: {
                time: new Date(timenow),
                value: req.body.weight
              }
            }
          }
          VitalSign.update(query, upObj, function (err, updata) {
            if (err) {
              return res.status(422).send(err.message)
            }
          })
        }
      }, opts)
    }
    res.json({result: '新建成功', results: patientInfo})
  })
}

// 修改患者个人信息 2017-04-06 GY
exports.editPatientDetail = function (req, res) {
  let patientId = req.body.patientId || null
  if (patientId == null) {
    return res.json({result: '请填写userId!'})
  }
  let query = {
    userId: patientId,
    role: 'patient'
  }
  let opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}

  let upObj = {
  // revisionInfo:{
  //   operationTime:new Date(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
  }
  // if (req.body.userId != null){
  //   upObj['userId'] = req.body.userId;
  // }
  if (req.body.name != null && req.body.name !== '' && req.body.name !== undefined) {
    upObj['name'] = req.body.name
  }
  if (req.body.photoUrl != null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    upObj['photoUrl'] = req.body.photoUrl
  }
  if (req.body.birthday != null && req.body.birthday !== '' && req.body.birthday !== undefined) {
    upObj['birthday'] = new Date(req.body.birthday)
  }
  if (req.body.gender != null && req.body.gender !== '' && req.body.gender !== undefined) {
    upObj['gender'] = req.body.gender
  }
  if (req.body.IDNo != null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    upObj['IDNo'] = req.body.IDNo
  }
  if (req.body.height != null && req.body.height !== '' && req.body.height !== undefined) {
    upObj['height'] = req.body.height
  }
  if (req.body.weight != null && req.body.weight !== '' && req.body.weight !== undefined) {
    upObj['weight'] = req.body.weight
  }
  if (req.body.occupation != null && req.body.occupation !== '' && req.body.occupation !== undefined) {
    upObj['occupation'] = req.body.occupation
  }
  if (req.body.bloodType != null && req.body.bloodType !== '' && req.body.bloodType !== undefined) {
    upObj['bloodType'] = req.body.bloodType
  }
  if (req.body.nation != null && req.body.nation !== '' && req.body.nation !== undefined) {
    upObj['address.nation'] = req.body.nation
  }
  if (req.body.province != null && req.body.province !== '' && req.body.province !== undefined) {
    upObj['address.province'] = req.body.province
  }
  if (req.body.city != null && req.body.city !== '' && req.body.city !== undefined) {
    upObj['address.city'] = req.body.city
  }
  if (req.body.class != null && req.body.class !== '' && req.body.class !== undefined) {
    upObj['class'] = req.body.class
  }
  if (req.body.class_info != null && req.body.class_info !== '' && req.body.class_info !== undefined) {
    upObj['class_info'] = req.body.class_info
  }
  if (req.body.operationTime != null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    upObj['operationTime'] = new Date(req.body.operationTime)
  }
  if (req.body.hypertension != null && req.body.hypertension !== '' && req.body.hypertension !== undefined) {
    upObj['hypertension'] = req.body.hypertension
  }
  if (req.body.allergic != null && req.body.allergic !== '' && req.body.allergic !== undefined) {
    upObj['allergic'] = req.body.allergic
  }
  if (req.body.lastVisit != null) {
    if (req.body.lastVisit.time != null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      upObj['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital != null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      upObj['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis != null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
      upObj['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis
    }
  }

  // return res.json({query: query, upObj: upObj});
  Alluser.updateOne(query, upObj, function (err, upPatient) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upPatient == null) {
      return res.json({result: '修改失败，不存在的患者ID！'})
    }
    if (req.body.weight != null && req.body.weight !== '' && req.body.weight !== undefined) {
      var timenow = commonFunc.getNowFormatSecond()
      var queryVital = {
        patientId: upPatient._id,
        type: 'Weight',
        code: 'Weight_1',
        unit: 'kg',
        date: commonFunc.getNowDate()
      }
      var upVital = {}
      var opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
      console.log(queryVital)
      VitalSign.updateOne(queryVital, upVital, function (err, upweight) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          var queryWeight = {
            patientId: upPatient._id,
            type: upweight.type,
            code: upweight.code,
            date: new Date(upweight.date)
          }
          var upWeight = {
            $push: {
              data: {
                time: new Date(timenow),
                value: req.body.weight
              }
            }
          }
          VitalSign.update(queryWeight, upWeight, function (err, updata) {
            if (err) {
              return res.status(500).send(err.message)
            }
          })
        }
      }, opts)
    }
    res.json({result: '修改成功', results: upPatient})
  }, opts)
}

// 新增疾病进程
exports.getDoctorObject = function (req, res, next) {
  if (req.body.doctorId == null || req.body.doctorId === '') {
    return res.json({result: '请填写doctorId!'})
  }
  var query = {
    userId: req.body.doctorId
  }
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的医生ID！'})
    }
    req.body.doctorObject = doctor
    next()
  })
} // 弃用

exports.insertDiagnosis = function (req, res, next) {
  if (req.body.patientId == null || req.body.patientId === '') {
    return res.json({result: '请填写patientId!'})
  }
  let query = {
    userId: req.body.patientId,
    role: 'patient'
  }

  let diagName = req.body.diagname || null
  let diagProgress = req.body.diagProgress || null
  let diagContent = req.body.diagContent || null
  let diagTime
  let diagOperationTime
  let diagHypertension

  if (req.body.diagtime == null || req.body.diagtime === '' || req.body.diagtime === undefined) {
    diagTime = new Date()
  } else {
    diagTime = new Date(req.body.diagtime)
  }
  if (req.body.diagoperationTime == null || req.body.diagoperationTime === '' || req.body.diagoperationTime === undefined) {
    diagOperationTime = new Date('1900-01-01')
  } else {
    diagOperationTime = new Date(req.body.diagoperationTime)
  }
  if (req.body.diaghypertension == null || req.body.diaghypertension === '' || req.body.diaghypertension === undefined) {
  // 前端定义默认高血压否为2
    diagHypertension = 2
  } else {
    diagHypertension = req.body.diaghypertension
  }

  var upObj = {
    $push: {
      diagnosisInfo: {
        name: diagName,
        time: diagTime,
        hypertension: diagHypertension,
        progress: diagProgress,
        operationTime: diagOperationTime,
        content: diagContent,
        doctor: req.body.doctorObject._id
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Alluser.update(query, upObj, function (err, updiag) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updiag.nModified === 0) {
      return res.json({result: '未成功修改！请检查输入是否符合要求！', results: updiag})
    }
  // if (updiag.nModified == 1) {
  //   return res.json({result:'修改成功', results: updiag});
  // }
  // res.json({results: updiag});
    req.body.userId = req.body.patientId
    req.body.class = diagName
    req.body.class_info = diagProgress
    req.body.hypertension = diagHypertension
    next()
  }, {new: true})
}

// // 绑定主管医生 --- 修改关注医生.待定
// // 1. 查询当前主管医生并在DPRelation表里解绑（删除）
// exports.debindingDoctor = function (req, res, next) {
//   var query = {userId: req.session.userId, role: 'patient'}

//   Alluser.getOne(query, function (err, item) {
//     if (err) {
//       return res.status(500).send(err.errmsg)
//     }
//     if (item == null) {
//       return res.json({result: '不存在的患者ID！'})
//     }
//       // return res.json({results: item});
//     // 患者未匹配主管医生，跳转binding
//     if (item.doctors.length === 0) {
//       next()
//     } else {
//       for (var i = item.doctors.length - 1; i >= 0; i--) {
//         if (item.doctors[i].invalidFlag === 0) {
//           var lastDocId = item.doctors[i].doctorId
//           break
//         }
//       }
//       var queryDoc = {doctorId: lastDocId}
//       var upObj = {
//         $pull: {
//           patients: {
//             patientId: item._id
//           }
//         }
//       }

//       DpRelation.update(queryDoc, upObj, function (err, upDp) {
//         if (err) {
//           return res.status(500).send(err.errmsg)
//         }
//         // return res.json({resultpull:upDp});
//         if (upDp.n === 0) {
//         // return res.json({result: '未与其他医生或患者建立联系！'});
//           next()
//         } else if (upDp.n === 1 && upDp.nModified === 0) {
//         // return res.json({result: '已删除！请勿重新删除！'});
//           next()
//         } else if (upDp.n === 1 && upDp.nModified !== 0) {
//         // return res.json({result: '删除成功'});
//           next()
//         }
//       }, {new: true})
//     }
//   })
// }
// // 2. patient表中修改
// exports.bindingMyDoctor = function (req, res, next) {
//   var _pId = req.body.patientId
//   var _dId = req.body.doctorId
//   if (_pId == null || _pId === '' || _pId === undefined) {
//     return res.json({result: '请填写patientId!'})
//   } else if (_dId == null || _dId === '' || _dId === undefined) {
//     return res.json({result: '请填写doctorId!'})
//   } else {
//     if (_dId.substr(0, 1) === 'h') {
//       var queryH = {TDCurl: _dId}
//       console.log(_dId)
//       User.getOne(queryH, function (err, item) {
//         if (err) {
//           return res.status(500).send(err)
//         } else if (item == null) {
//           return res.json({result: '不存在的医生ID！'})
//         } else {
//           req.body.doctorId = item.userId
//           var queryD = {
//             userId: item.userId
//           }
//           Doctor.getOne(queryD, function (err, doctor) {
//             if (err) {
//               console.log(err)
//               return res.status(500).send('服务器错误, 用户查询失败!')
//             }
//             if (doctor == null) {
//               return res.json({result: '不存在的医生ID！'})
//             }
//             var doc = doctor._id
//             var query = {
//               userId: _pId
//             }
//             Patient.getOne(query, function (err, patient) {
//               if (err) {
//                 console.log(err)
//                 return res.status(500).send('服务器错误, 用户查询失败!')
//               }
//               if (patient == null) {
//                 return res.json({result: '不存在的患者ID！'})
//               }
//               var doctorsList = patient.doctors
//               var n = doctorsList.length
//               // var flag=0
//               for (var i = 0; i < n; i++) {
//                 doctorsList[i].invalidFlag = 1
//               // if(doctor.doctorId==_dId){
//               //   flag=1
//               //   doctor.invalidFlag=0
//               // }
//               }
//               // if(flag==1){
//               //   return res.json({result:1,msg:"患者已匹配该主管医生！"});
//               // }
//               // else{
//               var doctorNew = {doctorId: doc, firstTime: new Date(), invalidFlag: 0}
//               doctorsList.push(doctorNew)
//               // }
//               var upObj = {$set: {doctors: doctorsList}}
//               Patient.updateOne(query, upObj, function (err, patient) {
//                 if (err) {
//                   return res.status(500).send(err.errmsg)
//                 }
//                 // res.json({results: 0,msg:"success!"});
//                 req.body.doctor_id = doc
//                 req.body.patient_id = patient._id
//                 req.body.patientname = patient.name
//                 next()
//               })
//             })
//           })
//         }
//       })
//     } else if (_dId.substr(0, 1) === 'U') {
//       var queryD = {
//         userId: _dId
//       }
//       Doctor.getOne(queryD, function (err, doctor) {
//         if (err) {
//           console.log(err)
//           return res.status(500).send('服务器错误, 用户查询失败!')
//         }
//         if (doctor == null) {
//           return res.json({result: '不存在的医生ID！'})
//         }
//         var doc = doctor._id
//         var query = {
//           userId: _pId
//         }
//         Patient.getOne(query, function (err, patient) {
//           if (err) {
//             console.log(err)
//             return res.status(500).send('服务器错误, 用户查询失败!')
//           }
//           if (patient == null) {
//             return res.json({result: '不存在的患者ID！'})
//           }
//           var doctorsList = patient.doctors
//           var n = doctorsList.length
//           // var flag=0
//           for (var i = 0; i < n; i++) {
//             doctorsList[i].invalidFlag = 1
//           // if(doctor.doctorId==_dId){
//           //   flag=1
//           //   doctor.invalidFlag=0
//           // }
//           }
//           // if(flag==1){
//           //   return res.json({result:1,msg:"患者已匹配该主管医生！"});
//           // }
//           // else{
//           var doctorNew = {doctorId: doc, firstTime: new Date(), invalidFlag: 0}
//           doctorsList.push(doctorNew)
//           // }
//           var upObj = {$set: {doctors: doctorsList}}
//           Patient.updateOne(query, upObj, function (err, patient) {
//             if (err) {
//               return res.status(500).send(err.errmsg)
//             }
//             // res.json({results: 0,msg:"success!"});
//             req.body.doctor_id = doc
//             req.body.patient_id = patient._id
//             req.body.patientname = patient.name
//             next()
//           })
//         })
//       })
//     } else {
//       return res.json({result: '不存在的医生ID！'})
//     }
//   }
// }
// // 3. DpRelation表中医生绑定患者
// exports.bindingPatient = function (req, res, next) {
//   var doctorId = req.body.doctor_id
//   var patientId = req.body.patient_id
//   var dpRelationTime
//   if (req.body.dpRelationTime == null || req.body.dpRelationTime === '') {
//     dpRelationTime = new Date()
//   } else {
//     dpRelationTime = new Date(req.body.dpRelationTime)
//   }
//   // return res.json({doctor: doctorId, patient: patientId, dpTime: dpRelationTime});
//   var query = {doctorId: doctorId}

//   var upObj = {
//     $push: {
//       patients: {
//         patientId: patientId,
//         dpRelationTime: dpRelationTime
//       }
//     }
//   }

//   DpRelation.update(query, upObj, function (err, uprelation) {
//     if (err) {
//       return res.status(422).send(err.message)
//     }
//     if (uprelation.n === 0) {
//       var dpRelationData = {
//         doctorId: doctorId
//     //   revisionInfo:{
//   //   operationTime:new Date(),
//   //   userId:"gy",
//   //   userName:"gy",
//   //   terminalIP:"10.12.43.32"
//   // }
//       }
//       // return res.json({result:dpRelationData});
//       var newDpRelation = new DpRelation(dpRelationData)
//       newDpRelation.save(function (err, dpRelationInfo) {
//         if (err) {
//           return res.status(500).send(err.errmsg)
//         }
//         DpRelation.update(query, upObj, function (err, updpRelation) {
//           if (err) {
//             return res.status(422).send(err.message)
//           } else if (updpRelation.nModified === 0) {
//             return res.json({result: '未成功修改！请检查输入是否符合要求！', results: updpRelation, flag: '0'})
//           } else if (updpRelation.nModified === 1) {
//   // return res.json({result:'修改成功', results: updpRelation, flag:'0'});
//             req.body.userId = req.body.doctorId
//             req.body.role = 'doctor'
//             req.body.postdata = {

//               'template_id': 'F5UpddU9v4m4zWX8_NA9t3PU_9Yraj2kUxU07CVIT-M',
//               'url': 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=newsufferer&#wechat_redirect',

//               'data': {
//                 'first': {
//                   'value': '您好，有一位新患者添加您为他的主管医生。',
//                   'color': '#173177'
//                 },
//                 'keyword1': {
//                   'value': req.body.patientname, // 患者姓名
//                   'color': '#173177'
//                 },
//                 'keyword2': {
//                   'value': commonFunc.getNowFormatSecond(), // 添加的时间
//                   'color': '#173177'
//                 },
//                 'remark': {
//                   'value': '感谢您的使用！',
//                   'color': '#173177'
//                 }
//               }
//             }
//             next()
//           }
//   // return res.json({result:updpRelation});
//         }, {new: true})
//       })
//     } else if (uprelation.nModified === 0) {
//       return res.json({result: '未成功修改！请检查输入是否符合要求！', results: uprelation, flag: '1'})
//     } else if (uprelation.nModified === 1) {
//   // return res.json({result:'修改成功', results: uprelation, flag:'1'});
//       req.body.userId = req.body.doctorId
//       req.body.role = 'doctor'
//       req.body.postdata = {
//         'template_id': 'F5UpddU9v4m4zWX8_NA9t3PU_9Yraj2kUxU07CVIT-M',
//         'url': 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=newsufferer&#wechat_redirect',

//         'data': {
//           'first': {
//             'value': '您好，有一位新患者添加您为他的主管医生。',
//             'color': '#173177'
//           },
//           'keyword1': {
//             'value': req.body.patientname, // 患者姓名
//             'color': '#173177'
//           },
//           'keyword2': {
//             'value': commonFunc.getNowFormatSecond(), // 添加的时间
//             'color': '#173177'
//           },
//           'remark': {
//             'value': '感谢您的使用！',
//             'color': '#173177'
//           }
//         }
//       }
//   // console.log(req.body.postdata);
//       next()
//     }
//   // res.json({results: uprelation});
//   }, {new: true})
// }

// 绑定关注医生 在alluser表patient_info部分doctors字段添加记录
exports.bindingDoctor = function (req, res, next) {
  // var patientId = req.body.patientId || null
  let patientId = req.session.userId
  let doctorId = req.body.doctorId || null
  // if (patientId == null) {
  //   return res.json({result: '请填写patientId!'})
  // }
  if (doctorId == null) {
    return res.json({result: '请填写doctorId!'})
  }
  let queryD = {userId: doctorId, role: 'doctor'}
  Alluser.getOne(queryD, function (err, itemD) {
    if (err) {
      return res.status(500).send(err)
    }
    if (itemD == null) {
      return res.json({result: '不存在的医生ID!'})
    }

    let doctorObjectId = itemD._id
    let queryP = {userId: patientId, role: 'patient'}
    Alluser.getOne(queryP, function (err, itemP) {
      if (err) {
        return res.status(500).send(err)
      }
      let favoriteDoctorsList = itemP.doctors
      console.log(favoriteDoctorsList)
      for (let i = 0; i < favoriteDoctorsList.length; i++) {
        if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
          return res.json({result: '已关注该医生!'})
        }
      }

      let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0}
      favoriteDoctorsList.push(doctorNew)
      let upObj = {$set: {doctors: favoriteDoctorsList}}
      Alluser.updateOne(queryP, upObj, function (err, upPatient) {
        if (err) {
          return res.status(500).send(err)
        }
        req.body.doctorObjectId = doctorObjectId
        req.body.patientObjectId = upPatient._id
        next()
      })
    })
  })
}

// DpRelation表中医生绑定患者
exports.bindingPatient = function (req, res) {
  let doctorObjectId = req.body.doctorObjectId
  let patientObjectId = req.body.patientObjectId
  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  let query = {doctorId: doctorObjectId}

  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    if (item == null) {
      let dpRelationData = {
        doctorId: doctorObjectId
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err)
        }
      })
    }
  })

  let upObj = {
    $push: {
      patients: {
        patientId: patientObjectId,
        dpRelationTime: dpRelationTime
      }
    }
  }

  DpRelation.update(query, upObj, function (err, upRelation) {
    if (err) {
      return res.status(422).send(err)
    }
    if (upRelation.nModified === 0) {
      return res.json({result: '未关注成功！请检查输入是否符合要求！'})
    } else if (upRelation.nModified === 1) {
      return res.json({result: '关注成功', results: upRelation})
    }
  // res.json({results: uprelation});
  }, {new: true})
}

// 修改患者VIP状态 2017-05-04 GY
exports.changeVIP = function (req, res) {
  let userId = req.body.userId || null
  if (userId == null) {
    return res.json({result: '请填写userId!'})
  }
  var query = {
    userId: userId
  }

  var upObj = {}
  if (req.body.VIP != null && req.body.VIP !== '' && req.body.VIP !== undefined) {
    upObj['VIP'] = req.body.VIP
  }

  Alluser.updateOne(query, upObj, function (err, upPatient) {
    if (err) {
      return res.status(500).send(err.message)
    }
    if (upPatient == null) {
      return res.json({result: '修改失败，不存在的患者ID！'})
    }
    res.json({result: '修改成功', results: upPatient})
  }, {new: true})
}

// 患者头像不存在时使用微信头像 2017-06-14 GY
exports.wechatPhotoUrl = function (req, res) {
  if (req.query.wechatPhotoUrl === null || req.query.wechatPhotoUrl === '' || req.query.wechatPhotoUrl === undefined) {
    return res.json({results: '请填写wechatPhotoUrl'})
  }
  let query = {userId: req.session.userId}
  let newPhotoUrl = req.query.wechatPhotoUrl
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({results: '不存在的患者ID'})
    } else if (item.photoUrl === undefined) {
      var upObj = {photoUrl: newPhotoUrl}
      Alluser.updateOne(query, upObj, function (err, upItem) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        return res.json({results: '头像已更新', editResults: upItem})
      })
    } else {
      return res.json({results: '已存在头像，未更新'})
    }
  })
}
