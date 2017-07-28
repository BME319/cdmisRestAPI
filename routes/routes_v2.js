
// global var
var version = '/api/v2'

// 3rd packages

// self-defined configurations
// var config = require('../config')

// models
var Wechat = require('../models/wechat')

// middlewares
var getNoMid = require('../middlewares/getNoMid')
var tokenManager = require('../middlewares/tokenManager')
var aclChecking = require('../middlewares/aclChecking')

// controllers
var aclsettingCtrl = require('../controllers_v2/aclsetting_controller')
var niaodaifuCtrl = require('../controllers_v2/niaodaifu_controller')
var alluserCtrl = require('../controllers_v2/alluser_controller')
var devicedataCtrl = require('../controllers/devicedata_controller')
var reviewCtrl = require('../controllers_v2/review_controller')
var labtestImportCtrl = require('../controllers_v2/labtestImport_controller')
var serviceCtrl = require('../controllers_v2/service_controller')
var orderCtrl = require('../controllers_v2/order_controller')
var wechatCtrl = require('../controllers_v2/wechat_controller')
var counseltempCtrl = require('../controllers_v2/counseltemp_controller')
var expenseCtrl = require('../controllers_v2/expense_controller')
var dictTypeOneCtrl = require('../controllers_v2/dictTypeOne_controller')
var dictTypeTwoCtrl = require('../controllers_v2/dictTypeTwo_controller')
var dictDistrictCtrl = require('../controllers_v2/dictDistrict_controller')
var dictHospitalCtrl = require('../controllers_v2/dictHospital_controller')
var versionCtrl = require('../controllers_v2/version_controller')

var commentCtrl = require('../controllers_v2/comment_controller')
var adviceCtrl = require('../controllers_v2/advice_controller')
var complianceCtrl = require('../controllers_v2/compliance_controller')
var vitalSignCtrl = require('../controllers_v2/vitalSign_controller')
var patientCtrl = require('../controllers_v2/patient_controller')
var doctorCtrl = require('../controllers_v2/doctor_controller')
var counselCtrl = require('../controllers_v2/counsel_controller')
var communicationCtrl = require('../controllers_v2/communication_controller')
var taskCtrl = require('../controllers_v2/task_controller')
var accountCtrl = require('../controllers_v2/account_controller')
var insuranceCtrl = require('../controllers_v2/insurance_controller')
var healthInfoCtrl = require('../controllers_v2/healthInfo_controller')
var loadCtrl = require('../controllers_v2/load_controller')
var messageCtrl = require('../controllers_v2/message_controller')
var newsCtrl = require('../controllers_v2/news_controller')
var departmentCtrl = require('../controllers_v2/department_controller')

module.exports = function (app, webEntry, acl) {
  // app.get('/', function(req, res){
  //   res.send("Server Root");
  // });

  // csq
  app.post(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl), alluserCtrl.changerole)
  app.post(version + '/acl/removeUserRoles', tokenManager.verifyToken(), aclsettingCtrl.removeUserRoles(acl), alluserCtrl.changerole)
  app.get(version + '/acl/userRoles', tokenManager.verifyToken(), aclChecking.Checking(acl), aclsettingCtrl.userRoles(acl))
  app.get(version + '/acl/userRole', tokenManager.verifyToken(), aclsettingCtrl.hasRole(acl))

  app.get(version + '/acl/roleUsers', tokenManager.verifyToken(), aclsettingCtrl.roleUsers(acl))
  app.post(version + '/acl/roleParents', tokenManager.verifyToken(), aclsettingCtrl.addRoleParents(acl))
  app.post(version + '/acl/removeRoleParents', tokenManager.verifyToken(), aclsettingCtrl.removeRoleParents(acl))
  app.post(version + '/acl/removeRole', tokenManager.verifyToken(), aclsettingCtrl.removeRole(acl))

  app.post(version + '/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allow(acl))
  app.post(version + '/acl/removeAllow', tokenManager.verifyToken(), aclsettingCtrl.removeAllow(acl))
  app.get(version + '/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allowedPermissions(acl))
  app.get(version + '/acl/isAllowed', tokenManager.verifyToken(), aclsettingCtrl.isAllowed(acl))

  app.post(version + '/acl/removeResource', tokenManager.verifyToken(), aclsettingCtrl.removeResource(acl))
  app.get(version + '/acl/areAnyRolesAllowed', tokenManager.verifyToken(), aclsettingCtrl.areAnyRolesAllowed(acl))
  app.get(version + '/acl/resources', tokenManager.verifyToken(), aclsettingCtrl.whatResources(acl))

  // wf
  app.get(version + '/alluser/count', tokenManager.verifyToken(), alluserCtrl.countAlluserList)
  app.get(version + '/alluser/userList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(0))
  app.get(version + '/alluser/doctorList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(1))
  app.get(version + '/alluser/patientList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(2))
  app.get(version + '/alluser/nurseList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(3))
  app.get(version + '/alluser/insuranceList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(4))
  app.get(version + '/alluser/healthList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(5))
  app.get(version + '/alluser/adminList', tokenManager.verifyToken(), alluserCtrl.getAlluserList(6))
  app.post(version + '/alluser/alluser', tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.updateAlluserList)

  app.post(version + '/alluser/register', alluserCtrl.registerTest(acl), getNoMid.getNo(1), alluserCtrl.register(acl))
  app.post(version + '/alluser/cancelUser', tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.cancelAlluser)
  app.post(version + '/alluser/unionid', tokenManager.verifyToken(), alluserCtrl.setOpenId, alluserCtrl.checkBinding, alluserCtrl.setOpenIdRes)
  app.post(version + '/alluser/openId', tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.setMessageOpenId)
  app.get(version + '/alluser/openId', tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.getMessageOpenId)
  app.post(version + '/alluser/reset', tokenManager.verifyToken(), alluserCtrl.reset)
  app.post(version + '/alluser/login', alluserCtrl.openIdLoginTest, alluserCtrl.checkBinding, alluserCtrl.login)
  app.post(version + '/alluser/logout', tokenManager.verifyToken(), alluserCtrl.logout)
  app.get(version + '/alluser/userID', tokenManager.verifyToken(), alluserCtrl.getAlluserID)
  app.post(version + '/alluser/sms', tokenManager.verifyToken(), alluserCtrl.sendSMS)
  app.get(version + '/alluser/sms', tokenManager.verifyToken(), alluserCtrl.verifySMS)
  app.get(version + '/alluser/agreement', tokenManager.verifyToken(), alluserCtrl.getAlluserAgreement)
  app.post(version + '/alluser/agreement', tokenManager.verifyToken(), alluserCtrl.updateAlluserAgreement)

  app.post(version + '/expense/rechargeDoctor', tokenManager.verifyToken(), alluserCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
  app.get(version + '/expense/records', tokenManager.verifyToken(), expenseCtrl.getRecords)
  // gy
  // review
  app.post(version + '/review/reviewInfo', tokenManager.verifyToken(), reviewCtrl.postReviewInfo)
  app.get(version + '/review/certificate', tokenManager.verifyToken(), reviewCtrl.getCertificate)
  app.get(version + '/review/reviewInfo', tokenManager.verifyToken(), reviewCtrl.getReviewInfo)
  app.get(version + '/review/countByStatus', tokenManager.verifyToken(), reviewCtrl.countByStatus)

  // labtestImport
  app.get(version + '/labtestImport/listByStatus', tokenManager.verifyToken(), labtestImportCtrl.listByStatus)
  app.get(version + '/labtestImport/photoList', tokenManager.verifyToken(), labtestImportCtrl.photoList)
  app.post(version + '/labtestImport', tokenManager.verifyToken(), getNoMid.getNo(11), labtestImportCtrl.saveLabtest)
  app.post(version + '/labtestImport/edit', tokenManager.verifyToken(), labtestImportCtrl.editLabtest)
  app.get(version + '/labtestImport', tokenManager.verifyToken(), labtestImportCtrl.getLabtest)
  app.get(version + '/labtestImport/photoByLabtest', tokenManager.verifyToken(), labtestImportCtrl.photoByLabtest)
  app.post(version + '/labtestImport/labelphoto', tokenManager.verifyToken(), labtestImportCtrl.pullurl, labtestImportCtrl.pushurl, labtestImportCtrl.checkImportStatus, labtestImportCtrl.updateUserLatest)
  app.get(version + '/labtestImport/countByStatus', tokenManager.verifyToken(), labtestImportCtrl.countByStatus)

  // doctor_services
  app.get(version + '/services', tokenManager.verifyToken(), serviceCtrl.getServices)
  /** YQC 17-07-20
   * @swagger
   * /services/status:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "Change status of certain service"
   *     description: ""
   *     operationId: "status"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "token"
   *           - "serviceType"
   *         properties:
   *           token:
   *             type: "string"
   *           serviceType:
   *             type: "string"
   *             enum:
   *             - "service1"
   *             - "service2"
   *             - "service3"
   *             - "service4"
   *             - "service5"
   *             - "service6"
   *             description: "1: 咨询 2: 问诊 3: 加急咨询 4: 主管医生 5: 面诊服务 6:自动转诊"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userId:
   *                   type: "string"
   *                 name:
   *                   type: "string"
   *                 counselStatus1:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus2:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus3:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus4:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus5:
   *                   type: "number"
   *                   default: 1
   *                 charge1:
   *                   type: "number"
   *                   default: 30
   *                 charge2:
   *                   type: "number"
   *                   default: 50
   *                 charge3:
   *                   type: "number"
   *                 charge4:
   *                   type: "number"
   *                 charge5:
   *                   type: "number"
   *                 serviceSchedules:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSchedule'
   *                 serviceSuspendTime:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSuspend'
   *                 autoRelay:
   *                   type: "number"
   *                   default: 0
   *                 relayTarget:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamTarget'
   *       404:
   *         description: "Doctor's userId not found."
   */
  app.post(version + '/services/status', tokenManager.verifyToken(), serviceCtrl.changeServiceStatus)
  /** YQC 17-07-20
   * @swagger
   * /services/charge:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "Set/Change the charge of certain service"
   *     description: ""
   *     operationId: "charge"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "token"
   *           - "serviceType"
   *           - "charge"
   *         properties:
   *           token:
   *             type: "string"
   *           serviceType:
   *             type: "string"
   *             enum:
   *             - "service1"
   *             - "service2"
   *             - "service3"
   *             - "service4"
   *             - "service5"
   *             description: "1: 咨询 2: 问诊 3: 加急咨询 4: 主管医生 5: 面诊服务"
   *           charge:
   *             type: "number"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userId:
   *                   type: "string"
   *                 name:
   *                   type: "string"
   *                 counselStatus1:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus2:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus3:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus4:
   *                   type: "number"
   *                   default: 1
   *                 counselStatus5:
   *                   type: "number"
   *                   default: 1
   *                 charge1:
   *                   type: "number"
   *                   default: 30
   *                 charge2:
   *                   type: "number"
   *                   default: 50
   *                 charge3:
   *                   type: "number"
   *                 charge4:
   *                   type: "number"
   *                 charge5:
   *                   type: "number"
   *                 serviceSchedules:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSchedule'
   *                 serviceSuspendTime:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSuspend'
   *                 autoRelay:
   *                   type: "number"
   *                   default: 0
   *                 relayTarget:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamTarget'
   *       404:
   *         description: "Doctor's userId not found."
   */
  app.post(version + '/services/charge', tokenManager.verifyToken(), serviceCtrl.setCharge)
  app.post(version + '/services/relayTarget', tokenManager.verifyToken(), serviceCtrl.setRelayTarget)
  app.post(version + '/services/setSchedule', tokenManager.verifyToken(), serviceCtrl.setServiceSchedule)
  app.post(version + '/services/deleteSchedule', tokenManager.verifyToken(), serviceCtrl.deleteServiceSchedule)
  app.post(version + '/services/setSuspend', tokenManager.verifyToken(), serviceCtrl.setServiceSuspend)
  app.post(version + '/services/deleteSuspend', tokenManager.verifyToken(), serviceCtrl.deleteServiceSuspend)
  // 咨询问卷填写(新增自动转发功能)
  app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), counseltempCtrl.getSessionObject, counseltempCtrl.getDoctorObject, getNoMid.getNo(2), counseltempCtrl.saveQuestionaire, counseltempCtrl.counselAutoRelay)

  // YQC
  // comment - debug complete 2017-07-17
  /** YQC 17-07-20
   * @swagger
   * /comment/commentsByDoc:
   *   get:
   *     tags:
   *     - "comment"
   *     summary: "Finds comments by doctor ID"
   *     description: ""
   *     operationId: "commentsByDoc"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "userId"
   *       in: "query"
   *       description: "Some Doctor's userId."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Comment'
   *       404:
   *         description: "Doctor's userId not found."
   */
  app.get(version + '/comment/commentsByDoc', tokenManager.verifyToken(), commentCtrl.getDoctorObject, commentCtrl.getCommentsByDoc)
  /** YQC 17-07-20
   * @swagger
   * /comment/commentsByCounsel:
   *   get:
   *     tags:
   *     - "comment"
   *     summary: "Finds comments by counsel ID"
   *     description: ""
   *     operationId: "commentsByCounsel"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "counselId"
   *       in: "query"
   *       description: "Comments of counsel to be found."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Comment'
   *       404:
   *         description: "CounselId not found."
   */
  app.get(version + '/comment/commentsByCounsel', tokenManager.verifyToken(), commentCtrl.getCommentsByCounselId)
  // advice - debug complete 2017-07-17
  app.get(version + '/advice', tokenManager.verifyToken(), adviceCtrl.getAdvice)
  app.post(version + '/advice', tokenManager.verifyToken(), adviceCtrl.postAdvice)
  // compliance - debug complete 2017-07-17
  app.get(version + '/compliance', tokenManager.verifyToken(), complianceCtrl.getComplianceByDay)
  app.post(version + '/compliance', tokenManager.verifyToken(), complianceCtrl.getCompliance, complianceCtrl.updateCompliance)
  // vitalSign 2017-07-14
  app.get(version + '/vitalSign/vitalSigns', tokenManager.verifyToken(), patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns)
  app.post(version + '/vitalSign/vitalSign', tokenManager.verifyToken(), vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData)
  // counsel 2017-07-17 debug 1-
  app.get(version + '/counsel/counsels', tokenManager.verifyToken(), counselCtrl.getDoctorObject, counselCtrl.getCounsels)
  app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), counselCtrl.getSessionObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire, counselCtrl.counselAutoRelay)
  app.get(version + '/counsel/status', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus)
  app.post(version + '/counsel/status', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus)
  app.post(version + '/counsel/type', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType)
  app.post(version + '/counsel/commentScore', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore)
  // communication 2017-07-14
  app.get(version + '/communication/counselReport', tokenManager.verifyToken(), communicationCtrl.getCounselReport)
  // app.post(version + '/communication/newTeam', tokenManager.verifyToken(), getNoMid.getNo(4), communicationCtrl.newTeam)
  app.post(version + '/communication/team', tokenManager.verifyToken(), communicationCtrl.newTeam)
  app.post(version + '/communication/deleteTeam', tokenManager.verifyToken(), communicationCtrl.deleteTeam)
  app.get(version + '/communication/team', tokenManager.verifyToken(), communicationCtrl.getTeam)
  app.post(version + '/communication/consultation', tokenManager.verifyToken(), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation)
  // app.post(version + '/communication/consultation', tokenManager.verifyToken(), getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.get(version + '/communication/consultation', tokenManager.verifyToken(), communicationCtrl.getConsultation)
  app.post(version + '/communication/conclusion', tokenManager.verifyToken(), communicationCtrl.conclusion)
  app.post(version + '/communication/insertMember', tokenManager.verifyToken(), communicationCtrl.insertMember, communicationCtrl.updateNumber)
  app.post(version + '/communication/removeMember', tokenManager.verifyToken(), communicationCtrl.removeMember, communicationCtrl.updateNumber)
  app.post(version + '/communication/updateLastTalkTime', tokenManager.verifyToken(), communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime)
  app.post(version + '/communication/communication', tokenManager.verifyToken(), getNoMid.getNo(8), communicationCtrl.postCommunication)
  app.get(version + '/communication/communication', tokenManager.verifyToken(), communicationCtrl.getCommunication)
    /** GY 2017-07-28
   * @swagger
   * /communication/massToPatient:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "医生向患者群发消息"
   *     description: ""
   *     operationId: "massToPatient"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: body
   *       in: "body"
   *       required: true
   *       schema: 
   *         type:  object
   *         required: 
   *           -token
   *           -target
   *           -content
   *         properties: 
   *           token: 
   *             type: string
   *           target: 
   *             type: string
   *           content: 
   *             type: object
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: string
   *             content:
   *               type: object
   *       412: 
   *         description: "input not satisfied"
   *       404:
   *         description: "target not found."
   */
  app.post(version + '/communication/massToPatient', tokenManager.verifyToken(), communicationCtrl.getMassTargets, communicationCtrl.massCommunication)
  // task 2017-07-14
  app.get(version + '/tasks', tokenManager.verifyToken(), taskCtrl.getTasks)
  app.post(version + '/tasks/status', tokenManager.verifyToken(), taskCtrl.updateStatus)
  app.post(version + '/tasks/time', tokenManager.verifyToken(), taskCtrl.updateStartTime)
  app.post(version + '/tasks/taskModel', tokenManager.verifyToken(), taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel)
  app.get(version + '/tasks/task', tokenManager.verifyToken(), taskCtrl.getUserTask)
  app.post(version + '/tasks/task', tokenManager.verifyToken(), taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent)
  // patient 2017-07-17
  app.get(version + '/patient/detail', tokenManager.verifyToken(), patientCtrl.getPatientDetail)
  app.get(version + '/patient/doctors', tokenManager.verifyToken(), patientCtrl.getDoctorLists)
  app.get(version + '/patient/myDoctors', tokenManager.verifyToken(), patientCtrl.getMyDoctor)
  // app.get(version + '/patient/myDoctors', tokenManager.verifyToken(), patientCtrl.getSessionObject, patientCtrl.getMyDoctor)
  app.get(version + '/patient/counselRecords', tokenManager.verifyToken(), patientCtrl.getSessionObject, patientCtrl.getCounselRecords)
  app.post(version + '/patient/detail', tokenManager.verifyToken(), patientCtrl.checkPatientId, patientCtrl.newPatientDetail)
  app.post(version + '/patient/editDetail', tokenManager.verifyToken(), patientCtrl.editPatientDetail)
  app.post(version + '/patient/diagnosis', tokenManager.verifyToken(), patientCtrl.getSessionObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail)
  // bindingMyDoctor改为关注医生
  // app.post(version + '/patient/bindingMyDoctor', tokenManager.verifyToken(), patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  app.post(version + '/patient/changeVIP', tokenManager.verifyToken(), patientCtrl.changeVIP)
  app.post(version + '/patient/wechatPhotoUrl', tokenManager.verifyToken(), patientCtrl.wechatPhotoUrl)
  // doctor_Info
  app.post(version + '/doctor/detail', tokenManager.verifyToken(), doctorCtrl.insertDocBasic)
  // 需要查询class字典表（待定） ？？？这是啥
  app.get(version + '/doctor/myPatients', tokenManager.verifyToken(), doctorCtrl.getSessionObject, doctorCtrl.getPatientList)
  app.get(version + '/doctor/myPatientsByDate', doctorCtrl.getSessionObject, doctorCtrl.getPatientByDate)
  // app.get(version + '/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get(version + '/doctor/detail', tokenManager.verifyToken(), doctorCtrl.getSessionObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo)
  app.get(version + '/doctor/myTeams', tokenManager.verifyToken(), doctorCtrl.getTeams)
  app.get(version + '/doctor/teamPatients', tokenManager.verifyToken(), doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList)
  // app.get(version + '/doctor/team', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post(version + '/doctor/editDetail', tokenManager.verifyToken(), doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember)
  app.get(version + '/doctor/myRecentDoctors', doctorCtrl.getDoctorObject, doctorCtrl.getRecentDoctorList)
  app.post(version + '/doctor/schedule', tokenManager.verifyToken(), doctorCtrl.insertSchedule)
  app.post(version + '/doctor/deleteSchedule', tokenManager.verifyToken(), doctorCtrl.deleteSchedule)
  app.get(version + '/doctor/schedules', tokenManager.verifyToken(), doctorCtrl.getSchedules)
  app.post(version + '/doctor/suspendTime', tokenManager.verifyToken(), doctorCtrl.insertSuspendTime)
  app.post(version + '/doctor/deleteSuspendTime', tokenManager.verifyToken(), doctorCtrl.deleteSuspendTime)
  app.get(version + '/doctor/suspendTime', tokenManager.verifyToken(), doctorCtrl.getSuspendTime)
  app.get(version + '/doctor/numbers', tokenManager.verifyToken(), doctorCtrl.getDocNum)
  app.get(version + '/doctor/AliPayAccount', tokenManager.verifyToken(), doctorCtrl.getAliPayAccount)
  app.post(version + '/doctor/AliPayAccount', tokenManager.verifyToken(), doctorCtrl.editAliPayAccount)
  // 患者端 关注医生 2017-07-18
  app.post(version + '/patient/favoriteDoctor', tokenManager.verifyToken(), patientCtrl.bindingDoctor, patientCtrl.bindingPatient)
  // 患者端 取关医生 2017-07-21
  app.post(version + '/patient/unfollowFavoriteDoctor', tokenManager.verifyToken(), patientCtrl.debindingDoctor, patientCtrl.debindingPatient)
  // 患者端 获取关注医生列表 2017-07-19
  app.get(version + '/patient/myFavoriteDoctors', tokenManager.verifyToken(), patientCtrl.getMyFavoriteDoctors)
  // 患者端 申请主管医生 2017-07-18
  app.post(version + '/patient/doctorInCharge', tokenManager.verifyToken(), serviceCtrl.requestDoctorInCharge, serviceCtrl.addPatientInCharge)
  // 患者端 获取主管医生信息 2017-07-20
  app.get(version + '/patient/myDoctorsInCharge', tokenManager.verifyToken(), serviceCtrl.getDoctorsInCharge)
  // 患者端 删除主管医生 2017-07-20
  app.post(version + '/patient/cancelDoctorInCharge', tokenManager.verifyToken(), serviceCtrl.getMyDoctorInCharge, serviceCtrl.deleteDoctorInCharge, serviceCtrl.getPatientInCharge, serviceCtrl.deletePatientInCharge)
  // 患者端 判断关系 2017-07-21
  app.get(version + '/services/relation', tokenManager.verifyToken(), serviceCtrl.relation)
  // 医生端 获取主管医生待审核请求列表 2017-07-19
  app.get(version + '/doctor/myPatientsToReview', tokenManager.verifyToken(), serviceCtrl.getPatientsToReview)
  // 医生端 审核主管患者 2017-07-21
  app.post(version + '/doctor/PatientInCharge', tokenManager.verifyToken(), serviceCtrl.reviewPatientInCharge, serviceCtrl.updateDoctorInCharge)
  // 医生端 获取排班信息 2017-07-19
  /** YQC 17-07-20
   * @swagger
   * /services/mySchedules:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "Finds schedules of certain doctor"
   *     description: ""
   *     operationId: "mySchedules"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 serviceSchedules:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSchedule'
   *                 Schedules:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Schedule'
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/services/mySchedules', tokenManager.verifyToken(), serviceCtrl.getServiceSchedules)

  app.get('/devicedata/niaodaifu/loginparam', niaodaifuCtrl.getLoginParam)
  app.post('/devicedata/niaodaifu/data', getNoMid.getNo(11), niaodaifuCtrl.receiveData)
  // app.get('/devicedata/niaodaifu/loginparam', niaodaifuCtrl.getLoginParam)

  // 退款接口
  app.post(version + '/wechat/refund', orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund, wechatCtrl.refundMessage)

  // lgf
  // account
 /**
 * @swagger
 * definition:
 *   Times:
 *     type: object
 *     properties:
 *       count:
 *         type: number
 *       doctorId:
 *         type: string
 *   IncomeRecords:
 *     type: object
 *     properties:
 *       time:
 *         type: date
 *       money:
 *         type: number
 *       from:
 *         type: string
 *   RechargeRecords:
 *     type: object
 *     properties:
 *       time:
 *         type: date
 *       money:
 *         type: number
 *       title:
 *         type: string
 *   ExpenseRecords:
 *     type: object
 *     properties:
 *       time:
 *         type: date
 *       type:
 *         type: number
 *       money:
 *         type: number
 *       title:
 *         type: string
 *   AccountInfo:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *       freeTimes:
 *         type: number
 *         default: 3
 *       incomeRecords:
 *         type: array
 *         $ref: '#/definitions/IncomeRecords'
 *       rechargeRecords:
 *         type: array
 *         $ref: '#/definitions/RechargeRecords'
 *       expenseRecords:
 *         type: array
 *         $ref: '#/definitions/ExpenseRecords'
 *       times:
 *         type: array
 *         items:
 *           $ref: '#/definitions/Times'
 */
 /**
 * @swagger
 * /api/v2/account/accountInfo:
 *   get:
 *     operationId: getAccountInfo
 *     tags:
 *       - AccountInfo
 *     description: Get All AccountInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: AccountInfo List
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/AccountInfo'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/account/accountInfo', tokenManager.verifyToken(), accountCtrl.getAccountInfo)
 /**
 * @swagger
 * /api/v2/account/counts:
 *   get:
 *     operationId: getCounts
 *     tags:
 *       - AccountInfo
 *     description: Get Counts
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: doctorId
 *         description: Optional Item
 *         in: query
 *         required: false
 *         type : string
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           required:
 *             - freeTimes
 *             - count
 *           properties:
 *             freeTimes:
 *               type: number
 *             count:
 *               type: number
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/account/counts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts)
 /**
 * @swagger
 * /api/v2/account/counts:
 *   post:
 *     operationId: modifyCounts
 *     tags:
 *       - AccountInfo
 *     description: Modify Counts
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - doctorId
 *             - modify
 *           properties:
 *             token:
 *               type: string
 *             doctorId:
 *               type: string
 *             modify:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - n
 *             - nModified
 *             - ok
 *           properties:
 *             n:
 *               type: number
 *             nModified:
 *               type: number
 *             ok:
 *               type: number
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/account/counts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts)
 /**
 * @swagger
 * /api/v2/account/freeTime:
 *   post:
 *     operationId: updateFreeTime
 *     tags:
 *       - AccountInfo
 *     description: Update FreeTime
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *           properties:
 *             token:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - accountInfo
 *           properties:
 *             accountInfo:
 *               type: object
 *               $ref: '#/definitions/AccountInfo'
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/account/freeTime', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.updateFreeTime)
 /**
 * @swagger
 * /api/v2/account/countsRespective:
 *   get:
 *     operationId: getCountsRespective
 *     tags:
 *       - AccountInfo
 *     description: Get Counts Respective
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           required:
 *             - count1
 *             - count2
 *           properties:
 *             count1:
 *               type: number
 *             count2:
 *               type: number
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/account/countsRespective', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.getCountsRespective)

  // expense
 /**
 * @swagger
 * definition:
 *   Expense:
 *     properties:
 *       patientId:
 *         type: number
 *       patientName:
 *         type: string
 *       doctorId:
 *         type: string
 *       doctorName:
 *         type: string
 *       time:
 *         type: date
 *       money:
 *         type: number
 *       type:
 *         type: string
 *       status:
 *         type: number
 */
 /**
 * @swagger
 * /api/v2/expense/doctor:
 *   post:
 *     operationId: rechargeDoctor
 *     tags:
 *       - Expense
 *     description: Recharge Doctor
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *           properties:
 *             token:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - accountInfo
 *           properties:
 *             accountInfo:
 *               type: object
 *               $ref: '#/definitions/AccountInfo'
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/expense/doctor', tokenManager.verifyToken(), doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
 /**
 * @swagger
 * /api/v2/expense/records:
 *   get:
 *     operationId: getRecords
 *     tags:
 *       - Expense
 *     description: Get Expense Records
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: patientId
 *         description: patientId
 *         in: query
 *         required: true
 *         type: string
 *       - name: patientName
 *         description: patientName
 *         in: query
 *         required: true
 *         type: string
 *       - name: doctorId
 *         description: doctorId
 *         in: query
 *         required: true
 *         type: string
 *       - name: doctorName
 *         description: doctorName
 *         in: query
 *         required: true
 *         type: string
 *       - name: time
 *         description: time
 *         in: query
 *         required: true
 *         type: date
 *       - name: money
 *         description: money
 *         in: query
 *         required: true
 *         type: number
 *       - name: type
 *         description: type
 *         in: query
 *         required: true
 *         type: string
 *       - name: status
 *         description: status
 *         in: query
 *         required: false
 *         type: number
 *       - name: limit
 *         description: limit
 *         in: query
 *         required: true
 *         type: number
 *       - name: skip
 *         description: skip
 *         in: query
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           required:
 *             - expense
 *             - nexturl
 *           properties:
 *             expense:
 *               type: object
 *               $ref: '#/definitions/Expense'
 *             nexturl:
 *               type: string
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/expense/records', tokenManager.verifyToken(), expenseCtrl.getRecords)

  // healthInfo
 /**
 * @swagger
 * definition:
 *   Url:
 *     type: object
 *     properties:
 *       photoId:
 *         type: string
 *       photo:
 *         type: string
 *       photoType:
 *         type: string
 *       status:
 *         type: number
 *   HealthInfo:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *       type:
 *         type: string
 *       insertTime:
 *         type: date
 *       time:
 *         type: date
 *       label:
 *         type: string
 *       description:
 *         type: string
 *       comments:
 *         type: string
 *       importStatus:
 *         type: number
 *       url:
 *         type: array
 *         items:
 *           $ref: '#/definitions/Url'
 */
 /**
 * @swagger
 * /api/v2/healthInfo/healthInfos:
 *   get:
 *     operationId: getAllHealthInfo
 *     tags:
 *       - HealthInfo
 *     description: Get All HealthInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: HealthInfo List
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/HealthInfo'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/healthInfo/healthInfos', tokenManager.verifyToken(), healthInfoCtrl.getAllHealthInfo)
 /**
 * @swagger
 * /api/v2/healthInfo/healthDetail:
 *   get:
 *     operationId: getHealthDetail
 *     tags:
 *       - HealthInfo
 *     description: Get Health Detail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: insertTime
 *         description: insert time
 *         in: query
 *         required: true
 *         type: date
 *     responses:
 *       200:
 *         description: HealthInfo List
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/HealthInfo'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), healthInfoCtrl.getHealthDetail)
 /**
 * @swagger
 * /api/v2/healthInfo/healthInfo:
 *   post:
 *     operationId: insertHealthInfo
 *     tags:
 *       - HealthInfo
 *     description: Insert HealthInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - time
 *             - label
 *             - url
 *             - description
 *             - comments
 *           properties:
 *             token:
 *               type: string
 *             type:
 *               type: string
 *             time:
 *               type: date
 *             label:
 *               type: string
 *             url:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Url'
 *             description:
 *               type: string
 *             comments:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *       412:
 *         description: The server does not meet one of the prerequisites set by the requester in the request
 *       404:
 *         description: The server could not find the requested page
 */
  app.post(version + '/healthInfo/healthInfo', tokenManager.verifyToken(), healthInfoCtrl.insertHealthInfo)
 /**
 * @swagger
 * /api/v2/healthInfo/healthDetail:
 *   post:
 *     operationId: modifyHealthDetail
 *     tags:
 *       - HealthInfo
 *     description: Modify HealthDetail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - time
 *             - insertTime
 *             - label
 *             - url
 *             - description
 *             - comments
 *           properties:
 *             token:
 *               type: string
 *             type:
 *               type: string
 *             time:
 *               type: date
 *             insertTime:
 *               type: date
 *             label:
 *               type: string
 *             url:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Url'
 *             description:
 *               type: string
 *             comments:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *       412:
 *         description: The server does not meet one of the prerequisites set by the requester in the request
 *       404:
 *         description: The server could not find the requested page
 */
  app.post(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), healthInfoCtrl.modifyHealthDetail)
 /**
 * @swagger
 * /api/v2/healthInfo/deleteHealthDetail:
 *   post:
 *     operationId: deleteHealthDetail
 *     tags:
 *       - HealthInfo
 *     description: Delete a Health Detail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - insertTime
 *           properties:
 *             token:
 *               type: string
 *             insertTime:
 *               type: date
 *     responses:
 *       200:
 *         description: success
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/healthInfo/deleteHealthDetail', tokenManager.verifyToken(), healthInfoCtrl.deleteHealthDetail)

  // insurance
 /**
 * @swagger
 * definition:
 *   Preference:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       time:
 *         type: date
 *   InsuranceMsg:
 *     type: object
 *     properties:
 *       insuranceId:
 *         type: string
 *       time:
 *         type: Date
 *       description:
 *         type: string
 *   insMsg:
 *     type: object
 *     properties:
 *       doctorId:
 *         type: string
 *       patientId:
 *         type: string
 *       preference:
 *         $ref: '#/definitions/Preference'
 *       count:
 *         type: number
 *       insuranceMsg:
 *         type: array
 *         items:
 *           $ref: '#/definitions/InsuranceMsg'
 *   Message:
 *     type: object
 *     properties:
 *       messageId:
 *         type: string
 *       userId:
 *         type: string
 *       type:
 *         type: number
 *       readOrNot:
 *         type: number
 *       sendBy:
 *         type: string
 *       time:
 *         type: date
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       url:
 *         type: string
 */
/**
 * @swagger
 * /api/v2/insurance/message:
 *   post:
 *     operationId: insertInsuranceMessage
 *     tags:
 *       - Insurance
 *     description: Insert Insurance Message
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - patientId
 *             - insuranceId
 *             - time
 *             - insdescription
 *             - title
 *             - description
 *             - url
 *           properties:
 *             token:
 *               type: string
 *             patientId:
 *               type: string
 *             insuranceId:
 *               type: stirng
 *             time:
 *               type: date
 *             insdescription:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             url:
 *               type: string
 *     responses:
 *       200:
 *         description: New insurance success
 *         schema:
 *           type: object
 *           required:
 *             - insMsg
 *             - message
 *           properties:
 *             insMsg:
 *               type: object
 *               $ref: '#/definitions/insMsg'
 *             message:
 *               type: object
 *               $ref: '#/definitions/Message'
 *       500:
 *         description: Server internal error
 *       422:
 *         description: Unsuccessfully modified
 */
  app.post(version + '/insurance/message', tokenManager.verifyToken(), patientCtrl.checkPatient, insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage)
 /**
 * @swagger
 * /api/v2/insurance/message:
 *   get:
 *     operationId: getInsuranceMessage
 *     tags:
 *       - Insurance
 *     description: Returns Insurance Message
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: doctorId
 *         description: doctorId
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: description of insurances
 *         schema:
 *           type: object
 *           $ref: '#/definitions/insMsg'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/insurance/message', tokenManager.verifyToken(), doctorCtrl.checkDoctor, insuranceCtrl.getInsMsg)
 /**
 * @swagger
 * /api/v2/insurance/prefer:
 *   post:
 *     operationId: setInsurancePrefer
 *     tags:
 *       - Insurance
 *     description: Set Insurance Prefer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - status
 *             - date
 *           properties:
 *             token:
 *               type: string
 *             status:
 *               type: number
 *             date:
 *               type: date
 *     responses:
 *       200:
 *         description: success
 */
  app.post(version + '/insurance/prefer', tokenManager.verifyToken(), insuranceCtrl.setPrefer)
 /**
 * @swagger
 * /api/v2/insurance/prefer:
 *   get:
 *     operationId: getInsurancePrefer
 *     tags:
 *       - Insurance
 *     description: Return Insurance Message
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: description of insurances
 *         schema:
 *           type: object
 *           $ref: '#/definitions/insMsg'
 */
  app.get(version + '/insurance/prefer', tokenManager.verifyToken(), insuranceCtrl.getPrefer)

  // message
 /**
 * @swagger
 * definition:
 *   Message:
 *     type: object
 *     properties:
 *       messageId:
 *         type: string
 *       userId:
 *         type: string
 *       type:
 *         type: number
 *       readOrNot:
 *         type: number
 *       sendBy:
 *         type: string
 *       time:
 *         type: date
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       url:
 *         type: string
 */
 /**
 * @swagger
 * /api/v2/message/messages:
 *   get:
 *     operationId: getMessages
 *     tags:
 *       - Message
 *     description: Get All Messages
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: type
 *         description: messageType (Optional Item)
 *         in: query
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: list of messages
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Message'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/message/messages', tokenManager.verifyToken(), messageCtrl.getMessages)
 /**
 * @swagger
 * /api/v2/message/status:
 *   post:
 *     operationId: changeMessageStatus
 *     tags:
 *       - Message
 *     description: Change MessageStatus
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - readOrNot
 *           properties:
 *             token:
 *               type: string
 *             type:
 *               type: number
 *             readOrNot:
 *               type: number
 *     responses:
 *       200:
 *         description: success
 *       422:
 *         description: Unsuccessfully modified
 */
  app.post(version + '/message/status', tokenManager.verifyToken(), messageCtrl.changeMessageStatus)
 /**
 * @swagger
 * /api/v2/message/message:
 *   post:
 *     operationId: insertMessage
 *     tags:
 *       - Message
 *     description: Insert Message
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - userId
 *             - sendBy
 *             - time
 *             - title
 *             - description
 *             - url
 *           properties:
 *             token:
 *               type: string
 *             userId:
 *               type: string
 *             type:
 *               type: number
 *             sendBy:
 *               type: string
 *             time:
 *               type: date
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             url:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - insMsg
 *             - message
 *           properties:
 *             insMsg:
 *               type: object
 *               $ref: '#/definitions/insMsg'
 *             message:
 *               type: object
 *               $ref: '#/definitions/Message'
 *       422:
 *         description: Unsuccessfully modified
 */
  app.post(version + '/message/message', tokenManager.verifyToken(), getNoMid.getNo(6), messageCtrl.insertMessage)

  // order
  /**
 * @swagger
 * definition:
 *   GoodsInfo:
 *     type: object
 *     properties:
 *       class:
 *         type: string
 *       name:
 *         type: string
 *       notes:
 *         type: string
 *   Order:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *       orderNo:
 *         type: string
 *       ordertime:
 *         type: date
 *       money:
 *         type: number
 *       goodsInfo:
 *         type: object
 *         $ref: '#/definitions/GoodsInfo'
 *       paystatus:
 *         type: number
 *       paytime:
 *         type: date
 *       refundNo:
 *         type: number
 *       refundAppTime:
 *         type: date
 *       refundSucTime:
 *         type: date
 */
 /**
 * @swagger
 * /api/v2/order/order:
 *   post:
 *     operationId: updateOrder
 *     tags:
 *       - Order
 *     description: Update Order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - readOrNot
 *           properties:
 *             token:
 *               type: string
 *             type:
 *               type: number
 *             readOrNot:
 *               type: number
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Order'
 *       500:
 *         description: Server internal error
 */

  // app.post(version + '/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post(version + '/order/order', tokenManager.verifyToken(), orderCtrl.updateOrder)
 /**
 * @swagger
 * /api/v2/order/order:
 *   get:
 *     operationId: getOrder
 *     tags:
 *       - Order
 *     description: Get Order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: orderNo
 *         description: order number
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: order information
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Order'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/order/order', tokenManager.verifyToken(), orderCtrl.getOrder)

  // load
 /**
 * @swagger
 * /api/v2/upload:
 *   post:
 *     operationId: upload
 *     tags:
 *       - Upload
 *     description: Upload Photo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - file
 *           properties:
 *             token:
 *               type: string
 *             file:
 *               type: string
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           required:
 *             - ret_code
 *             - filepath
 *             - path_resized
 *           properties:
 *             ret_code:
 *               type: string
 *             filepath:
 *               type: string
 *             path_resized:
 *               type: string
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/upload', tokenManager.verifyToken(), loadCtrl.uploadphoto(), loadCtrl.upload)

  // news
 /**
 * @swagger
 * definition:
 *   News:
 *     type: object
 *     properties:
 *       messageId:
 *         type: string
 *       userId:
 *         type: string
 *       userRole:
 *         type: string
 *       type:
 *         type: number
 *       readOrNot:
 *         type: number
 *       sendBy:
 *         type: string
 *       time:
 *         type: date
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       url:
 *         type: string
 */
 /**
 * @swagger
 * /api/v2/new/news:
 *   get:
 *     operationId: getNews
 *     tags:
 *       - News
 *     description: Get News
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: type
 *         description: newsType (Optional Item)
 *         in: query
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: list of news
 *         schema:
 *           type: array
 *           $ref: '#/definitions/News'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/new/news', tokenManager.verifyToken(), newsCtrl.getNews)
 /**
 * @swagger
 * /api/v2/new/newsByReadOrNot:
 *   get:
 *     operationId: getNewsByReadOrNot
 *     tags:
 *       - News
 *     description: Get News By ReadOrNot
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: authorization message
 *         in: query
 *         required: true
 *         type: string
 *       - name: type
 *         description: newsType (Optional Item)
 *         in: query
 *         required: false
 *         type: number
 *       - name: readOrNot
 *         description: news readOrNot flag 1:read 0:not
 *         in: query
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: list of news
 *         schema:
 *           type: array
 *           $ref: '#/definitions/News'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/new/newsByReadOrNot', tokenManager.verifyToken(), newsCtrl.getNewsByReadOrNot)
 /**
 * @swagger
 * /api/v2/new/news:
 *   post:
 *     operationId: insertNews
 *     tags:
 *       - News
 *     description: Insert News
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - userId
 *             - readOrNot
 *             - title
 *             - description
 *             - url
 *             - userRole
 *             - messageId
 *           properties:
 *             token:
 *               type: string
 *             userId:
 *               type: string
 *             type:
 *               type: number
 *             readOrNot:
 *               type: number
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             url:
 *               type: string
 *             userRole:
 *               type: string
 *             messageId:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - n
 *             - nModified
 *             - ok
 *           properties:
 *             n:
 *               type: number
 *             nModified:
 *               type: number
 *             ok:
 *               type: number
 *       422:
 *         description: Unsuccessfully modified
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/new/news', tokenManager.verifyToken(), newsCtrl.insertNews)
  /**
 * @swagger
 * /api/v2/new/teamNews:
 *   post:
 *     operationId: insertTeamNews
 *     tags:
 *       - News
 *     description: Insert Team News
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - token
 *             - type
 *             - userId
 *             - title
 *             - description
 *             - url
 *             - messageId
 *           properties:
 *             token:
 *               type: string
 *             userId:
 *               type: string
 *             type:
 *               type: number
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             url:
 *               type: string
 *             messageId:
 *               type: string
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *           required:
 *             - n
 *             - nModified
 *             - ok
 *           properties:
 *             n:
 *               type: number
 *             nModified:
 *               type: number
 *             ok:
 *               type: number
 *       422:
 *         description: Unsuccessfully modified
 *       500:
 *         description: Server internal error
 */
  app.post(version + '/new/teamNews', tokenManager.verifyToken(), newsCtrl.insertTeamNews)

  // jyf
  // 刷新token
  /**
   * @swagger
   * /token/refresh:
   *   get:
   *     tags:
   *       - 刷新token
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: refresh_token
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回刷新的token和refreshtoken
   *       401:
   *         description: 令牌验证错误
   *       500:
   *         description: 错误信息
   */
  app.get(version + '/token/refresh', tokenManager.verifyToken(), aclChecking.Checking(acl), tokenManager.refreshToken)

  // dict
  /**
   * @swagger
   * /dict/typeTwo:
   *   get:
   *     tags:
   *       - 字典
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: category
   *         description: 目录名
   *         in: query
   *         required: true
   *         type: string
   *       - name: token
   *         description: 令牌
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回目录信息
   *         schema:
   *           type: object
   *           $ref: '#/definitions/DictTypeTwo'
   *       500:
   *         description: 查询错误信息
   * definition:
   *   DictTypeTwo:
   *     type: object
   *     properties:
   *       category:
   *         type: string
   *       contents:
   *         type: array
   *         items:
   *           $ref: '#/definitions/DictTwoContent'
   *   DictTwoContent:
   *     type: object
   *     properties:
   *       _id:
   *         type: string
   *       type:
   *         type: string
   *       typeName:
   *         type: string
   *       details:
   *         type: array
   *         items:
   *           $ref: '#/definitions/DictTwoDetail'
   *   DictTwoDetail:
   *     type: object
   *     properties:
   *       _id:
   *         type: string
   *       code:
   *         type: string
   *       name:
   *         type: string
   *       inputCode:
   *         type: string
   *       description:
   *         type: string
   *       invalidFlag:
   *         type: integer

   */
  app.get(version + '/dict/typeTwo', tokenManager.verifyToken(), aclChecking.Checking(acl), dictTypeTwoCtrl.getCategory)
  /**
   * @swagger
   * /dict/typeTwo/codes:
   *   get:
   *     tags:
   *       - 字典
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: category
   *         description: 目录名
   *         in: query
   *         required: true
   *         type: string
   *       - name: type
   *         description: 类型
   *         in: query
   *         required: true
   *         type: string
   *       - name: token
   *         description: 令牌
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回该类的编码信息
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Result'
   *       500:
   *         description: 查询错误信息
   * definition:
   *   Result:
   *     type: object
   *     properties:
   *       results:
   *         type: object
   *         $ref: '#/definitions/Content'
   *   Content:
   *     type: object
   *     properties:
   *       _id:
   *         type: string
   *       type:
   *         type: string
   *       typeName:
   *         type: string
   *       details:
   *         type: array
   *         items:
   *           $ref: '#/definitions/Detail'
   *   Detail:
   *     type: object
   *     properties:
   *       _id:
   *         type: string
   *       code:
   *         type: string
   *       name:
   *         type: string
   *       inputCode:
   *         type: string
   *       description:
   *         type: string
   *       invalidFlag:
   *         type: integer
   */
  app.get(version + '/dict/typeTwo/codes', tokenManager.verifyToken(), aclChecking.Checking(acl), dictTypeTwoCtrl.getTypes)
  /**
   * @swagger
   * /dict/typeOne:
   *   get:
   *     tags:
   *       - 字典
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: category
   *         description: 目录名
   *         in: query
   *         required: true
   *         type: string
   *       - name: token
   *         description: 令牌
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回目录信息
   *         schema:
   *           type: object
   *           $ref: '#/definitions/DictTypeOne'
   *       500:
   *         description: 查询错误信息
   * definition:
   *   DictTypeOne:
   *     type: object
   *     properties:
   *       category:
   *         type: string
   *       details:
   *         type: array
   *         items:
   *           type: object
   *           $ref: '#/definitions/DictOneDetail'
   *   DictOneDetail:
   *     type: object
   *     properties:
   *       code:
   *         type: string
   *       name:
   *         type: string
   *       inputCode:
   *         type: string
   *       description:
   *         type: string
   *       invalidFlag:
   *         type: integer
   */
  app.get(version + '/dict/typeOne', tokenManager.verifyToken(), aclChecking.Checking(acl), dictTypeOneCtrl.getCategory)

  app.get(version + '/dict/district', tokenManager.verifyToken(), aclChecking.Checking(acl), dictDistrictCtrl.getDistrict)
  /**
   * @swagger
   * /dict/hospital:
   *   get:
   *     tags:
   *       - 字典
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: locationCode
   *         in: query
   *         type: string
   *       - name: hostipalCode
   *         in: query
   *         type: string
   *       - name: province
   *         in: query
   *         type: string
   *       - city:
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医院信息
   *         schema:
   *
   */
  app.get(version + '/dict/hospital', tokenManager.verifyToken(), aclChecking.Checking(acl), dictHospitalCtrl.getHospital)

  // devicedata
  /**
   * @swagger
   * /devicedata/BPDevice/binding:
   *   post:
   *     tags:
   *       - 血压计
   *     description: 绑定血压计
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Binding'
   *     responses:
   *       200:
   *         description: 绑定成功
   *         schema:
   *           type: object
   *           $ref: '#/definitions/BindingResult'
   *       400:
   *         description: 无效输入
   *       500:
   *         description: 绑定失败信息
   * definition:
   *   Binding:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       appId:
   *         type: string
   *       twoDimensionalCode:
   *         type: string
   *   BindingResult:
   *     type: object
   *     properties:
   *       results:
   *         type: object
   *         $ref: '#/definitions/BindingInfo'
   *   BindingInfo:
   *     type: object
   *     properties:
   *       requestStatus:
   *         type: string
   *       errorCode:
   *         type: integer
   *       deviceInfo:
   *         type: object
   *         $ref: '#/definitions/DeviceInfo'
   *   DeviceInfo:
   *     type: object
   *     properties:
   *       type:
   *         type: string
   *       imei:
   *         type: string
   *       phone:
   *         type: string
   *       sn:
   *         type: string
   *       validateDate:
   *         type: string
   */
  app.post(version + '/devicedata/BPDevice/binding', tokenManager.verifyToken(), aclChecking.Checking(acl), devicedataCtrl.bindingDevice)
  app.post(version + '/devicedata/BPDevice/debinding', tokenManager.verifyToken(), aclChecking.Checking(acl), devicedataCtrl.debindingDevice)
  app.post(version + '/devicedata/BPDevice/data', tokenManager.verifyToken(), aclChecking.Checking(acl), devicedataCtrl.receiveBloodPressure)
  app.get(version + '/devicedata/devices', tokenManager.verifyToken(), aclChecking.Checking(acl), devicedataCtrl.getDeviceInfo)

  // wechat
  app.get(version + '/wechat/settingConfig', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.settingConfig)
  // 获取用户基本信息
  app.get(version + '/wechat/getUserInfo', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.getuserinfo)
  app.get(version + '/wechat/gettokenbycode', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken)
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // 输入：微信用户授权的code 商户系统生成的订单号
  app.post(version + '/wechat/addOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder,wechatCtrl.getPaySign)
  // 订单支付结果回调
  app.post(version + '/wechat/payResult', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.payResult)
  // 查询订单   orderNo
  app.get(version + '/wechat/getWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.getWechatOrder)
  // 关闭订单   orderNo
  app.get(version + '/wechat/closeWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.closeWechatOrder)

  // app.post(version + '/wechat/refund', orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund)
  // 退款接口
  app.post(version + '/wechat/refund', tokenManager.verifyToken(), aclChecking.Checking(acl), orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund, wechatCtrl.refundMessage)
  // 退款查询
  app.post('/wechat/refundquery', tokenManager.verifyToken(), aclChecking.Checking(acl), orderCtrl.checkPayStatus('refundquery'), wechatCtrl.chooseAppId, wechatCtrl.refundquery, orderCtrl.refundChangeStatus())
  // 消息模板
  app.post(version + '/wechat/messageTemplate',  tokenManager.verifyToken(), aclChecking.Checking(acl),wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate)
  // 下载
  app.get(version + '/wechat/download', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.download)
  // 创建永久二维码
  app.post(version + '/wechat/createTDCticket', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createTDCticket, alluserCtrl.setTDCticket)

  // 接收微信服务器的post请求
  app.post(version + '/wechat', wechatCtrl.receiveTextMessage)
  // 接收微信服务器的get请求
  app.get(version + '/wechat', wechatCtrl.getServerSignature)

  // 自定义菜单
  app.post(version + '/wechat/createCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createCustomMenu)
  app.get(version + '/wechat/getCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.getCustomMenu)
  app.get(version + '/wechat/deleteCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.deleteCustomMenu)

  // 版本信息
  /**
   * @swagger
   * /version:
   *  get:
   *    tags:
   *      - version
   *    description: 获取版本信息
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: versionName
   *        description: 版本名
   *        in: query
   *        required: true
   *        type: string
   *      - name: versionType
   *        in: query
   *        required: true
   *        type: string
   *        description: 版本类型
   *      - name: token
   *        description: 令牌
   *        in: query
   *        required: true
   *        type: string
   *    responses:
   *      200:
   *        description: 返回版本信息
   *        schema:
   *          type: object
   *          $ref: '#/definitions/VersionMsg'
   *      401:
   *        description: 令牌验证错误
   *  post:
   *    tags:
   *      - version
   *    description: 插入版本信息
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: body
   *        in: body
   *        required: true
   *        schema:
   *          type: object
   *          $ref: '#/definitions/VersionInput'
   *    responses:
   *      200:
   *        description: 成功存入，返回存入的版本信息
   *      400:
   *        description: 无效输入
   *      500:
   *        description: 存入数据错误信息
   *      401:
   *        description: 令牌验证错误
   * definition:
   *   VersionMsg:
   *     type: object
   *     properties:
   *       status:
   *         type: integer
   *       msg:
   *         type: string  
   *   VersionInput:
   *     type: object
   *     properties:
   *       versionType:
   *         type: string
   *       versionName:
   *         type: string
   *       content:
   *         type；string
   *       token:
   *         type: string    
   */
  app.get(version + '/version', tokenManager.verifyToken(), versionCtrl.getVersionInfo)
  app.post(version + '/version', tokenManager.verifyToken(), getNoMid.getNo(10), versionCtrl.insertVersionInfo)

  // niaodaifu
  /**
   * @swagger
   * /devicedata/niaodaifu/loginparam:
   *   get:
   *     tags:
   *       - 尿大夫
   *     description: 获取登录参数
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: client
   *         description: 客户端
   *         in: query
   *         required: true
   *         type: string
   *       - name: userbind
   *         description: 用户ID
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回所需参数
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Param'
   *       403:
   *         description: 输入错误        
   * /devicedata/niaodaifu/data:
   *   post:
   *     tags:
   *       - 尿大夫
   *     description: 接收检测数据
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           $ref: '#/definitions/NiaoReq'   
   *     responses:
   *       200:
   *         description: 返回成功状态
   * definition:
   *   Param:
   *     type: object
   *     properties:
   *       appkey:
   *         type: string
   *       sign:
   *         type: string
   *       atime:
   *         type: integer
   *       userbind:
   *         type: string
   *       mode:
   *         type: integer
   *       redirect_uri:
   *         type: string
   *   NiaoReq:
   *     type: object
   *     properties:
   *       userbind:
   *         type: string
   *         description: 用户ID
   *       suggestion:
   *         type: string
   *         description: 建议
   *       desc:
   *         type: string
   *         description: 描述
   *       created:
   *         type: integer
   *         description: 时间戳
   *       data:
   *         type: array
   *         items:
   *           $ref: '#/definitions/NiaoData'
   *   NiaoData:
   *     type: object
   *     properties:
   *       id:
   *         type: string
   *       cname:
   *         type: string
   *       result:
   *         type: string
   *       index:
   *         type: string
   *       status:
   *         type: integer
   */
  app.get('/devicedata/niaodaifu/loginparam', niaodaifuCtrl.getLoginParam)
  app.post('/devicedata/niaodaifu/data', getNoMid.getNo(11), niaodaifuCtrl.receiveData)

  // department
  // app.get(version + '/department/district', departmentCtrl.getDistrict)



  /**
   * @swagger
   * definitions:
   *   Comment:
   *     type: object
   *     properties:
   *       commentId:
   *         type: string
   *       counselId:
   *         type: string
   *       doctorId:
   *         type: string
   *       patientId:
   *         type: string
   *       type:
   *         type: number
   *       time:
   *         type: string
   *         format: date-time
   *       helpScore:
   *         type: number
   *       attitudeScore:
   *         type: number
   *       speedScore:
   *         type: number
   *       totalScore:
   *         type: number
   *         default: 10
   *       topic:
   *         type: string
   *       expense:
   *         type: string
   *       content:
   *         type: string
   *   TeamTarget:
   *     type: object
   *     properties:
   *       teamId:
   *         type: string
   *   ServiceSchedule:
   *     type: object
   *     properties:
   *       day:
   *         type: string
   *         enum:
   *           - "Mon"
   *           - "Tue"
   *           - "Wed"
   *           - "Thur"
   *           - "Fri"
   *           - "Sat"
   *           - "Sun"
   *       time:
   *         type: string
   *         description: "0为上午，1为下午"
   *         enum:
   *           - "0"
   *           - "1"
   *       total:
   *         type: number
   *         description: "医生可以设置的面诊计数总数"
   *       count:
   *         type: number
   *         description: "已用的面诊计数，可用的面诊计数需要用total-count"
   *   ServiceSuspend:
   *     type: object
   *     properties:
   *       start:
   *         type: string
   *         format: date-time
   *       end:
   *         type: string
   *         format: date-time
   *   Schedule:
   *     type: object
   *     properties:
   *       day:
   *         type: string
   *         enum:
   *           - "Mon"
   *           - "Tue"
   *           - "Wed"
   *           - "Thur"
   *           - "Fri"
   *           - "Sat"
   *           - "Sun"
   *       time:
   *         type: string
   *         description: "0为上午，1为下午"
   *         enum:
   *           - "0"
   *           - "1"
   */

}

