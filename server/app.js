const Koa = require('koa');
const app = new Koa();
const http = require('http').createServer(app.callback());
const roomServer = require('./roomServer');
const port = process.env.PORT || 3000;
const controller = require('./controller');
// 前端的接口，全都在controllers文件夹下的文件中定义，也就是路由。通过controller.js装载路由
const bodyParser = require('koa-bodyparser');
const staticFiles = require('./staticServer');
const path = require('path');



// 将POST请求解析到ctx.body
app.use(bodyParser());

// 静态资源
app.use(staticFiles('/static/', path.join(__dirname, './../static')));

// 部署路由
console.log('开始部署路由');
app.use(controller());

// 启动socket.io
roomServer(http);

http.listen(port, function() {
	console.log('Server listening at port %d', port);
});