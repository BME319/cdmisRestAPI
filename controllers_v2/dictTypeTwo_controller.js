<<<<<<< HEAD
var config = require('../config')
=======

>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
var DictTypeTwo = require('../models/dictTypeTwo')

exports.insertCategory = function (req, res) {
  var categoryData = {
<<<<<<< HEAD
  			category: 'VitalSigns',
  			contents: [{
  				type: 'Bloodpressure',
  				typeName: '血压',
  				details: [
      				{ code: 'Bloodpressure_1',
  		  				name: '收缩压',
  		  				inputCode: 'SSY',
  		  				description: '',
        				invalidFlag: 0}]
  					}
  				]
  			}
=======
    category: 'VitalSigns',
    contents: [{
      type: 'Bloodpressure',
      typeName: '血压',
      details: [
        { code: 'Bloodpressure_1',
          name: '收缩压',
          inputCode: 'SSY',
          description: '',
          invalidFlag: 0}]
    }
    ]
  }
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832

  var newDictTypeTwo = new DictTypeTwo(categoryData)
  newDictTypeTwo.save(function (err, dictTypeTwoInfo) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: dictTypeTwoInfo})
=======
      return res.status(500).send(err.errmsg)
    }
    res.json({results: dictTypeTwoInfo})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  })
}

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
<<<<<<< HEAD
    if (items != '') {
=======
    if (items !== '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
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
