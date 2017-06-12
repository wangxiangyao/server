module.exports = function(http) {
	const io = require('socket.io')(http);

	// 聊天室

	var usersNum = 0;

	io.on('connection', function(socket) {
		var addedUser = false;
		// 暂时通过这个模拟数据库

		socket.on('add user', function(username) {
			if (addedUser) {
				return;
				// 添加响应，表示用户已经添加
			}
			socket.username = username; // 将用户名挂载到了socket上。
			++usersNum;
			addedUser = true;

			// 广播用户人数
			socket.emit('login', {
				usersNum: usersNum,
			});

			// 广播用户添加
			socket.broadcast.emit('user joined', {
				username: socket.username,
				usersNum: usersNum,
			})
		});

		socket.on('new message', function(data) {
			// 除了发送者，广播‘新消息’事件
			socket.broadcast.emit('new message', {
				username: socket.username,
				message: data,
			})
		});

		// 当有人正在输入时候，广播给其他人
		socket.on('typing', function() {
			socket.broadcast.emit('typing', {
				username: socket.username,
			});
		});

		socket.on('stop typing', function() {
			socket.broadcast.emit('stop typing', {
				username: socket.username,
			});
		});

		socket.on('disconnect', function() {
			if (addedUser) {
				--usersNum;

				socket.broadcast.emit('user left', {
					username: socket.username,
					usersNum: usersNum,
				})
			}
		})
	})

}