var Forum = require('../models/forum')
var Alluser = require('../models/alluser')
var Forumuserinfo = require('../models/forumuserinfo')

exports.forumPosting = function (req, res) {
  let userId = req.session.userId || ''
  let time = req.body.time || ''
  let title = req.body.title || ''
  let anonymous = req.body.anonymous || ''
  anonymous = Number(anonymous)
  let content = req.body.content || ''
  let postId = req.newId || ''
  if (title === '') {
    res.status(400).send('请输入标题')
  } else if (content === '') {
    res.status(400).send('请输入内容')
  } else {
    let query = {postId: postId}
    Alluser.getOne({userId: userId}, function (err, alluserInfo) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      let name = alluserInfo.name
      let obj = {postId: postId, sponsorId: userId, sponsorName: name, title: title, content: content, time: time, anonymous: anonymous, replyCount: 0, favoritesNum: 0}
      Forum.updateOne(query, obj, function (err, upforum) {
        if (err) {
          res.status(500).send(err.errmsg)
        }
        query2 = {userId: userId}
        obj2 = {
          $push: {
            posts: {
              postId: postId,
              time: time
            }
          }
        }
        Forumuserinfo.updateOne(query2, obj2, function (err, upforum) {
          if (err) {
            res.status(500).send(err.errmsg)
          }
          res.json('success')
        },{upsert: true})
      }, {upsert: true})
    })
  }
}

exports.getAllposts = function (req, res) {
  let userId = req.session.userId
  let limit = Number(req.query.limit)
  let skip = Number(req.query.skip)
  let array = [
    {
      $lookup: {
        from: 'allusers',
        localField: 'sponsorId',
        foreignField: 'userId',
        as: 'userinfo'
      }
    },
    {$unwind: {path:'$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId':1,
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
        'postId':1,
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
        'postId':1,
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
  Forum.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    console.log(results)
    res.json({results: results})
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
    {$unwind: {path:'$collections', preserveNullAndEmptyArrays: true}},
    {
      $project: {
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
    {$unwind: {path:'$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId':1,
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
    {$sort: {time: -1}},
    {$skip: skip},
    {$limit: limit}
  ]
  Forumuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    console.log(results)
    res.json({results: results})
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
    {$unwind: {path:'$collections', preserveNullAndEmptyArrays: true}},
    {
      $project: {
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
    {$unwind: {path:'$userinfo', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        'postId':1,
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
    {$sort: {time: -1}},
    {$skip: skip},
    {$limit: limit}
  ]
  Forumuserinfo.aggregate(array, function (err, results) {
    if (err) {
      res.status(500).send(err.errmsg)
    }
    console.log(results)
    res.json({results: results})
  })
}
