var	config = require('../config'),
		Alluser = require('../models/alluser'),
        OpenIdTmp = require('../models/openId'),
		DictNumber = require('../models/dictNumber'),
		Numbering = require('../models/numbering'),
        Refreshtoken = require('../models/refreshtoken'),
		Sms = require('../models/sms'),
		crypto = require('crypto'),
		https = require('https'),
        xml2js = require('xml2js'),
        webEntry = require('../settings').webEntry,
        request = require('request'),
        jwt = require('jsonwebtoken');
var Patient = require('../models/patient');
var commonFunc = require('../middlewares/commonFunc');
var Base64 = {  
    // 转码表  
    table : [  
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',  
            'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',  
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',  
            'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',  
            'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v',  
            'w', 'x', 'y', 'z', '0', '1', '2', '3',  
            '4', '5', '6', '7', '8', '9', '+', '/' 
    ],  
    UTF16ToUTF8 : function(str) {  
        var res = [], len = str.length;  
        for (var i = 0; i < len; i++) {  
            var code = str.charCodeAt(i);  
            if (code > 0x0000 && code <= 0x007F) {  
                // 单字节，这里并不考虑0x0000，因为它是空字节  
                // U+00000000 – U+0000007F  0xxxxxxx  
                res.push(str.charAt(i));  
            } else if (code >= 0x0080 && code <= 0x07FF) {  
                // 双字节  
                // U+00000080 – U+000007FF  110xxxxx 10xxxxxx  
                // 110xxxxx  
                var byte1 = 0xC0 | ((code >> 6) & 0x1F);  
                // 10xxxxxx  
                var byte2 = 0x80 | (code & 0x3F);  
                res.push(  
                    String.fromCharCode(byte1),   
                    String.fromCharCode(byte2)  
                );  
            } else if (code >= 0x0800 && code <= 0xFFFF) {  
                // 三字节  
                // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx  
                // 1110xxxx  
                var byte1 = 0xE0 | ((code >> 12) & 0x0F);  
                // 10xxxxxx  
                var byte2 = 0x80 | ((code >> 6) & 0x3F);  
                // 10xxxxxx  
                var byte3 = 0x80 | (code & 0x3F);  
                res.push(  
                    String.fromCharCode(byte1),   
                    String.fromCharCode(byte2),   
                    String.fromCharCode(byte3)  
                );  
            } else if (code >= 0x00010000 && code <= 0x001FFFFF) {  
                // 四字节  
                // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {  
                // 五字节  
                // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {  
                // 六字节  
                // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            }  
        }  
 
        return res.join('');  
    },  
    UTF8ToUTF16 : function(str) {  
        var res = [], len = str.length;  
        var i = 0;  
        for (var i = 0; i < len; i++) {  
            var code = str.charCodeAt(i);  
            // 对第一个字节进行判断  
            if (((code >> 7) & 0xFF) == 0x0) {  
                // 单字节  
                // 0xxxxxxx  
                res.push(str.charAt(i));  
            } else if (((code >> 5) & 0xFF) == 0x6) {  
                // 双字节  
                // 110xxxxx 10xxxxxx  
                var code2 = str.charCodeAt(++i);  
                var byte1 = (code & 0x1F) << 6;  
                var byte2 = code2 & 0x3F;  
                var utf16 = byte1 | byte2;  
                res.push(Sting.fromCharCode(utf16));  
            } else if (((code >> 4) & 0xFF) == 0xE) {  
                // 三字节  
                // 1110xxxx 10xxxxxx 10xxxxxx  
                var code2 = str.charCodeAt(++i);  
                var code3 = str.charCodeAt(++i);  
                var byte1 = (code << 4) | ((code2 >> 2) & 0x0F);  
                var byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);  
                utf16 = ((byte1 & 0x00FF) << 8) | byte2  
                res.push(String.fromCharCode(utf16));  
            } else if (((code >> 3) & 0xFF) == 0x1E) {  
                // 四字节  
                // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else if (((code >> 2) & 0xFF) == 0x3E) {  
                // 五字节  
                // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {  
                // 六字节  
                // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            }  
        }  
 
        return res.join('');  
    },  
    encode : function(str) {  
        if (!str) {  
            return '';  
        }  
        var utf8    = this.UTF16ToUTF8(str); // 转成UTF8  
        var i = 0; // 遍历索引  
        var len = utf8.length;  
        var res = [];  
        while (i < len) {  
            var c1 = utf8.charCodeAt(i++) & 0xFF;  
            res.push(this.table[c1 >> 2]);  
            // 需要补2个=  
            if (i == len) {  
                res.push(this.table[(c1 & 0x3) << 4]);  
                res.push('==');  
                break;  
            }  
            var c2 = utf8.charCodeAt(i++);  
            // 需要补1个=  
            if (i == len) {  
                res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);  
                res.push(this.table[(c2 & 0x0F) << 2]);  
                res.push('=');  
                break;  
            }  
            var c3 = utf8.charCodeAt(i++);  
            res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);  
            res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);  
            res.push(this.table[c3 & 0x3F]);  
        }  
 
        return res.join('');  
    },  
    decode : function(str) {  
        if (!str) {  
            return '';  
        }  
 
        var len = str.length;  
        var i   = 0;  
        var res = [];  
 
        while (i < len) {  
            code1 = this.table.indexOf(str.charAt(i++));  
            code2 = this.table.indexOf(str.charAt(i++));  
            code3 = this.table.indexOf(str.charAt(i++));  
            code4 = this.table.indexOf(str.charAt(i++));  
 
            c1 = (code1 << 2) | (code2 >> 4);  
            c2 = ((code2 & 0xF) << 4) | (code3 >> 2);  
            c3 = ((code3 & 0x3) << 6) | code4;  
 
            res.push(String.fromCharCode(c1));  
 
            if (code3 != 64) {  
                res.push(String.fromCharCode(c2));  
            }  
            if (code4 != 64) {  
                res.push(String.fromCharCode(c3));  
            }  
 
        }  
 
        return this.UTF8ToUTF16(res.join(''));  
    }  
};

exports.getAlluser = function(req, res) {
    // var _userId = req.query.userId
    // var query = {userId:_userId};
    var username = req.query.username;
    if (username === '' || username === null) {
        // return res.status(422).send('username字段请输入AlluserId或openId或手机号!'); 
        return res.status(422).send('username字段请输入openId!'); 
    }
    // var query = {openId:username};
    var query = {
        $or: [
            {userId: username},
            {openId: username},
            {phoneNo: username}
        ]
    };
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item});
    });
}


// exports.getAlluserTDCticket = function(req, res) {
//     var username = req.query.username;
//     if (username === '' || username === null) {
//         return res.status(422).send('username字段请输入AlluserId或openId或手机号!'); 
//     }
//     var query = {
//         $or: [
//             {userId: username},
//             {openId: username},
//             {phoneNo: username}
//         ]
//     };
//     Alluser.getOne(query, function(err, item) {
//         if (err) {
//             return res.status(500).send(err.errmsg);
//         }
//         res.json({results: item.TDCticket});
//     });
// }

exports.getAlluserAgreement = function(req, res) {
    var _userId = req.query.userId
    var query = {userId:_userId};
    var opts = '';
    var fields = { 'agreement':1};
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item});
    }, opts, fields);
}
exports.updateAlluserAgreement = function(req, res) {
    var _userId = req.body.userId
    var _agreement = req.body.agreement
    var query = {userId:_userId};
    Alluser.updateOne(query,{$set:{agreement: _agreement}},function(err, item1){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item1,msg:"success!"});
    });
}
//WF 20170626
function changeAlluserInvalidFlag(req, res, invalidFlag) {
    var _userId = req.body.userId
    var _invalidFlag= invalidFlag
    var query = {userId:_userId};
    Alluser.updateOne(query,{$set:{invalidFlag: _invalidFlag}},function(err, item1){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item1,msg:"success!"});
    });
}
exports.cancelAlluser = function(req, res) {
    changeAlluserInvalidFlag(req, res,1);
}
exports.getAlluserList = function( role) {
    return function(req, res){
        var query = {'invalidFlag':0};
        var fields = {'_id':0};//, 'revisionInfo':0
        var opts = {limit: limit, skip:skip, sort:'_id'};

        var limit = Number(req.query.limit);
        var skip = Number(req.query.skip);

        var _uid = req.query.userId;
        var _role = role;
        //role 0-user 1-doctor 2-patient 3-nurse 4-insurance 5-health 6-admin
        if(_uid !== null && _uid !== undefined && _uid !== "" ){
            query["userId"]=_uid;
        }
        fields["userId"] = 1;
        fields["name"] = 1;
        fields["gender"] = 1;
        fields["phoneNo"] = 1;
        if(_role === 0){
            fields["role"] = 1;
        }
        if(_role === 1){
            fields["workUnit"] = 1;
            fields["department"] = 1;
            fields["title"] = 1;
            fields["count1"] = 1;
            fields["count2"] = 1;
            fields["score"] = 1;
            fields["description"] = 1;
            fields["major"] = 1;
        }
        if(_role === 2){
            fields["VIP"] = 1;
            fields["IDNo"] = 1;
            fields["class"] = 1;
            fields["hypertension"] = 1;
            fields["bloodType"] = 1;
            fields["height"] = 1;
            fields["weight"] = 1;
            fields["class_info"] = 1;
            fields["birthday"] = 1;
            fields["allergic"] = 1;
        }
        if(_role === 3){
            fields["workUnit"] = 1;
            fields["department"] = 1;
            fields["workAmounts"] = 1;
        }
        if(_role === 4){
            fields["boardingTime"] = 1;
            fields["role"] = 1;
            fields["workAmounts"] = 1;
        }
        if(_role === 5){
            fields["boardingTime"] = 1;
            fields["workAmounts"] = 1;
        }
        if(_role === 6){
            fields["workUnit"] = 1;
            fields["creationTime"] = 1;
        }
		//通过子表查询主表，定义主表查询路径及输出内容
		// var populate = {path: 'patients.patientId', select: {'_id':0, 'revisionInfo':0}};

		Alluser.getSome(query, function(err, userlist) {
			// var users = new Array(userlist.length);
			var users = [];
		    if (err) {
		        return res.status(500).send(err.errmsg);
		    }
		    res.json({results: userlist});
		}, opts, fields);
	};
}

exports.updateAlluserList = function(req, res){
    var _userId = req.body.userId;
    var _name = req.body.name;
    var _birthday = req.body.birthday;//Date
    var _gender = req.body.gender;//Number
    var _IDNo = req.body.IDNo;
    var _phoneNo = req.body.phoneNo;
    var _photoUrl = req.body.photoUrl;
    var _province = req.body.province;
    var _city = req.body.city;
    var _district = req.body.district;
    var _workUnit = req.body.workUnit;
    var _title = req.body.title;
    var _job = req.body.job;
    var _department = req.body.department;
    var _major = req.body.major;
    var _description = req.body.description;
    var _height = req.body.height;
    var _weight = req.body.weight;
    var _occupation = req.body.occupation;
    var _bloodType = req.body.bloodType;//Number
    var _address = req.body.address;
    var _class = req.body.class;
    var _class_info = req.body.class_info;
    var _workAmounts = req.body.workAmounts;
    var _boardingTime = req.body.boardingTime;
    var _creationTime = req.body.creationTime;

    var query = {userId:_userId};
    var upObj = {};
    if(_name !== null && _name !== undefined && _name !== "" ){
        upObj["name"]=_name;
    }
    if(_gender !== null && _gender !== undefined && _gender !== "" ){
        if( _gender == 0 || _gender == 1 ){
            upObj["gender"]=Number(_gender);
        }
        else{
            return res.json({status:1,results:"gender must be 0 or 1!"});
        }
    }
    if(_phoneNo !== null && _phoneNo !== undefined && _phoneNo !== "" ){
        upObj["phoneNo"]=_phoneNo;
    }
    if(_workUnit !== null && _workUnit !== undefined && _workUnit !== "" ){
        upObj["workUnit"]=_workUnit;
    }
    if(_department !== null && _department !== undefined && _department !== "" ){
        upObj["department"]=_department;
    }
    if(_workAmounts !== null && _workAmounts !== undefined && _workAmounts !== "" ){
        upObj["workAmounts"]=_workAmounts;
    }
    if(_boardingTime !== null && _boardingTime !== undefined && _boardingTime !== "" ){
        upObj["boardingTime"]=new Date(_boardingTime);
    }
    // console.log(upObj);
    Alluser.updateOne(query,{ $set :upObj},function(err, item1){
        if (err) {
            // console.log(err);
            return res.status(500).send(err.errmsg);
        }
        res.json({status:0,results: item1,msg:"success!"});
    });
}

// function getroles(user,acl){
// 	var userId = user.userId;
// 	var ret;
// 	if(userId){
// 		acl.userRoles(userId, function(err, roles){
// 			if(err){
// 				return res.status(500).send(err.errmsg);  
// 			}
// 			console.log(roles);
// 			ret = roles;
// 			// userlist[i]["roles"]=roles;
// 		});
// 	}
// 	console.log(ret);
// 	return ret;
// }
exports.insertAlluser = function(req, res) {
    var userData = {
        userId: "whoareyou",
        userName: "chi",
        openId: "qwe",
        phoneNo: "135",
        password:"123456",
        photoUrl:"url",
        role:["pt"],
        loginStatus:1,
        lastLogin:new Date(),
        jpush:{
            registrationID:"reg",
            alias:"String",
            tags:["String"]
        },
        revisionInfo:{
            operationTime:new Date(),
            userId:"a123",
            userName:"chi",
            terminalIP:"1234"
        }
    };

    var newAlluser = new Alluser(userData);
    newAlluser.save(function(err, userInfo) {
        if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: userInfo});
    });
}
exports.registerTest = function(acl){
    return function(req, res,next) {
        var _phoneNo = req.query.phoneNo
        var _password = req.query.password
        var _role = req.query.role
        var query = {phoneNo:_phoneNo};
        // var _userNo = req.newId
        Alluser.getOne(query, function(err, item) {
            if (err) {
                return res.status(500).send(err.errmsg);
            }
            if(item!=null){
                var query1 = {phoneNo:_phoneNo,role: _role};
                Alluser.getOne(query1, function(err, item1) {
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }
                    if(item1 != null){
                        res.json({results: 1,userNo:"",mesg:"Alluser Already Exist!"});
                    }
                    else{
                        Alluser.updateOne(query,{ $push: { role: _role } ,$set:{password:_password}},function(err, item2){
                            if (err) {
                                return res.status(500).send(err.errmsg);
                            }
                            var userId = item.userId;
                            var roles = _role;
                            
                            if(userId && roles){
                                acl.addUserRoles(userId, roles, function(err){
                                    if(err){
                                        return res.status(500).send(err.errmsg);  
                                    }
                                    // res.json({results: {status:1,msg:'success'}});
                                    res.json({results: 0,userNo:item.userId,mesg:"Alluser Register Success!"});
                                });
                            }
                            else{
                                return res.status(400).send('empty inputs'); 
                            }
                            // res.json({results: 0,userNo:item.userId,mesg:"Alluser Register Success!"});
                        });
                    }
                });
            }
            else{
                next();
            }
      
        });
    }
}
exports.register = function(acl){
    return function(req, res) {
        var _phoneNo = req.query.phoneNo
        var _password = req.query.password
        var _role = req.query.role
        // var query = {phoneNo:_phoneNo};
        var _userNo = req.newId

        var userData = {
            phoneNo:_phoneNo,
            password:_password,
            role: _role,
            userId:_userNo,
            invalidFlag:0
        };
        var newAlluser = new Alluser(userData);
        newAlluser.save(function(err, Info) {
            if (err) {
                return res.status(500).send(err.errmsg);
            }
            var userId = _userNo;
            var roles = _role;
            
            if(userId && roles){
                acl.addUserRoles(userId, roles, function(err){
                    if(err){
                        return res.status(500).send(err.errmsg);  
                    }
                    // res.json({results: {status:1,msg:'success'}});
                    res.json({results: 0,userNo:_userNo,mesg:"Alluser Register Success!"});
                });
            }
            else{
                return res.status(400).send('empty inputs'); 
            }
            // res.json({results: 0,userNo:_userNo,mesg:"Alluser Register Success!"});
        });
    }
}
// exports.registerWithOpenIdTest = function(req, res,next) {
//     var parser = new xml2js.Parser();
//     var data = {};
//     parser.parseString(req.body,function(err,result){
//         data = result || {};
//     });
//     // var _openId = req.query.openId
//     // var _role = req.query.role
//     var _openId=data.xml.FromAlluserName
//     // var _openId=data.xml.FromAlluserName
//     var query = {openId:_openId};
//     // var _userNo = req.newId
//     Alluser.getOne(query, function(err, item) {
//         if (err) {
//             return res.status(500).send(err.errmsg);
//         }
//         if(item!=null){
//             var query1 = {openId:_openId,role: _role};
//             Alluser.getOne(query1, function(err, item1) {
//                 if (err) {
//                     return res.status(500).send(err.errmsg);
//                 }
//                 if(item1!=null){
//                     res.json({results: 1,userNo:"",mesg:"Alluser Already Exist!"});
//                 }
//                 else{
//                     Alluser.updateOne(query,{ $push: { role: _role } },function(err, item2){
//                         if (err) {
//                             return res.status(500).send(err.errmsg);
//                         }
//                         res.json({results: 0,mesg:"Alluser Register Success!"});
//                     });
//                 }
//             });
//         }
//         else{
//             next();
//         }
  
//     });
// }
// exports.registerWithOpenId = function(req, res) {
//     // var _phoneNo = req.query.phoneNo
//     var _openId = req.query.openId
//     var _password = "123456"
//     var _role = req.query.role
//     var _userNo = req.newId

//     var userData = {
//         openId:_openId,
//         password:_password,
//         role: _role,
//         userId:_userNo
//     };
//     var newAlluser = new Alluser(userData);
//     newAlluser.save(function(err, Info) {
//         if (err) {
//             return res.status(500).send(err.errmsg);
//         }
//         res.json({results: 0,userNo:_userNo,mesg:"Alluser Register Success!"});
//     });
// }
exports.reset = function(req, res) {
    var _phoneNo = req.query.phoneNo
    var _password = req.query.password
    var query = {phoneNo:_phoneNo};
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
        else{
            Alluser.updateOne(query,{ $set: { password: _password } },function(err, item1){
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                res.json({results: 0,mesg:"password reset success!"});
            });
        }
    });
}
exports.setOpenId = function(req, res, next) {
    var _phoneNo = req.body.phoneNo
    var _openId = req.body.openId;
    var query = {phoneNo:_phoneNo};
    if(_openId === undefined || _openId === null || _openId === "" ){
    	return res.status(403).send('unionid不能为空');
    }
    Alluser.updateOne(query,{$set:{openId: _openId}},function(err, item){
        if (err) {
          if(err.code == 11000){
            return res.status(403).send('unionid已存在');
          }
            return res.status(500).send(err.errmsg);
        }
        if(item){
            // console.log(item);
        // res.json({results: item,msg:"success!"});
            req.body.username = _openId;
            next();
        }
        else{
            return res.status(403).send('用户不存在');
        }
        
    });
}
exports.setOpenIdRes = function(req, res){
    res.json({results: "success!"});
}
exports.openIdLoginTest = function(req, res,next) {

    //2017-06-07GY调试
    // console.log('openIdLoginTest_in');

    var username = req.body.username;
    if (username === '' ) {
        return res.status(422).send('请输入用户名!'); 
    }
    // var query = {phoneNo:_phoneNo};
    var query = {
        openId: username
    };
    var openIdFlag=0;
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item!=null){
            openIdFlag=1;
        }
        req.openIdFlag=openIdFlag;

        //2017-06-07GY调试
        // console.log('openIdLoginTest_out');

        next();
    });
}
exports.checkBinding = function(req, res,next) {

    //2017-06-07GY调试
    // console.log('checkBinding_in');

    var username = req.body.username;
    // console.log(username);
    var query = {
        $or: [
            {userId: username},
            {openId: username},
            {phoneNo: username}
        ]
    };
    // console.log(query);

    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item != null){
            if(item.MessageOpenId != null && (item.MessageOpenId.patientWechat != null ||item.MessageOpenId.test != null) ){
                // openId 存在
                var query = {patientOpenId: item.MessageOpenId.patientWechat || item.MessageOpenId.test};
                // console.log(query);
                OpenIdTmp.getOne(query, function(err, item1) {
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }
                    // console.log({item1:item1});
                    // if(item1 != null && item1.doctorAlluserId != null){
                    if(item1 != null){
                        // console.log(1111);

                        // binding doctor
                        var jsondata = {
                            patientId: item.userId,
                            doctorId: item1.doctorAlluserId,
                            dpRelationTime: Date()
                        };
                        // console.log(jsondata);
                        request({
                          url: 'http://' + webEntry.domain + ':4060/api/v1/patient/bindingMyDoctor' + '?token=' + req.query.token || req.body.token,
                          method: 'POST',
                          body: jsondata,
                          json: true
                        }, function (err, response, body) {
                            if (err) {
                                return res.status(500).send(err.errmsg);
                            }
                            // 绑定成功后 删除OpenIdTmp表中的数据  
                            // console.log({query1:query});                          
                            OpenIdTmp.remove(query,function(err){
                                if (err) {
                                    return res.status(500).send(err.errmsg);
                                }

                                //2017-06-07GY调试
                                // console.log('checkBinding_out');

                                next();
                            })
                                  
                        });
                    }
                    else{
                        // console.log("No OpenIdTmp");
                        // if(item1.doctorAlluserId == null){
                        //     console.log(11112222);
                        //      OpenIdTmp.remove(query,function(err){
                        //         if (err) {
                        //             return res.status(500).send(err.errmsg);
                        //         }
                            
                        //         next();
                        //     });
                        // }
                        // else{
                        //     next();
                        // }

                        //2017-06-07GY调试
                        // console.log('checkBinding_out22');

                        next();
                      
                    }
                });
            }
            else{

                //2017-06-07GY调试
                // console.log('checkBinding_out');

                next();
            }
        }
        else{

            //2017-06-07GY调试
            // console.log('checkBinding_err_user_not_exist');

            res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
  
    });
}
exports.login = function(req, res) {

    //2017-06-07GY调试
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    if (username === '' || password === '') {
        return res.status(422).send('请输入用户名和密码!'); 
    }
    // var query = {phoneNo:_phoneNo};
    var query = {
        $or: [
            {phoneNo: username},
            {openId: username}
        ]
    };
    var openIdFlag=req.openIdFlag;
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){

            //2017-06-07GY调试
            // console.log('login_err_user_not_exist');

            res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
        else{

            if(password!=item.password&&openIdFlag==0){

                //2017-06-07GY调试
                // console.log('login_err_password_not_correct');

                res.json({results: 1,mesg:"Alluser password isn't correct!"});
            }
            else if(item.role.indexOf(role) == -1)
            {

                //2017-06-07GY调试
                // console.log('login_err_no_authority');

                res.json({results: 1,mesg:"No authority!"});
            }
            else
            {
                var _lastlogindate=item.lastLogin
                // console.log(Date())
                Alluser.updateOne(query,{ $set: { loginStatus: 0 ,lastLogin:Date()} },function(err, user){
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }

                    // csq 返回token信息
                    //console.log(user);
                    userPayload = {
                        _id: user._id,
                        userId: user.userId,
                        role:role,
                        exp: Date.now() + config.TOKEN_EXPIRATION * 1000
                    };
                    //  console.log(Date.now());
                    // console.log( Date.now() + 60 * 3 * 1000);
                    var token = jwt.sign(userPayload, config.tokenSecret, {algorithm:'HS256'},{expiresIn: config.TOKEN_EXPIRATION}); 
                    
                    var sha1 = crypto.createHash('sha1');
                    var refreshToken = sha1.update(token).digest('hex');
                    
                    // JSON.stringify(userPayload),
                    var refreshtokenData = {
                        refreshtoken: refreshToken,
                        userPayload: JSON.stringify(userPayload)
                    };
                    // console.log(refreshtokenData);

                    var newRefreshtoken = new Refreshtoken(refreshtokenData);
                    newRefreshtoken.save(function(err, Info) {
                        if (err) {
                            return res.status(500).send(err.errmsg);
                        }
                        var results = {
                            status: 0,
                            userId: item.userId,
                            userName: item.userName || '',
                            lastlogin: _lastlogindate,
                            PhotoUrl: item.photoUrl,
                            mesg: "login success!",
                            token: token,
                            refreshToken: refreshToken
                        };

                        //2017-06-07GY调试
                        console.log('login_success');

                        res.json({results: results});
                    });
                    
                });
            }
        }
    });
}

exports.logout = function(req, res) {
    var _userId = req.query.userId
    var query = {userId:_userId};
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
        else{
            Alluser.updateOne(query,{ $set: { loginStatus: 1} },function(err, item1){
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                res.json({results: 0,mesg:"logout success!"});
            });

        }
    });
}
exports.getAlluserID = function(req, res) {
    var username = req.query.username || null;
    if(username == null || username == ''){
        return res.status(400).send('invalid input');
    }
    // console.log(username);
    var query = {
        $or: [
            {phoneNo: username},
            {openId: username},
            {userId: username}
        ]
    };
    // console.log(query);
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item == null){
            res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
        else{
            console.log(item);
            res.json({results: 0, AlluserId: item.userId, phoneNo: item.phoneNo, roles: item.role, openId: item.openId, mesg:"Get AlluserId Success!"});

        }
    });
}

exports.sendSMS = function(req, res) {
    var now = new Date()
    var _mobile = req.query.mobile;
    var _smsType = Number(req.query.smsType);
    // var token = "849407bfab0cf4c1a998d3d6088d957b";
    // var accountSid = "b839794e66174938828d1b8ea9c58412";
    // var appId = "38b50013289b417f9ce474c8210aebcf";
    // var tplId = "40860";
    // var appId1 = "14ea1d5fc41b4346ac70083c377c5dd7";
    // var tplId1 = "43987";
    var token = "86cf8733b80a31fd7deb7b3147a226d0";
    var accountSid = "43b82098fcec135770091f446f6b7367";
    var appId = "af8afab59dd04001a4b5b37bcc419ec3";
    var tplId = "51064";
    var appId1 = "a4aab03e083c46b29dd539ec63a52b24";
    var tplId1 = "51041";
    if(_smsType==2)
    {
        tplId=tplId1;
        appId=appId1;
    }
    var Jsonstring1 = "templateSMS";
    var Jsonstring2 = "appId";
    var Jsonstring3 = "param";
    var Jsonstring4 = "templateId";
    var Jsonstring5 = "to";
    var J6 = "{";


    var rand = Math.random();
    var min = 100000;
    var max = 1000000;
    var _randNum =Math.floor(min+(max-min)*rand);
    var param = _randNum + "," + 1;
    var JSONData = J6 + '"' + Jsonstring1 + '"' + ':' + '{' + '"' + Jsonstring2 + '"' + ':' + '"' + appId + '"' + ',' + '"' + Jsonstring3 + '"' + ':' + '"' + param + '"' + ',' + '"' + Jsonstring4 + '"' + ':' + '"' + tplId + '"' + ',' + '"' + Jsonstring5 + '"' + ':' + '"' + _mobile + '"' + '}' + '}';
    //delete all expired smss

    var query={"Expire":{"$lte":now.getTime()}}
    Sms.remove(query, function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        // res.json({results: 0});
            //query by _mobile and _smsType
        if (_mobile != null && _mobile != "" && _mobile != undefined && _smsType != null && _smsType != "" && _smsType != undefined){
            var query1 = {mobile:_mobile,smsType:_smsType};
            Sms.getOne(query1, function(err, item) {
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                if(item==null){
                    //not exist
                    // var _expire=60*3
                    var _expire=60
                    //insert a sms
                    var smsData = {
                        mobile: _mobile,
                        smsType: _smsType,
                        randNum: _randNum,
                        Expire: _expire*1000+now.getTime(),
                        insertTime: now
                    };
                    var newSms = new Sms(smsData);
                    newSms.save(function(err, Info){
                        if (err) {
                            return res.status(500).send(err.errmsg);
                        }
                        // res.json({results: Info});
                        var timestamp=now.getFullYear()+commonFunc.paddNum(now.getMonth()+1)+commonFunc.paddNum(now.getDate())+now.getHours()+now.getMinutes()+now.getSeconds()
                        var md5=crypto.createHash('md5').update(accountSid + token + timestamp).digest('hex').toUpperCase();
                        //byte[] bytedata = encode.GetBytes(accountSid + ":" + timestamp);
                        var authorization = Base64.encode(accountSid + ":" + timestamp);
                        // console.log(md5)
                        // console.log(authorization)
                        var bytes=commonFunc.stringToBytes(JSONData)
                        var Url = "https://api.ucpaas.com/2014-06-30/Accounts/" + accountSid + "/Messages/templateSMS?sig=" + md5;
                        // console.log(Url);
                        var options={
                            hostname:"api.ucpaas.com",
                            // port:80,
                            path:"/2014-06-30/Accounts/"+ accountSid + "/Messages/templateSMS?sig=" + md5,
                            method:"POST",
                            headers:{
                                "Accept":"application/json",
                                // "Accept-Encoding":"gzip, deflate",
                                // "Accept-Language":"zh-CN,zh;q=0.8",
                                // "Connection":"keep-alive",
                                "Content-Length":bytes.length,
                                "Content-Type":"application/json;charset=utf-8",
                                // "Cookie":"imooc_uuid=6cc9e8d5-424a-4861-9f7d-9cbcfbe4c6ae; imooc_isnew_ct=1460873157; loginstate=1; apsid=IzZDJiMGU0OTMyNTE0ZGFhZDAzZDNhZTAyZDg2ZmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjkyOTk0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGNmNmFhMmVhMTYwNzRmMjczNjdmZWUyNDg1ZTZkMGM1BwhXVwcIV1c%3DMD; PHPSESSID=thh4bfrl1t7qre9tr56m32tbv0; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1467635471,1467653719,1467654690,1467654957; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1467655022; imooc_isnew=2; cvde=577a9e57ce250-34",
                                // "Host":"www.imooc.com",
                                // "Origin":"http://www.imooc.com",
                                // "Referer":"http://www.imooc.com/video/8837",
                                // "Alluser-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2763.0 Safari/537.36",
                                // "X-Requested-With":"XMLHttpRequest",
                                "Authorization": authorization
                            }
                        }
                        var code=1;
                        var requests=https.request(options,function(response){
                            var resdata="";
                            response.on("data",function(chunk){
                                resdata += chunk;
                                // console.log(chunk);
                            });
                            response.on("end",function(){
                                // console.log("### end ##");
                                var json = eval('(' + resdata + ')');
                                code=json.resp.respCode;
								if(code==="000000"){
                            		res.json({results: 0,mesg:"Alluser doesn't Exist!"});
                        		}
                        		else{
                            		res.json({results: 2,ErrorCode: code});
                        		}
                                // console.log(json.resp.respCode);
                            });
                            // console.log(res.statusCode);
                            
                        });

                        requests.on("error",function(err){
                            // console.log(err.message);
                        })
                        requests.write(JSONData);
                        requests.end();
                        
                    });

                    // res.json({results: 0,mesg:"Alluser doesn't Exist!"});
                }
                else{
                    var ttl=(item.Expire-now.getTime())/1000
                    //sms exist
                    res.json({results: 0,mesg:"您的邀请码已发送，请等待"+Math.floor(ttl)+ "s后重新获取"});
                }
            });
        }
        else{
            res.json({results: 1,mesg:"mobile and smsType input Error!"});
        }
    });
}

exports.verifySMS = function(req, res) {
    var now = new Date()
    var _mobile = req.query.mobile;
    var _smsType = req.query.smsType;
    var _smsCode = req.query.smsCode;


    var query={"Expire":{"$gte":now.getTime()},"mobile":_mobile,"smsType":_smsType}
    Sms.getOne(query, function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        // res.json({results: 0});
            //query by _mobile and _smsType
        if (item != null ){
            if(item.randNum==_smsCode){
                res.json({results: 0,mesg:"验证码正确!"});
            }
            else{
                res.json({results: 1,mesg:"验证码错误"});
            }
        }
        else{
            res.json({results: 2,mesg:"没有验证码或验证码已过期!"});
        }
    });
}

// var commonFunc = require('../middlewares/commonFunc');
// exports.getIp = function(req, res) {
//     var _ip = commonFunc.getClientIp(req)
//     res.json({results: 0,Ip:_ip});
// }

//根据角色获取电话号码 2017-04-25 GY
exports.getPhoneNoByRole = function(req, res) {
    if (req.query.role == null || req.query.role == ''){
        return res.json({result: '请输入role!'});
    }
    else if (req.query.role != 'doctor' && req.query.role != 'patient') {
        return res.json({result: '不合法的role!'});
    }

    var query = {role:req.query.role};
    var fields = {userId:1, userName:1, phoneNo:1, _id:0}

    Alluser.getSome(query, function(err, items) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(items==null){
            // res.json({results: 1,mesg:"Alluser doesn't Exist!"});
        }
        else{
            // var phoneNos = [];
            // for (var i = items.length - 1; i >= 0; i--) {
            //     phoneNos[i] = items[i].phoneNo
            // }
            // res.json({results: phoneNos});
            res.json({results: items})
        }
    }, '', fields);
}

exports.setTDCticket = function(req,res){
    var TDCticket = req.results.ticket;
    var TDCurl = req.results.url;
    var userId = req.body.userId;

    var query = {userId: userId};
    Alluser.updateOne(query,{$set:{TDCticket: TDCticket,TDCurl: TDCurl}},function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: {TDCticket: TDCticket, TDCurl: TDCurl}});
    });
}

exports.setMessageOpenId = function(req,res){
    var _type = req.body.type;
    var _openId =req.body.openId;
    var userId = req.body.userId;
    if(_type===""||_type==undefined)
    {
        return res.json({result:1,msg:"plz input type"});
    }
    if(_openId === undefined || _openId === null || _openId === "" ){
    	return res.status(403).send('openId不能为空');
    }
    var query = {userId: userId};

    var _mesgOid=req.user.MessageOpenId;

    if(_type==1){
        var upObj = {
            $set: {
                MessageOpenId: {
                    doctorWechat:_openId

                }
            }
        };
        if(_mesgOid!=null&&_mesgOid!=undefined){

            var upObj = {
                $set: {
                    MessageOpenId: {
                        doctorWechat:_openId,
                        patientWechat:_mesgOid.patientWechat,
                        doctorApp:_mesgOid.doctorApp,
                        patientApp:_mesgOid.patientApp,
                        test:_mesgOid.test
                    }
                }
            };
        }

    }
    if(_type==2){
        var upObj = {
            $set: {
                MessageOpenId: {

                    patientWechat:_openId
                }
            }
        };
        if(_mesgOid!=null&&_mesgOid!=undefined){

            var upObj = {
                $set: {
                    MessageOpenId: {
                        doctorWechat:_mesgOid.doctorWechat,
                        patientWechat:_openId,
                        doctorApp:_mesgOid.doctorApp,
                        patientApp:_mesgOid.patientApp,
                        test:_mesgOid.test
                    }
                }
            };
        }

    }
    if(_type==3){
        var upObj = {
            $set: {
                MessageOpenId: {

                    doctorApp:_openId
                }
            }
        };
        if(_mesgOid!=null&&_mesgOid!=undefined){
            var upObj = {
                $set: {
                    MessageOpenId: {
                        doctorWechat:_mesgOid.doctorWechat,
                        patientWechat:_mesgOid.patientWechat,
                        doctorApp:_openId,
                        patientApp:_mesgOid.patientApp,
                        test:_mesgOid.test
                    }
                }
            };
        }

    }
    if(_type==4){
        var upObj = {
            $set: {
                MessageOpenId: {
                    patientApp:_openId
                }
            }
        };

        if(_mesgOid!=null&&_mesgOid!=undefined){
        	var upObj = {
	            $set: {
	                MessageOpenId: {
	                    doctorWechat:_mesgOid.doctorWechat,
						patientWechat:_mesgOid.patientWechat,
						doctorApp:_mesgOid.doctorApp,
						patientApp:_openId,
						test:_mesgOid.test
	                }
	            }
	        };
        }

    }
    if(_type==5){
        var upObj = {
            $set: {
                MessageOpenId: {
                    test:_openId
                }
            }
        };


        if(_mesgOid!=null&&_mesgOid!=undefined){
        	var upObj = {
	            $set: {
	                MessageOpenId: {
	                    doctorWechat:_mesgOid.doctorWechat,
						patientWechat:_mesgOid.patientWechat,
						doctorApp:_mesgOid.doctorApp,
						patientApp:_mesgOid.patientApp,
						test:_openId
	                }
	            }
	        };
        }


    }
    Alluser.updateOne(query,upObj,function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results:0,resultitem: item});
    }, {new: true});
}

exports.getMessageOpenId = function(req,res){
    var _type = req.query.type;
    var userId = req.query.userId;
    if(_type===""||_type==undefined)
    {
        return res.json({result:1,msg:"plz input type"});
    }
    var query = {userId: userId};

    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(_type==1){
            res.json({results: item.MessageOpenId.doctorWechat});
        }
        else if(_type==2){
            res.json({results: item.MessageOpenId.patientWechat});
        }
        else if(_type==3){
            res.json({results: item.MessageOpenId.doctorApp});
        }
        else if(_type==4){
            res.json({results: item.MessageOpenId.patientApp});
        }
        else if(_type==5){
            res.json({results: item.MessageOpenId.test});
        }
        else{
            res.json({results: "type must be 1-4"});
        }
    });

}
exports.checkAlluser = function(req, res, next) {
    if (req.query.userId === null || req.query.userId == ''|| req.query.userId == undefined) {
        if (req.body.userId === null || req.body.userId == ''|| req.body.userId == undefined) {
            return res.json({result: '请填写userId!'});
        }
        else {
            req.userId = req.body.userId;
        }
    }
    else {
        req.userId = req.query.userId;
    }
    var query = {userId: req.userId};
    Alluser.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if (item == null) {
            return res.json({result: '不存在的用户ID',userId:req.userId});
        }
        else {

        	req.user=item;
            next();
        }
    });
}
