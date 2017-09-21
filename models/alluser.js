
var mongoose = require('mongoose')

var alluserSchema = new mongoose.Schema({
  userId: {type: String, unique: true},
  name: String,
  birthday: Date,
  gender: {type: Number, enum: [1, 2, 3, 4]}, // 1-male,2-female,3-others,4-unknown
  IDNo: String,
  openId: {type: String, unique: true, sparse: true}, // UnionId
  phoneNo: String,
  password: String,
  // agreement: String,  // 患者和医生签署协议状态分别储存, 0是已签，1是未签
  agreementPat: String,  // 患者
  agreementDoc: String,  // 医生
  photoUrl: String,
  role: [{type: String, enum: ['Leader', 'master', 'doctor', 'patient', 'nurse', 'insuranceA', 'insuranceR', 'insuranceC', 'health', 'admin', 'guest']}],
  loginStatus: {type: Number, enum: [0, 1]},
  lastLogin: Date,
  // TDCticket: String,  // 患者和医生的二维码分别存储
  // TDCurl: String,
  invalidFlag: {type: Number, enum: [0, 1]},
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
  docTDCticket: String,
  docTDCurl: String,
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
  // 状态： 默认0   1为开启，0为关闭
  counselStatus1: {type: Number, default: 0, enum: [0, 1]},
  counselStatus2: {type: Number, default: 0, enum: [0, 1]},
  counselStatus3: {type: Number, default: 0, enum: [0, 1]},
  counselStatus4: {type: Number, default: 0, enum: [0, 1]},
  counselStatus5: {type: Number, default: 0, enum: [0, 1]},
  // 医生设置的面诊排班（模板）（医生设置）
  serviceSchedules: [
    {
      _id: 0,
      day: {type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']},
      time: {type: String, enum: ['Morning', 'Afternoon']},
      total: Number, // 医生可以设置的某时段面诊总数
      place: String
    }
  ],
  // 周期更新医生可预约的的面诊时间（患者查看）
  availablePDs: [
    {
      _id: 0,
      availableDay: Date, // 可预约日期，数据存储为东八区当日零点
      availableTime: {type: String, enum: ['Morning', 'Afternoon']}, // 可预约时段
      total: Number, // 医生已设置的某时段面诊总数
      count: {type: Number, default: 0}, // 已被预约的面诊计数，可用的面诊计数需要用total-count
      suspendFlag: {type: Number, default: 0, enum: [0, 1]}, // 是否停诊
      place: String
    }
  ],
  serviceSuspendTime: [
    {
      _id: 0,
      start: Date, // 停诊起始日，数据存储为东八区当日零点
      end: Date // 停诊截止日，数据存储为东八区当日23:59:59
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
  autoRelay: {type: Number, default: 0, enum: [0, 1]},
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
      day: {type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']},
      time: {type: String, enum: ['Morning', 'Afternoon']},
      place: String
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
  reviewStatus: {type: Number, default: 0, enum: [0, 1, 2]},
  reviewDate: Date,
  adminId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  reviewContent: String,

  // patient_info
  patTDCticket: String,
  patTDCurl: String,
  height: String,
  weight: String,
  occupation: String,
  bloodType: {type: Number, enum: [1, 2, 3, 4, 5]}, // 1-A,2-B,3-O,4-AB,5-others
  address: {
    nation: String,
    province: String,
    city: String
  },
  // 1 肾移植，2 ckd1-2期，3 ckd3-4期，4 ckd5期未透析，5 血透，6 腹透
  class: {type: String, enum: ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6']},
  // 意义详见表dicttypetwos
  class_info: [{type: String, enum: ['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5', 'stage_6', 'stage_7', 'stage_8', 'stage_9', 'stage_10', 'stage_11']}],
  operationTime: Date,
  VIP: {type: Number, default: 0, enum: [0, 1]},
  VIPStartTime: Date,
  VIPEndTime: Date,
  // 入组相关
  group: {type: Number, default: 0, enum: [0, 1]},
  groupTime: Date,
  hypertension: Number,
  allergic: String,
  // 关注医生字段
  doctors: [
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      firstTime: Date,
      invalidFlag: {type: Number, default: 0, enum: [0, 1]}
    }
  ],
  // 主管医生字段 改用doctorsInCharge表
  // doctorsInCharge: [
  //   {
  //     // _id: 0,
  //     doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
  //     firstTime: Date,
  //     // 历史2、当前1、待审核0，被拒3
  //     invalidFlag: Number,
  //     rejectReason: String,
  //     // 时长数字类型以秒为单位
  //     length: Number,
  //     // 有效的起止时间
  //     start: Date,
  //     end: Date
  //   }
  // ],
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
  labtestImportStatus: {type: Number, enum: [0, 1]},
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

Alluser.aggregate = function (array, callback) {
  let _array = array || []
  alluserModel
    .aggregate(_array)
    .exec(function (err, results) {
      if (err) {
        return callback(err)
      }
      // console.log(results)
      callback(null, results)
    })
}

module.exports = Alluser
