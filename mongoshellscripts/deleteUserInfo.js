
var dbUrl = '121.43.107.106:28000/cdmis'
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
var userTeamId
var queryId = {'userId': userId}
// print('userRole', userRole[0] === 'patient')
// db.collection.remove( <query>, <justOne default false> )

// for (let i = 0; i < userRole.length; i++) {
//   if (userRole[i] === 'patient') {}
//   if (userRole[i] === 'doctor') {}
// }

// 删除患者
if (userRole[0] === 'patient') {
  query = {
    'userId': userId
    // 'type': 'week',
    // 'time': '201705_2'
    // 'itemType': 'Vol'
  }
  // db.reports.remove(query)
  // db.accounts.remove(query)
  // db.advices.remove(query)
  query = {'patientId': userObjectId}
  // db.comments.remove(query)
  query = {
    '$or': [
      {'sendBy': userId},
      {'receiver': userId}
    ]
  }
  // db.communications.remove(query)
  // db.messages.remove(query)
  // db.news.remove(query)
  query = {'userId': userId}
  // db.compliances.remove(query)
  query = {'patientId': userObjectId}
  // db.consultations.remove(query)
  // db.counsels.remove(query)
  // db.counselautochangestatuses.remove(query)
  // db.doctorsincharges.remove(query)
  query = {'userId': userId}
  // db.devices.remove(query)
  let favoriteDoctorsList = user[0].doctors // 患者关注的医生列表
  for (let i = 0; i < favoriteDoctorsList.length; i++) {
    query = {'doctorId': favoriteDoctorsList[i].doctorId}
    let upObj = {
      $pull: {
        patients: {
          patientId: userObjectId
        },
        patientsInCharge: {
          patientId: userObjectId
        }
      }
    }
    // db.dprelations.update(query, upObj)
  }
  query = {'patientId': userId}
  db.insurancemsgs.remove(query)
  query = {'userId': userId}
  db.healthinfos.remove(query)
  db.labtestimports.remove(query)
  db.orders.remove(query)
  db.tasks.remove(query)
  query = {'patientOpenId': userOpenId}
  db.openids.remove(query)
  query = {'patientId': userObjectId}
  db.personaldiags.remove(query)
  db.vitalsigns.remove(query)
  // v2 alluser
  query = {
    'userId': userId,
    'role': 'patient'
  }
  db.allusers.remove(query, true)
  // v1 user patient doctor
}

// 删除医生
if (userRole[0] === 'doctor') {
  // 删除患者中关注该医生的记录，以及与其他医生的记录
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

  query = {}
  let upObj = {
    $pull: {
      times: {
        'doctorId': userId
      }
    }
  }
  db.accounts.update(query, upObj)

  query = {'userId': userId}
  db.advices.remove(query)

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
  db.news.remove(query)

  query = {'patientId': userObjectId}
  db.counsels.remove(query)
  db.counselautochangestatuses.remove(query)

  // 如果医生为团队发起人,则删除表，其他医生团队成员不需要修改
  query = {'sponsorId': userObjectId}
  db.consultations.remove(query)
  query = {}
  upObj = {
    $pull: {
      'portleader': userObjectId,
      'doctors': userObjectId,
      'departLeader': userObjectId
    }
  }
  db.departments.update(query, upObj)

  query = {'doctorId': userObjectId}
  db.dprelations.remove(query)
  db.personaldiags.remove(query)

  query = {'doctorId': userId}
  db.insurancemsgs.remove(query)
  db.orders.remove(query)

  query = {'doctorUserId': userId}
  db.openids.remove(query)
  db.doctorsincharges.remove(query)

  query = {'sponsorId': userId}
  db.teams.remove(query)

  query = {}
  upObj = {
    $pull: {
      members: {
        'userId': userId
      }
    }
  }
  db.teams.update(query, upObj)

  // v2 alluser
  query = {
    'userId': userId,
    'role': 'doctor'
  }
  db.allusers.remove(query, true)
}
