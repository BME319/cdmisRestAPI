// var config = require('../config')
var Team = require('../models/team')
var News = require('../models/news')

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
  // console.log(type)

  // 查询所有与用户相关的消息记录，并按照时间降序排列
  var query = {'$or': [{userId: userId}, {sendBy: userId}]}

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
  var type = req.query.type
  var _readOrNot = req.query.readOrNot

  var query = {}

  if (type !== null && type !== '' && type !== undefined) {
    query['type'] = type
    if (type === 'chat') {
      query = {'$or': [{type: 11}, {type: 12}, {type: 13}]}
    }
  }
  query['userId'] = userId
  // query['readOrNot'] = _readOrNot
  // if (userRole !== '' && userRole !== undefined) {
  query['userRole'] = userRole
  // }
  query['readOrNot'] = _readOrNot
    // 注意'_id'的生成算法包含时间，因此直接用'_id'进行降序排列
  var opts = {'sort': '-time'}

  News.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
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
    sendBy: sendBy
  }
  var query2 = {
    sendBy: userId,
    userId: sendBy
  }
  if (req.body.type !== null && req.body.type !== undefined) {
    newData['type'] = req.body.type
    query1['type'] = req.body.type
    query2['type'] = req.body.type
  }
  if (req.body.userRole !== null && req.body.userRole !== undefined) {
    newData['userRole'] = req.body.userRole
  }
  if (req.body.messageId !== null && req.body.messageId !== undefined) {
    newData['messageId'] = req.body.messageId
  }
  if (req.body.time !== null && req.body.time !== '' && req.body.time !== undefined) {
    newData['time'] = new Date(req.body.time)
  } else {
    newData['time'] = new Date()
  }
  if (req.body.title !== null && req.body.title !== undefined) {
    newData['title'] = req.body.title
  }
  if (req.body.description !== null && req.body.description !== undefined) {
    newData['description'] = req.body.description
  }
  if (req.body.url !== null && req.body.url !== undefined) {
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
    return res.json({resutl: '请填写readOrNot'})
  }
  // var userId = req.body.userId
  // var userId = req.session.userId
  // var sendBy = req.body.sendBy
  var userId = req.body.userId
  var sendBy = req.session.userId
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
    return res.json({resutl: '请填写type'})
  }
  var userId = req.body.userId
  // var sendBy = req.body.sendBy
  var sendBy = req.session.userId
  req.body.readOrNot = 1
  insertOneNews(userId, sendBy, req, res) // 用户发送消息记录
  req.body.readOrNot = 0
  var TeamId = userId
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
          console.log(Doctors)
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
