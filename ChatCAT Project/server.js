'use strict'
const express = require('express');
const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.set('view engine','ejs');
//app.set('view','./views');

app.use(express.static('public'));
app.use(chatCat.session)
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined',{
    stream: {
        write: message => {
            // Write to logs
            chatCat.logger.log('info', message);
        }
    }
}))

app.use('/', chatCat.router);
app.use(ch)

// let helloMiddleware = (req, res, next)=>{
//     req.hello = "Hello! it's me! I was wondering.....you get the idea";
//     next();
// }

// app.use('/',helloMiddleware);
// app.get('/dashboard',(req, res, next)=>{
//     res.send('<h1>This is the dashboard page! Middleware says: '+req.hello+'</h1>');
// });

chatCat.ioServer(app).listen(app.get('port'),()=>{
    console.log('ChatCat Running on port: ', app.get('port'));
})