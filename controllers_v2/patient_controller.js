// 代码 2017-03-29 GY
// 修改 患者详情，只输出最新的诊断内容 2017-05-14 GY
// 注释 2017-07-17 YQC

var docInfoForPat = {
  _id: 0,
  charge1: 1,
  charge2: 1,
  charge3: 1,
  charge4: 1,
  charge5: 1,
  counselStatus1: 1,
  counselStatus2: 1,
  counselStatus3: 1,
  counselStatus4: 1,
  counselStatus5: 1,
  count1: 1,
  count2: 1,
  department: 1,
  gender: 1,
  name: 1,
  score: 1,
  title: 1,
  userId: 1,
  workUnit: 1,
  description: 1,
  major: 1,
  photoUrl: 1
}
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
  let userId = req.query.userId || null
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
  // else if((_name == null || _name == '') && _workUnit !== null){
  //   query = {workUnit:_workUnit};
  // }
  // else if (_name !== null && (_workUnit == null || _workUnit == '')){
  //   query = {name:_name};
  // }
  // else{
  //   query = {workUnit:_workUnit, name:_name};
  // }

  let query = {role: 'doctor'}
  if (_province !== null) {
    query['province'] = _province
  }
  if (_city !== null) {
    query['city'] = _city
  }
  if (_district !== null) {
    query['district'] = _district
  }
  if (_workUnit !== null) {
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
  let fields = docInfoForPat

  let populate = ''
  let _workUnitUrl = ''
  let _nameUrl = ''
  let _limitUrl = ''
  let _skipUrl = ''
  let _Url = ''
  // 检查查询条件存在并设定
  if (_workUnit !== null) {
    _workUnitUrl = 'workUnit=' + _workUnit
  }
  if (_name !== null) {
    _nameUrl = 'name=' + _name
  }
  if (_limit !== null) {
    _limitUrl = 'limit=' + String(_limit)
  }
  if (_skip !== null) {
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
  let patientId = req.query.userId
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
  let limit = Number(req.query.limit || null)
  let skip = Number(req.query.skip || null)
  let token = req.query.token || null
  let opts = ''
  let fields = {'_id': 0, 'doctors': 1}
  let populate = {path: 'doctors.doctorId', select: docInfoForPat}

  let _Url = ''
  let tokenUrl = 'token=' + token
  let limitUrl = ''
  let skipUrl = ''

  if (limit > 0) {
    limitUrl = 'limit=' + String(limit)
  } else {
    return res.json({results: 'limit输入错误'})
  }
  if (skip >= 0) {
    skipUrl = 'skip=' + String(skip + limit)
  } else {
    return res.json({results: 'skip输入错误'})
  }
  if (tokenUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (tokenUrl !== '') {
      _Url = _Url + tokenUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }

  let nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v2/patient/myFavoriteDoctors' + _Url
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    if (item.doctors.length === 0) {
      return res.json({results: '未关注任何医生！'})
    }
    res.json({results: item.doctors.slice(skip, limit + skip), nexturl: nexturl})
  }, opts, fields, populate)
}

// 获取患者的所有医生 2017-03-30 GY
// 2017-04-05 GY 修改：按照要求更换查询表
exports.getMyDoctor = function (req, res) {
  // 查询条件
  // var patientObject = req.body.patientObject;
  let _patientId = req.session.userId
  let query = {userId: _patientId}

  let opts = ''
  let fields = {'_id': 0, 'doctorsInCharge': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {path: 'doctorsInCharge.doctorId', select: docInfoForPat}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log(item.doctors.length)
    let doctorsInChargeList = item.doctorsInCharge || []
    let currentDocInCharge
    for (let i = 0; i < doctorsInChargeList.length; i++) {
      if (doctorsInChargeList[i].invalidFlag === 1) {
        currentDocInCharge = doctorsInChargeList[i]
        break
      }
    }
    if (currentDocInCharge === undefined) {
      return res.json({results: '当前无主管医生'})
    } else {
      res.json({results: currentDocInCharge})
    }
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

  Counsel.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: items})
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
    if (patient !== null) {
      return res.json({result: '已存在的患者ID！'})
    }
        // req.body.patientObject = patient;
    next()
  })
}

// 2017-07-22 lgf 添加checkPatient
exports.checkPatient = function (req, res, next) {
  if (req.query.patientId == null || req.query.patientId === '' || req.query.patientId === undefined) {
    if (req.body.patientId == null || req.body.patientId === '' || req.body.patientId === undefined) {
      return res.json({result: '请填写patientId!'})
    } else {
      req.patientId = req.body.patientId
    }
  } else {
    req.patientId = req.query.patientId
  }
  var query = {userId: req.patientId, role: 'patient'}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({result: '不存在的患者ID'})
    } else {
      next()
    }
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
  if (req.body.photoUrl !== null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    patientData['photoUrl'] = req.body.photoUrl
  }
  if (req.body.IDNo !== null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    patientData['IDNo'] = req.body.IDNo
  }
  if (req.body.height !== null && req.body.height !== '' && req.body.height !== undefined) {
    patientData['height'] = req.body.height
  }
  if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined) {
    patientData['weight'] = req.body.weight
  }
  if (req.body.occupation !== null && req.body.occupation !== '' && req.body.occupation !== undefined) {
    patientData['occupation'] = req.body.occupation
  }
  if (req.body.nation !== null && req.body.nation !== '' && req.body.nation !== undefined) {
    patientData['address.nation'] = req.body.nation
  }
  if (req.body.province !== null && req.body.province !== '' && req.body.province !== undefined) {
    patientData['address.province'] = req.body.province
  }
  if (req.body.city !== null && req.body.city !== '' && req.body.city !== undefined) {
    patientData['address.city'] = req.body.city
  }
  if (req.body.operationTime !== null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    patientData['operationTime'] = req.body.operationTime
  }
  if (req.body.lastVisit !== null && req.body.lastVisit !== '' && req.body.lastVisit !== undefined) {
    if (req.body.lastVisit.time !== null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      patientData['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital !== null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      patientData['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis !== null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
      patientData['lastVisit.diagnosis'] = req.body.lastVisit.diagnosis
    }
  }
  // return res.status(200).send(counselData);
  var newPatient = new Alluser(patientData)
  newPatient.save(function (err, patientInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined) {
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
// 修改 患者修改个人体重信息时加入体征测量数据的操作 2017-08-07 lgf
exports.editPatientDetail = function (req, res) {
  let patientId
  if (req.session.role === 'doctor') {
    patientId = req.body.patientId || null
    if (patientId === null) {
      return res.json({results: '请填写patientId!'})
    }
  } else if (req.session.role === 'patient') {
    patientId = req.session.userId
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
  // if (req.body.userId !== null){
  //   upObj['userId'] = req.body.userId;
  // }
  if (req.body.name !== null && req.body.name !== '' && req.body.name !== undefined) {
    upObj['name'] = req.body.name
  }
  if (req.body.photoUrl !== null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    upObj['photoUrl'] = req.body.photoUrl
  }
  if (req.body.birthday !== null && req.body.birthday !== '' && req.body.birthday !== undefined) {
    upObj['birthday'] = new Date(req.body.birthday)
  }
  if (req.body.gender !== null && req.body.gender !== '' && req.body.gender !== undefined) {
    upObj['gender'] = req.body.gender
  }
  if (req.body.IDNo !== null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    upObj['IDNo'] = req.body.IDNo
  }
  if (req.body.height !== null && req.body.height !== '' && req.body.height !== undefined) {
    upObj['height'] = req.body.height
  }
  if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined) {
    upObj['weight'] = req.body.weight
  }
  if (req.body.occupation !== null && req.body.occupation !== '' && req.body.occupation !== undefined) {
    upObj['occupation'] = req.body.occupation
  }
  if (req.body.bloodType !== null && req.body.bloodType !== '' && req.body.bloodType !== undefined) {
    upObj['bloodType'] = req.body.bloodType
  }
  if (req.body.nation !== null && req.body.nation !== '' && req.body.nation !== undefined) {
    upObj['address.nation'] = req.body.nation
  }
  if (req.body.province !== null && req.body.province !== '' && req.body.province !== undefined) {
    upObj['address.province'] = req.body.province
  }
  if (req.body.city !== null && req.body.city !== '' && req.body.city !== undefined) {
    upObj['address.city'] = req.body.city
  }
  if (req.body.class !== null && req.body.class !== '' && req.body.class !== undefined) {
    upObj['class'] = req.body.class
  }
  if (req.body.class_info !== null && req.body.class_info !== '' && req.body.class_info !== undefined) {
    upObj['class_info'] = req.body.class_info
  }
  if (req.body.operationTime !== null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    upObj['operationTime'] = new Date(req.body.operationTime)
  }
  if (req.body.hypertension !== null && req.body.hypertension !== '' && req.body.hypertension !== undefined) {
    upObj['hypertension'] = req.body.hypertension
  }
  if (req.body.allergic !== null && req.body.allergic !== '' && req.body.allergic !== undefined) {
    upObj['allergic'] = req.body.allergic
  }
  if (req.body.lastVisit !== null && req.body.lastVisit !== '' && req.body.lastVisit !== undefined) {
    if (req.body.lastVisit.time !== null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      upObj['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital !== null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      upObj['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis !== null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
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
    let date = req.body.date || null   // 区别是通过vitalSign插入体重信息，还是通过修改个人信息插入体重信息
    let dateTime = req.body.datatime || null
    if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined && date === null && dateTime === null) {
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
                time: new Date(),
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
  let patientId
  if (req.session.role === 'doctor') {
    patientId = req.body.patientId || null
    if (patientId === null) {
      return res.json({results: '请填写patientId!'})
    }
  } else if (req.session.role === 'patient') {
    patientId = req.session.userId
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

// 绑定关注医生 在alluser表patient_info部分doctors字段添加记录
exports.bindingFavoriteDoctor = function (req, res, next) {
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
exports.bindingFavoritePatient = function (req, res) {
  let doctorObjectId = req.body.doctorObjectId
  let patientObjectId = req.body.patientObjectId
  let dpRelationTime = req.body.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(req.body.dpRelationTime)
  }
  let query = {doctorId: doctorObjectId}
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
    if (upRelation.n === 0) {
      let dpRelationData = {
        doctorId: doctorObjectId
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err)
        }
        DpRelation.update(query, upObj, function (err, upRelation) {
          if (err) {
            return res.status(422).send(err)
          } else if (upRelation.nModified === 0) {
            return res.json({result: '未关注成功！请检查输入是否符合要求！'})
          } else if (upRelation.nModified === 1) {
            return res.json({result: '关注成功', results: upRelation})
          }
        }, {new: true})
      })
    } else if (upRelation.nModified === 0) {
      return res.json({result: '未关注成功！请检查输入是否符合要求！'})
    } else if (upRelation.nModified === 1) {
      return res.json({result: '关注成功', results: upRelation})
    }
  // res.json({results: uprelation});
  }, {new: true})
}

// 解绑关注医生 在alluser表patient_info部分doctors字段添加记录
exports.debindingFavoriteDoctor = function (req, res, next) {
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
      let flag = 0
      let doctorObject
      for (let i = 0; i < favoriteDoctorsList.length; i++) {
        if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
          flag = 1
          doctorObject = favoriteDoctorsList[i]
          break
        }
      }
      if (flag === 0) {
        return res.json({result: '未关注该医生!'})
      } else {
        favoriteDoctorsList.pull(doctorObject)
        let upObj = {$set: {doctors: favoriteDoctorsList}}
        Alluser.updateOne(queryP, upObj, function (err, upPatient) {
          if (err) {
            return res.status(500).send(err)
          }
          if (upPatient.nModified === 0) {
            return res.json({result: '解绑医生不成功!'})
          } else {
            req.body.doctorObjectId = doctorObjectId
            req.body.patientObjectId = upPatient._id
            next()
          }
        })
      }
    })
  })
}

// DpRelation表中医生绑定患者
exports.debindingFavoritePatient = function (req, res) {
  let doctorObjectId = req.body.doctorObjectId
  let patientObjectId = req.body.patientObjectId
  let query = {doctorId: doctorObjectId}
  let upObj = {
    $pull: {
      patients: {
        patientId: patientObjectId
      }
    }
  }
  DpRelation.update(query, upObj, function (err, upRelation) {
    if (err) {
      return res.status(422).send(err)
    }
    if (upRelation.n === 0) {
      return res.json({result: '找不到对象'})
    } else if (upRelation.nModified === 0) {
      return res.json({result: '解绑患者不成功！'})
    } else if (upRelation.nModified === 1) {
      return res.json({result: '取消关注成功'})
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
  if (req.body.VIP !== null && req.body.VIP !== '' && req.body.VIP !== undefined) {
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
