var config = require('../config');
var DictTypeTwo = require('../models/dictTypeTwo');


exports.insertCategory = function(req, res) {
	var categoryData = {
  			category: "VitalSigns",
  			contents:[{
  				type:"Bloodpressure",
  				typeName:"血压",
  				details:[
      				{   code:"Bloodpressure_1",
  		  				name:"收缩压",
  		  				inputCode:"SSY",
  		  				description:"",
        				invalidFlag:0}]
  					}
  				]
  			}
		

	var newDictTypeTwo = new DictTypeTwo(categoryData);
	newDictTypeTwo.save(function(err, dictTypeTwoInfo) {
		if (err) {
      		return res.status(500).send(err.errmsg);
    	}
    	res.json({results: dictTypeTwoInfo});
	});
}


exports.getCategory = function(req, res) {
  var category = req.query.category
  var query = {category:category};

  DictTypeTwo.getOneCategory(query, function(err, item) {
    if (err) {
          return res.status(500).send(err.errmsg);
      }
      res.json({results: item});
  });
}

exports.getTypes = function(req, res) {
  var category = req.query.category;
  var type = req.query.type;
  var query = {category:category,type:type};

  DictTypeTwo.getOneCategory(query, function(err, items) {
    if (err) {
          return res.status(500).send(err.errmsg);
      }
    if(items != '')
    {
      var contents = items[0].contents;
      var lists = contents.find(function(x){
        return x.type === type;
      })
      res.json({results: lists});
    }
    else
    {
      res.json({results: items});
    }
  });
}