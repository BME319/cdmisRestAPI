var version = '/api/gather'

// controllers
var counselCtrl = require('../controllers_to_gather/counsel_controller')
var forumCtrl = require('../controllers_to_gather/forum_controller')
var healthInfoCtrl = require('../controllers_to_gather/healthInfo_controller')
var labtestCtrl = require('../controllers_to_gather/labtestImport_controller')
var vitalSignCtrl = require('../controllers_to_gather/vitalSign_controller')

module.exports = function (app, webEntry, acl) {
  app.post(version + '/counsel/commentScore', counselCtrl.insertCommentScore)

  //JYF
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
