/**
 * Сбор метрик приложения
 *
 * @class stat
 */


/**
 * Замена console.log
 *
 * @method log
 * @param args* Произвольное количество аргументов
 */
exports.log = function () {
  var timestamp = Number(new Date());
  var msg = Array.prototype.join.call(arguments, ' ');
  //args = Array.prototype.join.call(arguments, ',');
  console.log('[log]', msg);
  if (global.stat_socket) stat_socket.emit('log', msg);
};

/**
 * Изменение значения метрики
 *
 * @method metric
 * @param {String} key Метрика
 * @param {String} val Значение
 */
exports.metric = function (key, val) {
  if (global.stat_socket) stat_socket.emit('metric', {
    'key': key,
    'val': val
  });
};

/**
 * Увеличения счетчика метрики
 *
 * @method incr
 * @param {String} key Метрика
 * @param {String} val Значение
 */

exports.incr = function (key, val, unicall) {
  redis.incr('metrics:' + key, function (err, res) {
    if (!err && global.stat_socket) stat_socket.emit('metric', {
      'key': key,
      'val': res
    });
  });
};

exports.bootstrap = function () {

  redis.get('metrics:kue_left', function (err, res) {
    if (!err && global.stat_socket) stat_socket.emit('metric', {
      'key': 'kue_left',
      'val': res
    });
  });
  redis.get('metrics:games_all', function (err, res) {
    if (!err && global.stat_socket) stat_socket.emit('metric', {
      'key': 'games_all',
      'val': res
    });
  });
  redis.get('metrics:games_win', function (err, res) {
    if (!err && global.stat_socket) stat_socket.emit('metric', {
      'key': 'games_win',
      'val': res
    });
  });


};

exports.stat = function (req, res) {
  console.log('stat');
  res.render('stat.html');
};

