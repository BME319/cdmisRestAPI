var mongoose = require('mongoose')

var policySchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  followUps: [
    {
      _id: 0,
      agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      time: Date,
      type: {type: Number, enum: [0, 1, 2]}, // 2，专员更换；1，沟通记录；0，新建跟踪
      content: String,
      photos: [String]
    }
  ],
  currentAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  agents: [
    {
      agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      startTime: Date,
      endTime: Date
    }
  ],
  content: String,
  photos: [String],
  supervisor: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, // 审核保单的保险主管
  status: {type: Number, default: 0, enum: [0, 1, 2, 3]}, // 0，仅有意向；1，保单待审核；2，保单已审核；3，保单过期
  startTime: Date,
  endTime: Date
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
