

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
    aclsettingCtrl = require('../controllers/aclsetting_controller');

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
  app.get('/token/refresh', tokenManager.refreshToken);

  app.get('/dict/typeTwo', dictTypeTwoCtrl.getCategory);
  app.get('/dict/typeTwo/codes', dictTypeTwoCtrl.getTypes);
  app.get('/user', userCtrl.getUserList);
  app.get('/user/insert', userCtrl.insertUser);
  app.get('/user/one',  userCtrl.getUser);

  app.get('/dict/typeOne',  dictTypeOneCtrl.getCategory);
  app.get('/dict/district',  dictDistrictCtrl.getDistrict);
  app.get('/dict/hospital',  dictHospitalCtrl.getHospital);
  app.get('/tasks',  taskCtrl.getTasks);
  app.get('/tasks/status',  taskCtrl.updateStatus);
  app.get('/tasks/time',  taskCtrl.updateStartTime);

  // app.post('/compliance', complianceCtrl.insertOne);
  app.get('/compliance',  complianceCtrl.getComplianceByDay);

  // wf
  // -------------------------------------------- 注册时如何验证用户 ------------------------------------------------------
  app.post('/user/register', userCtrl.registerTest,getNoMid.getNo(1), userCtrl.register);
  // -------------------------------------------------------------------------------------------------------------------

  app.post('/user/setOpenId', userCtrl.setOpenId, userCtrl.checkBinding, userCtrl.setOpenIdRes);
  app.post('/user/setMessageOpenId', userCtrl.checkUser, userCtrl.setMessageOpenId);
  app.get('/user/getMessageOpenId', userCtrl.checkUser, userCtrl.getMessageOpenId);

  // app.post('/user/registerWithOpenId',userCtrl.registerWithOpenIdTest,getNoMid.getNo(1), userCtrl.registerWithOpenId);

  // ------------------------------------------------------------------------------------------------------------
  app.post('/user/reset', userCtrl.reset);
  // ------------------------------------------------------------------------------------------------------------

  app.post('/user/login', userCtrl.openIdLoginTest,userCtrl.checkBinding,userCtrl.login);
  app.post('/user/logout',  userCtrl.logout);
  app.get('/user/getUserID',  userCtrl.getUserID);
  app.get('/user/getUserIDbyOpenId',  userCtrl.getUserIDbyOpenId);
  app.get('/user/TDCticket',  userCtrl.getUserTDCticket);

  app.post('/user/sendSMS',  userCtrl.sendSMS);
  app.get('/user/verifySMS',  userCtrl.verifySMS);
  app.get('/user/getUserAgreement',  userCtrl.getUserAgreement);
  app.post('/user/updateUserAgreement',  userCtrl.updateUserAgreement);
  app.get('/healthInfo/getAllHealthInfo',  healthInfoCtrl.getAllHealthInfo);
  app.get('/healthInfo/getHealthDetail',  healthInfoCtrl.getHealthDetail);
  app.post('/healthInfo/insertHealthInfo',  healthInfoCtrl.insertHealthInfo);
  app.post('/healthInfo/modifyHealthDetail',  healthInfoCtrl.modifyHealthDetail);
  app.post('/healthInfo/deleteHealthDetail',  healthInfoCtrl.deleteHealthDetail);
  // app.get('/dictNumber/getNo', getNoMid.getNo(), dictNumberCtrl.getNo);
  // app.get('/user/getIp', userCtrl.getIp); 
  app.post('/upload',  loadCtrl.uploadphoto(), loadCtrl.upload);
  // app.get('/download',loadCtrl.download);


  //routes updated by GY
  //说明：测试需要，post方法返回的均为post内容，测试通过需要修改为成功或失败
  //doctor_Info
  app.post('/doctor/postDocBasic',  doctorCtrl.insertDocBasic);
  //需要查询class字典表（待定）
  app.get('/doctor/getPatientList',  doctorCtrl.getDoctorObject, doctorCtrl.getPatientList);
  // app.get('/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get('/doctor/getDoctorInfo',  doctorCtrl.getDoctorObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo);
  app.get('/doctor/getMyGroupList',  doctorCtrl.getTeams);
  app.get('/doctor/getGroupPatientList',  doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList);
  // app.get('/doctor/getTeam', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post('/doctor/editDoctorDetail',  doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember);

  app.get('/doctor/getRecentDoctorList',  doctorCtrl.getDoctorObject, doctorCtrl.getRecentDoctorList);
  app.get('/doctor/getPatientByDate',  doctorCtrl.getDoctorObject, doctorCtrl.getPatientByDate);
  app.post('/doctor/insertSchedule',  doctorCtrl.insertSchedule);
  app.post('/doctor/deleteSchedule',  doctorCtrl.deleteSchedule);
  app.get('/doctor/getSchedules',  doctorCtrl.getSchedules);
  app.post('/doctor/insertSuspendTime',  doctorCtrl.insertSuspendTime);

  app.post('/doctor/deleteSuspendTime', doctorCtrl.deleteSuspendTime);
  app.get('/doctor/getSuspendTime', doctorCtrl.getSuspendTime);
  app.get('/doctor/getDocNum', doctorCtrl.getDocNum);

  //counsel
  app.get('/counsel/getCounsels', doctorCtrl.getDoctorObject, counselCtrl.getCounsels);
  app.post('/counsel/questionaire', counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire);
  app.post('/counsel/changeCounselStatus', counselCtrl.changeCounselStatus);
  app.get('/counsel/getStatus',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus);

  app.post('/counsel/changeStatus',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus, counselCtrl.changeConsultationStatus);
  app.post('/counsel/changeType',  counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType);
  app.post('/counsel/insertCommentScore', counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore);



  //patient_Info
  app.get('/patient/getPatientDetail',  patientCtrl.getPatientDetail);

  app.get('/patient/getMyDoctors',  patientCtrl.getPatientObject, patientCtrl.getMyDoctor);
  app.post('/patient/insertDiagnosis',  patientCtrl.getDoctorObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail);
  app.get('/patient/getDoctorLists',  patientCtrl.getDoctorLists);
  app.post('/patient/newPatientDetail',  patientCtrl.checkPatientId, patientCtrl.newPatientDetail);
  app.post('/patient/editPatientDetail', patientCtrl.editPatientDetail);
  app.get('/patient/getCounselRecords', patientCtrl.getPatientObject, patientCtrl.getCounselRecords);
  // app.post('/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);
  // app.post('/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);

  app.post('/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  app.post('/patient/changeVIP', patientCtrl.changeVIP);
  app.post('/patient/wechatPhotoUrl', patientCtrl.wechatPhotoUrl);

  //comment_query
  app.get('/comment/getComments', doctorCtrl.getDoctorObject, commentCtrl.getCommentsByDoc);
  app.get('/comment/getCommentsByC', commentCtrl.getCommentsByCounselId);
  //vitalSign_query
  app.get('/vitalSign/getVitalSigns',  patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns);
  app.post('/vitalSign/insertVitalSign', vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData);


  //account_Info
  //需要和user表连接
  //无法输出expenseRecords数据，暂时无法解决问题
  app.get('/account/getAccountInfo',  accountCtrl.getAccountInfo);
  app.get('/account/getCounts',  accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts);
  app.post('/account/modifyCounts',  accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts);
  // app.post('/account/rechargeDoctor', accountCtrl.rechargeDoctor);
  app.post('/account/updateFreeTime',  accountCtrl.checkPatient, accountCtrl.updateFreeTime);
  app.get('/account/getCountsRespective',  accountCtrl.checkPatient, accountCtrl.getCountsRespective);
  
  app.post('/expense/rechargeDoctor',  accountCtrl.checkPatient, doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor);
  app.get('/expense/getDocRecords',  doctorCtrl.checkDoctor, expenseCtrl.getDocRecords);

  //message
  app.get('/message/getMessages',  messageCtrl.getMessages);
  app.post('/message/changeMessageStatus',  messageCtrl.changeMessageStatus);
  app.post('/message/insertMessage',  getNoMid.getNo(6), messageCtrl.insertMessage);

  //new
  app.get('/new/getNews',  newsCtrl.getNews);
  app.get('/new/getNewsByReadOrNot',  newsCtrl.getNewsByReadOrNot);
  app.post('/new/insertNews',  newsCtrl.insertNews);
  app.post('/new/insertTeamNews',  newsCtrl.insertTeamNews);
  
  //communication
  app.get('/communication/getCounselReport',  communicationCtrl.getCounselReport);
  app.post('/communication/insertMember',  communicationCtrl.insertMember, communicationCtrl.updateNumber);
  app.post('/communication/removeMember',  communicationCtrl.removeMember, communicationCtrl.updateNumber);
  // app.post('/communication/newTeam', getNoMid.getNo(4), communicationCtrl.newTeam);
  app.post('/communication/newTeam',  communicationCtrl.newTeam);
  app.post('/communication/deleteTeam',  communicationCtrl.deleteTeam);
  app.get('/communication/getTeam',  communicationCtrl.getTeam);
  // app.post('/communication/newConsultation', getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post('/communication/newConsultation',  communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post('/communication/conclusion',  communicationCtrl.conclusion);
  app.post('/communication/updateLastTalkTime',  communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime);
  //app.get('/communication/getMessages');

  app.get('/communication/getConsultation',  communicationCtrl.getConsultation);
  app.post('/communication/postCommunication',  getNoMid.getNo(8),communicationCtrl.postCommunication);
  app.get('/communication/getCommunication',  communicationCtrl.getCommunication);

  // 临时接口：给原数据写入newsType字段
  // app.get('/communication/updateNewsType', communicationCtrl.addnewsType);


  //task
  app.post('/tasks/insertTaskModel',  taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel);
  app.get('/tasks/getUserTask',  taskCtrl.getUserTask);
  app.post('/tasks/updateUserTask',  taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent);

  //compliance
  app.post('/compliance/update',  complianceCtrl.getCompliance, complianceCtrl.updateCompliance);

  //insurance
  app.post('/insurance/updateInsuranceMsg',  insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage);
  app.get('/insurance/getInsMsg',  insuranceCtrl.getInsMsg);
  app.get('/insurance/setPrefer',  insuranceCtrl.setPrefer);
  app.get('/insurance/getPrefer',  insuranceCtrl.getPrefer);

  //advice

  app.post('/advice/postAdvice', tokenManager.verifyToken(), adviceCtrl.postAdvice);
  app.get('/advice/getAdvice',  adviceCtrl.getAdvice);

  //labtestResult
  app.post('/labtestResult/post',  labtestResultCtrl.postLabtestResult);
  app.post('/labtestResult/update',  labtestResultCtrl.updateLabtestResult);
  app.post('/labtestResult/delete',  labtestResultCtrl.deleteLabtestResult);
  
  //user
  app.get('/user/getPhoneNoByRole',  userCtrl.getPhoneNoByRole);

  // order
  // app.post('/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post('/order/updateOrder',  orderCtrl.updateOrder);
  app.get('/order/getOrder',   orderCtrl.getOrder);


  // // weixin wechatCtrl
  // app.get('/wechat/settingConfig', wechatCtrl.getAccessTokenMid,wechatCtrl.wxJsApiTicket, wechatCtrl.settingConfig);
  // app.get('/wechat/getAccessToken', wechatCtrl.getAccessToken);
  // // 获取用户基本信息
  // app.get('/wechat/getUserInfo', wechatCtrl.gettokenbycode,wechatCtrl.getuserinfo);
  // // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // // 输入：微信用户授权的code 商户系统生成的订单号 
  // app.get('/wechat/addOrder', wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  // // app.post('/wechat/notif',wechatCtrl.register);


  // weixin wechatCtrl
  app.get('/wechat/settingConfig', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.settingConfig);

  // 获取用户基本信息
  app.get('/wechat/getUserInfo', wechatCtrl.chooseAppId,wechatCtrl.gettokenbycode,wechatCtrl.getuserinfo);
  app.get('/wechat/gettokenbycode', wechatCtrl.chooseAppId, wechatCtrl.gettokenbycode, wechatCtrl.returntoken);
  // 统一下单  根据code获取access_token，openid   获取数据库中的订单信息   获取微信统一下单的接口数据 prepay_id   生成微信PaySign
  // 输入：微信用户授权的code 商户系统生成的订单号 
  // app.get('/wechat/addOrder', wechatCtrl.gettokenbycode, wechatCtrl.getPaymentOrder, wechatCtrl.addOrder,wechatCtrl.getPaySign);
  app.post('/wechat/addOrder',  getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder,wechatCtrl.getPaySign);
 
  // app.post('/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  // 订单支付结果回调 
  app.post('/wechat/payResult', wechatCtrl.payResult);
  // 查询订单   orderNo 
  app.get('/wechat/getWechatOrder',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.getWechatOrder);
  // 关闭订单   orderNo 
  app.get('/wechat/closeWechatOrder',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.closeWechatOrder);


  // app.post('/wechat/notif',wechatCtrl.register);
  // 消息模板
  app.post('/wechat/messageTemplate',  wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  // 下载
  app.get('/wechat/download',  wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.download);
  // 创建永久二维码
  app.post('/wechat/createTDCticket',  wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createTDCticket, userCtrl.setTDCticket);

  // 接收微信服务器的post请求
  app.post('/wechat', wechatCtrl.receiveTextMessage);
  // 接收微信服务器的get请求
  app.get('/wechat', wechatCtrl.getServerSignature);

  // jpush
  app.post('/jm/users',  jpushCtrl.register);
  app.post('/jm/groups',  jpushCtrl.createGroup);
  app.post('/jm/groups/members',  jpushCtrl.updateGroup);

  // 自定义菜单
  app.post('/wechat/createCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createCustomMenu);
  app.get('/wechat/getCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.getCustomMenu);
  app.get('/wechat/deleteCustomMenu', wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.deleteCustomMenu);

  //获取二维码相关方法
  // app.get('/getAllDoctors', tokenManager.verifyToken(), getQRcodeCtrl.getAllDoctors);
  // app.post('/saveAllTDCticket', getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket);
  // app.post('/saveAllTDCticket', getQRcodeCtrl.saveAllTDCticket);
  // app.get('/downloadImages', getQRcodeCtrl.downloadImages);
  // app.post('/getAllQRcodes', getQRcodeCtrl.getAllDoctors, getQRcodeCtrl.saveAllTDCticket, getQRcodeCtrl.downloadImages);
  // app.post('/downloadImages', getQRcodeCtrl.downloadImages);

  //app.get('/find',function(req, res){
  //  var url_parts = url.parse(req.url, true);
  //  var query = url_parts.query;
  //  res.send('Finding Book: Author: ' + query.author + ' Title: ' + query.title);
  //});
  // app.get('/user/:userid', function(req, res){
  //   res.send("Get User: " + req.param("userid"));
  // });

  app.post('/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.addUserRoles(acl));
  app.post('/acl/removeUserRoles', tokenManager.verifyToken(), aclsettingCtrl.removeUserRoles(acl));
  app.get('/acl/userRoles', tokenManager.verifyToken(), aclsettingCtrl.userRoles(acl));
  app.get('/acl/userRole', tokenManager.verifyToken(), aclsettingCtrl.hasRole(acl));

  app.get('/acl/roleUsers', tokenManager.verifyToken(), aclsettingCtrl.roleUsers(acl)); 
  app.post('/acl/roleParents', tokenManager.verifyToken(), aclsettingCtrl.addRoleParents(acl));
  app.post('/acl/removeRoleParents', tokenManager.verifyToken(), aclsettingCtrl.removeRoleParents(acl));
  app.post('/acl/removeRole', tokenManager.verifyToken(), aclsettingCtrl.removeRole(acl));
  
  app.post('/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allow(acl));
  app.post('/acl/removeAllow', tokenManager.verifyToken(), aclsettingCtrl.removeAllow(acl));  
  app.get('/acl/allow', tokenManager.verifyToken(), aclsettingCtrl.allowedPermissions(acl));
  app.get('/acl/isAllowed', tokenManager.verifyToken(), aclsettingCtrl.isAllowed(acl));

  app.post('/acl/removeResource', tokenManager.verifyToken(), aclsettingCtrl.removeResource(acl));
  app.get('/acl/areAnyRolesAllowed', tokenManager.verifyToken(), aclsettingCtrl.areAnyRolesAllowed(acl));
  app.get('/acl/resources', tokenManager.verifyToken(), aclsettingCtrl.whatResources(acl));

};

