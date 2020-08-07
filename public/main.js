const socket = io();
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.message-input');
const messageContainer = document.querySelector('.message-container');

const name = prompt('What is your name?');
headerMessage(`${name} has connected`);
headerMessage(`Welcome to the chat room ${name}!`);
socket.emit('new-user', name);

socket.on('user-connected', (name) => {
    headerMessage(`${name} connected`);
});

socket.on('user-disconnected', (data) => {
    headerMessage(`${data.name} has disconnected`);
    if (data.num === 1) {
        headerMessage(`${data.num} participant in the chat`);
    } else {
        headerMessage(`${data.num} participants in the chat`);
    }
});

socket.on('chat-message', (data) => {
    addMessage(`${data.name}: ${data.message}`);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let message = messageInput.value;
    if (message != '') {
        addMessage(`You: ${message}`);
    }
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function addMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'new-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
}

function headerMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'welcome-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
}

function disconnectMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'new-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
}

function randomColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    console.log('#' + randomColor);
    return '#' + randomColor;
}
