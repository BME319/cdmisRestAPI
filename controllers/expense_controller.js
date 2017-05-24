
var	config = require('../config'),
	webEntry = require('../settings').webEntry,
	Patient = require('../models/patient'), 
	Expense = require('../models/expense');

exports.getDocRecords = function(req, res) {
	//查询条件
	var query = {doctorId:req.query.doctorId};

	var limit = Number(req.query.limit);
	var skip = Number(req.query.skip);

	var opts = {limit: limit, skip:skip, sort:'-time'};
	var fields = {'_id':0,"doctorId":0,"doctorName":0,"patientId":0};
	
	var _Url = '';
	var userIdUrl = 'doctorId=' + req.query.doctorId;
	var limitUrl = '';
	var skipUrl = '';

	if (limit != null && limit != undefined) {
		limitUrl = 'limit=' + String(limit);
	}
	if (skip != null && skip != undefined) {
		skipUrl = 'skip=' + String(skip + limit);
	}
	if (userIdUrl != '' || limitUrl != '' || skipUrl != '') {
		_Url = _Url + '?';
		if (userIdUrl != '') {
			_Url = _Url + userIdUrl + '&';
		}
		if (limitUrl != '') {
			_Url = _Url + limitUrl + '&';
		}
		if (skipUrl != '') {
			_Url = _Url + skipUrl + '&';
		}
		_Url = _Url.substr(0, _Url.length - 1)
	}
	req.body.nexturl = webEntry.domain + ':' + webEntry.restPort + '/expense/getDocRecords' + _Url

	Expense.getSome(query, function(err, item) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: item, nexturl:req.body.nexturl});
	}, opts, fields);
}

exports.rechargeDoctor = function(req, res) {
    var _chargetype=req.body.type
    var _pid=req.body.patientId
    var _pName=req.body.patientName
    var _did=req.body.doctorId
    var _dName=req.body.doctorName
    var _money=Number(req.body.money)
    if(_chargetype===""||_chargetype==undefined||_money===""||_money==undefined||_pid===""||_pid==undefined||_pName===""||_pName==undefined||_did===""||_did==undefined||_dName===""||_dName==undefined){
        return res.json({result: '请输入医生收费类型-type（咨询1/问诊2/咨询转问诊3）、费用、病人id姓名-patientId、patientName、医生id姓名-doctorId、doctorName'});
    }
    else{
    	var query = {
    		userId: _pid
    	};
    	Patient.getOne(query, function (err, patient) {
	        if (err) {
	            return res.status(500).send('服务器错误, 用户查询失败!');
	        }
	        if (patient == null) {
	        	return res.json({result:'不存在的患者ID！'});
	        }
	        _pName = patient.name;
	        var expenseData = {
	        	patientId: _pid,
				patientName: _pName,
				doctorId: _did,
				doctorName: _dName,
				time: new Date(), 
				money: _money,
				type: _chargetype
	        };
	        var newExpense = new Expense(expenseData);
	        newExpense.save(function(err, expenseInfo) {
	            if (err) {
	                return res.status(500).send(err.errmsg);
	            }
	            else{
	                res.json({result:"success!"});
	            }
	        });

	    });
    }
}

