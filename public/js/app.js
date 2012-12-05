(function() {
	window.Kue = window.Kue || {};
	window.Kue = {
		myVariable: "foo",

		auth: function(to) {
			//this.myVariable = "foobar";
			var params = "width=420,height=230,menubar=no,location=no,resizable=no,scrollbars=no,status=no"
			window.open('/auth/'+to, "Авторизация", params);

			console.log(to);
		},
		login: function() {
			console.log('Login ok');
		}

	};
}());


$(function() {

	var socket = io.connect();
	var timestamp = Number(new Date());
	//var user_id = timestamp;
	var list;

	/*

	$('#user-id').text('Ваш id:' + user_id);
	$('#state').text('Главная страница (в ТЗ Страница управления - режим ожидания)');
	*/
	socket.on('list', function(data) {
		if(data.list.length) {
			var options = {
				item: 'item'
			};
			list = new List('list', options, data.list);
		} else {
			$('.list').empty();
		}
		console.log(data);
	});

	socket.on('state', function(data) {
		var text;
		if(data.state == 'pregame') text = 'Ваша очередь! Обратный отсчет... Через 3 секунды начнется игра.'
		if(data.state == 'game') text = 'Игра началась! 5 секунд для управления рукой ваши. ';
		if(data.state == 'result') text = 'Игра окончена. Ваш результат..';
		$('#state').text(text);
		console.log(data);
	});


	socket.on('connect', function() { // TIP: you can avoid listening on `connect` and listen on events directly too!
		//socket.emit('auth', user_id);
		console.log('connected')
	});

});

