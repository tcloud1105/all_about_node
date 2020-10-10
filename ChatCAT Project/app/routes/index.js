'use strict';
const helper = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = ()=>{
    let routes = {
        'get': {
            '/': (req, res, next)=>{
               res.render('login');
            },
            '/rooms': [helper.isAuthenticated(), (req, res, next)=>{
                res.render('rooms',{
                    user: req.user
                });
             }],
             '/chat/:id': [helper.isAuthenticated(),(req, res, next)=>{
                 // Find a chatroom with the given id
                 // Render it if the id is found
                 let getRoom = helper.findRoomById(req.app.locals.chatrooms, req.params.id);
                 if(getRoom === undefined){
                     next()
                 }else{
                    res.render('chatroom',{
                        user: req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomID: getRoom.roomID
                    });
                 }
             
             }],
             '/getsession': (req, res, next) =>{
                 res.send("My favorite color is: ", req.session.favColor)
             },
             '/setsession': (req, res, next) =>{
            req.session.favColor = 'Red';
            res.send('Session Set');
            },
             '/auth/facebook': passport.authenticate('facebook'),
             '/auth/facebook/callback':passport.authenticate('facebook',{
                 successRedirect: '/rooms',
                 failureRedirect: '/'
             }),
             '/auth/twitter': passport.authenticate('twitter'),
             '/auth/twitter/callback':passport.authenticate('twitter',{
                 successRedirect: '/rooms',
                 failureRedirect: '/'
             }),
             'logout': (req,res,next) => {
                 req.logout();
                 res.redirect('/');
             }
        },
        'post':{

        },
        'NA': (req, res, next)=>{
           res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    }


   return helper.route(routes)

}