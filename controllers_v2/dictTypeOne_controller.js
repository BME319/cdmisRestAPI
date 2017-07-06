var	config = require('../config'),
  DictTypeOne = require('../models/dictTypeOne')

exports.getCategory = function (req, res) {
  var category = req.query.category
  var query = {category: category}

  DictTypeOne.getOne(query, function (err, item) {
    if (err) {
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: item})
  })
}
