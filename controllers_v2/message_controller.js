<<<<<<< HEAD
var	config = require('../config'),
  Message = require('../models/message')

// 根据类型查询消息链接 2017-04-05 GY
exports.getMessages = function (req, res) {
  if (req.query.userId == null || req.query.userId == '') {
    return res.json({result: '请填写userId'})
  }
	// if (req.query.type == null || req.query.type == '') {
	// 	return res.json({resutl: '请填写type'});
	// }

  var userId = req.query.userId
  var type = req.query.type

  if (userId == null || userId == '') {
    return res.json({result: '请填写userId!'})
  }

  var query
  query = {userId: userId}

  if (type != '' && type != undefined) {
=======
// var  config = require('../config')
var Message = require('../models/message')

// 根据类型查询消息链接 2017-04-05 GY
exports.getMessages = function (req, res) {
  if (req.query.userId === null || req.query.userId === '') {
    return res.json({result: '请填写userId'})
  }
  // if (req.query.type === null || req.query.type === '') {
  //  return res.json({resutl: '请填写type'});
  // }

  var userId = req.query.userId
  var type = req.query.type

  if (userId === null || userId === '') {
    return res.json({result: '请填写userId!'})
  }

  var query
  query = {userId: userId}

  if (type !== '' && type !== undefined) {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    query['type'] = type
  }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
  var opts = {'sort': '-_id'}

  Message.getSome(query, function (err, items) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: items})
=======
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  }, opts)
}

// 根据userId修改某种类型消息的已读状态 GY 2017-04-15
exports.changeMessageStatus = function (req, res) {
<<<<<<< HEAD
  if (req.body.userId == null || req.body.userId == '') {
    return res.json({result: '请填写userId'})
  }
  if (req.body.type == null || req.body.type == '') {
=======
  if (req.body.userId === null || req.body.userId === '') {
    return res.json({result: '请填写userId'})
  }
  if (req.body.type === null || req.body.type === '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    return res.json({resutl: '请填写type'})
  }

  var query = {
    userId: req.body.userId,
    type: req.body.type
  }

  var upObj = {
    readOrNot: req.body.readOrNot
  }

  var opts = {
    'multi': true, 'new': true
  }

<<<<<<< HEAD
	// return res.json({query: query, upObj: upObj});
=======
  // return res.json({query: query, upObj: upObj});
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  Message.update(query, upObj, function (err, upmessage) {
    if (err) {
      return res.status(422).send(err.message)
    }
<<<<<<< HEAD

    if (upmessage.n != 0 && upmessage.nModified == 0) {
      return res.json({result: '未修改！请检查修改目标是否与原来一致！', results: upmessage})
    }
    if (upmessage.n != 0 && upmessage.nModified != 0) {
      if (upmessage.n == upmessage.nModified) {
        return res.json({result: '全部更新成功', results: upmessage})
      }
      return res.json({result: '未全部更新！', results: upmessage})
    }
  }, opts)
}

exports.insertMessage = function (req, res) {
  if (req.body.userId == null || req.body.userId == '') {
    return res.json({result: '请填写userId'})
  }
  if (req.body.type == null || req.body.type == '') {
    return res.json({resutl: '请填写type'})
  }
  var readOrNot = 0
	// return res.json({messageId:req.newId})
=======

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
  if (req.body.userId === null || req.body.userId === '') {
    return res.json({result: '请填写userId'})
  }
  if (req.body.type === null || req.body.type === '') {
    return res.json({resutl: '请填写type'})
  }
  var readOrNot = 0
  // return res.json({messageId:req.newId})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832

  var messageData = {
    messageId: req.newId,
    userId: req.body.userId,
    type: req.body.type,
    readOrNot: readOrNot
  }
<<<<<<< HEAD
  if (req.body.sendBy != null && req.body.sendBy != '') {
    messageData['sendBy'] = req.body.sendBy
  }	else {
		// 默认发送者为系统
    messageData['sendBy'] = 'System'
  }
  if (req.body.time != null && req.body.time != '') {
=======
  if (req.body.sendBy !== null && req.body.sendBy !== '') {
    messageData['sendBy'] = req.body.sendBy
  } else {
    // 默认发送者为系统
    messageData['sendBy'] = 'System'
  }
  if (req.body.time !== null && req.body.time !== '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    messageData['time'] = new Date(req.body.time)
  } else {
    messageData['time'] = new Date()
  }
<<<<<<< HEAD
  if (req.body.title != null) {
    messageData['title'] = req.body.title
  }
  if (req.body.description != null) {
    messageData['description'] = req.body.description
  }
  if (req.body.url != null) {
    messageData['url'] = req.body.url
  }
	// return res.json({messageData:messageData})
=======
  if (req.body.title !== null) {
    messageData['title'] = req.body.title
  }
  if (req.body.description !== null) {
    messageData['description'] = req.body.description
  }
  if (req.body.url !== null) {
    messageData['url'] = req.body.url
  }
  // return res.json({messageData:messageData})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832

  var newMessage = new Message(messageData)
  newMessage.save(function (err, messageInfo) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}

    	if (req.body.InsMsg != null) {
    		var newResults = {
    			insMsg: req.body.InsMsg,
    			message: messageInfo
    		}
    	}    	else {
    		var newResults = messageInfo
    	}

    	res.json({result: '新建成功', newResults: newResults})
=======
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

    res.json({result: '新建成功', newResults: newResults})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  })
}
