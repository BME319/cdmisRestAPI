
var	config = require('../config'),
	Account = require('../models/account'), 
	Patient = require('../models/patient'), 
	Doctor = require('../models/doctor');

//根据doctorId查询相关评价 2017-03-30 GY 
exports.getAccountInfo = function(req, res) {
	if (req.query.userId == null || req.query.userId == '') {
        return res.json({result:'请填写userId!'});
    }
	//查询条件
	var _userId = req.query.userId;
	var query = {userId:_userId};

	//设置参数
	//var opts = '';
	//var fields = {'_id':0};
	//var fields = '';
	//var populate = {path: 'patientId', select:{'_id':0, 'userId':1, 'name':1}};
	//var populate = '';

	Account.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item});
	});
}

//通用方法：判断patientId和doctorId是否可用 2017-04-20 GY
exports.checkPatient = function(req, res, next) {
	if (req.query.patientId == null || req.query.patientId == '') {
		if (req.body.patientId == null || req.body.patientId == '') {
			return res.json({result: '请填写patientId!'});
		}
		else {
			req.patientId = req.body.patientId;
		}
	}
	else {
		req.patientId = req.query.patientId;
	}
	var query = {userId: req.patientId};
	Patient.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			return res.json({result: '不存在的患者ID'});
		}
		else {
			next();
		}
	});
}
exports.checkDoctor = function(req, res, next) {
	if (req.query.doctorId == null || req.query.doctorId == '') {
		if (req.body.doctorId == null || req.body.doctorId == '') {
			// return res.json({result: '请填写doctorId!'});
			var queryPatient = {userId: req.patientId};
			Account.getOne(queryPatient, function(err, accountitem) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				if (accountitem == null) {
					var accountData = {
						userId: req.patientId, 
						freeTimes: 3, 
						money: 0
					};
					var newAccount = new Account(accountData);
					newAccount.save(function(err, accountInfo) {
						if (err) {
   						return res.status(500).send(err.errmsg);
   					}
					});
					return res.json({result:{freeTimes:3, totalPaidTimes:0}});
				}
				else {
					var count = 0;
					for (var i = accountitem.times.length - 1; i >= 0; i--) {
						count += accountitem.times[i].count;
					}
					return res.json({result:{freeTimes:accountitem.freeTimes, totalCount:count}});
				}
			});
		}
		else {
			req.doctorId = req.body.doctorId;
			var query = {userId: req.doctorId};
			Doctor.getOne(query, function(err, item) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				else if (item == null) {
					return res.json({result: '不存在的医生ID'});
				}
				else {
					next();
				}
			});
		}
	}
	else {
		req.doctorId = req.query.doctorId;
		var query = {userId: req.doctorId};
			Doctor.getOne(query, function(err, item) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				else if (item == null) {
					return res.json({result: '不存在的医生ID'});
				}
				else {
					next();
				}
			});
	}
	// var query = {userId: req.doctorId};
	// Doctor.getOne(query, function(err, item) {
	// 	if (err) {
	// 		return res.status(500).send(err.errmsg);
	// 	}
	// 	else if (item == null) {
	// 		return res.json({result: '不存在的医生ID'});
	// 	}
	// 	else {
	// 		next();
	// 	}
	// });
}

// //获取咨询计数 2017-04-20 GY
// exports.getCounts = function(req, res, next) {

// 	var query = {
// 		userId: req.patientId
// 	};
// 	if (req.body.modify == 0) {
// 		return res.json({result:'此处禁止输入0!'});
// 	}
// 	else if (req.body.modify < -1) {
// 		return res.json({result:'非法输入!'});
// 	}
// 	else if (req.body.modify != null && req.body.modify != '') {
// 		req.modify = parseInt(req.body.modify, 10);
// 	}
// 	else {
// 		req.modify = 0;
// 	}
// 	// return res.json({modify: req.modify});

// 	Account.getOne(query, function(err, item) {
// 		if (err) {
// 			return res.status(500).send(err.errmsg);
// 		}
// 		if (item == null) {
// 			if (req.modify == 0) {
// 				var accountData = {
//     				userId: req.patientId, 
//     				freeTimes: 3, 
//     				money: 0
//     			};
// 			}
// 			else if (req.modify == -1) {
// 				var accountData = {
//     				userId: req.patientId, 
//     				freeTimes: 2, 
//     				money: 0
//     			};
// 			}
// 			else if (req.modify > 0) {
// 				var accountData = {
//     				userId: req.patientId, 
//     				freeTimes: 3, 
//     				money: 0, 
//     				times: [
//     					{
//     						count: req.modify, 
//     						doctorId: req.doctorId
//     					}
//     				]
//     			};
// 			}
//     		var newAccount = new Account(accountData);
// 			newAccount.save(function(err, accountInfo) {
// 				if (err) {
//       				return res.status(500).send(err.errmsg);
//     			}
// 			});
// 			if (req.modify == 0) {
// 				return res.json({results: 3});
// 			}
// 			else {
// 				req.freeTimes = 3;
// 				req.count = 0;
// 				req.totalCount = 3;
// 				next();
// 			}
// 		}
// 		else {
// 			var count = 0;
// 			for (var i = item.times.length - 1; i >= 0; i--) {
// 				if (item.times[i].doctorId == req.doctorId) {
// 					count = item.times[i].count;
// 					break;
// 				}
// 			}
// 			var totalCount = count + item.freeTimes;
// 			if (req.modify == 0) {
// 				return res.json({result: totalCount});
// 			}
// 			else {
// 				req.freeTimes = item.freeTimes;
// 				req.count = count;
// 				req.totalCount = totalCount;
// 				next();
// 			}
// 		}
// 	});
// }

//获取咨询计数，重新定义freeTimes = 3版本 2017-05-03 GY
exports.getCounts = function(req, res, next) {

	var query = {
		userId: req.patientId
	};
	if (req.body.modify == 0) {
		return res.json({result:'此处禁止输入0!'});
	}
	else if (req.body.modify < -1) {
		return res.json({result:'非法输入!'});
	}
	else if (req.body.modify != null && req.body.modify != '') {
		req.modify = parseInt(req.body.modify, 10);
	}
	else {
		req.modify = 0;
	}
	// return res.json({modify: req.modify});

	Account.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			if (req.modify == 0) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 3, 
    				money: 0, 
    				times: [
    					{
    						count: 0, 
    						doctorId: req.doctorId
    					}
    				]
    			};
			}
			else if (req.modify == -1) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 2, 
    				money: 0, 
    				times: [
    					{
    						count: 2, 
    						doctorId: req.doctorId
    					}
    				]
    			};
			}
			else if (req.modify > 0) {
				var accountData = {
    				userId: req.patientId, 
    				freeTimes: 3, 
    				money: 0, 
    				times: [
    					{
    						count: req.modify, 
    						doctorId: req.doctorId
    					}
    				]
    			};
			}
    		var newAccount = new Account(accountData);
			newAccount.save(function(err, accountInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
			});
			if (req.modify == 0) {
				// console.log('new record');
				return res.json({results: {freeTimes:3, count:0}});
			}
			else {
				// console.log('new record for modify');
				req.freeTimes = 3;
				req.count = 0;
				req.totalCount = 3;
				next();
			}
		}
		else {
			var count = 0;
			for (var i = item.times.length - 1; i >= 0; i--) {
				if (item.times[i].doctorId == req.doctorId) {
					count = item.times[i].count;
					break;
				}
			}
			// console.log(i);
			// console.log(count);
			if (i == -1) {
				var querytemp = {userId: req.patientId};
				var upObj = {
					$addToSet: {
						times: {
    						count: 0, 
    						doctorId: req.doctorId
    					}
    					
					}
				};
				// console.log('i=-1')
				Account.update(querytemp, upObj, function(err, upaccountadd) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					// console.log('doctor not exist')
					// if (upaccountadd.nModified == 0) {
					// 	return res.json({result:'修改失败，请重新修改'});
					// }
					// else if (upaccountadd.nModified != 0) {
					// 	return res.json({result:'修改成功', updateResult:upaccountadd});
					// }
					if (req.modify == 0) {
						// console.log('patient exist');
						return res.json({result: {freeTimes:item.freeTimes, count:count}});
					}
					else {
						req.freeTimes = item.freeTimes;
						req.count = count;
						req.totalCount = item.freeTimes + count;
						next();
					}
				});
			}
			else {
				if (req.modify == 0) {
					// console.log('patient exist');
					return res.json({result: {freeTimes:item.freeTimes, count:count}});
				}
				else {
					req.freeTimes = item.freeTimes;
					req.count = count;
					req.totalCount = item.freeTimes + count;
					next();
				}
			}
		}
	});
}

//根据DocId修改咨询次数 2017-04-20 GY
exports.modifyCounts = function(req, res) {

	var query = {
		userId: req.patientId
	};

	if (req.modify == -1) {
		// console.log(req);
		// console.log({'req.count':req.count})
		if (req.totalCount == 0) {
			return res.json({result: '咨询次数已达0, 无法继续减小!'});
		}
		else if (req.freeTimes > 0) {
			if (req.count > 0) {
				req.count -= 1;
			}
			else if (req.count == 0) {
				// console.log('here')
				req.freeTimes -= 1;
				req.count = 2;
			}
			var upObj = {
				$pull: {
					times: {
						doctorId: req.doctorId
					}
				}
			};
			Account.update(query, upObj, function(err, upaccount) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				if (upaccount.nModified == 0) {
					// return res.json({result:'请获取账户信息确认是否修改成功'});
					var upObjAdd = {
						$addToSet: {
							times: {
								count: req.count, 
								doctorId: req.doctorId
							}
						}, 
						freeTimes: req.freeTimes
					};
					Account.update(query, upObjAdd, function(err, upaccountadd) {
						if (err) {
							return res.status(500).send(err.errmsg);
						}
						if (upaccountadd.nModified == 0) {
							return res.json({result:'修改成功', updateResult:upaccountadd});
						}
						else if (upaccountadd.nModified != 0) {
							return res.json({result:'修改成功', updateResult:upaccountadd});
						}
					});
				}
				else if (upaccount.nModified != 0) {
					// return res.json({result:'修改成功', updateResult:upaccount});
					var upObjAdd = {
						$addToSet: {
							times: {
								count: req.count, 
								doctorId: req.doctorId
							}
						}, 
						freeTimes: req.freeTimes
					};
					Account.update(query, upObjAdd, function(err, upaccountadd) {
						if (err) {
							return res.status(500).send(err.errmsg);
						}
						if (upaccountadd.nModified == 0) {
							return res.json({result:'修改失败，请重新修改2'});
						}
						else if (upaccountadd.nModified != 0) {
							return res.json({result:'修改成功', updateResult:upaccountadd});
						}
					});
				}
			});
		}
		else if (req.freeTimes == 0) {
			// var modifyResult = req.count + req.modify;
			req.count -= 1;
			var upObj = {
				$pull: {
					times: {
						doctorId: req.doctorId
					}
				}
			};
			Account.update(query, upObj, function(err, upaccount) {
				if (err) {
					return res.status(500).send(err.errmsg);
				}
				if (upaccount.nModified == 0) {
					return res.json({result:'请获取账户信息确认是否修改成功'});
				}
				else if (upaccount.nModified != 0) {
					// return res.json({result:'修改成功', updateResult:upaccount});
					var upObjAdd = {
						$addToSet: {
							times: {
								count: req.count, 
								doctorId: req.doctorId
							}
						}
					};
					Account.update(query, upObjAdd, function(err, upaccountadd) {
						if (err) {
							return res.status(500).send(err.errmsg);
						}
						if (upaccountadd.nModified == 0) {
							return res.json({result:'修改失败，请重新修改3'});
						}
						else if (upaccountadd.nModified != 0) {
							return res.json({result:'修改成功', updateResult:upaccountadd});
						}
					});
				}
			});
		}
	}
	else if (req.modify == 3) {
		//无论之前req.count是否大于0，均为3，保证这个数字不大于3
		// var modifyResult = req.count + req.modify;
		var modifyResult = 3;
		var upObj = {
			$pull: {
				times: {
					doctorId: req.doctorId
				}
			}
		};
		Account.update(query, upObj, function(err, upaccountadd) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (upaccountadd.nModified == 0) {
				var upObjfirst = {
					$addToSet: {
						times: {
							count:modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjfirst, function(err, upaccountfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountfirst.nModified == 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
					else if (upaccountfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
				});
			}
			else if (upaccountadd.nModified != 0) {
				var upObjnotfirst = {
					$addToSet: {
						times: {
							count: modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjnotfirst, function(err, upaccountnotfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountnotfirst.nModified == 0) {
						return res.json({result:'修改失败，讲道理这句话不会执行'});
					}
					else if (upaccountnotfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountnotfirst});
					}
				});
				// return res.json({result: '修改成功', updateResult: upaccountadd});
			}
		});
	}
	else if (req.modify == 999) {
		//问诊情况，将count置为999
		var modifyResult = 999;
		var upObj = {
			$pull: {
				times: {
					doctorId: req.doctorId
				}
			}
		};
		Account.update(query, upObj, function(err, upaccountadd) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (upaccountadd.nModified == 0) {
				var upObjfirst = {
					$addToSet: {
						times: {
							count:modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjfirst, function(err, upaccountfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountfirst.nModified == 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
					else if (upaccountfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
				});
			}
			else if (upaccountadd.nModified != 0) {
				var upObjnotfirst = {
					$addToSet: {
						times: {
							count: modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjnotfirst, function(err, upaccountnotfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountnotfirst.nModified == 0) {
						return res.json({result:'修改失败，讲道理这句话不会执行'});
					}
					else if (upaccountnotfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountnotfirst});
					}
				});
				// return res.json({result: '修改成功', updateResult: upaccountadd});
			}
		});
	}
	else if (req.modify == 900) {
		//问诊结束，将count置为0
		var modifyResult = 0;
		var upObj = {
			$pull: {
				times: {
					doctorId: req.doctorId
				}
			}
		};
		Account.update(query, upObj, function(err, upaccountadd) {
			if (err) {
				return res.status(500).send(err.errmsg);
			}
			if (upaccountadd.nModified == 0) {
				var upObjfirst = {
					$addToSet: {
						times: {
							count:modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjfirst, function(err, upaccountfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountfirst.nModified == 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
					else if (upaccountfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountfirst});
					}
				});
			}
			else if (upaccountadd.nModified != 0) {
				var upObjnotfirst = {
					$addToSet: {
						times: {
							count: modifyResult, 
							doctorId: req.doctorId
						}
					}
				};
				Account.update(query, upObjnotfirst, function(err, upaccountnotfirst) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					if (upaccountnotfirst.nModified == 0) {
						return res.json({result:'修改失败，讲道理这句话不会执行'});
					}
					else if (upaccountnotfirst.nModified != 0) {
						return res.json({result:'修改成功', updateResult:upaccountnotfirst});
					}
				});
				// return res.json({result: '修改成功', updateResult: upaccountadd});
			}
		});
	}
}

exports.rechargeDoctor = function(req, res) {
    var _chargetype=Number(req.body.type)
    var _pid=req.body.patientId
    var _did=req.body.doctorId
    if(_chargetype==""||_chargetype==undefined||_pid==""||_pid==undefined||_did==""||_did==undefined){
        return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、病人id-patientId、医生id-doctorId'});
    }
    else{
        query={userId:_did};
        Doctor.getOne(query, function(err, item) {
            if (err) {
                return res.status(500).send(err.errmsg);
            }
            if (item == null) {
                return res.json({result: '不存在的医生ID'});
            }
            else {
                var _money=0
                if(_chargetype==1){
                    _money=item.charge1
                }
                else if(_chargetype==2){
                    _money=item.charge2
                }
                else{
                	_money=item.charge2-item.charge1
                }
                // console.log(_money)
                Account.getOne(query, function(err, item1) {
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }
                    if (item1 == null) {
                        var accountData = {
                            userId: _did, 
                            money: _money,
                            incomeRecords:{
                                time: new Date(), 
                                money: _money, 
                                from: _pid
                            }
                        };
                        var newAccount = new Account(accountData);
                        newAccount.save(function(err, accountInfo) {
                            if (err) {
                                return res.status(500).send(err.errmsg);
                            }
                            else{
                                res.json({result:"success!"});
                            }
                        });
                    }
                    else {
                        var _money1=_money+item1.money
                        var upObj = {
                            $set:{money:_money1},
                            $push: {
                                incomeRecords: {
                                    time: new Date(), 
                                    money: _money, 
                                    from: _pid
                                }
                            }
                        };
                        Account.update(query, upObj, function(err, upaccount) {
                            if (err) {
                                return res.status(500).send(err.errmsg);
                            }
                            if (upaccount.nModified == 0) {
                                return res.json({result:'请获取账户信息确认是否修改成功'});
                            }
                            else if (upaccount.nModified != 0) {
                                return res.json({result:'修改成功', updateResult:upaccount});
                            }
                        });
                    }
                });
            }
        });
    }
}

//更新免费次数 GY 0511
//以后求求各位需求明确之后再让我写好吗
exports.updateFreeTime = function(req, res) {
	var query = {userId:req.patientId};
	Account.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			// return res.json({result:'不存在的账户'})；
			var accountData = {
    			userId: req.patientId, 
    			freeTimes: 2, 
    			money: 0
    		};
    		var newAccount = new Account(accountData);
			newAccount.save(function(err, accountInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			return res.json({result:accountInfo});
			});
		}
		else {
			if (item.freeTimes == 0) {
				return res.json({result:'freeTimes = 0 !'})
			}
			else {
				var upObj = {freeTimes:item.freeTimes - 1};
				Account.updateOne(query, upObj, function(err, upaccount) {
					if (err) {
						return res.status(500).send(err.errmsg);
					}
					return res.json({result:upaccount});
				}, {new:true});
			}
		}
	});
}

//根据患者ID获取未完成咨询/问诊计数 GY 0504
exports.getCountsRespective = function(req, res) {
	var query = {userId:req.patientId}
	Account.getOne(query, function(err, item) {
		if (err) {
			return res.status(500).send(err.errmsg);
		}
		if (item == null) {
			// return res.json({result: '不存在的账户'});
			var accountData = {
    			userId: req.patientId, 
    			freeTimes: 3, 
    			money: 0
    		};
    		var newAccount = new Account(accountData);
			newAccount.save(function(err, accountInfo) {
				if (err) {
      				return res.status(500).send(err.errmsg);
    			}
    			return res.json({result:{count1:0, count2:0}});
			});
		}
		else {
			var count1 = 0; //咨询
			var count2 = 0; //问诊

			for (var i = item.times.length - 1; i >= 0; i--) {
				// item.times[i]
				if (item.times[i].count == 999){
					count2 += 1;
				}
				else if (item.times[i].count > 0 && item.times[i].count < 4){
					count1 += 1;
				}
			}

			return res.json({result:{count1:count1, count2:count2}});
		}
	})
}
