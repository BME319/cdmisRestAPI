// var  config = require('../config')
var Message = require('../models/message')
var News = require('../models/news')

// 根据类型查询消息链接 2017-04-05 GY
exports.getMessages = function (req, res) {
  // if (req.query.userId === null || req.query.userId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写userId'})
  // }
  // if (req.query.type === null || req.query.type === '') {
  //  return res.json({resutl: '请填写type'});
  // }

  // var userId = req.query.userId
  var userId = req.session.userId
  var userRole = req.session.role
  var type = req.query.type  // 选填
  let readOrNot = Number(req.query.readOrNot) || 0 // 根据readOrNot取message

  var query
  query = {userId: userId}

  if (type !== null && type !== '' && type !== undefined) {
    query['type'] = type
  } else { // type未填写时根据用户角色返回对应对色的type信息
    if (userRole === 'doctor') {
      query = {'$or': [{'type': 2}, {'type': 9}]}
    } else {
      query = {'$or': [{'type': 1}, {'type': 3}, {'type': 5}, {'type': 6}, {'type': 7}, {'type': 8}]}
    }
  }
  if (req.query.readOrNot) {
    query['readOrNot'] = readOrNot
  }

  // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
  var opts = {'sort': '-_id'}

  Message.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
  }, opts)
}

// 根据userId修改某种类型消息的已读状态 GY 2017-04-15
exports.changeMessageStatus = function (req, res) {
  // if (req.body.userId === null || req.body.userId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写userId'})
  // }

  // var query = {
  //   // userId: req.body.userId,
  //   userId: req.session.userId,
  //   type: req.body.type
  // }
  let query = {
    userId: req.session.userId
  }

  // 允许使用messageId修改一条消息的已读未读状态
  let messageId = req.body.messageId || null
  if (messageId !== null) {
    query['messageId'] = messageId
  } else {
    if (req.body.type === null || req.body.type === '' || req.body.type === undefined) {
      return res.json({resutl: '请填写type'})
    }
    query['type'] = req.body.type
  }

  var upObj = {
    readOrNot: req.body.readOrNot
  }

  var opts = {
    'multi': true, 'new': true
  }

  // return res.json({query: query, upObj: upObj});
  Message.update(query, upObj, function (err, upmessage) {
    if (err) {
      return res.status(422).send(err.message)
    }

    if (upmessage.n !== 0 && upmessage.nModified === 0) {
      return res.json({result: '未修改！请检查修改目标是否与原来一致！', results: upmessage})
    }
    if (upmessage.n !== 0 && upmessage.nModified !== 0) {
      if (upmessage.n === upmessage.nModified) {
        return res.json({result: '全部更新成功', results: upmessage})
      }
      return res.json({result: '未全部更新！', results: upmessage})
    }
  }, opts)
}

exports.insertMessage = function (req, res) {
  if (req.body.userId === null || req.body.userId === '' || req.body.userId === undefined) { // insurance传入，不用修改，消息接收方为患者或医生
    return res.json({result: '请填写userId'})
  }
  if (req.body.type === null || req.body.type === '' || req.body.type === undefined) {
    return res.json({resutl: '请填写type'})
  }
  var readOrNot = 0
  // return res.json({messageId:req.newId})

  var messageData = {
    messageId: req.newId,
    userId: req.body.userId,
    type: req.body.type,
    readOrNot: readOrNot
  }
  if (req.body.sendBy !== null && req.body.sendBy !== '' && req.body.sendBy !== undefined) {
    messageData['sendBy'] = req.body.sendBy
  } else {
    // 默认发送者为系统
    messageData['sendBy'] = 'System'
  }
  if (req.body.time !== null && req.body.time !== '' && req.body.time !== undefined) {
    messageData['time'] = new Date(req.body.time)
  } else {
    messageData['time'] = new Date()
  }
  if (req.body.title !== null && req.body.title !== '' && req.body.title !== undefined) {
    messageData['title'] = req.body.title
  }
  if (req.body.description !== null && req.body.description !== '' && req.body.description !== undefined) {
    messageData['description'] = req.body.description
  }
  if (req.body.url !== null && req.body.url !== '' && req.body.url !== undefined) {
    messageData['url'] = req.body.url
  }
  // return res.json({messageData:messageData})

  var newMessage = new Message(messageData)
  newMessage.save(function (err, messageInfo) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    var newResults
    if (req.body.InsMsg !== null) {
      newResults = {
        insMsg: req.body.InsMsg,
        message: messageInfo
      }
    } else {
      newResults = messageInfo
    }
    if (req.isOutOfRange === 1) {
      let queryN = {
        userId: req.body.userId,
        userRole: 'doctor',
        sendBy: req.body.sendBy,
        type: req.body.type
      }
      let upNews = {
        messageId: req.newId,
        readOrNot: 0,
        time: new Date(),
        title: req.body.title,
        description: req.body.description,
        url: ''
      }
      News.update(queryN, upNews, function (err, upNewsRes) {
        if (err) {
          return res.status(500).send(err.errmsg)
        }
        res.json({result: '新建成功', newResults: upNewsRes})
      }, {upsert: true})
    } else {
      res.json({result: '新建成功', newResults: newResults})
    }
  })
}
