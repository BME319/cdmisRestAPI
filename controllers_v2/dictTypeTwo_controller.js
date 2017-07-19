
var DictTypeTwo = require('../models/dictTypeTwo')

exports.getCategory = function (req, res) {
  var category = req.query.category
  var query = {category: category}

  DictTypeTwo.getOneCategory(query, function (err, item) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
  })
}

exports.getTypes = function (req, res) {
  var category = req.query.category
  var type = req.query.type
  var query = {category: category}

  DictTypeTwo.getOneCategory(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    if (items !== '') {
      var contents = items[0].contents
      var lists = contents.find(function (x) {
        return x.type === type
      })
      res.json({results: lists})
    } else {
      res.json({results: items})
    }
  })
}
