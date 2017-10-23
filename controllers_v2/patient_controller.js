// 代码 2017-03-29 GY
// 修改 患者详情，只输出最新的诊断内容 2017-05-14 GY
// 注释 2017-07-17 YQC
var async = require('async')
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
  photoUrl: 1, 
  schedules: 1, 
  suspendTime: 1
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
var DoctorsInCharge = require('../models/doctorsInCharge')

var patientCtrl = require('../controllers_v2/patient_controller')

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
    // } else if (item.IDNo === undefined) {
    //   return res.json({results: '没有填写个人信息'})
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
      let queryWeight = {patientId: item._id, type: '体重'}
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
        if (req.session.role === 'doctor') {
          let queryDPR = {doctorId: req.session._id}
          DpRelation.getOne(queryDPR, function (err, dpitem) {
            if (err) {
              return res.status(500).send(err)
            } else if (dpitem === null) {
              return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis, dprelation: 'none'})
            } else {
              let patientFlag = 0
              let patientChargeFlag = 0
              if (dpitem.patients) {
                if (dpitem.patients.length) {
                  for (let i = 0; i < dpitem.patients.length; i++) {
                    if (JSON.stringify(dpitem.patients[i].patientId) === JSON.stringify(item._id)) {
                      patientFlag = 1
                      break
                    }
                  }
                }
              }
              if (dpitem.patientsInCharge) {
                if (dpitem.patientsInCharge.length) {
                  for (let i = 0; i < dpitem.patientsInCharge.length; i++) {
                    if (JSON.stringify(dpitem.patientsInCharge[i].patientId) === JSON.stringify(item._id)) {
                      patientChargeFlag = 1
                      break
                    }
                  }
                }
              }
              if (!patientFlag && !patientChargeFlag) {
                return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis, dprelation: 'none'})
              } else if (patientChargeFlag) {
                return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis, dprelation: 'charge'})
              } else if (patientFlag && !patientChargeFlag) {
                return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis, dprelation: 'follow'})
              } else {
                return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis, dprelation: 'error'})
              }
            }
          })
        } else {
          return res.json({results: item, weight: patientWeight, recentDiagnosis: recentDiagnosis})
        }
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
  var nexturl = webEntry.domain + '/api/v2/patient/getDoctorLists' + _Url

  if (req.query.doctorId !== null && req.query.doctorId !== undefined && req.query.doctorId !== '') {
    query = {userId: req.query.doctorId, role: 'doctor', reviewStatus: 1}
    option = ''
  }
  if (req.session.role === 'admin' || req.session.role.indexOf('admin') !== -1) {
    fields = {_id: 1, province: 1, city: 1, workUnit: 1, title: 1, department: 1}
  }
  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      res.json({results: items, nexturl: nexturl})
    }
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

  let nexturl = webEntry.domain + '/api/v2/patient/myFavoriteDoctors' + _Url
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

/** 新建患者个人信息 弃用
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
*/

// 修改患者个人信息 2017-04-06 GY
// 修改 患者修改个人体重信息时加入体征测量数据的操作 2017-08-07 lgf
exports.editPatientDetail = function (req, res, next) {
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
  if (req.body.height === '') {
    upObj['height'] = undefined
  } else if (req.body.height !== null && req.body.height !== '' && req.body.height !== undefined) {
    upObj['height'] = req.body.height
  }
  if (req.body.weight === '') {
    upObj['weight'] = undefined
  } else if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined) {
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
  if (req.body.operationTime === '') {
    upObj['operationTime'] = undefined
  } else if (req.body.operationTime !== null && req.body.operationTime !== '' && req.body.operationTime !== undefined) {
    upObj['operationTime'] = new Date(req.body.operationTime)
  }
  if (req.body.hypertension !== null && req.body.hypertension !== '' && req.body.hypertension !== undefined) {
    upObj['hypertension'] = req.body.hypertension
  }
  if (req.body.allergic !== null && req.body.allergic !== '' && req.body.allergic !== undefined) {
    upObj['allergic'] = req.body.allergic
  }
  if (req.body.lastVisit !== null && req.body.lastVisit !== '' && req.body.lastVisit !== undefined) {
    if (req.body.lastVisit.time === '') {
      upObj['lastVisit.time'] = undefined
    } else if (req.body.lastVisit.time !== null && req.body.lastVisit.time !== '' && req.body.lastVisit.time !== undefined) {
      upObj['lastVisit.time'] = new Date(req.body.lastVisit.time)
    }
    if (req.body.lastVisit.hospital === '') {
      upObj['lastVisit.hospital'] = undefined
    } else if (req.body.lastVisit.hospital !== null && req.body.lastVisit.hospital !== '' && req.body.lastVisit.hospital !== undefined) {
      upObj['lastVisit.hospital'] = req.body.lastVisit.hospital
    }
    if (req.body.lastVisit.diagnosis === '') {
      upObj['lastVisit.diagnosis'] = undefined
    } else if (req.body.lastVisit.diagnosis !== null && req.body.lastVisit.diagnosis !== '' && req.body.lastVisit.diagnosis !== undefined) {
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

    let dataTime = req.body.datatime || null
    if (req.body.weight !== null && req.body.weight !== '' && req.body.weight !== undefined && date === null && dataTime === null) {
      var queryVital = {
        patientId: upPatient._id,
        type: '体重',
        code: '体重',
        unit: 'kg',
        date: commonFunc.getNowDate()
      }
      let upVital = {}
      let opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
      // console.log(queryVital)
      VitalSign.updateOne(queryVital, upVital, function (err, upweight) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else {
          let queryWeight = {
            patientId: upPatient._id,
            type: upweight.type,
            code: upweight.code,
            date: new Date(upweight.date)
          }
          let upWeight = {
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
            } else {
              return res.json({result: '修改成功', results: upPatient})
            }
          })
        }
      }, opts)
    } else if (date !== null && dataTime !== null) {  // 体征数据进行后续警戒值判断
      return next()
    } else {  // 修改除体重数据外的患者信息返回
      return res.json({result: '修改成功', results: upPatient})
    }
  }, {new: true})
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
// exports.bindingFavoriteDoctor = function (req, res, next) {
//   // var patientId = req.body.patientId || null
//   let patientId = req.session.userId
//   let doctorId = req.body.doctorId || null
//   // if (patientId == null) {
//   //   return res.json({result: '请填写patientId!'})
//   // }
//   if (doctorId == null) {
//     return res.json({result: '请填写doctorId!'})
//   }
//   let queryD = {userId: doctorId, role: 'doctor'}
//   Alluser.getOne(queryD, function (err, itemD) {
//     if (err) {
//       return res.status(500).send(err)
//     }
//     if (itemD == null) {
//       return res.json({result: '不存在的医生ID!'})
//     }

//     let doctorObjectId = itemD._id
//     let queryP = {userId: patientId, role: 'patient'}
//     Alluser.getOne(queryP, function (err, itemP) {
//       if (err) {
//         return res.status(500).send(err)
//       }
//       let favoriteDoctorsList = itemP.doctors
//       console.log(favoriteDoctorsList)
//       for (let i = 0; i < favoriteDoctorsList.length; i++) {
//         if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
//           return res.json({result: '已关注该医生!'})
//         }
//       }

//       let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0}
//       favoriteDoctorsList.push(doctorNew)
//       let upObj = {$set: {doctors: favoriteDoctorsList}}
//       Alluser.updateOne(queryP, upObj, function (err, upPatient) {
//         if (err) {
//           return res.status(500).send(err)
//         }
//         req.body.doctorObjectId = doctorObjectId
//         req.body.patientObjectId = upPatient._id
//         next()
//       })
//     })
//   })
// }
// 修改 绑定关注医生(1、点击关注医生按钮添加绑定, 2、扫码关注医生) 2017-08-25 lgf
exports.bindingFavoriteDoctor = function (req, res, next) {
  let patientId = req.session.userId
  let doctorId = req.body.doctorId || null
  let queryD = {role: 'doctor'}
  if (doctorId === null) {
    return res.json({result: '请填写doctorId!'})
  } else {
    if (doctorId.substr(0, 1) === 'h') {  // 扫码获取医生docTDCUrl，再读取userId
      queryD['docTDCurl'] = doctorId
      // console.log('queryD', queryD)
    } else if (doctorId.substr(0, 1) === 'U') { // 点击关注按钮直接获取医生的userId
      queryD['userId'] = doctorId
    } else {
      return res.json({result: '请检查doctorId输入！'})
    }
  }
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
      // console.log(favoriteDoctorsList)
      for (let i = 0; i < favoriteDoctorsList.length; i++) {
        if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
          return res.json({result: '关注成功（已关注该医生）'})
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
  DpRelation.getOne(query, function (err, itemR) {
    let flag = 0
    if (err) {
      return res.status(422).send(err)
    } else if (itemR !== null) {
      let favoritePatientList = itemR.patients || []
      for (let i = 0; i < favoritePatientList.length; i++) {
        if (String(favoritePatientList[i].patientId) === String(patientObjectId)) {
          flag = 1
          break
        }
      }
    }
    if (flag) {
      return res.json({result: '关注成功（已添加该患者）'})
    } else {
      DpRelation.updateOne(query, upObj, function (err, upRelation) {
        if (err) {
          return res.status(422).send(err)
        } else {
          return res.json({result: '关注成功'})
        }
      // res.json({results: uprelation});
      }, {new: true, upsert: true})
    }
  })
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
  let query = {userId: req.query.patientId}
  let newPhotoUrl = req.query.wechatPhotoUrl
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    let upObj = {photoUrl: newPhotoUrl}
    if (item == null) {
      return res.json({results: '不存在的患者ID'})
    } else if (!item.photoUrl) {
      Alluser.updateOne(query, upObj, function (err, upItem) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        return res.json({results: '头像已更新', editResults: upItem})
      })
    } else if (item.photoUrl.indexOf('wx.qlogo.cn') && (item.photoUrl !== newPhotoUrl)) {
      // 如果微信头像更新地址，相应字段也应该更新
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

// async改写 ------ POST patient/favoriteDoctor ------ 已调试 ------ 2017-09-25 YQC
exports.favoriteDoctorAsync = function (params, callback) {
  let patientId = params.patientId || null
  let doctorId = params.doctorId || null
  let queryD = {role: 'doctor'}
  if (doctorId === null || patientId === null) {
    let err = '请填写doctorId/patientId!'
    return callback(err)
  } else {
    if (doctorId.substr(0, 1) === 'h') {  // 扫码获取医生docTDCUrl，再读取userId
      queryD['docTDCurl'] = doctorId
    } else if (doctorId.substr(0, 1) === 'U') { // 点击关注按钮直接获取医生的userId
      queryD['userId'] = doctorId
    } else {
      let err = '请检查doctorId输入!'
      return callback(err)
    }
  }
  let queryP = {userId: patientId, role: 'patient'}

  let dpRelationTime = params.dpRelationTime || null
  if (dpRelationTime == null) {
    dpRelationTime = new Date()
  } else {
    dpRelationTime = new Date(dpRelationTime)
  }

  async.auto({
    getDoctor: function (callback) {
      Alluser.getOne(queryD, function (err, itemD) {
        if (itemD) {
          return callback(err, itemD)
        } else {
          let err = '不存在的医生ID!'
          return callback(err)
        }
      })
    },
    getPatient: function (callback) {
      Alluser.getOne(queryP, function (err, itemP) {
        if (itemP) {
          return callback(err, itemP)
        } else {
          let err = '不存在的患者ID!'
          return callback(err)
        }
      })
    },
    updateFD: ['getDoctor', 'getPatient', function (result, callback) {
      let doctorObjectId = result.getDoctor._id
      let favoriteDoctorsList = result.getPatient.doctors
      for (let i = 0; i < favoriteDoctorsList.length; i++) {
        if (String(favoriteDoctorsList[i].doctorId) === String(doctorObjectId)) {
          let err = '已关注该医生!'
          return callback(err)
        }
      }
      let doctorNew = {doctorId: doctorObjectId, firstTime: new Date(), invalidFlag: 0}
      favoriteDoctorsList.push(doctorNew)
      let upObj = {$set: {doctors: favoriteDoctorsList}}
      Alluser.updateOne(queryP, upObj, function (err, upPatient) {
        return callback(err, upPatient)
      })
    }],
    updateFP: ['getDoctor', 'getPatient', function (result, callback) {
      let doctorObjectId = result.getDoctor._id
      let patientObjectId = result.getPatient._id
      let query = {doctorId: doctorObjectId}
      let upObj = {
        $push: {
          patients: {
            patientId: patientObjectId,
            dpRelationTime: dpRelationTime
          }
        }
      }
      DpRelation.updateOne(query, upObj, function (err, upRelation) {
        return callback(err, upRelation)
      }, {new: true, upsert: true})
    }]
  }, function (err, results) {
    return callback(err, results)
  })
}

// async改写 调用favoriteDoctorAsync方式与结果处理 ------ 2017-09-25 YQC
exports.favoriteDoctorAsyncTest = function (req, res) {
  let params = {
    patientId: req.session.userId, // 患者userId
    doctorId: req.body.doctorId, // 医生userId
    dpRelationTime: req.body.dpRelationTime // 关注时间
  }
  patientCtrl.favoriteDoctorAsync(params, function (err, results) {
    if (err) {
      return res.json({msg: err, data: results, code: 1})
    } else {
      return res.json({msg: '关注成功', data: results, code: 0})
    }
  })
}

// 管理员获取患者主管关注医生 2017-10-20 GY
exports.doctorsByPatient = function (req, res) {
  let userId = req.query.userId || null
  if (userId === null) {
    return res.status(412).json({msg: 'userId_needed', code: 1})
  }
  let query = {userId: userId}
  let opts = ''
  let fields = {_id: 1, userId: 1, name:1, doctors: 1}
  let populate = {path: 'doctors.doctorId', select: {userId: 1, name: 1}}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    } else if (item === null) {
      return res.status(404).json({
        msg: 'id_not_found', 
        code: 1
      })
    } else {
      let FD = []
      for (let i = 0; i < item.doctors.length; i++) {
        if (item.doctors[i].invalidFlag === 1) {
          FD.push(item.doctors[i])
        }
      }
      let patientId = item._id
      let queryDIC = {patientId: patientId, invalidFlag: 1}
      let optsDIC = ''
      let fieldsDIC = {_id: 1, patientId: 1, doctorId: 1, invalidFlag: 1}
      let populateDIC = {path: 'doctorId', select: {userId: 1, name: 1, phoneNo: 1}}
      DoctorsInCharge.getOne(queryDIC, function (err, itemDIC) {
        if (err) {
          return res.status(500).send(err)
        } else if (itemDIC === null) {
          return res.json({
            msg: 'success', 
            code: 0, 
            data: {
              FD: FD, 
              DIC: 'NULL'
            }
          })
        } else {
          return res.json({
            msg: 'success', 
            code: 0, 
            data: {
              FD: FD, 
              DIC: itemDIC
            }
          })
        }
      }, optsDIC, fieldsDIC, populateDIC)
    }
  }, opts, fields, populate)
}