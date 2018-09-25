/*
Server side code (written with node js)
Notes:
I used the node js express library.
Generally, the server has a simple job: it listens to all the possible socket messages,
and when a new messsage arrives it emits it to the other connected clients
The possible socket messages are: (will be ellaborated)
-message
-user_joined
-nick_changed
-user_left
-connect (default)
-disconnect (default)
*/
var express = require('express');
var socket = require('socket.io');
var chatApp = express();

//the server listens to port 8000 by default
var server = chatApp.listen(8000, function () {
    console.log("Chat server is up and running. waiting for incoming connection");
  });

//by default the page which is delivered to the user is index.html inside the public dir
chatApp.use(express.static(__dirname + '/public'));

//the counting of the online users happens at server side
var onlineusers = 0;
var io = socket(server);
//when there is a new connection, do the following things (written in the callbacl function)
io.on('connection',function(socket){
    
    //new chat message received
    socket.on('message',function(data){
        io.sockets.emit('message', {nickname: data.nickname,content: data.content});
    });
    //new user joined
    socket.on('user_joined',function(data){
        onlineusers = onlineusers + 1;
        io.sockets.emit('user_joined', {nickname: data.nickname,onlineusers: onlineusers});
    });
    //user's nick has changed
    socket.on('nick_changed',function(data){
        io.sockets.emit('nick_changed', {prevnickname: data.prevnickname,nickname: data.nickname});
    });
    //user has disconnected
    socket.on('disconnect', function () {
        onlineusers = onlineusers - 1;
        io.sockets.emit('user_left', {onlineusers: onlineusers});
    });
    
});