'use strict'
const helper = require('../helpers');

module.exports = (io,app)=>{
  let allrooms = app.locals.chatrooms;

  io.of('/roomslist').on('connection', socket => {
      socket.on('getChatrooms', () =>{
          socket.emit('chatRoomsList', JSON.stringify(allrooms));
      });
    
    socket.on('createNewRoom', newRoomInput => {
        // check to see if a room with the same title exists or not
        // if not, create one and broadcast it to everyone
        if(!helper.findRoomByName(allrooms, newRoomInput)){
            // Create a new room and broadcast all
            allrooms.push({
                room:newRoomInput,
                roomID: helper.randomHex(),
                users: []
            });

            // Emit an updated list to the creator
            socket.emit('chatRoomsList', JSON.stringify(allrooms));

            // Emit an updated list to everyone connected to the rooms page
            socket.broadcast.emit('chatRoomsList',JSON.stringify(allrooms))
         }

    });
      //console.log('Socket.io connected to client!');
  });

  io.of('/chatter').on('connection', socket => {
     // join a chatroom
     socket.on('join', data => {
         let usersList = helper.addUserToRoom(allrooms, data, socket);

         // Update the list of active users as shown on the chatroom page
         socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
         socket.emit('updateUsersList', JSON.stringify(usersList.users));
     });

     // When a socket exits
     socket.on('disconnect', () => {
         // Find the room, to which the socket is connected to and purge the user
         let room = helper.removeUserFromRoom(allrooms, socket);
         socket.broadcast.to(data.roomID).emit('updateUsersList',JSON.stringify(room.users)) 
     })
  });

  // When a new message arrives
  socket.on('newMessage', data =>{
      socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
  })
}