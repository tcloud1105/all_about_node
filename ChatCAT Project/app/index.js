'use strict';
const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

// Social Authentication Logic
require('./auth')();

// const router = require('express').Router();

// router.get('/',(req, res, next)=>{
//     // res.send('<h1>Hello Express!</h1>');
//  });

// Create an IO Server Instance
let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app);
    const io = require('socket.io')(server);
    io.use('transports', ['websocket']); 

    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    let subClient = redis(config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    });

    io.adapter(adapter({
        pubClient,
        subClient
    }));
    io.use((socket, next) =>{
        require('./session')(socket.request, socket.request.res, next);
    });
    require('./socket')(io,app);
    return server
}

 module.exports = {
     router: require('./routes')(),
     session: require('./session'),
     ioServer,
     logger: require('./logger')
 }