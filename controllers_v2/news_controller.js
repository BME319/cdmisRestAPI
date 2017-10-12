// var config = require('../config')
var Team = require('../models/team')
var News = require('../models/news')
var Message = require('../models/message')
var async = require('async')

// 根据类型查询消息链接 2017-04-05 GY
exports.getNews = function (req, res) {
  // if (req.query.userId === null || req.query.userId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写userId'})
  // }
 // if (req.query.type === null || req.query.type === '') {
 //  return res.json({resutl: '请填写type'});
 // }

  // var userId = req.query.userId
  var userId = req.session.userId
  var type = req.query.type  // type为选填,不填type = undefined
  var userRole = req.session.role
  // console.log(type)

  // 查询所有与用户相关的消息记录，并按照时间降序排列
  // var query = {'$or': [{userId: userId}, {sendBy: userId}]}
  var query = {'userId': userId}
  query['userRole'] = userRole
  if (type !== null && type !== '' && type !== undefined) {
    query['type'] = type
  }

    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
  var opts = {'sort': '-time'}

  News.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
  }, opts)
}

// 通过消息状态获取消息,用户为消息接收方
exports.getNewsByReadOrNot = function (req, res) {
  // if (req.query.userId === null || req.query.userId === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写userId'})
  // }
  if (req.query.readOrNot === null || req.query.readOrNot === '' || req.query.readOrNot === undefined) {
    return res.json({resutl: '请填写readOrNot'})
  }

  // var userId = req.query.userId
  var userId = req.session.userId
  // var userRole = req.query.userRole // 可以直接从session中获取role
  var userRole = req.session.role
  // console.log(userRole)
  // var userRole = req.session.role
  // var type = Number(req.query.type)
  let type = req.query.type
  var _readOrNot = Number(req.query.readOrNot)
  var query = {}

  if (type !== null && type !== '' && type !== undefined) {
    if (type === 'chat') {
      query = {'$or': [{type: 11}, {type: 12}, {type: 13}, {type: 15}]}
    } else {
      type = Number(req.query.type)
      query['type'] = type
    }
  }
  query['userId'] = userId
  query['readOrNot'] = _readOrNot
  query['userRole'] = userRole
  // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
  var opts = {'sort': '-time'}
  // console.log(query)
  News.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    // console.log('items', items)
    res.json({results: items})
  }, opts)
}

// 获取患者端所有type的未读消息和历史记录情况 2017-09-28 lgf
exports.getAllNotReadNews = function (req, res) {
  let userId = req.session.userId
  let userRole = req.session.role
  let opts = {'sort': '-time'}
  // console.log(query)

  async.parallel({
    type1: function (callback) {
      let query1 = {userId: userId, userRole: userRole, readOrNot: 0}
      query1['type'] = 1
      // console.log('query1', query1)
      News.getSome(query1, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query1.readOrNot
          delete query1.userRole
          query1['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query1, function (err, messages) {
            // console.log('query1', query1)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 1, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 1, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    },
    type3: function (callback) {
      let query3 = {userId: userId, userRole: userRole, readOrNot: 0}
      query3['type'] = 3
      // console.log('query3', query3)
      News.getSome(query3, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query3.readOrNot
          delete query3.userRole
          query3['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query3, function (err, messages) {
            // console.log('query3', query3)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 3, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 3, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    },
    type5: function (callback) {
      let query5 = {userId: userId, userRole: userRole, readOrNot: 0}
      query5['type'] = 5
      // console.log('query5', query5)
      News.getSome(query5, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query5.readOrNot
          delete query5.userRole
          query5['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query5, function (err, messages) {
            // console.log('query5', query5)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 5, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 5, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    },
    type6: function (callback) {
      let query6 = {userId: userId, userRole: userRole, readOrNot: 0}
      query6['type'] = 6
      // console.log('query6', query6)
      News.getSome(query6, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query6.readOrNot
          delete query6.userRole
          query6['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query6, function (err, messages) {
            // console.log('query6', query6)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 6, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 6, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    },
    type7: function (callback) {
      let query7 = {userId: userId, userRole: userRole, readOrNot: 0}
      query7['type'] = 7
      // console.log('query7', query7)
      News.getSome(query7, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query7.readOrNot
          delete query7.userRole
          query7['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query7, function (err, messages) {
            // console.log('query7', query7)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 7, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 7, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    },
    type8: function (callback) {
      let query8 = {userId: userId, userRole: userRole, readOrNot: 0}
      query8['type'] = 8
      // console.log('query8', query8)
      News.getSome(query8, function (err, items) {
        if (err) {
          return callback(err)
        }
        let readOrNot = 1
        let history = 0   // 1为有历史记录,0为无
        if (items.length === 0) { // 无未读news,则判断是否有历史消息
          delete query8.readOrNot
          delete query8.userRole
          query8['$or'] = [{readOrNot: 0}, {readOrNot: 1}]
          Message.getSome(query8, function (err, messages) {
            // console.log('query8', query8)
            if (err) {
              return callback(err)
            } else if (messages.length !== 0) {
              history = 1
            }
            let results = {type: 8, readOrNot, history, items: []}
            return callback(err, results)
            // res.json({results: {readOrNot, history, items: []}})
          })
        } else { // 有未读news
          // console.log('items', items)
          // res.json({results: items})
          readOrNot = 0
          history = 1
          let results = {type: 8, readOrNot, history, items}
          return callback(err, results)
          // return res.json({results: {readOrNot, history, items}})
        }
      }, opts)
    }
  }, function (err, results) {
    if (err) {
      return res.status(500).send(err.errmsg)
    } else {
      // let allNews = {type1: results.type1, type3: results.type3, type5: results.type5, type6: results.type6, type7: results.type7, type8: results.type8}
      return res.json({results: [results.type1, results.type3, results.type5, results.type6, results.type7, results.type8]})
    }
  })
}

// 修改某种类型消息的已读和未读状态
exports.changeNewsStatus = function (req, res) {
  let type = req.body.type || null
  let sendBy = req.body.sendBy || null
  let query = {
    userId: req.session.userId,
    userRole: req.session.role
  }
  // 允许使用messageId修改一条消息的已读未读状态
  let messageId = req.body.messageId || null
  if (messageId !== null) {
    query['messageId'] = messageId
  }
  if (type === null) {
    return res.json({resutl: '请填写type'})
  } else {
    if (type === 'chat') {
      query = {'$or': [{type: 11}, {type: 12}, {type: 13}, {type: 15}]}
    } else {
      type = Number(req.body.type)
      query['type'] = type
    }
  }
  if (sendBy !== null) { // 在群聊时，填写团队名或者病历号
    query['sendBy'] = sendBy
  }

  // var upObj = {
  //   readOrNot: 1  // 置为已读
  // }
  // edit by GY@2017-09-23 --type of 14 new need
  let upObj = {}
  if (type === 14) {
    query['readOrNot'] = 0 // 查找未读
    Message.getSome(query, function (err, messages) {
      if (err) {
        res.status(500).send(err)
      } else if (messages.length === 0) {
        upObj['readOrNot'] = 1
        var opts = {
          'multi': true, 'new': true
        }

        News.update(query, upObj, function (err, upmessage) {
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
      } else {
        console.log('changeNewsStatus_failed:_type14_not_all_read')
        return res.status(200).json({result: '全部更新成功', results: 'changeNewsStatus_failed:_type14_not_all_read'})
      }
    })
  } else {
    upObj['readOrNot'] = 1
  }

  var opts = {
    'multi': true, 'new': true
  }

  News.update(query, upObj, function (err, upmessage) {
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

function insertOneNews (userId, sendBy, req, res) {
 // if (req.body.userId === null || req.body.userId === '') {
 //  return res.json({result: '请填写userId'});
 // }
 // if (req.body.sendBy === null || req.body.sendBy === '') {
 //  return res.json({result: '请填写sendBy'});
 // }
 // if (req.body.readOrNot === null || req.body.readOrNot === '') {
 //  return res.json({resutl: '请填写readOrNot'});
 // }
 // var readOrNot = 0;
 // return res.json({messageId:req.newId})
 // console.log("11");
 // var ret=1;
 // console.log(1);
  var newData = {
  // userId: req.body.userId,
  // sendBy: req.body.sendBy,
    userId: userId,
    sendBy: sendBy,
    readOrNot: req.body.readOrNot
  }
  var query1 = {
    userId: userId,
    sendBy: sendBy,
    userRole: req.body.userRole // 防止接收方的不同角色的相应news信息被覆盖
  }
  var query2 = {
    sendBy: userId,
    userId: sendBy
  }
  if (req.body.type !== null && req.body.type !== '' && req.body.type !== undefined) {
    newData['type'] = req.body.type
    if (Number(req.body.type) === 15) {
      let caseType = req.body.caseType || 0
      newData['caseType'] = Number(caseType)
    }
    query1['type'] = req.body.type
    query2['type'] = req.body.type
  }
  if (req.body.userRole !== null && req.body.userRole !== '' && req.body.userRole !== undefined) {
    newData['userRole'] = req.body.userRole
  }
  if (req.body.messageId !== null && req.body.messageId !== '' && req.body.messageId !== undefined) {
    newData['messageId'] = req.body.messageId
  }
  if (req.body.time !== null && req.body.time !== '' && req.body.time !== undefined) {
    newData['time'] = new Date(req.body.time)
  } else {
    newData['time'] = new Date()
  }
  if (req.body.title !== null && req.body.title !== '' && req.body.title !== undefined) {
    newData['title'] = req.body.title
  }
  if (req.body.description !== null && req.body.description !== '' && req.body.description !== undefined) {
    newData['description'] = req.body.description
  }
  if (req.body.url !== null && req.body.url !== '' && req.body.url !== undefined) {
    newData['url'] = req.body.url
  }

  // return res.json({messageData:messageData})
  // 根据发送者和接收者的身份插入新的消息记录
  News.getOne(query1, function (err, item1) {
    if (err) {
      if (res !== undefined) {
        // console.log(2);
        return res.status(500).send(err.errmsg)
      }
      // return 500;
    }
    if (item1 === null) {
      // console.log(123);
      News.getOne(query2, function (err, item2) {
        if (err) {
          if (res !== undefined) {
            // console.log(3);
            return res.status(500).send(err.errmsg)
          }
          // return 500;
        }
        if (item2 === null) {
          // 无对应历史消息记录，insert
          var newnew = new News(newData)
          newnew.save(function (err, newInfo) {
            if (err) {
              if (res !== undefined) {
              // console.log(4);
              // console.log(err);
                return res.status(500).send(err.errmsg)
              }
              // return 500;
            }
            var newResults = newInfo
            if (res !== undefined) {
              res.json({result: '新建成功', newResults: newResults})
            }
            // return 0;
          })
        } else {
          // 有对应历史消息记录，update query2
          News.update(query2, newData, function (err, upmessage) {
            if (err) {
              if (res !== undefined) {
                return res.status(422).send(err.message)
              }
              // return 422;
            }

            if (upmessage.n !== 0 && upmessage.nModified === 0) {
              if (res !== undefined) {
                return res.json({result: '未修改！请检查修改目标是否与原来一致！', results: upmessage})
              }
              // return 1;
            }
            if (upmessage.n !== 0 && upmessage.nModified !== 0) {
              if (upmessage.n === upmessage.nModified) {
                if (res !== undefined) {
                  return res.json({result: '全部更新成功', results: upmessage})
                }
                // return 0;
              }
              if (res !== undefined) {
                return res.json({result: '未全部更新！', results: upmessage})
              }
              // return 2;
            }
          })
        }
      })
    } else {
      // update query1
      // return res.json({query: query, upObj: upObj});
      News.update(query1, newData, function (err, upmessage) {
        if (err) {
          if (res !== undefined) {
            return res.status(422).send(err.message)
          }
          // return 422;
        }

        if (upmessage.n !== 0 && upmessage.nModified === 0) {
          if (res !== undefined) {
            return res.json({result: '未修改！请检查修改目标是否与原来一致！', results: upmessage})
          }
          // return 1;
        }
        if (upmessage.n !== 0 && upmessage.nModified !== 0) {
          if (upmessage.n === upmessage.nModified) {
            if (res !== undefined) {
              return res.json({result: '全部更新成功', results: upmessage})
            }
            // return 0;
          }
          if (res !== undefined) {
            return res.json({result: '未全部更新！', results: upmessage})
          }
          // return 2;
        }
      })
      // res.json({results: item});
    }
  })
}
// 发送消息，用户为发送方,userId为接收方
exports.insertNews = function (req, res) {
  if (req.body.userId === null || req.body.userId === '' || req.body.userId === undefined) {
  // if (req.session.userId === null || req.session.userId === '' || req.session.userId === undefined) {
    return res.json({result: '请填写userId'})
  }
  // if (req.body.sendBy === null || req.body.sendBy === '' || req.body.sendBy === undefined) {
  //   return res.json({result: '请填写sendBy'})
  // }
  if (req.body.readOrNot === null || req.body.readOrNot === '' || req.body.readOrNot === undefined) {
    return res.json({result: '请填写readOrNot'})
  }
  if (req.body.userRole === null || req.body.userRole === '' || req.body.userRole === undefined) {
    return res.json({result: '请填写userRole'})
  }
  // var userId = req.body.userId
  // var userId = req.session.userId
  // var sendBy = req.body.sendBy
  var userId = req.body.userId
  // var sendBy = req.session.userId
  var sendBy
  if (req.session) {
    sendBy = req.session.userId
  } else {
    sendBy = req.body.sendBy
  }
  // var sendBy = req.session.userId || req.body.sendBy
  return insertOneNews(userId, sendBy, req, res)
 // console.log(status_code);
 // if(status_code === 0){
 //  return res.json({result:'全部更新成功'});
 // }
 // if(status_code === 1){
 //  return res.json({result:'未修改！请检查修改目标是否与原来一致！'});
 // }
 // if(status_code === 2){
 //  return res.json({result: '未全部更新！'});
 // }
 // if(status_code === 422){
 //  return res.status(422).send(422);
 // }
 // if(status_code === 500){
 //  return res.status(500).send(500);
 // }
}

// 发送团队消息，医生端会诊
exports.insertTeamNews = function (req, res) {
  if (req.body.userId === null || req.body.userId === '' || req.body.userId === undefined) {
    return res.json({result: '请填写userId'})
  }
  // if (req.body.sendBy === null || req.body.sendBy === '') {
  // if (req.session.userId === null || req.session.userId === '') {
  //   return res.json({result: '请填写sendBy'})
  // }
  if (req.body.type === null || req.body.type === '' || req.body.type === undefined) {
    return res.json({result: '请填写type'})
  }
  var userId = req.body.userId
  // var sendBy = req.body.sendBy
  // var sendBy = req.session.userId
  var sendBy
  if (req.session) {
    sendBy = req.session.userId
  } else {
    sendBy = req.body.sendBy
  }
  // var sendBy = req.session.userId || req.body.sendBy
  req.body.userRole = 'doctor'  // 医生会诊定义接收方均为doctor角色
  req.body.readOrNot = 1
  insertOneNews(userId, sendBy, req, res) // 用户发送消息记录
  req.body.readOrNot = 0
  var TeamId = req.body.teamId || userId
  var query = {
    teamId: TeamId
  }
  var DocId
    // req.body.status = _status;
  Team.getOne(query, function (err, team1) {
    if (err) {
      console.log(err)
            // return res.status(500).send('服务器错误, 用户查询失败!');
      return 500
    }
    if (team1 === null) {
      var TeamId = req.body.type  // type是区别于大专家团队的 小团队标签，也记录在 teams 的 teamId 中
      if (Number(TeamId) === 15) {
        TeamId = Number(req.body.caseType)
      }
      var query = {
        teamId: TeamId
      }
      var Doctors
   // req.body.status = _status;
      Team.getOne(query, function (err, team2) {
        if (err) {
          console.log(err)
           // return res.status(500).send('服务器错误, 用户查询失败!');
          return 500
        }

        if (team2 === null) {
        // return res.json({result:'不存在的teamId!'})

          return 1
        } else {
        // sendMesg
          Doctors = team2.members
          Doctors.push({'userId': team2.sponsorId})
          // console.log(Doctors)
          for (var i = 0; i < Doctors.length; i++) {
            DocId = Doctors[i].userId
            // if (DocId !== req.body.sendBy) {
            if (DocId !== sendBy) {
              insertOneNews(DocId, userId, req, res)
            }
          }
        }
      })
    } else {
         // sendMesg 给团队中除用户外的其他医生都需要转发一条消息
      Doctors = team1.members
      // 加入团队创建者
      Doctors.push({'userId': team1.sponsorId})
      for (var i = 0; i < Doctors.length; i++) {
        DocId = Doctors[i].userId
        // if (DocId !== req.body.sendBy) {
        if (DocId !== sendBy) {
          insertOneNews(DocId, userId, req)
        }
      }
    }
  })
}
