const express = require('express');
const app = express();
const server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');

var port = process.env.PORT || 3000;

const users = {};
var userNum = 0;

app.use(express.static(path.join(__dirname + '/public')));

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

io.on('connection', (socket) => {
    socket.on('new-user', (name) => {
        userNum++;
        console.log(userNum);
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
        socket.broadcast.emit('numUsers', userNum);
    });

    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', {
            message: message,
            name: users[socket.id],
        });
    });

    socket.on('disconnect', () => {
        if (userNum > 0) {
            userNum--;
        }

        socket.broadcast.emit(`user-disconnected`, {
            name: users[socket.id],
            num: userNum,
        });

        console.log(`${users[socket.id]} left the chat`);

        delete users[socket.id];

        console.log(userNum);
    });
});

server.listen(port, () => {
    console.log('Running server...');
});
