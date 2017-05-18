var	config = require('../config'),
	Order = require('../models/order');


exports.getOrder = function(req, res) {
    var _orderNo = req.query.orderNo
    var query = {orderNo:_orderNo};

    Order.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item});
    });
}

exports.insertOrder = function(req, res) {
    var orderData = {
        userId: req.body.userId,
        orderNo: req.newId,//req.body.orderNo,
        ordertime:new Date(),
        money:req.body.money,
        goodsInfo:{
            class:req.body.class,
            name:req.body.name,
            notes:req.body.notes
        },
        paystatus:req.body.paystatus,
        paytime:new Date(req.body.paytime)
    };

    var newOrder = new Order(orderData);
    newOrder.save(function(err, item) {
        if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: item});
    });
}

exports.updateOrder = function(req, res) {
	var query = {orderNo:req.body.orderNo};
	var upObj={
		paystatus: req.body.paystatus,
		paytime:new Date(req.body.paytime)
	}
	Order.updateOne(query,{$set:upObj},function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item,msg:"success!"});
    });
}