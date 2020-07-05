const socket = io('http://localhost:3000');
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.message-input');

socket.on('chat-message', (data) => {
    console.log(data);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});
