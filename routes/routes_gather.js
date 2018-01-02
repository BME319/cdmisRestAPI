var version = '/api/gather'

// controllers
var alluserCtrl = require('../controllers_to_gather/alluser_controller')
var counselCtrl = require('../controllers_to_gather/counsel_controller')
var serviceCtrl = require('../controllers_to_gather/service_controller')

module.exports = function (app, webEntry, acl) {
  // app.post(version + '/alluser/updateAlluser', alluserCtrl.updateAlluser(acl))
  app.post(version + '/counsel/questionnaire', counselCtrl.saveQuestionnaire)
  app.post(version + '/counsel/commentScore', counselCtrl.insertCommentScore)
  app.post(version + '/patient/doctorInCharge', serviceCtrl.addDIC)
  app.post(version + '/patient/cancelDoctorInCharge', serviceCtrl.cancelDIC)
  app.post(version + '/patient/favoriteDoctor', serviceCtrl.favoriteDoctor)
  app.post(version + '/patient/unfollowFavoriteDoctor', serviceCtrl.unfollowFavoriteDoctor)
}
