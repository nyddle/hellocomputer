/**
*  Работа с очередью и gameloop
*
*/

var redis = require("redis").createClient(),
    game_states = ['prepare', 'game', 'over'],
    timeouts = [30, 10],
    game_state_loop = false,
    game_timeout, //timer
    game_pre_timeout, //timer
    Kue = {};

global.redis = redis;
global.Kue = Kue;
// добавить в конец очереди
Kue.add = function(user_id, user_data, cb) {
    var timestamp = Number(new Date());
    redis.zadd('kue', timestamp, user_id, function(err, res) {
        Kue.len(function(len) {
            redis.hmset('user:' + user_id, 'timestamp', timestamp, 'user_data', JSON.stringify(user_data), function(err, res) {
                // позиция в очереди
                Kue.score(user_id, function(err, score) {
                    cb({
                        'len': len,
                        'score': score + 1
                    });
                });
            });
        });
    });

};

// получить длину очереди
Kue.len = function(cb) {
    redis.zcard('kue', function(err, res) {
        if(!err && res) {
            cb(res);
        } else {
            cb(0);
        }
    });
};


// удалить из очереди user_id
Kue.del = function(user_id, cb) {
    // позиция удаляемого в очереди 
    Kue.score(user_id, function(err, score) {
        //удалить из списка
        redis.zrem('kue', user_id, function(err, res) {
            // длина очереди
            Kue.len(function(len) {
                cb({
                    'len': len,
                    'score': score + 1
                });
                stat.metric('kue_len', len);
                stat.log('Удален с позиции', (score + 1), ' осталось в очереди ', len, ' юзер id:', user_id);
            });
        });
    });
};

// получить и удалить первую запись в очереди
Kue.next = function(cb) {
    redis.zrange('kue', 0, 0, function(err, res) {
        var user_id = res
        cb(user_id);
        Kue.del(user_id, function() {});
    });
};


// получить позицию элемента в очереди
Kue.score = function(user_id, cb) {
    redis.zrank('kue', user_id, cb);
};

// получить полный список пользователей в очереди
Kue.list = function(cb) {
    redis.sort('kue','by', 'user:*->timestamp', 'get',  'user:*->user_data', function(err, res) {
        cb(res);
    });
};

var sendUserGameState = function(user_id, state, time) {
        if(clients[user_id]) {
            var socketID = clients[user_id];
            var socket = io.sockets.socket(socketID);

            socket.emit('state', {
                'state': state,
                'time': time,
            });
        } else {
            clearTimeout(game_timeout);
            clearTimeout(game_pre_timeout);
            game_state_loop = false;
        }
    };

var game = function(user_id) {

	sendUserGameState(user_id, 'queue', timeouts[0]); 
        setTimeout(function() { sendUserGameState(user_id, game_states[0],9); },  10000);
        setTimeout(function() { sendUserGameState(user_id, game_states[1],30); },  19000);
        setTimeout(function() { sendUserGameState(user_id, game_states[2],0); },  49000);

        game_pre_timeout = setTimeout(function() {
            sendUserGameState(user_id, game_states[1], timeouts[1]);

            game_timeout = setTimeout(function() {
                sendUserGameState(user_id, game_states[2], 0);
                broadcast();
                game_state_loop = false;
                stat.incr('games_all');
                stat.incr('games_win');
            }, timeouts[1]);
        }, 60000);
    };


// GAME LOOP
setInterval(function() {
   // console.log('GAME-LOOP');
    if(!game_state_loop) {
        Kue.len(function(len) {
            if(len) {
                Kue.next(function(user_id) {
                    game_state_loop = true;
                    game(user_id);
                    stat.metric('kue_now', user_id);
                });
            } else { // очередь пуста
                stat.metric('kue_now', '-');
                game_state_loop = false;
            }
        });
    }
}, 100);


module.exports = Kue;


