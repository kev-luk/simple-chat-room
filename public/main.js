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

/* send name of user to server */
socket.emit('new-user', name);

/* listen for events */
socket.on('user-connected', (name) => {
    let newUserElement = document.createElement('div');
    newUserElement.className = 'header-message other';
    newUserElement.innerText = `${name} has connected`;
    messageContainer.appendChild(newUserElement);
});

socket.on('chat-message', (data) => {
    document.querySelector('.typing-message').remove();
    addOtherMessage(data.message, data.name);
});

socket.on('typing', (name) => {
    if (!document.body.contains(document.querySelector('.typing-message'))) {
        typingMessage(name);
    }
});

socket.on('typing-done', () => {
    if (document.body.contains(document.querySelector('.typing-message'))) {
        document.querySelector('.typing-message').remove();
    }
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
    disconnectMessage(data.name);
    if (data.num === 1) {
        let newUserElement = document.createElement('div');
        newUserElement.className = 'header-message other';
        newUserElement.innerText = 'You are the only person in the chat';
        messageContainer.appendChild(newUserElement);
    } else {
        let newUserElement = document.createElement('div');
        newUserElement.className = 'header-message other';
        newUserElement.innerText = `${data.num} participant lefts in the chat`;
        messageContainer.appendChild(newUserElement);
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
        addUserMessage(message);
    }
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

/* functions */
function doneTyping() {
    socket.emit('check-done-typing');
}

function headerMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'header-message';
    messageElement.innerHTML = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function addUserMessage(message) {
    let messageElement = document.createElement('div');
    let messageText = document.createElement('div');
    let infoText = document.createElement('div');
    messageElement.className = 'add-message';
    infoText.className = 'info-text';
    infoText.innerText = `${moment().format('MM/D/YYYY h:mm A')}, You`;
    messageText.innerText = message;
    messageText.className = 'message-text';
    messageElement.appendChild(messageText);
    messageElement.appendChild(infoText);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function addOtherMessage(message, user) {
    let messageElement = document.createElement('div');
    let messageText = document.createElement('div');
    let infoText = document.createElement('div');
    messageElement.className = 'add-message other';
    infoText.className = 'info-text';
    infoText.innerText = `${moment().format('MM/D/YYYY h:mm A')}, ${user}`;
    messageText.innerText = message;
    messageText.className = 'message-text';
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

function disconnectMessage(user) {
    let messageElement = document.createElement('div');
    messageElement.className = 'header-message other';
    messageElement.innerHTML = `${user} has disconnected`;
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
