var Forump = require('../models/forump')
var Alluser = require('../models/alluser')
var Forumpuserinfo = require('../models/forumpuserinfo')
var webEntry = require('../settings').webEntry
var Reply = require('../models/reply')
var commonFunc = require('../middlewares/commonFunc')

exports.forumpPosting = function (req, res) {
  let userId = req.session.userId || ''
  let time = req.body.time || ''
  time = new Date(time)
  let title = req.body.title || ''
  let anonymous = req.body.anonymous || ''
  anonymous = Number(anonymous)
  let content = req.body.content || ''
  let postId = req.newId || ''
  if (title === '') {
    res.status(400).json({code: 1, msg: '请输入标题'})
  } else if (content === '') {
    res.status(400).json({code: 1, msg: '请输入内容'})
  } else {
    let query = {postId: postId}
    Alluser.getOne({userId: userId}, function (err, alluserInfo) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      let name = alluserInfo.name
      let obj = {postId: postId, sponsorId: userId, sponsorName: name, title: title, content: content, time: time, anonymous: anonymous, replyCount: 0, favoritesNum: 0, status: 0}
      Forump.updateOne(query, obj, function (err, upforump) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        let query2 = {userId: userId}
        let obj2 = {
          $push: {
            posts: {
              postId: postId,
              time: time
            }
          }
        }
        Forumpuserinfo.updateOne(query2, obj2, function (err, upforump) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        }, {upsert: true})
      }, {upsert: true})
    })
  }
}

exports.getAllposts = function (req, res) {
  let userId = req.session.userId
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let title = req.query.title || '' 
  let array = [
    {$match: {status: 0}},
    {
      $lookup: {
        from: 'allusers',
        localField: 'sponsorId',
        foreignField: 'userId',
        as: 'userinfo'
      }
    },
    {$unwind: {path: '$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        avatar: '$userinfo.photoUrl'
      }
    },
    {
      $lookup: {
        from: 'forumpuserinfos',
        localField: 'postId',
        foreignField: 'favorites.postId',
        as: 'favorites'
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'avatar': 1,
        favorites: '$favorites.userId'
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'avatar': 1,
        favoritesstatus: {
          $cond: {if: {$in: [userId, '$favorites']},
            then: 1,
            else: 0
          }
        }
      }
    },
    {$sort: {time: -1}},
    {$skip: skip},
    {$limit: limit}
  ]
  if (title !== '') {
    array.splice(
      0,
      0,
      {$match: {title: {$regex: title}}}
    )
  }

  let titleUrl = ''
  let limitUrl = ''
  let skipUrl = ''
  let Url = ''

  // 检查查询条件存在并设定
  if (title !== null) {
    titleUrl = 'title=' + title
  }
  if (limit !== null) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip !== null) {
    skipUrl = 'skip=' + String(skip + limit)
  }

  // 路径尾部添加查询条件
  if (titleUrl !== '' || limitUrl !== '' || skipUrl !== '') {
    Url = Url + '?'
    if (titleUrl !== '') {
      Url = Url + titleUrl + '&'
    }
    if (limitUrl !== '') {
      Url = Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      Url = Url + skipUrl + '&'
    }
    Url = Url.substr(0, Url.length - 1)
  }
  let nexturl = webEntry.domain + '/api/v2/forump/allposts' + Url
  // let nexturl = 'localhost:4060/api/v2/forump/allposts' + Url

  Forump.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    for (var i = results.length - 1; i >= 0; i--) {
      results[i].avatar = commonFunc.adaptPrefix(results[i].avatar)
    }
    // console.log(results)
    res.json({data: {results: results, nexturl: nexturl}, code: 0, msg: 'success'})
  })
}

exports.getMycollection = function (req, res) {
  let userId = req.session.userId
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let array = [
    {$match: {userId: userId}},
    {
      $project: {
        'userId': 1,
        favorites: '$favorites.postId'
      }
    },
    {
      $lookup: {
        from: 'forumps',
        localField: 'favorites',
        foreignField: 'postId',
        as: 'collections'
      }
    },
    {$unwind: {path: '$collections', preserveNullAndEmptyArrays: false}},
    {
      $project: {
        postId: '$collections.postId',
        sponsorId: '$collections.sponsorId',
        sponsorName: '$collections.sponsorName',
        title: '$collections.title',
        time: '$collections.time',
        anonymous: '$collections.anonymous',
        replyCount: '$collections.replyCount',
        favoritesNum: '$collections.favoritesNum',
        status: '$collections.status'
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'sponsorId',
        foreignField: 'userId',
        as: 'userinfo'
      }
    },
    {$unwind: {path: '$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'status': 1,
        avatar: '$userinfo.photoUrl'
      }
    },
    {$match: {status: 0}},
    {$sort: {time: -1}},
    {$skip: skip},
    {$limit: limit}
  ]

  let titleUrl = ''
  let limitUrl = ''
  let skipUrl = ''
  let Url = ''

  // 检查查询条件存在并设定
  if (limit !== null) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip !== null) {
    skipUrl = 'skip=' + String(skip + limit)
  }

  // 路径尾部添加查询条件
  if (limitUrl !== '' || skipUrl !== '') {
    Url = Url + '?'
    if (limitUrl !== '') {
      Url = Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      Url = Url + skipUrl + '&'
    }
    Url = Url.substr(0, Url.length - 1)
  }
  let nexturl = webEntry.domain + '/api/v2/forump/mycollection' + Url

  Forumpuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    for (var i = results.length - 1; i >= 0; i--) {
      results[i].avatar = commonFunc.adaptPrefix(results[i].avatar)
    }
    res.json({data: {results: results, nexturl: nexturl}, code: 0, msg: 'success'})
  })
}

exports.getMyposts = function (req, res) {
  let userId = req.session.userId
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let array = [
    {$match: {userId: userId}},
    {
      $project: {
        'userId': 1,
        posts: '$posts.postId',
        favorites: {$ifNull: ['$favorites.postId', []]}
      }
    },
    {
      $lookup: {
        from: 'forumps',
        localField: 'posts',
        foreignField: 'postId',
        as: 'collections'
      }
    },
    {$unwind: {path: '$collections', preserveNullAndEmptyArrays: false}},
    {
      $project: {
        '_id': 0,
        postId: '$collections.postId',
        sponsorId: '$collections.sponsorId',
        sponsorName: '$collections.sponsorName',
        title: '$collections.title',
        time: '$collections.time',
        anonymous: '$collections.anonymous',
        replyCount: '$collections.replyCount',
        favoritesNum: '$collections.favoritesNum',
        'favorites': 1
      }
    },
    {
      $lookup: {
        from: 'allusers',
        localField: 'sponsorId',
        foreignField: 'userId',
        as: 'userinfo'
      }
    },
    {$unwind: {path: '$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        avatar: '$userinfo.photoUrl',
        'favorites': 1
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'avatar': 1,
        favoritesstatus: {
          $cond: {if: {$in: ['$postId', '$favorites']},
            then: 1,
            else: 0
          }
        }
      }
    },
    {$sort: {time: -1}},
    {$skip: skip},
    {$limit: limit}
  ]
  let titleUrl = ''
  let limitUrl = ''
  let skipUrl = ''
  let Url = ''

  // 检查查询条件存在并设定
  if (limit !== null) {
    limitUrl = 'limit=' + String(limit)
  }
  if (skip !== null) {
    skipUrl = 'skip=' + String(skip + limit)
  }

  // 路径尾部添加查询条件
  if (limitUrl !== '' || skipUrl !== '') {
    Url = Url + '?'
    if (limitUrl !== '') {
      Url = Url + limitUrl + '&'
    }
    if (skipUrl !== '') {
      Url = Url + skipUrl + '&'
    }
    Url = Url.substr(0, Url.length - 1)
  }
  let nexturl = webEntry.domain + '/api/v2/forump/myposts' + Url
  Forumpuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    for (var i = results.length - 1; i >= 0; i--) {
      results[i].avatar = commonFunc.adaptPrefix(results[i].avatar)
    }
    // console.log(results)
    res.json({data: {results: results, nexturl: nexturl}, code: 0, msg: 'success'})
  })
}

exports.getPostContent = function (req, res) {
  let userId = req.session.userId
  let postId = req.query.postId
  let array = [
    {$match: {postId: postId}},
    {
      $lookup: {
        from: 'allusers',
        localField: 'sponsorId',
        foreignField: 'userId',
        as: 'userinfo'
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        // 'replies': 1,
        'content': 1,
        avatar: '$userinfo.photoUrl'
      }
    },
    {$unwind: {path: '$avatar', preserveNullAndEmptyArrays: true}},
    {
      $lookup: {
        from: 'forumpuserinfos',
        localField: 'postId',
        foreignField: 'favorites.postId',
        as: 'favorites'
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'avatar': 1,
        'content': 1,
        favorites: '$favorites.userId'
      }
    },
    {
      $project: {
        'postId': 1,
        'sponsorId': 1,
        'sponsorName': 1,
        'time': 1,
        'title': 1,
        'anonymous': 1,
        'replyCount': 1,
        'favoritesNum': 1,
        'avatar': 1,
        'content': 1,
        favoritesstatus: {
          $cond: {if: {$in: [userId, '$favorites']},
            then: 1,
            else: 0
          }
        }
      }
    }
  ]
  Forump.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    // res.json({data: results[0], code: 0, msg: 'success'})
    if (!results.length) {
      res.status(500).json({code: 1, msg: 'postId不存在'})
    } else {
      // console.log(results)
      let result1 = results[0]
      let array2 = [
        {$match: {postId: postId, status: 0}},
        {
          $project: {
            'commentId': 1,
            'userId': 1,
            'userName': 1,
            'time': 1,
            'depth': 1,
            'content': 1,
            // at: '$replies.at'
            'replies': 1
          }
        },
        {
          $lookup: {
            from: 'allusers',
            localField: 'userId',
            foreignField: 'userId',
            as: 'userinfo'
          }
        },
        {
          $project: {
            'commentId': 1,
            'userId': 1,
            'userName': 1,
            'time': 1,
            'depth': 1,
            'content': 1,
            'at': 1,
            'replies': {
              $filter: {
                input: '$replies',
                as: 'replies',
                cond: {$eq: ['$$replies.status', 0]}
              }
            },
            avatar: '$userinfo.photoUrl'
          }
        },
        {$unwind: {path: '$avatar', preserveNullAndEmptyArrays: true}}
      ]
      Reply.aggregate(array2, function (err, results) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        for (let i = results.length - 1; i >= 0; i--) {
          results[i].avatar = commonFunc.adaptPrefix(results[i].avatar)
        }
        result1['replies'] = results
        result1.avatar = commonFunc.adaptPrefix(result1.avatar)
        if (Object.prototype.toString.call(result1.content) === '[object Array]') {
          for (let item = result1.content.length - 1; item >= 0; item--) {
            for (let attribute in result1.content[item]) {
              result1.content[item][attribute] = commonFunc.adaptPrefix(result1.content[item][attribute])
              result1.content[item][attribute] = commonFunc.adaptPrefixs(result1.content[item][attribute])
            }
          }
        }
        res.json({data: result1, code: 0, msg: 'success'})
        // res.json({data: extend({}, result1[0], results[0]), code: 0, msg: 'success'})
      })
    }
  })
}

exports.forumpComment = function (req, res) {
  let userId = req.session.userId || ''
  let time = req.body.time || ''
  time = new Date(time)
  let content = req.body.content || ''
  let postId = req.body.postId || ''
  let commentId = req.newId || ''
  // console.log(userId)
  if (content === '') {
    res.status(400).json({code: 1, msg: '评论内容不能为空'})
  } else {
    let query = {postId: postId}
    Alluser.getOne({userId: userId}, function (err, alluserInfo) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      let name = ''
      // console.log(alluserInfo)
      if (alluserInfo !== null){
        name = alluserInfo.name
      } else {
        name = '未知'
      }
      // console.log('name:'+name)
      let obj = {
        $set: {
          userId: userId,
          userName: name,
          time: time,
          depth: 1,
          content: content,
          status: 0
        }
      }
      query2 = {postId: postId, commentId: commentId}
      Reply.updateOne(query2, obj, function (err, upreply) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        obj2 = {
          $inc: {replyCount: 1}
        }
        Forump.updateOne(query, obj2, function (err, upforump) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      }, {upsert: true})
    })
  }
}

exports.forumpReply = function (req, res) {
  let userId = req.session.userId || ''
  let time = req.body.time || ''
  time = new Date(time)
  let content = req.body.content || ''
  let postId = req.body.postId || ''
  let commentId = req.body.commentId || ''
  let at = req.body.at || ''
  let replyId = req.newId
  if (content === '') {
    res.status(400).json({code: 1, msg: '回复评论内容不能为空'})
  } else {
    let query1 = {postId: postId, commentId: commentId}
    Reply.getOne(query1, function (err, replyInfo) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      if (replyInfo === null) {
        res.status(500).json({code: 1, msg: '该commentId不存在'})
      } else {
        // let query = {postId: postId}
        Alluser.getOne({userId: userId}, function (err, alluserInfo) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          let name = ''
          // console.log(alluserInfo)
          if (alluserInfo !== null){
            name = alluserInfo.name
          } else {
            name = '未知'
          }
          Alluser.getOne({userId: at}, function (err, alluserInfo1) {
            if (err) {
              res.status(500).json({code: 1, msg: err.errmsg})
            }
            let atname = ''
            if (alluserInfo1 !== null){
              atname = alluserInfo1.name
            } else {
              atname = '未知'
            }
            let obj = {
              $push: {
                replies: {
                  // commentId: commentId,
                  replyId: replyId,
                  userId: userId,
                  userName: name,
                  time: time,
                  // depth: 2,
                  content: content,
                  status: 0,
                  at: at,
                  atName: atname
                }
              }
            }
            Reply.updateOne(query1, obj, function (err, upreply) {
              if (err) {
                res.status(500).json({code: 1, msg: err.errmsg})
              }
              res.json({code: 0, msg: 'success'})
            })
          })
        })
      }
    })
  }
}

exports.forumpFavorite = function (req, res) {
  let userId = req.session.userId || ''
  let postId = req.body.postId
  Forump.getOne({postId: postId}, function (err, forumpInfo) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    if (forumpInfo === null) {
      res.status(500).json({code: 1, msg: 'postId不存在'})
    } else {
      let time = forumpInfo.time
      let query = {userId: userId}
      let obj = {
        $push: {
          favorites: {
            postId: postId,
            time: time
          }
        }
      }
      Forumpuserinfo.updateOne(query, obj, function (err, upforump) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        // res.json({code: 0, msg: 'success'})
        let query2 = {postId: postId}
        let obj2 = {
          $inc: {favoritesNum: 1}
        }
        Forump.updateOne(query2, obj2, function (err, upforump) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      }, {upsert: true})
    }
  })
}

exports.deletePost = function (req, res) {
  let postId = req.body.postId || ''
  let userId = req.session.userId || ''
  if (postId === '') {
    res.status(400).json({code: 1, msg: '请输入postId'})
  } else {
    let query = {postId: postId, sponsorId: userId}
    let obj = {
      $set: {status: 1}
    }
    Forump.updateOne(query, obj, function (err, results) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      let query2 = {userId: userId}
      let obj2 = {
        $pull: {
          posts: {
            postId: postId
          }
        }
      }
      Forumpuserinfo.updateOne(query2, obj2, function (err, upforump) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        res.json({code: 0, msg: 'success'})
      })
    })
  }
}

exports.deleteComment = function (req, res) {
  let postId = req.body.postId || ''
  // let userId = req.session.userId || ''
  let replyId = req.body.replyId || ''
  let commentId = req.body.commentId || ''
  let query1 = {postId: postId, commentId: commentId}
  Reply.getOne(query1, function (err, replyInfo) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    if (replyInfo === null) {
      res.status(500).json({code: 1, msg: '该commentId不存在'})
    } else {
      let obj = {}
      if (replyId !== '') {
        // query['replies.commentId'] = commentId
        query1['replies.replyId'] = replyId
        obj = {
          $set: {
            'replies.$.status': 1
          }
        }
        Reply.updateOne(query1, obj, function (err, upreply) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      } else {
        obj = {
          $set: {
            status: 1
          }
          // $inc: {replyCount: -1}
        }
        Reply.updateOne(query1, obj, function (err, upreply) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          query = {postId: postId}
          obj2 = {
            $inc: {replyCount: -1}
          }
          Forump.updateOne(query, obj2, function (err, upforump) {
            if (err) {
              res.status(500).json({code: 1, msg: err.errmsg})
            }
            res.json({code: 0, msg: 'success'})
          })
        })
      }
    }
  })
}

exports.deleteFavorite = function (req, res) {
  let userId = req.session.userId || ''
  let postId = req.body.postId
  let query = {userId: userId, 'favorites.postId': postId}
  Forumpuserinfo.getOne(query, function (err, forumpuserinfoInfo) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    if (forumpuserinfoInfo === null) {
      res.status(500).json({code: 1, msg: '输入的postId并未被收藏'})
    } else {
      let query2 = {userId: userId}
      let obj = {
        $pull: {
          favorites: {
            postId: postId
          }
        }
      }
      Forumpuserinfo.updateOne(query2, obj, function (err, upforump) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        let query3 = {postId: postId}
        let obj2 = {
          $inc: {favoritesNum: -1}
        }
        Forump.updateOne(query3, obj2, function (err, upforump) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      })
    }
  })
}
