
var	config = require('../config'),
	Version = require('../models/version');


exports.getVersionInfo = function(req, res) {
	var versionName = req.query.versionName;
	var versionType = req.query.versionType || null;
	var query;

	if (versionType === null || versionType === '') {
		return res.status(400).send('invalid input');
	}

	if (versionName === null || versionName === '') {
        query = {versionType: versionType};
        Version.getSome(query, function(err, items) {
			if (err) {
	      		return res.status(500).send(err.errmsg);
	    	}
	    	res.json({results:  {status:0, msg: items}});
	    });
  }
  else{
    	var opts = { sort: '-_id' };
    	query = {versionType: versionType};
    	// console.log(query);
    	Version.getSome(query, function(err, items) {
    		if (err) {
	      		return res.status(500).send(err.errmsg);
	    	}
	    	// console.log(items);
	    	if(items.length == 0){
	    		return res.status(400).send('版本号不存在');
	    	}
	    	else{
	    		// console.log(items[0]);
	    		if(items[0].versionName == versionName){
		    		res.json({results: {status:0, msg: 'latest'}});
		    	}
		    	else{
		    		res.json({results: {status:0, msg: [items[0]]}});
		    	}
	    	}
	    }, opts);
    }
}

exports.insertVersionInfo = function(req, res) {
	var versionId = req.newId;		
	var versionType = req.body.versionType;
	var versionName = req.body.versionName || null;
	var time = new Date(); 
	var content = req.body.content || null;

	if (versionName === null || versionName === '' || content === null || content === '' || versionType === null || versionType === '') {
        return res.status(400).send('invalid input');
    }

    var versionData = {
        versionId: versionId,
        versionType: versionType,
        versionName: versionName,
        time: time,
        content: content
    };
    var newVersion = new Version(versionData);
    newVersion.save(function(err, Info) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
    	res.json({results: Info});
	});
}
