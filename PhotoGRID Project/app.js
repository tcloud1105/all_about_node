'use strict';
var express = require('express'),
    path = require('path'),
    config = require('./config/config'),
    knox = require('knox'),
    fs = require('fs'),
    os = require('os'),
    formidable = require('formidable')
    gm = require('gm');
    mongoose = require('mongoose').connect(config.dbURL)

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.set('host',config.host);

var knoxClient = knox.createClient({
   key:config.S3AccessKey,
   secret: config.S3Secret,
   bucket: config.S3Bucket
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);

var server = require('http').createServer(app);
var io = require('socket.io')(server);
require('./router/routes')(express, app, formidable, fs, os, gm, knoxClient, mongoose, io);


server.listen(app.get('port'), function(){
    console.log("PhotoGRID Running on port: "+ app.get('port'));
})