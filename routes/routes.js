

// 3rd packages


// self-defined configurations
var config = require('../config');

// models
var Wechat = require('../models/wechat');

// middlewares
var getNoMid = require('../middlewares/getNoMid'),
    tokenManager = require('../middlewares/tokenManager');

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
    jpushCtrl = require('../controllers/jpush_controller');

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

module.exports = function(app,webEntry) {
  
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

  app.get('/dict/typeTwo', tokenManager.verifyToken(),dictTypeTwoCtrl.getCategory);
  app.get('/dict/typeTwo/codes', tokenManager.verifyToken(),dictTypeTwoCtrl.getTypes);
  app.get('/user', tokenManager.verifyToken(),userCtrl.getUserList);
  app.get('/user/insert', tokenManager.verifyToken(),userCtrl.insertUser);
  app.get('/user/one', tokenManager.verifyToken(), userCtrl.getUser);

  app.get('/dict/typeOne', tokenManager.verifyToken(), dictTypeOneCtrl.getCategory);
  app.get('/dict/district', tokenManager.verifyToken(), dictDistrictCtrl.getDistrict);
  app.get('/dict/hospital', tokenManager.verifyToken(), dictHospitalCtrl.getHospital);
  app.get('/tasks', tokenManager.verifyToken(), taskCtrl.getTasks);
  app.get('/tasks/status', tokenManager.verifyToken(), taskCtrl.updateStatus);
  app.get('/tasks/time', tokenManager.verifyToken(), taskCtrl.updateStartTime);
  // app.post('/compliance', complianceCtrl.insertOne);
  app.get('/compliance', tokenManager.verifyToken(), complianceCtrl.getComplianceByDay);

  // wf
  // -------------------------------------------- 注册时如何验证用户 ------------------------------------------------------
  app.post('/user/register', userCtrl.registerTest,getNoMid.getNo(1), userCtrl.register);
  // -------------------------------------------------------------------------------------------------------------------

  app.post('/user/setOpenId',tokenManager.verifyToken(), userCtrl.setOpenId, userCtrl.checkBinding, userCtrl.setOpenIdRes);
  app.post('/user/setMessageOpenId',tokenManager.verifyToken(), userCtrl.checkUser, userCtrl.setMessageOpenId);
  app.get('/user/getMessageOpenId',tokenManager.verifyToken(), userCtrl.checkUser, userCtrl.getMessageOpenId);

  // app.post('/user/registerWithOpenId',userCtrl.registerWithOpenIdTest,getNoMid.getNo(1), userCtrl.registerWithOpenId);

  // ------------------------------------------------------------------------------------------------------------
  app.post('/user/reset', userCtrl.reset);
  // ------------------------------------------------------------------------------------------------------------

  app.post('/user/login', userCtrl.openIdLoginTest,userCtrl.checkBinding,userCtrl.login);
  app.post('/user/logout', tokenManager.verifyToken(), userCtrl.logout);
  app.get('/user/getUserID', tokenManager.verifyToken(), userCtrl.getUserID);
  app.get('/user/getUserIDbyOpenId', tokenManager.verifyToken(), userCtrl.getUserIDbyOpenId);
  app.post('/user/sendSMS', tokenManager.verifyToken(), userCtrl.sendSMS);
  app.get('/user/verifySMS', tokenManager.verifyToken(), userCtrl.verifySMS);
  app.get('/user/getUserAgreement', tokenManager.verifyToken(), userCtrl.getUserAgreement);
  app.post('/user/updateUserAgreement', tokenManager.verifyToken(), userCtrl.updateUserAgreement);
  app.get('/healthInfo/getAllHealthInfo', tokenManager.verifyToken(), healthInfoCtrl.getAllHealthInfo);
  app.get('/healthInfo/getHealthDetail', tokenManager.verifyToken(), healthInfoCtrl.getHealthDetail);
  app.post('/healthInfo/insertHealthInfo', tokenManager.verifyToken(), healthInfoCtrl.insertHealthInfo);
  app.post('/healthInfo/modifyHealthDetail', tokenManager.verifyToken(), healthInfoCtrl.modifyHealthDetail);
  app.post('/healthInfo/deleteHealthDetail', tokenManager.verifyToken(), healthInfoCtrl.deleteHealthDetail);
  // app.get('/dictNumber/getNo', getNoMid.getNo(), dictNumberCtrl.getNo);
  // app.get('/user/getIp', userCtrl.getIp); 
  app.post('/upload', tokenManager.verifyToken(), loadCtrl.uploadphoto(), loadCtrl.upload);
  // app.get('/download',loadCtrl.download);


  //routes updated by GY
  //说明：测试需要，post方法返回的均为post内容，测试通过需要修改为成功或失败
  //doctor_Info
  app.post('/doctor/postDocBasic', tokenManager.verifyToken(), doctorCtrl.insertDocBasic);
  //需要查询class字典表（待定）
  app.get('/doctor/getPatientList', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, doctorCtrl.getPatientList);
  // app.get('/doctor/getDoctorInfo', doctorCtrl.getDoctorObject, doctorCtrl.getDoctorInfo);
  app.get('/doctor/getDoctorInfo', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, doctorCtrl.getCount1AndCount2, doctorCtrl.getComments, doctorCtrl.getDoctorInfo);
  app.get('/doctor/getMyGroupList', tokenManager.verifyToken(), doctorCtrl.getTeams);
  app.get('/doctor/getGroupPatientList', tokenManager.verifyToken(), doctorCtrl.getTeamObject, doctorCtrl.getGroupPatientList);
  // app.get('/doctor/getTeam', doctorCtrl.getTeamObject, doctorCtrl.getTeam);
  app.post('/doctor/editDoctorDetail', tokenManager.verifyToken(), doctorCtrl.editDoctorDetail, doctorCtrl.updateTeamSponsor, doctorCtrl.updateTeamMember);
  app.get('/doctor/getRecentDoctorList', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, doctorCtrl.getRecentDoctorList);
  app.get('/doctor/getPatientByDate', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, doctorCtrl.getPatientByDate);
  app.post('/doctor/insertSchedule', tokenManager.verifyToken(), doctorCtrl.insertSchedule);
  app.post('/doctor/deleteSchedule', tokenManager.verifyToken(), doctorCtrl.deleteSchedule);
  app.get('/doctor/getSchedules', tokenManager.verifyToken(), doctorCtrl.getSchedules);
  app.post('/doctor/insertSuspendTime', tokenManager.verifyToken(), doctorCtrl.insertSuspendTime);
  app.post('/doctor/deleteSuspendTime', tokenManager.verifyToken(), doctorCtrl.deleteSuspendTime);
  app.get('/doctor/getSuspendTime', tokenManager.verifyToken(), doctorCtrl.getSuspendTime);
  app.get('/doctor/getDocNum', tokenManager.verifyToken(), doctorCtrl.getDocNum);

  //counsel
  app.get('/counsel/getCounsels', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, counselCtrl.getCounsels);
  app.post('/counsel/questionaire', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(2), counselCtrl.saveQuestionaire);
  app.post('/counsel/changeCounselStatus', tokenManager.verifyToken(), counselCtrl.changeCounselStatus);
  app.get('/counsel/getStatus', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus);

  app.post('/counsel/changeStatus', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselStatus);
  app.post('/counsel/changeType', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, counselCtrl.getStatus, counselCtrl.changeCounselType);
  app.post('/counsel/insertCommentScore', tokenManager.verifyToken(), counselCtrl.getPatientObject, counselCtrl.getDoctorObject, getNoMid.getNo(3), counselCtrl.insertCommentScore);


  //patient_Info
  app.get('/patient/getPatientDetail', tokenManager.verifyToken(), patientCtrl.getPatientDetail);
  app.get('/patient/getMyDoctors', tokenManager.verifyToken(), patientCtrl.getMyDoctor);
  app.post('/patient/insertDiagnosis', tokenManager.verifyToken(), patientCtrl.getDoctorObject, patientCtrl.insertDiagnosis, patientCtrl.editPatientDetail);
  app.get('/patient/getDoctorLists', tokenManager.verifyToken(), patientCtrl.getDoctorLists);
  app.post('/patient/newPatientDetail', tokenManager.verifyToken(), patientCtrl.checkPatientId, patientCtrl.newPatientDetail);
  app.post('/patient/editPatientDetail', tokenManager.verifyToken(), patientCtrl.editPatientDetail);
  app.get('/patient/getCounselRecords', tokenManager.verifyToken(), patientCtrl.getPatientObject, patientCtrl.getCounselRecords);
  // app.post('/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);
  // app.post('/patient/bindingMyDoctor', patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient);

  app.post('/patient/bindingMyDoctor', tokenManager.verifyToken(), patientCtrl.debindingDoctor, patientCtrl.bindingMyDoctor, patientCtrl.bindingPatient, wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  app.post('/patient/changeVIP', tokenManager.verifyToken(), patientCtrl.changeVIP);

  //comment_query
  app.get('/comment/getComments', tokenManager.verifyToken(), doctorCtrl.getDoctorObject, commentCtrl.getCommentsByDoc);
  app.get('/comment/getCommentsByC', tokenManager.verifyToken(), commentCtrl.getCommentsByCounselId);
  //vitalSign_query
  app.get('/vitalSign/getVitalSigns', tokenManager.verifyToken(), patientCtrl.getPatientObject, vitalSignCtrl.getVitalSigns);
  app.post('/vitalSign/insertVitalSign', tokenManager.verifyToken(), vitalSignCtrl.getPatientObject, vitalSignCtrl.getVitalSign, vitalSignCtrl.insertData);

  //account_Info
  //需要和user表连接
  //无法输出expenseRecords数据，暂时无法解决问题
  app.get('/account/getAccountInfo', tokenManager.verifyToken(), accountCtrl.getAccountInfo);
  app.get('/account/getCounts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts);
  app.post('/account/modifyCounts', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.checkDoctor, accountCtrl.getCounts, accountCtrl.modifyCounts);
  // app.post('/account/rechargeDoctor', accountCtrl.rechargeDoctor);
  app.post('/account/updateFreeTime', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.updateFreeTime);
  app.get('/account/getCountsRespective', tokenManager.verifyToken(), accountCtrl.checkPatient, accountCtrl.getCountsRespective);
  
  app.post('/expense/rechargeDoctor', tokenManager.verifyToken(), accountCtrl.checkPatient, doctorCtrl.checkDoctor, expenseCtrl.rechargeDoctor);
  app.get('/expense/getDocRecords', tokenManager.verifyToken(), doctorCtrl.checkDoctor, expenseCtrl.getDocRecords);

  //message
  app.get('/message/getMessages', tokenManager.verifyToken(), messageCtrl.getMessages);
  app.post('/message/changeMessageStatus', tokenManager.verifyToken(), messageCtrl.changeMessageStatus);
  app.post('/message/insertMessage', tokenManager.verifyToken(), getNoMid.getNo(6), messageCtrl.insertMessage);

  //new
  app.get('/new/getNews', tokenManager.verifyToken(), newsCtrl.getNews);
  app.get('/new/getNewsByReadOrNot', tokenManager.verifyToken(), newsCtrl.getNewsByReadOrNot);
  app.post('/new/insertNews', tokenManager.verifyToken(), newsCtrl.insertNews);
  app.post('/new/insertTeamNews', tokenManager.verifyToken(), newsCtrl.insertTeamNews);
  
  //communication
  app.get('/communication/getCounselReport', tokenManager.verifyToken(), communicationCtrl.getCounselReport);
  app.post('/communication/insertMember', tokenManager.verifyToken(), communicationCtrl.insertMember, communicationCtrl.updateNumber);
  app.post('/communication/removeMember', tokenManager.verifyToken(), communicationCtrl.removeMember, communicationCtrl.updateNumber);
  // app.post('/communication/newTeam', getNoMid.getNo(4), communicationCtrl.newTeam);
  app.post('/communication/newTeam', tokenManager.verifyToken(), communicationCtrl.newTeam);
  app.post('/communication/deleteTeam', tokenManager.verifyToken(), communicationCtrl.deleteTeam);
  app.get('/communication/getTeam', tokenManager.verifyToken(), communicationCtrl.getTeam);
  // app.post('/communication/newConsultation', getNoMid.getNo(5), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post('/communication/newConsultation', tokenManager.verifyToken(), communicationCtrl.checkTeam, communicationCtrl.checkCounsel, communicationCtrl.checkPatient, communicationCtrl.checkDoctor, communicationCtrl.newConsultation);
  app.post('/communication/conclusion', tokenManager.verifyToken(), communicationCtrl.conclusion);
  app.post('/communication/updateLastTalkTime', tokenManager.verifyToken(), communicationCtrl.getDoctor1Object, communicationCtrl.getDoctor2Object, communicationCtrl.removeDoctor, communicationCtrl.removeDoctor2, communicationCtrl.updateLastTalkTime2, communicationCtrl.updateLastTalkTime);
  //app.get('/communication/getMessages');
  app.get('/communication/getConsultation', tokenManager.verifyToken(), communicationCtrl.getConsultation);
  app.post('/communication/postCommunication', tokenManager.verifyToken(), getNoMid.getNo(8),communicationCtrl.postCommunication);
  app.get('/communication/getCommunication', tokenManager.verifyToken(), communicationCtrl.getCommunication);

  //task
  app.post('/tasks/insertTaskModel', tokenManager.verifyToken(), taskCtrl.removeOldTask, taskCtrl.getTaskModel, taskCtrl.insertTaskModel);
  app.get('/tasks/getUserTask', tokenManager.verifyToken(), taskCtrl.getUserTask);
  app.post('/tasks/updateUserTask', tokenManager.verifyToken(), taskCtrl.getContent, taskCtrl.removeContent, taskCtrl.updateContent);

  //compliance
  app.post('/compliance/update', tokenManager.verifyToken(), complianceCtrl.getCompliance, complianceCtrl.updateCompliance);

  //insurance
  app.post('/insurance/updateInsuranceMsg', tokenManager.verifyToken(), insuranceCtrl.updateInsuranceMsg, insuranceCtrl.updateMsgCount, getNoMid.getNo(6), messageCtrl.insertMessage);
  app.get('/insurance/getInsMsg', tokenManager.verifyToken(), insuranceCtrl.getInsMsg);
  app.get('/insurance/setPrefer', tokenManager.verifyToken(), insuranceCtrl.setPrefer);
  app.get('/insurance/getPrefer', tokenManager.verifyToken(), insuranceCtrl.getPrefer);

  //advice
  app.post('/advice/postAdvice', tokenManager.verifyToken(), adviceCtrl.postAdvice);
  app.get('/advice/getAdvice', tokenManager.verifyToken(), adviceCtrl.getAdvice);

  //labtestResult
  app.post('/labtestResult/post', tokenManager.verifyToken(), labtestResultCtrl.postLabtestResult);
  app.post('/labtestResult/update', tokenManager.verifyToken(), labtestResultCtrl.updateLabtestResult);
  app.post('/labtestResult/delete', tokenManager.verifyToken(), labtestResultCtrl.deleteLabtestResult);
  
  //user
  app.get('/user/getPhoneNoByRole', tokenManager.verifyToken(), userCtrl.getPhoneNoByRole);

  // order
  // app.post('/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  app.post('/order/updateOrder', tokenManager.verifyToken(), orderCtrl.updateOrder);
  app.get('/order/getOrder',  tokenManager.verifyToken(), orderCtrl.getOrder);


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
  app.post('/wechat/addOrder', tokenManager.verifyToken(), getNoMid.getNo(7), orderCtrl.insertOrder, wechatCtrl.chooseAppId, wechatCtrl.addOrder,wechatCtrl.getPaySign);
 
  // app.post('/order/insertOrder', getNoMid.getNo(7), orderCtrl.insertOrder);
  // 订单支付结果回调 
  app.post('/wechat/payResult', wechatCtrl.payResult);
  // 查询订单   orderNo 
  app.get('/wechat/getWechatOrder', tokenManager.verifyToken(), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.getWechatOrder);
  // 关闭订单   orderNo 
  app.get('/wechat/closeWechatOrder', tokenManager.verifyToken(), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.closeWechatOrder);


  // app.post('/wechat/notif',wechatCtrl.register);
  // 消息模板
  app.post('/wechat/messageTemplate', tokenManager.verifyToken(), wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.messageTemplate);
  // 下载
  app.get('/wechat/download', tokenManager.verifyToken(), wechatCtrl.chooseAppId,Wechat.baseTokenManager("access_token"), wechatCtrl.download);
  // 创建永久二维码
  app.post('/wechat/createTDCticket', tokenManager.verifyToken(), wechatCtrl.chooseAppId, Wechat.baseTokenManager("access_token"), wechatCtrl.createTDCticket, userCtrl.setTDCticket);

  // 接收微信服务器的post请求
  app.post('/wechat', wechatCtrl.receiveTextMessage);
  // 接收微信服务器的get请求
  app.get('/wechat', wechatCtrl.getServerSignature);

  // jpush
  app.post('/jm/users', tokenManager.verifyToken(), jpushCtrl.register);
  app.post('/jm/groups', tokenManager.verifyToken(), jpushCtrl.createGroup);
  app.post('/jm/groups/members', tokenManager.verifyToken(), jpushCtrl.updateGroup);

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
};

