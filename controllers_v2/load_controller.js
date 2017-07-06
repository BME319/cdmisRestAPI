var	config = require('../config')
// var fs = require('fs');
var multer = require('multer')
var images = require('images')

exports.uploadphoto = function () {
  var storage = multer.diskStorage({
	    destination: 'uploads/photos',
	    filename: function (req, file, cb) {
	        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
	        // cb(null, file.fieldname + '-' + Date.now());
	        var type = req.query.type
	        if (type == null || type == undefined) {
	        	type = ''
	        }
	        cb(null, type + file.originalname)
	    }
  })
  var upload = multer({ storage: storage })
  return upload.single('file')
}

exports.upload = function (req, res) {
  var file = req.file
  var path = file.path
  var type = req.query.type
  if (type == null || type == undefined) {
    type = ''
  }
  var path_resized = file.destination + '/resized' + type + file.originalname
	// console.log(path_resized)

  images(path)                     // Load image from file
                                        // 加载图像文件
    .size(100)                          // Geometric scaling the image to 400 pixels width
                                        // 等比缩放图像到400像素宽
    // .draw(images("logo.png"), 10, 10)   //Drawn logo at coordinates (10,10)
                                        // 在(10,10)处绘制Logo
    .save(path_resized, {               // Save the image to a file,whih quality 50
      quality: 100                    // 保存图片到文件,图片质量为50
    })
  res.send({ret_code: '0', filepath: path, path_resized: path_resized})
}
// exports.download = function(req, res) {
// 	console.log("---------访问下载路径-------------");
// 	var pathname = "uploads\\photos\\tadashi.jpg";
// 	var realPath = "F:\\labwork\\CKDapp\\cdmisRestAPI\\"+pathname;
// 	fs.exists(realPath, function (exists) {
// 		if (!exists) {
// 			console.log("文件不存在");
// 			res.writeHead(404, {
// 				'Content-Type': 'text/plain'
// 			});
// 			res.write("This request URL " + pathname + " was not found on this server.");
// 			res.end();
// 		}
// 		else {
// 			console.log("文件存在");
// 			fs.readFile(realPath, "binary", function (err, file) {
// 				if (err) {
// 					res.writeHead(500, {
// 						'Content-Type': 'text/plain'
// 					});
// 					console.log("读取文件错误");
// 					res.end(err);
// 				}
// 				else {
// 					res.writeHead(200, {
// 						'Content-Type': 'text/html'
// 					});
// 					console.log("读取文件完毕，正在发送......");
// 					res.write(file, "binary");
// 					res.end();
// 					console.log("文件发送完毕");
// 				}
// 			});
// 		}
// 	});
// }
