// Подключение WebSocket
function connectWebSocket() {
    if (socket) socket.close();

    socket = new WebSocket(`ws://${window.location.host}/chat/ws/${selectedUserId}`);

    socket.onopen = () => {
        console.log('WebSocket соединение установлено');
        statusOn(currentUserId);
    }

    socket.onmessage = (event) => {
        const incomingMessage = JSON.parse(event.data);
        if (incomingMessage.recipient_id === selectedUserId) {
            addMessage(incomingMessage.content, incomingMessage.recipient_id);
        }
    };

    socket.onclose = () => 
        console.log('WebSocket соединение закрыто');
}

// Функция выбора пользователя
async function selectUser(userId, userName, event) {

    selectedUserId = userId;
    const userNametrim = userName.trim();
    const userNamesplit = userNametrim.split(' ');
    const headerName = userNamesplit.slice(1,46).join(' ');
    document.getElementById('chat-header').innerHTML = `<span>${headerName}</span> <br> <small style="color: #8e8e8e;">${status || "offline"}</small>` ;
    document.getElementById('messageInput').disabled = false;
    document.getElementById('send-btn').disabled = false;
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.style.backgroundImage = "url('/static/img/chatwall2.png')";


    if (!event.target.classList.contains('active')){ document.querySelectorAll('.friend').forEach(item => item.classList.remove('active'));
        event.target.classList.add('active');
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        messagesContainer.style.display = 'block';

        await loadMessages(userId);
        connectWebSocket();
        startMessagePolling(userId);
        readMessages(userId);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;}}

// Обработка нажатий на пользователя
function addUserClickListeners() {
    document.querySelectorAll('.friend').forEach(item => {
        item.onclick = event => selectUser(item.getAttribute('data-user-id'), item.textContent, event);
    });
}

// Отрисовка пользователей
async function fetchUsers() {
    try {
        const response = await fetch('/auth/users');
        const users = await response.json();
        const userList = document.getElementById('friends-list');
        
        userList.innerHTML = '';
        // Создаем элемент "Избранное" для текущего пользователя
        const favoriteElement = document.createElement('div');
        favoriteElement.classList.add('friend');
        favoriteElement.setAttribute('data-user-id', currentUserId);

        // Добавляем "Избранное"
        favoriteElement.innerHTML = `
            <span style="font-size: 30px;">${avatars[avatar]}</span>
                <div>Мои записи</div>`;

        userList.appendChild(favoriteElement);

        // Генерация списка остальных пользователей
        users.forEach(user => {
            if (user.id !== currentUserId) {
                const userElement = document.createElement('div');
                userElement.classList.add('friend');
                userElement.setAttribute('data-user-id', user.id);
                userElement.setAttribute('status', user.online_status);
                // Устанавливаем контент с учетом аватара, имени и последнего сообщения
                userElement.innerHTML = `
                    <span style="font-size: 30px;">${avatars[user.avatar]}</span>
                    <div>
                    ${user.name}
                    <!--small class="lastMessage"style="color: #8e8e8e;">${lastMessage || "Нет сообщений"}</small-->
                    </div>
                    <div class="online-status ${user.online_status ? 'online' : 'offline'}" ></div>
                    
                    <div class="mail" id='notification-${user.id}' style="display: none;">💬<span class="notification-badge" id="unread-count-${user.id}"></span>
                    </div>
                    `;
                userList.appendChild(userElement);
                checkUnreadCountMessages(user.id);
            }

        });
        //setInterval(() => {users.forEach(user => {checkUnreadMessages(user.id);});},1000);
        // Повторно добавляем обработчики событий для каждого пользователя
        addUserClickListeners();
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}

// Загрузка сообщений





async function statusOn(userId) {
    try {
        const response = await fetch(`/auth/user/status_on/${userId}`, { 
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: true }) // Пример добавления тела запроса
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Статус пользователя обновлен:', data);
        
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
    }
}

async function statusOff(userId) {
    try {
        const response = await fetch(`/auth/user/status_off/${userId}`, { 
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Статус пользователя обновлен:', data);
        
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
    }
}

async function checkStatus() {
    try {
        const response = await fetch('/auth/users/check_status');
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const usersStat = await response.json();        
        
    } catch (error) {
        console.error('Ошибка загрузки статусов:', error);
    }
}

async function loadMessages(userId) {
    try {
        const response = await fetch(`/chat/messages/${userId}`);
        const messages = await response.json();
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = messages.map(message =>
            createMessageElement(message.content, message.recipient_id, message.created_at)
        ).join('');
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
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
    messagesContainer.insertAdjacentHTML('beforeend', createMessageElement(text, recipient_id, 0));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Создание HTML элемента сообщения

function createMessageElement(text, recipient_id, createdAt) {
    const date = new Date(createdAt);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
// Запуск опроса новых сообщений
    const messageClass = currentUserId === recipient_id ? 'other-message' : 'my-message';
    //if (text.include(avatars)) {return `<div class="message ${messageClass}" style="font-size: 30px;">${text}<div class="createdAt">${hours+5}:${minutes}</div></div>`;}
    return `<div class="message ${messageClass}">${text}<div class="createdAt">${hours+5}:${minutes}</div></div>`;
    }
    
function startMessagePolling(userId) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = setInterval(() => loadMessages(userId), 1000);
}

// Обновление сообщений
async function updateMess() {
    try {
        const response = await fetch('/auth/users');
        const users = await response.json();

        users.forEach(user => {
            if (user.id !== currentUserId ) {
                setInterval(() => checkUnreadCountMessages(user.id),1000);
            }
        });
        //
        // Повторно добавляем обработчики событий для каждого пользователя
        addUserClickListeners();
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}

async function checkUnreadCountMessages(userId) {
    const response = await fetch(`/chat/messages/unread_count/${userId}`);
    const data = await response.json();
    const unreadCount = data.unread_count;

    const notification = document.getElementById(`notification-${userId}`);
    const unreadCountEl = document.getElementById(`unread-count-${userId}`); // Обновить количество

    // Получаем элемент пользователя по data-user-id
    const userElement = document.querySelector(`.friend[data-user-id="${userId}"]`);

    // Проверяем, существует ли элемент и имеет ли он класс active
    if (userElement && userElement.classList.contains('active')) {
        // Если элемент активен, скрываем уведомление
        readMessages(userId);
        notification.style.display = "none";
    } else {
        // Если элемент не активен, показываем или скрываем уведомление в зависимости от unreadCount
        if (unreadCount > 0) {
            // Показать значок непрочитанного сообщения
            notification.style.display = "block";
            unreadCountEl.textContent = unreadCount;
        } else {
            // Скрыть значок
            notification.style.display = "none";
        }
    }
}

async function readMessages(userId) {
    try {
        const response = await fetch(`/chat/messages/read/${userId}`, { // Убедитесь, что вы передаете правильные параметры
        method: 'PUT',
        headers: {'Content-Type': 'application/json',}
        });
        if (response.ok) {
            console.log('Сообщения прочитаны');
        } else {
            console.error('Ошибка');
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

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

statusOff(currentUserId);

// Первоначальная настройка событий нажатия на пользователей
const friends = document.getElementById('friends-list');
// Обновление списка пользователей
let selectedUserId = null;
let lastMessage = null;
const userID = parseInt(selectedUserId, 10);
// Эмодзи пикер
const emojiBtn = document.querySelector('.emoji-btn');
const emojiPicker = document.getElementById('emojiPicker');
const messageInput = document.querySelector('.message-input input');
const emojis = [ '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '💪','🦵','🦶','👂','👃','🤏','👈','👉','☝','👆','👇','✌','🤞','🖖','🤘','🤙','🖐','✋','👌','👍','👎','✊','👊','🤛','🤜','🤚','🤟','✍','🙏','🤝','👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '👩', '🧔', '👵', '👴', '👲', '👳‍♀', '👳‍♂', '🧕', '👮‍♀', '👮‍♂', '👷‍♀', '👷‍♂', '💂‍♀', '💂‍♂', '🕵️‍♀', '🕵️‍♂', '👩‍⚕', '👨‍⚕', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈', '👨‍✈', '👩‍🚀', '👨‍🚀', '👩‍⚖', '👨‍⚖', '🤶', '🎅', '🧙‍♀', '🧙‍♂', '🧝‍♀', '🧝‍♂', '🧛‍♀', '🧛‍♂', '🧟‍♀', '🧟‍♂', '🧞‍♀', '🧞‍♂', '🧜‍♀', '🧜‍♂', '🧚‍♀', '🧚‍♂', '👼', '🤰', '🤱', '🙇‍♀', '🙇‍♂', '💁‍♀', '💁‍♂', '🙅‍♀', '🙅‍♂', '🙆‍♀', '🙆‍♂', '🙋‍♀', '🙋‍♂', '🧏‍♀', '🧏‍♂', '🤦‍♀', '🤦‍♂', '🤷‍♀', '🤷‍♂', '🙎‍♀', '🙎‍♂', '🙍‍♀', '🙍‍♂', '💇‍♀', '💇‍♂', '💆‍♀', '💆‍♂', '🧖‍♀', '🧖‍♂', '💅', '🤳', '💃', '🕺', '👯‍♀', '👯‍♂', '🕴️', '👩‍🦽', '👨‍🦽', '👩‍🦼', '👨‍🦼', '🧗‍♀', '🧗‍♂', '🤺', '🏇','💾','📖','🚪'];

const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

let socket = null;
let messagePollingInterval = null;

let status = null;

const fileBtn = document.querySelector('.file-btn');
const fileInput = document.querySelector('.file-input');
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
});
document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
});

// Обработчики для кнопки отправки и ввода сообщения
document.getElementById('send-btn').onclick = sendMessage;

document.getElementById('messageInput').onkeypress = async (e) => {
    if (e.key === 'Enter') {
        await sendMessage();
    }
};

// Добавляем эмодзи в пикер
emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.className = 'emoji';
    span.addEventListener('click', () => {
        messageInput.value += emoji;
    });
    emojiPicker.appendChild(span);
});

// Обработчик для клика по кнопке
emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Обработчики для наведения и снятия наведения
emojiBtn.addEventListener('mouseenter', () => {
    emojiPicker.style.display = 'block';
});

// Обработчик для снятия наведения с панели
emojiBtn.addEventListener('mouseleave', () => {
    setTimeout(() => {
        if (!emojiPicker.matches(':hover')) {
            emojiPicker.style.display = 'none';}},100);});
emojiPicker.addEventListener('mouseleave', () => {emojiPicker.style.display = 'none';});

// Закрытие эмодзи пикера при клике вне его
document.addEventListener('click', (e) => {
    if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.remove('active');
    }
});

// Отправка файлов
fileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message my-message';
        messageElement.innerHTML = `
            <div class="file-preview">
                📎 ${file.name} (${(file.size / 1024).toFixed(2)} KB)
            </div>
        `;
        document.querySelector('.messages').appendChild(messageElement);
    });
    fileInput.value = '';
});

    // Настройки
const buttons = document.querySelectorAll('.set-btn');

    // Добавляем обработчик события 'click' для каждой кнопки
buttons.forEach(button => {
    button.addEventListener('click', async () => {
        const url = button.getAttribute('data-url'); // Получаем URL из атрибута data-url
        if (button.textContent === '🚪 Выйти') {
            if (confirm('Вы уверены, что хотите выйти?')) {
                try {
                    // Вызов функции logout для выполнения выхода
                    await logout();
                } catch (error) {
                    console.error('Ошибка при выполнении выхода:', error);
                }
                alert('Вы вышли');

            }
        }else{
            window.location.href = url;
        }
         // Переходим на указанную страницу
    });
});



async function check(){
    const response = await fetch('/auth/users');
    const users = await response.json();
    users.forEach(user => {
        console.log(user);
            });
}

//check();
document.addEventListener('DOMContentLoaded', fetchUsers);
document.addEventListener('DOMContentLoaded', updateMess);
window.addEventListener('beforeunload', function (event) {
    statusOff(currentUserId);
});
//setInterval(() => checkStatus(),1000);
