var fs = require('fs');
var path = require('path');

var _staticDir = path.resolve('./views');

var fn_signin = async(ctx, next) => {
	var name = ctx.request.body.name || '';
	// 查询数据库
	// 如果没有重复的，写入昵称，并返回成功状态
	// 如果有重复的，返回失败状态
}

module.exports = {
	'POST /signin': fn_signin,
}