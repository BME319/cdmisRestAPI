var version = '/api/gather'

// controllers
var alluserCtrl = require('../controllers_to_gather/alluser_controller')
var counselCtrl = require('../controllers_to_gather/counsel_controller')
var serviceCtrl = require('../controllers_to_gather/service_controller')
var forumCtrl = require('../controllers_to_gather/forum_controller')
var healthInfoCtrl = require('../controllers_to_gather/healthInfo_controller')
var labtestCtrl = require('../controllers_to_gather/labtestImport_controller')
var vitalSignCtrl = require('../controllers_to_gather/vitalSign_controller')

module.exports = function (app, webEntry, acl) {
  // YQC
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
}
