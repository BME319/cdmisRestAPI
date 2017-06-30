

// global var
var version = '/api/v1';


// 3rd packages


// self-defined configurations
var config = require('../config');

// models
var Wechat = require('../models/wechat');

// middlewares
var getNoMid = require('../middlewares/getNoMid'),
    tokenManager = require('../middlewares/tokenManager'),
    aclChecking = require('../middlewares/aclChecking');

// controllers
var dictTypeTwoCtrl = require('../controllers/dictTypeTwo_controller'),

    userCtrl = require('../controllers/user_controller'),
    healthInfoCtrl = require('../controllers/healthInfo_controller'),
    dictNumberCtrl = require('../controllers/dictNumber_controller'),
    loadCtrl = require('../controllers/load_controller');

  
    dictTypeOneCtrl = require('../controllers/dictTypeOne_controller'),
    dictDistrictCtrl = require('../controllers/dictDistrict_controller'),
    dictHospitalCtrl = require('../controllers/dictHospital_controller'),
    taskCtrl = require('../controllers/task_controller'),
    orderCtrl = require('../controllers/order_controller'),
    complianceCtrl = require('../controllers/compliance_controller'),
    jpushCtrl = require('../controllers/jpush_controller'),
    devicedataCtrl = require('../controllers/devicedata_controller'),
    aclsettingCtrl = require('../controllers/aclsetting_controller'),
    versionCtrl = require('../controllers/version_controller');


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
    insuranceCtrl = require('../controllers/insurance_controller');
var getQRcodeCtrl = require('../controllers/getQRcode');
var labtestResultCtrl = require('../controllers/labtestResult_controller');

var wechatCtrl = require('../controllers/wechat_controller');

module.exports = function(app,webEntry, acl) {

  //app.use('/static', express.static( './static')).
  //    use('/images', express.static( '../images')).
  //    use('/lib', express.static( '../lib')
  //);
  app.get('/', function(req, res){
    //console.log("Connected successfully to server and response");
    //res.render('rich_ui');
    res.send("Server Root");
  });
// tokenManager.verifyToken(),
  // csq 
  app.get(version + '/token/refresh', tokenManager.refreshToken);

  app.get(version + '/dict/typeTwo', dictTypeTwoCtrl.getCategory);
  app.get(version + '/dict/typeTwo/codes', dictTypeTwoCtrl.getTypes);
  // app.get(version + '/user', userCtrl.getUserList);
  // app.get(version + '/user/insert', userCtrl.insertUser);
  // app.get(version + '/user/one',  userCtrl.getUser);

  app.get(version + '/dict/typeOne',  dictTypeOneCtrl.getCategory);
  app.get(version + '/dict/district',  dictDistrictCtrl.getDistrict);
  app.get(version + '/dict/hospital',  dictHospitalCtrl.getHospital);
  app.get(version + '/tasks',  taskCtrl.getTasks);
  app.post(version + '/tasks/status',  taskCtrl.updateStatus);
  app.post(version + '/tasks/time',  taskCtrl.updateStartTime);

  // app.post(version + '/compliance', complianceCtrl.insertOne);
  app.get(version + '/compliance',  complianceCtrl.getComplianceByDay);

  // wf
  // -------------------------------------------- 注册时如何验证用户 ------------------------------------------------------
  app.post(version + '/user/register', userCtrl.registerTest,getNoMid.getNo(1), userCtrl.register);
  // -------------------------------------------------------------------------------------------------------------------

  app.post(version + '/user/unionid', userCtrl.setOpenId, userCtrl.checkBinding, userCtrl.setOpenIdRes);
  app.post(version + '/user/openId', userCtrl.checkUser, userCtrl.setMessageOpenId);
  app.get(version + '/user/openId', userCtrl.checkUser, userCtrl.getMessageOpenId);

  // app.post('/user/registerWithOpenId',userCtrl.registerWithOpenIdTest,getNoMid.getNo(1), userCtrl.registerWithOpenId);

  // ------------------------------------------------------------------------------------------------------------
  app.post(version + '/user/reset', userCtrl.reset);
  // ------------------------------------------------------------------------------------------------------------

  app.post(version + '/user/login', userCtrl.openIdLoginTest,userCtrl.checkBinding,userCtrl.login);
  app.post(version + '/user/logout',  userCtrl.logout);

  app.get(version + '/user/userID',  userCtrl.getUserID);
  // app.get(version + '/user/getUserIDbyOpenId',  userCtrl.getUserIDbyOpenId);
  // app.get(version + '/user/TDCticket',  userCtrl.getUserTDCticket);

  app.post(version + '/user/sms',  userCtrl.sendSMS);
  app.get(version + '/user/sms',  userCtrl.verifySMS);
  app.get(version + '/user/agreement',  userCtrl.getUserAgreement);
  app.post(version + '/user/agreement',  userCtrl.updateUserAgreement);
  app.get(version + '/healthInfo/healthInfos',  healthInfoCtrl.getAllHealthInfo);
  app.get(version + '/healthInfo/healthDetail',  healthInfoCtrl.getHealthDetail);
  app.post(version + '/healthInfo/healthInfo',  healthInfoCtrl.insertHealthInfo);
  app.post(version + '/healthInfo/healthDetail',  healthInfoCtrl.modifyHealthDetail);
  app.post(version + '/healthInfo/deleteHealthDetail',  healthInfoCtrl.deleteHealthDetail);
  // app.get(version + '/dictNumber/getNo', getNoMid.getNo(), dictNumberCtrl.getNo);
  // app.get(version + '/user/getIp', userCtrl.getIp); 
  app.post(version + '/upload',  loadCtrl.uploadphoto(), loadCtrl.upload);
  // app.get(version + '/download',loadCtrl.download);


  //routes updated by GY
  //说明：测试需要，post方法返回的均为post内容，测试通过需要修改为成功或失败
  //doctor_Info
  app.post(version + '/doctor/detail',  doctorCtrl.insertDocBasic);
  //需要查询class字典表（待定）

  app.get(version + '/doctor/mypatients',  doctorCtrl.getDoctorObject, doctorCtrl.getPatientList);
  // app.get(version + '/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get(version + '/doctor/detail',  doctorCtrl.getDoctorObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo);
  app.get(version + '/doctor/myTeams',  doctorCtrl.getTeams);
  app.get(version + '/doctor/teamPatients',  doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList);
  // app.get(version + '/doctor/team', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post(version + '/doctor/editDetail',  doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember);

  app.get(version + '/doctor/myRecentDoctors',  doctorCtrl.getDoctorObject, doctorCtrl.getRecentDoctorList);
  app.get(version + '/doctor/myPatientsByDate',  doctorCtrl.getDoctorObject, doctorCtrl.getPatientByDate);
  app.post(version + '/doctor/schedule',  doctorCtrl.insertSchedule);
  app.post(version + '/doctor/deleteSchedule',  doctorCtrl.deleteSchedule);
  app.get(version + '/doctor/schedules',  doctorCtrl.getSchedules);
  app.post(version + '/doctor/suspendTime',  doctorCtrl.insertSuspendTime);

  app.post(version + '/doctor/deleteSuspendTime', doctorCtrl.deleteSuspendTime);
  app.get(version + '/doctor/suspendTime', doctorCtrl.getSuspendTime);
  app.get(version + '/doctor/numbers', doctorCtrl.getDocNum);


  app.get(version + '/doctor/AliPayAccount', doctorCtrl.getAliPayAccount);
  app.post(version + '/doctor/AliPayAccount', doctorCtrl.editAliPayAccount);

  //counsel
  app.get(version + '/counsel/counsels', doctorCtrl.getDoctorObject, counselCtrl.getCounsels);
  app.post(version + '/counsel/questionaire', counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire);
  app.post(version + '/counsel/changeCounselStatus', counselCtrl.changeCounselStatus);
  app.get(version + '/counsel/status',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus);

  app.post(version + '/counsel/status',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus);
  app.post(version + '/counsel/type',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType);
  app.post(version + '/counsel/score', counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore);


  //patient_Info
  app.get(version + '/patient/detail',  patientCtrl.getPatientDetail);

  app.get(version + '/patient/myDoctors',  patientCtrl.getPatientObject, patientCtrl.getMyDoctor);
  app.post(version + '/patient/diagnosis',  patientCtrl.getDoctorObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail);
  app.get(version + '/patient/doctors',  patientCtrl.getDoctorLists);
  app.post(version + '/patient/detail',  patientCtrl.checkPatientId, patientCtrl.newPatientDetail);
  app.post(version + '/patient/editDetail', patientCtrl.editPatientDetail);
  app.get(version + '/patient/counselRecords', patientCtrl.getPatientObject, patientCtrl.getCounselRecords);
  // app.post(version + '/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);
  // app.post(version + '/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);

  app.post(version + '/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  app.post(version + '/patient/changeVIP', patientCtrl.changeVIP);
  app.post(version + '/patient/wechatPhotoUrl', patientCtrl.wechatPhotoUrl);

  //comment_query
  app.get(version + '/comment/getComments', doctorCtrl.getDoctorObject, commentCtrl.getCommentsByDoc);
  app.get(version + '/comment/getCommentsByC', commentCtrl.getCommentsByCounselId);
  //vitalSign_query
  app.get(version + '/vitalSign/vitalSigns',  patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns);
  app.post(version + '/vitalSign/vitalSign', vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData);


  //account_Info
  //需要和user表连接
  //无法输出expenseRecords数据，暂时无法解决问题
  app.get(version + '/account/getAccountInfo',  accountCtrl.getAccountInfo);
  app.get(version + '/account/counts',  accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts);
  app.post(version + '/account/counts',  accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts);
  // app.post(version + '/account/rechargeDoctor', accountCtrl.rechargeDoctor);
  app.post(version + '/account/updateFreeTime',  accountCtrl.checkPatient, accountCtrl.updateFreeTime);
  app.get(version + '/account/getCountsRespective',  accountCtrl.checkPatient, accountCtrl.getCountsRespective);
  
  app.post(version + '/expense/rechargeDoctor',  accountCtrl.checkPatient, doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor);

  app.get(version + '/expense/docRecords',  doctorCtrl.checkDoctor, expenseCtrl.getDocRecords);

  //message
  app.get(version + '/message/messages',  messageCtrl.getMessages);
  app.post(version + '/message/status',  messageCtrl.changeMessageStatus);
  app.post(version + '/message/message',  getNoMid.getNo(6), messageCtrl.insertMessage);

  //new
  app.get(version + '/new/news',  newsCtrl.getNews);
  app.get(version + '/new/newsByReadOrNot',  newsCtrl.getNewsByReadOrNot);
  app.post(version + '/new/news',  newsCtrl.insertNews);
  app.post(version + '/new/teamNews',  newsCtrl.insertTeamNews);
  
  //communication
  app.get(version + '/communication/counselReport',  communicationCtrl.getCounselReport);
  app.post(version + '/communication/insertMember',  communicationCtrl.insertMember, communicationCtrl.updateNumber);
  app.post(version + '/communication/removeMember',  communicationCtrl.removeMember, communicationCtrl.updateNumber);
  // app.post(version + '/communication/newTeam', getNoMid.getNo(4), communicationCtrl.newTeam);
  app.post(version + '/communication/team',  communicationCtrl.newTeam);
  app.post(version + '/communication/deleteTeam',  communicationCtrl.deleteTeam);
  app.get(version + '/communication/team',  communicationCtrl.getTeam);
  // app.post(version + '/communication/newConsultation', getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post(version + '/communication/consultation',  communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);

  app.post(version + '/communication/conclusion',  communicationCtrl.conclusion);
  app.post(version + '/communication/updateLastTalkTime',  communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime);
  //app.get(version + '/communication/getMessages');

  app.get(version + '/communication/consultation',  communicationCtrl.getConsultation);
  app.post(version + '/communication/communication',  getNoMid.getNo(8),communicationCtrl.postCommunication);
  app.get(version + '/communication/communication',  communicationCtrl.getCommunication);

  // 临时接口：给原数据写入newsType字段
  // app.get(version + '/communication/updateNewsType', communicationCtrl.addnewsType);

  //task

  app.post(version + '/tasks/taskModel',  taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel);
  app.get(version + '/tasks/task',  taskCtrl.getUserTask);
  app.post(version + '/tasks/task',  taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent);

  //compliance
  app.post(version + '/compliance',  complianceCtrl.getCompliance, complianceCtrl.updateCompliance);

  //insurance
  app.post(version + '/insurance/message',  insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage);
  app.get(version + '/insurance/message',  insuranceCtrl.getInsMsg);
  app.post(version + '/insurance/prefer',  insuranceCtrl.setPrefer);
  app.get(version + '/insurance/prefer',  insuranceCtrl.getPrefer);

  //advice
  app.post(version + '/advice/postAdvice',  adviceCtrl.postAdvice);
  app.get(version + '/advice/getAdvice',  adviceCtrl.getAdvice);

  //labtestResult
  app.post(version + '/labtestResult/post',  labtestResultCtrl.postLabtestResult);
  app.post(version + '/labtestResult/update',  labtestResultCtrl.updateLabtestResult);
  app.post(version + '/labtestResult/delete',  labtestResultCtrl.deleteLabtestResult);
  
  //user
  app.get(version + '/user/getPhoneNoByRole',  userCtrl.getPhoneNoByRole);

  // order
  // app.post(version + '/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post(version + '/order/order',  orderCtrl.updateOrder);
  app.get(version + '/order/order',   orderCtrl.getOrder);

  // // weixin wechatCtrl
  // app.get(version + '/wechat/settingConfig', wechatCtrl.getAccessTokenMid,wechatCtrl.wxJsApiTicket, wechatCtrl.settingConfig);
  // app.get(version + '/wechat/getAccessToken', wechatCtrl.getAccessToken);
  // // 获取用户基本信息
  // app.get(version + '/wechat/getUserInfo', wechatCtrl.gettokenbycode,wechatCtrl.getuserinfo);
  // // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // // 输入：微信用户授权的code 商户系统生成的订单号 
  // app.get(version + '/wechat/addOrder', wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  // // app.post(version + '/wechat/notif',wechatCtrl.register);


  // weixin wechatCtrl
  app.get(version + '/wechat/settingConfig', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.settingConfig);

  // 获取用户基本信息
  app.get(version + '/wechat/getUserInfo', wechatCtrl.chooseAppId,wechatCtrl.gettokenbycode,wechatCtrl.getuserinfo);
  app.get(version + '/wechat/gettokenbycode', wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken);
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // 输入：微信用户授权的code 商户系统生成的订单号 
  // app.get(version + '/wechat/addOrder', wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  app.post(version + '/wechat/addOrder',  getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder,wechatCtrl.getPaySign);
 
  // app.post(version + '/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  // 订单支付结果回调 
  app.post(version + '/wechat/payResult', wechatCtrl.payResult);
  // 查询订单   orderNo 
  app.get(version + '/wechat/getWechatOrder',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.getWechatOrder);
  // 关闭订单   orderNo 
  app.get(version + '/wechat/closeWechatOrder',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.closeWechatOrder);
  
  // 退款接口
  app.post(version + '/wechat/refund', orderCtrl.checkPayStatus('refund'), getNoMid.getNo(9), orderCtrl.refundChangeStatus('refundApplication'), wechatCtrl.chooseAppId, wechatCtrl.refund);
  // 退款查询
  app.post('/wechat/refundquery', orderCtrl.checkPayStatus('refundquery'), wechatCtrl.chooseAppId, wechatCtrl.refundquery, orderCtrl.refundChangeStatus());
  // app.post('/test/test', wechatCtrl.testxml);

  // app.post(version + '/wechat/notif',wechatCtrl.register);
  // 消息模板
  app.post(version + '/wechat/messageTemplate',  wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  // 下载
  app.get(version + '/wechat/download',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.download);
  // 创建永久二维码
  app.post(version + '/wechat/createTDCticket',  wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createTDCticket, userCtrl.setTDCticket);

  // 接收微信服务器的post请求
  app.post(version + '/wechat', wechatCtrl.receiveTextMessage);
  // 接收微信服务器的get请求
  app.get(version + '/wechat', wechatCtrl.getServerSignature);

  // jpush
  app.post(version + '/jm/users',  jpushCtrl.register);
  app.post(version + '/jm/groups',  jpushCtrl.createGroup);
  app.post(version + '/jm/groups/members',  jpushCtrl.updateGroup);

  // 自定义菜单
  app.post(version + '/wechat/createCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createCustomMenu);
  app.get(version + '/wechat/getCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.getCustomMenu);
  app.get(version + '/wechat/deleteCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.deleteCustomMenu);

  //获取二维码相关方法
  // app.get(version + '/getAllDoctors', tokenManager.verifyToken(), getQRcodeCtrl.getAllDoctors);
  // app.post(version + '/saveAllTDCticket', getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket);
  // app.post(version + '/saveAllTDCticket', getQRcodeCtrl.saveAllTDCticket);
  // app.get(version + '/downloadImages', getQRcodeCtrl.downloadImages);
  // app.post(version + '/getAllQRcodes', getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket, getQRcodeCtrl.downloadImages);
  // app.post(version + '/downloadImages', getQRcodeCtrl.downloadImages);

  //app.get(version + '/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get(version + '/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });

  app.post(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl));
  app.post(version + '/acl/removeUserRoles', tokenManager.verifyToken(), aclsettingCtrl.removeUserRoles(acl));
  app.get(version + '/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.userRoles(acl));
  app.get(version + '/acl/userRole', tokenManager.verifyToken(), aclsettingCtrl.hasRole(acl));

  app.get(version + '/acl/roleUsers', tokenManager.verifyToken(), aclsettingCtrl.roleUsers(acl)); 
  app.post(version + '/acl/roleParents', tokenManager.verifyToken(), aclsettingCtrl.addRoleParents(acl));
  app.post(version + '/acl/removeRoleParents', tokenManager.verifyToken(), aclsettingCtrl.removeRoleParents(acl));
  app.post(version + '/acl/removeRole', tokenManager.verifyToken(), aclsettingCtrl.removeRole(acl));
  
  app.post(version + '/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allow(acl));
  app.post(version + '/acl/removeAllow', tokenManager.verifyToken(), aclsettingCtrl.removeAllow(acl));  
  app.get(version + '/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allowedPermissions(acl));
  app.get(version + '/acl/isAllowed', tokenManager.verifyToken(), aclsettingCtrl.isAllowed(acl));

  app.post(version + '/acl/removeResource', tokenManager.verifyToken(), aclsettingCtrl.removeResource(acl));
  app.get(version + '/acl/areAnyRolesAllowed', tokenManager.verifyToken(), aclsettingCtrl.areAnyRolesAllowed(acl));
  app.get(version + '/acl/resources', tokenManager.verifyToken(), aclsettingCtrl.whatResources(acl));

  app.post(version + '/devicedata/BPDevice/binding', devicedataCtrl.bindingDevice);
  app.post(version + '/devicedata/BPDevice/debinding', devicedataCtrl.debindingDevice);
  app.post(version + '/devicedata/BPDevice/data', devicedataCtrl.receiveBloodPressure);
  app.get(version + '/devicedata/devices', devicedataCtrl.getDeviceInfo);

  app.get(version + '/version', versionCtrl.getVersionInfo);
  app.post(version + '/version', getNoMid.getNo(10), versionCtrl.insertVersionInfo);


};

