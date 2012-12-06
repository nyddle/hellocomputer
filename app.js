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
    FacebookStrategy = require('passport-facebook').Strategy;
    VKontakteStrategy = require('passport-vkontakte').Strategy;
    OdnoklassnikiStrategy = require('passport-odnoklassniki').Strategy;

    global.FacebookStrategy = FacebookStrategy;
    global.VKontakteStrategy = VKontakteStrategy;
    global.OdnoklassnikiStrategy = OdnoklassnikiStrategy;
    //MoyMirStrategy = require('passport-moymir').Strategy;
  
    global.passport = passport;
    var auth = require('./routes/auth.js'),
    // LIBS
    stat = require('./lib/stat'),
    Kue = require('./lib/kue'),
    port = 8080; 
    global.stat = stat;
    global.auth = auth;



// ============== net socket ======
var net = require('net');

var PORT = 6969;

var roboserver = net.createServer();
roboserver.listen(PORT);
console.log('Server listening on ' + roboserver.address().address +':'+ roboserver.address().port);
roboserver.on('connection', function(sock) {
    	global.robotsock = sock;
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
      
	sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the roboserver
       // sock.write('{"type":"control", "control":"movement_start", "direction":"left"}' + "\n");
	  //sock.write(data);
        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
 
    // other stuff is the same from here
    
});
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


