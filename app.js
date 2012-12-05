var util = require('util'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    // SESSION STORE
    RedisStore = require('connect-redis')(express),
    sessionStore = new RedisStore(),
    secret = 'hs84jvb0xn30',
    cookieParser = express.cookieParser(secret);

    global.cookieParser = cookieParser;

    global.sessionStore = sessionStore;
    global.io = io;
    global.app = app;

    //ROUTES
    var routes = require('./routes'),
    socket = require('./routes/socket.js'),
    passport = require('passport'),
   // AUTH
    FacebookStrategy = require('passport-facebook').Strategy,
    VKontakteStrategy = require('passport-vkontakte').Strategy,
    OdnoklassnikiStrategy = require('passport-odnoklassniki').Strategy;

    global.FacebookStrategy = FacebookStrategy;
    //global.VkontakteStrategy = VkontakteStrategy;
    global.OdnoklassnikiStrategy = OdnoklassnikiStrategy;
    //MoyMirStrategy = require('passport-moymir').Strategy;
  
    global.passport = passport;
    var //auth = require('./routes/auth.js'),
    // LIBS
    stat = require('./lib/stat'),
    Kue = require('./lib/kue'),
    port = 80; 
    global.stat = stat;

// Подключаем модуль и ставим на прослушивание 8080-порта - 80й обычно занят под http-сервер
var robotio = require('socket.io').listen(8080); 
// Отключаем вывод полного лога - пригодится в production'е
robotio.set('log level', 1);
// Навешиваем обработчик на подключение нового клиента
robotio.sockets.on('connection', function (socket) {

    var ID = (socket.id).toString().substr(0, 5);
    var time = (new Date).toLocaleTimeString();

    global.robotsocket = socket;
    socket.json.send({'event': 'connected', 'name': ID, 'time': time});
    socket.on();


/*
{"type":"new_prize", "rfid":"XXXXX"} - считанный id приза
{"type":"start", "id_claw":"2"} - при запуске мы передаем id клешни (чтобы вы отображали соответствующий ей видеопоток)
{"type":"disaster", "disaster":"message"} - если вдруг на руке поломка то мы один раз отправляем такое сообщение и сами переключаемся на другую руку.
{"type":"workable"} - это пинг который шлем постоянно.
/*
    // Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
     // Посылаем клиенту сообщение о том, что он успешно подключился и его имя
    socket.json.send({'event': 'connected', 'name': ID, 'time': time});
    // Посылаем всем остальным пользователям, что подключился новый клиент и его имя
    socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
    // Навешиваем обработчик на входящее сообщение
    socket.on('message', functrobotion (msg) {
        var time = (new Date).toLocaleTimeString();
        // Уведомляем клиента, что его сообщение успешно дошло до сервера
        socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
        // Отсылаем сообщение остальным участникам чата
        socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
    });
*/
*/
    // При отключении клиента - уведомляем остальных
    socket.on('disconnect', function() {
/*
        var time = (new Date).toLocaleTimeString();
        robotio.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
*/
    });
});

global.robotio = robotio;

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view options', {layout: false});
    app.engine('html', require('ejs').renderFile);
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.session({
        store: sessionStore,
        secret: secret,
        key: 'x',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


app.get('/', routes.index);
app.get('/stat', stat.stat);
app.get('/partials/:name', routes.partials);


// (HTML5 history)
app.get('*', routes.index);


// Socket.io Communication
io.sockets.on('connection', socket);

// Start server
server.listen(port, function() {
    stat.log('Server started %d in %s mode', this.address().port, app.settings.env);
});


