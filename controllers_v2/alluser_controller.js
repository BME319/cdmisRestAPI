var config = require('../config')
var Alluser = require('../models/alluser')
var DpRelation = require('../models/dpRelation')
var DoctorsInCharge = require('../models/doctorsInCharge')
var OpenIdTmp = require('../models/openId')
// var DictNumber = require('../models/dictNumber')
// var Numbering = require('../models/numbering')
var Refreshtoken = require('../models/refreshtoken')
var Sms = require('../models/sms')
var crypto = require('crypto')
var https = require('https')
var querystring = require('querystring')
// var xml2js = require('xml2js')
var webEntry = require('../settings').webEntry
var request = require('request')
var jwt = require('jsonwebtoken')
// var Patient = require('../models/patient')
var commonFunc = require('../middlewares/commonFunc')
var Errorlog = require('../models/errorlog')

var alluserCtrl = require('../controllers_v2/alluser_controller')
var wechatCtrl = require('../controllers_v2/wechat_controller')

// var Base64 = {
//     // 转码表
//   table: [
//     'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
//     'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
//     'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
//     'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
//     'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
//     'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
//     'w', 'x', 'y', 'z', '0', '1', '2', '3',
//     '4', '5', '6', '7', '8', '9', '+', '/'
//   ],
//   UTF16ToUTF8: function (str) {
//     var res = []
//     var len = str.length
//     for (var i = 0; i < len; i++) {
//       var code = str.charCodeAt(i)
//       var byte1
//       var byte2
//       if (code > 0x0000 && code <= 0x007F) {
//                 // 单字节，这里并不考虑0x0000，因为它是空字节
//                 // U+00000000 – U+0000007F  0xxxxxxx
//         res.push(str.charAt(i))
//       } else if (code >= 0x0080 && code <= 0x07FF) {
//                 // 双字节
//                 // U+00000080 – U+000007FF  110xxxxx 10xxxxxx
//                 // 110xxxxx
//         byte1 = 0xC0 | ((code >> 6) & 0x1F)
//                 // 10xxxxxx
//         byte2 = 0x80 | (code & 0x3F)
//         res.push(
//                     String.fromCharCode(byte1),
//                     String.fromCharCode(byte2)
//                 )
//       } else if (code >= 0x0800 && code <= 0xFFFF) {
//                 // 三字节
//                 // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx
//                 // 1110xxxx
//         byte1 = 0xE0 | ((code >> 12) & 0x0F)
//                 // 10xxxxxx
//         byte2 = 0x80 | ((code >> 6) & 0x3F)
//                 // 10xxxxxx
//         var byte3 = 0x80 | (code & 0x3F)
//         res.push(
//                     String.fromCharCode(byte1),
//                     String.fromCharCode(byte2),
//                     String.fromCharCode(byte3)
//                 )
//       } else if (code >= 0x00010000 && code <= 0x001FFFFF) {
//                 // 四字节
//                 // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
//       } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
//                 // 五字节
//                 // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
//       } else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF) */ {
//                 // 六字节
//                 // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
//       }
//     }

//     return res.join('')
//   },
//   UTF8ToUTF16: function (str) {
//     var res = []
//     var len = str.length
//     var i = 0
//     for (i = 0; i < len; i++) {
//       var code = str.charCodeAt(i)
//       var code2
//       var code3
//       var byte1
//       var byte2
//       var utf16
//             // 对第一个字节进行判断
//       if (((code >> 7) & 0xFF) === 0x0) {
//                 // 单字节
//                 // 0xxxxxxx
//         res.push(str.charAt(i))
//       } else if (((code >> 5) & 0xFF) === 0x6) {
//                 // 双字节
//                 // 110xxxxx 10xxxxxx
//         code2 = str.charCodeAt(++i)
//         byte1 = (code & 0x1F) << 6
//         byte2 = code2 & 0x3F
//         utf16 = byte1 | byte2
//         res.push(String.fromCharCode(utf16))
//       } else if (((code >> 4) & 0xFF) === 0xE) {
//                 // 三字节
//                 // 1110xxxx 10xxxxxx 10xxxxxx
//         code2 = str.charCodeAt(++i)
//         code3 = str.charCodeAt(++i)
//         byte1 = (code << 4) | ((code2 >> 2) & 0x0F)
//         byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F)
//         utf16 = ((byte1 & 0x00FF) << 8) | byte2
//         res.push(String.fromCharCode(utf16))
//       } else if (((code >> 3) & 0xFF) === 0x1E) {
//                 // 四字节
//                 // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
//       } else if (((code >> 2) & 0xFF) === 0x3E) {
//                 // 五字节
//                 // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
//       } else /** if (((code >> 1) & 0xFF) === 0x7E) */ {
//                 // 六字节
//                 // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
//       }
//     }

//     return res.join('')
//   },
//   encode: function (str) {
//     if (!str) {
//       return ''
//     }
//     var utf8 = this.UTF16ToUTF8(str) // 转成UTF8
//     var i = 0 // 遍历索引
//     var len = utf8.length
//     var res = []
//     while (i < len) {
//       var c1 = utf8.charCodeAt(i++) & 0xFF
//       res.push(this.table[c1 >> 2])
//             // 需要补2个=
//       if (i === len) {
//         res.push(this.table[(c1 & 0x3) << 4])
//         res.push('==')
//         break
//       }
//       var c2 = utf8.charCodeAt(i++)
//             // 需要补1个=
//       if (i === len) {
//         res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)])
//         res.push(this.table[(c2 & 0x0F) << 2])
//         res.push('=')
//         break
//       }
//       var c3 = utf8.charCodeAt(i++)
//       res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)])
//       res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)])
//       res.push(this.table[c3 & 0x3F])
//     }

//     return res.join('')
//   },
//   decode: function (str) {
//     if (!str) {
//       return ''
//     }

//     var len = str.length
//     var i = 0
//     var res = []
//     var code1
//     var code2
//     var code3
//     var code4
//     var c1
//     var c2
//     var c3

//     while (i < len) {
//       code1 = this.table.indexOf(str.charAt(i++))
//       code2 = this.table.indexOf(str.charAt(i++))
//       code3 = this.table.indexOf(str.charAt(i++))
//       code4 = this.table.indexOf(str.charAt(i++))

//       c1 = (code1 << 2) | (code2 >> 4)
//       c2 = ((code2 & 0xF) << 4) | (code3 >> 2)
//       c3 = ((code3 & 0x3) << 6) | code4

//       res.push(String.fromCharCode(c1))

//       if (code3 !== 64) {
//         res.push(String.fromCharCode(c2))
//       }
//       if (code4 !== 64) {
//         res.push(String.fromCharCode(c3))
//       }
//     }

//     return this.UTF8ToUTF16(res.join(''))
//   }
// }
// function evil (fn) {
//   var Fn = Function
//   // 一个变量指向Function，防止有些前端编译工具报错
//   return new Fn('return ' + fn)()
// }
// exports.getAlluser = function (req, res) {
//     // var _userId = req.query.userId
//     // var query = {userId:_userId};
//   var username = req.query.username
//   if (username === '' || username === null) {
//         // return res.status(422).send('username字段请输入AlluserId或openId或手机号!');
//     return res.status(422).send('username字段请输入openId!')
//   }
//     // var query = {openId:username};
//   var query = {
//     $or: [
//             {userId: username},
//             {openId: username},
//             {phoneNo: username}
//     ]
//   }
//   Alluser.getOne(query, function (err, item) {
//     if (err) {
//       return res.status(500).send(err.errmsg)
//     }
//     res.json({results: item})
//   })
// }

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

exports.getAlluserAgreement = function (req, res) {
  var _userId = req.query.userId
  var query = {userId: _userId}
  var opts = ''
  var fields = {}
  var _role = req.query.role
  if (_role === 'patient') {
    fields = {'agreementPat': 1}
  } else if (_role === 'doctor') {
    fields = {'agreementDoc': 1}
  }
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  }, opts, fields)
}
exports.updateAlluserAgreement = function (req, res) {
  var _userId = req.body.userId
  var _agreement = req.body.agreement
  var query = {userId: _userId}
  var _role = req.body.role
  var upObj = {}
  if (_role === 'patient') {
    upObj = {$set: {agreementPat: _agreement}}
  } else if (_role === 'doctor') {
    upObj = {$set: {agreementDoc: _agreement}}
  }
  Alluser.updateOne(query, upObj, function (err, item1) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item1, msg: 'success!'})
  })
}
// WF 20170626
function changeAlluserInvalidFlag (req, res, invalidFlag) {
  var _userId = req.body.userId
  var _invalidFlag = invalidFlag
  var query = {userId: _userId}
  Alluser.updateOne(query, {$set: {invalidFlag: _invalidFlag}}, function (err, item1) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item1, msg: 'success!'})
  })
}
exports.cancelAlluser = function (req, res) {
  changeAlluserInvalidFlag(req, res, 1)
}
exports.getAlluserList = function (role) {
    // console.log(1);
  return function (req, res) {
    var query = {'invalidFlag': 0}
    var fields = {'_id': 1}//, 'revisionInfo':0
    var populate = {'path': ''}

    var limit = Number(req.query.limit)
    var skip = Number(req.query.skip)
    // var opts = {limit: limit, skip: skip, sort: '_id'}
    // 排序规则 GY 2017-11-20
    var opts = {limit: limit, skip: skip}
    let sortTime = req.query.sortTime || null
    if (sortTime === 'true') {
      opts['sort'] = 'creationTime'
    } else if (sortTime === 'false') {
      opts['sort'] = '-creationTime'
    } else {
      opts['sort'] = '_id'
    }
    
    var _uid = req.query.userId
    var _role = role
    var _r = req.query.role
    var _name = req.query.name
    var _phoneNo = req.query.phoneNo
    var _gender = req.query.gender
    var _class = req.query.class
    var _province = req.query.province
    var _city = req.query.city
  // var _district = req.query.district
    var _workUnit = req.query.workUnit
    var _title = req.query.title
        // role 0-user 1-doctor 2-patient 3-nurse 4-insurance 5-health 6-admin
    if (_uid !== null && _uid !== undefined && _uid !== '') {
      query['userId'] = { $regex: _uid }
    }
    if (_name !== null && _name !== undefined && _name !== '') {
      query['name'] = { $regex: _name }
    }
    if (_phoneNo !== null && _phoneNo !== undefined && _phoneNo !== '') {
      query['phoneNo'] = { $regex: _phoneNo }
    }
    if (_gender !== null && _gender !== undefined && _gender !== '') {
      query['gender'] = _gender
    }
    fields['userId'] = 1
    fields['name'] = 1
    fields['gender'] = 1
    fields['phoneNo'] = 1
    if (_role === 0) {
      fields['role'] = 1
      if (_r !== null && _r !== undefined && _r !== '') {
        query['role'] = _r
      }
    }
    if (_role === 1) {
      if (_r !== null && _r !== undefined && _r !== '') {
        query['role'] = _r
      } else {
        query['$or'] = [{'role': 'doctor'}, {'role': 'Leader'}, {'role': 'master'}]
      }
      if (_province !== null && _province !== undefined && _province !== '') {
        query['province'] = { $regex: _province }
      }
      if (_city !== null && _city !== undefined && _city !== '') {
        query['city'] = { $regex: _city }
      }
      if (_workUnit !== null && _workUnit !== undefined && _workUnit !== '') {
        query['workUnit'] = { $regex: _workUnit }
      }
      if (_title !== null && _title !== undefined && _title !== '') {
        query['title'] = { $regex: _title }
      }
      fields['role'] = 1
      fields['workUnit'] = 1
      fields['department'] = 1
      fields['title'] = 1
      fields['count1'] = 1
      fields['count2'] = 1
      fields['score'] = 1
      fields['description'] = 1
      fields['major'] = 1
    }
    if (_role === 2) {
      if (_class !== null && _class !== undefined && _class !== '') {
        query['class'] = _class
      }
      query['role'] = 'patient'
      fields['VIP'] = 1
      fields['IDNo'] = 1
      fields['class'] = 1
      fields['hypertension'] = 1
      fields['bloodType'] = 1
      fields['height'] = 1
      fields['weight'] = 1
      fields['class_info'] = 1
      fields['birthday'] = 1
      fields['allergic'] = 1
      fields['creationTime'] = 1

      fields['doctorInCharge'] = 1
      populate['path'] = 'doctorInCharge'
      populate['select'] = {
        userId: 1, name: 1, phoneNo: 1
      }
    }
    if (_role === 3) {
      if (_province !== null && _province !== undefined && _province !== '') {
        query['province'] = { $regex: _province }
      }
      if (_city !== null && _city !== undefined && _city !== '') {
        query['city'] = { $regex: _city }
      }
      if (_workUnit !== null && _workUnit !== undefined && _workUnit !== '') {
        query['workUnit'] = { $regex: _workUnit }
      }
      query['role'] = 'nurse'
      fields['workUnit'] = 1
      fields['department'] = 1
      fields['workAmounts'] = 1
    }
    if (_role === 4) {
      if (_r !== null && _r !== undefined && _r !== '') {
        query['role'] = _r
      } else {
        query['$or'] = [{'role': 'insuranceA'}, {'role': 'insuranceR'}, {'role': 'insuranceC'}]
      }
      fields['boardingTime'] = 1
      fields['role'] = 1
      fields['workAmounts'] = 1
    }
    if (_role === 5) {
      query['role'] = 'health'
      fields['boardingTime'] = 1
      fields['workAmounts'] = 1
    }
    if (_role === 6) {
      query['role'] = 'admin'
      fields['workUnit'] = 1
      fields['creationTime'] = 1
    }
        // 通过子表查询主表，定义主表查询路径及输出内容
        // var populate = {path: 'patients.patientId', select: {'_id':0, 'revisionInfo':0}};
    // console.log(query)
    // console.log(populate)
    Alluser.getSome(query, function (err, userlist) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      res.json({results: userlist})
    }, opts, fields, populate)
  }
}
exports.countAlluserList = function (req, res) {
  var query = {'invalidFlag': 0}

  var _uid = req.query.userId
  var _role = req.query.role1
  var _name = req.query.name
  var _phoneNo = req.query.phoneNo
  var _gender = req.query.gender

  var _r = req.query.role2
  var _class = req.query.class
  var _province = req.query.province
  var _city = req.query.city
  // var _district = req.query.district
  var _workUnit = req.query.workUnit
  var _title = req.query.title
        // role 0-user 1-doctor 2-patient 3-nurse 4-insurance 5-health 6-admin
  if (_role !== null && _role !== undefined && _role !== '') {
    _role = Number(_role)
  }
  if (_uid !== null && _uid !== undefined && _uid !== '') {
    query['userId'] = { $regex: _uid }
  }
  if (_name !== null && _name !== undefined && _name !== '') {
    query['name'] = { $regex: _name }
  }
  if (_phoneNo !== null && _phoneNo !== undefined && _phoneNo !== '') {
    query['phoneNo'] = { $regex: _phoneNo }
  }
  if (_gender !== null && _gender !== undefined && _gender !== '') {
    query['gender'] = _gender
  }

  if (_role === 0) {
    if (_r !== null && _r !== undefined && _r !== '') {
      query['role'] = _r
    }
  }
  if (_role === 1) {
    if (_r !== null && _r !== undefined && _r !== '') {
      query['role'] = _r
    } else {
      query['$or'] = [{'role': 'doctor'}, {'role': 'Leader'}, {'role': 'master'}]
    }
    if (_province !== null && _province !== undefined && _province !== '') {
      query['province'] = { $regex: _province }
    }
    if (_city !== null && _city !== undefined && _city !== '') {
      query['city'] = { $regex: _city }
    }
    if (_workUnit !== null && _workUnit !== undefined && _workUnit !== '') {
      query['workUnit'] = { $regex: _workUnit }
    }
    if (_title !== null && _title !== undefined && _title !== '') {
      query['title'] = { $regex: _title }
    }
  }
  if (_role === 2) {
    if (_class !== null && _class !== undefined && _class !== '') {
      query['class'] = _class
    }
    query['role'] = 'patient'
  }
  if (_role === 3) {
    if (_province !== null && _province !== undefined && _province !== '') {
      query['province'] = { $regex: _province }
    }
    if (_city !== null && _city !== undefined && _city !== '') {
      query['city'] = { $regex: _city }
    }
    if (_workUnit !== null && _workUnit !== undefined && _workUnit !== '') {
      query['workUnit'] = { $regex: _workUnit }
    }
    query['role'] = 'nurse'
  }
  if (_role === 4) {
    if (_r !== null && _r !== undefined && _r !== '') {
      query['role'] = _r
    } else {
      query['$or'] = [{'role': 'insuranceA'}, {'role': 'insuranceR'}, {'role': 'insuranceC'}]
    }
  }
  if (_role === 5) {
    query['role'] = 'health'
  }
  if (_role === 6) {
    query['role'] = 'admin'
  }
        // 通过子表查询主表，定义主表查询路径及输出内容
        // var populate = {path: 'patients.patientId', select: {'_id':0, 'revisionInfo':0}};
  // console.log(query)
  Alluser.countSome(query, function (err, userlist) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: userlist})
  })
}
exports.updateAlluserList = function (req, res) {
  var _userId = req.body.userId
  var _name = req.body.name
  // var _birthday = req.body.birthday// Date
  var _gender = req.body.gender// Number
  // var _IDNo = req.body.IDNo
  var _phoneNo = req.body.phoneNo
  // var _photoUrl = req.body.photoUrl
  // var _province = req.body.province
  // var _city = req.body.city
  // var _district = req.body.district
  var _workUnit = req.body.workUnit
  // var _title = req.body.title
  // var _job = req.body.job
  var _department = req.body.department
  // var _major = req.body.major
  // var _description = req.body.description
  // var _height = req.body.height
  // var _weight = req.body.weight
  // var _occupation = req.body.occupation
  // var _bloodType = req.body.bloodType// Number
  // var _address = req.body.address
  // var _class = req.body.class
  // var _class_info = req.body.class_info
  var _workAmounts = req.body.workAmounts
  var _boardingTime = req.body.boardingTime
  var _creationTime = req.body.creationTime

  var query = {userId: _userId}
  var upObj = {}
  if (_name !== null && _name !== undefined && _name !== '') {
    upObj['name'] = _name
  }
  if (_gender !== null && _gender !== undefined && _gender !== '') {
    if (_gender === 1 || _gender === 2 || _gender === '1' || _gender === '2') {
      upObj['gender'] = Number(_gender)
    } else {
      return res.json({status: 1, results: 'gender must be 1(male) or 2(female)!'})
    }
  }
  if (_phoneNo !== null && _phoneNo !== undefined && _phoneNo !== '') {
    upObj['phoneNo'] = _phoneNo
  }
  if (_workUnit !== null && _workUnit !== undefined && _workUnit !== '') {
    upObj['workUnit'] = _workUnit
  }
  if (_department !== null && _department !== undefined && _department !== '') {
    upObj['department'] = _department
  }
  if (_workAmounts !== null && _workAmounts !== undefined && _workAmounts !== '') {
    upObj['workAmounts'] = _workAmounts
  }
  if (_boardingTime !== null && _boardingTime !== undefined && _boardingTime !== '') {
    upObj['boardingTime'] = new Date(_boardingTime)
  }
  if (_creationTime !== null && _creationTime !== undefined && _creationTime !== '') {
    upObj['creationTime'] = new Date(_creationTime)
  }
    // console.log(upObj);
  Alluser.updateOne(query, {$set: upObj}, function (err, item1) {
    if (err) {
            // console.log(err);
      return res.status(500).send(err.errmsg)
    }
    res.json({status: 0, results: item1, msg: 'success!'})
  })
}

// function getroles(user,acl){
//  var userId = user.userId;
//  var ret;
//  if(userId){
//      acl.userRoles(userId, function(err, roles){
//          if(err){
//              return res.status(500).send(err.errmsg);
//          }
//          console.log(roles);
//          ret = roles;
//          // userlist[i]["roles"]=roles;
//      });
//  }
//  console.log(ret);
//  return ret;
// }

// exports.insertAlluser = function (req, res) {
//   var userData = {
//     userId: 'whoareyou',
//     userName: 'chi',
//     openId: 'qwe',
//     phoneNo: '135',
//     password: '123456',
//     photoUrl: 'url',
//     role: ['pt'],
//     loginStatus: 1,
//     lastLogin: new Date(),
//     jpush: {
//       registrationID: 'reg',
//       alias: 'String',
//       tags: ['String']
//     },
//     revisionInfo: {
//       operationTime: new Date(),
//       userId: 'a123',
//       userName: 'chi',
//       terminalIP: '1234'
//     }
//   }

//   var newAlluser = new Alluser(userData)
//   newAlluser.save(function (err, userInfo) {
//     if (err) {
//       return res.status(500).send(err.errmsg)
//     }
//     res.json({results: userInfo})
//   })
// }

exports.registerTest = function (acl) {
  return function (req, res, next) {
    var _phoneNo = req.body.phoneNo
    var _password = req.body.password
    var _role = req.body.role
    var query = {phoneNo: _phoneNo}
        // var _userNo = req.newId
    Alluser.getOne(query, function (err, item) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      if (item != null) {
        var query1 = {phoneNo: _phoneNo, role: _role}
        Alluser.getOne(query1, function (err, item1) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          if (item1 != null) {
            res.json({results: 1, userNo: '', mesg: 'Alluser Already Exist!'})
          } else {
            if (_role === 'doctor') { // 医生注册时赋予临时角色
              _role = 'guest'
            }
            // 在原有账号基础上增加新角色
            Alluser.updateOne(query, {$push: { role: _role }, $set: {password: _password}}, function (err, item2) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              var userId = item.userId
              var roles = _role

              if (userId && roles) {
                acl.addUserRoles(userId, roles, function (err) {
                  if (err) {
                    return res.status(500).send(err.errmsg)
                  }
                                    // res.json({results: {status:1,msg:'success'}});
                  res.json({results: 0, userNo: item.userId, mesg: 'Alluser Register Success!'})
                })
              } else {
                return res.status(400).send('empty inputs')
              }
                            // res.json({results: 0,userNo:item.userId,mesg:"Alluser Register Success!"});
            }, {new: true, runValidators: true})
          }
        })
      } else {
        // 该账号未被注册过
        next()
      }
    })
  }
}
exports.register = function (acl) {
  return function (req, res) {
    var _phoneNo = req.body.phoneNo
    var _password = req.body.password
    var _role = req.body.role
        // var query = {phoneNo:_phoneNo};
    var _userNo = req.newId

    if (_role === 'doctor') { // 医生注册时赋予临时角色
      _role = 'guest'
    }

    var userData = {
      phoneNo: _phoneNo,
      password: _password,
      role: _role,
      userId: _userNo,
      invalidFlag: 0,
      creationTime: new Date()
    }
    if (_role === 'patient') {
      // 患者注册时需要填写姓名
      let _name = req.body.name || null
      if (_name === null) {
        return res.status(400).send('name_needed')
      }
      userData['name'] = _name
    }
    var newAlluser = new Alluser(userData)
    newAlluser.save(function (err, Info) {
      if (err) {
        return res.status(500).send(err.errmsg)
      }
      var userId = _userNo
      var roles = _role

      if (userId && roles) {
        acl.addUserRoles(userId, roles, function (err) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
                    // res.json({results: {status:1,msg:'success'}});
          res.json({results: 0, userNo: _userNo, mesg: 'Alluser Register Success!'})
        })
      } else {
        return res.status(400).send('empty inputs')
      }
            // res.json({results: 0,userNo:_userNo,mesg:"Alluser Register Success!"});
    })
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
exports.reset = function (req, res) {
  var _phoneNo = req.body.phoneNo
  var _password = req.body.password
  var query = {phoneNo: _phoneNo}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      res.json({results: 1, mesg: "Alluser doesn't Exist!"})
    } else {
      Alluser.updateOne(query, { $set: { password: _password } }, function (err, item1) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        res.json({results: 0, mesg: 'password reset success!'})
      })
    }
  })
}
// 已注册用户绑定微信号
exports.setOpenId = function (req, res, next) {
  var _phoneNo = req.body.phoneNo
  var _openId = req.body.openId
  var query = {phoneNo: _phoneNo}
  if (_openId === undefined || _openId === null || _openId === '') {
    return res.status(403).send('unionid不能为空')
  }
  Alluser.updateOne(query, {$set: {openId: _openId}}, function (err, item) {
    if (err) {
      if (err.code === 11000) {
        return res.status(403).send('unionid已存在')
      }
      return res.status(500).send(err.errmsg)
    }
    if (item) {
            // console.log(item);
        // res.json({results: item,msg:"success!"});
      req.body.username = _openId
      next()
    } else {
      return res.status(403).send('用户不存在')
    }
  })
}
exports.setOpenIdRes = function (req, res) {
  res.json({results: 'success!'})
}
// 校验用户是否绑定微信号进行登录
exports.openIdLoginTest = function (req, res, next) {
    // 2017-06-07GY调试
    // console.log('openIdLoginTest_in');

  var username = req.body.username
  if (username === '') {
    return res.status(422).send('请输入用户名!')
  }
    // var query = {phoneNo:_phoneNo};
  var query = {
    openId: username
  }
  var openIdFlag = 0
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item != null) {
      openIdFlag = 1  // 已经绑定微信号，则将标志位置1
    }
    req.openIdFlag = openIdFlag

        // 2017-06-07GY调试
        // console.log('openIdLoginTest_out');

    next()
  })
}

function add0 (m) {
  return m < 10 ? '0' + m : m
}

exports.checkBinding = function (req, res) {
  // 2017-06-07GY调试
  // console.log('checkBinding_in');

  var username = req.body.username
  var role = req.body.role
  // var query = {'userId': userId}
  // console.log(username);
  var query = {
    $or: [
      {userId: username},
      {openId: username},
      {phoneNo: username}
    ]
  }
  // console.log(query);

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item != null) {
      // 修改 nurseWechat暂时共用doctorWechat字段 2017-09-21 lgf
      // if (item.MessageOpenId != null && (item.MessageOpenId.patientWechat != null || item.MessageOpenId.test != null)) {
      if (item.MessageOpenId != null) {
        // openId 存在
        var query = {}
        if (role === 'patient' && (item.MessageOpenId.patientWechat != null || item.MessageOpenId.test != null)) {
          query = {patientOpenId: item.MessageOpenId.patientWechat || item.MessageOpenId.test}
        }
        if (role === 'nurse' && (item.MessageOpenId.doctorWechat != null || item.MessageOpenId.test != null)) {
          query = {patientOpenId: item.MessageOpenId.doctorWechat || item.MessageOpenId.test}
        }
        // console.log(query);
        OpenIdTmp.getOne(query, function (err, item1) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }
          // console.log({item1:item1});
          // if(item1 != null && item1.doctorAlluserId != null){
          if (item1 != null) {
            // console.log(1111);

            // binding doctor
            // var jsondata = {
            //   patientId: item.userId,
            //   doctorId: item1.doctorAlluserId,
            //   dpRelationTime: Date()
            // }
            // console.log(jsondata);
            // 调用患者和医生/护士和患者的绑定方法 修改 2017-08-17 lgf
            let jsondata = {}
            let _url = ''
            if (role === 'patient') {
              // binding doctor
              _url = 'http://' + webEntry.domain + '/api/v2/patient/favoriteDoctor' + '?token=' + req.token
              jsondata = {
                patientId: item.userId,
                doctorId: item1.doctorUserId,
                dpRelationTime: new Date()
              }
            } else if (role === 'nurse') {
              // binding patient
              _url = 'http://' + webEntry.domain + '/api/v2/nurse/bindingPatient' + '?token=' + req.token
              jsondata = {
                patientId: item1.doctorUserId,
                nurseObjectId: item._id,
                dpRelationTime: new Date()
              }
            } else {
              res.json({results: req.results})
            }
            request({
              url: _url,
              // url: 'http://' + webEntry.domain + ':4060/api/v1/patient/bindingMyDoctor' + '?token=' + req.query.token || req.body.token,
              method: 'POST',
              body: jsondata,
              json: true
            }, function (err, response, body) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              // 绑定成功后 删除OpenIdTmp表中的数据
              // console.log({query1:query});
              OpenIdTmp.remove(query, function (err) {
                if (err) {
                  return res.status(500).send(err.errmsg)
                }
                // 微信模板消息 2017-10-12 lgf
                if (role === 'patient') {
                  let queryD = {userId: item1.doctorUserId, role: 'doctor'}
                  Alluser.getOne(queryD, function (err, doctor) {
                    if (err) {
                      return res.status(500).send(err.errmsg)
                    } else if (doctor === null) {
                      return res.status(422).send('不存在的医生ID!')
                    } else {
                      let name = doctor.name
                      let title = doctor.title
                      let workUnit = doctor.workUnit

                      let templatePat = {
                        'userId': item.userId,
                        'role': 'patient',
                        'postdata': {
                          // 'touser': patient_openId,
                          'template_id': config.wxTemplateIdConfig.bindDocMsgToPat, // '43kP7uwMZmr52j7Ptk8GLwBl5iImvmqmBbFNND_tDEg',
                          'url': '',
                          'data': {
                            'first': {
                              'value': '您现在已经关注' + name + '医生。', // 医生姓名
                              'color': '#173177'
                            },
                            'keyword1': {
                              'value': name,    // 医生姓名
                              'color': '#173177'
                            },
                            'keyword2': {
                              'value': title,   // 医生职称
                              'color': '#173177'
                            },
                            'keyword3': {
                              'value': workUnit, // 所在医院
                              'color': '#173177'
                            },

                            'remark': {
                              'value': '点击底栏【肾事管家】按钮进行注册，注册登录后可查看医生详情，并进行咨询问诊。',
                              'color': '#173177'
                            }
                          }
                        }
                      }
                      // console.log(templatePat)
                      // console.log('http://' + webEntry.domain + '/api/v2/wechat/messageTemplate')
                      request({
                        url: 'http://' + webEntry.domain + '/api/v2/wechat/messageTemplate',
                        method: 'POST',
                        body: templatePat,
                        json: true
                      }, function (err, response) {
                        if (err) {
                          return res.status(500).send(err.errmsg)
                        } else {
                          let date = new Date()
                          let y = date.getFullYear()
                          let m = date.getMonth() + 1
                          let d = date.getDate()
                          let h = date.getHours()
                          let mm = date.getMinutes()
                          let s = date.getSeconds()
                          let formatSecond = y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s)
                          let templateDoc = {
                            'userId': doctor.userId,
                            'role': 'doctor',
                            'postdata': {
                              'template_id': config.wxTemplateIdConfig.bindDocMsgToDoc, // 'F5UpddU9v4m4zWX8_NA9t3PU_9Yraj2kUxU07CVIT-M',
                              'url': '', // 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=newsufferer&#wechat_redirect',
                              'data': {
                                'first': {
                                  'value': '您好，有一位新患者关注了您。',
                                  'color': '#173177'
                                },
                                'keyword1': {
                                  'value': item.name,                            // 患者姓名
                                  'color': '#173177'
                                },
                                'keyword2': {
                                  'value': formatSecond,     // 添加的时间
                                  'color': '#173177'
                                },
                                'remark': {
                                  'value': '点击底栏【工作站】按钮，登录后可查看患者详情',
                                  'color': '#173177'
                                }
                              }
                            }
                          }
                          request({
                            url: 'http://' + webEntry.domain + '/api/v2/wechat/messageTemplate',
                            method: 'POST',
                            body: templateDoc,
                            json: true
                          }, function (err, response) {
                            if (err) {
                              return res.status(500).send(err.errmsg)
                            } else {
                              return res.json({results: req.results})
                            }
                          })
                        }
                      })
                    }
                  })
                } else {
                  // 2017-06-07GY调试
                  // console.log('checkBinding_out');

                  return res.json({results: req.results})
                }
              })
            })
          } else {
            // console.log("No OpenIdTmp");
            // if(item1.doctorAlluserId === null){
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

            // 2017-06-07GY调试
            // console.log('checkBinding_out22');
            // 无缓存绑定信息 2017-08-17 lgf 修改
            // next()
            res.json({results: req.results})
          }
        })
      } else {
        // 2017-06-07GY调试
        // console.log('checkBinding_out');
        // 未绑定微信号 2017-08-17 lgf 修改
        // next()
        res.json({results: req.results})
      }
    } else {
      // 2017-06-07GY调试
      // console.log('checkBinding_err_user_not_exist');

      res.json({results: 1, mesg: "Alluser doesn't Exist!"})
    }
  })
}
exports.login = function (req, res, next) {
    // 2017-06-07GY调试
  var username = req.body.username
  var password = req.body.password
  var role = req.body.role

  if (username === '' || password === '') {
    return res.status(422).send('请输入用户名和密码!')
  }
    // var query = {phoneNo:_phoneNo};
  var query = {
    $or: [
      {phoneNo: username},
      {openId: username}
    ]
  }
  var openIdFlag = req.openIdFlag
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      // 2017-06-07GY调试
      // console.log('login_err_user_not_exist');

      res.json({results: 1, mesg: "Alluser doesn't Exist!"})
    } else {
      if (role === 'doctor') { // 医生登录，判断角色无医生且审核未通过则赋值guest角色
        if (item.role.indexOf('doctor') === -1 && Number(item.reviewStatus) !== 1) {
          role = 'guest'
        }
      }
      if (role === 'PC') {         // PC端登录 修改默认输入角色为'PC'，并赋值 userPayload 中 role 为该用户的所有角色 2017-09-15 lgf
        var roles = item.role
        var _role = 'PC'
        if (roles.length !== 0) {  // 其实用户至少有一个角色，默认以第一个角色登录
          role = roles[0]
        }
      }
      if (item.role.indexOf(role) === -1) {
        // 2017-06-07GY调试
        // console.log('login_err_no_authority');

        res.json({results: 1, mesg: 'No authority!'})
      } else if (password !== item.password && openIdFlag === 0) {
        // 2017-06-07GY调试
        // console.log('login_err_password_not_correct');

        res.json({results: 1, mesg: "Alluser password isn't correct!"})
      } else {
        var _lastlogindate = item.lastLogin
                // console.log(Date())
        Alluser.updateOne(query, { $set: {loginStatus: 0, lastLogin: Date()} }, function (err, user) {
          if (err) {
            return res.status(500).send(err.errmsg)
          }

                    // csq 返回token信息
                    // console.log(user);
          var userPayload = {}
          if (_role === 'PC') {
            userPayload = {
              _id: user._id,
              userId: user.userId,
              name: user.name,
              role: user.role,
              exp: Date.now() + config.TOKEN_EXPIRATION * 1000
            }
          } else {
            userPayload = {
              _id: user._id,
              userId: user.userId,
              name: user.name,
              role: role,
              exp: Date.now() + config.TOKEN_EXPIRATION * 1000
            }
          }
          // console.log('userPayload', userPayload)
          // var userPayload = {
          //   _id: user._id,
          //   userId: user.userId,
          //   name: user.name,
          //   role: role,
          //   exp: Date.now() + config.TOKEN_EXPIRATION * 1000
          // }
                    //  console.log(Date.now());
                    // console.log( Date.now() + 60 * 3 * 1000);
          var token = jwt.sign(userPayload, config.tokenSecret, {algorithm: 'HS256'}, {expiresIn: config.TOKEN_EXPIRATION})
          req.token = token
          var sha1 = crypto.createHash('sha1')
          var refreshToken = sha1.update(token).digest('hex')

                    // JSON.stringify(userPayload),
          var refreshtokenData = {
            refreshtoken: refreshToken,
            userPayload: JSON.stringify(userPayload),
            userId: user.userId
          }
                    // console.log(refreshtokenData);

          var newRefreshtoken = new Refreshtoken(refreshtokenData)
          newRefreshtoken.save(function (err, Info) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            req.results = {
              status: 0,
              userId: item.userId,
              userName: item.name || '',
              lastlogin: _lastlogindate,
              PhotoUrl: commonFunc.adaptPrefix(item.photoUrl),
              mesg: 'login success!',
              token: token,
              refreshToken: refreshToken,
              reviewStatus: item.reviewStatus,
              role: item.role,
              _id: item._id
            }

                        // 2017-06-07GY调试
            // console.log('login_success')

            // res.json({results: results})
            // 修改: 登录成功后进行checkBinding操作 2017-08-17 lgf
            next()
          })
        })
      }
    }
  })
}

exports.logout = function (req, res) {
  // var _userId = req.query.userId
  var _userId = req.session.userId  // session 修改 2017-08-16 lgf
  var query = {userId: _userId}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      res.json({results: 1, mesg: "Alluser doesn't Exist!"})
    } else {
      Alluser.updateOne(query, { $set: {loginStatus: 1} }, function (err, item1) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        res.json({results: 0, mesg: 'logout success!'})
      })
    }
  })
}
exports.getAlluserID = function (req, res) {
  var username = req.query.username || null
  if (username === null || username === '') {
    return res.status(400).send('invalid input')
  }
    // console.log(username);
  var query = {
    $or: [
            {phoneNo: username},
            {openId: username},
            {userId: username}
    ]
  }
    // console.log(query);
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      res.json({results: 1, mesg: "Alluser doesn't Exist!"})
    } else {
      // console.log(item)
      res.json({results: 0, AlluserId: item.userId, phoneNo: item.phoneNo, roles: item.role, openId: item.openId, mesg: 'Get AlluserId Success!'})
    }
  })
}

// exports.sendSMS = function (req, res) {
//   var now = new Date()
//   var _mobile = req.body.mobile
//   var _smsType = Number(req.body.smsType)
//   var _reason = req.body.reason
//     // var token = "849407bfab0cf4c1a998d3d6088d957b";
//     // var accountSid = "b839794e66174938828d1b8ea9c58412";
//     // var appId = "38b50013289b417f9ce474c8210aebcf";
//     // var tplId = "40860";
//     // var appId1 = "14ea1d5fc41b4346ac70083c377c5dd7";
//     // var tplId1 = "43987";
//   var token = '86cf8733b80a31fd7deb7b3147a226d0'
//   var accountSid = '43b82098fcec135770091f446f6b7367'
//   var appId = 'af8afab59dd04001a4b5b37bcc419ec3'
//   var tplId = '51064'
//   var appId1 = 'a4aab03e083c46b29dd539ec63a52b24'
//   var tplId1 = '51041'
//   var tplId2 = '100891'
//   var tplId3 = '100910'
//   if (_smsType === 2) {
//     tplId = tplId1
//     appId = appId1
//   }
//   var Jsonstring1 = 'templateSMS'
//   var Jsonstring2 = 'appId'
//   var Jsonstring3 = 'param'
//   var Jsonstring4 = 'templateId'
//   var Jsonstring5 = 'to'
//   var J6 = '{'

//   var rand = Math.random()
//   var min = 100000
//   var max = 1000000
//   var _randNum = Math.floor(min + (max - min) * rand)
//   var param = _randNum + ',' + 1
//   var JSONData = J6 + '"' + Jsonstring1 + '"' + ':' + '{' + '"' + Jsonstring2 + '"' + ':' + '"' + appId + '"' + ',' + '"' + Jsonstring3 + '"' + ':' + '"' + param + '"' + ',' + '"' + Jsonstring4 + '"' + ':' + '"' + tplId + '"' + ',' + '"' + Jsonstring5 + '"' + ':' + '"' + _mobile + '"' + '}' + '}'
//     // delete all expired smss
//   if (_smsType === 3) {
//     tplId = tplId2
//     appId = appId1
//     JSONData = J6 + '"' + Jsonstring1 + '"' + ':' + '{' + '"' + Jsonstring2 + '"' + ':' + '"' + appId + '"' + ',' + '"' + Jsonstring4 + '"' + ':' + '"' + tplId + '"' + ',' + '"' + Jsonstring5 + '"' + ':' + '"' + _mobile + '"' + '}' + '}'
//   }
//   if (_smsType === 4) {
//     tplId = tplId3
//     appId = appId1
//     param = _reason
//     JSONData = J6 + '"' + Jsonstring1 + '"' + ':' + '{' + '"' + Jsonstring2 + '"' + ':' + '"' + appId + '"' + ',' + '"' + Jsonstring3 + '"' + ':' + '"' + param + '"' + ',' + '"' + Jsonstring4 + '"' + ':' + '"' + tplId + '"' + ',' + '"' + Jsonstring5 + '"' + ':' + '"' + _mobile + '"' + '}' + '}'
//   }
//   // console.log(JSONData)
//   var query = {'Expire': {'$lte': now.getTime()}}
//   Sms.remove(query, function (err, item) {
//     if (err) {
//       return res.status(500).send(err.errmsg)
//     }
//         // res.json({results: 0});
//             // query by _mobile and _smsType
//     if (_mobile !== null && _mobile !== '' && _mobile !== undefined && _smsType !== null && _smsType !== '' && _smsType !== undefined) {
//       var query1 = {mobile: _mobile, smsType: _smsType}
//       Sms.getOne(query1, function (err, item) {
//         if (err) {
//           return res.status(500).send(err.errmsg)
//         }
//         if (item === null) {
//           // not exist
//           // var _expire=60*3
//           var _expire = 60
//                     // insert a sms
//           var smsData = {
//             mobile: _mobile,
//             smsType: _smsType,
//             randNum: _randNum,
//             Expire: _expire * 1000 + now.getTime(),
//             insertTime: now
//           }
//           var newSms = new Sms(smsData)
//           newSms.save(function (err, Info) {
//             if (err) {
//               return res.status(500).send(err.errmsg)
//             }
//                         // res.json({results: Info});
//             var timestamp = now.getFullYear() + commonFunc.paddNum(now.getMonth() + 1) + commonFunc.paddNum(now.getDate()) + now.getHours() + now.getMinutes() + now.getSeconds()
//             var md5 = crypto.createHash('md5').update(accountSid + token + timestamp).digest('hex').toUpperCase()
//                         // byte[] bytedata = encode.GetBytes(accountSid + ":" + timestamp);
//             var authorization = Base64.encode(accountSid + ':' + timestamp)
//                         // console.log(md5)
//                         // console.log(authorization)
//             // var bytes = commonFunc.stringToBytes(JSONData)
//             // var Url = 'https://api.ucpaas.com/2014-06-30/Accounts/' + accountSid + '/Messages/templateSMS?sig=' + md5
//                         // console.log(Url);
//             var options = {
//               hostname: 'api.ucpaas.com',
//                             // port:80,
//               path: '/2014-06-30/Accounts/' + accountSid + '/Messages/templateSMS?sig=' + md5,
//               method: 'POST',
//               headers: {
//                 'Accept': 'application/json',
//                                 // "Accept-Encoding":"gzip, deflate",
//                                 // "Accept-Language":"zh-CN,zh;q=0.8",
//                                 // "Connection":"keep-alive",
//                 // 'Content-Length': bytes.length,
//                 'Content-Type': 'application/json;charset=utf-8',
//                                 // "Cookie":"imooc_uuid=6cc9e8d5-424a-4861-9f7d-9cbcfbe4c6ae; imooc_isnew_ct=1460873157; loginstate=1; apsid=IzZDJiMGU0OTMyNTE0ZGFhZDAzZDNhZTAyZDg2ZmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjkyOTk0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGNmNmFhMmVhMTYwNzRmMjczNjdmZWUyNDg1ZTZkMGM1BwhXVwcIV1c%3DMD; PHPSESSID=thh4bfrl1t7qre9tr56m32tbv0; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1467635471,1467653719,1467654690,1467654957; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1467655022; imooc_isnew=2; cvde=577a9e57ce250-34",
//                                 // "Host":"www.imooc.com",
//                                 // "Origin":"http://www.imooc.com",
//                                 // "Referer":"http://www.imooc.com/video/8837",
//                                 // "Alluser-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2763.0 Safari/537.36",
//                                 // "X-Requested-With":"XMLHttpRequest",
//                 'Authorization': authorization
//               }
//             }
//             var code = 1
//             var requests = https.request(options, function (response) {
//               var resdata = ''
//               response.on('data', function (chunk) {
//                 resdata += chunk
//                                 // console.log(chunk);
//               })
//               response.on('end', function () {
//                                 // console.log("### end ##");
//                 // var json = eval('(' + resdata + ')')
//                 // console.log(resdata)
//                 var json = evil(resdata)
//                 code = json.resp.respCode
//                 if (code === '000000') {
//                   res.json({results: 0, mesg: "Alluser doesn't Exist!"})
//                 } else {
//                   // res.json({results: 1, mesg: {'ErrorCode': code}})
//                   var errData = {
//                     fieldInfo: 'sms',
//                     userInfo: _mobile,
//                     inputInfo: _smsType,
//                     errorInfo: code,
//                     errorTime: new Date()
//                   }
//                   var newErrorlog = new Errorlog(errData)
//                   newErrorlog.save(function (err, Info) {
//                     if (err) {
//                       return res.status(500).send(err.errmsg)
//                     }
//                     res.json({results: 1, mesg: {'ErrorCode': code}})
//                   })
//                 }
//                                 // console.log(json.resp.respCode);
//               })
//                             // console.log(res.statusCode);
//             })

//             requests.on('error', function (err) {
//               console.log(err.message)
//             })
//             requests.write(JSONData)
//             requests.end()
//           })

//                     // res.json({results: 0,mesg:"Alluser doesn't Exist!"});
//         } else {
//           var ttl = (item.Expire - now.getTime()) / 1000
//                     // sms exist
//           res.json({results: 0, mesg: '您的邀请码已发送，请等待' + Math.floor(ttl) + 's后重新获取'})
//         }
//       })
//     } else {
//       res.json({results: 1, mesg: 'mobile and smsType input Error!'})
//     }
//   })
// }

exports.sendSMS = function (req, res) {
  let now = new Date()
  let _mobile = req.body.mobile
  let _smsType = Number(req.body.smsType)
  let _reason = req.body.reason

  let rand = Math.random()
  let min = 100000
  let max = 1000000
  let _randNum = Math.floor(min + (max - min) * rand)
  let param = '亲爱的用户，您的验证码是' + _randNum + '，请在' + 1 + '分钟内进行验证【肾事管家】'
    // delete all expired smss
  if (_smsType === 2) {
    param = '亲爱的用户，您的验证码是' + _randNum + '，请在' + 1 + '分钟内进行验证【肾事联盟】'
  }
  if (_smsType === 3) {
    param = '感谢您注册肾事联盟！您的注册申请已经通过审核，初始密码为123456，请尽快登录肾事联盟，为确保安全，请及时修改密码。【肾事联盟】'
  }
  if (_smsType === 4) {
    param = '感谢您注册肾事联盟！您的注册申请没有通过管理员审核，原因为' + _reason + '，请完善您的注册资料，重新提交注册申请，感谢您的支持！【肾事联盟】'
  }
  // console.log(JSONData)
  let query = {'Expire': {'$lte': now.getTime()}}
  Sms.remove(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
        // res.json({results: 0});
            // query by _mobile and _smsType
    if (_mobile !== null && _mobile !== '' && _mobile !== undefined && _smsType !== null && _smsType !== '' && _smsType !== undefined) {
      var query1 = {mobile: _mobile, smsType: _smsType}
      Sms.getOne(query1, function (err, item) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item === null) {
          // not exist
          // var _expire=60*3
          var _expire = 60
                    // insert a sms
          var smsData = {
            mobile: _mobile,
            smsType: _smsType,
            randNum: _randNum,
            Expire: _expire * 1000 + now.getTime(),
            insertTime: now
          }
          var newSms = new Sms(smsData)
          newSms.save(function (err, Info) {
            if (err) {
              return res.status(500).send(err.errmsg)
            }
            let postData = {
              mobile: _mobile,
              message: param
            }
            let content = querystring.stringify(postData)

            let options = {
              host: 'sms-api.luosimao.com',
              path: '/v1/send.json',
              method: 'POST',
              auth: 'api:key-bbbd030227dbef849ed176a35e89a453',
              agent: false,
              rejectUnauthorized: false,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': content.length
              }
            }

            let requestTest = https.request(options, function (response) {
              response.setEncoding('utf8')
              response.on('data', function (chunk) {
                let result = JSON.parse(chunk)
                if (Number(result.error) === 0 && result.msg === 'ok') {
                  return res.json({results: 0, mesg: "Alluser doesn't Exist!"})
                } else {
                  var errData = {
                    fieldInfo: 'sms',
                    userInfo: _mobile,
                    inputInfo: _smsType,
                    errorInfo: result.error,
                    errorTime: new Date()
                  }
                  var newErrorlog = new Errorlog(errData)
                  newErrorlog.save(function (err, Info) {
                    if (err) {
                      return res.status(500).send(err.errmsg)
                    }
                    res.json({results: 1, mesg: {'ErrorCode': result.error}})
                  })
                }
              })
              response.on('end', function () {
                console.log(' --- 发送短信 --- type - ' + _smsType + ' --- ' + _mobile + ' process over')
              })
            })

            requestTest.write(content)
            requestTest.end()
          })

                    // res.json({results: 0,mesg:"Alluser doesn't Exist!"});
        } else {
          var ttl = (item.Expire - now.getTime()) / 1000
                    // sms exist
          res.json({results: 0, mesg: '您的邀请码已发送，请等待' + Math.floor(ttl) + 's后重新获取'})
        }
      })
    } else {
      res.json({results: 1, mesg: 'mobile and smsType input Error!'})
    }
  })
}

exports.verifySMS = function (req, res) {
  var now = new Date()
  var _mobile = req.query.mobile
  var _smsType = req.query.smsType
  var _smsCode = Number(req.query.smsCode)

  var query = {'Expire': {'$gte': now.getTime()}, 'mobile': _mobile, 'smsType': _smsType}
  Sms.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
        // res.json({results: 0});
            // query by _mobile and _smsType
    if (item != null) {
      if (item.randNum === _smsCode) {
        res.json({results: 0, mesg: '验证码正确!'})
      } else {
        res.json({results: 1, mesg: '验证码错误'})
      }
    } else {
      res.json({results: 2, mesg: '没有验证码或验证码已过期!'})
    }
  })
}

// var commonFunc = require('../middlewares/commonFunc');
// exports.getIp = function(req, res) {
//     var _ip = commonFunc.getClientIp(req)
//     res.json({results: 0,Ip:_ip});
// }

// 根据角色获取电话号码 2017-04-25 GY
exports.getPhoneNoByRole = function (req, res) {
  if (req.query.role === null || req.query.role === '') {
    return res.json({result: '请输入role!'})
  } else if (req.query.role !== 'doctor' && req.query.role !== 'patient') {
    return res.json({result: '不合法的role!'})
  }

  var query = {role: req.query.role}
  var fields = {userId: 1, userName: 1, phoneNo: 1, _id: 0}

  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (items === null) {
            // res.json({results: 1,mesg:"Alluser doesn't Exist!"});
    } else {
            // var phoneNos = [];
            // for (var i = items.length - 1; i >= 0; i--) {
            //     phoneNos[i] = items[i].phoneNo
            // }
            // res.json({results: phoneNos});
      res.json({results: items})
    }
  }, '', fields)
}

exports.setTDCticket = function (req, res) {
  var TDCticket = req.results.ticket
  var TDCurl = req.results.url
  // var userId = req.body.userId
  var userId = req.session.userId
  var role = req.session.role

  var query = {userId: userId}
  var upObj = {}
  if (role === 'doctor') {
    upObj = {
      $set: {
        'docTDCticket': TDCticket,
        'docTDCurl': TDCurl
      }
    }
  } else if (role === 'patient') {
    upObj = {
      $set: {
        'patTDCticket': TDCticket,
        'patTDCurl': TDCurl
      }
    }
  } else {
    upObj = {}
  }
  Alluser.updateOne(query, upObj, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: {TDCticket: TDCticket, TDCurl: TDCurl}})
  })
}

exports.setMessageOpenId = function (req, res) {
  var _type = req.body.type || null
  var _openId = req.body.openId
  var userId = req.body.userId
  if (_type === null) {
    return res.json({result: 1, msg: 'plz input type'})
  } else {
    _type = Number(_type)
  }
  if (_openId === undefined || _openId === null || _openId === '') {
    return res.status(403).send('openId不能为空')
  }
  var query = {userId: userId}

  var _mesgOid = req.user.MessageOpenId
  var upObj
  if (_type === 1) {
    upObj = {
      $set: {
        MessageOpenId: {
          doctorWechat: _openId

        }
      }
    }
    if (_mesgOid !== null && _mesgOid !== undefined) {
      upObj = {
        $set: {
          MessageOpenId: {
            doctorWechat: _openId,
            patientWechat: _mesgOid.patientWechat,
            doctorApp: _mesgOid.doctorApp,
            patientApp: _mesgOid.patientApp,
            test: _mesgOid.test
          }
        }
      }
    }
  }
  if (_type === 2) {
    upObj = {
      $set: {
        MessageOpenId: {

          patientWechat: _openId
        }
      }
    }
    if (_mesgOid !== null && _mesgOid !== undefined) {
      upObj = {
        $set: {
          MessageOpenId: {
            doctorWechat: _mesgOid.doctorWechat,
            patientWechat: _openId,
            doctorApp: _mesgOid.doctorApp,
            patientApp: _mesgOid.patientApp,
            test: _mesgOid.test
          }
        }
      }
    }
  }
  if (_type === 3) {
    upObj = {
      $set: {
        MessageOpenId: {

          doctorApp: _openId
        }
      }
    }
    if (_mesgOid !== null && _mesgOid !== undefined) {
      upObj = {
        $set: {
          MessageOpenId: {
            doctorWechat: _mesgOid.doctorWechat,
            patientWechat: _mesgOid.patientWechat,
            doctorApp: _openId,
            patientApp: _mesgOid.patientApp,
            test: _mesgOid.test
          }
        }
      }
    }
  }
  if (_type === 4) {
    upObj = {
      $set: {
        MessageOpenId: {
          patientApp: _openId
        }
      }
    }
    if (_mesgOid !== null && _mesgOid !== undefined) {
      upObj = {
        $set: {
          MessageOpenId: {
            doctorWechat: _mesgOid.doctorWechat,
            patientWechat: _mesgOid.patientWechat,
            doctorApp: _mesgOid.doctorApp,
            patientApp: _openId,
            test: _mesgOid.test
          }
        }
      }
    }
  }
  if (_type === 5) {
    upObj = {
      $set: {
        MessageOpenId: {
          test: _openId
        }
      }
    }

    if (_mesgOid !== null && _mesgOid !== undefined) {
      upObj = {
        $set: {
          MessageOpenId: {
            doctorWechat: _mesgOid.doctorWechat,
            patientWechat: _mesgOid.patientWechat,
            doctorApp: _mesgOid.doctorApp,
            patientApp: _mesgOid.patientApp,
            test: _openId
          }
        }
      }
    }
  }
  Alluser.updateOne(query, upObj, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: 0, resultitem: item})
  }, {new: true})
}

exports.getMessageOpenId = function (req, res) {
  var _type = req.query.type || null
  // var userId = req.query.userId
  var userId = req.session.userId
  if (_type === null) {
    return res.json({result: 1, msg: 'plz input type'})
  } else {
    _type = Number(_type)
  }
  var query = {userId: userId}

  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else if (item === null) {
      return res.status(404).send('userId_not_available')
    } else {
      if (_type === 1) {
        res.json({results: item.MessageOpenId.doctorWechat})
      } else if (_type === 2) {
        res.json({results: item.MessageOpenId.patientWechat})
      } else if (_type === 3) {
        res.json({results: item.MessageOpenId.doctorApp})
      } else if (_type === 4) {
        res.json({results: item.MessageOpenId.patientApp})
      } else if (_type === 5) {
        res.json({results: item.MessageOpenId.test})
      } else {
        res.json({results: 'type must be 1-4'})
      }
    }
  })
}
exports.checkAlluser = function (req, res, next) {
  if (req.query.userId === null || req.query.userId === '' || req.query.userId === undefined) {
    if (req.body.userId === null || req.body.userId === '' || req.body.userId === undefined) {
      return res.json({result: '请填写userId!'})
    } else {
      req.userId = req.body.userId
    }
  } else {
    req.userId = req.query.userId
  }
  var query = {userId: req.userId}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({result: '不存在的用户ID', userId: req.userId})
    } else {
      req.user = item
      next()
    }
  })
}

exports.changerole = function (req, res) {
  var userId = req.body.userId
  var roles = req.body.roles
  var _type = req.type
  var query = {userId: userId}
    // var _userNo = req.newId
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item != null) {
      var query1 = {userId: userId, role: roles}
      Alluser.getOne(query1, function (err, item1) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        if (item1 != null) {
          if (_type === 2) {
            Alluser.updateOne(query, {$pull: { role: roles }}, function (err, item2) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              return res.json({results: 0, userNo: item.userId, mesg: 'User Register Success!'})
            })
          }
          if (_type === 1) {
            return res.json({results: 1, userNo: userId, mesg: 'User Role Already Exist!'})
          }
        } else {
          if (_type === 2) {
            return res.status(405).send('no such role to delete!')
          }
          if (_type === 1) {
            Alluser.updateOne(query, {$push: { role: roles }}, function (err, item2) {
              if (err) {
                return res.status(500).send(err.errmsg)
              }
              res.json({results: 0, userNo: item.userId, mesg: 'User Register Success!'})
            })
          }
        }
      })
    } else {
      return res.status(405).send('no such user!')
    }
  })
}
exports.checkPatient = function (req, res, next) {
  if (req.session.role === 'patient') {
    return next()
  }
  if (req.query.patientId === null || req.query.patientId === '' || req.query.patientId === undefined) {
    if (req.body.patientId === null || req.body.patientId === '' || req.body.patientId === undefined) {
      return res.json({result: '请填写patientId!'})
    } else {
      req.patientId = req.body.patientId
    }
  } else {
    req.patientId = req.query.patientId
  }
  var query = {userId: req.patientId, role: 'patient'}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({result: '不存在的患者ID'})
    } else {
      next()
    }
  })
}

exports.checkDoctor = function (req, res, next) {
  if (req.session.role === 'doctor') {
    return next()
  }
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
      return res.json({result: '请填写doctorId!'})
    } else {
      req.doctorId = req.body.doctorId
    }
  } else {
    req.doctorId = req.query.doctorId
  }
  var query = {userId: req.doctorId, role: 'doctor'}
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (item === null) {
      return res.json({result: '不存在的医生ID'})
    } else {
      next()
    }
  })
}

// 验证主管、关注患者 GY 2017-09-01
exports.dprelation = function (type) {
  return function (req, res, next) {
    if (req.session.role === 'doctor') {
      let query = {doctorId: req.session._id}
      DpRelation.getOne(query, function (err, dpitem) {
        if (err) {
          return res.status(500).send(err)
        } else if (dpitem === null) {
          return res.status(401).send('与患者无任何联系没有操作权限')
        } else {
          let patientId = req.body.patientId || req.query.patientId || req.body.userId || req.query.userId
          Alluser.getOne({userId: patientId}, function (err, item) {
            if (err) {
              return res.status(500).send(err)
            } else if (item === null) {
              return res.status(500).send('not_found!')
            } else {
              let patientFlag = 0
              let patientChargeFlag = 0
              if (dpitem.patients) {
                if (dpitem.patients.length) {
                  for (let i = 0; i < dpitem.patients.length; i++) {
                    if (JSON.stringify(dpitem.patients[i].patientId) === JSON.stringify(item._id)) {
                      patientFlag = 1
                      break
                    }
                  }
                }
              }
              if (dpitem.patientsInCharge) {
                if (dpitem.patientsInCharge.length) {
                  for (let i = 0; i < dpitem.patientsInCharge.length; i++) {
                    if (JSON.stringify(dpitem.patientsInCharge[i].patientId) === JSON.stringify(item._id)) {
                      patientChargeFlag = 1
                      break
                    }
                  }
                }
              }
              if ((type.indexOf('charge') + 1) && patientChargeFlag) {
                next()
              } else if ((type.indexOf('follow') + 1) && patientFlag) {
                next()
              } else {
                return res.status(401).send('权限不足')
              }
            }
          })
        }
      })
    } else {
      // 患者本身也有权限
      next()
    }
  }
}

exports.getAlluserObject = function (req, res, next) {
  var userId = req.session.userId
  var query = {
    userId: userId
  }
  Alluser.getOne(query, function (err, user) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (user === null) {
      return res.json({result: '不存在的用户ID！'})
    }
    req.userObject = user
    next()
  })
}

exports.getPatientObject = function (req, res, next) {
  var patientId = req.query.patientId || req.body.patientId || null
  if (patientId === null || patientId === '') {
    return res.json({result: '请填写patientId!'})
  }
  var query = {
    userId: patientId,
    role: 'patient'
  }
  Alluser.getOne(query, function (err, patient) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (patient == null) {
      return res.json({result: '不存在的患者ID！'})
    }
    req.patientObject = patient
    next()
  })
}

exports.getDoctorObject = function (req, res, next) {
  var doctorId = req.query.doctorId || req.body.doctorId || null
  if (doctorId === null || doctorId === '') {
    return res.json({result: '请填写doctorId!'})
  }
  var query = {
    userId: doctorId,
    role: 'doctor'
  }
  Alluser.getOne(query, function (err, doctor) {
    if (err) {
      console.log(err)
      return res.status(500).send('服务器错误, 用户查询失败!')
    }
    if (doctor == null) {
      return res.json({result: '不存在的医生ID！'})
    }
    req.doctorObject = doctor
    next()
  })
}

// 用于下单，检测患者付款对象是否是其主管医生 GY 2017-10-11
exports.checkIncharge = function (req, res, next) {
  let query = {
    patientId: req.userObject._id,
    doctorId: req.doctorObject._id,
    invalidFlag: 1
  }
  DoctorsInCharge.getSome(query, function (err, items) {
    if (err) {
      console.log(err)
      next()
    } else if (items.length === 0) {
      req.isIncharge = false
      next()
    } else {
      let now = new Date()
      let count = 0
      for (let i = 0; i < items.length; i++) {
        if (items[i].start < now && items[i].end > now) {
          req.isIncharge = true
          break
        }
        count++
      }
      if (count === items.length) {
        req.isIncharge = false
      }
      next()
    }
    // console.log(req.isIncharge)
    // next()
  })
}

// exports.serviceMessage = function (req, res, next) {
//   let token = '86cf8733b80a31fd7deb7b3147a226d0'
//   let accountSid = '43b82098fcec135770091f446f6b7367'
//   let appId = 'af8afab59dd04001a4b5b37bcc419ec3'
//   let templateId
//   let now = new Date()
//   let mobile
//   let param
//   let PDTime
//   if (Number(req.body.cancelFlag) === 1 || Number(req.body.successFlag) === 1) {
//     let bookingDay = new Date(new Date(req.body.day).toLocaleDateString())
//     let bookingTime = req.body.time || null
//     if (bookingTime === 'Morning') {
//       PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
//     } else if (bookingTime === 'Afternoon') {
//       PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
//     } else {
//       return res.json({code: 1, msg: 'Wrong Input!'})
//     }
//   }

//   if (Number(req.body.cancelFlag) === 1) {
//     templateId = '142743'
//     mobile = req.body.phoneNo || null
//     let doctorName = req.body.doctorName || null
//     let orderMoney = Number(req.body.orderMoney) / 100
//     let orderNo = req.body.orderNo
//     param = doctorName + ',' + PDTime + ',' + orderMoney + ',' + orderNo
//   } else if (Number(req.body.successFlag) === 1) {
//     templateId = '112436'
//     mobile = req.body.patientObject.phoneNo || null
//     let doctorName = req.body.doctorObject.name || null
//     let PDPlace = req.body.place || null
//     let confirmCode = req.body.code || null
//     param = doctorName + ',' + PDTime + ',' + PDPlace + ',' + confirmCode
//   } else if (Number(req.body.rejectFlag) === 1) {
//     templateId = '149559'
//     mobile = req.body.phoneNo || null
//     let doctorName = req.body.doctorName || null
//     let reason = req.body.reason || null
//     let orderMoney = Number(req.body.orderMoney) / 100
//     let orderNo = req.body.orderNo
//     param = doctorName + ',' + reason + ',' + orderMoney + ',' + orderNo
//   } else {
//     return res.json({code: 1, meg: '请填写successFlag／cancelFlag／rejectFlag!'})
//   }

//   let JSONData = '{' + '"' + 'templateSMS' + '"' + ':' + '{' + '"' + 'appId' + '"' + ':' + '"' + appId + '"' + ',' + '"' + 'param' + '"' + ':' + '"' + param + '"' + ',' + '"' + 'templateId' + '"' + ':' + '"' + templateId + '"' + ',' + '"' + 'to' + '"' + ':' + '"' + mobile + '"' + '}' + '}'
//   let timestamp = now.getFullYear() + commonFunc.paddNum(now.getMonth() + 1) + commonFunc.paddNum(now.getDate()) + now.getHours() + now.getMinutes() + now.getSeconds()
//   let md5 = crypto.createHash('md5').update(accountSid + token + timestamp).digest('hex').toUpperCase()
//   let authorization = Base64.encode(accountSid + ':' + timestamp)
//   // let bytes = commonFunc.stringToBytes(JSONData)
//   let options = {
//     hostname: 'api.ucpaas.com',
//     path: '/2014-06-30/Accounts/' + accountSid + '/Messages/templateSMS?sig=' + md5,
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       // 'Content-Length': bytes.length,
//       'Content-Type': 'application/json;charset=utf-8',
//       'Authorization': authorization
//     }
//   }
//   let code = 1
//   let requests = https.request(options, function (response) {
//     let resdata = ''
//     response.on('data', function (chunk) {
//       resdata += chunk
//     })
//     response.on('end', function () {
//       let json = evil(resdata)
//       code = json.resp.respCode
//       if (code === '000000') {
//         // res.json({results: 0, mesg: 'Booking Success and Message Sent!'})
//         if (Number(req.body.cancelFlag) === 1) {
//           return res.json({results: 0, mesg: 'Cancel Success and Message Sent!'})
//         } else if (Number(req.body.rejectFlag) === 1) {
//           return res.json({results: 0, mesg: 'Reject Success and Message Sent!'})
//         } else if (Number(req.body.successFlag) === 1) {
//           console.log(new Date() + ' --- 面诊预约短信发送 --- ' + mobile + ' Booking Success and Message Sent!')
//         }
//       } else {
//         if (Number(req.body.successFlag) === 1) {
//           console.log(new Date() + ' --- 面诊预约短信发送 --- ' + mobile + ' Booking Success and Message Error! ErrorCode: \n' + code)
//         } else {
//           return res.json({results: 1, mesg: {'ErrorCode': code}})
//         }
//       }
//     })
//   })

//   requests.on('error', function (err) {
//     console.log(err.message)
//   })
//   requests.write(JSONData)
//   requests.end()
//   if (Number(req.body.successFlag) === 1) {
//     next()
//   }
// }

exports.serviceMessage = function (req, res, next) {
  let PDTime
  let bookingDay = new Date(new Date(req.body.day).toLocaleDateString())
  let bookingTime = req.body.time || null
  if (bookingTime === 'Morning') {
    PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
  } else if (bookingTime === 'Afternoon') {
    PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
  } else {
    return res.json({code: 1, msg: 'Wrong Input!'})
  }

  let mobile = req.body.patientObject.phoneNo || null
  let doctorName = req.body.doctorObject.name || null
  let PDPlace = req.body.place || null
  let confirmCode = req.body.code || null
  let param = '尊敬的用户，您预约' + doctorName + '医生的面诊服务成功，预约时段为' + PDTime + '，地点为' + PDPlace + '，届时需出示验证码' + confirmCode + '，请妥善保存。【肾事管家】'

  let postData = {
    mobile: mobile,
    message: param
  }
  let content = querystring.stringify(postData)

  let options = {
    host: 'sms-api.luosimao.com',
    path: '/v1/send.json',
    method: 'POST',
    auth: 'api:key-bbbd030227dbef849ed176a35e89a453',
    agent: false,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content.length
    }
  }

  let requestTest = https.request(options, function (res) {
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      let result = JSON.parse(chunk)
      if (Number(result.error) === 0 && result.msg === 'ok') {
        console.log(' --- 面诊预约短信 发送成功--- ' + mobile + ' 成功')
      } else {
        let err = 'Error Code: ' + result.error
        console.log(' --- 面诊预约短信 发送失败--- ' + mobile + ' ' + err)
      }
    })
    res.on('end', function () {
      console.log(' --- 面诊预约短信 进程结束--- ' + mobile + ' process over')
    })
  })

  requestTest.write(content)
  requestTest.end()

  let template = {
    'userId': req.session.userId,
    'role': 'patient',
    'postdata': {
      'template_id': config.wxTemplateIdConfig.myPDSuccess,
      'url': '',
      'data': {
        'first': {
          'value': '您好，您的面诊预约已成功！',
          'color': '#173177'
        },
        'keyword1': {
          'value': doctorName,
          'color': '#173177'
        },
        'keyword2': {
          'value': PDTime,
          'color': '#173177'
        },
        'keyword3': {
          'value': PDPlace,
          'color': '#173177'
        },
        'remark': {
          'value': '届时请出示验证码' + confirmCode + '。您可登录应用进行查看相关详细信息。',
          'color': '#173177'
        }
      }
    }
  }
  wechatCtrl.wechatMessageTemplate(template, function (err, results) {
    if (err) {
      console.log(new Date(), 'send_messageTemplate_toPIC_err_' + req.session.name)
    } else {
      if (results.messageTemplate.errcode === 0) {
        console.log(new Date(), 'send_messageTemplate_toPIC_success_' + req.session.name)
      } else {
        console.log(new Date(), 'send_messageTemplate_toPIC_fail_' + req.session.name + results.messageTemplate.errcode)
      }
    }
  })
  next()
}

// async改写------ POST services/message ------ 2017-09-25 YQC
// exports.servicesMessageAsync = function (params, callback) {
//   let type = params.type || null
//   if (['success', 'cancel', 'reject', 'cancelRequest', 'cancelRefund', 'cancelReject', 'request', 'consent'].indexOf(type) === -1) {
//     let err = 'Wrong Input of type'
//     return callback(err)
//   }
//   let token = '86cf8733b80a31fd7deb7b3147a226d0'
//   let accountSid = '43b82098fcec135770091f446f6b7367'
//   let appId = 'af8afab59dd04001a4b5b37bcc419ec3'
//   let templateId = null
//   let now = new Date()
//   let mobile = params.phoneNo || null
//   if (mobile === null) {
//     let err = 'Please Check the Input of mobile'
//     return callback(err)
//   }
//   let param = null
//   let PDTime = null
//   if (type === 'cancel' || type === 'success' || type === 'cancelRequest' || type === 'cancelRefund' || type === 'cancelReject') {
//     if (((params.bookingDay || null) !== null) && ((params.bookingTime || null) !== null)) {
//       let bookingDay = new Date(new Date(params.bookingDay).toLocaleDateString())
//       if (params.bookingTime === 'Morning') {
//         PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
//       } else if (params.bookingTime === 'Afternoon') {
//         PDTime = Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
//       } else {
//         let err = 'Please Check the Input of bookingTime'
//         return callback(err)
//       }
//     } else {
//       let err = 'Please Check the Input of bookingDay/bookingTime'
//       return callback(err)
//     }
//   }

//   if (type === 'cancel') {
//     templateId = '142743'
//     let doctorName = params.doctorName || ''
//     let orderMoney = params.orderMoney || 0
//     let orderNo = params.orderNo || null
//     if (doctorName === null || PDTime === null || orderMoney === null || orderNo === null) {
//       let err = 'Please Check the Input of doctorName/PDTime/orderMoney/orderNo'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + PDTime + ',' + Number(orderMoney) / 100 + ',' + orderNo
//     }
//   }
//   if (type === 'success') {
//     templateId = '112436'
//     let doctorName = params.doctorName || ''
//     let PDPlace = params.place || '未知'
//     let confirmCode = params.code || null
//     if (doctorName === null || PDTime === null || PDPlace === null || confirmCode === null) {
//       let err = 'Please Check the Input of doctorName/PDTime/place/code'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + PDTime + ',' + PDPlace + ',' + confirmCode
//     }
//   }
//   if (type === 'request') {
//     templateId = '162129'
//     let doctorName = params.doctorName || ''
//     let duration = params.duration || null
//     if (doctorName === null || duration === null) {
//       let err = 'Please Check the Input of doctorName/duration'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + duration
//     }
//   }
//   if (type === 'consent') {
//     templateId = '162136'
//     let doctorName = params.doctorName || ''
//     let start = params.start || null
//     let end = params.end || null
//     let orderNo = params.orderNo || null
//     if (doctorName === null || start === null || end === null || orderNo === null) {
//       let err = 'Please Check the Input of doctorName/start/end/orderNo'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + start + ',' + end + ',' + orderNo
//     }
//   }
//   if (type === 'reject') {
//     templateId = '149559'
//     let doctorName = params.doctorName || ''
//     let reason = params.reason || '未知'
//     let orderMoney = params.orderMoney || 0
//     let orderNo = params.orderNo || null
//     if (doctorName === null || reason === null || orderMoney === null || orderNo === null) {
//       let err = 'Please Check the Input of doctorName/reason/orderMoney/orderNo'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + reason + ',' + Number(orderMoney) / 100 + ',' + orderNo
//     }
//   }
//   if (type === 'cancelRequest') {
//     templateId = '160864'
//     let doctorName = params.doctorName || ''
//     if (doctorName === null || PDTime === null) {
//       let err = 'Please Check the Input of doctorName/PDTime'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + PDTime
//     }
//   }
//   if (type === 'cancelRefund') {
//     templateId = '160866'
//     let doctorName = params.doctorName || ''
//     let orderMoney = params.orderMoney || 0
//     let orderNo = params.orderNo || null
//     if (doctorName === null || PDTime === null || orderMoney === null || orderNo === null) {
//       let err = 'Please Check the Input of doctorName/PDTime/orderMoney/orderNo'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + PDTime + ',' + Number(orderMoney) / 100 + ',' + orderNo
//     }
//   }
//   if (type === 'cancelReject') {
//     templateId = '162145'
//     let doctorName = params.doctorName || ''
//     let orderNo = params.orderNo || null
//     if (doctorName === null || PDTime === null || orderNo === null) {
//       let err = 'Please Check the Input of doctorName/PDTime/orderNo'
//       return callback(err)
//     } else {
//       param = doctorName + ',' + PDTime + ',' + orderNo
//     }
//   }

//   let JSONData = '{"templateSMS":{"appId":"' + appId + '","param":"' + param + '","templateId":"' + templateId + '","to":"' + mobile + '"}}'
//   let timestamp = now.getFullYear() + commonFunc.paddNum(now.getMonth() + 1) + commonFunc.paddNum(now.getDate()) + now.getHours() + now.getMinutes() + now.getSeconds()
//   let md5 = crypto.createHash('md5').update(accountSid + token + timestamp).digest('hex').toUpperCase()
//   let authorization = Base64.encode(accountSid + ':' + timestamp)
//   let options = {
//     hostname: 'api.ucpaas.com',
//     path: '/2014-06-30/Accounts/' + accountSid + '/Messages/templateSMS?sig=' + md5,
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json;charset=utf-8',
//       'Authorization': authorization
//     }
//   }
//   let code = 1
//   let requests = https.request(options, function (response) {
//     let resdata = ''
//     response.on('data', function (chunk) {
//       resdata += chunk
//     })
//     response.on('end', function () {
//       let json = evil(resdata)
//       code = json.resp.respCode
//       if (code === '000000') {
//         console.log(new Date() + '--- 短信发送 --- ' + mobile + ' Succeeds.')
//         if (type === 'success') {
//           return callback(null, 'Booking Message Sent!')
//         }
//         if (type === 'cancel') {
//           return callback(null, 'Cancel Message Sent!')
//         }
//         if (type === 'request') {
//           return callback(null, 'Request Message Sent!')
//         }
//         if (type === 'reject') {
//           return callback(null, 'Reject Message Sent!')
//         }
//         if (type === 'consent') {
//           return callback(null, 'Consent Message Sent!')
//         }
//         if (type === 'cancelRequest') {
//           return callback(null, 'Cancel Request Message Sent!')
//         }
//         if (type === 'cancelReject') {
//           return callback(null, 'Cancel Reject Message Sent!')
//         }
//         if (type === 'cancelRefund') {
//           return callback(null, 'Cancel Refund Message Sent!')
//         }
//       } else {
//         console.log(new Date() + '--- 短信发送 --- ' + mobile + ' Error Code: ' + code + ' .')
//         let err = 'Error Code: ' + code
//         return callback(err)
//       }
//     })
//   })

//   requests.on('error', function (err) {
//     return callback(err)
//   })
//   requests.write(JSONData)
//   requests.end()
// }

// async改写 调用servicesMessageAsync方式与结果处理 ------ 2017-09-25 YQC
exports.servicesMessageAsyncTest = function (req, res) {
  let params = {
    // --- success ---
    // type: 'success',
    // phoneNo: '15868870012',
    // bookingDay: '2017-9-13',
    // bookingTime: 'Morning',
    // doctorName: '叶',
    // place: '浙一医院',
    // code: '123456'
    // --- cancel ---
    // type: 'cancel',
    // phoneNo: '15868870012',
    // bookingDay: '2017-9-13',
    // bookingTime: 'Morning',
    // doctorName: '叶',
    // orderNo: 'O2017091300001', // 退款订单号
    // orderMoney: '10' // 退款金额订单
    // --- cancelRequest ---
    // type: 'cancelRequest',
    // phoneNo: '15868870012',
    // bookingDay: '2017-9-13',
    // bookingTime: 'Morning',
    // doctorName: '叶'
    // --- cancelRefund ---
    // type: 'cancelRefund',
    // phoneNo: '15868870012',
    // bookingDay: '2017-9-13',
    // bookingTime: 'Morning',
    // doctorName: '叶',
    // orderNo: 'O2017091300001', // 退款订单号
    // orderMoney: '10' // 退款金额订单
    // --- cancelReject ---
    // type: 'cancelReject',
    // phoneNo: '15868870012',
    // bookingDay: '2017-9-13',
    // bookingTime: 'Morning',
    // doctorName: '叶',
    // orderNo: 'O2017091300001' // 订单号
    // --- request ---
    // type: 'request',
    // phoneNo: '15868870012',
    // doctorName: '叶',
    // duration: '2个月' // 服务时长
    // --- consent ---
    // type: 'consent',
    // phoneNo: '15868870012',
    // doctorName: '叶',
    // start: '2017-09-27',
    // end: '2017-11-27',
    // orderNo: 'O2017091300001' // 退款订单号
    // --- reject ---
    type: 'reject',
    phoneNo: '15868870012',
    doctorName: '叶',
    orderNo: 'O2017091300001', // 退款订单号
    orderMoney: '10', // 退款金额订单
    reason: '嘿嘿嘿'
  }
  alluserCtrl.servicesMessageAsync(params, function (err, results) {
    if (err) {
      return res.json({msg: err, data: results, code: 1})
    } else {
      return res.json({msg: '发送成功', data: results, code: 0})
    }
  })
}

exports.servicesMessageAsync = function (params, callback) {
  let type = params.type || null
  if (['success', 'cancel', 'reject', 'cancelRequest', 'cancelRefund', 'cancelReject', 'request', 'consent'].indexOf(type) === -1) {
    let err = 'Wrong Input of type'
    return callback(err)
  }
  let mobile = params.phoneNo || null
  if (mobile === null) {
    let err = 'Please Check the Input of mobile'
    return callback(err)
  }
  let PDTime = null
  if (type === 'cancel' || type === 'success' || type === 'cancelRequest' || type === 'cancelRefund' || type === 'cancelReject') {
    if (((params.bookingDay || null) !== null) && ((params.bookingTime || null) !== null)) {
      let bookingDay = new Date(new Date(params.bookingDay).toLocaleDateString())
      if (params.bookingTime === 'Morning') {
        PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日上午'
      } else if (params.bookingTime === 'Afternoon') {
        PDTime = bookingDay.getFullYear() + '年' + Number(bookingDay.getMonth() + 1) + '月' + bookingDay.getDate() + '日下午'
      } else {
        let err = 'Please Check the Input of bookingTime'
        return callback(err)
      }
    } else {
      let err = 'Please Check the Input of bookingDay/bookingTime'
      return callback(err)
    }
  }

  let param = null
  if (type === 'success') {
    let doctorName = params.doctorName || ''
    let PDPlace = params.place || '未知'
    let confirmCode = params.code || null
    if (doctorName === null || PDTime === null || PDPlace === null || confirmCode === null) {
      let err = 'Please Check the Input of doctorName/PDTime/place/code'
      return callback(err)
    } else {
      param = '尊敬的用户，您预约' + doctorName + '医生的面诊服务成功，预约时段为' + PDTime + '，地点为' + PDPlace + '，届时需出示验证码' + confirmCode + '，请妥善保存。【肾事管家】'
    }
  }

  if (type === 'cancel') {
    let doctorName = params.doctorName || ''
    let orderMoney = params.orderMoney || 0
    let orderNo = params.orderNo || null
    if (doctorName === null || PDTime === null || orderMoney === null || orderNo === null) {
      let err = 'Please Check the Input of doctorName/PDTime/orderMoney/orderNo'
      return callback(err)
    } else {
      param = '尊敬的用户，您预约' + doctorName + '医生的' + PDTime + '时段面诊服务因医生停诊取消，所付款项' + Number(orderMoney) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + orderNo + '。您可登录肾事管家预约更多面诊服务，感谢您的支持。【肾事管家】'
    }
  }

  if (type === 'cancelRequest') {
    let doctorName = params.doctorName || ''
    if (doctorName === null || PDTime === null) {
      let err = 'Please Check the Input of doctorName/PDTime'
      return callback(err)
    } else {
      param = '尊敬的用户，您已提交“' + doctorName + '医生，' + PDTime + '时段”的面诊取消申请，专员会尽快进行审核。您可登录肾事管家预约更多面诊服务，感谢您的支持。【肾事管家】'
    }
  }
  if (type === 'cancelRefund') {
    let doctorName = params.doctorName || ''
    let orderMoney = params.orderMoney || 0
    let orderNo = params.orderNo || null
    if (doctorName === null || PDTime === null || orderMoney === null || orderNo === null) {
      let err = 'Please Check the Input of doctorName/PDTime/orderMoney/orderNo'
      return callback(err)
    } else {
      param = '尊敬的用户，您已成功取消“' + doctorName + '医生，' + PDTime + '时段”的面诊服务，所付款项' + Number(orderMoney) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + orderNo + '。您可登录肾事管家预约更多面诊服务，感谢您的支持。【肾事管家】'
    }
  }
  if (type === 'cancelReject') {
    let doctorName = params.doctorName || ''
    let orderNo = params.orderNo || null
    if (doctorName === null || PDTime === null || orderNo === null) {
      let err = 'Please Check the Input of doctorName/PDTime/orderNo'
      return callback(err)
    } else {
      param = '尊敬的用户，您提交“' + doctorName + '医生，' + PDTime + '时段”的面诊取消申请未通过审核，如有疑问请联系客服，附订单号' + orderNo + '。您可登录肾事管家预约更多面诊服务，感谢您的支持。【肾事管家】'
    }
  }

  if (type === 'request') {
    let doctorName = params.doctorName || ''
    let duration = params.duration || null
    if (doctorName === null || duration === null) {
      let err = 'Please Check the Input of doctorName/duration'
      return callback(err)
    } else {
      param = '尊敬的用户，您已提交' + doctorName + '医生的主管服务申请，服务时长为' + duration + '，医生会尽快进行审核。感谢您对肾事管家的支持。【肾事管家】'
    }
  }
  if (type === 'consent') {
    let doctorName = params.doctorName || ''
    let start = params.start || null
    let end = params.end || null
    let orderNo = params.orderNo || null
    if (doctorName === null || start === null || end === null || orderNo === null) {
      let err = 'Please Check the Input of doctorName/start/end/orderNo'
      return callback(err)
    } else {
      param = '尊敬的用户，' + doctorName + '医生通过了您的主管医生服务申请，服务的起止时间为“' + start + '”至“' + end + '”。您可登录肾事管家查看相应服务，感谢您的支持。如有疑问请联系客服，附订单号' + orderNo + '。【肾事管家】'
    }
  }
  if (type === 'reject') {
    let doctorName = params.doctorName || ''
    let reason = params.reason || '未知'
    let orderMoney = params.orderMoney || 0
    let orderNo = params.orderNo || null
    if (doctorName === null || reason === null || orderMoney === null || orderNo === null) {
      let err = 'Please Check the Input of doctorName/reason/orderMoney/orderNo'
      return callback(err)
    } else {
      param = '尊敬的用户，' + doctorName + '医生拒绝了您的主管医生服务申请，原因为“' + reason + '”，所付款项' + Number(orderMoney) / 100 + '元将在7个工作日内退回，请注意查收。如有疑问请联系客服，附订单号' + orderNo + '。您可登录肾事管家申请其他医生的主管医生服务，感谢您的支持。【肾事管家】'
    }
  }

  let postData = {
    mobile: mobile,
    message: param
  }
  let content = querystring.stringify(postData)

  let options = {
    host: 'sms-api.luosimao.com',
    path: '/v1/send.json',
    method: 'POST',
    auth: 'api:key-bbbd030227dbef849ed176a35e89a453',
    agent: false,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content.length
    }
  }

  let requestTest = https.request(options, function (res) {
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      let result = JSON.parse(chunk)
      if (Number(result.error) === 0 && result.msg === 'ok') {
        return callback(null)
      } else {
        let err = 'Error Code: ' + result.error
        return callback(err)
      }
    })
    res.on('end', function () {
      console.log(' --- 发送短信 --- type - ' + type + ' --- ' + mobile + ' process over')
    })
  })

  requestTest.write(content)
  requestTest.end()
}
