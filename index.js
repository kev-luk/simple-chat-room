const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const port = process.env.PORT || 3000;

const users = {};
let userNum = 0;

app.use(express.static(path.join(__dirname + '/public')));

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

io.on('connection', (socket) => {
    socket.on('new-user', (name) => {
        userNum++;
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });

    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', {
            message: message,
            name: users[socket.id],
        });
    });

    socket.on('check-typing', (name) => {
        socket.broadcast.emit('typing', name);
    });

    socket.on('check-done-typing', () => {
        socket.broadcast.emit('typing-done');
    });

    socket.on('send-participants', () => {
        io.of('/').clients((error, clients) => {
            if (error) throw error;

            const names = clients.map((id) => {
                return users[id];
            });

            socket.emit('check-participants', names);
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
        delete users[socket.id];
    });
});

server.listen(port, () => {
    console.log('Running server...');
});
