var Forum = require('../models/forum')
var Forump = require('../models/forump')
var Reply = require('../models/reply')
var Alluser = require('../models/alluser')
var Forumuserinfo = require('../models/forumuserinfo')
var Forumpuserinfo = require('../models/forumpuserinfo')
var dataGatherFunc = require('../middlewares/dataGatherFunc')
var async = require('async')

exports.forumPosting = function (req, res) {
  async.auto({
    getUser: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
        return callback(err, item)
      })
    },
    Posting: ['getUser', function (results, callback) {
      if (results.getUser.status === 0) {
        let userId = results.getUser.userId || ''
        let name = results.getUser.name || ''
        let time = req.body.time || ''
        time = new Date(time)
        let title = req.body.title || ''
        let anonymous = req.body.anonymous || ''
        anonymous = Number(anonymous)
        let text = req.body.content || ''
        let photoURL = req.body.photoURL || ''
        let content = [{text: text}, {image: photoURL}]
        let postId = req.body.postId || ''
        let board = req.body.board || ''
        let query = {postId: postId}
        let obj = {postId: postId, sponsorId: userId, sponsorName: name, title: title, content: content, time: time, anonymous: anonymous, replyCount: 0, favoritesNum: 0, status: 0}
        if (board === 'doctor') {
          Forum.updateOne(query, obj, function (err, upforum) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              let query2 = {userId: userId}
              let obj2 = {
                $push: {
                  posts: {
                    postId: postId,
                    time: time
                  }
                }
              }
              Forumuserinfo.updateOne(query2, obj2, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  callback(null, {status: 0, msg: 'forum/posting接收成功'})
                }
              }, {upsert: true})
              }                
          }, {upsert: true})
        } else if (board === 'patient') {
          Forump.updateOne(query, obj, function (err, upforum) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              let query2 = {userId: userId}
              let obj2 = {
                $push: {
                  posts: {
                    postId: postId,
                    time: time
                  }
                }
              }
              Forumpuserinfo.updateOne(query2, obj2, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  callback(null, {status: 0, msg: 'forum/posting接收成功'})
                }
              }, {upsert: true})
              }                
          }, {upsert: true})
          }        
      } else if (results.getUser.status === -1) {
        callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['Posting', function (results, callback) {
      let params = req.body
      let outputs = {status: results.Posting.status, msg: results.Posting.msg}
      dataGatherFunc.traceRecord(req.body.phoneNo, 'forum/posting', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.Posting)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.deletePost = function (req, res) {
  async.auto({
    deleteP: function (callback) {
        if (req.body.board === 'doctor') {
          let postId = req.body.postId
          let query = {postId: postId}
          let obj = {
            $set: {status: 1}
          }
          let phoneNo = ''
          Forum.updateOne(query, obj, function (err, results) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              Forum.getOne(query, function (err, info) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let userId = info.sponsorId
                  Alluser.getOne({userId: userId}, function (err, userinfo) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      phoneNo = userinfo.phoneNo
                      let query2 = {userId: info.sponsorId}
                      let obj2 = {
                        $pull: {
                          posts: {
                          postId: postId
                        } 
                      }
                    }
                  Forumuserinfo.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/deletepost接收成功'})
                    }
                  })
                    }
                  })
                }
              })
            }
          })
        } else if (req.body.board === 'patient') {
          let postId = req.body.postId
          let query = {postId: postId}
          let obj = {
            $set: {status: 1}
          }
          let phoneNo = ''
          Forump.updateOne(query, obj, function (err, results) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else {
              Forump.getOne(query, function (err, info) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let userId = info.sponsorId
                  Alluser.getOne({userId: userId}, function (err, userinfo) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      phoneNo = userinfo.phoneNo
                      let query2 = {userId: info.sponsorId}
                      let obj2 = {
                        $pull: {
                          posts: {
                          postId: postId
                        } 
                      }
                    }
                  Forumpuserinfo.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/deletepost接收成功'})
                    }
                  })
                    }
                  })
                }
              })
            }
          })
        }
    },
    traceRecord: ['deleteP', function (results, callback) {
      let params = req.body
      let outputs = {status: results.deleteP.status, msg: results.deleteP.msg}
      dataGatherFunc.traceRecord(results.deleteP.phoneNo, 'forum/deletepost', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.deleteP)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.forumFavorite = function (req, res) {
  async.auto({
    getUser: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
        return callback(err, item)
      })
    },
    favorite: ['getUser', function (results, callback) {
      if (results.getUser.status === 0) {
        if (req.body.board === 'doctor') {
          let userId = results.getUser.userId
          let postId = req.body.postId
          Forum.getOne({postId: postId}, function (err, forumInfo) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else if (forumInfo === null) {
              callback(null, {status: 1, msg: err})
            } else {
              let time = forumInfo.time
              let query = {userId: userId}
              let obj = {
                $push: {
                  favorites: {
                    postId: postId,
                    time: time
                  }
                }
              }
              Forumuserinfo.updateOne(query, obj, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let query2 = {postId: postId}
                  let obj2 = {
                    $inc: {favoritesNum: 1}
                  }
                  Forum.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/favorite接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            }
          })
        } else if (req.body.board === 'patient') {
          let userId = results.getUser.userId
          let postId = req.body.postId
          Forump.getOne({postId: postId}, function (err, forumInfo) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else if (forumInfo === null) {
              callback(null, {status: 1, msg: err})
            } else {
              let time = forumInfo.time
              let query = {userId: userId}
              let obj = {
                $push: {
                  favorites: {
                    postId: postId,
                    time: time
                  }
                }
              }
              Forumpuserinfo.updateOne(query, obj, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let query2 = {postId: postId}
                  let obj2 = {
                    $inc: {favoritesNum: 1}
                  }
                  Forump.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/favorite接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            }
          })
        }
      } else if (results.getUser.status === -1) {
        callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['favorite', function (results, callback) {
      let params = req.body
      let outputs = {status: results.favorite.status, msg: results.favorite.msg}
      dataGatherFunc.traceRecord(req.body.phoneNo, 'forum/favorite', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.favorite)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.deleteFavorite = function (req, res) {
  async.auto({
    getUser: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
        return callback(err, item)
      })
    },
    deleteF: ['getUser', function (results, callback) {
      if (results.getUser.status === 0) {
        if (req.body.board === 'doctor') {
          let userId = results.getUser.userId
          let postId = req.body.postId
          Forum.getOne({postId: postId}, function (err, forumInfo) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else if (forumInfo === null) {
              callback(null, {status: 1, msg: err})
            } else {
              let time = forumInfo.time
              let query = {userId: userId}
              let obj = {
                $pull: {
                  favorites: {
                    postId: postId
                  }
                }
              }
              Forumuserinfo.updateOne(query, obj, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let query2 = {postId: postId}
                  let obj2 = {
                    $inc: {favoritesNum: -1}
                  }
                  Forum.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/deletefavorite接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            }
          })
        } else if (req.body.board === 'patient') {
          let userId = results.getUser.userId
          let postId = req.body.postId
          Forump.getOne({postId: postId}, function (err, forumInfo) {
            if (err) {
              callback(null, {status: 1, msg: err})
            } else if (forumInfo === null) {
              callback(null, {status: 1, msg: err})
            } else {
              let time = forumInfo.time
              let query = {userId: userId}
              let obj = {
                $pull: {
                  favorites: {
                    postId: postId
                  }
                }
              }
              Forumpuserinfo.updateOne(query, obj, function (err, upforum) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  let query2 = {postId: postId}
                  let obj2 = {
                    $inc: {favoritesNum: -1}
                  }
                  Forump.updateOne(query2, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/deletefavorite接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            }
          })
        }
      } else if (results.getUser.status === -1) {
        callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['deleteF', function (results, callback) {
      let params = req.body
      let outputs = {status: results.deleteF.status, msg: results.deleteF.msg}
      dataGatherFunc.traceRecord(req.body.phoneNo, 'forum/deletefavorite', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.deleteF)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}

exports.forumComment = function (req, res) {
  async.auto({
    getUser: function (callback) {
      dataGatherFunc.userIDbyPhone(req.body.phoneNo, req.body.board, function (err, item) {
        return callback(err, item)
      })
    },
    comment: ['getUser', function (results, callback) {
      if (results.getUser.status === 0) {
        dataGatherFunc.getSeriesNo(14, function (err, num) {
          if (err) {
            callback(null, {status: 1, msg: '系统错误,接收失败'})
          } else {
            if (req.body.board === 'doctor') {
              let userId = results.getUser.userId
              let name = results.getUser.name
              let postId = req.body.postId
              let content = req.body.content
              let time = req.body.time
              time = new Date(time)
              let commentId = num
              let obj = {
                $set: {
                  userId: userId,
                  userName: name,
                  time: time,
                  content: content,
                  status: 0,
                }
              }
              query = {postId: postId, commentId: commentId}
              Reply.updateOne(query, obj, function (err, upreply) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  obj2 = {
                    $inc: {replyCount: 1}
                  }
                  Forum.updateOne(query, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/comment接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            } else if (req.body.board === 'patient') {
              let userId = results.getUser.userId
              let name = results.getUser.name
              let postId = req.body.postId
              let content = req.body.content
              let time = req.body.time
              time = new Date(time)
              let commentId = num
              let obj = {
                $set: {
                  userId: userId,
                  userName: name,
                  time: time,
                  content: content,
                  status: 0,
                }
              }
              query = {postId: postId, commentId: commentId}
              Reply.updateOne(query, obj, function (err, upreply) {
                if (err) {
                  callback(null, {status: 1, msg: err})
                } else {
                  obj2 = {
                    $inc: {replyCount: 1}
                  }
                  Forump.updateOne(query, obj2, function (err, upforum) {
                    if (err) {
                      callback(null, {status: 1, msg: err})
                    } else {
                      callback(null, {status: 0, msg: 'forum/comment接收成功'})
                    }
                  })
                }
              }, {upsert: true})
            }
          }
        })
      } else if (results.getUser.status === -1) {
        callback(null, {status: 1, msg: '用户不存在，请检查phoneNo'})
      } else {
        callback(null, {status: 1, msg: '系统错误'})
      }
    }],
    traceRecord: ['comment', function (results, callback) {
      let params = req.body
      let outputs = {status: results.comment.status, msg: results.comment.msg}
      dataGatherFunc.traceRecord(req.body.phoneNo, 'forum/comment', params, outputs, function (err, item) {
        return callback(err, item)
      })
    }]
  }, function (err, results) {
    if (err) {
      return res.json({msg: err, status: 1})
    } else if (results.traceRecord.status === 0) {
      return res.json(results.comment)
    } else {
      return res.json({msg: 'Server Error!', status: 1})
    }
  })
}