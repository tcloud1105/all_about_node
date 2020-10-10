'use strict';
const SocketIO = require('socket.io');
const Stomp = require('stomp-client');

function main(server, options, next){
    const connectOpt = [process.env.appHost, process.env.appPort, process.env.User, process.env.appPass]
    const client = Stomp(...connectOpt);
 const io = SocketIO(server.listener);
 const events = require('events');
 const observe = new events.EventEmiiter();
 //let itemArray = [];
 const outQueue = '/queue/toPython';
 const inQueue = '/queue/fromPython';
 let itemArray = new Proxy([], {
     get: function(target, property){
         observe.emit('get');
         return target[property]; // itemArray[2]
     },
     set: function(target, property, value){
         observe.emit('set');
         target[property] = value; // itemArray[3] = "John Doe"
         return true;
     }
 })

 function stompClient(){
     return new Promise((resolve, reject) => {
        client.connect(sessionId => {
          console.log("Connected to Apache Apollo");
          client.subscribe(inQueue, body =>{
              itemArray.push(body);
              //observe.emit('set');
          })

          resolve(sessionId, client);
        }, error => {
            reject(error);
        });
     });
 }

 
function ioConnect(){
    io.on('connection', socket=> {
        console.log("COnnected!!");
   
        if(itemArray.length > 0){
            // Keep the button disabled
            socket
            .emit("buttonState", {
                state: false
            })
            .emit("allData", {
                dataArray: itemArray
            });
        }else{
            // Enable the button
            socket.emit("buttonState", {
                state: true
            });
        }
    });
}
 
    // Publish Data to Apollo
    socket.on('begin', () => {
        client.publish(outQueue, JSON.stringify(options.data));
    });

    // Watch the itemArray for changes
    // Array.observe(itemArray, () => {
    //     socket.emit('item', {
    //       dataArray: itemArray[itemArray.length - 1]
    //     });
    // });

    observe('set', () => {
        socket.emit('item', {
            dataArray: itemArray[itemArray.length - 1]
          });
    })

    stompClient()
      .tnen(ioConnect)
      .catch(err => {
         console.log("There was an error :: ", err);
         server.log('error', 'Error: '+err);
      });
    return next();
}

main.attributes = {
    name: 'main'
}

module.exports = main;