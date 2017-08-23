
var Account = require('../models/account')
// var Patient = require('../models/patient')
// var Doctor = require('../models/doctor')
var Alluser = require('../models/alluser')

// 根据doctorId查询相关评价 2017-03-30 GY
// 查询账户信息与消费及充值记录
exports.getAccountInfo = function (req, res) {
  // if (req.query.userId === null || req.query.userId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写userId!'})
  // }
  // 查询条件
  // var _userId = req.query.userId
  var _userId = req.session.userId
  var query = {userId: _userId}

  // 设置参数
  // var opts = '';
  // var fields = {'_id':0};
  // var fields = '';
  // var populate = {path: 'patientId', select:{'_id':0, 'userId':1, 'name':1}};
  // var populate = '';

  Account.getSome(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

// 通用方法：判断patientId和doctorId是否可用 2017-04-20 GY
exports.checkPatient = function (req, res, next) {
  // if (req.query.patientId === null || req.query.patientId === '' || req.query.patientId === undefined) {
  //   if (req.body.patientId === null || req.body.patientId === '' || req.body.patientId === undefined) {
  if (req.session.userId === null || req.session.userId === '' || req.session.userId === undefined) {
    return res.json({result: '请填写patientId!'})
  } else {
    // req.patientId = req.body.patientId
    req.patientId = req.session.userId
    req.role = req.session.role
    console.log(req.session)
  }
  // } else {
  //   req.patientId = req.query.patientId
  // }
  // 判断患者ID是否存在
  var query = {userId: req.patientId, role: req.role}
  // Patient.getOne(query, function (err, item) {
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({result: '不存在的患者ID'})
    } else {
      console.log('checkPatient successful!')
      next()
    }
  })
}
exports.checkDoctor = function (req, res, next) {
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
    // return res.json({result: '请填写doctorId!'});
    // 显示免费咨询次数和总咨询次数
      var queryPatient = {userId: req.patientId}
      Account.getOne(queryPatient, function (err, accountitem) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        // 无历史咨询信息，初始化
        if (accountitem === null) {
          var accountData = {
            userId: req.patientId,
            freeTimes: 3,
            money: 0
          }
          var newAccount = new Account(accountData)
          newAccount.save(function (err, accountInfo) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
          })
          return res.json({result: {freeTimes: 3, totalPaidTimes: 0}})
        } else {
          // 有历史咨询信息，times.length 表示历史咨询医生的个数，times[i].count表示对应每个医生的咨询次数
          var count = 0
          // 2017-08-10 debug
          let returnFreeTimes = accountitem.freeTimes || 0
          if (accountitem.times.constructor === Array && accountitem.times.length) {
            for (var i = accountitem.times.length - 1; i >= 0; i--) {
              count += accountitem.times[i].count
            }
          }
          // return res.json({result: {freeTimes: accountitem.freeTimes, totalCount: count}})
          return res.json({result: {freeTimes: returnFreeTimes, totalCount: count}})
        }
      })
    } else {
    // req.doctorId = req.body.doctorId
    // 判断医生ID是否存在
      req.doctorId = req.body.doctorId
      var query = {userId: req.doctorId, role: 'doctor'}
      // Doctor.getOne(query, function (err, item) {
      Alluser.getOne(query, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        } else if (item === null) {
          return res.json({result: '不存在的医生ID'})
        } else {
          next()
        }
      })
    }
  } else {
    req.doctorId = req.query.doctorId
    query = {userId: req.doctorId, role: 'doctor'}
    // Doctor.getOne(query, function (err, item) {
    Alluser.getOne(query, function (err, item) {
      if (err) {
        return res.status(500).send(err.errmsg)
      } else if (item === null) {
        return res.json({result: '不存在的医生ID'})
      } else {
        // console.log('checkDoctor')
        next()
      }
    })
  }
  // var query = {userId: req.doctorId};
  // Doctor.getOne(query, function(err, item) {
  //   if (err) {
  //     return res.status(500).send(err.errmsg);
  //   }
  //   else if (item === null) {
  //     return res.json({result: '不存在的医生ID'});
  //   }
  //   else {
  //     next();
  //   }
  // });
}

// //获取咨询计数 2017-04-20 GY
// exports.getCounts = function(req, res, next) {

//   var query = {
//     userId: req.patientId
//   };
//   if (req.body.modify === 0) {
//     return res.json({result:'此处禁止输入0!'});
//   }
//   else if (req.body.modify < -1) {
//     return res.json({result:'非法输入!'});
//   }
//   else if (req.body.modify != null && req.body.modify != '') {
//     req.modify = parseInt(req.body.modify, 10);
//   }
//   else {
//     req.modify = 0;
//   }
//   // return res.json({modify: req.modify});

//   Account.getOne(query, function(err, item) {
//     if (err) {
//       return res.status(500).send(err.errmsg);
//     }
//     if (item === null) {
//       if (req.modify === 0) {
//         var accountData = {
//             userId: req.patientId,
//             freeTimes: 3,
//             money: 0
//           };
//       }
//       else if (req.modify === -1) {
//         var accountData = {
//             userId: req.patientId,
//             freeTimes: 2,
//             money: 0
//           };
//       }
//       else if (req.modify > 0) {
//         var accountData = {
//             userId: req.patientId,
//             freeTimes: 3,
//             money: 0,
//             times: [
//               {
//                 count: req.modify,
//                 doctorId: req.doctorId
//               }
//             ]
//           };
//       }
//         var newAccount = new Account(accountData);
//       newAccount.save(function(err, accountInfo) {
//         if (err) {
//               return res.status(500).send(err.errmsg);
//           }
//       });
//       if (req.modify === 0) {
//         return res.json({results: 3});
//       }
//       else {
//         req.freeTimes = 3;
//         req.count = 0;
//         req.totalCount = 3;
//         next();
//       }
//     }
//     else {
//       var count = 0;
//       for (var i = item.times.length - 1; i >= 0; i--) {
//         if (item.times[i].doctorId === req.doctorId) {
//           count = item.times[i].count;
//           break;
//         }
//       }
//       var totalCount = count + item.freeTimes;
//       if (req.modify === 0) {
//         return res.json({result: totalCount});
//       }
//       else {
//         req.freeTimes = item.freeTimes;
//         req.count = count;
//         req.totalCount = totalCount;
//         next();
//       }
//     }
//   });
// }

// 获取咨询计数，重新定义freeTimes = 3版本 2017-05-03 GY
exports.getCounts = function (req, res, next) {
  var query = {
    userId: req.patientId
  }
  let modify = req.body.modify || req.query.modify || null
  if (modify === 0) {
    return res.json({result: '此处禁止输入0!'})
  } else if (modify < -1) {
    return res.json({result: '非法输入!'})
  } else if (modify !== null) {
    // console.log('here')
    // modify字符串转化为数字
    req.modify = parseInt(modify, 10)
    // req.modify = Number(req.body.modify)
  } else {
    // get 操作时body为null,modify置为0
    req.modify = 0
  }
  console.log(modify)
  console.log(req.modify)
  // return res.json({modify: req.modify});
  // 查询单个患者账户信息
  Account.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      // 若账户信息为空，即以前未就诊该医生，则根据modify进行将问诊信息初始化
      var accountData
      if (req.modify === 0) {
        accountData = {
          userId: req.patientId,
          freeTimes: 3,
          money: 0,
          times: [
            {
              count: 0,
              doctorId: req.doctorId
            }
          ]
        }
      } else if (req.modify === -1) {
        // 可咨询问题数减少，即已咨询，免费咨询次数-1，该医生的咨询问题数-1，一次咨询机会可以问三个问题
        accountData = {
          userId: req.patientId,
          freeTimes: 2,
          money: 0,
          times: [
            {
              count: 2,
              doctorId: req.doctorId
            }
          ]
        }
      } else if (req.modify > 0) {
        // 可咨询问题数增加，即购买咨询次数
        accountData = {
          userId: req.patientId,
          freeTimes: 3,
          money: 0,
          times: [
            {
              count: req.modify,
              doctorId: req.doctorId
            }
          ]
        }
      }
      var newAccount = new Account(accountData)
      newAccount.save(function (err, accountInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
      })
      if (req.modify === 0) {
        // console.log('new record');
        // 若是查询，则直接返回免费咨询次数和该医生剩余的咨询次数
        return res.json({results: {freeTimes: 3, count: 0}})
      } else {
        // console.log('new record for modify');
        req.freeTimes = 3
        req.count = 0
        req.totalCount = 3
        next()
      }
    } else {
      // 有历史咨询信息，查询是否有咨询该医生的历史信息
      var count = 0
      for (var i = item.times.length - 1; i >= 0; i--) {
        if (item.times[i].doctorId === req.doctorId) {
          count = item.times[i].count
          break
        }
      }
      // console.log(i);
      // console.log(count);
      // 无咨询该医生的历史信息，则添加该医生的咨询信息
      if (i === -1) {
        var querytemp = {userId: req.patientId}
        var upObj = {
          $addToSet: {
            times: {
              count: 0,
              doctorId: req.doctorId
            }

          }
        }
        // console.log('i=-1')
        Account.update(querytemp, upObj, function (err, upaccountadd) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          // console.log('doctor not exist')
          // if (upaccountadd.nModified === 0) {
          //   return res.json({result:'修改失败，请重新修改'});
          // }
          // else if (upaccountadd.nModified != 0) {
          //   return res.json({result:'修改成功', updateResult:upaccountadd});
          // }
          if (req.modify === 0) {
            // console.log('patient exist');
            return res.json({result: {freeTimes: item.freeTimes, count: count}})
          } else {
            req.freeTimes = item.freeTimes
            req.count = count
            req.totalCount = item.freeTimes + count
            next()
          }
        })
      } else {
        // 有咨询该医生的历史信息，直接读取
        if (req.modify === 0) {
          // console.log('patient exist')
          return res.json({result: {freeTimes: item.freeTimes, count: count}})
        } else {
          req.freeTimes = item.freeTimes
          req.count = count
          // totalCount 是提醒患者是否需要充值的标签，用于判断患者咨询次数是否用完，“+”实际为或操作，在患者没有免费次数和咨询问题数的情况下，值为0
          req.totalCount = item.freeTimes + count
          next()
        }
      }
    }
  })
}

// 根据DocId修改咨询次数 2017-04-20 GY
exports.modifyCounts = function (req, res) {
  var query = {
    userId: req.patientId
  }

  if (req.modify === -1) {
    // console.log(req);
    // console.log({'req.count':req.count})
    if (req.totalCount === 0) {
      return res.json({result: '咨询次数已达0, 无法继续减小!'})
    } else if (req.freeTimes > 0) {
      if (req.count > 0) {
        req.count -= 1
      } else if (req.count === 0) {
        // console.log('here')
        req.freeTimes -= 1
        req.count = 2
      }
      // 对times数组数据的更新，pull操作删除数组中的upObj，addToSet操作在数组中添加upObjAdd，后期可将update操作修改为upsert操作
      var upObj = {
        $pull: {
          times: {
            doctorId: req.doctorId
          }
        }
      }
      Account.update(query, upObj, function (err, upaccount) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        var upObjAdd
        // var upObjAdd = {}，可能置空更合理
        if (upaccount.nModified === 0) {
          // return res.json({result:'请获取账户信息确认是否修改成功'});
          upObjAdd = {
            $addToSet: {
              times: {
                count: req.count,
                doctorId: req.doctorId
              }
            },
            freeTimes: req.freeTimes
          }
          Account.update(query, upObjAdd, function (err, upaccountadd) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            if (upaccountadd.nModified === 0) {
              return res.json({result: '修改成功', updateResult: upaccountadd})  // 修改失败？
            } else if (upaccountadd.nModified !== 0) {
              return res.json({result: '修改成功', updateResult: upaccountadd})
            }
          })
        } else if (upaccount.nModified !== 0) {
          // return res.json({result:'修改成功', updateResult:upaccount});
          upObjAdd = {
            $addToSet: {
              times: {
                count: req.count,
                doctorId: req.doctorId
              }
            },
            freeTimes: req.freeTimes
          }
          Account.update(query, upObjAdd, function (err, upaccountadd) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            if (upaccountadd.nModified === 0) {
              return res.json({result: '修改失败，请重新修改2'})
            } else if (upaccountadd.nModified !== 0) {
              return res.json({result: '修改成功', updateResult: upaccountadd})
            }
          })
        }
      })
    } else if (req.freeTimes === 0) {
      // var modifyResult = req.count + req.modify;
      req.count -= 1
      upObj = {
        $pull: {
          times: {
            doctorId: req.doctorId
          }
        }
      }
      Account.update(query, upObj, function (err, upaccount) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (upaccount.nModified === 0) {
          return res.json({result: '请获取账户信息确认是否修改成功'})
        } else if (upaccount.nModified !== 0) {
          // return res.json({result:'修改成功', updateResult:upaccount});
          var upObjAdd = {
            $addToSet: {
              times: {
                count: req.count,
                doctorId: req.doctorId
              }
            }
          }
          Account.update(query, upObjAdd, function (err, upaccountadd) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            if (upaccountadd.nModified === 0) {
              return res.json({result: '修改失败，请重新修改3'})
            } else if (upaccountadd.nModified !== 0) {
              return res.json({result: '修改成功', updateResult: upaccountadd})
            }
          })
        }
      })
    }
  } else if (req.modify === 3) {
    // 无论之前req.count是否大于0，均为3，保证这个数字不大于3
    // var modifyResult = req.count + req.modify;
    var modifyResult = 3
    upObj = {
      $pull: {
        times: {
          doctorId: req.doctorId
        }
      }
    }
    Account.update(query, upObj, function (err, upaccountadd) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (upaccountadd.nModified === 0) {
        var upObjfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjfirst, function (err, upaccountfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountfirst.nModified === 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          } else if (upaccountfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          }
        })
      } else if (upaccountadd.nModified !== 0) {
        var upObjnotfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjnotfirst, function (err, upaccountnotfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountnotfirst.nModified === 0) {
            return res.json({result: '修改失败，讲道理这句话不会执行'})
          } else if (upaccountnotfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountnotfirst})
          }
        })
        // return res.json({result: '修改成功', updateResult: upaccountadd});
      }
    })
  } else if (req.modify === 999) {
    // 问诊情况，将count置为999
    modifyResult = 999
    upObj = {
      $pull: {
        times: {
          doctorId: req.doctorId
        }
      }
    }
    Account.update(query, upObj, function (err, upaccountadd) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (upaccountadd.nModified === 0) {
        var upObjfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjfirst, function (err, upaccountfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountfirst.nModified === 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          } else if (upaccountfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          }
        })
      } else if (upaccountadd.nModified !== 0) {
        var upObjnotfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjnotfirst, function (err, upaccountnotfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountnotfirst.nModified === 0) {
            return res.json({result: '修改失败，讲道理这句话不会执行'})
          } else if (upaccountnotfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountnotfirst})
          }
        })
        // return res.json({result: '修改成功', updateResult: upaccountadd});
      }
    })
  } else if (req.modify === 900) {
    // 问诊结束，将count置为0
    modifyResult = 0
    upObj = {
      $pull: {
        times: {
          doctorId: req.doctorId
        }
      }
    }
    Account.update(query, upObj, function (err, upaccountadd) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (upaccountadd.nModified === 0) {
        var upObjfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjfirst, function (err, upaccountfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountfirst.nModified === 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          } else if (upaccountfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountfirst})
          }
        })
      } else if (upaccountadd.nModified !== 0) {
        var upObjnotfirst = {
          $addToSet: {
            times: {
              count: modifyResult,
              doctorId: req.doctorId
            }
          }
        }
        Account.update(query, upObjnotfirst, function (err, upaccountnotfirst) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (upaccountnotfirst.nModified === 0) {
            return res.json({result: '修改失败，讲道理这句话不会执行'})
          } else if (upaccountnotfirst.nModified !== 0) {
            return res.json({result: '修改成功', updateResult: upaccountnotfirst})
          }
        })
        // return res.json({result: '修改成功', updateResult: upaccountadd});
      }
    })
  }
}

// exports.rechargeDoctor = function(req, res) {
//     var _chargetype=Number(req.body.type)
//     var _pid=req.body.patientId
//     var _did=req.body.doctorId
//     if(_chargetype==""||_chargetype==undefined||_pid==""||_pid==undefined||_did==""||_did==undefined){
//         return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、病人id-patientId、医生id-doctorId'});
//     }
//     else{
//         query={userId:_did};
//         Doctor.getOne(query, function(err, item) {
//             if (err) {
//                 return res.status(500).send(err.errmsg);
//             }
//             if (item === null) {
//                 return res.json({result: '不存在的医生ID'});
//             }
//             else {
//                 var _money=0
//                 if(_chargetype==1){
//                     _money=item.charge1
//                 }
//                 else if(_chargetype==2){
//                     _money=item.charge2
//                 }
//                 else{
//                   _money=item.charge2-item.charge1
//                 }
//                 // console.log(_money)
//                 Account.getOne(query, function(err, item1) {
//                     if (err) {
//                         return res.status(500).send(err.errmsg);
//                     }
//                     if (item1 === null) {
//                         var accountData = {
//                             userId: _did,
//                             money: _money,
//                             incomeRecords:{
//                                 time: new Date(),
//                                 money: _money,
//                                 from: _pid
//                             }
//                         };
//                         var newAccount = new Account(accountData);
//                         newAccount.save(function(err, accountInfo) {
//                             if (err) {
//                                 return res.status(500).send(err.errmsg);
//                             }
//                             else{
//                                 res.json({result:"success!"});
//                             }
//                         });
//                     }
//                     else {
//                         var _money1=_money+item1.money
//                         var upObj = {
//                             $set:{money:_money1},
//                             $push: {
//                                 incomeRecords: {
//                                     time: new Date(),
//                                     money: _money,
//                                     from: _pid
//                                 }
//                             }
//                         };
//                         Account.update(query, upObj, function(err, upaccount) {
//                             if (err) {
//                                 return res.status(500).send(err.errmsg);
//                             }
//                             if (upaccount.nModified === 0) {
//                                 return res.json({result:'请获取账户信息确认是否修改成功'});
//                             }
//                             else if (upaccount.nModified != 0) {
//                                 return res.json({result:'修改成功', updateResult:upaccount});
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     }
// }

// 更新免费次数 GY 0511
// 以后求求各位需求明确之后再让我写好吗
exports.updateFreeTime = function (req, res) {
  var date = new Date()
  var month = date.getMonth() + 1
  var year = date.getFullYear()
  var activity = 0
  if (month < 8 && year === 2017) { activity = 1 }

  var query = {userId: req.patientId}
  Account.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      // return res.json({result:'不存在的账户'})；
      var accountData = {
        userId: req.patientId,
        freeTimes: 2,
        money: 0
      }
      if (activity === 1) {
        accountData = {
          userId: req.patientId,
          freeTimes: 3,
          money: 0
        }
      }
      var newAccount = new Account(accountData)
      newAccount.save(function (err, accountInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        return res.json({result: accountInfo})
      })
    } else {
      if (item.freeTimes === 0) {
        return res.json({result: 'freeTimes = 0 !'})
      } else {
        var upObj = {freeTimes: item.freeTimes - 1}
        if (activity === 1) {
          upObj = {freeTimes: item.freeTimes}
        }
        Account.updateOne(query, upObj, function (err, upaccount) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          return res.json({result: upaccount})
        }, {new: true})
      }
    }
  })
}

// 根据患者ID获取未完成咨询/问诊计数 GY 0504
exports.getCountsRespective = function (req, res) {
  var query = {userId: req.patientId}
  Account.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      // return res.json({result: '不存在的账户'});
      var accountData = {
        userId: req.patientId,
        freeTimes: 3,
        money: 0
      }
      var newAccount = new Account(accountData)
      newAccount.save(function (err, accountInfo) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        return res.json({result: {count1: 0, count2: 0}})
      })
    } else {
      var count1 = 0 // 咨询
      var count2 = 0 // 问诊

      // 2017-08-10 debug
      if (item.times.constructor === Array && item.times.length) {
        for (var i = item.times.length - 1; i >= 0; i--) {
          // item.times[i]
          if (item.times[i].count === 999) {
            count2 += 1
          } else if (item.times[i].count > 0 && item.times[i].count < 4) {
            count1 += 1
          }
        }
      }
      return res.json({result: {count1: count1, count2: count2}})
    }
  })
}
