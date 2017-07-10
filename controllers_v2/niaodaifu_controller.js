
<<<<<<< HEAD
var commonFunc = require('../middlewares/commonFunc'),
  config = require('../config')
=======
var commonFunc = require('../middlewares/commonFunc')
var config = require('../config')
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832

exports.getLoginParam = function (req, res) {
  var client = req.query.client || null
  var userbind = req.query.userbind || null

<<<<<<< HEAD
  if (client === null || client == '') {
    return res.status(403).send('client不能为空')
  }
  if (userbind === null || userbind == '') {
=======
  if (client === null || client === '') {
    return res.status(403).send('client不能为空')
  }
  if (userbind === null || userbind === '') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    return res.status(403).send('userbind不能为空')
  }

  var appkey
  var appsecret
<<<<<<< HEAD
  if (client == 'Android') {
    appkey = config.niaodaifuDevConfig.Android.appid
    appsecret = config.niaodaifuDevConfig.Android.appSecret
  } else if (client == 'iOS') {
=======
  if (client === 'Android') {
    appkey = config.niaodaifuDevConfig.Android.appid
    appsecret = config.niaodaifuDevConfig.Android.appSecret
  } else if (client === 'iOS') {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    appkey = config.niaodaifuDevConfig.iOS.appid
    appsecret = config.niaodaifuDevConfig.Android.appSecret
  } else {
    return res.status(403).send('client输入不正确')
  }

<<<<<<< HEAD
	// var atime = new Date().getTime();
  var atime = Date.parse(new Date())
  atime = atime / 1000
  var mode = 1
  var redirect_uri = req.query.redirect_uri || 'http://121.43.107.106:4060'
=======
// var atime = new Date().getTime();
  var atime = Date.parse(new Date())
  atime = atime / 1000
  var mode = 1
  var redirectUri = req.query.redirect_uri || 'http://121.43.107.106:4060'
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  var sign = getSign(appkey, appsecret, atime)

  var results = {
    appkey: appkey,
    sign: sign,
    atime: atime,
    userbind: userbind,
    mode: mode,
<<<<<<< HEAD
    redirect_uri: redirect_uri
  }
  res.json({results: results})
}

function getSign (appkey, appsecret, atime) {
  var step1 = appkey + ':' + appsecret
  var step2 = commonFunc.convertToMD5(step1, true)
  var step3 = step2.substring(8, 24)
  var step4 = step3 + ':' + atime
  var step5 = commonFunc.convertToMD5(step4, true)
  return step5
}
=======
    redirect_uri: redirectUri
  }
  res.json({results: results})
}

function getSign (appkey, appsecret, atime) {
  var step1 = appkey + ':' + appsecret
  var step2 = commonFunc.convertToMD5(step1, false)
  var step3 = step2.substring(8, 24)
  var step4 = step3 + ':' + atime
  var step5 = commonFunc.convertToMD5(step4, false)
  return step5
}

>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
