const socket = io();
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.message-input');
const messageContainer = document.querySelector('.message-container');
const chatTitle = document.getElementById('chat-title');

const name = prompt('What is your name?');
headerMessage("Welcome to Let'sChat!");
headerMessage(`${name} has connected`);
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
    addMessage(data.message, data.name);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let message = messageInput.value;
    if (message != '') {
        addMessage(message);
    }
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function addMessage(message, user = 'You') {
    let messageElement = document.createElement('div');
    let messageText = document.createElement('div');
    let infoText = document.createElement('div');
    messageElement.className = 'new-message';
    infoText.innerText = `${moment().format('h:mm A')}, ${user}`;
    infoText.style.fontSize = '0.8rem';
    infoText.style.marginTop = '0.2em';
    messageText.innerText = message;
    messageText.style.fontWeight = 600;
    messageElement.appendChild(messageText);
    messageElement.appendChild(infoText);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
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
    return `#${randomColor}`;
}
