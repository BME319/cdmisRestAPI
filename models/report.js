
var mongoose = require('mongoose')

var reportSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'}, // alluser._id
  userId: String,
  type: {       // 报表类型：周报，月报，季报，年报 week month season year
    type: String,
    enum: ['week', 'month', 'season', 'year']
  },
  time: String, // 报表时间： 周，2017年1月第2周：201701_2；月，2017年1月：201701；季，2017年第1季：2017_1;年，2017年：2017
  itemType: {   // 血压，体重，尿量，体温，(血糖，用药)，心率，(血管通路)，腹透，(浮肿)，化验，医生报告
    type: String,
    enum: ['BloodPressure', 'Weight', 'Vol', 'Temperature', 'HeartRate', 'PeritonealDialysis', 'LabTest', 'DoctorReport']
  },
  recordDays: Number, // 记录天数
  recordTimes: Number, // 记录次数
  standardTimes: Number, // 达标次数  季年报
  notStandardTimes: Number, // 未达标次数 季年报
  average1: Number, // 平均值1
  max1: Number, // 最大值1
  min1: Number, // 最小值1
  average2: Number, // 平均值2
  max2: Number, // 最大值2
  min2: Number, // 最小值2
  outOfRangeTimes1: Number, // 超出范围次数1
  outOfRangeTime1: [Date], // 超出范围时间1
  outOfRangeTimes2: Number, // 超出范围次数2
  outOfRangeTime2: [Date], // 超出范围时间2
  outOfRangeMonth: [], // 超出范围月份
  recommendValue1: Number, // 建议值1
  recommendValue2: Number, // 建议值2
  recommendValue3: Number, // 建议值3
  recommendValue4: Number, // 建议值4
  recommendValue11: Number, // 建议值11
  recommendValue12: Number, // 建议值12
  recommendValue13: Number, // 建议值13
  recommendValue14: Number, // 建议值14
  averageBMI: Number, // 平均BMI
  changeRatio: Number, // 增比 %
  changeRatioBMI: Number, // BMI增比 %
  drugRegimen: String, // 用药方案
  drugConcentration: Number, // 药物浓度
  data1: [], // 历史数据记录1
  data2: [], // 历史数据记录2
  data3: [],
  data4: [],
  data5: [],
  recordTime: [Date], // 历史数据记录时间
  recordTime2: [Date],
  recordTime3: [Date],
  recordTime4: [Date],
  recordTime5: [Date],
  // bestControlMonth: Number, // 控制最佳月份 季年报
  // worstControlMonth: Number, // 控制最差月份 季年报
  // mostCompleteRecordMonth: Number, // 记录最完整月份 季年报
  // worstCompleteRecordMonth: Number, // 记录最差月份 季年报
  doctorReport: [   // 医生报告
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      content: String,
      insertTime: Date
    }
  ],
  doctorComment: [   // 医生点评
    {
      _id: 0,
      doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'alluser'},
      content: String,
      insertTime: Date
    }
  ]
  // labTest: String, // 化验_周报月报文本
  // labTestArray: [], // 化验_季报年报检查项目数组
  // labTestNewItem: String // 化验_建议新增项目
})

var ReportModel = mongoose.model('report', reportSchema)

function Report (report) {
  this.report = report
}

Report.prototype.save = function (callback) {
  var report = this.report
  var newReport = new ReportModel(report)
  newReport.save(function (err, reportItem) {
    if (err) {
      return callback(err)
    }
    callback(null, reportItem)
  })
}

Report.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ReportModel
    .findOne(query, _fields, options)
    .populate(_populate)
    .exec(function (err, reportInfo) {
      if (err) {
        return callback(err)
      }
      callback(null, reportInfo)
    })
}

Report.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var _fields = fields || null
  var _populate = populate || ''

  ReportModel
    .find(query, _fields, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

Report.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ReportModel
    .findOneAndUpdate(query, obj, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

Report.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var _populate = populate || ''

  ReportModel
    .update(query, obj, options)
    .populate(_populate)
    .exec(function (err, upreport) {
      if (err) {
        return callback(err)
      }
      callback(null, upreport)
    })
}

module.exports = Report
