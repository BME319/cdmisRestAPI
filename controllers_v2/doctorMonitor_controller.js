var Alluser = require('../models/alluser')

exports.getDistribution = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === ''){
    res.status(400).send('请输入结束时间')
  } else {
    array = [
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}}
    ]
    if (province === '') {
      array.push({
        $group: {
          _id: "$province",
          count: {$sum: 1}
        }
      })
    } else if (city === '') {
      array.push(
        {$match: {province: province}},
        {
          $group: {
            _id: "$city",
            count: {$sum: 1}
          }
        }
      )
    } else {
      array.push(
        {$match: {province: province}},
        {$match: {city: city}},
        {
          $group: {
            _id: "$district",
            count: {$sum: 1}
          }
        }
      )
    }
    console.log(array)
    // array = [
    //   {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}},
    //   {
    //     $group: {
    //       _id: "$province",
    //       count: {$sum: 1}
    //     }
    //   }
    // ]
    Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      console.log(results)
      res.json({results: results})
    })
  }
}

exports.getLinegraph = function (req, res) {
  let startTime = req.query.startTime || ''
  let endTime = req.query.endTime || ''
  let province = req.query.province || ''
  let city = req.query.city || ''
  if (startTime === '') {
    res.status(400).send('请输入开始时间')
  } else if (endTime === ''){
    res.status(400).send('请输入结束时间')
  } else {
    array = [
      {$match: {creationTime: {$gt: new Date(startTime), $lt: new Date(endTime)}}}
    ]
    if (province === '') {
      array.push({
        $group: {
          _id: {year: {$year: "$creationTime"}, month: {$month: "$creationTime"}, day: {$dayOfMonth: "$creationTime"}},
          count: {$sum: 1}
        }
      })
    }
    Alluser.aggregate(array, function (err, results) {
      if (err) {
        res.status(500).send(err.errmsg)
      }
      console.log(results)
      res.json({results: results})
    })
  }
}