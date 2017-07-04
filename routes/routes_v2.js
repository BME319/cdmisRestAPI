

// global var
var version = '/api/v2';


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
var aclsettingCtrl = require('../controllers_v2/aclsetting_controller'),
    alluserCtrl = require('../controllers_v2/alluser_controller');


module.exports = function(app,webEntry, acl) {

 
  // app.get('/', function(req, res){
  //   res.send("Server Root");
  // });

  // csq 
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

  // wf
  app.get(version + '/alluser/userList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(0));
  app.get(version + '/alluser/doctorList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(1));
  app.get(version + '/alluser/patientList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(2));
  app.get(version + '/alluser/nurseList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(3));
  app.get(version + '/alluser/insuranceList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(4));
  app.get(version + '/alluser/healthList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(5));
  app.get(version + '/alluser/adminList',  tokenManager.verifyToken(), alluserCtrl.getAlluserList(6));
  app.post(version + '/alluser/alluser',  tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.updateAlluserList);
  
  app.post(version + '/alluser/register',  tokenManager.verifyToken(), alluserCtrl.registerTest(acl),getNoMid.getNo(1), alluserCtrl.register(acl));
  app.post(version + '/alluser/cancelUser',  tokenManager.verifyToken(), alluserCtrl.checkAlluser,alluserCtrl.cancelAlluser);
  app.post(version + '/alluser/unionid',  tokenManager.verifyToken(), alluserCtrl.setOpenId, alluserCtrl.checkBinding, alluserCtrl.setOpenIdRes);
  app.post(version + '/alluser/openId',  tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.setMessageOpenId);
  app.get(version + '/alluser/openId',  tokenManager.verifyToken(), alluserCtrl.checkAlluser, alluserCtrl.getMessageOpenId);
  app.post(version + '/alluser/reset',  tokenManager.verifyToken(), alluserCtrl.reset);
  app.post(version + '/alluser/login',  tokenManager.verifyToken(), alluserCtrl.openIdLoginTest,alluserCtrl.checkBinding,alluserCtrl.login);
  app.post(version + '/alluser/logout',   tokenManager.verifyToken(), alluserCtrl.logout);
  app.get(version + '/alluser/userID',   tokenManager.verifyToken(), alluserCtrl.getAlluserID);
  app.post(version + '/alluser/sms',   tokenManager.verifyToken(), alluserCtrl.sendSMS);
  app.get(version + '/alluser/sms',   tokenManager.verifyToken(), alluserCtrl.verifySMS);
  app.get(version + '/alluser/agreement',   tokenManager.verifyToken(), alluserCtrl.getAlluserAgreement);
  app.post(version + '/alluser/agreement',   tokenManager.verifyToken(), alluserCtrl.updateAlluserAgreement);

};

