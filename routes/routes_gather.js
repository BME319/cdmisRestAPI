var version = '/api/gather'

// controllers
var counselCtrl = require('../controllers_to_gather/counsel_controller')

module.exports = function (app, webEntry, acl) {
  app.post(version + '/counsel/commentScore', counselCtrl.insertCommentScore)
}
