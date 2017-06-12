var fs = require('mz/fs');
var path = require('path');
var mime = require('mime');

// url：定义的静态资源接口，比如'/static/'，'/public/'等
// dir：接口文件夹的绝对路径
function staticFiles(url, dir) {
	return async(ctx, next) => {
		let reqPath = ctx.request.path;
		// 取到请求路径

		//判断是否为静态接口
		if (reqPath.startsWith(url)) {
			let fp = path.join(dir, reqPath.substring(url.length));
			console.log(`请求静态资源 ${url}`)
				// 拼接一下，得到完整的路径
			ctx.response.type = mime.lookup(reqPath);
			try {
				ctx.response.body = await fs.readFile(fp);
			} catch (e) {
				console.log(e);
				ctx.response.status = 404;
				// 返回404页面，后边再添加
			}
		} else {
			// 不是指定的接口，继续下一个
			await next();
		}
	}
}

module.exports = staticFiles;