var config = require('../config'),
    //ACL = require('../helpers/ACL'),
    //redis = require('redis'),
    //redisClient = redis.createClient(6379, config.redisHOST),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');
// redisClient.on('error', function (err) {
//     console.log('Error ' + err);
// });
// redisClient.on('connect', function () {
// });
exports.verifyToken = function () {
  return function (req, res, next) {
    var token = (req.body && req.body.token) || getToken(req.headers) || (req.query && req.query.token) || null;

    // var token = jwt.sign(userPayload, config.tokenSecret, {algorithm:'HS256'},{expiresIn: config.TOKEN_EXPIRATION});

    if (token) { 
      jwt.verify(token,config.tokenSecret,function(err,decoded){
        if (err) {
          if(err.name == "TokenExpiredError"){
            return res.status(401).send("TokenExpiredError");
          }
          return res.status(401).send(err.errmsg);
        }
        req.user = decoded;
        return next();

      });
    }
    else{
      return res.status(401).send('无授权信息!');
    }
    
  };
};

var getToken = function(headers) {

  if (headers && headers.authorization) { 
    var authorization = headers.authorization;
    var part = authorization.split(' ');
    if (part.length == 2) {
      var token = part[1];
      return part[1];
    }
    else {
      return null;
    }
  }
  else {
    return null;
  }
};