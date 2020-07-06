const express = require('express');
const app = express();
const server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');

var port = process.env.PORT || 3000;

const users = {};
var userNum = 0;

server.listen(port, () => {
    console.log('Successfully started server...');
});

app.use(express.static(path.join(__dirname + '/public')));

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

io.on('connection', (socket) => {
    socket.on('user-num', (userNum) => {
        socket.broadcast.emit('users-num', userNum);
    });
    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });

    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', {
            message: message,
            name: users[socket.id],
        });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit(`user-disconnected`, users[socket.id]);
        delete users[socket.id];
    });
});
