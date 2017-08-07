
// global var
var version = '/api/v1'

// 3rd packages

// self-defined configurations
var config = require('../config')

// models
var Wechat = require('../models/wechat')

// middlewares
var getNoMid = require('../middlewares/getNoMid'),
  tokenManager = require('../middlewares/tokenManager'),
  aclChecking = require('../middlewares/aclChecking')
var errorHandler = require('../middlewares/errorHandler')

// controllers
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller'),

  userCtrl = require('../controllers/user_controller'),
  healthInfoCtrl = require('../controllers/healthInfo_controller'),
  dictNumberCtrl = require('../controllers/dictNumber_controller'),
  loadCtrl = require('../controllers/load_controller')

dictTypeOneCtrl = require('../controllers/dictTypeOne_controller'),
    dictDistrictCtrl = require('../controllers/dictDistrict_controller'),
    dictHospitalCtrl = require('../controllers/dictHospital_controller'),
    taskCtrl = require('../controllers/task_controller'),
    orderCtrl = require('../controllers/order_controller'),
    complianceCtrl = require('../controllers/compliance_controller'),
    jpushCtrl = require('../controllers/jpush_controller'),
    devicedataCtrl = require('../controllers/devicedata_controller'),
    aclsettingCtrl = require('../controllers/aclsetting_controller'),
    versionCtrl = require('../controllers/version_controller')

// controllers updated by GY
var doctorCtrl = require('../controllers/doctor_controller'),
  counselCtrl = require('../controllers/counsel_controller'),
  patientCtrl = require('../controllers/patient_controller'),
  commentCtrl = require('../controllers/comment_controller'),
  vitalSignCtrl = require('../controllers/vitalSign_controller'),
  accountCtrl = require('../controllers/account_controller'),
  adviceCtrl = require('../controllers/advice_controller'),
  expenseCtrl = require('../controllers/expense_controller'),
  communicationCtrl = require('../controllers/communication_controller'),
  messageCtrl = require('../controllers/message_controller'),
  newsCtrl = require('../controllers/news_controller'),
  insuranceCtrl = require('../controllers/insurance_controller')
var getQRcodeCtrl = require('../controllers/getQRcode')
var labtestResultCtrl = require('../controllers/labtestResult_controller')

var wechatCtrl = require('../controllers/wechat_controller')

module.exports = function (app, webEntry, acl) {
  // app.use('/static', express.static( './static')).
  //    use('/images', express.static( '../images')).
  //    use('/lib', express.static( '../lib')
  // );
  app.get('/', function (req, res) {
    // console.log("Connected successfully to server and response");
    // res.render('rich_ui');
    res.send('Server Root')
  })
// tokenManager.verifyToken(),
  // csq
  app.get(version + '/token/refresh', errorHandler.error, tokenManager.refreshToken)

  app.get(version + '/dict/typeTwo', errorHandler.error, dictTypeTwoCtrl.getCategory)
  app.get(version + '/dict/typeTwo/codes', errorHandler.error, dictTypeTwoCtrl.getTypes)
  // app.get(version + '/user', userCtrl.getUserList);
  // app.get(version + '/user/insert', userCtrl.insertUser);
  // app.get(version + '/user/one',  userCtrl.getUser);

  app.get(version + '/dict/typeOne', errorHandler.error, dictTypeOneCtrl.getCategory)
  app.get(version + '/dict/district', errorHandler.error, dictDistrictCtrl.getDistrict)
  app.get(version + '/dict/hospital', errorHandler.error, dictHospitalCtrl.getHospital)
  app.get(version + '/tasks', errorHandler.error, taskCtrl.getTasks)
  app.post(version + '/tasks/status', errorHandler.error, taskCtrl.updateStatus)
  app.post(version + '/tasks/time', errorHandler.error, taskCtrl.updateStartTime)

  // app.post(version + '/compliance', errorHandler.error, complianceCtrl.insertOne);
  app.get(version + '/compliance', errorHandler.error, complianceCtrl.getComplianceByDay)

  // wf
  // -------------------------------------------- 注册时如何验证用户 ------------------------------------------------------
  app.post(version + '/user/register', errorHandler.error, userCtrl.registerTest, getNoMid.getNo(1), userCtrl.register)
  // -------------------------------------------------------------------------------------------------------------------

  app.post(version + '/user/unionid', errorHandler.error, userCtrl.setOpenId, userCtrl.checkBinding, userCtrl.setOpenIdRes)
  app.post(version + '/user/openId', errorHandler.error, userCtrl.checkUser, userCtrl.setMessageOpenId)
  app.get(version + '/user/openId', errorHandler.error, userCtrl.checkUser, userCtrl.getMessageOpenId)

  // app.post('/user/registerWithOpenId',userCtrl.registerWithOpenIdTest,getNoMid.getNo(1), userCtrl.registerWithOpenId);

  // ------------------------------------------------------------------------------------------------------------
  app.post(version + '/user/reset', errorHandler.error, userCtrl.reset)
  // ------------------------------------------------------------------------------------------------------------

  app.post(version + '/user/login', errorHandler.error, userCtrl.openIdLoginTest, userCtrl.checkBinding, userCtrl.login)
  app.post(version + '/user/logout', errorHandler.error, userCtrl.logout)

  app.get(version + '/user/userID', errorHandler.error, userCtrl.getUserID)
  // app.get(version + '/user/getUserIDbyOpenId', errorHandler.error,  userCtrl.getUserIDbyOpenId);
  // app.get(version + '/user/TDCticket', errorHandler.error,  userCtrl.getUserTDCticket);

  app.post(version + '/user/sms', errorHandler.error, userCtrl.sendSMS)
  app.get(version + '/user/sms', errorHandler.error, userCtrl.verifySMS)
  app.get(version + '/user/agreement', errorHandler.error, userCtrl.getUserAgreement)
  app.post(version + '/user/agreement', errorHandler.error, userCtrl.updateUserAgreement)
  app.get(version + '/healthInfo/healthInfos', errorHandler.error, healthInfoCtrl.getAllHealthInfo)
  app.get(version + '/healthInfo/healthDetail', errorHandler.error, healthInfoCtrl.getHealthDetail)
  app.post(version + '/healthInfo/healthInfo', errorHandler.error, healthInfoCtrl.insertHealthInfo)
  app.post(version + '/healthInfo/healthDetail', errorHandler.error, healthInfoCtrl.modifyHealthDetail)
  app.post(version + '/healthInfo/deleteHealthDetail', errorHandler.error, healthInfoCtrl.deleteHealthDetail)
  // app.get(version + '/dictNumber/getNo', errorHandler.error, getNoMid.getNo(), dictNumberCtrl.getNo);
  // app.get(version + '/user/getIp', errorHandler.error, userCtrl.getIp);
  app.post(version + '/upload', errorHandler.error, loadCtrl.uploadphoto(), loadCtrl.upload)
  // app.get(version + '/download',loadCtrl.download);

  // routes updated by GY
  // 说明：测试需要，post方法返回的均为post内容，测试通过需要修改为成功或失败
  // doctor_Info
  app.post(version + '/doctor/detail', errorHandler.error, doctorCtrl.insertDocBasic)
  // 需要查询class字典表（待定）

  app.get(version + '/doctor/mypatients', errorHandler.error, doctorCtrl.getDoctorObject, doctorCtrl.getPatientList)
  // app.get(version + '/doctor/getDoctorInfo', errorHandler.error, doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get(version + '/doctor/detail', errorHandler.error, doctorCtrl.getDoctorObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo)
  app.get(version + '/doctor/myTeams', errorHandler.error, doctorCtrl.getTeams)
  app.get(version + '/doctor/teamPatients', errorHandler.error, doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList)
  // app.get(version + '/doctor/team', errorHandler.error, doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post(version + '/doctor/editDetail', errorHandler.error, doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember)

  app.get(version + '/doctor/myRecentDoctors', errorHandler.error, doctorCtrl.getDoctorObject, doctorCtrl.getRecentDoctorList)
  app.get(version + '/doctor/myPatientsByDate', errorHandler.error, doctorCtrl.getDoctorObject, doctorCtrl.getPatientByDate)
  app.post(version + '/doctor/schedule', errorHandler.error, doctorCtrl.insertSchedule)
  app.post(version + '/doctor/deleteSchedule', errorHandler.error, doctorCtrl.deleteSchedule)
  app.get(version + '/doctor/schedules', errorHandler.error, doctorCtrl.getSchedules)
  app.post(version + '/doctor/suspendTime', errorHandler.error, doctorCtrl.insertSuspendTime)

  app.post(version + '/doctor/deleteSuspendTime', errorHandler.error, doctorCtrl.deleteSuspendTime)
  app.get(version + '/doctor/suspendTime', errorHandler.error, doctorCtrl.getSuspendTime)
  app.get(version + '/doctor/numbers', errorHandler.error, doctorCtrl.getDocNum)

  app.get(version + '/doctor/AliPayAccount', errorHandler.error, doctorCtrl.getAliPayAccount)
  app.post(version + '/doctor/AliPayAccount', errorHandler.error, doctorCtrl.editAliPayAccount)

  // counsel
  app.get(version + '/counsel/counsels', errorHandler.error, doctorCtrl.getDoctorObject, counselCtrl.getCounsels)
  app.post(version + '/counsel/questionaire', errorHandler.error, counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire)
  app.post(version + '/counsel/changeCounselStatus', errorHandler.error, counselCtrl.changeCounselStatus)
  app.get(version + '/counsel/status', errorHandler.error, counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus)

  app.post(version + '/counsel/status', errorHandler.error, counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus)
  app.post(version + '/counsel/type', errorHandler.error, counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType)
  app.post(version + '/counsel/score', errorHandler.error, counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore)

  // patient_Info
  app.get(version + '/patient/detail', errorHandler.error, patientCtrl.getPatientDetail)

  app.get(version + '/patient/myDoctors', errorHandler.error, patientCtrl.getPatientObject, patientCtrl.getMyDoctor)
  app.post(version + '/patient/diagnosis', errorHandler.error, patientCtrl.getDoctorObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail)
  app.get(version + '/patient/doctors', errorHandler.error, patientCtrl.getDoctorLists)
  app.post(version + '/patient/detail', errorHandler.error, patientCtrl.checkPatientId, patientCtrl.newPatientDetail)
  app.post(version + '/patient/editDetail', errorHandler.error, patientCtrl.editPatientDetail)
  app.get(version + '/patient/counselRecords', errorHandler.error, patientCtrl.getPatientObject, patientCtrl.getCounselRecords)
  // app.post(version + '/patient/bindingMyDoctor', errorHandler.error, patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);
  // app.post(version + '/patient/bindingMyDoctor', errorHandler.error, patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);

  app.post(version + '/patient/bindingMyDoctor', errorHandler.error, patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  app.post(version + '/patient/changeVIP', errorHandler.error, patientCtrl.changeVIP)
  app.post(version + '/patient/wechatPhotoUrl', errorHandler.error, patientCtrl.wechatPhotoUrl)

  // comment_query
  app.get(version + '/comment/getComments', errorHandler.error, doctorCtrl.getDoctorObject, commentCtrl.getCommentsByDoc)
  app.get(version + '/comment/getCommentsByC', errorHandler.error, commentCtrl.getCommentsByCounselId)
  // vitalSign_query
  app.get(version + '/vitalSign/vitalSigns', errorHandler.error, patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns)
  app.post(version + '/vitalSign/vitalSign', errorHandler.error, vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData)

  // account_Info
  // 需要和user表连接
  // 无法输出expenseRecords数据，暂时无法解决问题
  app.get(version + '/account/getAccountInfo', errorHandler.error, accountCtrl.getAccountInfo)
  app.get(version + '/account/counts', errorHandler.error, accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts)
  app.post(version + '/account/counts', errorHandler.error, accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts)
  // app.post(version + '/account/rechargeDoctor', errorHandler.error, accountCtrl.rechargeDoctor);
  app.post(version + '/account/updateFreeTime', errorHandler.error, accountCtrl.checkPatient, accountCtrl.updateFreeTime)
  app.get(version + '/account/getCountsRespective', errorHandler.error, accountCtrl.checkPatient, accountCtrl.getCountsRespective)

  app.post(version + '/expense/rechargeDoctor', errorHandler.error, accountCtrl.checkPatient, doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor)

  app.get(version + '/expense/docRecords', errorHandler.error, doctorCtrl.checkDoctor, expenseCtrl.getDocRecords)

  // message
  app.get(version + '/message/messages', errorHandler.error, messageCtrl.getMessages)
  app.post(version + '/message/status', errorHandler.error, messageCtrl.changeMessageStatus)
  app.post(version + '/message/message', errorHandler.error, getNoMid.getNo(6), messageCtrl.insertMessage)

  // new
  app.get(version + '/new/news', errorHandler.error, newsCtrl.getNews)
  app.get(version + '/new/newsByReadOrNot', errorHandler.error, newsCtrl.getNewsByReadOrNot)
  app.post(version + '/new/news', errorHandler.error, newsCtrl.insertNews)
  app.post(version + '/new/teamNews', errorHandler.error, newsCtrl.insertTeamNews)

  // communication
  app.get(version + '/communication/counselReport', errorHandler.error, communicationCtrl.getCounselReport)
  app.post(version + '/communication/insertMember', errorHandler.error, communicationCtrl.insertMember, communicationCtrl.updateNumber)
  app.post(version + '/communication/removeMember', errorHandler.error, communicationCtrl.removeMember, communicationCtrl.updateNumber)
  // app.post(version + '/communication/newTeam', errorHandler.error, getNoMid.getNo(4), communicationCtrl.newTeam);
  app.post(version + '/communication/team', errorHandler.error, communicationCtrl.newTeam)
  app.post(version + '/communication/deleteTeam', errorHandler.error, communicationCtrl.deleteTeam)
  app.get(version + '/communication/team', errorHandler.error, communicationCtrl.getTeam)
  // app.post(version + '/communication/newConsultation', errorHandler.error, getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post(version + '/communication/consultation', errorHandler.error, communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation)

  app.post(version + '/communication/conclusion', errorHandler.error, communicationCtrl.conclusion)
  app.post(version + '/communication/updateLastTalkTime', errorHandler.error, communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime)
  // app.get(version + '/communication/getMessages');

  app.get(version + '/communication/consultation', errorHandler.error, communicationCtrl.getConsultation)
  app.post(version + '/communication/communication', errorHandler.error, getNoMid.getNo(8), communicationCtrl.postCommunication)
  app.get(version + '/communication/communication', errorHandler.error, communicationCtrl.getCommunication)

  // 临时接口：给原数据写入newsType字段
  // app.get(version + '/communication/updateNewsType', errorHandler.error, communicationCtrl.addnewsType);

  // task

  app.post(version + '/tasks/taskModel', errorHandler.error, taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel)
  app.get(version + '/tasks/task', errorHandler.error, taskCtrl.getUserTask)
  app.post(version + '/tasks/task', errorHandler.error, taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent)

  // compliance
  app.post(version + '/compliance', errorHandler.error, complianceCtrl.getCompliance, complianceCtrl.updateCompliance)

  // insurance
  app.post(version + '/insurance/message', errorHandler.error, insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage)
  app.get(version + '/insurance/message', errorHandler.error, insuranceCtrl.getInsMsg)
  app.post(version + '/insurance/prefer', errorHandler.error, insuranceCtrl.setPrefer)
  app.get(version + '/insurance/prefer', errorHandler.error, insuranceCtrl.getPrefer)

  // advice
  app.post(version + '/advice/postAdvice', errorHandler.error, adviceCtrl.postAdvice)
  app.get(version + '/advice/getAdvice', errorHandler.error, adviceCtrl.getAdvice)

  // labtestResult
  app.post(version + '/labtestResult/post', errorHandler.error, labtestResultCtrl.postLabtestResult)
  app.post(version + '/labtestResult/update', errorHandler.error, labtestResultCtrl.updateLabtestResult)
  app.post(version + '/labtestResult/delete', errorHandler.error, labtestResultCtrl.deleteLabtestResult)

  // user
  app.get(version + '/user/getPhoneNoByRole', errorHandler.error, userCtrl.getPhoneNoByRole)

  // order
  // app.post(version + '/order/insertOrder', errorHandler.error, getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post(version + '/order/order', errorHandler.error, orderCtrl.updateOrder)
  app.get(version + '/order/order', errorHandler.error, orderCtrl.getOrder)

  // // weixin wechatCtrl
  // app.get(version + '/wechat/settingConfig', errorHandler.error, wechatCtrl.getAccessTokenMid,wechatCtrl.wxJsApiTicket, wechatCtrl.settingConfig);
  // app.get(version + '/wechat/getAccessToken', errorHandler.error, wechatCtrl.getAccessToken);
  // // 获取用户基本信息
  // app.get(version + '/wechat/getUserInfo', errorHandler.error, wechatCtrl.gettokenbycode,wechatCtrl.getuserinfo);
  // // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // // 输入：微信用户授权的code 商户系统生成的订单号
  // app.get(version + '/wechat/addOrder', errorHandler.error, wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  // // app.post(version + '/wechat/notif',wechatCtrl.register);

  // weixin wechatCtrl
  app.get(version + '/wechat/settingConfig', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.settingConfig)

  // 获取用户基本信息
  app.get(version + '/wechat/getUserInfo', errorHandler.error, wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.getuserinfo)
  app.get(version + '/wechat/gettokenbycode', errorHandler.error, wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken)
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // 输入：微信用户授权的code 商户系统生成的订单号
  // app.get(version + '/wechat/addOrder', errorHandler.error, wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  app.post(version + '/wechat/addOrder', errorHandler.error, getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder, wechatCtrl.getPaySign)

  // app.post(version + '/order/insertOrder', errorHandler.error, getNoMid.getNo(7), orderCtrl.insertOrder);
  // 订单支付结果回调
  app.post(version + '/wechat/payResult', errorHandler.error, wechatCtrl.payResult)
  // 查询订单   orderNo
  app.get(version + '/wechat/getWechatOrder', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.getWechatOrder)
  // 关闭订单   orderNo
  app.get(version + '/wechat/closeWechatOrder', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.closeWechatOrder)

  // 退款接口
  app.post(version + '/wechat/refund', errorHandler.error, orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund)
  // 退款查询
  app.post('/wechat/refundquery', errorHandler.error, orderCtrl.checkPayStatus('refundquery'), wechatCtrl.chooseAppId, wechatCtrl.refundquery, orderCtrl.refundChangeStatus())
  // app.post('/test/test', errorHandler.error, wechatCtrl.testxml);

  // app.post(version + '/wechat/notif',wechatCtrl.register);
  // 消息模板
  app.post(version + '/wechat/messageTemplate', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.messageTemplate)
  // 下载
  app.get(version + '/wechat/download', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.download)
  // 创建永久二维码
  app.post(version + '/wechat/createTDCticket', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.createTDCticket, userCtrl.setTDCticket)

  // 接收微信服务器的post请求
  app.post('/wechat', errorHandler.error, wechatCtrl.receiveTextMessage)
  // 接收微信服务器的get请求
  app.get('/wechat', errorHandler.error, wechatCtrl.getServerSignature)

  // jpush
  app.post(version + '/jm/users', errorHandler.error, jpushCtrl.register)
  app.post(version + '/jm/groups', errorHandler.error, jpushCtrl.createGroup)
  app.post(version + '/jm/groups/members', errorHandler.error, jpushCtrl.updateGroup)

  // 自定义菜单
  app.post(version + '/wechat/createCustomMenu', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.createCustomMenu)
  app.get(version + '/wechat/getCustomMenu', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.getCustomMenu)
  app.get(version + '/wechat/deleteCustomMenu', errorHandler.error, wechatCtrl.chooseAppId, Wechat.baseTokenManager('access_token'), wechatCtrl.deleteCustomMenu)

  // 获取二维码相关方法
  // app.get(version + '/getAllDoctors', errorHandler.error, tokenManager.verifyToken(), getQRcodeCtrl.getAllDoctors);
  // app.post(version + '/saveAllTDCticket', errorHandler.error, getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket);
  // app.post(version + '/saveAllTDCticket', errorHandler.error, getQRcodeCtrl.saveAllTDCticket);
  // app.get(version + '/downloadImages', errorHandler.error, getQRcodeCtrl.downloadImages);
  // app.post(version + '/getAllQRcodes', errorHandler.error, getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket, getQRcodeCtrl.downloadImages);
  // app.post(version + '/downloadImages', errorHandler.error, getQRcodeCtrl.downloadImages);

  // app.get(version + '/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  // });
  // app.get(version + '/user/:userid', errorHandler.error, function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });

  app.post(version + '/acl/userRoles', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl))
  app.post(version + '/acl/removeUserRoles', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.removeUserRoles(acl))
  app.get(version + '/acl/userRoles', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.userRoles(acl))
  app.get(version + '/acl/userRole', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.hasRole(acl))

  app.get(version + '/acl/roleUsers', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.roleUsers(acl))
  app.post(version + '/acl/roleParents', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.addRoleParents(acl))
  app.post(version + '/acl/removeRoleParents', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.removeRoleParents(acl))
  app.post(version + '/acl/removeRole', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.removeRole(acl))

  app.post(version + '/acl/allow', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.allow(acl))
  app.post(version + '/acl/removeAllow', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.removeAllow(acl))
  app.get(version + '/acl/allow', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.allowedPermissions(acl))
  app.get(version + '/acl/isAllowed', errorHandler.error, tokenManager.verifyToken(), aclsettingCtrl.isAllowed(acl))

  app.post(version + '/acl/removeResource', tokenManager.verifyToken(), aclsettingCtrl.removeResource(acl))
  app.get(version + '/acl/areAnyRolesAllowed', tokenManager.verifyToken(), aclsettingCtrl.areAnyRolesAllowed(acl))
  app.get(version + '/acl/resources', tokenManager.verifyToken(), aclsettingCtrl.whatResources(acl))

  app.post(version + '/devicedata/BPDevice/binding', errorHandler.error, devicedataCtrl.bindingDevice)
  app.post(version + '/devicedata/BPDevice/debinding', errorHandler.error, devicedataCtrl.debindingDevice)
  app.post(version + '/devicedata/BPDevice/data', errorHandler.error, devicedataCtrl.receiveBloodPressure)
  app.get(version + '/devicedata/devices', errorHandler.error, devicedataCtrl.getDeviceInfo)

  app.get(version + '/version', errorHandler.error, versionCtrl.getVersionInfo)
  app.post(version + '/version', errorHandler.error, getNoMid.getNo(10), versionCtrl.insertVersionInfo)
}
