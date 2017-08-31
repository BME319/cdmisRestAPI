
// var dbUrl = '121.43.107.106:28000/cdmis'
// var dbUrl = 'localhost:27018/cdmis' // 本地代码调试
var dbUrl = 'localhost:28000/cdmis' // 服务器代码调试
print(dbUrl)
db = connect(dbUrl)
db.auth('rest', 'zjubme319')

var query = {'userId': 'U201701241752'}
var fields = ''
var user = db.allusers.find(query, fields).toArray()
// if (user.length === 0) {
//   return 0
// }
var userObjectId = user[0]._id
var userId = user[0].userId
var userOpenId = user[0].openId
var userRole = user[0].role
// var userTeamId

// print('userRole', userRole[0] === 'patient')
// db.collection.remove( <query>, <justOne default false> )

// for (let i = 0; i < userRole.length; i++) {
//   if (userRole[i] === 'patient') {}
//   if (userRole[i] === 'doctor') {}
// }

// 删除患者
if (userRole.indexOf('patient') !== -1) {
  query = {'userId': userId}
  db.reports.remove(query)
  printjson({'result': 'delete_success', 'model': 'report', 'delete_item': ''})

  db.accounts.remove(query)
  printjson({'result': 'delete_success', 'model': 'account', 'delete_item': ''})

  db.advices.remove(query)
  printjson({'result': 'delete_success', 'model': 'advice', 'delete_item': ''})

  query = {'userId': userId, 'role': 'patient'}
  db.apiRecords.remove(query)
  printjson({'result': 'delete_success', 'model': 'apiRecord', 'delete_item': ''})

  query = {'patientId': userObjectId}
  db.comments.remove(query)
  printjson({'result': 'delete_success', 'model': 'comment', 'delete_item': ''})

  query = {
    '$or': [
      {'sendBy': userId},
      {'receiver': userId}
    ]
  }
  db.communications.remove(query)
  printjson({'result': 'delete_success', 'model': 'communication', 'delete_item': ''})

  db.messages.remove(query)
  printjson({'result': 'delete_success', 'model': 'message', 'delete_item': ''})

  query = {
    '$or': [
      {'sendBy': userId},
      {'receiver': userId, userRole: 'patient'}
    ]
  }
  db.news.remove(query)
  printjson({'result': 'delete_success', 'model': 'new', 'delete_item': ''})

  query = {'userId': userId}
  db.compliances.remove(query)
  printjson({'result': 'delete_success', 'model': 'compliance', 'delete_item': ''})

  query = {'patientId': userObjectId}
  db.consultations.remove(query)
  printjson({'result': 'delete_success', 'model': 'consultation', 'delete_item': ''})

  db.counsels.remove(query)
  printjson({'result': 'delete_success', 'model': 'counsel', 'delete_item': ''})

  db.counselautochangestatuses.remove(query)
  printjson({'result': 'delete_success', 'model': 'counselautochangestatuse', 'delete_item': ''})

  let myDoctor = db.doctorsincharges.find({'patientId': userObjectId, 'invalidFlag': 1}, fields).toArray()
  db.doctorsincharges.remove(query)
  printjson({'result': 'delete_success', 'model': 'doctorsincharge', 'delete_item': ''})

  for (let i = 0; i < myDoctor.length; i++) {
    query = {'doctorId': myDoctor[i].doctorId}
    let upObj = {
      $pull: {
        patientsInCharge: {
          patientId: userObjectId
        }
      }
    }
    db.dprelations.update(query, upObj)     // 删除该患者在主管医生中的当前和历史申请记录
    printjson({'result': 'delete_success', 'model': 'dprelation_patientsInCharge', 'delete_item': ''})
  }

  let favoriteDoctorsList = user[0].doctors // 患者关注的医生列表
  for (let i = 0; i < favoriteDoctorsList.length; i++) {
    query = {'doctorId': favoriteDoctorsList[i].doctorId}
    let upObj = {
      $pull: {
        patients: {
          patientId: userObjectId
        }
      }
    }
    db.dprelations.update(query, upObj)
    printjson({'result': 'delete_success', 'model': 'dprelation_patients', 'delete_item': ''})
  }

  query = {'userId': userId}
  db.devices.remove(query)

  query = {'patientId': userId}
  db.insurancemsgs.remove(query)
  printjson({'result': 'delete_success', 'model': 'insurancemsg', 'delete_item': ''})

  query = {'userId': userId}
  db.healthinfos.remove(query)
  printjson({'result': 'delete_success', 'model': 'healthinfo', 'delete_item': ''})

  db.labtestimports.remove(query)
  printjson({'result': 'delete_success', 'model': 'labtestimport', 'delete_item': ''})

  db.orders.remove(query)
  printjson({'result': 'delete_success', 'model': 'order', 'delete_item': ''})

  db.tasks.remove(query)
  printjson({'result': 'delete_success', 'model': 'task', 'delete_item': ''})

  query = {'patientOpenId': userOpenId}
  db.openids.remove(query)
  printjson({'result': 'delete_success', 'model': 'openid', 'delete_item': ''})

  query = {'patientId': userObjectId}
  db.personaldiags.remove(query)
  printjson({'result': 'delete_success', 'model': 'personaldiag', 'delete_item': ''})

  db.vitalsigns.remove(query)
  printjson({'result': 'delete_success', 'model': 'vitalsign', 'delete_item': ''})

  // v2 alluser
  query = {
    'userId': userId,
    'role': 'patient'
  }
  db.allusers.remove(query, true)
  printjson({'result': 'delete_success', 'model': 'alluser', 'delete_item': ''})

  // v1 user patient doctor
}

// 删除医生
if (userRole.indexOf('doctor') !== -1) {
  // 删除患者中关注该医生的记录，以及该医生与其他医生的记录
  query = {'doctorId': userObjectId}
  let doctor = db.dprelations.find(query).toArray()
  let patientsList = doctor[0].patients
  let doctorsList = doctor[0].doctors
  for (let i = 0; i < patientsList.length; i++) {
    query = {
      'userId': patientsList[i].patientId,
      'role': 'patient'
    }
    let upObj = {
      $pull: {
        doctors: {
          doctorId: userId
        }
      }
    }
    db.allusers.update(query, upObj)
  }

  for (let i = 0; i < doctorsList.length; i++) {
    query = {
      'userId': doctorsList[i].doctorId
    }
    let upObj = {
      $pull: {
        doctors: {
          doctorId: userId
        }
      }
    }
    db.dprelations.update(query, upObj)
  }

  query = {'doctorId': userObjectId}
  db.dprelations.remove(query)

  query = {}
  let upObj = {
    $pull: {
      times: {
        'doctorId': userId
      }
    }
  }
  db.accounts.update(query, upObj, {multi: true}) // 删除患者中的咨询该医生的记录

  query = {'userId': userId}
  db.accounts.remove(query)        // 删除医生账户，存在问题，患者和医生共用一个账户，没有role区分

  db.advices.remove(query)

  query = {'userId': userId, 'role': 'doctor'}
  db.apiRecords.remove(query)

  query = {'doctorId': userObjectId}
  db.comments.remove(query)

  query = {
    '$or': [
      {'sendBy': userId},
      {'receiver': userId}
    ]
  }
  db.communications.remove(query)
  db.messages.remove(query)

  query = {
    '$or': [
      {'sendBy': userId},
      {'receiver': userId, userRole: 'doctor'}
    ]
  }
  db.news.remove(query)

  query = {'patientId': userObjectId}
  db.counsels.remove(query)
  db.counselautochangestatuses.remove(query)

  // 如果医生为团队发起人,则删除表，其他医生团队成员不需要修改
  query = {'sponsorId': userObjectId}
  db.consultations.remove(query)

  let district = user[0].district
  let department = user[0].department
  let workUnit = user[0].workUnit
  query = {
    'district': district,
    'department': department,
    'hospital': workUnit
  }
  upObj = {
    $pull: {  // pull不知道是否可以同时删除多个数组中的元素？
      '$or': [
        {'portleader': userObjectId},
        {'doctors': userObjectId},
        {'departLeader': userObjectId}
      ]
    }
  }
  db.departments.update(query, upObj, {multi: true})

  query = {'doctorId': userObjectId}
  db.doctorsincharges.remove(query)
  db.personaldiags.remove(query)

  query = {'doctorId': userId}
  db.insurancemsgs.remove(query)
  db.orders.remove(query)

  query = {'doctorUserId': userId}
  db.openids.remove(query)

  query = {
    '$or': [
      {'doctorReport.doctorId': userObjectId},
      {'doctorComment.doctorId': userObjectId}
    ]
  }
  upObj = {
    $pull: {
      doctorReport: {
        'doctorId': userObjectId
      },
      doctorComment: {
        'doctorId': userObjectId
      }
    }
  }
  db.reports.update(query, upObj, {multi: true})

  query = {'sponsorId': userId}
  db.teams.remove(query)

  query = {'members.userId': userId}
  upObj = {
    $pull: {
      members: {
        'userId': userId
      }
    },
    $inc: {
      number: -1
    }
  }
  db.teams.update(query, upObj, {multi: true})

  // v2 alluser
  query = {
    'userId': userId,
    'role': 'doctor'
  }
  db.allusers.remove(query, true)
}
