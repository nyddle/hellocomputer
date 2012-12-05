var clients = []; // массив подключенных юзеров по вебсокетам
global.clients = clients;    


// Socket.IO config
io.configure(function() {
    io.set('log level', 1);
    // Socket auth
    io.set('authorization', function(data, accept) {
        var sessionKey = 'x';
        cookieParser(data, {}, function(err) {
            if(err) {
                accept(err, false);
            } else {
                sessionStore.get(data.signedCookies[sessionKey], function(err, session) {
                    if(err || !session) {
                        accept('Session error', false);
                    } else {
                        data.session = session;
                        accept(null, true);
                    }
                });
            }
        });
    });
});

// рассылка изменений клиентам в очереди или 
// from - индекс пользователя в очереди, до которого рассылка не производится
var broadcast = function(from) {
        var addScoreMark = function(data, index) {
                var data = JSON.parse(data);
                data.score = index + 1;
                return data;
            };

        var makeList = function(data, score) {
                var res = [];
                if(score <= 10) {
                    for(var i = 0; i < 10; i++) {
                        if(data[i]) res.push(addScoreMark(data[i], i));
                    }
                } else {
                    for(var i = 0; i < 5; i++) {
                        if(data[i]) res.push(addScoreMark(data[i], i));
                    }
                    for(var i = (score - 1); i < (score + 5); i++) {
                        if(data[i]) res.push(addScoreMark(data[i], i));
                    }
                }
                return res;
            }

        Kue.list(function(data) {
            var time_left = 0;
            if(data) {
                var score = 0;
                for(key in data) {
                    if(data[key]) {
                        score++;
                        var user_data = JSON.parse(data[key]);
                        var user_id = user_data.user_id;
                        var game_time = user_data.game_time;

                        time_left += game_time;

                        var socketID = clients[user_id];
                        var socket = io.sockets.socket(socketID);

                        if(socket) socket.emit('list', {
                            list: makeList(data, score),
                            time_left: time_left,
                            score: score,
                            len: data.length
                        });
                    }
                }
            }
        });
};

global.broadcast = broadcast;

var getUserProfile = function(passport) {
    var res = {};
/*
    res.name = 'displayName'; //TODO: passport.displayName;

    if (passport.provider == 'vkontakte'){
        res.url = 'http://vk.com/'+passport.username;
        res.img = passport.photos[0].value;
    }

    if (passport.provider == 'facebook'){
        res.url = passport.profileUrl;
        res.img = passport.picture;
    }
*/
    return res;
}


module.exports = function(socket) {
    var user_id = socket.id;
    var session = socket.handshake.session;
    console.log('handshaking');
    if(session.passport) {
        var profile = getUserProfile(session.passport.user);
        var user_data = {
            user_id: user_id,
            name: profile.name,
            img: profile.img,
            url: profile.url,
            game_time: 30
        };

        stat.log('Авторизация id:', user_id);
        stat.incr('auths');

        Kue.add(user_id, user_data, function(res) {
            clients[user_id] = socket.id;
            broadcast();

            stat.log('В очередь добавлен на позицию ', res.score, ' из ', res.len, ' юзер id:', user_id);
            stat.metric('kue_len', res.len);
        });

    } 
    
    // DEBUG ONLY !!!
    socket.on('auth', function(uid) {
        user_id = uid;
        if(user_id === 0) {
            stat_socket = socket;
            stat.bootstrap();
        } else {
            stat.log('Авторизация id:', user_id);
            stat.incr('auths');

            var user_data = {
                user_id: user_id,
                name: 'user' + user_id,
                img: '/img/ava.jpg',
                url:'http://test-url.com/',
                game_time: 30
            }
            

            Kue.add(user_id, user_data, function(res) {
                clients[user_id] = socket.id;
                broadcast();

                stat.log('В очередь добавлен на позицию ', res.score, ' из ', res.len, ' юзер id:', user_id);
                stat.metric('kue_len', res.len);
            });
        }

    });

    socket.on('control', function(data) {
	console.log(data);
	global.robotsocket && robotsocket.emit('control', data);
	console.log(data);
    });
    
    // соединение разоравано, удаляем из очереди
    socket.on('disconnect', function() {
        Kue.del(user_id, function(res) {
            delete clients[user_id];
            broadcast();
            stat.incr('kue_left');
            stat.metric('kue_len', res.len);
        });

    });

};

