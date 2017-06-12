$(function() {
	// 一些可能用到的常量
	const FADE_TIME = 200; // ms
	const TYPING_TIMER_LENGTH = 400; // ms
	const COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];



	var $window = $(window),
		$usernameInput = $('.usernameInput'),
		$inputMessage = $('.inputMessage'),
		$messages = $('.messages');

	var $loginPage = $('.login.page'),
		$chatPage = $('.chat.page'); // 注册和聊天页面，暂时没有分离

	var socket = io();

	// 暂时通过username 和挂在到socket上的addedusername来模拟用户数据，等学会数据库再添加
	var username,
		connected = false,
		typing = false,
		lastTypingTIme;

	var $currentInput = $usernameInput.focus(); // 当前输入框，用于键盘事件的自动聚焦功能

	// 以下是具体的处理方法

	//设置昵称
	function addUserName() {
		username = cleanInput($usernameInput.val().trim());

		// 如果输入昵称了
		if (username) {
			$loginPage.fadeOut();
			$chatPage.show();
			$currentInput = $inputMessage.focus();

			// 广播事件
			socket.emit('add user', username);
		}
	}


	// 确保输入无恶意代码
	function cleanInput(input) {
		return $('<div>').text(input).text();
	}

	// 传入要加入的dom，和配置项
	// 用于所有与Messages有关的添加操作，比如，别人发来的信息；欢迎信息。等等等等
	// 不同的信息，传入的el（要添加的dom）和option不同
	// option {fade: true, prepend: false}默认参数，fade表示是否渐变，prepend表示是否从开头插入
	function addMessage(el, option) {
		var $el = $(el);

		// 以下往后再用es6改进
		if (!option) {
			option = {};
		}
		if (typeof option.fade === 'undefined') {
			option.fade = true;
		}
		if (typeof option.prepend === 'undefined') {
			option.prepend = false;
		}

		// 根据配置对象操作
		if (option.fade) {
			$el.hide().fadeIn(FADE_TIME);
		}
		if (option.prepend) {
			$messages.prepend($el);
		} else {
			$messages.append($el);
		}

		// 滚动到最新加载的地方
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}


	// 利用addMessage方法，用于处理，如，用户加入，用户离开，欢迎信息，人数信息等message 的添加
	function log(message, option) {
		var $el = $('<li>').addClass('log').text(message);
		addMessage($el, option);
	}

	// 利用log方法，显示人数信息
	function addParticipantsMessage(data) {
		var message = `当前有${data.usersNum}人在线`;
		log(message);
	}

	// 关于聊天过程中的一系列处理

	// 当输入完成，按‘回车’发送消息
	function sendMessage() {
		var message = cleanInput($inputMessage.val());
		if (message && connected) {
			$inputMessage.val('');
			addChatMessage({
				username: username,
				message: message,
			});
			socket.emit('new message', message);
		}

	}



	// 最基本的，添加一条聊天信息：自己输入信息、收到添加聊天事件时候用到
	// 将接受到的数据，处理成messageDOM，然后调用addMessage方法
	function addChatMessage(data, option) {
		// 先处理‘某某某 is typing’
		var $typingMessage = getTypingMessage(data);
		option = option || {};
		if ($typingMessage.length !== 0) {
			option.fade = false;
			$typingMessage.remove();
		}



		var $usernameDiv = $('<span class="username"/>')
			.text(data.username)
			.css('color', getUsernameColor(data.username));
		var $messageBodyDiv = $('<span class="messageBody"/>')
			.text(data.message);

		var typingClass = data.typing ? 'typing' : '';
		var $messageDiv = $('<li class="message"/>')
			.data('username', data.username)
			.addClass(typingClass)
			.append($usernameDiv, $messageBodyDiv);

		addMessage($messageDiv, option);
	}



	// 工具函数，根据用户名，利用hash算一个颜色
	function getUsernameColor(username) {
		// Compute hash code
		var hash = 7;
		for (var i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}


	// 一下用来处理正在编辑事件的一系列操作

	function updataTyping() {
		if (connected) {
			if (!typing) {
				typing = true;
				socket.emit('typing');
			}

			lastTypingTime = (new Date()).getTime();

			setTimeout(function() {
				var typingTimer = (new Date()).getTime();
				var timeDiff = typingTimer - lastTypingTime;
				if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
					socket.emit('stop typing');
					typing = false;
				}
			}, TYPING_TIMER_LENGTH);
		}
	};

	function addChatTyping(data) {
		data.typing = true;
		data.message = 'is typing';
		addChatMessage(data);
	}

	function removeChatTyping(data) {
		getTypingMessage(data).fadeOut(function() {
			$(this).remove();
		});
	}

	function getTypingMessage(data) {
		return $('.typing.message').filter(function(i) {
			return $(this).data('username') === data.username;
		})
	}


	/*
	 *	以下是dom事件
	 *	利用事件委托，处理键盘事件：正在输入，输入完成，以及最开始的添加username时候的回车添加
	 *
	 **/

	$window.keydown(function(event) {
		// 当键盘敲击时候，自动聚焦到当前输入框
		if (!(event.ctrlKey || event.metaKey || event.altKey)) {
			$currentInput.focus();
		}

		// 当键入'回车'时候，特殊处理
		if (event.which === 13) {
			if (username) {
				// 已经有用户名了，说明这是发送聊天的message
				sendMessage();
				// 结束正在编辑状态
				socket.emit('stop typing');
				typing = false;
			} else {
				// 说明是祖册昵称
				addUserName();
			}
		}
	});

	// H5新增事件，oninput。当用户输入时候，触发正在编辑的一系列操作
	$inputMessage.on('input', function() {
		updataTyping();
	});

	$inputMessage.click(function() {
		$inputMessage.focus();
	})



	/*
	 *
	 *
	 * 以下是socket.io的事件处理部分
	 *
	 *
	 **/

	socket.on('login', function(data) {
		connected = true;

		//添加欢迎标语
		var message = "欢迎来到聊天室！";
		log(message, {
			prepend: true,
		});
		// 后台返回了聊天室当前用户人数，要把它显示出来
		addParticipantsMessage(data);
	});

	socket.on('user joined', function(data) {
		log(data.username + ' joined');
		addParticipantsMessage(data);
	});

	socket.on('new message', function(data) {
		addChatMessage(data);
	});

	socket.on('typing', function(data) {
		addChatTyping(data);
	});

	socket.on('stop typing', function(data) {
		removeChatTyping(data);
	});

	socket.on('user left', function(data) {
		log(data.username + ' left');
		addParticipantsMessage(data);
		removeChatTyping(data);
	})

	socket.on('disconnect', function() {
		log('you have been disconnected');
	});

	socket.on('reconnect', function() {
		log('you have been reconnected');
		if (username) {
			socket.emit('add user', username);
		}
	});

	socket.on('reconnect_error', function() {
		log('attempt to reconnect has failed');
	})
});