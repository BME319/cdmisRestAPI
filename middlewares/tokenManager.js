var config = require('../config'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');

var Refreshtoken = require('../models/refreshtoken');


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
          else{
            return res.status(401).send(err);
          }
          
        }
        else{
          req.session = decoded;
          console.log(req.session.userId);
          return next();
        }
      

      });
    }
    else{
      return res.status(401).send('无授权信息!');
    }
    
  };
};


exports.refreshToken = function (req, res) {
  var refreshToken = req.body.refresh_token || req.query.refresh_token;
  console.log(refreshToken);
  
  var query = {refreshtoken: refreshToken};
  Refreshtoken.getOne(query, function(err, item) {
    if (err) {
      return res.status(500).send('服务器错误, 凭证查询失败!');
    }
    if (item) {
      var userPayload = JSON.parse(item.userPayload);
      
      Refreshtoken.removeOne({refreshtoken: refreshToken},function(err){
        if (err) {
          return res.status(500).send(err.errmsg);
        }
        else{
          
          userPayload.exp = Date.now() + config.TOKEN_EXPIRATION * 1000;
          userPayload = JSON.stringify(userPayload);

          var token = jwt.sign(userPayload, config.tokenSecret, {algorithm:'HS256'},{expiresIn: config.TOKEN_EXPIRATION});

          var sha1 = crypto.createHash('sha1');
          var refreshToken = sha1.update(token).digest('hex');

          var refreshtokenData = {
            refreshtoken: refreshToken,
            userPayload: JSON.stringify(userPayload)
          };

          var newRefreshtoken = new Refreshtoken(refreshtokenData);
          newRefreshtoken.save(function(err, Info) {
            if (err) {
              return res.status(500).send(err.errmsg);
            }
            else{
              return res.json({results: { token: token, refreshToken: refreshToken}});
            }     
          });
        }            
    });
    }
    else {
      return res.status(401).send('凭证不存在!');
    }
  });
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