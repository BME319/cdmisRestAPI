
var mongoose = require('mongoose')

var teamSchema = new mongoose.Schema({
  teamId: {type: String, unique: true},
  name: String,
  sponsorId: String,
  sponsorName: String,
  sponsorPhoto: String,
  photoAddress: String,
  members: [
	  {
	  	userId: {type: String, unique: true},
	  	name: String,
	  	photoUrl: String,
	  	_id: 0
	  }
  ],
  time: Date,
  description: String,
  number: {type: Number, default: 1},
  revisionInfo: {
    operationTime: Date,
    userId: String,
    userName: String,
    terminalIP: String
  }
})

var teamModel = mongoose.model('team', teamSchema)

function Team (team) {
  this.team = team
}

Team.prototype.save = function (callback) {
  var team = this.team
  var newTeam = new teamModel(team)
  newTeam.save(function (err, teamItem) {
    if (err) {
      return callback(err)
    }
    callback(null, teamItem)
  })
}

Team.getOne = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''

  teamModel
		.findOne(query, fields, opts)
		.populate(populate)
		.exec(function (err, teamInfo) {
  if (err) {
    return callback(err)
  }
  callback(null, teamInfo)
})
}

Team.getSome = function (query, callback, opts, fields, populate) {
  var options = opts || {}
  var fields = fields || null
  var populate = populate || ''
  teamModel
		.find(query, fields, options)
		.populate(populate)
		.exec(function (err, teams) {
  if (err) {
    return callback(err)
  }
  callback(null, teams)
})
}

Team.updateOne = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  teamModel
		.findOneAndUpdate(query, obj, options)
		.populate(populate)
		.exec(function (err, upteam) {
  if (err) {
    return callback(err)
  }
  callback(null, upteam)
})
}

Team.update = function (query, obj, callback, opts, populate) {
  var options = opts || {}
  var populate = populate || ''

  teamModel
  	.update(query, obj, options)
  	.populate(populate)
  	.exec(function (err, team) {
    	if (err) {
      		return callback(err)
    	}
    callback(null, team)
  })
}
Team.remove = function (query, callback) {
  teamModel
		.remove(query)
		.exec(function (err) {
  callback(err)
})
}

Team.removeOne = function (query, callback, opts) {
  var options = opts || {}

  teamModel
		.findOneAndRemove(query, options, function (err, teamItem) {
  if (err) {
    return callback(err)
  }
  callback(null, teamItem)
})
}

module.exports = Team
