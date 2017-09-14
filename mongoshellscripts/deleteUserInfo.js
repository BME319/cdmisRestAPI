
// var dbUrl = '121.43.107.106:28000/cdmis'
var dbUrl = 'localhost:27017/cdmis' // myMongoDB调试
// var dbUrl = 'localhost:27018/cdmis' // 本地代码调试
// var dbUrl = 'localhost:28000/cdmis' // 服务器代码调试
print(dbUrl)
db = connect(dbUrl)
// db.auth('rest', 'zjubme319')

var query = {'userId': 'U201708170004'}
var fields = ''
var user = db.allusers.find(query, fields).toArray()
if (user.length === 0) {
  printjson({'result': 'delete_fail, alluser do not exist'})
} else {
  var userObjectId = user[0]._id
  var userId = user[0].userId
  var userOpenId = user[0].openId
  var userRole = user[0].role
  var userName = user[0].name
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
    let reportResult = db.reports.remove(query)
    printjson({'result': 'delete_success', 'model': 'report', 'delete_item': reportResult})
    let accountResult = db.accounts.remove(query)
    printjson({'result': 'delete_success', 'model': 'account', 'delete_item': accountResult})

    query = {'userId': userId, 'role': 'patient'}
    let apiRecordResult = db.apiRecords.remove(query)
    printjson({'result': 'delete_success', 'model': 'apiRecord', 'delete_item': apiRecordResult})
    let adviceResult = db.advices.remove(query)
    printjson({'result': 'delete_success', 'model': 'advice', 'delete_item': adviceResult})

    query = {'patientId': userObjectId}
    let commentResult = db.comments.remove(query)
    printjson({'result': 'delete_success', 'model': 'comment', 'delete_item': commentResult})

    query = {
      '$or': [
        {'sendBy': userId},
        {'receiver': userId}
      ]
    }
    let communicationResult = db.communications.remove(query)
    printjson({'result': 'delete_success', 'model': 'communication', 'delete_item': communicationResult})
    let messageResult = db.messages.remove(query)
    printjson({'result': 'delete_success', 'model': 'message', 'delete_item': messageResult})

    query = {
      '$or': [
        {'sendBy': userId},
        {'receiver': userId, userRole: 'patient'}
      ]
    }
    let newResult = db.news.remove(query)
    printjson({'result': 'delete_success', 'model': 'new', 'delete_item': newResult})

    query = {'userId': userId}
    let complianceResult = db.compliances.remove(query)
    printjson({'result': 'delete_success', 'model': 'compliance', 'delete_item': complianceResult})

    query = {'patientId': userObjectId}
    let consultationResult = db.consultations.remove(query)
    printjson({'result': 'delete_success', 'model': 'consultation', 'delete_item': consultationResult})
    let counselResult = db.counsels.remove(query)
    printjson({'result': 'delete_success', 'model': 'counsel', 'delete_item': counselResult})
    let counselautochangestatusResult = db.counselautochangestatuses.remove(query)
    printjson({'result': 'delete_success', 'model': 'counselautochangestatus', 'delete_item': counselautochangestatusResult})

    let myDoctor = db.doctorsincharges.find({'patientId': userObjectId}, fields).toArray()
    let doctorsinchargeResult = db.doctorsincharges.remove(query)
    printjson({'result': 'delete_success', 'model': 'doctorsincharge', 'delete_item': doctorsinchargeResult})

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
    }
    printjson({'result': 'delete_success', 'model': 'dprelation_patientsInCharge', 'delete_item': myDoctor.length})

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
    }
    printjson({'result': 'delete_success', 'model': 'dprelation_patients', 'delete_item': favoriteDoctorsList.length})

    query = {'userId': userId}
    let deviceResult = db.devices.remove(query)
    printjson({'result': 'delete_success', 'model': 'device', 'delete_item': deviceResult})

    query = {'patientId': userId}
    let insurancemsgResult = db.insurancemsgs.remove(query)
    printjson({'result': 'delete_success', 'model': 'insurancemsg', 'delete_item': insurancemsgResult})

    query = {'userId': userId}
    let healthinfoResult = db.healthinfos.remove(query)
    printjson({'result': 'delete_success', 'model': 'healthinfo', 'delete_item': healthinfoResult})
    let labtestimportResult = db.labtestimports.remove(query)
    printjson({'result': 'delete_success', 'model': 'labtestimport', 'delete_item': labtestimportResult})
    let orderResult = db.orders.remove(query)
    printjson({'result': 'delete_success', 'model': 'order', 'delete_item': orderResult})
    let taskResult = db.tasks.remove(query)
    printjson({'result': 'delete_success', 'model': 'task', 'delete_item': taskResult})

    query = {'patientOpenId': userOpenId}
    let openidResult = db.openids.remove(query)
    printjson({'result': 'delete_success', 'model': 'openid', 'delete_item': openidResult})

    query = {'patientId': userObjectId}
    let personaldiagResult = db.personaldiags.remove(query)
    printjson({'result': 'delete_success', 'model': 'personaldiag', 'delete_item': personaldiagResult})
    let policyResult = db.policies.remove(query)
    printjson({'result': 'delete_success', 'model': 'policy', 'delete_item': policyResult})
    let vitalsignResult = db.vitalsigns.remove(query)
    printjson({'result': 'delete_success', 'model': 'vitalsign', 'delete_item': vitalsignResult})
  }

  // 删除医生
  if (userRole.indexOf('doctor') !== -1) {
    query = {'doctorId': userObjectId}
    let doctor = db.dprelations.find(query, fields).toArray()
    if (doctor.length !== 0) {
      let patientsList = doctor[0].patients
      let doctorsList = doctor[0].doctors
      // 删除患者中关注该医生的记录
      for (let i = 0; i < patientsList.length; i++) {
        query = {
          '_id': patientsList[i].patientId,
          'role': 'patient'
        }
        let upObj = {
          $pull: {
            doctors: {
              doctorId: userObjectId
            }
          }
        }
        db.allusers.update(query, upObj)
        printjson({'result': 'delete_success', 'model': 'dprelation_patients', 'delete_item': patientsList[i].patientId})
      }
      // 删除其他医生与该医生的记录
      for (let i = 0; i < doctorsList.length; i++) {
        query = {
          'doctorId': doctorsList[i].doctorId
        }
        let upObj = {
          $pull: {
            doctors: {
              doctorId: userObjectId
            }
          }
        }
        db.dprelations.update(query, upObj)
        printjson({'result': 'delete_success', 'model': 'dprelation_doctors', 'delete_item': patientsList[i].doctorId})
      }
    }
    // 删除该医生所有医患关系记录
    query = {'doctorId': userObjectId}
    let dprelationResult = db.dprelations.remove(query)
    printjson({'result': 'delete_success', 'model': 'dprelation', 'delete_item': dprelationResult})
    let doctorsinchargeResult = db.doctorsincharges.remove(query)
    printjson({'result': 'delete_success', 'model': 'doctorsincharge', 'delete_item': doctorsinchargeResult})

    query = {}
    let upObj = {
      $pull: {
        times: {
          'doctorId': userId
        }
      }
    }
    let accountResult = db.accounts.update(query, upObj, {multi: true}) // 删除患者中的咨询该医生的记录
    printjson({'result': 'update_success', 'model': 'account', 'delete_item': accountResult})

    query = {'userId': userId}
    accountResult = db.accounts.remove(query)        // 删除医生账户，存在问题，患者和医生共用一个账户，没有role区分
    printjson({'result': 'delete_success', 'model': 'account', 'delete_item': accountResult})

    query = {'userId': userId, 'role': 'doctor'}
    let apiRecordResult = db.apiRecords.remove(query)
    printjson({'result': 'delete_success', 'model': 'apiRecord', 'delete_item': apiRecordResult})
    let adviceResult = db.advices.remove(query)
    printjson({'result': 'delete_success', 'model': 'advice', 'delete_item': adviceResult})

    query = {'doctorId': userObjectId}
    let commentResult = db.comments.remove(query)
    printjson({'result': 'delete_success', 'model': 'comment', 'delete_item': commentResult})

    query = {
      '$or': [
        {'sendBy': userId},
        {'receiver': userId}
      ]
    }
    let communicationResult = db.communications.remove(query)
    printjson({'result': 'delete_success', 'model': 'communication', 'delete_item': communicationResult})
    let messageResult = db.messages.remove(query)
    printjson({'result': 'delete_success', 'model': 'message', 'delete_item': messageResult})

    query = {
      '$or': [
        {'sendBy': userId},
        {'receiver': userId, userRole: 'doctor'}
      ]
    }
    let newResult = db.news.remove(query)
    printjson({'result': 'delete_success', 'model': 'new', 'delete_item': newResult})

    query = {'doctorId': userObjectId}
    let counselResult = db.counsels.remove(query)
    printjson({'result': 'delete_success', 'model': 'counsel', 'delete_item': counselResult})
    let counselautochangestatusResult = db.counselautochangestatuses.remove(query)
    printjson({'result': 'delete_success', 'model': 'counselautochangestatus', 'delete_item': counselautochangestatusResult})

    // 如果医生为团队发起人,则删除表，其他医生团队成员不需要修改
    query = {'sponsorId': userObjectId}
    let consultationResult = db.consultations.remove(query)
    printjson({'result': 'delete_success', 'model': 'consultation', 'delete_item': consultationResult})

    // let district = user[0].district
    // let department = user[0].department
    // let workUnit = user[0].workUnit
    query = {
      // 'district': district,
      // 'department': department,
      // 'hospital': workUnit
      $or: [
        {'portleader': userObjectId},
        {'doctors': userObjectId},
        {'departLeader': userObjectId}
      ]
    }
    upObj = {
      $pull: {
        'portleader': userObjectId,
        'doctors': userObjectId,
        'departLeader': userObjectId
      }
    }
    let departmentResult = db.departments.update(query, upObj, {multi: true})
    printjson({'result': 'delete_success', 'model': 'department', 'delete_item': departmentResult})

    query = {'doctorId': userObjectId}
    let personaldiagResult = db.personaldiags.remove(query)
    printjson({'result': 'delete_success', 'model': 'personaldiag', 'delete_item': personaldiagResult})

    query = {'doctorId': userId}
    let insurancemsgResult = db.insurancemsgs.remove(query)
    printjson({'result': 'delete_success', 'model': 'insurancemsg', 'delete_item': insurancemsgResult})
    let orderResult = db.orders.remove(query)
    printjson({'result': 'delete_success', 'model': 'order', 'delete_item': orderResult})

    query = {'doctorUserId': userId}
    let openidResult = db.openids.remove(query)
    printjson({'result': 'delete_success', 'model': 'openid', 'delete_item': openidResult})

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
    let reportResult = db.reports.update(query, upObj, {multi: true})
    printjson({'result': 'delete_success', 'model': 'report', 'delete_item': reportResult})

    // 若该医生为team sponsor，删除该团队，并且删除该团队的群聊天记录
    query = {'sponsorId': userId}
    let teamId = db.teams.find(query, fields).toArray()
    for (let i = 0; i < teamId.length; i++) {
      db.communications.remove({'receiver': teamId[i].teamId})
      printjson({'result': 'delete_success', 'model': 'communication', 'delete_item': teamId[i].teamId})
    }
    let teamResult = db.teams.remove(query)
    printjson({'result': 'delete_success', 'model': 'team', 'delete_item': teamResult})

    // 若为其他成员，则在team中删除该成员
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
    teamResult = db.teams.update(query, upObj, {multi: true})
    printjson({'result': 'update_success', 'model': 'team', 'delete_item': teamResult})
  }

  // v2 alluser
  query = {'userId': userId}
  db.allusers.remove(query, true)
  printjson({'result': 'delete_success', 'model': 'alluser', 'delete_item': userName})

  // v1 user patient doctor
}
