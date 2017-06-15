var qs = require('querystring');
var crypto = require('crypto');

var ZEROS = '0000000000000';

var commonFunc = {
	getClientIp: function (req) {
		return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	},
	stringToBytes: function( str ){
		var ch, st, re = [];
		for (var i = 0; i < str.length; i++ ){
			ch = str.charCodeAt(i);		// get char
			st = [];					// set up "stack"
			do {
				st.push( ch & 0xFF );	// push byte to stack
				ch = ch >> 8;			// shift value down by 1 byte
			}
			while ( ch );
			// add stack contents to result
			// done because chars have "wrong" endianness
			re = re.concat( st.reverse() );
		}
  		// return an array of bytes
		return re;
	},
	getNowFormatDate:function() {
		var date = new Date();
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear()+month+strDate;
		return currentdate;
		// YYYYMMDD
	},
	convertToFormatDate:function(dateObj) {
		var date = dateObj;
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var formatDate = date.getFullYear()+month+strDate;
		return formatDate;
		// YYYYMMDD
	},
	getNowFormatSecond: function() {
		//函数功能：用于将new Date()生成的0时区时间转成东八区时间字符串形式
		var date = new Date();
		//默认东8区时间
		date.setHours(date.getHours() + 8);

		function add0(m) {
			return m < 10 ? '0'+m : m
		}
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mm = date.getMinutes();
		var s = date.getSeconds();
		var formatSecond = y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);

		//yyyy-mm-dd hh:mm:ss
		return formatSecond;
	}, 
	getNowDate: function() {
		//函数功能：用于将new Date()生成的0时区时间转成东八区时间字符串形式
		var date = new Date();
		//默认东8区时间
		// date.setHours(date.getHours() + 8);

		function add0(m) {
			return m < 10 ? '0'+m : m
		}
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var formatDate = y + '-' + add0(m) + '-' + add0(d);

		//yyyy-mm-dd
		return formatDate;
	},
	paddNum:function(num){
		num += "";
		return num.replace(/^(\d)$/,"0$1");
	},
	ConvAlphameric:function(Seq){
		var Ret = ""
		var Char = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; //"I","O"除外，容易与1,0混淆
		var lenChar = Char.length
		var idx
		while(Seq >= 1){
			idx = Seq%lenChar
			Ret = Char.substr(idx, idx)+Ret
			Seq = Seq / lenChar
		}
		return Ret;
	},
	// wx 20170418
	leftZeroPad: function(val, ml) {			
		if(typeof(val) != 'string') {
			val = String(val);
		}
		return ZEROS.substring(0, ml - val.length) + val;
	},
	apiParamFilter: function(params) {
		var p = {};
		for(var key in params) {
			if ( key === 'sign' || key === 'signType' || key === 'sig' || key === 'auth' || key === 'apiObj' || params[key] === '') continue;
			p[key]  = params[key];
		}
		return p;
	},
	apiQueryLink: function(params) {
		var ql = '';
		for(var key in params) {
			ql += key + '=' + params[key] + '&';
		}

		return ql.substring(0, ql.length -1);

	},
	rightZeroPad: function(val, ml) {			
		if(typeof(val) != 'string') {
			val = String(val);
		}
		return val + ZEROS.substring(0, ml - val.length);
	},
	apiParamSign: function(params, signType, pKey) {
		var paramStr = qs.stringify(params, '&', '=');
		var ret = '';
		
		switch(signType.toUpperCase()) {
			case 'MD5':
				var md5 = crypto.createHash('md5');
				md5.update(paramStr + pKey);
				ret = md5.digest('hex');
				break;
			default:
				ret = '';

		}
		return ret;
	},
	convertToMD5: function(params, isUpper) {
		var md5 = crypto.createHash('md5');
		var ret = md5.update(params).digest('hex');
		if(isUpper) {
			ret = ret.toUpperCase();
		}
		return ret;
	},
	convertToSha1: function(params, isUpper) {
		var sha1Gen = crypto.createHash('sha1');
		var ret = sha1Gen.update(params).digest('hex');
		if(isUpper) {
			ret = ret.toUpperCase();
		}
		return ret;
	},
	getRandomSn: function(number) {
		return commonFunc.rightZeroPad(Math.ceil( Math.random()  * Math.pow(10, number)), number);
	},
	getRandomMobile: function() {
		return '173' + commonFunc.getRandomSn(8);
	},
	randomString: function(size) {
	  if (size === 0) {
	    throw new Error('Zero-length randomString is useless.');
	  }
	  var chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
	               'abcdefghijklmnopqrstuvwxyz' +
	               '0123456789');
	  var objectId = '';
	  var bytes = crypto.randomBytes(size);
	  for (var i = 0; i < bytes.length; ++i) {
	    objectId += chars[bytes.readUInt8(i) % chars.length];
	  }
	  return objectId;
	},
	rawSort: function (args) {
	  var keys = Object.keys(args);
	  keys = keys.sort()
	  var newArgs = {};
	  keys.forEach(function (key) {
	    newArgs[key] = args[key];
	    
	  });

	  var string = '';
	  for (var k in newArgs) {
	    string += '&' + k + '=' + newArgs[k];
	  }
	  string = string.substr(1);
	  return string;
	},
	createTimestamp: function () {
	  return parseInt(new Date().getTime() / 1000) + '';
	},
	createNonceStr: function () {
	  return Math.random().toString(36).substr(2, 15);
	}
}

module.exports = commonFunc;