var mongoose = require('mongoose')

var policySchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  followUps: [ // 跟踪历史记录
    {
      _id: 0,
      agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      time: Date,
      type: {type: Number, enum: [0, 1, 2, 3]}, // 2，专员更换；1，沟通记录；0，新建跟踪；3，保单相关
      content: String,
      photos: [String]
    }
  ],
  currentAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, // 当前保险专员
  // agents: [ // 保险专员历史记录
  //   {
  //     agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  //     startTime: Date,
  //     endTime: Date
  //   }
  // ],
  content: String, // 保单文字内容
  photos: [String], // 保单图片
  supervisor: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, // 审核保单的保险主管
  status: {type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5]}, // 0，有意向无专员；1，有意向有专员；2，保单待审核；3，保单审核通过；4，保单审核未通过；5，保单过期
  time: Date, // 保单录入时间
  startTime: Date, // 保单起始时间
  endTime: Date // 保单失效时间
})

var PolicyModel = mongoose.model('policy', policySchema)

function Policy (policy) {
  this.policy = policy
}

Policy.prototype.save = function (callback) {
  var policy = this.policy
  var newPolicy = new PolicyModel(policy)
  newPolicy.save(function (err, policyItem) {
    if (err) {
      return callback(err)
    }
    callback(null, policyItem)
  })
}

Policy.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  PolicyModel
  .findOne(query, _fields, options)
  .populate(_populate)
  .exec(function (err, policyInfo) {
    if (err) {
      return callback(err)
    }
    callback(null, policyInfo)
  })
}

Policy.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''
  PolicyModel
  .find(query, _fields, options)
  .populate(_populate)
  .exec(function (err, policies) {
    if (err) {
      return callback(err)
    }
    callback(null, policies)
  })
}

Policy.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  PolicyModel
  .findOneAndUpdate(query, obj, options)
  .populate(_populate)
  .exec(function (err, uppolicy) {
    if (err) {
      return callback(err)
    }
    callback(null, uppolicy)
  })
}

Policy.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  PolicyModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, uppolicy) {
      if (err) {
        return callback(err)
      }
      callback(null, uppolicy)
    })
}

module.exports = Policy
