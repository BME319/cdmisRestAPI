
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
var dictTypeOneCtrl = require('../controllers/dictTypeOne_controller')
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller')
var dictDistrictCtrl = require('../controllers/dictDistrict_controller')
var dictHospitalCtrl = require('../controllers/dictHospital_controller')

var commentCtrl = require('../controllers_v2/comment_controller')
var adviceCtrl = require('../controllers_v2/advice_controller')
var complianceCtrl = require('../controllers_v2/compliance_controller')
var vitalSignCtrl = require('../controllers_v2/vitalSign_controller')
var patientCtrl = require('../controllers_v2/patient_controller')
var doctorCtrl = require('../controllers_v2/doctor_controller')
// var wechatCtrl = require('../controllers_v2/wechat_controller')
var counselCtrl = require('../controllers_v2/counsel_controller')
var communicationCtrl = require('../controllers_v2/communication_controller')
var taskCtrl = require('../controllers_v2/task_controller')
var accountCtrl = require('../controllers_v2/account_controller')
var insuranceCtrl = require('../controllers_v2/insurance_controller')
var healthInfoCtrl = require('../controllers_v2/healthInfo_controller')
var loadCtrl = require('../controllers_v2/load_controller')
var messageCtrl = require('../controllers_v2/message_controller')
var newsCtrl = require('../controllers_v2/news_controller')

module.exports = function (app, webEntry, acl) {
  // app.get('/', function(req, res){
  //   res.send("Server Root");
  // });

  // 刷新token
  app.get(version + '/token/refresh', tokenManager.verifyToken(), tokenManager.refreshToken)

  // dict
  app.get(version + '/dict/typeTwo', tokenManager.verifyToken(), dictTypeTwoCtrl.getCategory)
  app.get(version + '/dict/typeTwo/codes', tokenManager.verifyToken(), dictTypeTwoCtrl.getTypes)
  app.get(version + '/dict/typeOne', tokenManager.verifyToken(), dictTypeOneCtrl.getCategory)
  app.get(version + '/dict/district', tokenManager.verifyToken(), dictDistrictCtrl.getDistrict)
  app.get(version + '/dict/hospital', tokenManager.verifyToken(), dictHospitalCtrl.getHospital)

  // csq
  app.post(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl), alluserCtrl.changerole)
  app.post(version + '/acl/removeUserRoles', tokenManager.verifyToken(), aclsettingCtrl.removeUserRoles(acl), alluserCtrl.changerole)
  app.get(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.userRoles(acl))
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

  // devicedata
  app.post(version + '/devicedata/BPDevice/binding', tokenManager.verifyToken(), devicedataCtrl.bindingDevice)
  app.post(version + '/devicedata/BPDevice/debinding', tokenManager.verifyToken(), devicedataCtrl.debindingDevice)
  app.post(version + '/devicedata/BPDevice/data', tokenManager.verifyToken(), devicedataCtrl.receiveBloodPressure)
  app.get(version + '/devicedata/devices', tokenManager.verifyToken(), devicedataCtrl.getDeviceInfo)

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
  // 患者端 获取关注医生列表 2017-07-19
  app.get(version + '/patient/myFavoriteDoctors', tokenManager.verifyToken(), patientCtrl.getMyFavoriteDoctors)
  // 患者端 申请主管医生 2017-07-18
  app.post(version + '/patient/doctorInCharge', tokenManager.verifyToken(), serviceCtrl.requestDoctorInCharge, serviceCtrl.addPatientInCharge)
  // 患者端 获取主管医生信息 2017-07-20
  app.get(version + '/patient/myDoctorsInCharge', tokenManager.verifyToken(), serviceCtrl.getDoctorsInCharge)
  // 患者端 删除主管医生 2017-07-20
  app.post(version + '/patient/cancelDoctorInCharge', tokenManager.verifyToken(), serviceCtrl.getMyDoctorInCharge, serviceCtrl.deleteDoctorInCharge, serviceCtrl.getPatientInCharge, serviceCtrl.deletePatientInCharge)
  // 医生端 获取主管医生待审核请求列表 2017-07-19
  app.get(version + '/doctor/myPatientsToReview', tokenManager.verifyToken(), serviceCtrl.getPatientsToReview)
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
  app.get(version + '/account/accountInfo', tokenManager.verifyToken(), accountCtrl.getAccountInfo)
  app.get(version + '/account/counts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts)
  app.post(version + '/account/counts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts)
  app.post(version + '/account/freeTime', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.updateFreeTime)
  app.get(version + '/account/countsRespective', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.getCountsRespective)

  app.post(version + '/expense/doctor', tokenManager.verifyToken(), doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
  app.get(version + '/expense/records', tokenManager.verifyToken(), expenseCtrl.getRecords)

  // healthInfo
  app.get(version + '/healthInfo/healthInfos', tokenManager.verifyToken(), healthInfoCtrl.getAllHealthInfo)
  app.get(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), healthInfoCtrl.getHealthDetail)
  app.post(version + '/healthInfo/healthInfo', tokenManager.verifyToken(), healthInfoCtrl.insertHealthInfo)
  app.post(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), healthInfoCtrl.modifyHealthDetail)
  app.post(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), healthInfoCtrl.deleteHealthDetail)

  // insurance
  app.post(version + '/insurance/message', tokenManager.verifyToken(), insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage)
  app.get(version + '/insurance/message', tokenManager.verifyToken(), insuranceCtrl.getInsMsg)
  app.post(version + '/insurance/prefer', tokenManager.verifyToken(), insuranceCtrl.setPrefer)
  app.get(version + '/insurance/prefer', tokenManager.verifyToken(), insuranceCtrl.getPrefer)

  // message
  app.get(version + '/message/messages', tokenManager.verifyToken(), messageCtrl.getMessages)
  app.post(version + '/message/status', tokenManager.verifyToken(), messageCtrl.changeMessageStatus)
  app.post(version + '/message/message', tokenManager.verifyToken(), getNoMid.getNo(6), messageCtrl.insertMessage)

  // order
  // app.post(version + '/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post(version + '/order/order', tokenManager.verifyToken(), orderCtrl.updateOrder)
  app.get(version + '/order/order', tokenManager.verifyToken(), orderCtrl.getOrder)

  // load
  app.post(version + '/upload', tokenManager.verifyToken(), loadCtrl.uploadphoto(), loadCtrl.upload)

  // news
  app.get(version + '/new/news', tokenManager.verifyToken(), newsCtrl.getNews)
  app.get(version + '/new/newsByReadOrNot', tokenManager.verifyToken(), newsCtrl.getNewsByReadOrNot)
  app.post(version + '/new/news', tokenManager.verifyToken(), newsCtrl.insertNews)
  app.post(version + '/new/teamNews', tokenManager.verifyToken(), newsCtrl.insertTeamNews)

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
