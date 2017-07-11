
var User = require('../models/user')
var request = require('request')

var jpushUrl = 'https://api.im.jpush.cn/v1/'
var doctorKey = 'Basic Y2YzMmI5NDQ0NGM0ZWFhY2VmODY5MDNlOmJhYjI4M2NkOWQzMDY4ZTE5NDYwODgzMg=='
var patientKey = 'Basic ZmU3YjliYTA2OWI4MDMxNjY1MzI3NGU0OmRmMGMyMjY3MjM1YzNkNDA5Y2U2MTE1ZQ=='

// 注册用户
exports.register = function (req, res) {
  var username = req.body.username
  var password = req.body.password
  var nickname = username
  var flag = req.body.flag
  var key

  var query = {userId: username}
  User.getOne(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
// res.json({results: item});
    if (item != null) {
      nickname = item.userName
    }

    if (flag === 'doctor') {
      key = doctorKey
    } else if (flag === 'patient') {
      key = patientKey
    } else {
      return res.status(400).send('flag Error')
    }

    var jsondata = [{'username': username, 'password': password, 'nickname': nickname}]

    request({
      url: jpushUrl + 'users',
      method: 'POST',
      body: jsondata,
      json: true,
      headers: {
        'Authorization': key,
        'Content-Type': 'application/json'
      }
    }, function (err, response, body) {
      if (!err) {
        res.json({results: body})
      } else {
        return res.status(500).send('Error')
      }
    })
  })
}

// 创建群组
exports.createGroup = function (req, res) {
  var ownerUsername = req.body.owner_username
  var name = req.body.name
  var membersUsername = req.body.members_username
  var desc = req.body.desc
  var flag = req.body.flag
  var key

  if (flag === 'doctor') {
    key = doctorKey
  } else if (flag === 'patient') {
    key = patientKey
  } else {
    return res.status(400).send('flag Error')
  }

  var jsondata = {
    'owner_username': ownerUsername,
    'name': name,
    'members_username': membersUsername,
    'desc': desc
  }

  request({
    url: jpushUrl + 'groups',
    method: 'POST',
    body: jsondata,
    json: true,
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json'
    }
  }, function (err, response, body) {
    if (!err) {
      res.json({results: body})
    } else {
      return res.status(500).send('Error')
    }
  })
}

// 更新群组成员
exports.updateGroup = function (req, res) {
  var groupId = req.body.groupId
  var add = req.body.add
  var remove = req.body.remove
  var flag = req.body.flag
  var key

  if (flag === 'doctor') {
    key = doctorKey
  } else if (flag === 'patient') {
    key = patientKey
  } else {
    return res.status(400).send('flag Error')
  }

  var jsondata = {
    'add': add,
    'remove': remove
  }

  request({
    url: jpushUrl + 'groups/' + groupId + '/members',
    method: 'POST',
    body: jsondata,
    json: true,
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json'
    }
  }, function (err, response, body) {
    if (!err) {
      res.json({results: body})
    } else {
      return res.status(500).send('Error')
    }
  })
}
