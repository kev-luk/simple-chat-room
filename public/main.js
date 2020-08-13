const socket = io();
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.message-input');
const messageContainer = document.querySelector('.message-container');
const participantsButton = document.querySelector('#participants');
const userModal = document.querySelector('.user-modal');
const closeBtn = document.querySelector('.close-btn');
const modalBody = document.querySelector('.modal-body');

const typingInterval = 2000;
let typingTimer;
let name = '';

/* ask for name of the user */
while (name.trim() == '') {
    name = prompt('What is your name?');
}

headerMessage("Welcome to Let'sChat!");
headerMessage(`${name} has connected`);

/* send name of user to server */
socket.emit('new-user', name);

/* listen for events */
socket.on('user-connected', (name) => {
    headerMessage(`${name} connected`);
});

socket.on('chat-message', (data) => {
    messageContainer.removeChild(document.querySelector('.typing-message'));
    addMessage(data.message, data.name);
});

socket.on('typing', (name) => {
    if (!document.body.contains(document.querySelector('.typing-message'))) {
        typingMessage(name);
    }
});

socket.on('typing-done', () => {
    messageContainer.removeChild(document.querySelector('.typing-message'));
});

socket.on('check-participants', (people) => {
    openModal();
    people.forEach((user) => {
        let person = document.createElement('div');
        person.className = 'user-container';
        person.innerText = user;
        modalBody.appendChild(person);
    });
});

socket.on('user-disconnected', (data) => {
    headerMessage(`${data.name} has disconnected`);
    if (data.num === 1) {
        headerMessage(`${data.num} participant left in the chat`);
    } else {
        headerMessage(`${data.num} participants left in the chat`);
    }
});

/* event listeners for client */
participantsButton.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('send-participants');
});

closeBtn.addEventListener('click', () => {
    closeModal(modalBody);
});

window.addEventListener('click', (e) => {
    outsideClick(e, modalBody);
});

messageInput.addEventListener('keypress', () => {
    clearInterval(typingTimer);
    typingTimer = setTimeout(doneTyping, typingInterval);
    socket.emit('check-typing', name);
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

/* functions */
function doneTyping() {
    socket.emit('check-done-typing');
}

function addMessage(message, user = 'You') {
    let messageElement = document.createElement('div');
    let messageText = document.createElement('div');
    let infoText = document.createElement('div');
    messageElement.className = 'new-message';
    infoText.className = 'info-text';
    infoText.innerText = `${moment().format('h:mm A')}, ${user}`;
    messageText.innerText = message;
    messageText.style.fontWeight = 600;
    messageElement.appendChild(messageText);
    messageElement.appendChild(infoText);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function typingMessage(user) {
    let messageElement = document.createElement('div');
    let messageText = document.createElement('div');
    messageElement.className = 'typing-message';
    messageText.innerText = `${user} is typing...`;
    messageElement.appendChild(messageText);
    messageContainer.append(messageElement);
}

function headerMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'welcome-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function disconnectMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'new-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function randomColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    console.log('#' + randomColor);
    return `#${randomColor}`;
}

function openModal() {
    userModal.style.display = 'block';
}

function closeModal(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    userModal.style.display = 'none';
}

function outsideClick(e, parent) {
    if (e.target == userModal) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        userModal.style.display = 'none';
    }
}
