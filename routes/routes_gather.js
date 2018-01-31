var version = '/api/gather'

// middlewares
var getNoMid = require('../middlewares/getNoMid')
var traceRecord = require('../middlewares/traceRecord')
var errorHandler = require('../middlewares/errorHandler')

// controllers

var alluserCtrl = require('../controllers_to_gather/alluser_controller')
var counselCtrl = require('../controllers_to_gather/counsel_controller')
var serviceCtrl = require('../controllers_to_gather/service_controller')
var forumCtrl = require('../controllers_to_gather/forum_controller')
var healthInfoCtrl = require('../controllers_to_gather/healthInfo_controller')
var labtestCtrl = require('../controllers_to_gather/labtestImport_controller')
var vitalSignCtrl = require('../controllers_to_gather/vitalSign_controller')
var communicationCtrl = require('../controllers_to_gather/communication_controller')
var patientCtrl = require('../controllers_to_gather/patient_controller')
var taskCtrl = require('../controllers_to_gather/task_controller')
var complianceCtrl = require('../controllers_to_gather/compliance_controller')

module.exports = function (app, webEntry, acl) {
  // YQC
  app.post(version + '/doctor/groupPatient', alluserCtrl.groupPatient)
  app.post(version + '/alluser/alluser', alluserCtrl.updateAlluser(acl))
  app.post(version + '/counsel/questionnaire', counselCtrl.saveQuestionnaire)
  app.post(version + '/counsel/commentScore', counselCtrl.insertCommentScore)
  app.post(version + '/patient/doctorInCharge', serviceCtrl.addDIC)
  app.post(version + '/patient/cancelDoctorInCharge', serviceCtrl.cancelDIC)
  app.post(version + '/patient/favoriteDoctor', serviceCtrl.favoriteDoctor)
  app.post(version + '/patient/unfollowFavoriteDoctor', serviceCtrl.unfollowFavoriteDoctor)

  // JYF
  app.post(version + '/forum/posting', forumCtrl.forumPosting)
  app.post(version + '/forum/deletepost', forumCtrl.deletePost)
  app.post(version + '/forum/favorite', forumCtrl.forumFavorite)
  app.post(version + '/forum/deletefavorite', forumCtrl.deleteFavorite)
  app.post(version + '/forum/comment', forumCtrl.forumComment)

  app.post(version + '/healthInfo/healthInfo', healthInfoCtrl.insertHealthInfo)
  app.post(version + '/healthInfo/deleteHealthDetail', healthInfoCtrl.deleteHealthInfo)
  app.post(version + '/labtestImport', labtestCtrl.insertLabtest)
  app.post(version + '/labtestImport/edit', labtestCtrl.editLabtest)
  app.post(version + '/vitalSign/vitalSign', vitalSignCtrl.insertvitalSign)

  // lgf
  // 新建/更新用户任务
  app.post(version + '/tasks/task', errorHandler.allError, taskCtrl.pUserIDbyPhone, taskCtrl.checkTask, taskCtrl.updateTask, traceRecord.traceRecord('tasks/task'))
  // 新建/更新任务执行情况
  app.post(version + '/compliance/compliance', errorHandler.allError, complianceCtrl.pUserIDbyPhone, complianceCtrl.getCompliance, complianceCtrl.updateCompliance, traceRecord.traceRecord('compliance/compliance'))
  // 新建团队
  app.post(version + '/communication/team', errorHandler.allError, communicationCtrl.dUserIDbyPhone, communicationCtrl.newTeam, traceRecord.traceRecord('communication/team'))
  // 添加团队成员
  app.post(version + '/communication/insertMember', errorHandler.allError, communicationCtrl.dUserIDbyPhone, communicationCtrl.insertMember, communicationCtrl.updateNumber, traceRecord.traceRecord('communication/insertMember'))
  // 移除团队成员
  app.post(version + '/communication/removeMember', errorHandler.allError, communicationCtrl.dUserIDbyPhone, communicationCtrl.removeMember, communicationCtrl.updateNumber, traceRecord.traceRecord('communication/removeMember'))
  // 根据ID及type存储交流记录
  app.post(version + '/communication/communication', errorHandler.allError, communicationCtrl.userIDbyPhone, communicationCtrl.receiverIDbyPhone, getNoMid.getNo(8), communicationCtrl.postCommunication, traceRecord.traceRecord('communication/communication'))
  // 医生群发患者消息
  app.post(version + '/communication/massToPatient', errorHandler.allError, communicationCtrl.dUserIDbyPhone, communicationCtrl.getMassTargets, communicationCtrl.massCommunication, traceRecord.traceRecord('communication/massToPatient'))
  // 添加诊断信息
  app.post(version + '/patient/diagnosis', errorHandler.allError, patientCtrl.dpUserIDbyPhone, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail, traceRecord.traceRecord('patient/diagnosis'))
}
