
var mongoose = require('mongoose')

var newsSchema = new mongoose.Schema({
  messageId: String,
  userId: String,
  userRole: String,
  sendBy: String,
  // sendReadOrNot: Number,
  readOrNot: {type: Number, enum: [0, 1]}, // 0未读，1已读
  // 支付1，警报2，任务3，患者保险消息5, 患者退款消息6, 医生提醒更新主管患者任务9, 群体教育消息8, 审核消息7
  type: {type: Number, enum: [1, 2, 3, 5, 6, 7, 8, 9]},
  caseType: Number,
  time: Date,
  title: String,
  description: String,
  url: String
})

var newsModel = mongoose.model('news', newsSchema)

function News (news) {
  this.news = news
}

News.prototype.save = function (callback) {
  var news = this.news
  var newNews = new newsModel(news)
  newNews.save(function (err, newItem) {
    if (err) {
      return callback(err)
    }
    callback(null, newItem)
  })
}

News.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  newsModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, newsInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, newsInfo)
  })
}

News.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  newsModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, news) {
    if (err) {
      return callback(err)
    }
    callback(null, news)
  })
}

News.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  newsModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, upnews) {
    if (err) {
      return callback(err)
    }
    callback(null, upnews)
  })
}

News.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  newsModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upnews) {
      if (err) {
        return callback(err)
      }
      callback(null, upnews)
    })
}

News.bulkWrite = function (ops, callback, opt) {
  var options = opt || {}
  newsModel.bulkWrite(ops, options, function (err, newsInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, newsInfo)
  })
}

module.exports = News
