
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
var doctorMonitorCtrl = require('../controllers_v2/doctorMonitor_controller')
var reportCtrl = require('../controllers_v2/report_controller')
var personalDiagCtrl = require('../controllers_v2/personalDiag_controller')
var doctorsInChargeCtrl = require('../controllers_v2/doctorsInCharge_controller')
var patientMonitorCtrl = require('../controllers_v2/patientMonitor_controller')

module.exports = function (app, webEntry, acl) {
  // app.get('/', function(req, res){
  //   res.send("Server Root");
  // });

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

  app.get(version + '/report', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), alluserCtrl.checkPatient, reportCtrl.getReport)
  app.post(version + '/report', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reportCtrl.updateReport)

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
  // YQC 2017-07-28 添加面诊余量更新函数 添加未来十四天内的面诊余量记录
  /** YQC annotation 2017-07-29 - acl 2017-07-29 医生
   * @swagger
   * /services/setSchedule:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "For a doctor, set a Personal Diagnosis service schedule"
   *     description: ""
   *     operationId: "setSchedule"
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
   *           - "day"
   *           - "time"
   *           - "total"
   *         properties:
   *           token:
   *             type: "string"
   *           day:
   *             type: "string"
   *             format: "YYYY-MM-DD"
   *           time:
   *             type: "string"
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *           total:
   *             type: "number"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/services/setSchedule', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.setServiceSchedule, serviceCtrl.getDaysToUpdate, serviceCtrl.updateAvailablePD1, serviceCtrl.updateAvailablePD2)
  app.post(version + '/services/deleteSchedule', tokenManager.verifyToken(), serviceCtrl.deleteServiceSchedule)
  // YQC 2017-07-29 医生设置面诊停诊 将可预约面诊和已预约面诊取消 已预约的取消未实现通知患者和退款
  /** YQC annotation 2017-07-29 - acl 2017-07-29 医生
   * @swagger
   * /services/setSuspend:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "For a doctor, set a Personal Diagnosis service suspension"
   *     description: ""
   *     operationId: "setSuspend"
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
   *           - "start"
   *           - "end"
   *         properties:
   *           token:
   *             type: "string"
   *           start:
   *             type: "string"
   *             format: "YYYY-MM-DD"
   *           end:
   *             type: "string"
   *             format: "YYYY-MM-DD"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/services/setSuspend', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.setServiceSuspend, serviceCtrl.suspendAvailablePds, serviceCtrl.cancelBookedPds)
  app.post(version + '/services/deleteSuspend', tokenManager.verifyToken(), serviceCtrl.deleteServiceSuspend)
  // 咨询问卷填写(新增自动转发功能)
  app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), counseltempCtrl.getSessionObject, counseltempCtrl.getDoctorObject, getNoMid.getNo(2), counseltempCtrl.saveQuestionaire, counseltempCtrl.counselAutoRelay)

  // YQC
  // comment
  /** YQC annotation 2017-07-20 - debug complete 2017-07-17 - acl 2017-07-25 患者获取医生评价
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
   *       description: "The userId of the Doctor to be queried."
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
  app.get(version + '/comment/commentsByDoc', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), commentCtrl.getDoctorObject, commentCtrl.getCommentsByDoc)
  /** YQC annotation 2017-07-20 - debug complete 2017-07-17 - acl 2017-07-25 患者获取咨询问诊评价
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
  app.get(version + '/comment/commentsByCounsel', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), commentCtrl.getCommentsByCounselId)
  // advice
  /** YQC annotation 17-07-24 - debug complete 2017-07-17 - acl 2017-07-25 管理员获取建议
   * @swagger
   * /advice/advices:
   *   get:
   *     tags:
   *     - "advice"
   *     summary: "Finds advices by advisorId"
   *     description: ""
   *     operationId: "advices"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "advisorId"
   *       in: "query"
   *       description: "UserId of the advisor to be queried."
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
   *                 $ref: '#/definitions/Advice'
   *       404:
   *         description: "AdvisorId not found."
   */
  app.get(version + '/advice/advices', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), adviceCtrl.getAdvice)
  /** YQC annotation 17-07-24 - debug complete 2017-07-17 - acl 2017-07-25 用户（患者／医生）提建议
   * @swagger
   * /advice/advice:
   *   post:
   *     tags:
   *     - "advice"
   *     summary: "Post an advice to the developer"
   *     description: ""
   *     operationId: "advice"
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
   *           - "topic"
   *           - "content"
   *         properties:
   *           token:
   *             type: "string"
   *           topic:
   *             type: "string"
   *           content:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Advice'
   */
  app.post(version + '/advice/advice', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), adviceCtrl.postAdvice)
  // compliance - debug complete 2017-07-17
  /** YQC 17-07-24
   * @swagger
   * /compliance/compliance:
   *   get:
   *     tags:
   *     - "compliance"
   *     summary: "Finds compliances by userId"
   *     description: ""
   *     operationId: "compliances"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "userId"
   *       in: "query"
   *       description: "UserId to be queried."
   *       required: false
   *       type: "string"
   *     - name: "date"
   *       in: "query"
   *       required: false
   *       type: "string"
   *       format: date-time
   *     - name: "type"
   *       in: "query"
   *       required: false
   *       type: "string"
   *     - name: "code"
   *       in: "query"
   *       required: false
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
   *                 $ref: '#/definitions/Compliance'
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/compliance/compliances', tokenManager.verifyToken(), complianceCtrl.getComplianceByDay)
  /** YQC 17-07-24
   * @swagger
   * /compliance/compliances:
   *   post:
   *     tags:
   *     - "compliance"
   *     summary: "update an compliance status"
   *     description: ""
   *     operationId: "compliance"
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
   *           - "date"
   *           - "type"
   *           - "code"
   *         properties:
   *           token:
   *             type: "string"
   *           date:
   *             type: "string"
   *             format: date-time
   *           type:
   *             type: "string"
   *           status:
   *             type: "number"
   *           description:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/compliance/compliance', tokenManager.verifyToken(), complianceCtrl.getCompliance, complianceCtrl.updateCompliance)
  // vitalSign 2017-07-14  - debug complete 2017-07-24
  /** YQC 17-07-24 - acl 2017-07-28 医生/患者
   * @swagger
   * /vitalSign/vitalSigns:
   *   get:
   *     tags:
   *     - "vitalSign"
   *     summary: "Finds vitalSigns by userId of certain patient"
   *     description: ""
   *     operationId: "vitalSigns"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
   *       required: true
   *       type: "string"
   *     - name: "PatientId"
   *       in: "query"
   *       description: "UserId to be queried."
   *       required: true
   *       type: "string"
   *     - name: "type"
   *       in: "query"
   *       required: false
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
   *                 $ref: '#/definitions/VitalSign'
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/vitalSign/vitalSigns', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSigns)
  /** YQC 17-07-24  - acl 2017-07-28 患者
   * @swagger
   * /vitalSign/vitalSigns:
   *   post:
   *     tags:
   *     - "vitalSign"
   *     summary: "Post/Update an vitalSign status"
   *     description: ""
   *     operationId: "vitalSigns"
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
   *           - "date"
   *           - "type"
   *           - "code"
   *           - "unit"
   *           - "datatime"
   *           - "datavalue"
   *         properties:
   *           token:
   *             type: "string"
   *           date:
   *             type: "string"
   *             format: date-time
   *           type:
   *             type: "string"
   *           code:
   *             type: "number"
   *           unit:
   *             type: "string"
   *           datatime:
   *             type: "string"
   *             format: date-time
   *           datavalue:
   *             type: "number"
   *           datavalue2:
   *             type: "number"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/vitalSign/vitalSign', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), aclChecking.Checking(acl, 2), vitalSignCtrl.getSessionObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData)
  // counsel 2017-07-17 debug 1-
  // 医生获取问诊信息
  app.get(version + '/counsel/counsels', tokenManager.verifyToken(), counselCtrl.getSessionObject, counselCtrl.getCounsels)
  app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), counselCtrl.getSessionObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire, counselCtrl.counselAutoRelay)
  app.get(version + '/counsel/status', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus)
  app.post(version + '/counsel/status', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus)
  app.post(version + '/counsel/type', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType)
  app.post(version + '/counsel/commentScore', tokenManager.verifyToken(), counselCtrl.getSessionObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore)
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
  /** YQC annotation 2017-07-28 - acl 2017-07-28 患者/医生
   * @swagger
   * /tasks/task:
   *   get:
   *     tags:
   *     - "tasks"
   *     summary: "获取患者任务"
   *     description: ""
   *     operationId: "task"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "userId"
   *       in: "query"
   *       description: "userId of a patient."
   *       required: true
   *       type: "string"
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
   *                 userId:
   *                   type: "string"
   *                 sortNo:
   *                   type: "number"
   *                 name:
   *                   type: "string"
   *                 date:
   *                   type: "string"
   *                   format: "date-time"
   *                 description:
   *                   type: "string"
   *                 invalidFlag:
   *                   type: "number"
   *                 task:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Task'
   */
  app.get(version + '/tasks/task', tokenManager.verifyToken(), tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.getUserTask)
  /** YQC annotation 2017-07-28 - acl 2017-07-28 医生
   * @swagger
   * /tasks/task:
   *   post:
   *     tags:
   *     - "tasks"
   *     summary: "Update the content of a task for a patient"
   *     description: ""
   *     operationId: "task"
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
   *           - "userId"
   *           - "type"
   *           - "code"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           type:
   *             type: "string"
   *           code:
   *             type: "string"
   *             format: date-time
   *           instruction:
   *             type: "number"
   *           content:
   *             type: string
   *           startTime:
   *             type: string
   *             format: "date-time"
   *           endTime:
   *             type: string
   *             format: "date-time"
   *           times:
   *             type: number
   *           timesUnits:
   *             type: string
   *           frequencyTimes:
   *             type: number
   *           frequencyUnits:
   *             type: string
   *           status:
   *             type: number
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/tasks/task', tokenManager.verifyToken(), tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent)
  // patient 2017-07-17
  /** YQC annotation 2017-07-27 - acl 2017-07-26 患者 - acl 2017-07-28 医生
   * @swagger
   * /patient/detail:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取患者详情（注释未完成）"
   *     description: ""
   *     operationId: "detail"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "userId"
   *       in: "query"
   *       description: "userId of a patient."
   *       required: true
   *       type: "string"
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
   *                 patient:
   *                   type: "object"
   *             weight:
   *               type: number
   *             recentDiagnosis:
   *               type: object
   *               properties:
   *                 name:
   *                   type: "string"
   *                 time:
   *                   type: "string"
   *                   format: "date-time"
   *                 hypertension:
   *                   type: "number"
   *                 progress:
   *                   type: "string"
   *                 operationTime:
   *                   type: "string"
   *                   format: "date-time"
   *                 content:
   *                   type: "string"
   *                 doctor:
   *                   type: "object"
   *                   properties:
   *                     userId:
   *                       type: "string"
   *                     name:
   *                       type: "string"
   *                     workUnit:
   *                       type: "string"
   *                     department:
   *                       type: "string"
   */
  app.get(version + '/patient/detail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getPatientDetail)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/detail:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Post a new personal file details of a patient"
   *     description: ""
   *     operationId: "detail"
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
   *         properties:
   *           token:
   *             type: "string"
   *           name:
   *             type: "string"
   *           photoUrl:
   *             type: "string"
   *           birthday:
   *             type: "string"
   *             format: date-time
   *           gender:
   *             type: "number"
   *           IDNo:
   *             type: "string"
   *           height:
   *             type: "number"
   *           weight:
   *             type: "number"
   *           occupation:
   *             type: "string"
   *           bloodType:
   *             type: "string"
   *           nation:
   *             type: "string"
   *           province:
   *             type: "string"
   *           city:
   *             type: "string"
   *           class:
   *             type: "string"
   *           class_info:
   *             type: "string"
   *           operationTime:
   *             type: "string"
   *             format: date-time
   *           hypertension:
   *             type: "number"
   *           allergic:
   *             type: "string"
   *           lastVisit:
   *             type: object
   *             properties:
   *               time:
   *                 type: "string"
   *                 format: date-time
   *               hospital:
   *                 type: "string"
   *               diagnosis:
   *                 type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/detail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.newPatientDetail)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/doctors:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取所有医生的列表（可分页／条件／模糊查询）（注释未完成）"
   *     description: ""
   *     operationId: "doctors"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       type: "string"
   *     - name: "district"
   *       in: "query"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       type: "number"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 doctor:
   *                   type: "object"
   */
  app.get(version + '/patient/doctors', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getDoctorLists)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者 【弃用，和myDoctorsIncharge重复】
   * @swagger
   * /patient/myDoctors:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取当前的主管医生（注释未完成）"
   *     description: ""
   *     operationId: "myDoctors"
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
   *                 doctor:
   *                   type: "object"
   */
  app.get(version + '/patient/myDoctors', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getMyDoctor)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/counselRecords:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取咨询记录"
   *     description: ""
   *     operationId: "counselRecords"
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
   *               type: array
   *               items:
   *                 CounselRecord:
   *                   type: "object"
   *                   properties:
   *                     time:
   *                       type: "string"
   *                       format: data-time
   *                     messages:
   *                       type: "string"
   *                     doctorId:
   *                       type: "object"
   *                       properties:
   *                         userId:
   *                           type: "string"
   *                         name:
   *                           type: "string"
   *                         photoUrl:
   *                           type: "string"
   */
  app.get(version + '/patient/counselRecords', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getSessionObject, patientCtrl.getCounselRecords)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/editDetail:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Edit personal file details of a patient"
   *     description: ""
   *     operationId: "editDetail"
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
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           name:
   *             type: "string"
   *           photoUrl:
   *             type: "string"
   *           birthday:
   *             type: "string"
   *             format: date-time
   *           gender:
   *             type: "number"
   *           IDNo:
   *             type: "string"
   *           height:
   *             type: "number"
   *           weight:
   *             type: "number"
   *           occupation:
   *             type: "string"
   *           bloodType:
   *             type: "string"
   *           nation:
   *             type: "string"
   *           province:
   *             type: "string"
   *           city:
   *             type: "string"
   *           class:
   *             type: "string"
   *           class_info:
   *             type: "string"
   *           operationTime:
   *             type: "string"
   *             format: date-time
   *           hypertension:
   *             type: "number"
   *           allergic:
   *             type: "string"
   *           lastVisit:
   *             type: object
   *             properties:
   *               time:
   *                 type: "string"
   *                 format: date-time
   *               hospital:
   *                 type: "string"
   *               diagnosis:
   *                 type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/editDetail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.editPatientDetail)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生/患者
   * @swagger
   * /patient/diagnosis:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Post a diagnosis of a patient"
   *     description: ""
   *     operationId: "diagnosis"
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
   *           - "patientId"
   *           - "doctorId"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *           diagname:
   *             type: "string"
   *           diagProgress:
   *             type: "string"
   *           diagContent:
   *             type: "string"
   *           diagTime:
   *             type: "string"
   *             format: date-time
   *           diagOperationTime:
   *             type: "string"
   *             format: date-time
   *           diagHypertension:
   *             type: "number"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/diagnosis', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getDoctorObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail)
  // bindingMyDoctor改为关注医生
  // app.post(version + '/patient/bindingMyDoctor', tokenManager.verifyToken(), patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 管理员
   * @swagger
   * /patient/changeVIP:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Change the VIP status of a patient"
   *     description: ""
   *     operationId: "changeVIP"
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
   *           - "userId"
   *           - "VIP"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           VIP:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/changeVIP', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.changeVIP)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/wechatPhotoUrl:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "患者头像不存在时自动使用微信头像"
   *     description: ""
   *     operationId: "wechatPhotoUrl"
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
   *           - "wechatPhotoUrl"
   *         properties:
   *           token:
   *             type: "string"
   *           wechatPhotoUrl:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/wechatPhotoUrl', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.wechatPhotoUrl)
  // doctor_Info
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/detail:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Post a basic file of a doctor"
   *     description: ""
   *     operationId: "detail"
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
   *         properties:
   *           token:
   *             type: "string"
   *           certificatePhotoUrl:
   *             type: "string"
   *           practisingPhotoUrl:
   *             type: "string"
   *           photoUrl:
   *             type: "string"
   *           birthday:
   *             type: "string"
   *             format: date-time
   *           gender:
   *             type: "number"
   *           IDNo:
   *             type: "string"
   *           province:
   *             type: "string"
   *           city:
   *             type: "string"
   *           district:
   *             type: "string"
   *           workUnit:
   *             type: "string"
   *           title:
   *             type: "string"
   *           job:
   *             type: "string"
   *           department:
   *             type: "string"
   *           major:
   *             type: "string"
   *           description:
   *             type: "string"
   *           charge1:
   *             type: "number"
   *           charge2:
   *             type: "number"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/detail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.insertDocBasic)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/myPatients:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取我的主管患者和关注患者（注释未完成）"
   *     description: ""
   *     operationId: "myPatients"
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
   *                 patients:
   *                   type: "array"
   *                   items:
   *                     Patient:
   *                       type: object
   *                 patientsInCharge:
   *                   type: "array"
   *                   items:
   *                     Patient:
   *                       type: object
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/myPatients', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSessionObject, doctorCtrl.getPatientList)
  /** YQC annotation 2017-07-27 - acl 2017-07-27 医生
   * @swagger
   * /doctor/myPatientsByDate:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "按日获取我的主管患者和关注患者（注释未完成）"
   *     description: ""
   *     operationId: "myPatientsByDate"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "date"
   *       in: "query"
   *       description: "查询日期，不填写则获取当日列表"
   *       required: false
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
   *                 patients:
   *                   type: "array"
   *                   items:
   *                     Patient:
   *                       type: object
   *                 patientsInCharge:
   *                   type: "array"
   *                   items:
   *                     Patient:
   *                       type: object
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/myPatientsByDate', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSessionObject, doctorCtrl.getPatientByDate)
  // app.get(version + '/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get(version + '/doctor/detail', tokenManager.verifyToken(), doctorCtrl.getSessionObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/myTeams:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取医生（我）所在的团队"
   *     description: ""
   *     operationId: "myTeams"
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
   *                 members:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamMember'
   *                 teamId:
   *                   type: "string"
   *                 name:
   *                   type: "string"
   *                 sponsorId:
   *                   type: "string"
   *                 sponsorName:
   *                   type: "string"
   *                 sponsorPhoto:
   *                   type: "string"
   *                 photoAddress:
   *                   type: "string"
   *                 time:
   *                   type: "string"
   *                   format: date-time
   *                 description:
   *                   type: "string"
   *                 number:
   *                   type: "number"
   *                   default: "1"
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/myTeams', tokenManager.verifyToken(), doctorCtrl.getTeams)
  app.get(version + '/doctor/teamPatients', tokenManager.verifyToken(), doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList)
  // app.get(version + '/doctor/team', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post(version + '/doctor/editDetail', tokenManager.verifyToken(), doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/myRecentDoctors:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取最近交流过的医生列表（注释未完成）"
   *     description: ""
   *     operationId: "myRecentDoctors"
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
   *                 doctors:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/RecentDoctor'
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/myRecentDoctors', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSessionObject, doctorCtrl.getRecentDoctorList)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/schedule:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Post/Update a schedule of a doctor"
   *     description: ""
   *     operationId: "schedule"
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
   *           - "day"
   *           - "time"
   *         properties:
   *           token:
   *             type: "string"
   *           day:
   *             type: "string"
   *             description: "排班日期(星期数)"
   *             enum:
   *               - "Mon"
   *               - "Tue"
   *               - "Wed"
   *               - "Thu"
   *               - "Fri"
   *               - "Sat"
   *               - "Sun"
   *           time:
   *             type: "string"
   *             description: "排班上下午"
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/schedule', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.insertSchedule)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/deleteSchedule:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Delete a schedule of a doctor"
   *     description: ""
   *     operationId: "deleteSchedule"
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
   *           - "day"
   *           - "time"
   *         properties:
   *           token:
   *             type: "string"
   *           day:
   *             type: "string"
   *             description: "排班日期(星期数)"
   *             enum:
   *               - "Mon"
   *               - "Tue"
   *               - "Wed"
   *               - "Thu"
   *               - "Fri"
   *               - "Sat"
   *               - "Sun"
   *           time:
   *             type: "string"
   *             description: "排班上下午"
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/deleteSchedule', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.deleteSchedule)
  // 获取排班（与面诊排班整合）
  app.get(version + '/doctor/schedules', tokenManager.verifyToken(), doctorCtrl.getSchedules)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/suspendTime:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Post/Update a suspend time of a doctor"
   *     description: ""
   *     operationId: "suspendTime"
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
   *           - "start"
   *           - "end"
   *         properties:
   *           token:
   *             type: "string"
   *           start:
   *             type: "string"
   *             format: date-time
   *           end:
   *             type: "string"
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/suspendTime', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.insertSuspendTime)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/deleteSuspendTime:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Delete a suspend time of a doctor"
   *     description: ""
   *     operationId: "deleteSuspendTime"
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
   *           - "start"
   *           - "end"
   *         properties:
   *           token:
   *             type: "string"
   *           start:
   *             type: "string"
   *             format: date-time
   *           end:
   *             type: "string"
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/deleteSuspendTime', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.deleteSuspendTime)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/suspendTime:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "Finds suspendTimes of certain doctor"
   *     description: ""
   *     operationId: "suspendTime"
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
   *                 serviceSuspendTime:
   *                   description: "面诊加号服务停诊信息"
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/SuspendTime'
   *                 suspendTime:
   *                   description: "工作停诊信息"
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/SuspendTime'
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/suspendTime', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSuspendTime)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生／患者／管理员
   * @swagger
   * /doctor/numbers:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "Finds the total number of registered doctors"
   *     description: ""
   *     operationId: "numbers"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: number
   */
  app.get(version + '/doctor/numbers', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getDocNum)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/AliPayAccount:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "Finds AliPayAccount by userId of certain doctor"
   *     description: ""
   *     operationId: "AliPayAccount"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "userId"
   *       in: "query"
   *       description: "UserId of the doctor to be queried."
   *       required: true
   *       type: "string"
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: string
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/doctor/AliPayAccount', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getAliPayAccount)
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/AliPayAccount:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Post/Update an AliPayAccount of a doctor"
   *     description: ""
   *     operationId: "AliPayAccount"
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
   *           - "aliPayAccount"
   *         properties:
   *           token:
   *             type: "string"
   *           aliPayAccount:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/AliPayAccount', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.editAliPayAccount)
  // 患者端 关注医生 2017-07-18
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/favoriteDoctor:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Follow a Doctor."
   *     description: ""
   *     operationId: "favoriteDoctor"
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
   *           - "doctorId"
   *         properties:
   *           token:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/favoriteDoctor', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.bindingFavoriteDoctor, patientCtrl.bindingFavoritePatient)
  // 患者端 取关医生 2017-07-21
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/unfollowFavoriteDoctor:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Unfollow a certain Favorite Doctor."
   *     description: ""
   *     operationId: "unfollowFavoriteDoctor"
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
   *           - "doctorId"
   *         properties:
   *           token:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/unfollowFavoriteDoctor', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.debindingFavoriteDoctor, patientCtrl.debindingFavoritePatient)
  // 患者端 获取关注医生列表 2017-07-19
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/myFavoriteDoctors:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "Finds the list of FavoriteDoctors, with the function of skip and limit.（注释未完成）"
   *     description: ""
   *     operationId: "myFavoriteDoctors"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
   *       required: true
   *       type: "string"
   *     - name: "skip"
   *       in: "query"
   *       description: "跳过显示."
   *       required: false
   *       type: "number"
   *     - name: "limit"
   *       in: "query"
   *       description: "限制显示."
   *       required: false
   *       type: "number"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 FavoriteDoctors:
   *                   type: array
   *                   items:
   *                     FavoriteDoctor:
   *                       type: object
   *             nexurl:
   *               type: string
   *               description: "下一页显示的请求路径"
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/patient/myFavoriteDoctors', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getMyFavoriteDoctors)
  // 患者端 申请主管医生 2017-07-18 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/doctorInCharge:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Post(with deleting current doctor-in-charge) a request to a doctor for service of doctor-in-charge"
   *     description: ""
   *     operationId: "doctorInCharge"
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
   *           - "doctorId"
   *           - "chargeDuration"
   *         properties:
   *           token:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *           chargeDuration:
   *             type: "string"
   *             description: "单位为月"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/doctorInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, serviceCtrl.addDoctorInCharge, serviceCtrl.addPatientInCharge, orderCtrl.getOrderNo, orderCtrl.updateOrder)
  // 患者端 获取主管医生信息 2017-07-20 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/myDoctorsInCharge:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "Finds the doctor-in-charge status, if there's any, of a patient.（注释未完成）"
   *     description: ""
   *     operationId: "myDoctorsInCharge"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
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
   *                 DoctorInCharge:
   *                   type: object
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/patient/myDoctorsInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorsInCharge)
  // 患者端 删除主管医生 2017-07-20 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/cancelDoctorInCharge:
   *   post:
   *     tags:
   *     - "patient"
   *     summary: "Cancel the service of Doctor-In-Charge"
   *     description: ""
   *     operationId: "cancelDoctorInCharge"
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
   *         properties:
   *           token:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/patient/cancelDoctorInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.deleteDoctorInCharge, serviceCtrl.deletePatientInCharge)
  // 患者端 判断关系 2017-07-21 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /services/relation:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "Finds the relaton between a patient and a doctor"
   *     description: "Define whether they are favorate doctor/patient or doctor/patient in charge"
   *     operationId: "relation"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
   *       required: true
   *       type: "string"
   *     - name: "doctorId"
   *       in: "query"
   *       description: "The userId of the doctor to be queried."
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             DIC:
   *               type: number
   *               enum:
   *                 - "0"
   *                 - "1"
   *               description: "1表示患者与医生之间为主管／被主管的关系，0则不是"
   *             FD:
   *               type: number
   *               enum:
   *                 - "0"
   *                 - "1"
   *               description: "1表示患者与医生之间为关注／被关注的关系，0则不是"
   */
  app.get(version + '/services/relation', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, serviceCtrl.relation)
  // 医生端 获取主管医生待审核请求列表 2017-07-19
  /** YQC annotation 2017-07-25  - acl 2017-07-25 医生
   * @swagger
   * /doctor/myPatientsToReview:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "Finds all patients demanding the service of supervising doctor from the doctor"
   *     description: ""
   *     operationId: "myPatientsToReview"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token of the user."
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
   *                 $ref: '#/definitions/PatientToReview'
   *             numberToReview:
   *               type: number
   */
  app.get(version + '/doctor/myPatientsToReview', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getPatientsToReview)
  // 医生端 审核主管患者 2017-07-21 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生
   * @swagger
   * /doctor/PatientInCharge:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Review the application from a patient demanding the service of supervising doctor"
   *     description: ""
   *     operationId: "PatientInCharge"
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
   *           - "patientId"
   *           - "reviewResult"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           reviewResult:
   *             type: "string"
   *             enum:
   *               - "consent"
   *               - "reject"
   *           rejectReason:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/doctor/PatientInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getPatientObject, serviceCtrl.reviewPatientInCharge, serviceCtrl.updateDoctorInCharge)
  // 医生端 获取排班（工作排班与面诊加号排班）信息 2017-07-19
  /** YQC annotation 2017-07-20 - acl 2017-07-25 医生
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
   *                   description: "面诊加号服务排班信息"
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSchedule'
   *                 Schedules:
   *                   description: "工作排班信息"
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Schedule'
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/services/mySchedules', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getMySchedules)
  // 患者端 获取医生面诊余量 权限-患者 2017-07-28 YQC
  /** YQC annotation 2017-07-27 - acl 2017-07-27 患者
   * @swagger
   * /services/availablePD:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "Finds infos of available personalDiag within 2 weeks"
   *     description: ""
   *     operationId: "availablePD"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "doctorId"
   *       in: "query"
   *       required: true
   *       type: "string"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               description: "某医生两周内的面诊加号服务信息"
   *               type: "array"
   *               items:
   *                 PersonalDiag:
   *                 type: object
   *                 properties:
   *                   day:
   *                     type: string
   *                     format: "YYYYMMDD"
   *                   time:
   *                     type: string
   *                     enum:
   *                       - "Morning"
   *                       - "Afternoon"
   *                   margin:
   *                     type: number
   *                     description: "某时段剩余可预约数量"
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PD Not Found"
   */
  app.get(version + '/services/availablePD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getAvailablePD)
  // 患者端 预约面诊 2017-07-27 YQC 生成了验证码但是验证码的发送还未实现
  /** YQC annotation 2017-07-27 - acl 2017-07-27 患者
   * @swagger
   * /services/personalDiagnosis:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "Book a personal Diagnosis service of a doctor"
   *     description: ""
   *     operationId: "personalDiagnosis"
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
   *           - "doctorId"
   *           - "day"
   *           - "time"
   *         properties:
   *           token:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *           day:
   *             type: "string"
   *             format: "YYYY-MM-DD"
   *           time:
   *             type: "string"
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *     responses:
   *       200:
   *         description: "Operation success."
   */
  app.post(version + '/services/personalDiagnosis', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(12), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, serviceCtrl.updatePDCapacityDown, serviceCtrl.newPersonalDiag, orderCtrl.getOrderNo, orderCtrl.updateOrder)
  // 患者端 取消面诊服务（至少提前三天) cancelMyPD 还没有和order退款连起来
  /** YQC annotation 2017-07-27 - acl 2017-07-27 患者
   * @swagger
   * /services/personalDiagnosis:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "Cancel a personal Diagnosis service for a patient"
   *     description: ""
   *     operationId: "personalDiagnosis"
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
   *           - "diagId"
   *         properties:
   *           token:
   *             type: "string"
   *             description: "医生的token"
   *           diagId:
   *             type: "string"
   *             description: "要确认的面诊ID"
   *     responses:
   *       201:
   *         description: "Cancel Success"
   *       304:
   *         description: "Not Modified"
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PD Not Found"
   *       406:
   *         description: "Exceeds the Time Limit"
   *       412:
   *         description: "Please Check Input of diagId"
   */
  app.post(version + '/services/cancelMyPD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.cancelMyPD, serviceCtrl.updatePDCapacityUp)
  // 患者端 我的面诊服务列表 还未添加分页显示
  /** YQC annotation 2017-07-28 - acl 2017-07-28 患者
   * @swagger
   * /services/myPD:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "Finds infos of already booked personalDiag for a patient"
   *     description: ""
   *     operationId: "myPD"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "患者的token"
   *       required: true
   *       type: "string"
   *     - name: "status"
   *       in: "query"
   *       description: "要查询的面诊服务状态类型，不填写status则返回未开始的面诊服务列表,0: 未开始，1: 已完成，2: 未进行自动结束，3: 患者取消，4: 医生停诊或取消"
   *       required: false
   *       type: "number"
   *       enum:
   *         - "0"
   *         - "1"
   *         - "2"
   *         - "3"
   *         - "4"
   *     - name: "day"
   *       in: "query"
   *       description: "要查询的面诊日期，不填写则返回所有面诊服务列表，格式为YYYY-MM-DD"
   *       required: false
   *       type: "string"
   *       format: "YYYY-MM-DD"
   *     - name: "time"
   *       in: "query"
   *       description: "要查询的面诊日期时段，不填写则返回所有时段面诊服务列表"
   *       required: false
   *       type: "string"
   *       enum:
   *         - "Morning"
   *         - "Afternoon"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/PersonalDiagInfoForPat'
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PDs Not Found"
   */
  app.get(version + '/services/myPD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getMyPDs)
  // 医生端 获取预约面诊患者列表 还未添加分页显示
  /** YQC annotation 2017-07-28 - acl 2017-07-28 患者
   * @swagger
   * /services/myPDpatients:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "Finds booked personalDiag List for a doctor"
   *     description: ""
   *     operationId: "myPDpatients"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "医生的token"
   *       required: true
   *       type: "string"
   *     - name: "status"
   *       in: "query"
   *       description: "要查询的面诊服务状态类型，不填写status则返回未开始的面诊服务列表,0: 未开始，1: 已完成，2: 未进行自动结束，3: 患者取消，4: 医生停诊或取消"
   *       required: false
   *       type: "number"
   *       enum:
   *         - "0"
   *         - "1"
   *         - "2"
   *         - "3"
   *         - "4"
   *     - name: "day"
   *       in: "query"
   *       description: "要查询的面诊日期，不填写则返回所有面诊服务列表，格式为YYYY-MM-DD"
   *       required: false
   *       type: "string"
   *       format: "YYYY-MM-DD"
   *     - name: "time"
   *       in: "query"
   *       description: "要查询的面诊日期时段，不填写则返回所有时段面诊服务列表"
   *       required: false
   *       type: "string"
   *       enum:
   *         - "Morning"
   *         - "Afternoon"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/PersonalDiagInfoForDoc'
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PDs Not Found"
   */
  app.get(version + '/services/myPDpatients', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getPDPatients)
  // 医生端 确认面诊服务
  /** YQC annotation 2017-07-28 - acl 2017-07-28 医生
   * @swagger
   * /services/PDConfirmation:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "For a doctor, confirm a Personal Diagnosis service with a code from a patient"
   *     description: ""
   *     operationId: "PDConfirmation"
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
   *           - "diagId"
   *           - "code"
   *         properties:
   *           token:
   *             type: "string"
   *             description: "医生的token"
   *           diagId:
   *             type: "string"
   *             description: "要确认的面诊ID"
   *           code:
   *             type: "string"
   *             description: "患者提供的验证码"
   *     responses:
   *       201:
   *         description: "Confirmation Success"
   *       412:
   *         description: "Please Check Input of diagId, code"
   *       406:
   *         description: "Wrong Code"
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PD Not Found"
   *       304:
   *         description: "Not Modified"
   */
  app.post(version + '/services/PDConfirmation', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.confirmPD)

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
 * /account/accountInfo:
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
 * /account/counts:
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
 * /account/counts:
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
 * /account/freeTime:
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
 * /account/countsRespective:
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
 * /expense/doctor:
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
 *             - doctorId
 *             - type
 *             - money
 *             - status
 *           properties:
 *             token:
 *               type: string
 *             doctorId:
 *               type: string
 *             type:
 *               type: string
 *             money:
 *               type: number
 *             status:
 *               type: number
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
  app.post(version + '/expense/doctor', tokenManager.verifyToken(), alluserCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
 /**
 * @swagger
 * /expense/records:
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
 * /healthInfo/healthInfos:
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
 * /healthInfo/healthDetail:
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
 * /healthInfo/healthInfo:
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
 * /healthInfo/healthDetail:
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
 * /healthInfo/deleteHealthDetail:
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
 * /insurance/message:
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
 * /insurance/message:
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
 * /insurance/prefer:
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
 * /insurance/prefer:
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
 * /message/messages:
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
 * /message/status:
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
 * /message/message:
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
 * /order/order:
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
 * /order/order:
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
 * /upload:
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
 * /new/news:
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
 * /new/newsByReadOrNot:
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
 * /new/news:
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
 * /new/teamNews:
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
 /**
 * @swagger
 * definition:
 *   Results:
 *     type: object
 *     properties:
 *       data:
 *         type: array
 *         item:
 *           type: number
 *       recordTime:
 *         type: array
 *         item:
 *           type: date
 */
 /**
 * @swagger
 * /report/vitalSigns:
 *   get:
 *     operationId: getVitalSigns
 *     tags:
 *       - Report
 *     description: 获取患者当前周月季年的测量记录
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: 授权信息
 *         in: query
 *         required: true
 *         type: string
 *       - name: time
 *         description: 患者请求查询的时间
 *         in: query
 *         required: true
 *         type: date
 *       - name: type
 *         description: 任务类型
 *         in: query
 *         required: true
 *         type: string
 *       - name: code
 *         description: 检测项目
 *         in: query
 *         required: true
 *         type: string
 *       - name: showType
 *         description: 绘制图表类型
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 返回相应数据和记录时间
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Results'
 *       500:
 *         description: Server internal error
 */
  app.get(version + '/report/vitalSigns', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), reportCtrl.getVitalSigns)

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
  app.get(version + '/token/refresh', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), tokenManager.refreshToken)

  // dict
  // 2017-07-24测试 权限：admin
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
  app.get(version + '/dict/typeTwo', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictTypeTwoCtrl.getCategory)
  // 2017-07-24测试 权限：admin
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
  app.get(version + '/dict/typeTwo/codes', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictTypeTwoCtrl.getTypes)
  // 2017-07-24测试 权限：admin
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
  app.get(version + '/dict/typeOne', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictTypeOneCtrl.getCategory)
  // 2017-07-24测试 权限：admin
  /**
   * @swagger
   * /dict/district:
   *   get:
   *     tags:
   *       - 字典
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: level
   *         in: query
   *         type: integer
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: district
   *         in: query
   *         type: string
   *       - name: name
   *         in: query
   *         type: string
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回地区信息
   *         schema:
   *            type: object
   *            $ref: '#/definitions/DistrictResult'
   * definition:
   *   DistrictResult:
   *     type: object
   *     properties:
   *       results:
   *         type: object
   *         $ref: '#/definitions/District'
   *   District:
   *     type: object
   *     properties:
   *       code:
   *         type: string
   *       province:
   *         type: string
   *       city:
   *         type: string
   *       district:
   *         type: string
   *       name:
   *         type: string
   *       level:
   *         type: integer
   */

  app.get(version + '/dict/district', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictDistrictCtrl.getDistrict)
  // 2017-07-24测试 权限：admin
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
   *       - name: city
   *         in: query
   *         type: string
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医院信息
   *         schema:
   *           type: object
   *           $ref: '#/definitions/HospitalResult'
   * definition:
   *   HospitalResult:
   *     type: object
   *     properties:
   *       results:
   *         type: object
   *         $ref: '#/definitions/Hospital'
   *   Hospital:
   *     type: object
   *     properties:
   *       locatiopnCode:
   *         type: string
   *       hospitalCode:
   *         type: string
   *       hospitalName:
   *         type: string
   *       province:
   *         type: string
   *       city:
   *         type: string
   *       district:
   *         type: string
   *       alias:
   *         type: string
   *       inputCode:
   *         type: string
   */
  app.get(version + '/dict/hospital', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictHospitalCtrl.getHospital)

  // devicedata
  // 2017-07-24测试 权限：patient
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
   *       token:
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
  app.post(version + '/devicedata/BPDevice/binding', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), devicedataCtrl.bindingDevice)
  // 2017-07-24测试 权限：patient
  /**
   * @swagger
   * /devicedata/BPDevice/debinding:
   *   post:
   *     tags:
   *       - 血压计
   *     description: 解绑血压计
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Debinding'
   *     responses:
   *       200:
   *         decription: 解绑成功
   * definition:
   *    Debinding:
   *      type: object
   *      properties:
   *        userId:
   *          type: string
   *        appId:
   *          type: string
   *        sn:
   *          type: string
   *        imei:
   *          type: string
   */
  app.post(version + '/devicedata/BPDevice/debinding', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), devicedataCtrl.debindingDevice)
  /**
   *
   */
  app.post(version + '/devicedata/BPDevice/data', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), devicedataCtrl.receiveBloodPressure)
  app.get(version + '/devicedata/devices', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), devicedataCtrl.getDeviceInfo)

  // wechat
  app.get(version + '/wechat/settingConfig', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.settingConfig)
  // 获取用户基本信息
  app.get(version + '/wechat/getUserInfo', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.getuserinfo)
  app.get(version + '/wechat/gettokenbycode', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken)
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign

  // 输入：微信用户授权的code 商户系统生成的订单号, aclChecking.Checking(acl, 2)
  app.post(version + '/wechat/addOrder', tokenManager.verifyToken(), alluserCtrl.checkDoctor, getNoMid.getNo(7), alluserCtrl.getAlluserObject, alluserCtrl.getDoctorObject, orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder, wechatCtrl.getPaySign)

  // 输入：微信用户授权的code 商户系统生成的订单号

//   app.post(version + '/wechat/addOrder', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder, wechatCtrl.getPaySign)

  // 订单支付结果回调
  app.post(version + '/wechat/payResult', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.payResult)
  // 查询订单   orderNo
  app.get(version + '/wechat/getWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.getWechatOrder)
  // 关闭订单   orderNo
  app.get(version + '/wechat/closeWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.closeWechatOrder)

  // app.post(version + '/wechat/refund', orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund)
  // 退款接口
  app.post(version + '/wechat/refund', tokenManager.verifyToken(), aclChecking.Checking(acl), orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund, wechatCtrl.refundMessage)
  // 退款查询
  app.post('/wechat/refundquery', tokenManager.verifyToken(), aclChecking.Checking(acl), orderCtrl.checkPayStatus('refundquery'), wechatCtrl.chooseAppId, wechatCtrl.refundquery, orderCtrl.refundChangeStatus())
  // 消息模板
  app.post(version + '/wechat/messageTemplate', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  // 下载
  app.get(version + '/wechat/download', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.download)
  // 创建永久二维码
  app.post(version + '/wechat/createTDCticket', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.createTDCticket, alluserCtrl.setTDCticket)

  // 接收微信服务器的post请求
  app.post(version + '/wechat', wechatCtrl.receiveTextMessage)
  // 接收微信服务器的get请求
  app.get(version + '/wechat', wechatCtrl.getServerSignature)

  // 自定义菜单
  app.post(version + '/wechat/createCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.createCustomMenu)
  app.get(version + '/wechat/getCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.getCustomMenu)
  app.get(version + '/wechat/deleteCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.deleteCustomMenu)

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

  /**
   * @swagger
   * /department/district:
   *   get:
   *     tags:
   *       - 科室表
   *     description: 获取地区信息
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: district
   *         description: 地区名
   *         in: query
   *         type: string
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回地区和地区负责人
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 district:
   *                   type: string
   *                 portleader:
   *                   type: array
   *                   items:
   *                     type: string
   */
  app.get(version + '/department/district', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.getDistrict)
  app.get(version + '/department/department', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.getDepartment)
  app.get(version + '/department/doctorlist', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.getDoctorList)
  app.post(version + '/department/updatedistrict', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.updateDistrict)
  app.post(version + '/department/updatedepartment', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.updateDepartment)
  app.post(version + '/department/delete', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.deleteRecord)

  // 医生数据监控
  app.get(version + '/doctormonitor/distribution', doctorMonitorCtrl.getDistribution)
  app.get(version + '/doctormonitor/linegraph', doctorMonitorCtrl.getLinegraph)
  app.get(version + '/doctormonitor/workload', doctorMonitorCtrl.getWorkload)
  app.get(version + '/doctormonitor/counseltimeout', doctorMonitorCtrl.getCounseltimeout)
  app.get(version + '/doctormonitor/departmentcounsel', doctorMonitorCtrl.getDepartmentCounsel)
  app.get(version + '/doctormonitor/score', doctorMonitorCtrl.getScore)
  app.get(version + '/doctormonitor/order', doctorMonitorCtrl.getOrder)

  // 患者数据监控
  app.get(version + '/patientmonitor/distribution', patientMonitorCtrl.getDistribution)
  app.get(version + '/patientmonitor/linegraph', patientMonitorCtrl.getLinegraph)
  app.get(version + '/patientmonitor/insurance', patientMonitorCtrl.getInsurance)
  app.get(version + '/patientmonitor/patientsbyclass', patientMonitorCtrl.getPatientsByClass)

  /**
   * @swagger
   * definition:
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
   *           - "Thu"
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
   *           - "Thu"
   *           - "Fri"
   *           - "Sat"
   *           - "Sun"
   *       time:
   *         type: string
   *         description: "0为上午，1为下午"
   *         enum:
   *           - "0"
   *           - "1"
   *   SuspendTime:
   *     type: object
   *     properties:
   *       start:
   *         type: string
   *         format: date-time
   *       end:
   *         type: string
   *         format: date-time
   *   Advice:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       role:
   *         type: string
   *         enum:
   *           - "doctor"
   *           - "patient"
   *       time:
   *         type: string
   *         format: date-time
   *       topic:
   *         type: string
   *       content:
   *         type: string
   *   Compliance:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       type:
   *         type: string
   *       code:
   *         type: string
   *       date:
   *         type: string
   *         format: date-time
   *       status:
   *         type: number
   *       description:
   *         type: string
   *   VitalSign:
   *     type: object
   *     properties:
   *       patientId:
   *         type: string
   *       type:
   *         type: string
   *       code:
   *         type: string
   *       date:
   *         type: string
   *         format: date-time
   *       data:
   *         type: array
   *         items:
   *           type: object
   *           properties:
   *             time:
   *               type: string
   *               format: date-time
   *             value:
   *                type: string
   *             value2:
   *               type: string
   *               description: "血压用"
   *       unit:
   *         type: string
   *   PatientToReview:
   *     type: object
   *     properties:
   *       dpRelationTime:
   *         type: string
   *         format: date-time
   *       invalidFlag:
   *         type: number
   *         enum:
   *           - "0"
   *           - "1"
   *           - "2"
   *           - "3"
   *         description: "0为待审核，1为当前主管，2为历史主管，3为申请拒绝"
   *       length:
   *         type: number
   *         description: "单位为月"
   *       patientId:
   *         type: object
   *         properties:
   *           userId:
   *             type: string
   *           photoUrl:
   *             type: string
   *           name:
   *             type: string
   *           gender:
   *             type: number
   *           birthday:
   *             type: string
   *             format: date-time
   *           class:
   *             type: string
   *           class_info:
   *             type: array
   *             items:
   *               type: string
   *   RecentDoctor:
   *     type: object
   *     properties:
   *       lastTalkTime:
   *         type: string
   *         format: date-time
   *       doctorId:
   *         type: object
   *   TeamMember:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       photoUrl:
   *         type: string
   *   Task:
   *     type: object
   *     properties:
   *       type:
   *         type: string
   *       details:
   *         type: array
   *         items:
   *           $ref: '#/definitions/TaskDetail'
   *   TaskDetail:
   *     type: object
   *     properties:
   *       code:
   *         type: string
   *       instruction:
   *         type: string
   *       content:
   *         type: string
   *       startTime:
   *         type: string
   *         format: "date-time"
   *       endTime:
   *         type: string
   *         format: "date-time"
   *       times:
   *         type: number
   *       timesUnits:
   *         type: string
   *       frequencyTimes:
   *         type: number
   *       frequencyUnits:
   *         type: string
   *       status:
   *         type: number
   *   PersonalDiagInfoForDoc:
   *     type: object
   *     properties:
   *       diagId:
   *         type: "string"
   *       patientId:
   *         type: object
   *         $ref: '#/definitions/Patient'
   *       bookingDay:
   *         type: "string"
   *         format: "date-time"
   *       bookingTime:
   *         type: "string"
   *         enum:
   *           - "Morning"
   *           - "Afternoon"
   *       creatTime:
   *         type: "string"
   *         format: "date-time"
   *       endTime:
   *         type: "string"
   *         format: "date-time"
   *       status:
   *         type: "number"
   *   PersonalDiagInfoForPat:
   *     type: object
   *     properties:
   *       diagId:
   *         type: "string"
   *       doctorId:
   *         type: object
   *         $ref: '#/definitions/Doctor'
   *       bookingDay:
   *         type: "string"
   *         format: "date-time"
   *       bookingTime:
   *         type: "string"
   *         enum:
   *           - "Morning"
   *           - "Afternoon"
   *       creatTime:
   *         type: "string"
   *         format: "date-time"
   *       endTime:
   *         type: "string"
   *         format: "date-time"
   *       status:
   *         type: "number"
   *   Doctor:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       birthday:
   *         type: string
   *         format: "date-time"
   *       gender:
   *         type: number
   *         enum:
   *           - "1"
   *           - "2"
   *       phoneNo:
   *         type: string
   *       photoUrl:
   *         type: string
   *   Patient:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       birthday:
   *         type: string
   *         format: "date-time"
   *       gender:
   *         type: number
   *         enum:
   *           - "1"
   *           - "2"
   *       phoneNo:
   *         type: string
   *       photoUrl:
   *         type: string
   *       height:
   *         type: string
   *       weight:
   *         type: string
   *       occupation:
   *         type: string
   *       bloodType:
   *         type: number
   *       address:
   *         type: object
   *         properties:
   *           nation:
   *             type: string
   *           province:
   *             type: string
   *           city:
   *             type: string
   *       class:
   *         type: string
   *       class_info:
   *         type: array
   *         items:
   *           type: string
   *       operationTime:
   *         type: string
   *       VIP:
   *         type: number
   *       hypertension:
   *         type: number
   *       allergic:
   *         type: string
   *       diagnosisInfo:
   *         type: array
   *         items:
   *           $ref: '#/definitions/DiagnosisInfo'
   *   DiagnosisInfo:
   *     type: object
   *     properties:
   *       name:
   *         type: string
   *       time:
   *         type: string
   *         format: date-time
   *       hypertension:
   *         type: number
   *       progress:
   *         type: string
   *       operationTime:
   *         type: string
   *         format: date-time
   *       content:
   *         type: string
   *       doctor:
   *         type: object
   *         $ref: '#/definitions/Doctor'
   */
}
