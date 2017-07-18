// var config = require('../config')
var webEntry = require('../settings').webEntry
var Doctor = require('../models/doctor')
var Team = require('../models/team')
var DpRelation = require('../models/dpRelation')
var Consultation = require('../models/consultation')
var Counsel = require('../models/counsel')
var Comment = require('../models/comment')
var User = require('../models/user')
var Alluser = require('../models/alluser')
var commonFunc = require('../middlewares/commonFunc')
var pinyin = require('pinyin')

// //根据userId查询医生信息 2017-03-28 GY
// exports.getDoctor = function(req, res) {
//   var _userId = req.query.userId
//   var query = {userId:_userId};

//   Doctor.getOne(query, function(err, item) {
//   if (err) {
//         return res.status(500).send(err.errmsg);
//       }
//       res.json({results: item});
//   });
// }

// WF 20170626
// 获取医生列表（或者详细信息）
// 输入：无/用户ID，角色
// 输出：用户ID，姓名，性别，手机号码，医院，科室，职称，咨询量，问诊量，评分；

exports.getDoctors = function (req, res) {
  var query = {}
  if (req.query.userId !== null && req.query.userId !== '' && req.query.userId !== undefined) {
    query['userId'] = req.query.userId
  };
  var opts = ''
  var fields = {'_id': 0, 'patients': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  var populate = {path: 'patients.patientId', select: {'_id': 0, 'revisionInfo': 0}}
  Doctor.getSome(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的医生ID！'})
    }
    return res.json({doctors: doctor})
  }, opts, fields, populate)
}

// 新建医生基本信息 2017-04-01 GY
exports.insertDocBasic = function (req, res) {
  let doctorData = {
    userId: req.session.userId,
    registerTime: commonFunc.getNowFormatSecond()
  // revisionInfo:{
  //   operationTime:commonFunc.getNowFormatSecond(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
  }
  // certificatePhotoUrl:String, //资格证书地址
  // practisingPhotoUrl:String, //执业证书地址
  if (req.body.certificatePhotoUrl != null && req.body.certificatePhotoUrl !== '' && req.body.certificatePhotoUrl !== undefined) {
    doctorData['certificatePhotoUrl'] = req.body.certificatePhotoUrl
  }
  if (req.body.practisingPhotoUrl != null && req.body.practisingPhotoUrl !== '' && req.body.practisingPhotoUrl !== undefined) {
    doctorData['practisingPhotoUrl'] = req.body.practisingPhotoUrl
  }
  if (req.body.name != null && req.body.name !== '' && req.body.name !== undefined) {
    doctorData['name'] = req.body.name
  }
  if (req.body.photoUrl != null && req.body.photoUrl !== '' && req.body.photoUrl !== undefined) {
    doctorData['photoUrl'] = req.body.photoUrl
  }
  if (req.body.birthday != null && req.body.birthday !== '' && req.body.birthday !== undefined) {
    doctorData['birthday'] = new Date(req.body.birthday)
  }
  if (req.body.gender != null && req.body.gender !== '' && req.body.gender !== undefined) {
    doctorData['gender'] = req.body.gender
  }
  if (req.body.IDNo != null && req.body.IDNo !== '' && req.body.IDNo !== undefined) {
    doctorData['IDNo'] = req.body.IDNo
  }
  if (req.body.province != null && req.body.province !== '' && req.body.province !== undefined) {
    doctorData['province'] = req.body.province
  }
  if (req.body.city != null && req.body.city !== '' && req.body.city !== undefined) {
    doctorData['city'] = req.body.city
  }
  if (req.body.district != null && req.body.district !== '' && req.body.district !== undefined) {
    doctorData['district'] = req.body.district
  }
  if (req.body.workUnit != null && req.body.workUnit !== '' && req.body.workUnit !== undefined) {
    doctorData['workUnit'] = req.body.workUnit
  }
  if (req.body.title != null && req.body.title !== '' && req.body.title !== undefined) {
    doctorData['title'] = req.body.title
  }
  if (req.body.job != null && req.body.job !== '' && req.body.job !== undefined) {
    doctorData['job'] = req.body.job
  }
  if (req.body.department != null && req.body.department !== '' && req.body.department !== undefined) {
    doctorData['department'] = req.body.department
  }
  if (req.body.major != null && req.body.major !== '' && req.body.major !== undefined) {
    doctorData['major'] = req.body.major
  }
  if (req.body.description != null && req.body.description !== '' && req.body.description !== undefined) {
    doctorData['description'] = req.body.description
  }
  if (req.body.charge1 != null && req.body.charge1 !== '' && req.body.charge1 !== undefined) {
    doctorData['charge1'] = req.body.charge1
  }
  if (req.body.charge2 != null && req.body.charge2 !== '' && req.body.charge2 !== undefined) {
    doctorData['charge2'] = req.body.charge2
  }

  var newDoctor = new Alluser(doctorData)
  newDoctor.save(function (err, doctorInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({result: '新建成功', newResults: doctorInfo})
  })
}

// 根据doctorId获取所有团队 2017-03-29 GY
// 注释 医生查询自己所在团队 承接session.userId，输出团队信息
exports.getTeams = function (req, res) {
  // 查询条件
  let _userId = req.session.userId
  // userId可能出现在sponsor或者是members里
  let query = {$or: [{sponsorId: _userId}, {'members.userId': _userId}]}

  // 输出内容
  let opts = ''
  let fields = {'_id': 0, 'revisionInfo': 0}

  Team.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields)
}

// 通过doctor表中userId查询_id 2017-03-30 GY
// 修改：增加判断不存在ID情况 2017-04-05 GY
// 注释 输入，userId（要查询的doctorId）；输出，对应的doctorObject；目的，得到doctorObject._id
exports.getDoctorObject = function (req, res, next) {
  if (req.query.doctorId == null || req.query.doctorId === '') {
    return res.json({result: '请填写doctorId!'})
  }
  let query = {
    userId: req.query.doctorId
  }
  Doctor.getOne(query, function (err, doctor) {
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
}

// 通过team表中teamId查询teamObject 2017-03-30 GY
// 注释 输入，teamId，status，输出teamObject
exports.getTeamObject = function (req, res, next) {
  let teamId = req.query.teamId || null
  let status = req.query.status || null
  if (teamId == null) {
    return res.json({result: '请填写teamId!'})
  }
  if (status == null) {
    return res.json({result: '请填写status!'})
  }
  // var _status = req.query.status
  let query = {
    teamId: req.query.teamId
  }
    // req.body.status = _status;
  Team.getOne(query, function (err, team) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (team == null) {
      return res.json({result: '不存在的teamId!'})
    }
        // req.body.teamObject = team;
    req.obj = {
      teamObject: team,
      status: req.query.status
    }
    next()
  })
}

// 通过team表中teamId查询teamObject 2017-04-14 WF
// exports.getTeam = function (req, res, next) {
//   return res.json({results: req.obj.teamObject});;
// };

// 根据teamId和status获取团队病例列表
// 注释 承接groupObject，输出患者信息
exports.getGroupPatientList = function (req, res) {
  // 查询条件
  var teamObject = req.obj.teamObject
  // status在表中为数值类型，而从上一级传入的为字符串类型，需要转为数字，并且parseInt()后面的参数不可省略
  var _status = parseInt(req.obj.status, 10)
  var query = {teamId: teamObject._id, status: _status}

  var opts = ''
  var fields = {'_id': 0, 'revisionInfo': 0}
  // 通过子表查询主表，定义主表查询路径及输出内容
  var populate = {
    path: 'diseaseInfo patientId',
    select: {
      '_id': 0, 'revisionInfo': 0
    }
  }

  Consultation.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({results: item})
  }, opts, fields, populate)
}

// //
// exports.getDoctorInfo = function(req, res) {
//   //查询条件
//   var doctorObject = req.body.doctorObject;
//   var query = {doctorId:doctorObject._id};

//   var opts = '';
//   var fields = {'_id':0, 'time':1, 'content':1, 'doctorId':1, 'patientId':1};
//   //通过子表查询主表，定义主表查询路径及输出内容
//   var populate = {
//   path: 'doctorId patientId',
//   select: {
//   '_id':0,
//   'userId':1, 'name':1, 'workUnit':1, 'title':1, 'department':1, 'major':1,
//   'descirption':1, 'score':1, 'charge1':1, 'charge2':1, 'photoUrl':1, 'schedules':1
//   }
//   };

//   Comment.getSome(query, function(err, item) {
//   if (err) {
//         return res.status(500).send(err.errmsg);
//       }
//       res.json({results: item});
//   }, opts, fields, populate);
// }

// 获取医生User表信息 2017-06-15 GY
exports.getUserInfo = function (req, res, next) {
  var query = {userId: req.query.userId}
  User.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({result: '请重新注册'})
    } else {
      req.body.TDCticket = item.TDCticket
      next()
    }
  })
}

// 修改获取医生详细信息方法 2017-4-12 GY
// 注释 type 123是啥？
exports.getCount1AndCount2 = function (req, res, next) {
  let _doctorId = req.body.doctorObject._id
  let query = {doctorId: _doctorId}

  Counsel.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    let count1 = 0
    let count2 = 0
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].type === 1 || items[i].type === 3) {
        count1 += 1
      }
      if (items[i].type === 2 || items[i].type === 3) {
        count2 += 1
      }
    }
    req.count1 = count1
    req.count2 = count2
    next()
      // res.json({results: items, count:items.length});
  })
}

exports.getComments = function (req, res, next) {
  // 查询条件
  let doctorObject = req.body.doctorObject
  let query = {doctorId: doctorObject._id}

  let limit = Number(req.query.limit || null)
  let skip = Number(req.query.skip || null)

  let opts = {limit: limit, skip: skip, sort: '-_id'}
  let fields = {'_id': 0, 'revisionInfo': 0}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {
    path: 'patientId',
    select: {
      '_id': 0,
      'userId': 1,
      'name': 1,
      'photoUrl': 1
    }
  }

  let _Url = ''
  let userIdUrl = 'userId=' + req.query.userId
  let limitUrl = ''
  let skipUrl = ''

  if (limit !== 0) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip !== 0) {
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (userIdUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (userIdUrl !== '') {
      _Url = _Url + userIdUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  req.body.nexturl = webEntry.domain + ':' + webEntry.restPort + '/api/v2/doctor/getDoctorInfo' + _Url

  Comment.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      req.body.comments = items
    }
    next()
  }, opts, fields, populate)
}

// exports.getDoctorInfo = function(req, res){
//   var query = {userId: req.query.userId};
//   var comments = req.body.comments;

//   var opts = '';
//   var fields = {'_id':0, 'revisionInfo':0};
//   var populate = '';

//   Doctor.getOne(query, function (err, doctor) {
//         if (err) {
//             console.log(err);
//             return res.status(500).send('服务器错误, 用户查询失败!');
//         }
//         res.json({result:doctor, comments:comments});

//     }, opts, fields, populate);
// }
exports.getDoctorInfo = function (req, res) {
  let query = {userId: req.session.userId, role: 'doctor'}
  let comments = req.body.comments

  let newScore = 0
  if (comments.length !== 0) {
    let tempSum = 0
    for (let i = 0; i < comments.length; i++) {
      tempSum += comments[i].totalScore
    }
    newScore = tempSum / comments.length
  } else if (comments.length === 0) {
    newScore = 10
  }

  let upObj = {
    score: newScore,
    count1: req.count1,
    count2: req.count2
  }

  Alluser.updateOne(query, upObj, function (err, upDoctor) {
    if (err) {
      return res.status(422).send(err.message)
    }
  // console.log(req.body.TDCticket);
    if (req.body.TDCticket === undefined) {
      req.body.TDCticket = null
    }
  // console.log(req.body.TDCticket);
  // var DocInfo = upDoctor;
  // DocInfo['TDCticket'] = req.body.TDCticket;
  // console.log(DocInfo.TDCticket);
  // console.log(DocInfo);

    res.json({results: upDoctor, TDCticket: req.body.TDCticket, comments: comments, nexturl: req.body.nexturl})
  }, {new: true})
}

// 修改医生个人信息 2017-04-12 GY
// 如果姓名或头像字段被修改，同时修改team表中所有相应字段 2017-05-25 GY
exports.editDoctorDetail = function (req, res, next) {
  let query = {
    userId: req.session.userId,
    role: 'doctor'
  }

  let upObj = {
  // revisionInfo:{
  //   operationTime:new Date(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
  }
  if (req.body.certificatePhotoUrl != null || req.body.certificatePhotoUrl !== '' || req.body.certificatePhotoUrl !== undefined) {
    upObj['certificatePhotoUrl'] = req.body.certificatePhotoUrl
  }
  if (req.body.practisingPhotoUrl != null || req.body.practisingPhotoUrl !== '' || req.body.practisingPhotoUrl !== undefined) {
    upObj['practisingPhotoUrl'] = req.body.practisingPhotoUrl
  }
  if (req.body.name != null || req.body.name !== '' || req.body.name !== undefined) {
    upObj['name'] = req.body.name
  }
  if (req.body.photoUrl != null || req.body.photoUrl !== '' || req.body.photoUrl !== undefined) {
    upObj['photoUrl'] = req.body.photoUrl
  }
  if (req.body.birthday != null || req.body.birthday !== '' || req.body.birthday !== undefined) {
    upObj['birthday'] = new Date(req.body.birthday)
  }
  if (req.body.gender != null || req.body.gender !== '' || req.body.gender !== undefined) {
    upObj['gender'] = req.body.gender
  }
  if (req.body.IDNo != null || req.body.IDNo !== '' || req.body.IDNo !== undefined) {
    upObj['IDNo'] = req.body.IDNo
  }
  if (req.body.province != null || req.body.province !== '' || req.body.province !== undefined) {
    upObj['province'] = req.body.province
  }
  if (req.body.city != null || req.body.city !== '' || req.body.city !== undefined) {
    upObj['city'] = req.body.city
  }
  if (req.body.district != null || req.body.district !== '' || req.body.district !== undefined) {
    upObj['district'] = req.body.district
  }
  if (req.body.workUnit != null || req.body.workUnit !== '' || req.body.workUnit !== undefined) {
    upObj['workUnit'] = req.body.workUnit
  }
  if (req.body.title != null || req.body.title !== '' || req.body.title !== undefined) {
    upObj['title'] = req.body.title
  }
  if (req.body.job != null || req.body.job !== '' || req.body.job !== undefined) {
    upObj['job'] = req.body.job
  }
  if (req.body.department != null || req.body.department !== '' || req.body.department !== undefined) {
    upObj['department'] = req.body.department
  }
  if (req.body.major != null || req.body.major !== '' || req.body.major !== undefined) {
    upObj['major'] = req.body.major
  }
  if (req.body.description != null || req.body.description !== '' || req.body.description !== undefined) {
    upObj['description'] = req.body.description
  }
  if (req.body.charge1 != null || req.body.charge1 !== '' || req.body.charge1 !== undefined) {
    upObj['charge1'] = req.body.charge1
  }
  if (req.body.charge2 != null || req.body.charge2 !== '' || req.body.charge2 !== undefined) {
    upObj['charge2'] = req.body.charge2
  }

  // return res.json({query: query, upObj: upObj});
  Alluser.updateOne(query, upObj, function (err, upDoctor) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upDoctor == null) {
      return res.json({result: '修改失败，不存在的医生ID！'})
    } else {
      if (upObj.name != null || upObj.photoUrl != null) {
        req.body.editResults = upDoctor
        next()
      } else {
  // 没有修改name, photoUrl字段的情况
        return res.json({result: '修改成功', editResults: upDoctor})
      }
    }
  }, {new: true})
}
// 更新医生作为团队主管的团队信息并删除医生作为团队成员的相应团队中的成员条目
exports.updateTeamSponsor = function (req, res, next) {
  // console.log('updatename')
  var _userId = req.session.userId
  var upObj = {}
  if (req.body.name != null) {
    upObj['sponsorName'] = req.body.name
  }
  if (req.body.photoUrl != null) {
    upObj['sponsorPhoto'] = req.body.photoUrl
  }

  var querys = {sponsorId: _userId}
  var opts = {multi: true}
  Team.update(querys, upObj, function (err, upteam1) {
    if (err) {
      return res.status(500).send(err)
    } else {
      var querym = {'members.userId': _userId}
      Team.getSome(querym, function (err, items) {
        if (err) {
          return res.status(500).send(err)
        } else if (items.length === 0) {
  // sponsor包含的情况修改成功与否，并且未查询到members包含的情况，直接返回修改结果
          return res.json({result: '修改成功', editResults: req.body.editResults})
        } else {
  // 保存members包含的所有teamId
          req.body.teamIds = []
          for (var i = items.length - 1; i >= 0; i--) {
            req.body.teamIds[i] = items[i].teamId
          }
          var pullmember = {
            $pull: {
              members: {
                userId: _userId
              }
            }
          }
          Team.update(querym, pullmember, function (err, upteam2) {
            if (err) {
              return res.status(500).send(err)
            } else {
  // 删除成功
              req.body.pull = upteam2
              if (upteam2.n === upteam2.nModified) {
                next()
              } else {
                return res.json({removeResult: upteam2})
              }
            }
          }, opts)
        }
      })
    }
  }, opts)
}
// 添加医生作为团队成员的相应团队中的成员条目
exports.updateTeamMember = function (req, res) {
  // console.log(req.body.pull);
  let index = 0
  let pushMembers = function (upteamId) {
    let query = {teamId: upteamId}
    let upObj = {
      $push: {
        members: {
          userId: req.body.editResults.userId,
          name: req.body.editResults.name,
          photoUrl: req.body.editResults.photoUrl
        }
      }
    }
    Team.update(query, upObj, function (err, upteam3) {
      if (err) {
        return res.status(500).send(err)
      } else {
        if (index === req.body.teamIds.length - 1) {
          return res.json({result: '修改成功', editResults: req.body.editResults})
        }
        pushMembers(req.body.teamIds[++index])
  // console.log(index);
      }
    })
  }
  pushMembers(req.body.teamIds[index])
}

// 获取最近交流过的医生列表 2017-04-13 GY
// 按时间降序排列 2017-04-14 GY
exports.getRecentDoctorList = function (req, res) {
  // 查询条件
  let doctorObject = req.body.doctorObject
  let query = {doctorId: doctorObject._id}

  let opts = ''
  let fields = {'_id': 0, 'doctors': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {path: 'doctors.doctorId', select: {'_id': 0, 'revisionInfo': 0}}

  // 设置排序规则函数，时间降序
  function sortTime (a, b) {
    return b.lastTalkTime - a.lastTalkTime
  }

  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      // return res.json({result:'请先与其他医生或患者建立联系!'});
      var dpRelationData = {
        doctorId: req.body.doctorObject._id
    //   revisionInfo:{
  //   operationTime:new Date(),
  //   userId:"gy",
  //   userName:"gy",
  //   terminalIP:"10.12.43.32"
  // }
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
      // return res.json({result: '暂无患者2!'});
      })
      return res.json({results: {patients: []}})
    }
    res.json({results: item.doctors.sort(sortTime)})
  }, opts, fields, populate)
}

// 医生日程设置（排班） 承接session.userId，输入日期与时间，输出添加排班
exports.insertSchedule = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let _day = req.body.day || null
  let _time = req.body.time || null
  if (_day == null) {
    return res.json({msg: 'Please input schedule day!'})
  }
  if (_time == null) {
    return res.json({msg: 'Please input schedule time!'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  let upObj = {
    $addToSet: {
      schedules: {
        day: _day,
        time: _time
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Alluser.update(query, upObj, function (err, upDoctor) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (upDoctor.nModified === 0) {
      return res.json({msg: '未成功修改！请检查输入是否符合要求！', results: upDoctor})
    }
    if (upDoctor.nModified === 1) {
      return res.json({msg: '修改成功', results: upDoctor})
    }
    res.json({results: upDoctor})
  }, {new: true})
}

// 删除医生排班 承接session.userId，输入日期与时间，输出删除排班
exports.deleteSchedule = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let _day = req.body.day || null
  let _time = req.body.time || null
  if (_day == null) {
    return res.json({msg: 'Please input schedule day!'})
  }
  if (_time == null) {
    return res.json({msg: 'Please input schedule time!'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  let upObj = {
    $pull: {
      schedules: {
        day: _day,
        time: _time
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Alluser.update(query, upObj, function (err, updoct) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updoct.nModified === 0) {
      return res.json({msg: '未成功修改！请检查输入是否符合要求！', results: updoct})
    }
    if (updoct.nModified === 1) {
      return res.json({msg: '修改成功', results: updoct})
    }
    res.json({results: updoct})
  }, {new: true})
}

// 患者或医生获取医生排班 输入userId（医生），输出相应医生排班信息
exports.getSchedules = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId || null
  if (doctorId === null) {
    return res.json({msg: '请输入userId'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  let opts = ''
  let fields = {'_id': 0, 'schedules': 1}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields)
}

// 医生停诊设置 承接session.userId，输入停诊起止时间，输出结果，增加停诊信息
exports.insertSuspendTime = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let _start = req.body.start || null
  let _end = req.body.end || null
  if (_start == null) {
    return res.json({msg: 'Please input service-suspension start time!'})
  }
  if (_end == null) {
    return res.json({msg: 'Please input service-suspension end time!'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  let upObj = {
    $addToSet: {
      suspendTime: {
        start: new Date(_start),
        end: new Date(_end)
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Alluser.update(query, upObj, function (err, updoct) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updoct.nModified === 0) {
      return res.json({msg: '未成功修改！请检查输入是否符合要求！', results: updoct})
    }
    if (updoct.nModified === 1) {
      return res.json({msg: '修改成功', results: updoct})
    }
    res.json({results: updoct})
  }, {new: true})
}
// 医生停诊删除 承接session.userId，输入停诊起止时间，输出结果，增加停诊信息
exports.deleteSuspendTime = function (req, res) {
  // 查询条件
  let doctorId = req.session.userId
  let _start = req.body.start || null
  let _end = req.body.end || null
  if (_start == null) {
    return res.json({msg: 'Please input service-suspension start time!'})
  }
  if (_end == null) {
    return res.json({msg: 'Please input service-suspension end time!'})
  }
  let query = {userId: doctorId, role: 'doctor'}
  var upObj = {
    $pull: {
      suspendTime: {
        start: new Date(_start),
        end: new Date(_end)
      }
    }
  }
  // return res.json({query: query, upObj: upObj});
  Alluser.update(query, upObj, function (err, updoct) {
    if (err) {
      return res.status(422).send(err.message)
    }
    if (updoct.nModified === 0) {
      return res.json({msg: '未成功修改！请检查输入是否符合要求！', results: updoct})
    }
    if (updoct.nModified === 1) {
      return res.json({msg: '修改成功', results: updoct})
    }
    res.json({results: updoct})
  }, {new: true})
}

// 患者或医生获取医生停诊信息 输入userId（医生），输出结果，相应医生的停诊信息
exports.getSuspendTime = function (req, res) {
  // 查询条件
  let doctorId = req.query.userId
  let query = {userId: doctorId, role: 'doctor'}
  var opts = ''
  var fields = {'_id': 0, 'suspendTime': 1}

  Doctor.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({msg: '该医生无停诊信息'})
    }
    res.json({results: item})
  }, opts, fields)
}

// 获取在册医生数量
exports.getDocNum = function (req, res) {
  // 查询条件
  var query = {role: 'doctor'}
  Alluser.count(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

function sortVIPpinyin (a, b) {
  var flag = 0
  if (a.patientId == null) {
    a.patientId = {
      VIP: 0,
      name: ''
    }
  }
  if (b.patientId == null) {
    b.patientId = {
      VIP: 0,
      name: ''
    }
  }
  // console.log(a.patientId.VIP);
  if (a.patientId.VIP == null || a.patientId.VIP === undefined) {
    a.patientId.VIP = 0
  }
  if (b.patientId.VIP == null || a.patientId.VIP === undefined) {
    b.patientId.VIP = 0
  }
  if (b.patientId.VIP - a.patientId.VIP > 0) {
    flag = 1
  } else if (b.patientId.VIP - a.patientId.VIP < 0) {
    flag = -1
  } else {
    flag = pinyin.compare(a.patientId.name, b.patientId.name)
  }
  return flag
}

exports.checkDoctor = function (req, res, next) {
  if (req.query.doctorId == null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    if (req.body.doctorId == null || req.body.doctorId === '' || req.body.doctorId === undefined) {
      return res.json({result: '请填写doctorId!'})
    } else {
      req.doctorId = req.body.doctorId
    }
  } else {
    req.doctorId = req.query.doctorId
  }
  var query = {userId: req.doctorId}
  Doctor.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
      return res.json({result: '不存在的医生ID'})
    } else {
      next()
    }
  })
}

// 注释 承接session.userId，输出doctorObject
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

// 根据医生ID获取患者基本信息
// 注释 承接doctorObject，输入name，skip，limit，输出与相应绑定绑定的患者
exports.getPatientList = function (req, res) {
  // 查询条件
  let doctorObject = req.body.doctorObject
  let query = {doctorId: doctorObject._id}
  let _name = req.query.name || null
  let _skip = req.query.skip || null
  let _limit = req.query.limit || null
  if (_skip === null) {
    _skip = 0
  }
  let opts = ''
  let fields = {'_id': 0, 'patients.patientId': 1, 'patients.dpRelationTime': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {path: 'patients.patientId', select: {'_id': 0, 'revisionInfo': 0}}
  // if(_name!=""&&_name!=undefined){

  // }
  // 模糊搜索
  let nameReg = new RegExp(_name)
  if (_name) {
    populate['match'] = {'name': nameReg}
  }
  console.log(populate)
  // console.log(query);
  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item == null) {
    // return res.json({result:'请先与其他医生或患者建立联系!'});
      var dpRelationData = {
        doctorId: req.body.doctorObject._id,
        revisionInfo: {
          operationTime: new Date(),
          userId: 'gy',
          userName: 'gy',
          terminalIP: '10.12.43.32'
        }
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
      // return res.json({result: '暂无患者2!'});
      })
      return res.json({results: {patients: []}})
    } else {
      var patients = []
        // console.log(item);
        // item.patients=item.patients.sort(sortVIPpinyin);

      for (var i = 0; i < item.patients.length; i++) {
        // console.log(item.patients[i]);
        if (item.patients[i].dpRelationTime === null || item.patients[i].dpRelationTime === '' || item.patients[i].dpRelationTime === undefined) {
          item.patients[i].dpRelationTime = new Date('2017-05-15')
        }
        // if((item.patients[i].patientId!=null)&&(item.patients[i].patientId.name==_name||_name===""||_name==undefined)){
        if (item.patients[i].patientId != null) {
          if (_skip > 0) {
            _skip--
          } else {
            if (_limit === null) {
              patients.push(item.patients[i])
            } else {
              if (_limit > 0) {
                patients.push(item.patients[i])
                _limit--
              }
            }
          }
        }
      }
      patients = patients.sort(sortVIPpinyin)
      let item1 = {'patients': patients}

      // 2017-06-07GY调试用
      // console.log({method:'getPatientList', resultCount:patients.length});

      res.json({results: item1})
    }
  }, opts, fields, populate)
  // });
}

// 根据医生ID获取医生某日新增患者列表 2017-04-18 GY
// 是不是可以和getPatientList合并？？？
exports.getPatientByDate = function (req, res) {
  // 查询条件
  var doctorObject = req.body.doctorObject
  var query = {doctorId: doctorObject._id}

  // 模糊搜索GY
  var _name = req.query.name
  var date
  if (req.query.date != null && req.query.date !== '') {
    date = new Date(req.query.date)
    date = commonFunc.convertToFormatDate(date)
  } else {
    date = commonFunc.getNowFormatDate()
  }
  // return res.json({result:date});

  var opts = ''
  var fields = {'_id': 0, 'patients': 1}
  // 通过子表查询主表，定义主表查询路径及输出内容
  var populate = {path: 'patients.patientId', select: {'_id': 0, 'revisionInfo': 0}}

  if (_name) {
    populate['match'] = {'name': new RegExp(_name)}
  }

  DpRelation.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }

    if (item == null) {
    // return res.json({result:'请先与其他医生或患者建立联系!'});
      var dpRelationData = {
        doctorId: req.body.doctorObject._id,
        revisionInfo: {
          operationTime: new Date(),
          userId: 'gy',
          userName: 'gy',
          terminalIP: '10.12.43.32'
        }
      }
      // return res.json({result:dpRelationData});
      var newDpRelation = new DpRelation(dpRelationData)
      newDpRelation.save(function (err, dpRelationInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
      // return res.json({result: '暂无患者2!'});
      })
      return res.json({result: '暂无患者!'})
    }

    var patientsitem = []
    var dpTimeFormat = null
    var j = 0
    if (item.patients.length === 0) {
      return res.json({result: '暂无患者!'})
    } else if (item.patients.length !== 0) {
      for (var i = item.patients.length - 1; i >= 0; i--) {
        if (item.patients[i].patientId != null) {
          if (item.patients[i].dpRelationTime === undefined || item.patients[i].dpRelationTime == null || item.patients[i].dpRelationTime === '') {
            item.patients[i].dpRelationTime = new Date('2017-05-15')
          }
          dpTimeFormat = commonFunc.convertToFormatDate(item.patients[i].dpRelationTime)
          if (dpTimeFormat === date) {
            patientsitem[j] = item.patients[i]
            j++
          }
        }
      }

      patientsitem = patientsitem.sort(sortVIPpinyin)
    }

      // 2017-06-07GY调试用
      // console.log({method:'getPatientByDate', resultCount:patientsitem.length});

    res.json({results2: patientsitem})
  }, opts, fields, populate)
}

// 修改用户支付宝账号 2017-06-16 GY
// 注释 医生修改绑定的支付宝账号信息 输入，aliPayAccount，输出，支付宝账号更新
exports.editAliPayAccount = function (req, res) {
  let query = {userId: req.session.userId}
  let upObj = {aliPayAccount: req.body.aliPayAccount}
  let opts = {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}

  Alluser.updateOne(query, upObj, function (err, upDoctor) {
    if (err) {
      return res.status(400).send(err)
    }
    return res.json({results: '修改成功', editResult: upDoctor.aliPayAccount})
  }, opts)
}

// 获取用户支付宝账号 2017-06-16 GY
// 注释 医生获取自己绑定的支付宝账号信息 承接session.userId；输出，支付宝账号信息
exports.getAliPayAccount = function (req, res) {
  let query = {userId: req.session.userId}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    if (item == null) {
      return res.status(400).send('不存在的医生')
    } else {
      if (item.aliPayAccount === undefined) {
        return res.json({results: ''})
      } else {
        return res.json({results: item.aliPayAccount})
      }
    }
  })
}
