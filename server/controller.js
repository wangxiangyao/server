// 装载所有控制器，其实也就是路由的作用，只不过写成自动的，不用费事一个一个的写。


const fs = require('fs');

function addMapping(router, mapping) {
	for (let url in mapping) {
		if (url.startsWith('GET ')) {
			let path = url.substring(4);
			router.get(path, mapping[url]);
			console.log(`register URL mapping: GET ${path}`);
		} else if (url.startsWith('POST ')) {
			let path = url.substring(5);
			router.post(path, mapping[url]);
			console.log(`register URL mapping: POST ${path}`);
		} else {
			// 无效的url
			console.log(`invalid URL: ${url}`);
		}
	}
}

function addControllers(router, dir) {
	var files = fs.readdirSync(__dirname + dir);
	var js_files = files.filter((file) => {
		return file.endsWith('.js');
	});
	for (var f of js_files) {
		console.log(`process controller: ${f}...`);
		let mapping = require(__dirname + dir + '/' + f);
		addMapping(router, mapping);
	}
}

module.exports = function(dir) {
	let controllers_dir = dir || '/controllers',
		router = require('koa-router')();
	addControllers(router, controllers_dir);
	return router.routes();
}