// Сохраняем текущий выбранный userId и WebSocket соединение
let selectedUserId = null;
let socket = null;
let messagePollingInterval = null;

// Функция выхода из аккаунта
async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/auth';
        } else {
            console.error('Ошибка при выходе');
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

// Функция выбора пользователя
async function selectUser(userId, userName, event) {
    selectedUserId = userId;
    document.getElementById('chatHeader').innerHTML = `<span>Чат с ${userName}</span><button class="logout-button" id="logoutButton">&#128682</button>`;
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendButton').disabled = false;

    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');

    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'block';

    document.getElementById('logoutButton').onclick = logout;

    await loadMessages(userId);
    connectWebSocket();
    startMessagePolling(userId);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

}

// Загрузка сообщений
async function loadMessages(userId) {
    try {
        const response = await fetch(`/chat/messages/${userId}`);
        const messages = await response.json();

        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = messages.map(message =>
            createMessageElement(message.content, message.recipient_id)
        ).join('');
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

// Подключение WebSocket
function connectWebSocket() {
    if (socket) socket.close();

    socket = new WebSocket(`ws://${window.location.host}/chat/ws/${selectedUserId}`);

    //socket.onopen = () => console.log('WebSocket соединение установлено');

    socket.onmessage = (event) => {
        const incomingMessage = JSON.parse(event.data);
        if (incomingMessage.recipient_id === selectedUserId) {
            addMessage(incomingMessage.content, incomingMessage.recipient_id);
        }
    };

    //socket.onclose = () => console.log('WebSocket соединение закрыто');
}

// Отправка сообщения
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (message && selectedUserId) {
        const payload = {recipient_id: selectedUserId, content: message};

        try {
            await fetch('/chat/messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            socket.send(JSON.stringify(payload));
            addMessage(message, selectedUserId);
            messageInput.value = '';
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    }
}

// Добавление сообщения в чат
function addMessage(text, recipient_id) {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.insertAdjacentHTML('beforeend', createMessageElement(text, recipient_id));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Создание HTML элемента сообщения
function createMessageElement(text, recipient_id) {
    const userID = parseInt(selectedUserId, 10);
    const messageClass = userID === recipient_id ? 'my-message' : 'other-message';
    return `<div class="message ${messageClass}">${text}</div>`;
}

// Запуск опроса новых сообщений
function startMessagePolling(userId) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = setInterval(() => loadMessages(userId), 1000);
}

// Обработка нажатий на пользователя
function addUserClickListeners() {
    document.querySelectorAll('.user-item').forEach(item => {
        item.onclick = event => selectUser(item.getAttribute('data-user-id'), item.textContent, event);
    });
}

// Первоначальная настройка событий нажатия на пользователей
addUserClickListeners();

// Обновление списка пользователей
async function fetchUsers() {
    try {
        const response = await fetch('/auth/users');
        const users = await response.json();
        const userList = document.getElementById('userList');

        // Очищаем текущий список пользователей
        userList.innerHTML = '';

        // Создаем элемент "Избранное" для текущего пользователя
        const favoriteElement = document.createElement('div');
        favoriteElement.classList.add('user-item');
        favoriteElement.setAttribute('data-user-id', currentUserId);
        favoriteElement.textContent = 'Избранное';

        // Добавляем "Избранное" в начало списка
        userList.appendChild(favoriteElement);

        // Генерация списка остальных пользователей
        users.forEach(user => {
            if (user.id !== currentUserId) {
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.setAttribute('data-user-id', user.id);
                userElement.textContent = user.name;
                userList.appendChild(userElement);
            }
        });

        // Повторно добавляем обработчики событий для каждого пользователя
        addUserClickListeners();
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}


document.addEventListener('DOMContentLoaded', fetchUsers);
//setInterval(fetchUsers, 10000); // Обновление каждые 10 секунд



const emojiPicker = document.getElementById('emojiPicker');
const togglePicker = document.getElementById('togglePicker');
const emojiInput = document.getElementById('messageInput');

// Обработчик для клика по кнопке
togglePicker.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Обработчики для наведения и снятия наведения
togglePicker.addEventListener('mouseenter', () => {
    emojiPicker.style.display = 'block';
});

// Обработчик для снятия наведения с панели
emojiPicker.addEventListener('mouseleave', () => {
    emojiPicker.style.display = 'none';
})

// Обработчик для клика по смайлам
document.querySelectorAll('.emoji').forEach(emoji => {
    emoji.addEventListener('click', (event) => {
        emojiInput.value += event.target.textContent;
        emojiPicker.style.display = 'none';
    });
});

// Закрытие выбора эмодзи при клике вне его
document.addEventListener('click', (event) => {
    if (!emojiPicker.contains(event.target) && !togglePicker.contains(event.target)) {
        emojiPicker.style.display = 'none';
    }
});

// Обработчик для кнопки отправки
document.getElementById('sendButton').onclick = sendMessage;

// Обработчик для ввода сообщения с клавиатуры
document.getElementById('messageInput').onkeypress = async (e) => {
    if (e.key === 'Enter') {
        await sendMessage();
    }
};



