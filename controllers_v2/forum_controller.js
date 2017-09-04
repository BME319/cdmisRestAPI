var Forum = require('../models/forum')
var Alluser = require('../models/alluser')
var Forumuserinfo = require('../models/forumuserinfo')
var webEntry = require('../settings').webEntry
var Reply = require('../models/reply')

exports.forumPosting = function (req, res) {
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
      Forum.updateOne(query, obj, function (err, upforum) {
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
        Forumuserinfo.updateOne(query2, obj2, function (err, upforum) {
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
        from: 'forumuserinfos',
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
  let nexturl = webEntry.domain + '/api/v2/forum/allposts' + Url
  // let nexturl = 'localhost:4060/api/v2/forum/allposts' + Url

  Forum.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    console.log(results)
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
        from: 'forums',
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
  let nexturl = webEntry.domain + '/api/v2/forum/mycollection' + Url

  Forumuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
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
        posts: '$posts.postId'
      }
    },
    {
      $lookup: {
        from: 'forums',
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
        favoritesNum: '$collections.favoritesNum'
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
        avatar: '$userinfo.photoUrl'
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
  let nexturl = webEntry.domain + '/api/v2/forum/myposts' + Url
  Forumuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    console.log(results)
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
        from: 'forumuserinfos',
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
  Forum.aggregate(array, function (err, results) {
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
        result1['replies'] = results
        res.json({data: result1, code: 0, msg: 'success'})
        // res.json({data: extend({}, result1[0], results[0]), code: 0, msg: 'success'})
      })
    }
  })
}

exports.forumComment = function (req, res) {
  let userId = req.session.userId || ''
  let time = req.body.time || ''
  time = new Date(time)
  let content = req.body.content || ''
  let postId = req.body.postId || ''
  let commentId = req.newId || ''
  console.log(userId)
  if (content === '') {
    res.status(400).json({code: 1, msg: '评论内容不能为空'})
  } else {
    let query = {postId: postId}
    Alluser.getOne({userId: userId}, function (err, alluserInfo) {
      if (err) {
        res.status(500).json({code: 1, msg: err.errmsg})
      }
      let name = ''
      console.log(alluserInfo)
      if (alluserInfo !== null){
        name = alluserInfo.name
      } else {
        name = '未知'
      }
      console.log('name:'+name)
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
        Forum.updateOne(query, obj2, function (err, upforum) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      }, {upsert: true})
    })
  }
}

exports.forumReply = function (req, res) {
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
          console.log(alluserInfo)
          if (alluserInfo !== null){
            name = alluserInfo.name
          } else {
            name = '未知'
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
                at: at
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
      }
    })
  }
}

exports.forumFavorite = function (req, res) {
  let userId = req.session.userId || ''
  let postId = req.body.postId
  Forum.getOne({postId: postId}, function (err, forumInfo) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    if (forumInfo === null) {
      res.status(500).json({code: 1, msg: 'postId不存在'})
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
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        // res.json({code: 0, msg: 'success'})
        let query2 = {postId: postId}
        let obj2 = {
          $inc: {favoritesNum: 1}
        }
        Forum.updateOne(query2, obj2, function (err, upforum) {
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
    Forum.updateOne(query, obj, function (err, results) {
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
      Forumuserinfo.updateOne(query2, obj2, function (err, upforum) {
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
        query['replies.replyId'] = replyId
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
          Forum.updateOne(query, obj2, function (err, upforum) {
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
  Forumuserinfo.getOne(query, function (err, forumuserinfoInfo) {
    if (err) {
      res.status(500).json({code: 1, msg: err.errmsg})
    }
    if (forumuserinfoInfo === null) {
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
      Forumuserinfo.updateOne(query2, obj, function (err, upforum) {
        if (err) {
          res.status(500).json({code: 1, msg: err.errmsg})
        }
        let query3 = {postId: postId}
        let obj2 = {
          $inc: {favoritesNum: -1}
        }
        Forum.updateOne(query3, obj2, function (err, upforum) {
          if (err) {
            res.status(500).json({code: 1, msg: err.errmsg})
          }
          res.json({code: 0, msg: 'success'})
        })
      })
    }
  })
}
