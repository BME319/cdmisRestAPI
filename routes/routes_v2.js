
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
var errorHandler = require('../middlewares/errorHandler')

// controllers
var aclsettingCtrl = require('../controllers_v2/aclsetting_controller')
var niaodaifuCtrl = require('../controllers_v2/niaodaifu_controller')
var alluserCtrl = require('../controllers_v2/alluser_controller')
var devicedataCtrl = require('../controllers_v2/devicedata_controller')
var reviewCtrl = require('../controllers_v2/review_controller')
var labtestImportCtrl = require('../controllers_v2/labtestImport_controller')
var serviceCtrl = require('../controllers_v2/service_controller')
var orderCtrl = require('../controllers_v2/order_controller')
var wechatCtrl = require('../controllers_v2/wechat_controller')
// var counseltempCtrl = require('../controllers_v2/counseltemp_controller')
// var expenseCtrl = require('../controllers_v2/expense_controller')
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
var counseltimeoutCtrl = require('../controllers_v2/counseltimeout_controller')
var nurseInsuranceWorkCtrl = require('../controllers_v2/nurseInsuranceWork_controller')
var forumCtrl = require('../controllers_v2/forum_controller')
var departmentMonitorCtrl = require('../controllers_v2/departmentMonitor_controller')
var policyCtrl = require('../controllers_v2/policy_controller')
var districtMonitorCtrl = require('../controllers_v2/districtMonitor_controller')
var departmentReportTempCtrl = require('../controllers_v2/departmentReportTemp_controller')

module.exports = function (app, webEntry, acl) {
  // app.get('/', function(req, res){
  //   res.send("Server Root");
  // });

  // csq
  app.post(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl), errorHandler.error, alluserCtrl.changerole)
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
  /**
   * @swagger
   * definition:
   *   User:
   *     type: object
   *     properties:
   *       role:
   *         type: string
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *   Doctor1:
   *     type: object
   *     properties:
   *       role:
   *         type: string
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       workUnit:
   *         type: string
   *       department:
   *         type: string
   *       title:
   *         type: string
   *       count1:
   *         type: number
   *       count2:
   *         type: number
   *       score:
   *         type: number
   *       description:
   *         type: string
   *       major:
   *         type: string
   *   Patient1:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       VIP:
   *         type: number
   *       IDNo:
   *         type: string
   *       class:
   *         type: string
   *       hypertension:
   *         type: number
   *       bloodType:
   *         type: string
   *       height:
   *         type: string
   *       weight:
   *         type: number
   *       class_info:
   *             type: string
   *       birthday:
   *         type: string
   *         format: date-time
   *       allergic:
   *         type: string
   *   Nurse:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       workUnit:
   *         type: string
   *       department:
   *         type: string
   *       workAmounts:
   *         type: number
   *   Insurance:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       boardingTime:
   *         type: string
   *         format: date-time
   *       workAmounts:
   *         type: number
   *       role:
   *         type: string
   *   Health:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       boardingTime:
   *         type: string
   *         format: date-time
   *       workAmounts:
   *         type: number
   *   Admin:
   *     type: object
   *     properties:
   *       userId:
   *         type: string
   *       name:
   *         type: string
   *       gender:
   *         type: number
   *       phoneNo:
   *         type: string
   *       creationTime:
   *         type: string
   *         format: date-time
   *       workUnit:
   *         type: number
   */
  /**
   * @swagger
   * /alluser/count:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型统计用户数量"
   *     operationId: countAlluserList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role1"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "role2"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "string"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: "number"
   *       500:
   *         description: Server internal error
   */
  // 根据类型统计用户数量 权限 admin
  app.get(version + '/alluser/count', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.countAlluserList)
  /**
   * @swagger
   * /alluser/userList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取用户列表"
   *     operationId: getUserList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/User'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取用户列表 权限 admin
  app.get(version + '/alluser/userList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(0))
  /**
   * @swagger
   * /alluser/doctorList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取医生列表"
   *     operationId: getDoctorList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Doctor'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取医生列表 权限 admin
  app.get(version + '/alluser/doctorList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(1))
  /**
   * @swagger
   * /alluser/patientList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取患者列表"
   *     operationId: getPatientList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Patient1'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取患者列表 权限 admin
  app.get(version + '/alluser/patientList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(2))
  /**
   * @swagger
   * /alluser/nurseList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取护士列表"
   *     operationId: getNurseList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Nurse'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取护士列表 权限 admin
  app.get(version + '/alluser/nurseList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(3))
  /**
   * @swagger
   * /alluser/insuranceList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取保险专员列表"
   *     operationId: getInsuranceList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Insurance'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取保险专员列表 权限 admin
  app.get(version + '/alluser/insuranceList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(4))
  /**
   * @swagger
   * /alluser/healthList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取健康专员列表"
   *     operationId: getHealthList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Health'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取健康专员列表 权限 admin
  app.get(version + '/alluser/healthList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(5))
  /**
   * @swagger
   * /alluser/adminList:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "根据类型获取管理员列表"
   *     operationId: getAdminList
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "授权信息"
   *       required: true
   *       type: "string"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       description: ""
   *       type: "number"
   *     - name: "userId"
   *       in: "query"
   *       required: false
   *       description: "用户ID"
   *       type: "string"
   *     - name: "role"
   *       in: "query"
   *       required: false
   *       description: "用户角色"
   *       type: "string"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       description: "用户姓名"
   *       type: "string"
   *     - name: "phoneNo"
   *       in: "query"
   *       required: false
   *       description: "用户手机号"
   *       type: "string"
   *     - name: "gender"
   *       in: "query"
   *       required: false
   *       description: "性别"
   *       type: "number"
   *     - name: "class"
   *       in: "query"
   *       required: false
   *       description: "疾病类型"
   *       type: "string"
   *     - name: "province"
   *       in: "query"
   *       required: false
   *       description: "省"
   *       type: "string"
   *     - name: "city"
   *       in: "query"
   *       required: false
   *       description: "市"
   *       type: "string"
   *     - name: "workUnit"
   *       in: "query"
   *       required: false
   *       description: "工作单位"
   *       type: "string"
   *     - name: "title"
   *       in: "query"
   *       required: false
   *       description: "职称"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 userList:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Admin'
   *       500:
   *         description: Server internal error
   */
  // 根据类型获取管理员列表 权限 admin
  app.get(version + '/alluser/adminList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserList(6))
  /**
   * @swagger
   * /alluser/alluser:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 更新用户信息
   *     operationId: updateAlluserList
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
   *           userId:
   *             type: "string"
   *           name:
   *             type: "string"
   *           gender:
   *             type: "number"
   *           phoneNo:
   *             type: "string"
   *           workUnit:
   *             type: "string"
   *           department:
   *             type: "string"
   *           workAmounts:
   *             type: "number"
   *           boardingTime:
   *             type: "string"
   *             format: date-time
   *           creationTime:
   *             type: "string"
   *             format: date-time
   *     responses:
   *      200:
   *         description: success
   *      500:
   *         description: Server internal error
   */
  // 更新用户信息 权限 admin
  app.post(version + '/alluser/alluser', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkAlluser, alluserCtrl.updateAlluserList)

  /**
   * @swagger
   * /alluser/register:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 用户注册
   *     operationId: register
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "phoneNo"
   *           - "password"
   *           - "role"
   *         properties:
   *           phoneNo:
   *             type: "string"
   *           password:
   *             type: "string"
   *           role:
   *             type: "string"
   *     responses:
   *      200:
   *        description: Alluser Register Success!
   *      400:
   *        description: empty inputs
   *      422:
   *        description: Alluser Already Exist!
   *      500:
   *        description: Server internal error
   */
  // 用户注册 权限 医生/患者
  app.post(version + '/alluser/register', errorHandler.error, alluserCtrl.registerTest(acl), getNoMid.getNo(1), alluserCtrl.register(acl))
  /**
   * @swagger
   * /alluser/cancelUser:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: "删除用户"
   *     operationId: cancelAlluser
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "userId"
   *           - "invalidFlag"
   *         properties:
   *           userId:
   *             type: "string"
   *           invalidFlag:
   *             type: "string"
   *     responses:
   *      200:
   *        description: success!
   *      500:
   *        description: Server internal error
   */
  // 删除用户
  app.post(version + '/alluser/cancelUser', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkAlluser, alluserCtrl.cancelAlluser)
  /**
   * @swagger
   * /alluser/unionid:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 绑定微信账号
   *     operationId: setMessageOpenId
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "phoneNo"
   *           - "openId"
   *         properties:
   *           phoneNo:
   *             type: "string"
   *           openId:
   *             type: "string"
   *     responses:
   *      200:
   *        description: success!
   *      403:
   *        description: unionid不能为空/unionid已存在/用户不存在
   *      422:
   *        description: Alluser doesn't Exist!
   *      500:
   *        description: Server internal error
   */
  // 绑定微信账号 权限 医生/患者  修改：删除checkBinding操作，绑定微信后需要重新登录，调用login方法 2017-08-17 lgf
  app.post(version + '/alluser/unionid', alluserCtrl.setOpenId, alluserCtrl.setOpenIdRes)
  // app.post(version + '/alluser/unionid', alluserCtrl.setOpenId, alluserCtrl.checkBinding, alluserCtrl.setOpenIdRes)
  /**
   * @swagger
   * /alluser/openId:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 写入用户openId
   *     operationId: setMessageOpenId
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
   *           - "openId"
   *           - "type"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           openId:
   *             type: "string"
   *           type:
   *             type: "number"
   *     responses:
   *      200:
   *        description: success!
   *      403:
   *        description: openId不能为空
   *      422:
   *        description: plz input type
   *      500:
   *        description: Server internal error
   */
  // 写入用户openId 权限 医生/患者
  app.post(version + '/alluser/openId', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkAlluser, alluserCtrl.setMessageOpenId)
  /**
   * @swagger
   * /alluser/openId:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: " 获取用户openId"
   *     operationId: getMessageOpenId
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       required: true
   *       description: "授权信息"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             doctorWechat:
   *               type: string
   *       201:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             patientWechat:
   *               type: string
   *       202:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             doctorApp:
   *               type: string
   *       203:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             patientApp:
   *               type: string
   *       412:
   *         plz input type
   *       500:
   *         description: Server internal error
   */
  // 获取用户openId 权限 医生/患者
  app.get(version + '/alluser/openId', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkAlluser, alluserCtrl.getMessageOpenId)
  /**
   * @swagger
   * /alluser/reset:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 用户重置密码
   *     operationId: reset
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "phoneNo"
   *           - "password"
   *         properties:
   *           phoneNo:
   *             type: "string"
   *           password:
   *             type: "string"
   *     responses:
   *      200:
   *        description: password reset success!
   *      422:
   *        description: Alluser doesn't Exist!
   *      500:
   *        description: Server internal error
   */
  // 用户重置密码
  app.post(version + '/alluser/reset', alluserCtrl.reset)
  /**
   * @swagger
   * /alluser/login:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 用户登录
   *     operationId: login
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "username"
   *           - "password"
   *           - "role"
   *         properties:
   *           username:
   *             type: "string"
   *           password:
   *             type: "string"
   *           role:
   *             type: "string"
   *     responses:
   *      200:
   *        description: login success
   *      422:
   *        description: 请输入用户名和密码
   *      423:
   *        description: Alluser doesn't Exist!
   *      424:
   *        description: Alluser password isn't correct!
   *      425:
   *        description: No authority!
   *      500:
   *        description: Server internal error
   */
  // 用户登录 修改：调整方法流程，先进行登录操作，获取token，再进行患者和医生/护士和患者的绑定 2017-08-17 lgf
  app.post(version + '/alluser/login', alluserCtrl.openIdLoginTest, alluserCtrl.login, alluserCtrl.checkBinding)
  // app.post(version + '/alluser/login', alluserCtrl.openIdLoginTest, alluserCtrl.checkBinding, alluserCtrl.login)
  /**
   * @swagger
   * /alluser/logout:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 用户登出
   *     operationId: logout
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
   *        description: logout success
   *      422:
   *        description: Alluser doesn't Exist
   *      500:
   *        description: Server internal error
   */
  // 用户登出 权限 医生/患者
  app.post(version + '/alluser/logout', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.logout)
  /**
   * @swagger
   * /alluser/userID:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: " 获取用户ID"
   *     operationId: getAlluserID
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "username"
   *       in: "query"
   *       required: true
   *       description: "用户ID,可以输入手机号或者unionid"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             AlluserId:
   *               type: string
   *             phoneNo:
   *               type: string
   *             roles:
   *               type: string
   *             openId:
   *               type: string
   *       412:
   *         description: Alluser doesn't Exist
   *       500:
   *         description: Server internal error
   */
  // 获取用户ID
  app.get(version + '/alluser/userID', alluserCtrl.getAlluserID)
  /**
   * @swagger
   * /alluser/sms:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 发送验证码
   *     operationId: sendSMS
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "mobile"
   *           - "smsType"
   *         properties:
   *           mobile:
   *             type: "string"
   *           smsType:
   *             type: "number"
   *           reason:
   *             type: "string"
   *     responses:
   *      200:
   *        description: success
   *      201:
   *        description: 您的邀请码已发送，请等待XXs后重新获取
   *      412:
   *        description: mobile and smsType input Error!
   *      500:
   *        description: Server internal error
   */
  // 发送验证码
  app.post(version + '/alluser/sms', alluserCtrl.sendSMS)
  /**
   * @swagger
   * /alluser/sms:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: "校验验证码"
   *     operationId: verifySMS
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "smsCode"
   *       in: "query"
   *       required: true
   *       description: "验证码"
   *       type: "number"
   *     - name: "mobile"
   *       in: "query"
   *       required: true
   *       description: "用户电话"
   *       type: "string"
   *     - name: "smsType"
   *       in: "query"
   *       required: true
   *       description: "验证码类型"
   *       type: "string"
   *     responses:
   *       200:
   *         description: 验证码正确
   *       412:
   *         description: 验证码错误
   *       422:
   *         description: 没有验证码或验证码已过期
   *       500:
   *         description: Server internal error
   */
  // 校验验证码
  app.get(version + '/alluser/sms', alluserCtrl.verifySMS)
  /**
   * @swagger
   * /alluser/agreement:
   *   get:
   *     tags:
   *     - Alluser
   *     summary: " 获取用户签署协议状态"
   *     operationId: getAlluserAgreement
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "userId"
   *       in: "query"
   *       required: true
   *       description: "用户ID"
   *       type: "string"
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           properties:
   *             agreement:
   *               type: string
   *       500:
   *         description: Server internal error
   */
  // 获取用户签署协议状态
  app.get(version + '/alluser/agreement', alluserCtrl.getAlluserAgreement)
  /**
   * @swagger
   * /alluser/agreement:
   *   post:
   *     tags:
   *     - Alluser
   *     summary: 修改用户签署协议状态
   *     operationId: updateAlluserAgreement
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - "userId"
   *           - "agreement"
   *         properties:
   *           userId:
   *             type: "string"
   *           agreement:
   *             type: "string"
   *     responses:
   *      200:
   *        description: success
   *        schema:
   *          type: object
   *          properties:
   *            agreement:
   *              type: string
   *      500:
   *        description: Server internal error
   */
  // 修改用户签署协议状态
  app.post(version + '/alluser/agreement', alluserCtrl.updateAlluserAgreement)

  // 弃用，expense表已合并至 order表 2017-08-10 lgf
  // app.post(version + '/expense/rechargeDoctor', tokenManager.verifyToken(), alluserCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
  // app.get(version + '/expense/records', tokenManager.verifyToken(), expenseCtrl.getRecords)

  // report 方法已在下方更新 2017-08-10 lgf
  // app.get(version + '/report', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), alluserCtrl.checkPatient, reportCtrl.getReport)
  // app.post(version + '/report', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reportCtrl.updateReport)

  // gy
  // review
  app.post(version + '/review/reviewInfo', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reviewCtrl.postReviewInfo(acl))
  app.get(version + '/review/certificate', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reviewCtrl.getCertificate)
  app.get(version + '/review/reviewInfo', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reviewCtrl.getReviewInfo)
  app.get(version + '/review/countByStatus', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), reviewCtrl.countByStatus)

  // labtestImport
  app.get(version + '/labtestImport/listByStatus', tokenManager.verifyToken(), labtestImportCtrl.listByStatus)
  app.get(version + '/labtestImport/photoList', tokenManager.verifyToken(), labtestImportCtrl.photoList)
  app.post(version + '/labtestImport', tokenManager.verifyToken(), getNoMid.getNo(11), labtestImportCtrl.saveLabtest)
  app.post(version + '/labtestImport/edit', tokenManager.verifyToken(), labtestImportCtrl.editLabtest)
  // 权限-医生
  app.get(version + '/labtestImport', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), labtestImportCtrl.getLabtest)
  app.get(version + '/labtestImport/photoByLabtest', tokenManager.verifyToken(), labtestImportCtrl.photoByLabtest)
  app.post(version + '/labtestImport/labelphoto', tokenManager.verifyToken(), labtestImportCtrl.pullurl, labtestImportCtrl.pushurl, labtestImportCtrl.checkImportStatus, labtestImportCtrl.updateUserLatest)
  app.get(version + '/labtestImport/countByStatus', tokenManager.verifyToken(), labtestImportCtrl.countByStatus)

  // doctor_services
  /** YQC annotation 2017-08-04 - acl 2017-08-04 医生
   * @swagger
   * /services:
   *   get:
   *     tags:
   *     - "services"
   *     summary: "服务开启状态及收费情况，并返回团队信息"
   *     description: ""
   *     operationId: "services"
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
   *       required: false
   *       description: "患者查询医生服务开启状态时输入"
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
   *                 counselStatus1:
   *                   type: "number"
   *                 counselStatus2:
   *                   type: "number"
   *                 counselStatus3:
   *                   type: "number"
   *                 counselStatus4:
   *                   type: "number"
   *                 counselStatus5:
   *                   type: "number"
   *                 charge1:
   *                   type: "number"
   *                 charge2:
   *                   type: "number"
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
   *                 relayTarget:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamTarget'
   *             teams:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   teamId:
   *                     type: string
   *                   name:
   *                     type: string
   *                   sponsorName:
   *                     type: string
   */
  app.get(version + '/services', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), serviceCtrl.getServices)
  /** YQC 17-07-20 - acl 2017-08-04 医生
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
  app.post(version + '/services/status', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.changeServiceStatus)
  /** YQC 17-07-20 - acl 2017-08-04 医生
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
  app.post(version + '/services/charge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.setCharge)
  /** YQC 17-08-10 - acl 2017-08-10 医生
   * @swagger
   * /services/relayTarget:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "Set/Change the relayTarget of a doctor"
   *     description: ""
   *     operationId: "relayTarget"
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
   *           - "relayTarget"
   *         properties:
   *           token:
   *             type: "string"
   *           relayTarget:
   *             type: "array"
   *             items:
   *               type: object
   *               properties:
   *                 teamId:
   *                   type: string
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
   *                   type: string
   *                 name:
   *                   type: string
   *                 counselStatus1:
   *                   type: number
   *                 counselStatus2:
   *                   type: number
   *                 counselStatus3:
   *                   type: number
   *                 counselStatus4:
   *                   type: number
   *                 counselStatus5:
   *                   type: number
   *                 charge1:
   *                   type: number
   *                 charge2:
   *                   type: number
   *                 charge3:
   *                   type: number
   *                 charge4:
   *                   type: number
   *                 charge5:
   *                   type: number
   *                 serviceSchedules:
   *                   type: "array"
   *                   $ref: '#/definitions/ServiceSchedule'
   *                 serviceSuspendTime:
   *                   type: "array"
   *                   $ref: '#/definitions/ServiceSuspend'
   *                 autoRelay:
   *                   type: number
   *                 relayTarget:
   *                   type: "array"
   *                   items:
   *                     type: object
   *                     properties:
   *                       teamId:
   *                         type: string
   */
  app.post(version + '/services/relayTarget', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.setRelayTarget)
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
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *           total:
   *             type: "number"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/services/setSchedule', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.setServiceSchedule, personalDiagCtrl.getDaysToUpdate, personalDiagCtrl.updateAvailablePD1, personalDiagCtrl.updateAvailablePD2)
  /** YQC annotation 2017-08-04 - acl 2017-08-03 医生
   * @swagger
   * /services/deleteSchedule:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "For a doctor, delete a Personal Diagnosis service schedule"
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
   *             enum:
   *               - "Morning"
   *               - "Afternoon"
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/services/deleteSchedule', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.deleteServiceSchedule, personalDiagCtrl.getDaysToUpdate, personalDiagCtrl.updateAvailablePD1, personalDiagCtrl.updateAvailablePD2, serviceCtrl.getSessionObject, personalDiagCtrl.cancelBookedPds)
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
  app.post(version + '/services/setSuspend', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, personalDiagCtrl.setServiceSuspend, personalDiagCtrl.suspendAvailablePds, personalDiagCtrl.cancelBookedPds)
  /** YQC annotation 2017-08-04 - acl 2017-08-03 医生
   * @swagger
   * /services/deleteSuspend:
   *   post:
   *     tags:
   *     - "services"
   *     summary: "For a doctor, delete a Personal Diagnosis service suspension"
   *     description: ""
   *     operationId: "deleteSuspend"
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
  app.post(version + '/services/deleteSuspend', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.deleteServiceSuspend)
  // 咨询问卷填写(新增自动转发功能) - acl 2017-08-10 患者
  // app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counseltempCtrl.getSessionObject, counseltempCtrl.getDoctorObject, getNoMid.getNo(2), counseltempCtrl.saveQuestionaire, counseltempCtrl.counselAutoRelay, orderCtrl.getOrderNo, orderCtrl.updateOrder)
  app.post(version + '/counsel/questionaire', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getSessionObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire, counselCtrl.counselAutoRelay, orderCtrl.getOrderNo, orderCtrl.updateOrder)

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
   *     - name: "doctorId"
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
   *     - name: "token"
   *       in: "query"
   *       description: "token of the admin user."
   *       required: true
   *       type: "string"
   *     - name: "advisorId"
   *       in: "query"
   *       description: "UserId of the advisor to be queried."
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
   *                 $ref: '#/definitions/Advice'
   *       404:
   *         description: "AdvisorId not found."
   */
  app.get(version + '/advice/advices', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), adviceCtrl.getAdvice)
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
  app.post(version + '/advice/advice', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), adviceCtrl.postAdvice)
  // compliance
  /** YQC 17-07-24 - acl 2017-08-04 医生，患者，管理员
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
   *     - name: "token"
   *       in: "query"
   *       required: true
   *       type: "string"
   *     - name: "userId"
   *       in: "query"
   *       description: "UserId to be queried."
   *       required: true
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
   */
  app.get(version + '/compliance/compliances', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), complianceCtrl.getCompliances)
  /** YQC 17-07-24 - acl 2017-08-04 患者
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
  app.post(version + '/compliance/compliance', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), complianceCtrl.getCompliance, complianceCtrl.updateCompliance)
  // vitalSign
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
  // 修改 增加每次体征表更新体重数据 往alluser表里更新weight数据 以及 对添加的体征数据进行警戒值判断 2017-08-22 lgf
  app.post(version + '/vitalSign/vitalSign', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), vitalSignCtrl.getSessionObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData, patientCtrl.editPatientDetail, vitalSignCtrl.outOfRange, serviceCtrl.getDoctorsInCharge, getNoMid.getNo(6), messageCtrl.insertMessage)
  // app.post(version + '/vitalSign/vitalSign', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), vitalSignCtrl.getSessionObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData, patientCtrl.editPatientDetail)
  // counsel 2017-07-17
  // 医生获取问诊信息
  /** YQC annotation 2017-08-10 - acl 2017-08-10 医生
   * @swagger
   * /counsel/counsels:
   *   get:
   *     tags:
   *     - "counsel"
   *     summary: "获取资讯问诊内容"
   *     description: ""
   *     operationId: "counsels"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "status"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     - name: "type"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     - name: "name"
   *       in: "query"
   *       required: false
   *       type: "string"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     - name: "limit"
   *       in: "query"
   *       required: false
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
   *                 type: object
   *                 properties:
   *                   messages:
   *                     type: "array"
   *                     items:
   *                       $ref: '#/definitions/Message'
   *             count:
   *               type: number
   */
  app.get(version + '/counsel/counsels', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getSessionObject, counselCtrl.getCounsels)
  // 获取咨询状态
  /** YQC annotation 2017-08-10 - acl 2017-08-10 医生／患者
   * @swagger
   * /counsel/status:
   *   get:
   *     tags:
   *     - "counsel"
   *     summary: "获取资讯问诊状态"
   *     description: ""
   *     operationId: "status"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "body"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "status"
   *       in: "body"
   *       required: false
   *       type: "number"
   *     - name: "type"
   *       in: "body"
   *       required: false
   *       type: "number"
   *     - name: "doctorId"
   *       in: "body"
   *       required: true
   *       type: "string"
   *     - name: "patientId"
   *       in: "body"
   *       required: true
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
   *                 messages:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Message'
   *                 Patient:
   *                   type: "object"
   *                   $ref: '#/definitions/Patient'
   *                 Doctor:
   *                   type: "object"
   *                   $ref: '#/definitions/Doctor'
   *             count:
   *               type: number
   */
  app.get(version + '/counsel/status', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus)
  // 修改咨询状态
  /** YQC annotation 2017-08-10 - acl 2017-08-10 医生／患者
   * @swagger
   * /counsel/status:
   *   post:
   *     tags:
   *     - "counsel"
   *     summary: "修改资讯问诊状态"
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
   *           - "patientId"
   *           - "docotorId"
   *           - "status"
   *           - "type"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           docotorId:
   *             type: string
   *           status:
   *             type: number
   *             default: 0
   *           type:
   *             type: number
   *             default: 2
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               $ref: '#/definitions/Counsel'
   */
  app.post(version + '/counsel/status', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus)
  // 修改咨询类型
  /** YQC annotation 2017-08-10 - acl 2017-08-10 患者
   * @swagger
   * /counsel/type:
   *   post:
   *     tags:
   *     - "counsel"
   *     summary: "修改咨询类型"
   *     description: ""
   *     operationId: "type"
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
   *           - "docotorId"
   *           - "changeType"
   *           - "type"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           docotorId:
   *             type: string
   *           changeType:
   *             type: string
   *             default: "true"
   *           type:
   *             type: number
   *             default: 2
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               $ref: '#/definitions/Counsel'
   */
  app.post(version + '/counsel/type', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType)
  // 评价医生
  /** YQC annotation 2017-08-10 - acl 2017-08-10 患者
   * @swagger
   * /counsel/commentScore:
   *   post:
   *     tags:
   *     - "counsel"
   *     summary: "评价医生"
   *     description: ""
   *     operationId: "commentScore"
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
   *           - "totalScore"
   *           - "docotorId"
   *           - "content"
   *           - "couselId"
   *         properties:
   *           token:
   *             type: "string"
   *           totalScore:
   *             type: "number"
   *           docotorId:
   *             type: string
   *           content:
   *             type: string
   *           couselId:
   *             type: number
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             CounselResults:
   *               type: object
   *               $ref: '#/definitions/Counsel'
   *             commentresults:
   *               type: object
   *               $ref: '#/definitions/Comment'
   *             result:
   *               type: string
   */
  app.post(version + '/counsel/commentScore', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), counselCtrl.getSessionObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore)
  // communication
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/counselReport:
   *   get:
   *     tags:
   *     - "communication"
   *     summary: "获取资讯问诊报告"
   *     description: ""
   *     operationId: "counselReport"
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
   *                 $ref: '#/definitions/Counsel'
   */
  app.get(version + '/communication/counselReport', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.getCounselReport)
  // app.post(version + '/communication/newTeam', tokenManager.verifyToken(), getNoMid.getNo(4), communicationCtrl.newTeam)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/team:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "新建会诊团队"
   *     description: ""
   *     operationId: "team"
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
   *           - "teamId"
   *           - "name"
   *           - "sponsorId"
   *           - "sponsorName"
   *           - "sponsorPhoto"
   *           - "photoAddress"
   *           - "description"
   *         properties:
   *           token:
   *             type: "string"
   *           teamId:
   *             type: "string"
   *           name:
   *             type: string
   *           sponsorId:
   *             type: string
   *           sponsorName:
   *             type: string
   *           sponsorPhoto:
   *             type: string
   *           photoAddress:
   *             type: string
   *           description:
   *             type: string
   *           time:
   *             type: string
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             newResults:
   *               type: object
   *               properties:
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
   */
  app.post(version + '/communication/team', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.newTeam)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/deleteTeam:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "删除会诊团队"
   *     description: ""
   *     operationId: "deleteTeam"
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
   *           - "teamId"
   *         properties:
   *           token:
   *             type: "string"
   *           teamId:
   *             type: "string"
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             newResults:
   *               type: object
   *               properties:
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
   *                 members:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamMember'
   */
  app.post(version + '/communication/deleteTeam', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.deleteTeam)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/team:
   *   get:
   *     tags:
   *     - "communication"
   *     summary: "获取会诊团队"
   *     description: ""
   *     operationId: "team"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "teamId"
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
   *               type: object
   *               properties:
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
   *                 members:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamMember'
   */
  app.get(version + '/communication/team', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.getTeam)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/consultation:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "新建会诊"
   *     description: ""
   *     operationId: "consultation"
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
   *           - "teamId"
   *           - "counselId"
   *           - "sponsorId"
   *           - "patientId"
   *           - "consultationId"
   *         properties:
   *           token:
   *             type: "string"
   *           teamId:
   *             type: "string"
   *           counselId:
   *             type: string
   *           sponsorId:
   *             type: string
   *           patientId:
   *             type: string
   *           consultationId:
   *             type: string
   *           status:
   *             type: number
   *             default: 1
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 teamId:
   *                   type: "string"
   *                 consultationId:
   *                   type: "string"
   *                 sponsorId:
   *                   type: "string"
   *                 patientId:
   *                   type: "string"
   *                 diseaseInfo:
   *                   type: "string"
   *                 status:
   *                   type: "number"
   *                 time:
   *                   type: "string"
   *                   format: date-time
   */
  app.post(version + '/communication/consultation', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation)
  // app.post(version + '/communication/consultation', tokenManager.verifyToken(), getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/consultation:
   *   get:
   *     tags:
   *     - "communication"
   *     summary: "获取会诊信息"
   *     description: ""
   *     operationId: "consultation"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "consultationId"
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
   *               type: object
   *               properties:
   *                 consultationId:
   *                   type: "string"
   *                 sponsorId:
   *                   $ref: '#/definitions/Doctor'
   *                 patientId:
   *                   $ref: '#/definitions/Patient'
   *                 diseaseInfo:
   *                   $ref: '#/definitions/Counsel'
   *                 teamId:
   *                   type: "string"
   *                 time:
   *                   type: "string"
   *                   format: date-time
   *                 conclusion:
   *                   type: "string"
   *                 status:
   *                   type: "number"
   *                   default: "1"
   *                 messages:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Message'
   */
  app.get(version + '/communication/consultation', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.getConsultation)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/conclusion:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "新建会诊"
   *     description: ""
   *     operationId: "conclusion"
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
   *           - "conclusion"
   *           - "consultationId"
   *         properties:
   *           token:
   *             type: "string"
   *           conclusion:
   *             type: "string"
   *           consultationId:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 teamId:
   *                   type: "string"
   *                 consultationId:
   *                   type: "string"
   *                 sponsorId:
   *                   type: "string"
   *                 patientId:
   *                   type: "string"
   *                 diseaseInfo:
   *                   type: "string"
   *                 status:
   *                   type: "number"
   *                 time:
   *                   type: "string"
   *                   format: date-time
   *                 conclusion:
   *                   type: "string"
   */
  app.post(version + '/communication/conclusion', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.conclusion)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/insertMember:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "设置团队成员"
   *     description: ""
   *     operationId: "insertMember"
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
   *           - "teamId"
   *           - "member"
   *         properties:
   *           token:
   *             type: "string"
   *           teamId:
   *             type: "string"
   *           member:
   *             type: array
   *             items:
   *               $ref: '#/definitions/TeamMember'
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
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
   *                 members:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamMember'
   */
  app.post(version + '/communication/insertMember', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.insertMember, communicationCtrl.updateNumber)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/removeMember:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "移除团队成员"
   *     description: ""
   *     operationId: "removeMember"
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
   *           - "teamId"
   *           - "membersuserId"
   *         properties:
   *           token:
   *             type: "string"
   *           teamId:
   *             type: "string"
   *           membersuserId:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
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
   *                 members:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/TeamMember'
   */
  app.post(version + '/communication/removeMember', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.removeMember, communicationCtrl.updateNumber)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生
   * @swagger
   * /communication/updateLastTalkTime:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "更新最新交流时间"
   *     description: ""
   *     operationId: "updateLastTalkTime"
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
   *           - "doctorId2"
   *           - "lastTalkTime"
   *         properties:
   *           token:
   *             type: "string"
   *           doctorId:
   *             type: "string"
   *           doctorId2:
   *             type: "string"
   *           lastTalkTime:
   *             type: string
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/communication/updateLastTalkTime', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生/患者
   * @swagger
   * /communication/communication:
   *   post:
   *     tags:
   *     - "communication"
   *     summary: "新建交流"
   *     description: ""
   *     operationId: "communication"
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
   *           - "messageType"
   *           - "sendBy"
   *           - "receiver"
   *           - "content"
   *         properties:
   *           token:
   *             type: "string"
   *           messageType:
   *             type: "number"
   *           sendBy:
   *             type: string
   *           sponsorId:
   *             type: string
   *           receiver:
   *             type: string
   *           content:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             newResults:
   *               type: object
   *               $ref: '#/definitions/Communication'
   */
  app.post(version + '/communication/communication', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(8), communicationCtrl.postCommunication)
  /** YQC annotation 2017-08-11 - acl 2017-08-11 医生/患者
   * @swagger
   * /communication/communication:
   *   get:
   *     tags:
   *     - "communication"
   *     summary: "获取交流信息"
   *     description: ""
   *     operationId: "communication"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "messageType"
   *       in: "query"
   *       required: true
   *       type: "number"
   *     - name: "newsType"
   *       in: "query"
   *       required: true
   *       type: "number"
   *     - name: "id1"
   *       in: "query"
   *       required: true
   *       type: "string"
   *     - name: "id2"
   *       in: "query"
   *       required: true
   *       type: "string"
   *     - name: "skip"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     - name: "limit"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     responses:
   *       200:
   *         description: "Operation success."
   *         schema:
   *           type: object
   *           properties:
   *             newResults:
   *               type: object
   *               $ref: '#/definitions/Communication'
   *             nexturl:
   *               type: string
   */
  app.get(version + '/communication/communication', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), communicationCtrl.getCommunication)
  /** GY 2017-07-28 - acl 2017-08-11 医生
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
  app.post(version + '/communication/massToPatient', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), communicationCtrl.getMassTargets, communicationCtrl.massCommunication)
  // task 2017-07-14
  /** YQC annotation 2017-08-10 - acl 2017-08-10 患者／医生
   * @swagger
   * /tasks:
   *   get:
   *     tags:
   *     - "tasks"
   *     summary: "获取任务"
   *     description: ""
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
   *     - name: "sortNo"
   *       in: "query"
   *       required: false
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
   *                 type: object
   *                 properties:
   *                   userId:
   *                     type: "string"
   *                   sortNo:
   *                     type: "number"
   *                   name:
   *                     type: "string"
   *                   date:
   *                     type: "string"
   *                     format: "date-time"
   *                   description:
   *                     type: "string"
   *                   invalidFlag:
   *                     type: "number"
   *                   task:
   *                     type: "array"
   *                     items:
   *                       $ref: '#/definitions/Task'
   */
  app.get(version + '/tasks', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), taskCtrl.getTasks)
  /** YQC annotation 2017-08-10 - acl 2017-08-10 患者
   * @swagger
   * /tasks/status:
   *   post:
   *     tags:
   *     - "tasks"
   *     summary: "修改任务状态"
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
   *           - "userId"
   *           - "status"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           sortNo:
   *             type: number
   *           type:
   *             type: string
   *           code:
   *             type: string
   *           status:
   *             type: number
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/tasks/status', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.updateStatus)
  /** YQC annotation 2017-08-10 - acl 2017-08-10 医生
   * @swagger
   * /tasks/time:
   *   post:
   *     tags:
   *     - "tasks"
   *     summary: "修改任务起始时间"
   *     description: ""
   *     operationId: "time"
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
   *           - "startTime"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           sortNo:
   *             type: number
   *           type:
   *             type: string
   *           code:
   *             type: string
   *           startTime:
   *             type: string
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/tasks/time', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.updateStartTime)
  /** YQC annotation 2017-08-10 - acl 2017-08-10 医生
   * @swagger
   * /tasks/task:
   *   post:
   *     tags:
   *     - "tasks"
   *     summary: "给患者设置一个任务模版"
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
   *           - "sortNo"
   *         properties:
   *           token:
   *             type: "string"
   *           userId:
   *             type: "string"
   *           sortNo:
   *             type: number
   *     responses:
   *      200:
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
  app.post(version + '/tasks/taskModel', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel)
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
  app.get(version + '/tasks/task', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.getUserTask)
  /** YQC annotation 2017-07-28 - acl 2017-07-28 医生／2017-08-14 患者
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
  app.post(version + '/tasks/task', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent)
  // patient 2017-07-17
  /** YQC annotation 2017-07-27 - acl 2017-07-26 患者 - acl 2017-07-28 医生
   * @swagger
   * /patient/detail:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取患者详情"
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
   *               $ref: '#/definitions/Patient'
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
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者 弃用
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
  // app.post(version + '/patient/detail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.newPatientDetail)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 患者
   * @swagger
   * /patient/doctors:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "获取所有医生的列表（可分页／条件／模糊查询）"
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
   *                 $ref: '#/definitions/Doctor'
   */
  app.get(version + '/patient/doctors', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), patientCtrl.getDoctorLists)
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
   *                 type: "object"
   *                 properties:
   *                   time:
   *                     type: "string"
   *                     format: data-time
   *                   messages:
   *                     type: "string"
   *                   doctorId:
   *                     type: "object"
   *                     properties:
   *                       userId:
   *                         type: "string"
   *                       name:
   *                         type: "string"
   *                       photoUrl:
   *                         type: "string"
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
  app.post(version + '/patient/wechatPhotoUrl', patientCtrl.wechatPhotoUrl)
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
  app.post(version + '/doctor/detail', doctorCtrl.insertDocBasic)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/myPatients:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取我的主管患者和关注患者"
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
   *                     $ref: '#/definitions/Patient'
   *                 patientsInCharge:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Patient'
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
   *     summary: "按日获取我的主管患者和关注患者"
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
   *                     $ref: '#/definitions/Patient'
   *                 patientsInCharge:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Patient'
   *       404:
   *         description: "Doctor not found."
   */
  app.get(version + '/doctor/myPatientsByDate', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSessionObject, doctorCtrl.getPatientByDate)
  /** YQC annotation 2017-07-26 - acl 2017-08-04 医生／guest
   * @swagger
   * /doctor/detail:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取医生（我）详情"
   *     description: ""
   *     operationId: "detail"
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
   *                 n:
   *                   type: number
   *                 nModified:
   *                   type: number
   *                 ok:
   *                   type: number
   *             TDCticket:
   *               type: string
   *             comments:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Comment'
   *             nexturl:
   *               type: string
   */
  app.get(version + '/doctor/detail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getSessionObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo)
  /** YQC annotation 2017-07-26 - acl 2017-08-04 医生
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
   */
  app.get(version + '/doctor/myTeams', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getTeams)
  /** YQC annotation 2017-07-26 - acl 2017-08-04 医生
   * @swagger
   * /doctor/teamPatients:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取医生所在的团队的患者"
   *     description: ""
   *     operationId: "teamPatients"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "token"
   *       in: "query"
   *       description: "Token."
   *       required: true
   *       type: "string"
   *     - name: "teamId"
   *       in: "query"
   *       required: true
   *       type: "string"
   *     - name: "status"
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
   *               type: object
   *               properties:
   *                 consultations:
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/Consultation'
   */
  app.get(version + '/doctor/teamPatients', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList)
  // app.get(version + '/doctor/team', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  /** YQC annotation 2017-08-04 - acl 2017-08-04 医生／guest
   * @swagger
   * /doctor/editDetail:
   *   post:
   *     tags:
   *     - "doctor"
   *     summary: "Edit a basic file of a doctor"
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
  app.post(version + '/doctor/editDetail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember)
  /** YQC annotation 2017-07-26 - acl 2017-07-26 医生
   * @swagger
   * /doctor/myRecentDoctors:
   *   get:
   *     tags:
   *     - "doctor"
   *     summary: "获取最近交流过的医生列表"
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
  // app.get(version + '/doctor/schedules', tokenManager.verifyToken(), doctorCtrl.getSchedules)
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
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生/患者
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
   *     - name: "docotrId"
   *       in: "query"
   *       description: "患者查询的时候需输入."
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
   *                 serviceSuspendTime:
   *                   description: "面诊加号服务停诊信息"
   *                   type: "array"
   *                   items:
   *                     $ref: '#/definitions/ServiceSuspend'
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
  /** YQC annotation 2017-07-25 - acl 2017-07-25 医生 2017-08-10 患者
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
   *     summary: "Finds the list of FavoriteDoctors, with the function of skip and limit."
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
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Doctor'
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
  app.post(version + '/patient/doctorInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, doctorsInChargeCtrl.addDoctorInCharge, doctorsInChargeCtrl.addPatientInCharge, orderCtrl.getOrderNo, orderCtrl.updateOrder)
  // 患者端 获取主管医生信息 2017-07-20 主管医生信息更换数据库表至DoctorsInCharge 2017-07-27
  /** YQC annotation 2017-07-25 - acl 2017-07-25 患者
   * @swagger
   * /patient/myDoctorsInCharge:
   *   get:
   *     tags:
   *     - "patient"
   *     summary: "Finds the doctor-in-charge status, if there's any, of a patient."
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
   *           $ref: '#/definitions/Doctor'
   *       404:
   *         description: "UserId not found."
   */
  app.get(version + '/patient/myDoctorsInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, doctorsInChargeCtrl.getDoctorsInCharge)
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
  app.post(version + '/patient/cancelDoctorInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, doctorsInChargeCtrl.deleteDoctorInCharge, doctorsInChargeCtrl.deletePatientInCharge)
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
  app.get(version + '/services/relation', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, doctorsInChargeCtrl.relation)
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
  app.get(version + '/doctor/myPatientsToReview', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), doctorsInChargeCtrl.getPatientsToReview)
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
  app.post(version + '/doctor/PatientInCharge', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getPatientObject, doctorsInChargeCtrl.reviewPatientInCharge, doctorsInChargeCtrl.updateDoctorInCharge, serviceCtrl.recharge)
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
  app.get(version + '/services/mySchedules', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.getMySchedules)
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
   *                     format: "YYYY-MM-DD"
   *                     description: "预约日期"
   *                   time:
   *                     type: string
   *                     enum:
   *                       - "Morning"
   *                       - "Afternoon"
   *                     description: "预约时段"
   *                   place:
   *                     type: string
   *                     description: "医生出诊地点"
   *                   diagId:
   *                     type: string
   *                     description: "某时段已预约的面诊号"
   *                   margin:
   *                     type: number
   *                     description: "该时段剩余可预约数量"
   *       500:
   *         description: "Internal Server Error"
   *       404:
   *         description: "PD Not Found"
   */
  app.get(version + '/services/availablePD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, personalDiagCtrl.getAvailablePD, personalDiagCtrl.sortAndTagPDs)
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
  app.post(version + '/services/personalDiagnosis', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(12), serviceCtrl.getSessionObject, serviceCtrl.getDoctorObject, personalDiagCtrl.updatePDCapacityDown, personalDiagCtrl.newPersonalDiag, alluserCtrl.successMessage, orderCtrl.getOrderNo, orderCtrl.updateOrder)
  // 患者端 取消面诊服务 还没有和order退款连起来
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
  app.post(version + '/services/cancelMyPD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.cancelMyPD, personalDiagCtrl.updatePDCapacityUp)
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
  app.get(version + '/services/myPD', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, personalDiagCtrl.getMyPDs)
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
  app.get(version + '/services/myPDpatients', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, personalDiagCtrl.getPDPatients)
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
  app.post(version + '/services/PDConfirmation', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), personalDiagCtrl.confirmPD, serviceCtrl.recharge)

  // PC端保险管理
  // 获取患者 权限insuranceC/insuranceA
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/patients:
   *   get:
   *     tags:
   *     - "policy"
   *     summary: "获取保险意向患者"
   *     description: ""
   *     operationId: "patients"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "status"
   *       in: "query"
   *       required: false
   *       type: "number"
   *     - name: "name"
   *       in: "query"
   *       required: false
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
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   patientId:
   *                     type: object
   *                     properties:
   *                       gender:
   *                         type: "string"
   *                       phoneNo:
   *                         type: "number"
   *                       name:
   *                         type: "string"
   *                       userId:
   *                         type: "string"
   *                       birthday:
   *                         type: "string"
   *                         format: "date-time"
   *                       VIP:
   *                         type: "number"
   *                   currentAgent:
   *                     type: object
   *                     properties:
   *                       phoneNo:
   *                         type: "number"
   *                       name:
   *                         type: "string"
   *                   latestFollowUp:
   *                     type: object
   *                     properties:
   *                       content:
   *                         type: "string"
   *                   status:
   *                     type: number
   *             code:
   *               type: number
   */
  app.get(version + '/policy/patients', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatients)
  // 获取患者跟踪记录详情 权限insuranceC/insuranceA
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/history:
   *   get:
   *     tags:
   *     - "policy"
   *     summary: "获取患者跟踪记录详情"
   *     description: ""
   *     operationId: "history"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "patientId"
   *       in: "query"
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
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   patientId:
   *                     type: object
   *                     properties:
   *                       content:
   *                         type: "string"
   *                       time:
   *                         type: "string"
   *                         format: date-time
   *                       photos:
   *                         type: "array"
   *                         items:
   *                           type: string
   *             code:
   *               type: number
   */
  app.get(version + '/policy/history', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.getHistory)
  // 获取专员 权限insuranceC
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/agents:
   *   get:
   *     tags:
   *     - "policy"
   *     summary: "获取保险专员列表"
   *     description: ""
   *     operationId: "agents"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "name"
   *       in: "query"
   *       required: false
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
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   userId:
   *                     type: "string"
   *                   phoneNo:
   *                     type: "number"
   *                   name:
   *                     type: "string"
   *             code:
   *               type: number
   */
  app.get(version + '/policy/agents', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getAgents, policyCtrl.sortAgents)
  // 主管设置／更换专员 权限insuranceC
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/agent:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "设置保险专员"
   *     description: ""
   *     operationId: "agent"
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
   *           - "insuranceAId"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           insuranceAId:
   *             type: string
   *           reason:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/agent', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.getInsuranceAObject, policyCtrl.setAgent)
  // 专员／主管录入患者跟踪记录 权限insuranceC/insuranceA
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/followUp:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "录入跟踪记录"
   *     description: ""
   *     operationId: "followUp"
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
   *           - "content"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           content:
   *             type: string
   *           photoUrls:
   *             type: array
   *             items:
   *               type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/followUp', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.insertFollowUp)
  // 专员／主管录入患者保单 权限insuranceC/insuranceA
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/policy:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "录入保单"
   *     description: ""
   *     operationId: "policy"
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
   *           - "content"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           content:
   *             type: string
   *           photoUrls:
   *             type: array
   *             items:
   *               type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/policy', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.insertPolicy)
  // 获取患者保单详情 权限insuranceC/insuranceA
  /** YQC annotation 2017-08-23
   * @swagger
   * /policy/policy:
   *   get:
   *     tags:
   *     - "policy"
   *     summary: "获取患者保单详情"
   *     description: ""
   *     operationId: "policy"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - name: "patientId"
   *       in: "query"
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
   *             data:
   *               type: object
   *               properties:
   *                 patientId:
   *                   type: string
   *                 content:
   *                   type: "string"
   *                 status:
   *                   type: "number"
   *                 photos:
   *                   type: "array"
   *                   items:
   *                     type: string
   *             code:
   *               type: number
   */
  app.get(version + '/policy/policy', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.getPolicy)
  // 主管审核患者保单 权限insuranceC
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/policyReview:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "审核保单"
   *     description: ""
   *     operationId: "policyReview"
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
   *           - "startTime"
   *           - "endTime"
   *         properties:
   *           token:
   *             type: "string"
   *           patientId:
   *             type: "string"
   *           reviewResult:
   *             type: string
   *           rejectReason:
   *             type: string
   *           startTime:
   *             type: string
   *             format: date-time
   *           endTime:
   *             type: string
   *             format: date-time
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/policyReview', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getPatientObject, policyCtrl.reviewPolicy)
  // 主管注销专员 权限insuranceC
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/agentOff:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "注销保险专员"
   *     description: ""
   *     operationId: "agentOff"
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
   *           - "insuranceAId"
   *         properties:
   *           token:
   *             type: "string"
   *           insuranceAId:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/agentOff', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.getSessionObject, policyCtrl.getInsuranceAObject, policyCtrl.agentOff)
  // 主管／专员修改个人信息
  /** YQC annotation 2017-08-10
   * @swagger
   * /policy/info:
   *   post:
   *     tags:
   *     - "policy"
   *     summary: "主管／专员修改个人信息"
   *     description: ""
   *     operationId: "info"
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
   *           insuranceAId:
   *             type: string
   *           name:
   *             type: string
   *           gender:
   *             type: number
   *             enum:
   *               - "1"
   *               - "2"
   *           phoneNo:
   *             type: number
   *           password:
   *             type: string
   *     responses:
   *      200:
   *         description: "Operation success."
   */
  app.post(version + '/policy/info', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), policyCtrl.editInfo)

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
   *         type: string
   *         format: date-time
   *       money:
   *         type: number
   *       from:
   *         type: string
   *   RechargeRecords:
   *     type: object
   *     properties:
   *       time:
   *         type: string
   *         format: date-time
   *       money:
   *         type: number
   *       title:
   *         type: string
   *   ExpenseRecords:
   *     type: object
   *     properties:
   *       time:
   *         type: string
   *         format: date-time
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
   *         items:
   *           $ref: '#/definitions/IncomeRecords'
   *       rechargeRecords:
   *         type: array
   *         items:
   *           $ref: '#/definitions/RechargeRecords'
   *       expenseRecords:
   *         type: array
   *         items:
   *           $ref: '#/definitions/ExpenseRecords'
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
   *     summary: 查询账户信息
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
  // 查询账户信息 权限 医生/患者
  app.get(version + '/account/accountInfo', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), accountCtrl.getAccountInfo)
  /**
   * @swagger
   * /account/counts:
   *   get:
   *     operationId: getCounts
   *     tags:
   *       - AccountInfo
   *     summary: 查询咨询免费次数，或者咨询某个医生的次数
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
   *       201:
   *         schema:
   *           type: object
   *           required:
   *             - freeTimes
   *             - totalCount
   *           properties:
   *             freeTimes:
   *               type: number
   *             totalCount:
   *               type: number
   *       500:
   *         description: Server internal error
   */
  // 查询咨询免费次数，或者咨询某个医生的次数 权限 患者
  app.get(version + '/account/counts', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts)
  /**
   * @swagger
   * /account/counts:
   *   post:
   *     operationId: modifyCounts
   *     tags:
   *       - AccountInfo
   *     summary: 次数更新(咨询、咨询转问诊、问诊结束)
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
  // 次数更新(咨询、咨询转问诊、问诊结束) 权限 患者
  app.post(version + '/account/counts', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts)
  /**
   * @swagger
   * /account/freeTime:
   *   post:
   *     operationId: updateFreeTime
   *     tags:
   *       - AccountInfo
   *     summary: 新建咨询时调用
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
  // 新建咨询时调用 权限 患者
  app.post(version + '/account/freeTime', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), accountCtrl.checkPatient, accountCtrl.updateFreeTime)
  /**
   * @swagger
   * /account/countsRespective:
   *   get:
   *     operationId: countsRespective
   *     tags:
   *       - AccountInfo
   *     summary: 获取未完成咨询/问诊计数
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
  // 获取未完成咨询/问诊计数 权限 患者
  app.get(version + '/account/countsRespective', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), accountCtrl.checkPatient, accountCtrl.getCountsRespective)

  // expense
  // app.post(version + '/expense/doctor', tokenManager.verifyToken(), alluserCtrl.checkDoctor, expenseCtrl.rechargeDoctor)
  // app.get(version + '/expense/records', tokenManager.verifyToken(), expenseCtrl.getRecords)

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
   *         type: string
   *         format: date-time
   *       time:
   *         type: string
   *         format: date-time
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
   *     summary: 获得患者所有的健康信息
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
  // 获得患者所有的健康信息 权限 医生/患者
  app.get(version + '/healthInfo/healthInfos', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), healthInfoCtrl.getAllHealthInfo)
  /**
   * @swagger
   * /healthInfo/healthDetail:
   *   get:
   *     operationId: getHealthDetail
   *     tags:
   *       - HealthInfo
   *     summary: 获得患者某条健康信息详情
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
  // 获得患者某条健康信息详情 权限 医生/患者
  app.get(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), healthInfoCtrl.getHealthDetail)
  /**
   * @swagger
   * /healthInfo/healthInfo:
   *   post:
   *     operationId: insertHealthInfo
   *     tags:
   *       - HealthInfo
   *     summary: 新增患者健康信息
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
   *           properties:
   *             token:
   *               type: string
   *             type:
   *               type: string
   *             time:
   *               type: string
   *               format: date-time
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
  // 新增患者健康信息 权限 医生/患者
  app.post(version + '/healthInfo/healthInfo', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), healthInfoCtrl.insertHealthInfo)
  /**
   * @swagger
   * /healthInfo/healthDetail:
   *   post:
   *     operationId: modifyHealthDetail
   *     tags:
   *       - HealthInfo
   *     summary: 修改患者某条健康信息
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
   *               type: string
   *               format: date-time
   *             insertTime:
   *               type: string
   *               format: date-time
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
  // 修改患者某条健康信息 权限 医生/患者
  app.post(version + '/healthInfo/healthDetail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), healthInfoCtrl.modifyHealthDetail)
  /**
   * @swagger
   * /healthInfo/deleteHealthDetail:
   *   post:
   *     operationId: deleteHealthDetail
   *     tags:
   *       - HealthInfo
   *     summary: 删除患者某条健康信息
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
   *               type: string
   *               format: date-time
   *     responses:
   *       200:
   *         description: success
   *       500:
   *         description: Server internal error
   */
  // 删除患者某条健康信息 权限 医生/患者
  app.post(version + '/healthInfo/deleteHealthDetail', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), healthInfoCtrl.deleteHealthDetail)

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
   *         type: string
   *         format: date-time
   *   InsuranceMsg:
   *     type: object
   *     properties:
   *       insuranceId:
   *         type: string
   *       time:
   *         type: string
   *         format: date-time
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
   *         type: string
   *         format: date-time
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
   *     summary: 给患者发送保险推送
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
   *           properties:
   *             token:
   *               type: string
   *             patientId:
   *               type: string
   *             insuranceId:
   *               type: string
   *             time:
   *               type: string
   *               format: date-time
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
  // 给患者发送保险推送 权限 医生
  app.post(version + '/insurance/message', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkPatient, insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage)
  /**
   * @swagger
   * /insurance/message:
   *   get:
   *     operationId: getInsuranceMessage
   *     tags:
   *       - Insurance
   *     summary: 获取保险推送信息
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
  // 获取保险推送信息 权限 患者
  app.get(version + '/insurance/message', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkDoctor, insuranceCtrl.getInsMsg)
  /**
   * @swagger
   * /insurance/prefer:
   *   post:
   *     operationId: setInsurancePrefer
   *     tags:
   *       - Insurance
   *     summary: 设置保险购买意向
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
   *               type: string
   *               format: date-time
   *     responses:
   *       200:
   *         description: success
   */
  // 设置保险购买意向 权限 患者
  app.post(version + '/insurance/prefer', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), serviceCtrl.getSessionObject, insuranceCtrl.setPrefer)
  /**
   * @swagger
   * /insurance/prefer:
   *   get:
   *     operationId: getInsurancePrefer
   *     tags:
   *       - Insurance
   *     summary: 获取保险购买意向
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
  // 获取保险购买意向 权限 患者
  app.get(version + '/insurance/prefer', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), insuranceCtrl.getPrefer)

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
   *         type: string
   *         format: date-time
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
   *     summary: 获取某个用户(某种类型)的所有消息
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
  // 获取某个用户(某种类型)的所有消息 权限 医生/患者
  app.get(version + '/message/messages', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), messageCtrl.getMessages)
  /**
   * @swagger
   * /message/status:
   *   post:
   *     operationId: changeMessageStatus
   *     tags:
   *       - Message
   *     description: Change MessageStatus
   *     summary: 修改某个用户某种类型消息的已读状态
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
  // 修改某个用户某种类型消息的已读状态 权限 医生/患者
  app.post(version + '/message/status', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), messageCtrl.changeMessageStatus)
  /**
   * @swagger
   * /message/message:
   *   post:
   *     operationId: insertMessage
   *     tags:
   *       - Message
   *     summary: 插入消息
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
   *               type: string
   *               format: date-time
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
  // 插入消息 权限 医生/患者
  app.post(version + '/message/message', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(6), messageCtrl.insertMessage)

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
   *         type: string
   *         format: date-time
   *       money:
   *         type: number
   *       goodsInfo:
   *         type: object
   *         $ref: '#/definitions/GoodsInfo'
   *       paystatus:
   *         type: number
   *       paytime:
   *         type: string
   *         format: date-time
   *       refundNo:
   *         type: number
   *       refundAppTime:
   *         type: string
   *         format: date-time
   *       refundSucTime:
   *         type: string
   *         format: date-time
   *       type:
   *         type: number
   *       freeFlag:
   *         type: number
   *       docInChaObject:
   *         type: string
   *       conselObject:
   *         type: string
   *       perDiagObject:
   *         type: string
   */
  /**
   * @swagger
   * /order/order:
   *   post:
   *     operationId: updateOrder
   *     tags:
   *       - Order
   *     summary: 更新订单信息
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
   *             - orderNo
   *           properties:
   *             token:
   *               type: string
   *             orderNo:
   *               type: string
   *             paystatus:
   *               type: number
   *             paytime:
   *               type: string
   *               format: date-time
   *             docInChaObject:
   *               type: string
   *             conselObject:
   *               type: string
   *             perDiagObject:
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
  // 更新订单信息 权限 医生/患者
  // app.post(version + '/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post(version + '/order/order', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), orderCtrl.updateOrder)
  /**
   * @swagger
   * /order/order:
   *   get:
   *     operationId: getOrder
   *     tags:
   *       - Order
   *     summary: 获取订单信息
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
   *         description: 订单号
   *         in: query
   *         required: true
   *         type: string
   *       - name: patientName
   *         description: 患者姓名
   *         required: false
   *         type: string
   *       - name: doctorName
   *         description: 医生姓名
   *         required: false
   *         type: string
   *       - name: paytime
   *         description: 支付时间
   *         required: false
   *         type: string
   *         format: date-time
   *       - name: money
   *         description: 支付金额
   *         required: false
   *         type: string
   *       - name: type
   *         description: 订单类型
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Order'
   *       500:
   *         description: Server internal error
   */
  // 获取订单信息 权限 医生/患者
  app.get(version + '/order/order', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), orderCtrl.getOrder)

  // load
  /**
   * @swagger
   * /upload:
   *   post:
   *     operationId: upload
   *     tags:
   *       - Upload
   *     summary: 上传图片
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
  // 上传图片 权限 医生/患者
  app.post(version + '/upload', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), loadCtrl.uploadphoto(), loadCtrl.upload)

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
   *         type: string
   *         format: date-time
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
   *     summary: 获取消息
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
  // 获取消息 权限 医生/患者
  app.get(version + '/new/news', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), newsCtrl.getNews)
  /**
   * @swagger
   * /new/newsByReadOrNot:
   *   get:
   *     operationId: getNewsByReadOrNot
   *     tags:
   *       - News
   *     summary: 通过消息状态获取消息
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
  // 通过消息状态获取消息 权限 医生/患者
  app.get(version + '/new/newsByReadOrNot', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), newsCtrl.getNewsByReadOrNot)
  /**
   * @swagger
   * /new/news:
   *   post:
   *     operationId: insertNews
   *     tags:
   *       - News
   *     summary: 插入news
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
  // 插入news 权限 医生/患者
  app.post(version + '/new/news', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), newsCtrl.insertNews)
  /**
   * @swagger
   * /new/teamNews:
   *   post:
   *     operationId: insertTeamNews
   *     tags:
   *       - News
   *     summary: 插入TeamNews
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
  // 插入TeamNews 权限 医生
  app.post(version + '/new/teamNews', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), newsCtrl.insertTeamNews)

  // report
  /**
   * @swagger
   * definition:
   *   Results:
   *     type: object
   *     properties:
   *       data1:
   *         type: array
   *         items:
   *           type: number
   *       recordTime:
   *         type: array
   *         items:
   *           type: string
   *           format: date-time
   *   DataItem:
   *     type: object
   *     properties:
   *       itemType:
   *         type: string
   *       recommendValue11:
   *         type: number
   *       recommendValue12:
   *         type: number
   *       recommendValue13:
   *         type: number
   *       recommendValue14:
   *         type: number
   *       doctorReport:
   *         type: string
   *       doctorComment:
   *         type: string
   */
  /**
   * @swagger
   * /report/vitalSigns:
   *   get:
   *     operationId: getVitalSigns
   *     tags:
   *       - Report
   *     summary: 获取患者当前和历史周月季年的测量记录
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
   *         type: string
   *         format: date-time
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
   *       201:
   *         description: 不存在该段时间的报告
   *       500:
   *         description: Server internal error
   */
  // 获取患者当前和历史周月季年的测量记录 权限 医生/患者
  app.get(version + '/report/vitalSigns', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), reportCtrl.getVitalSigns, reportCtrl.getReport)
  /**
   * @swagger
   * /report/report:
   *   post:
   *     operationId: updateReport
   *     tags:
   *       - Report
   *     summary: 医生点评患者的报表信息
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
   *             - patientId
   *             - time
   *             - data
   *           properties:
   *             token:
   *               type: string
   *             type:
   *               type: string
   *             patientId:
   *               type: string
   *             time:
   *               type: string
   *             data:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/DataItem'
   *     responses:
   *       200:
   *         description: 全部更新成功/未全部更新/未修改！请检查修改目标是否与原来一致！
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
  // 医生点评患者的报表信息 权限 医生
  app.post(version + '/report/report', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.checkPatient, alluserCtrl.getAlluserObject, reportCtrl.updateReport)
  /**
   * @swagger
   * definition:
   *   Patient:
   *     type: object
   *     properties:
   *       patientId:
   *         type: string
   *       dpRelationTime:
   *         type: string
   *         format: date-time
   *   Data:
   *     type: array
   *     items:
   *       type: object
   *       $ref: '#/definitions/Patient'
   */
  /**
   * @swagger
   * /nurse/bindingPatient:
   *   post:
   *     operationId: bindingPatient
   *     tags:
   *       - Nurse
   *     summary: 护士端微信扫码绑定患者
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         in: body
   *         description: token
   *         required: true
   *         properties:
   *             token:
   *               type: string
   *     responses:
   *       200:
   *         description: 绑定患者成功！
   *       201:
   *         description: 无临时绑定数据，扫码失败！
   *       202:
   *         description: 已绑定过该患者!
   *       500:
   *         description: Server internal error
   */
  // 护士端微信扫码绑定患者 权限 护士
  app.post(version + '/nurse/bindingPatient', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getPatientObject, nurseInsuranceWorkCtrl.bindingPatient)
  // app.post(version + '/nurse/bindingPatient', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), nurseInsuranceWorkCtrl.checkBinding, alluserCtrl.getPatientObject, nurseInsuranceWorkCtrl.bindingPatient, nurseInsuranceWorkCtrl.deleteOpenIdTmp)
  /**
   * @swagger
   * /nurse/patientsList:
   *   get:
   *     operationId: getInsurancePatientsList
   *     tags:
   *       - Nurse
   *     summary: 获取护士推送保险信息的患者列表
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 返回相应患者列表
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Data'
   *       500:
   *         description: Server internal error
   */
  // 获取护士推送保险信息的患者列表 权限 护士
  app.get(version + '/nurse/patientsList', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), alluserCtrl.getAlluserObject, nurseInsuranceWorkCtrl.getInsurancePatientsList)

  // 获取科室普通咨询/加急咨询/预约面诊/点评报表总数
  app.get(version + '/department/departmentCounsel', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDepartmentCounsel)
  // 获取具体医生普通咨询/加急咨询量
  app.get(version + '/department/docCounsel', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDocCounsel)
  // 获取具体医生的预约面诊数
  app.get(version + '/department/docPD', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDocPD)
  // 获取科室预约面诊数
  app.get(version + '/department/departmentPD', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDepartmentPD)
  // 获取具体医生的预约面诊数
  app.get(version + '/department/docRepComment', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDocRepComment)
  // 获取科室点评患者周／月／季／年报数量
  app.get(version + '/department/departRepComment', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDepartRepComment)
  // 获取地区点评患者周／月／季／年报数量
  app.get(version + '/department/districtRepComment', tokenManager.verifyToken(), departmentReportTempCtrl.getPeriodTime, departmentReportTempCtrl.getDistrictRepComment)

  // jyf
  // 刷新token
  /**
   * @swagger
   * /token/refresh:
   *   get:
   *     tags:
   *       - token refresh
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
   *       - dictionary
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
  // app.get(version + '/dict/typeTwo', tokenManager.verifyToken(), errorHandler.error, dictTypeTwoCtrl.getCategory)
  app.get(version + '/dict/typeTwo', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), errorHandler.error, dictTypeTwoCtrl.getCategory)
  // 2017-07-24测试 权限：admin
  /**
   * @swagger
   * /dict/typeTwo/codes:
   *   get:
   *     tags:
   *       - dictionary
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
   *       - dictionary
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
   *       - dictionary
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
   *         required: true
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

  // app.get(version + '/dict/district', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictDistrictCtrl.getDistrict)
  app.get(version + '/dict/district', dictDistrictCtrl.getDistrict)
  // 2017-07-24测试 权限：admin
  /**
   * @swagger
   * /dict/hospital:
   *   get:
   *     tags:
   *       - dictionary
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
   *         required: true
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
  // app.get(version + '/dict/hospital', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), dictHospitalCtrl.getHospital)
  app.get(version + '/dict/hospital', dictHospitalCtrl.getHospital)

  // devicedata
  // 2017-07-24测试 权限：patient
  /**
   * @swagger
   * /devicedata/BPDevice/binding:
   *   post:
   *     tags:
   *       - BPDevice
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
   *       - BPDevice
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
  app.get(version + '/wechat/getUserInfo', wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.getuserinfo)
  app.get(version + '/wechat/gettokenbycode', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken)
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign

  // 输入：微信用户授权的code 商户系统生成的订单号, aclChecking.Checking(acl, 2)
  app.post(version + '/wechat/addOrder', tokenManager.verifyToken(), alluserCtrl.checkDoctor, getNoMid.getNo(7), alluserCtrl.getAlluserObject, alluserCtrl.getDoctorObject, orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder, wechatCtrl.getPaySign)

  // 输入：微信用户授权的code 商户系统生成的订单号

  // app.post(version + '/wechat/addOrder', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder, wechatCtrl.getPaySign)

  // 订单支付结果回调
  app.post(version + '/wechat/payResult', wechatCtrl.payResult)
  // 查询订单   orderNo
  app.get(version + '/wechat/getWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.getWechatOrder)
  // 关闭订单   orderNo
  app.get(version + '/wechat/closeWechatOrder', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.closeWechatOrder)

  // app.post(version + '/wechat/refund', orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund)
  // 退款接口
  app.post(version + '/wechat/refund', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund, wechatCtrl.refundMessage)
  // 退款查询
  app.post('/wechat/refundquery', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), orderCtrl.checkPayStatus('refundquery'), wechatCtrl.chooseAppId, wechatCtrl.refundquery, orderCtrl.refundChangeStatus())
  // 消息模板
  app.post(version + '/wechat/messageTemplate', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  // 下载
  app.get(version + '/wechat/download', tokenManager.verifyToken(), aclChecking.Checking(acl), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.download)
  // 创建永久二维码
  app.post(version + '/wechat/createTDCticket', tokenManager.verifyToken(), aclChecking.Checking(acl, 2), wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.createTDCticket, alluserCtrl.setTDCticket)

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
  app.get(version + '/version', versionCtrl.getVersionInfo)
  app.post(version + '/version', tokenManager.verifyToken(), getNoMid.getNo(10), versionCtrl.insertVersionInfo)

  // niaodaifu
  /**
   * @swagger
   * /devicedata/niaodaifu/loginparam:
   *   get:
   *     tags:
   *       - niaodaifu
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
   *       - niaodaifu
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

  // swagger未调试
  // department
  /** JYF 2017-08-16
   * @swagger
   * /department/district:
   *   get:
   *     tags:
   *       - department
   *     description: 获取地区信息
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: district
   *         description: 地区名
   *         in: query
   *         type: string
   *       - name: portleader
   *         description: 地区负责人
   *         in: query
   *         type: string
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
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
  /** JYF 2017-08-16
   * @swagger
   * /department/department:
   *   get:
   *     tags:
   *       - department
   *     description: 获取科室信息
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: district
   *         description: 地区名
   *         in: query
   *         type: string
   *       - name: portleader
   *         description: 地区负责人
   *         in: query
   *         type: string
   *       - name: department
   *         description: 科室
   *         in: query
   *         type: string
   *       - name: hospital
   *         description: 医院
   *         in: query
   *         type: string
   *       - name: departLeader
   *         description: 科主任
   *         in: query
   *         type: string
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回科室信息
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
   *                 department:
   *                   type: string
   *                 hospital:
   *                   type: string
   *                 departLeader:
   *                   type: array
   *                   items:
   *                     type: string
   */
  app.get(version + '/department/department', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.getDepartment)
  /** JYF 2017-08-16
   * @swagger
   * /department/doctorlist:
   *   get:
   *     tags:
   *       - department
   *     description: 获取医生列表
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: district
   *         description: 地区名
   *         in: query
   *         type: string
   *       - name: department
   *         description: 科室
   *         in: query
   *         type: string
   *       - name: hospital
   *         description: 医院
   *         in: query
   *         type: string
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医生列表
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: object
   *               properties:
   *                 district:
   *                   type: string
   *                 department:
   *                   type: string
   *                 hospital:
   *                   type: string
   *                 doctors:
   *                   type: array
   *                   items:
   *                     type: string
   */
  app.get(version + '/department/doctorlist', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.getDoctorList)
  /** JYF 2017-08-16
   * @swagger
   * /department/updatedistrict:
   *   post:
   *     tags:
   *       - department
   *     description: 更新地区信息
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             district:
   *               type: string
   *             new:
   *               type: object
   *               properties:
   *                 newdistrict:
   *                   type: string
   *                 newportleader:
   *                   type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/department/updatedistrict', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.updateDistrict)
  /** JYF 2017-08-16
   * @swagger
   * /department/updatedepartment:
   *   post:
   *     tags:
   *       - department
   *     description: 更新科室信息
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             district:
   *               type: string
   *             hospital:
   *               type: string
   *             department:
   *               type: string
   *             new:
   *               type: object
   *               properties:
   *                 newdepartment:
   *                   type: string
   *                 newdepartLeader:
   *                   type: array
   *                 newdoctors:
   *                   type: array
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/department/updatedepartment', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.updateDepartment)
  /** JYF 2017-08-16
   * @swagger
   * /department/delete:
   *   post:
   *     tags:
   *       - department
   *     description: 删除记录
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             district:
   *               type: string
   *             hospital:
   *               type: string
   *             department:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/department/delete', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), departmentCtrl.deleteRecord)

  // 医生数据监控
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/distribution:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 获取医生分布
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
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
   *         description: 返回医生分布信息
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   count:
   *                     type: integer
   */
  app.get(version + '/doctormonitor/distribution', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getDistribution)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/linegraph:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 获取折线图数据
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
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
   *         description: 返回医生折线图数据
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   count:
   *                     type: integer
   */
  app.get(version + '/doctormonitor/linegraph', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getLinegraph)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/workload:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 医生工作量
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: date
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医生工作量
   */
  app.get(version + '/doctormonitor/workload', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getWorkload)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/counseltimeout:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 超时回复
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回超时回复信息
   */
  app.get(version + '/doctormonitor/counseltimeout', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getCounseltimeout)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/score:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 评分
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医生评分
   */
  app.get(version + '/doctormonitor/score', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getScore)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/score:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 评价详情
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: doctoruserId
   *         in: query
   *         type: string
   *       - name: token
   *         in: query
   *         type: string
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医生评价详情
   */
  app.get(version + '/doctormonitor/comment', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getComment)
  /** JYF 2017-08-16
   * @swagger
   * /doctormonitor/order:
   *   get:
   *     tags:
   *       - doctormonitor
   *     description: 收入统计
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回医生评价详情
   */
  app.get(version + '/doctormonitor/order', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), doctorMonitorCtrl.getOrder)

  // 患者数据监控
  /** JYF 2017-08-16
   * @swagger
   * /patientmonitor/distribution:
   *   get:
   *     tags:
   *       - patientmonitor
   *     description: 获取患者分布
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
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
   *         description: 返回患者分布信息
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   count:
   *                     type: integer
   */
  app.get(version + '/patientmonitor/distribution', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), patientMonitorCtrl.getDistribution)
  /** JYF 2017-08-16
   * @swagger
   * /patientmonitor/linegraph:
   *   get:
   *     tags:
   *       - patientmonitor
   *     description: 获取折线图数据
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
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
   *         description: 返回医生折线图数据
   *         schema:
   *           type: object
   *           properties:
   *             results:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   count:
   *                     type: integer
   */
  app.get(version + '/patientmonitor/linegraph', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), patientMonitorCtrl.getLinegraph)
  /** JYF 2017-08-16
   * @swagger
   * /patientmonitor/insurance:
   *   get:
   *     tags:
   *       - patientmonitor
   *     description: 保险意向
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *       - name: province
   *         in: query
   *         type: string
   *       - name: city
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回患者保险意向统计
   */
  app.get(version + '/patientmonitor/insurance', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), patientMonitorCtrl.getInsurance)
  /** JYF 2017-08-16
   * @swagger
   * /patientmonitor/patientsbyclass:
   *   get:
   *     tags:
   *       - patientmonitor
   *     description: 分类查询患者
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: classNo
   *         in: query
   *         type: string
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 相应类的患者列表
   */
  app.get(version + '/patientmonitor/patientsbyclass', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), patientMonitorCtrl.getPatientsByClass)

  // 科室超时未回复查询
  /** JYF 2017-08-16
   * @swagger
   * /departmentcounsel:
   *   get:
   *     tags:
   *       - departmentcounsel
   *     description: 科室超时未回复查询
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: date
   *         in: query
   *         type: string
   *       - name: departLeaderId
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 科室超时未回复列表
   */
  app.get(version + '/departmentcounsel', tokenManager.verifyToken(), aclChecking.Checking(acl, 1), counseltimeoutCtrl.getDepartmentCounsel)

  // 论坛
  /** JYF 2017-08-16
   * @swagger
   * /forum/allposts:
   *   get:
   *     tags:
   *       - forum
   *     description: 获取全部帖子
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: 标题
   *         in: query
   *         type: string
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回全部帖子或相应标题的帖子
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   postId:
   *                     type: string
   *                   sponsorId:
   *                     type: string
   *                   sponsorName:
   *                     type: string
   *                   title:
   *                     type: string
   *                   time:
   *                     type: string
   *                   replyCount:
   *                     type: integer
   *                   favoritesNum:
   *                     type: integer
   *                   anonymous:
   *                     type: integer
   *                   favoritesstatus:
   *                     type: integer
   */
  app.get(version + '/forum/allposts', tokenManager.verifyToken(), forumCtrl.getAllposts)
  /** JYF 2017-08-16
   * @swagger
   * /forum/mycollection:
   *   get:
   *     tags:
   *       - forum
   *     description: 获取我的收藏
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回我的收藏
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   postId:
   *                     type: string
   *                   sponsorId:
   *                     type: string
   *                   sponsorName:
   *                     type: string
   *                   title:
   *                     type: string
   *                   time:
   *                     type: string
   *                   replyCount:
   *                     type: integer
   *                   favoritesNum:
   *                     type: integer
   *                   anonymous:
   *                     type: integer
   *                   avatar:
   *                     type: string
   */
  app.get(version + '/forum/mycollection', tokenManager.verifyToken(), forumCtrl.getMycollection)
  /** JYF 2017-08-16
   * @swagger
   * /forum/myposts:
   *   get:
   *     tags:
   *       - forum
   *     description: 获取我的帖子
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: skip
   *         in: query
   *         type: integer
   *       - name: limit
   *         in: query
   *         type: integer
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回我的帖子
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   postId:
   *                     type: string
   *                   sponsorId:
   *                     type: string
   *                   sponsorName:
   *                     type: string
   *                   title:
   *                     type: string
   *                   time:
   *                     type: string
   *                   replyCount:
   *                     type: integer
   *                   favoritesNum:
   *                     type: integer
   *                   anonymous:
   *                     type: integer
   *                   avatar:
   *                     type: string
   */
  app.get(version + '/forum/myposts', tokenManager.verifyToken(), forumCtrl.getMyposts)
  /** JYF 2017-08-16
   * @swagger
   * /forum/postcontent:
   *   get:
   *     tags:
   *       - forum
   *     description: 获取帖子详情
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: postId
   *         in: query
   *         type: string
   *       - name: token
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 返回帖子详情
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   postId:
   *                     type: string
   *                   sponsorId:
   *                     type: string
   *                   sponsorName:
   *                     type: string
   *                   title:
   *                     type: string
   *                   time:
   *                     type: string
   *                   replyCount:
   *                     type: integer
   *                   favoritesNum:
   *                     type: integer
   *                   anonymous:
   *                     type: integer
   *                   avatar:
   *                     type: string
   *                   content:
   *                     type: array
   *                   replies:
   *                     type: array
   */
  app.get(version + '/forum/postcontent', tokenManager.verifyToken(), forumCtrl.getPostContent)
  /** JYF 2017-08-16
   * @swagger
   * /forum/posting:
   *   post:
   *     tags:
   *       - forum
   *     description: 发新帖
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             time:
   *               type: string
   *             token:
   *               type: string
   *             title:
   *               type: string
   *             anonymous:
   *               type: integer
   *             content:
   *               type: array
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/posting', tokenManager.verifyToken(), getNoMid.getNo(13), forumCtrl.forumPosting)
  /** JYF 2017-08-16
   * @swagger
   * /forum/comment:
   *   post:
   *     tags:
   *       - forum
   *     description: 评论帖
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             time:
   *               type: string
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *             content:
   *               type: array
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/comment', tokenManager.verifyToken(), getNoMid.getNo(14), forumCtrl.forumComment)
  /** JYF 2017-08-16
   * @swagger
   * /forum/reply:
   *   post:
   *     tags:
   *       - forum
   *     description: 回复评论
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             time:
   *               type: string
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *             content:
   *               type: array
   *             commentId:
   *               type: string
   *             at:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/reply', tokenManager.verifyToken(), getNoMid.getNo(15), forumCtrl.forumReply)
  /** JYF 2017-08-16
   * @swagger
   * /forum/favorite:
   *   post:
   *     tags:
   *       - forum
   *     description: 收藏帖子
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/favorite', tokenManager.verifyToken(), forumCtrl.forumFavorite)
  /** JYF 2017-08-16
   * @swagger
   * /forum/deletepost:
   *   post:
   *     tags:
   *       - forum
   *     description: 删除帖子
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/deletepost', tokenManager.verifyToken(), forumCtrl.deletePost)
  /** JYF 2017-08-16
   * @swagger
   * /forum/deletecomment:
   *   post:
   *     tags:
   *       - forum
   *     description: 删除帖子评论
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *             commentId:
   *               type: string
   *             replyId:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/deletecomment', tokenManager.verifyToken(), forumCtrl.deleteComment)
  /** JYF 2017-08-16
   * @swagger
   * /forum/deletefavorite:
   *   post:
   *     tags:
   *       - forum
   *     description: 取消收藏
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             token:
   *               type: string
   *             postId:
   *               type: string
   *     responses:
   *       200:
   *         description: 返回成功消息
   */
  app.post(version + '/forum/deletefavorite', tokenManager.verifyToken(), forumCtrl.deleteFavorite)

  // 科主任报告
  /** JYF 2017-08-16
   * @swagger
   * /departmentmonitor/patients:
   *   get:
   *     tags:
   *       - departmentmonitor
   *     description: 科室患者数
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: district
   *         in: query
   *         type: string
   *       - name: department
   *         in: query
   *         type: string
   *       - name: hospital
   *         in: query
   *         type: string
   *       - name: startTime
   *         in: query
   *         type: string
   *       - name: endTime
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 科室患者数
   */
  app.get(version + '/departmentmonitor/patients', departmentMonitorCtrl.getPatientsCount)
  app.get(version + '/departmentmonitor/score', departmentMonitorCtrl.getScore)
  app.get(version + '/departmentmonitor/negcomment', departmentMonitorCtrl.getNegComment)
  app.get(version + '/departmentmonitor/counseltimeout', departmentMonitorCtrl.getCounselTimeout)
  app.get(version + '/departmentmonitor/currentpatients', departmentMonitorCtrl.getCurrentPatientsCount)

  // 地区负责人报告
  app.get(version + '/districtmonitor/patients', districtMonitorCtrl.getPatientsCount)
  app.get(version + '/districtmonitor/departmentpatients', districtMonitorCtrl.getDepartmentPatientsCount)
  app.get(version + '/districtmonitor/score', districtMonitorCtrl.getScore)
  app.get(version + '/districtmonitor/negcomment', districtMonitorCtrl.getNegComment)
  app.get(version + '/districtmonitor/counseltimeout', districtMonitorCtrl.getCounselTimeout)

  // test
  // app.get(version + '/departmentmonitor/test', departmentMonitorCtrl.autoDepartmentDaily)

  /** YQC definitions
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
   *         $ref: '#/definitions/Doctor'
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
   *   Consultation:
   *     type: object
   *     properties:
   *       consultationId:
   *         type: string
   *       sponsorId:
   *         type: string
   *       patientId:
   *         type: object
   *         $ref: '#/definitions/Patient'
   *       time:
   *         type: string
   *         format: date-time
   *       diseaseInfo:
   *         type: object
   *         $ref: '#/definitions/Counsel'
   *       status:
   *         type: number
   *       messages:
   *         type: array
   *         items:
   *           $ref: '#/definitions/MessageInCounsel'
   *       conclusion:
   *         type: string
   *       teamId:
   *         type: string
   *   Counsel:
   *     type: object
   *     properties:
   *       counselId:
   *         type: string
   *       doctorId:
   *         type: object
   *         $ref: '#/definitions/Doctor'
   *       patientId:
   *         type: object
   *         $ref: '#/definitions/Patient'
   *       type:
   *         type: number
   *       time:
   *         type: string
   *         format: date-time
   *       status:
   *         type: number
   *       topic:
   *         type: string
   *       content:
   *         type: string
   *       title:
   *         type: string
   *       sickTime:
   *         type: string
   *       visited:
   *         type: number
   *       hospital:
   *         type: string
   *       visitDate:
   *         type: string
   *         format: date-time
   *       diagnosis:
   *         type: string
   *       diagnosisPhotoUrl:
   *         type: array
   *         items:
   *           type: string
   *       symptom:
   *         type: string
   *       symptomPhotoUrl:
   *         type: array
   *         items:
   *           type: string
   *       descirption:
   *         type: string
   *       help:
   *         type: string
   *       comment:
   *         type: string
   *       messages:
   *         type: array
   *         items:
   *           $ref: '#/definitions/MessageInCounsel'
   *   MessageInCounsel:
   *     type: object
   *     properties:
   *       sender:
   *         type: string
   *       receiver:
   *         type: string
   *       time:
   *         type: string
   *         format: date-time
   *       content:
   *         type: string
   *   Communication:
   *     type: object
   *     properties:
   *       messageNo:
   *         type: string
   *       messageType:
   *         type: number
   *       sendStatus:
   *         type: number
   *       readStatus:
   *         type: number
   *       sendBy:
   *         type: string
   *       receiver:
   *         type: string
   *       sendDateTime:
   *         type: string
   *         format: date-time
   *       title:
   *         type: string
   *       content:
   *         type: object
   *       newsType:
   *         type: string
   */

  app.get(version + '/dict/typeTwoTest', errorHandler.error, dictTypeTwoCtrl.getCategoryTest)
}
