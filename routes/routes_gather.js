var version = '/api/gather'

// middlewares
var getNoMid = require('../middlewares/getNoMid')

// controllers
var counselCtrl = require('../controllers_to_gather/counsel_controller')

module.exports = function (app, webEntry, acl) {
  app.post(version + '/counsel/commentScore', getNoMid.getNo(3), counselCtrl.insertCommentScore)
}
