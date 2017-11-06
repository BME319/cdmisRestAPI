
var mongoose = require('mongoose')

var msgTemplateSchema = new mongoose.Schema({
  userId: String,
  time: Date,
  templateId: String,
  errcode: Number,
  errmsg: String
})

var MsgTemplateModel = mongoose.model('msgTemplate', msgTemplateSchema)

function MsgTemplate (msgTemplate) {
  this.msgTemplate = msgTemplate
}

MsgTemplate.prototype.save = function (callback) {
  var msgTemplate = this.msgTemplate
  var newMsgTemplate = new MsgTemplateModel(msgTemplate)
  newMsgTemplate.save(function (err, item) {
    if (err) {
      return callback(err)
    }
    callback(null, item)
  })
}

module.exports = MsgTemplate
