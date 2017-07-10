<<<<<<< HEAD
var	config = require('../config'),
  DictTypeOne = require('../models/dictTypeOne')
=======
var DictTypeOne = require('../models/dictTypeOne')
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832

exports.getCategory = function (req, res) {
  var category = req.query.category
  var query = {category: category}

  DictTypeOne.getOne(query, function (err, item) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: item})
=======
      return res.status(500).send(err.errmsg)
    }
    res.json({results: item})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  })
}
