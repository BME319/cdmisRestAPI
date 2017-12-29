

exports.forumPosting = function (req, res) {
  let userId = req.userId || ''
  let name = req.name || ''
  let time = req.body.time || ''
  time = new Date(time)
  let title = req.body.title || ''
  let anonymous = req.body.anonymous || ''
  anonymous = Number(anonymous)
  let text = req.body.content || ''
  let photoURL = req.body.photoURL || ''
  let content = {text: text, image: photoURL}
  let postId = req.newId || ''
  let board = req.body.board || ''
  if (title === '') {
    res.json({status: 1, msg: '没有标题'})
  } else if (content === '') {
    res.json({status: 1, msg: '没有内容'})
  } else {
    let query = {postId: postId}
    let obj = {postId: postId, sponsorId: userId, sponsorName: name, title: title, content: content, time: time, anonymous: anonymous, replyCount: 0, favoritesNum: 0, status: 0}
    if (board === 'doctor') {
      Forum.updateOne(query, obj, function (err, upforum) {
        if (err) {
          res.json({status: 1, msg: err.errmsg})
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
            res.json({status: 1, msg: err.errmsg})
          }
          res.json({status: 0, msg: '操作成功'})
        }, {upsert: true})
      }, {upsert: true})
    } else if (board === 'patient') {
      Forump.updateOne(query, obj, function (err, upforum) {
        if (err) {
          res.json({status: 1, msg: err.errmsg})
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
        Forumpuserinfo.updateOne(query2, obj2, function (err, upforum) {
          if (err) {
            res.json({status: 1, msg: err.errmsg})
          }
          res.json({status: 0, msg: '操作成功'})
        }, {upsert: true})
      }, {upsert: true})
    }
    
  }
}