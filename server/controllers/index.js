var fs = require('fs');
var path = require('path');

var _staticDir = path.resolve('./views');

var fn_index = async(ctx, next) => {
	// 返回index.html
	var indexPath = path.join(_staticDir, '/index.html');
	ctx.response.body = fs.readFileSync(indexPath, 'utf-8');
};


module.exports = {
	'GET /': fn_index,
}