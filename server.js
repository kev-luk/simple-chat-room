const express = require('express');
const app = express();
const http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    console.log('New user');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
    socket.on('send-chat-message', (msg) => {
        console.log('message: ' + msg);
    });
});

http.listen(3000, () => {
    console.log('Successfully started server...');
});
