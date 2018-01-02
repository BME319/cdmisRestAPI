var DoctorsInCharge = require('../models/doctorsInCharge')
var DpRelation = require('../models/dpRelation')
var Order = require('../models/order')
var async = require('async')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var Alluser = require('../models/alluser')

exports.addDIC = function (req, res) {
  let patientPhoneNo = req.body.phoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let startTime = req.body.startTime || null
  let stopTime = req.body.stopTime || null
  if (patientPhoneNo === null || doctorPhoneNo  === null || startTime  === null || stopTime  === null) {
    return res.json({msg: '请检查输入,phoneNo/doctorPhoneNo/startTime/stopTime', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(patientPhoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    getDoctor: function (callback) {
      dataGatherFunc.userIDbyPhone(doctorPhoneNo, 'doctor', function (err, item) {
        return callback(err, item)
      })
    },
    DIC: ['getPatient', 'getDoctor', function (results, callback) {
      if (results.getPatient.status === 0 && results.getDoctor.status === 0) {
        let doctorObjectId = results.getDoctor._id
        let patientObjectId = results.getPatient._id
        async.auto({
          addPIC: function (callback) {
            let query = {doctorId: doctorObjectId}
            let upObj = {
              $push: {
                patientsInCharge: {
                  patientId: patientObjectId,
                  start: new Date(startTime),
                  end: new Date(stopTime),
                  invalidFlag: 1
                }
              }
            }
            DpRelation.updateOne(query, upObj, function (err, upRelation1) {
              callback(err)
            })
          },
          addDIC: function (callback) {
            let doctorInCharge = {
              patientId: patientObjectId,
              doctorId: doctorObjectId,
              start: new Date(startTime),
              end: new Date(stopTime),
              invalidFlag: 1
            }
            let newDoctorInCharge = new DoctorsInCharge(doctorInCharge)
            newDoctorInCharge.save(function (err, doctorInChargeInfo) {
              callback(err)
            })
          },
          alluserDIC: function (callback) {
            let queryP = {_id: patientObjectId}
            let upObjP = {$set: {doctorInCharge: doctorObjectId}}
            Alluser.updateOne(queryP, upObjP, function (err, upP) {
              callback(err)
            })
          }
        }, function (err, results) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'patient/doctorInCharge接收成功'})
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else if (results.getDoctor.status === -1) {
        callback(null, {status: 1, msg: '用户（医生）不存在，请检查doctorPhoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['DIC', function (results, callback) {
      let params = req.body
      let outputs = results.DIC
      dataGatherFunc.traceRecord(req.body.phoneNo, 'patient/doctorInCharge', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.DIC)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.cancelDIC = function (req, res) {
  let patientPhoneNo = req.body.phoneNo || null
  if (patientPhoneNo === null) {
    return res.json({msg: '请检查输入,phoneNo', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(patientPhoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    cancelDIC: ['getPatient', function (results, callback) {
      if (results.getPatient.status === 0) {
        let patientObjectId = results.getPatient._id
        async.auto({
          cancelDIC: function (callback) {
            let query = {patientId: patientObjectId, invalidFlag: 1}
            let upObj = {$set: {invalidFlag: 2}}
            DoctorsInCharge.updateOne(query, upObj, function (err, upDIC) {
              callback(err, upDIC.doctorId)
            })
          },
          cancelPIC: ['cancelDIC', function (resultsIn, callback) {
            let queryR = {doctorId: resultsIn.cancelDIC, patientsInCharge: {$elemMatch: {$and: [{patientId: patientObjectId}, {invalidFlag: 1}]}}}
            let upObj = {
              $set: {
                'patientsInCharge.$.invalidFlag': 2
              }
            }
            DpRelation.updateOne(queryR, upObj, function (err, upRelation1) {
              callback(err)
            })
          }],
          cancelAlluserDIC: function (callback) {
            let queryP = {_id: patientObjectId}
            let upObjP = {$unset: {doctorInCharge: 1}}
            Alluser.updateOne(queryP, upObjP, function (err, upP) {
              callback(err)
            })
          }
        }, function (err, results) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'patient/cancelDoctorInCharge接收成功'})
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误,接收失败'})
      }
    }],
    traceRecord: ['cancelDIC', function (results, callback) {
      let params = req.body
      let outputs = results.cancelDIC
      dataGatherFunc.traceRecord(req.body.phoneNo, 'patient/cancelDoctorInCharge', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.cancelDIC)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.favoriteDoctor = function (req, res) {
  let patientPhoneNo = req.body.patientPhoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let Time = req.body.Time || null
  if (patientPhoneNo === null || doctorPhoneNo  === null || Time  === null) {
    return res.json({msg: '请检查输入,patientPhoneNo/doctorPhoneNo/Time', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(patientPhoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    getDoctor: function (callback) {
      dataGatherFunc.userIDbyPhone(doctorPhoneNo, 'doctor', function (err, item) {
        return callback(err, item)
      })
    },
    FD: ['getPatient', 'getDoctor', function (results, callback) {
      if (results.getPatient.status === 0 && results.getDoctor.status === 0) {
        let doctorObjectId = results.getDoctor._id
        let patientObjectId = results.getPatient._id
        async.auto({
          addFP: function (callback) {
            let query = {doctorId: doctorObjectId}
            let upObj = {
              $push: {
                patients: {
                  patientId: patientObjectId,
                  dpRelationTime: new Date(Time)
                }
              }
            }
            DpRelation.updateOne(query, upObj, function (err, upRelation1) {
              callback(err)
            })
          },
          addFD: function (callback) {
            let query = {_id: patientObjectId}
            let upObj = {
              $push: {
                doctors: {
                  doctorId: doctorObjectId,
                  firstTime: new Date(Time)
                }
              }
            }
            Alluser.updateOne(query, upObj, function (err, upPatient) {
              callback(err)
            })
          }
        }, function (err, results) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'patient/favoriteDoctor接收成功'})
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else if (results.getDoctor.status === -1) {
        callback(null, {status: 1, msg: '用户（医生）不存在，请检查doctorPhoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['FD', function (results, callback) {
      let params = req.body
      let outputs = results.FD
      dataGatherFunc.traceRecord(req.body.patientPhoneNo, 'patient/favoriteDoctor', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.FD)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.unfollowFavoriteDoctor = function (req, res) {
  let patientPhoneNo = req.body.patientPhoneNo || null
  let doctorPhoneNo = req.body.doctorPhoneNo || null
  let Time = req.body.Time || null
  if (patientPhoneNo === null || doctorPhoneNo  === null || Time  === null) {
    return res.json({msg: '请检查输入,patientPhoneNo/doctorPhoneNo/Time', status: 1})
  }
  async.auto({
    getPatient: function (callback) {
      dataGatherFunc.userIDbyPhone(patientPhoneNo, 'patient', function (err, item) {
        return callback(err, item)
      })
    },
    getDoctor: function (callback) {
      dataGatherFunc.userIDbyPhone(doctorPhoneNo, 'doctor', function (err, item) {
        return callback(err, item)
      })
    },
    FD: ['getPatient', 'getDoctor', function (results, callback) {
      if (results.getPatient.status === 0 && results.getDoctor.status === 0) {
        let doctorObjectId = results.getDoctor._id
        let patientObjectId = results.getPatient._id
        async.auto({
          deleteFP: function (callback) {
            let query = {doctorId: doctorObjectId}
            let upObj = {
              $pull: {
                patients: {
                  patientId: patientObjectId,
                  dpRelationTime: new Date(Time)
                }
              }
            }
            DpRelation.updateOne(query, upObj, function (err, upRelation1) {
              callback(err)
            })
          },
          deleteFD: function (callback) {
            let query = {_id: patientObjectId}
            let upObj = {
              $pull: {
                doctors: {
                  doctorId: doctorObjectId,
                  firstTime: new Date(Time)
                }
              }
            }
            Alluser.updateOne(query, upObj, function (err, upPatient) {
              callback(err)
            })
          }
        }, function (err, results) {
          if (err) {
            callback(null, {status: 1, msg: err})
          } else {
            callback(null, {status: 0, msg: 'patient/unfollowFavoriteDoctor接收成功'})
          }
        })
      } else if (results.getPatient.status === -1) {
        callback(null, {status: 1, msg: '用户（患者）不存在，请检查phoneNo'})
      } else if (results.getDoctor.status === -1) {
        callback(null, {status: 1, msg: '用户（医生）不存在，请检查doctorPhoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['FD', function (results, callback) {
      let params = req.body
      let outputs = results.FD
      dataGatherFunc.traceRecord(req.body.patientPhoneNo, 'patient/unfollowFavoriteDoctor', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.FD)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}
