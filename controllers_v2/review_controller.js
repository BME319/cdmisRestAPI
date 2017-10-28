// var config = require('../config')
var webEntry = require('../settings').webEntry
var Alluser = require('../models/alluser')
var commonFunc = require('../middlewares/commonFunc')
// var async = require('async')

// 保存审核信息 2017-07-05 GY
exports.postReviewInfo = function (acl) {
  return function (req, res) {
    if (req.body.doctorId === null || req.body.doctorId === '' || req.body.doctorId === undefined) {
      return res.status(412).json({results: '请填写doctorId'})
    }
    // if (req.body.adminId === null || req.body.adminId === '' || req.body.adminId === undefined) {
    //   return res.status(412).json({results: '请填写adminId'});
    // }
    var queryAdmin = {_id: req.session._id}

    Alluser.getOne(queryAdmin, function (err, reviewItem) {
      if (err) {
        return res.status(500).send(err)
      }
      if (reviewItem === null || reviewItem === undefined || reviewItem === '') {
        return res.status(401).json({results: 'admin查找失败'})
      } else if (reviewItem.role.indexOf('admin') === -1) {
        return res.status(401).json({results: '无审核权限'})
      } else {
        var adminId = reviewItem._id
        var reviewDate
        if (req.body.reviewDate === null || req.body.reviewDate === '' || req.body.reviewDate === undefined) {
          reviewDate = commonFunc.getNowDate()
        } else {
          reviewDate = req.body.reviewDate
        }
        if (req.body.reviewStatus === 1 || req.body.reviewStatus === 2) {
          var status = req.body.reviewStatus
        } else {
          return res.status(400).json({results: '无效的审核状态'})
        }
        var queryDoctor = {userId: req.body.doctorId}

        Alluser.getOne(queryDoctor, function (err, doctorItem) {
          if (err) {
            return res.status(500).send(err)
          }
          var upObj = {
            reviewStatus: status,
            reviewDate: reviewDate,
            adminId: adminId
          }
          let reviewContent = req.body.reviewContent || null
          if (status === 2) {
            if (reviewContent === null) {
              return res.status(412).json({results: '请填写reviewContent'})
            } else {
              upObj['reviewContent'] = reviewContent
            }
          }

          var opts = {
            new: true,
            fields: {
              'class_info': 0, 'VIP': 0, 'doctors': 0, 'diagnosisInfo': 0
            }
          }
          Alluser.updateOne(queryDoctor, upObj, function (err, upReview) {
            if (err) {
              return res.status(500).send(err)
            }
            if (upReview === null) {
              return res.status(404).json({results: '不存在的doctorId'})
            } else if (Number(status) === 1) {
              let roleList = doctorItem.role
              roleList.pull('guest')
              roleList.push('doctor')
              let upDoc = {
                $set: {
                  role: roleList
                }
              }
              Alluser.updateOne(queryDoctor, upDoc, function (err, itemDoc) {
                if (err) {
                  return res.status(500).send(err)
                } else {
                  let userId = req.body.doctorId
                  let roles = 'doctor'
                  acl.addUserRoles(userId, roles, function (err) {
                    if (err) {
                      return res.status(500).send(err.errmsg)
                    }
                              // res.json({results: {status:1,msg:'success'}});
                    return res.json({results: '审核信息保存成功', editResults: upReview})
                  })
                }
              }, {new: true})
            } else {
              return res.json({results: '审核信息保存成功', editResults: upReview})
            }
          }, opts)
        })
      }
    })
  }
}

// 根据医生ID获取资质证书相关信息 2017-07-05 GY
exports.getCertificate = function (req, res) {
  if (req.query.doctorId === null || req.query.doctorId === '' || req.query.doctorId === undefined) {
    return res.status(412).json({results: '请填写doctorId'})
  }
  var query = {userId: req.query.doctorId, $or: [{role: 'doctor'}, {role: 'guest'}]}
  var opts = ''
  var fields = {
    'userId': 1,
    'name': 1,
    'gender': 1,
    'certificatePhotoUrl': 1,
    'practisingPhotoUrl': 1,
    'description': 1,
    'major': 1,
    'role': 1,
    'province': 1,
    'city': 1,
    'workUnit': 1,
    'department': 1,
    'title': 1,
    'phoneNo': 1
  }
  Alluser.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err)
    }
    if (item === null) {
      return res.status(404).json({results: '不存在的userId'})
    } else if (item.role.indexOf('doctor') === -1 && item.role.indexOf('guest') === -1) {
      return res.status(404).json({results: 'userId存在但角色不是doctor'})
    } else {
      item.certificatePhotoUrl = commonFunc.adaptPrefix(item.certificatePhotoUrl)
      item.practisingPhotoUrl = commonFunc.adaptPrefix(item.practisingPhotoUrl)
      return res.json({results: item})
    }
  }, opts, fields)
}

// 根据是否审核获取信息列表 2017-07-05 GY
// 2017-08-23 YQC 修改 输入reviewStatus-1-返回审核通过列表，0-返回审核拒绝／未审核列表
exports.getReviewInfo = function (req, res) {
  let status = req.query.reviewStatus || null
  let query = {}
  if (status === null) {
    return res.status(412).json({results: '请填写reviewStatus'})
  } else if (Number(status) === 0 || Number(status) === 2) {
    query = {
      reviewStatus: Number(status),
      role: 'guest'
    }
  } else if (Number(status) === 1) {
    query = {reviewStatus: 1, role: 'doctor'}
  } else {
    return res.status(412).json({results: '非法输入'})
  }

  if (req.query.name !== null && req.query.name !== '' && req.query.name !== undefined) {
    query['name'] = new RegExp(req.query.name)
  }

  let limit = req.query.limit || null
  if (limit === null) {
    limit = 0
  } else {
    limit = Number(req.query.limit)
  }
  let skip = req.query.skip || null
  if (skip === null) {
    skip = 0
  } else {
    skip = Number(req.query.skip)
  }

  let opts = {limit: limit, skip: skip}
  let fields = {
    'userId': 1,
    'name': 1,
    'gender': 1,
    'birthday': 1,
    'workUnit': 1,
    'department': 1,
    'title': 1,
    'IDNo': 1,
    'reviewStatus': 1,
    'reviewDate': 1,
    'adminId': 1,
    'reviewContent': 1,
    'phoneNo': 1,
    'role': 1,
    'creationTime': 1
  }
  let populate = {'path': 'adminId', 'select': {'userId': 1, 'name': 1}}

  let _Url = ''
  let reviewStatusUrl = 'reviewStatus=' + req.query.reviewStatus
  let limitUrl = ''
  let skipUrl = ''

  if (limit !== 0 || skip !== 0) {
    limitUrl = 'limit=' + String(limit)
    skipUrl = 'skip=' + String(skip + limit)
  }
  if (reviewStatusUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    _Url = _Url + '?'
    if (reviewStatusUrl !== '') {
      _Url = _Url + reviewStatusUrl + '&'
    }
    if (limitUrl !== '') {
      _Url = _Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      _Url = _Url + skipUrl + '&'
    }
    _Url = _Url.substr(0, _Url.length - 1)
  }
  var nexturl = webEntry.domain + '/api/v2/review/reviewInfo' + _Url

  Alluser.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    }
    if (items.length === 0) {
      return res.json({results: []})
    } else {
      return res.json({results: items, nexturl: nexturl})
    }
  }, opts, fields, populate)
}

// 根据审核状态获取当前总人数 2017-07-15 GY
// 2017-08-23 YQC 修改 输入reviewStatus-1-返回审核通过人数，0-返回审核拒绝／未审核人数
exports.countByStatus = function (req, res) {
  let status = req.query.reviewStatus || null
  let query = {}
  if (status === null) {
    return res.status(412).json({results: '请填写reviewStatus'})
  } else if (Number(status) === 0 || Number(status) === 2) {
    query = {
      reviewStatus: Number(status),
      role: 'guest'
    }
  } else if (Number(status) === 1) {
    query = {reviewStatus: 1, role: 'doctor'}
  } else {
    return res.status(412).json({results: '非法输入'})
  }
  Alluser.countSome(query, function (err, count) {
    if (err) {
      return res.status(500).send(err)
    }
    return res.json({results: count})
  })
}
