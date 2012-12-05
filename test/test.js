/**
 * Escape the given `html`.
 *
 * Examples:
 *
 *     utils.escape('<script></script>')
 *     // => '&lt;script&gt;&lt;/script&gt;'
 *
 * @param {String} html string to be escaped
 * @return {String} escaped html
 * @api public
 */
var io = require('socket.io-client'),
    util = require('util');

var socketURL = 'http://localhost';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var MAX_CLIENTS = 25,
    INRVL = 100,
    WGHT = 0.30;  // Вес 50%
 

var sockets = [],
    nextID = 0;



/**
 * Output the given `str` to _stdout_
 * or the stream specified by `options`.
 * 
 * @param {String} str
 * @param {Object} options
 * @return {Object} exports for chaining
 */
var connect = function () {

    if (nextID < MAX_CLIENTS) {
        
        var socket = io.connect(socketURL, {
            "force new connection": true
        });
        //sockets.push(socket);
        socket.on('connect', function () {
            // socket connected
            console.log('connect id',nextID);
            socket.emit('auth', nextID);
            socket.myID = nextID;
            sockets.push(socket);
            nextID++;
        });
        socket.on('list', function (data) {
            //console.log('msg > ',socket.myID, util.inspect(data));
        });
        socket.on('disconnect', function () {
            console.log('socket disconnected');

        });
        //var timestamp = Number(new Date());

    } else {
        console.log('max clients',MAX_CLIENTS);
    }

};

var disconnect = function () {
    //var rnd = Math.floor(Math.random()*sockets.length);
    
    var socket = sockets.shift();
    
    //if (socket) socket.emit('forceDisconnect');
    if (socket) {
        console.log('disconnect > ',socket.myID);
        //socket.disconnect()
    };


};

var loop = function(){
    var dice = Math.random() > WGHT ? connect : disconnect;
    dice();
    console.log('= ',sockets.length);
};

var interval = setInterval(loop, INRVL);