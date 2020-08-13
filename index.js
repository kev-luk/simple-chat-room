const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const moment = require('moment');
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
        console.log(userNum);
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });

    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', {
            message: message,
            name: users[socket.id],
            time: moment().format('h:mm A'),
        });
    });

    socket.on('check-typing', (check) => {
        if (check.typing == true) {
            socket.broadcast.emit('typing', {
                name: users[socket.id],
            });
        }
    });

    socket.on('send-participants', (data) => {
        if (data.click == true) {
            io.of('/').clients((error, clients) => {
                if (error) throw error;

                const names = clients.map((id) => {
                    return users[id];
                });

                socket.emit('check-participants', names);
            });
        }
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
