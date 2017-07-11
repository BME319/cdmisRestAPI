
var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  openId: {type: String, unique: true, sparse: true},	// UnionId
  phoneNo: String,
  password: String,
  agreement: String,
  photoUrl: String,
  role: [String],
  loginStatus: Number,
  lastLogin: Date,
  TDCticket: String,
  TDCurl: String,
  invalidFlag: Number,
  MessageOpenId: {
    doctorWechat: String,
    patientWechat: String,
    doctorApp: String,
    patientApp: String,
    test: String
  },
  jpush: {
    registrationID: String,
    alias: String,
    tags: [String]
  },
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

userModel = mongoose.model('user', userSchema)

function User (user) {
  this.user = user
}

User.prototype.save = function (callback) {
  var user = this.user
  var newUser = new userModel(user)
  newUser.save(function (err, userItem) {
    if (err) {
      return callback(err)
    }
    callback(null, userItem)
  })
}

User.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  userModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, userInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, userInfo)
})
}

User.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  userModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, users) {
  if (err) {
    return callback(err)
  }
  callback(null, users)
})
}

User.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  userModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upuser) {
  if (err) {
    return callback(err)
  }
  callback(null, upuser)
})
}

module.exports = User
