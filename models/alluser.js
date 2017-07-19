
var mongoose = require('mongoose')

var alluserSchema = new mongoose.Schema({
  userId: {type: String, unique: true},
  name: String,
  birthday: Date,
  gender: Number,
  IDNo: String,
  openId: {type: String, unique: true, sparse: true}, // UnionId
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

  // doctor_info
  certificatePhotoUrl: String, // 资格证书地址
  practisingPhotoUrl: String, // 执业证书地址
  aliPayAccount: {
    type: String,
    match: /(^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,51}[a-z0-9]+$)|(^1[3458]\d{9}$)/
  },
  province: String,
  city: String,
  district: String,
  workUnit: String,
  title: String,
  job: String,
  department: String,
  major: String,
  description: String,
  score: Number,
  // 1: 咨询 2: 问诊 3: 加急咨询 4: 主管医生 5: 面诊服务
  // 状态： 默认1   1为开启，0为关闭
  counselStatus1: {type: Number, default: 1},
  counselStatus2: {type: Number, default: 1},
  counselStatus3: {type: Number, default: 1},
  counselStatus4: {type: Number, default: 1},
  counselStatus5: {type: Number, default: 1},
  serviceSchedules: [
    {
      _id: 0,
      day: String,
      time: String,
      // 已用的面诊计数，可用的面诊计数需要用total-count
      count: Number,
      // 医生可以设置的面诊计数总数
      total: Number
    }
  ],
  serviceSuspendTime: [
    {
      _id: 0,
      start: Date,
      end: Date
    }
  ],
  charge1: {type: Number, default: 30},
  charge2: {type: Number, default: 50},
  charge3: {type: Number},
  charge4: {type: Number},
  charge5: {type: Number},
  count1: {type: Number, default: 0},
  count2: {type: Number, default: 0},
  // 是否自动转发及转发目标 0不自动转发，1自动转发
  autoRelay: {type: Number, default: 0},
  relayTarget: [
    {
      _id: 0,
      teamId: String
    }
  ],
  teams: [String],
  schedules: [
    {
      _id: 0,
      day: String,
      time: String
    }
  ],
  suspendTime: [
    {
      _id: 0,
      start: Date,
      end: Date
    }
  ],
  // 状态定义：0未审核，1审核通过，2审核拒绝
  reviewStatus: {type: Number, default: 0},
  reviewDate: Date,
  adminId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  reviewContent: String,

  // patient_info
  height: String,
  weight: String,
  occupation: String,
  bloodType: Number,
  address: {
    nation: String,
    province: String,
    city: String
  },
  class: String,
  class_info: [String],
  operationTime: Date,
  VIP: {type: Number, default: 0},
  hypertension: Number,
  allergic: String,
  // 关注医生字段
  doctors: [
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      firstTime: Date,
      invalidFlag: Number
    }
  ],
  // 主管医生字段
  doctorsInCharge: [
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      firstTime: Date,
      // 历史2、当前1、待审核0，被拒3
      invalidFlag: Number,
      rejectReason: String,
      // 时长数字类型以秒为单位
      length: Number,
      // 有效的起止时间
      start: Date,
      end: Date
    }
  ],
  diagnosisInfo: [
    {
      _id: 0,
      name: String,
      time: Date,
      hypertension: Number,
      progress: String,
      operationTime: Date,
      content: String,
      doctor: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}
    }
  ],
  lastVisit: {
    time: Date,
    hospital: String,
    diagnosis: String
  },
  // 健康专员录入时需要的字段，属于patient信息
  // 化验结果是否录入，0未录入，1已录入
  labtestImportStatus: {type: Number},
  // 未录入相关
  // 最早的上传图片的时间
  earliestUploadTime: {type: Date},
  // 已录入相关
  // 最近一次的录入人
  latestImportUserId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  // 最近一次录入日期
  latestImportDate: Date,
  // 图片上传日期
  latestUploadTime: Date,

  workAmounts: Number, // 工作量
  boardingTime: Date, // 入职时间
  creationTime: Date// 创建时间

})

var alluserModel = mongoose.model('alluser', alluserSchema)

function Alluser (alluser) {
  this.alluser = alluser
}

Alluser.prototype.save = function (callback) {
  var alluser = this.alluser
  var newAlluser = new alluserModel(alluser)
  newAlluser.save(function (err, alluserItem) {
    if (err) {
      return callback(err)
    }
    callback(null, alluserItem)
  })
}

Alluser.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}

  var _fields = fields || null
  var _populate = populate || ''

  alluserModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, alluserInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, alluserInfo)
    })
}

Alluser.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}

  var _fields = fields || null
  var _populate = populate || ''
  alluserModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, allusers) {
      if (err) {
        return callback(err)
      }
      callback(null, allusers)
    })
}

Alluser.countSome = function (query, callback) {
  alluserModel
    .count(query)
    .exec(function (err, allusers) {
      if (err) {
        return callback(err)
      }
      callback(null, allusers)
    })
}
 
Alluser.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  alluserModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upalluser) {
      if (err) {
        return callback(err)
      }
      callback(null, upalluser)
    })
}

Alluser.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  alluserModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upalluser) {
      if (err) {
        return callback(err)
      }
      callback(null, upalluser)
    })
}

module.exports = Alluser
