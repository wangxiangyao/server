var fs = require('fs');
var path = require('path');

var _staticDir = path.resolve('./data');

var fn_orders = async(ctx, next) => {
	// 返回orders.json
	var indexPath = path.join(_staticDir, '/orders.json');
	ctx.response.body = fs.readFileSync(indexPath, 'utf-8');
};
var fn_goods = async(ctx, next) => {
  // 返回goods.json
  var indexPath = path.join(_staticDir, '/goods.json');
  ctx.response.body = fs.readFileSync(indexPath, 'utf-8');
};


module.exports = {
	'GET /getOrders': fn_orders,
  'GET /getGoods': fn_goods,
}