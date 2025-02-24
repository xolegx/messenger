// Подключение WebSocket
function connectWebSocket() {
    if (socket) socket.close();

    socket = new WebSocket(`ws://${window.location.host}/chat/ws/${selectedUserId}`);

    socket.onopen = () => {
        console.log('WebSocket соединение установлено');
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
    const headerName = userNamesplit.slice(1, 46).join(' ');
    document.getElementById('chat-header').innerHTML = `<span>${headerName}</span>`;
    document.getElementById('messageInput').disabled = false;
    document.getElementById('file-btn').disabled = false;
    document.getElementById('send-btn').disabled = false;
    readMessages(userId);
    const notification = document.getElementById(`notification-${userId}`);
    if (notification) {
        notification.style.display = "none";
    }

    const messagesContainer = document.querySelector('.messages');
    messagesContainer.style.backgroundImage = "url('/static/img/chatwall2.png')";
    clearTimeout(timeoutIdSelect);
    clearTimeout(timeoutIdAll);
    timeoutIdSelect = setTimeout(() => {statusOff(currentUserId);}, 120000);
    if (!event.target.classList.contains('active')) {
        document.querySelectorAll('.friend').forEach(item => item.classList.remove('active'));
        event.target.classList.add('active');
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        messagesContainer.style.display = 'block';

        await loadMessages(userId);
        connectWebSocket();
        startMessagePolling(userId);
        readMessages(userId);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    statusOn(currentUserId);
}

// Обработка нажатий на пользователя
function addUserClickListeners() {
    document.querySelectorAll('.friend').forEach(item => {
        const userId = item.getAttribute('data-user-id');
        item.onclick = event => selectUser(userId, item.textContent, event);
    });
}

// Отрисовка пользователей
async function fetchUsers() {
    try {
        const response = await fetch('/friends');
        const users = await response.json();
        const userList = document.getElementById('friends-list');
        statusOn(currentUserId);
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
        for (const user of users) {
            if (user.id !== currentUserId) {
                const userElement = document.createElement('div');
                userElement.classList.add('friend');
                userElement.setAttribute('data-user-id', user.id);
                userElement.setAttribute('status', user.online_status);
                const lastMessageResponse = await fetch(`/chat/messages/last_message/${user.id}`);
                const lastMessageData = await lastMessageResponse.json();
                const lastMessage = lastMessageData || "Нет сообщений";

                // Устанавливаем контент с учетом аватара, имени и последнего сообщения
                userElement.innerHTML = `
                    <span style="font-size: 30px;">${avatars[user.avatar]}</span>
                    <div>
                        ${user.name}
                        <small class="lastMessage" style="color: #8e8e8e;">${lastMessage}</small>
                    </div>
                    <div class="online-status ${user.online_status ? 'online' : 'offline'}"></div>
                    <div class="mail" id='notification-${user.id}' style="display: none;">💬<span class="notification-badge" id="unread-count-${user.id}"></span></div>
                `;
                userList.appendChild(userElement);
            }

        };

        // Повторно добавляем обработчики событий для каждого пользователя
        addUserClickListeners();
        
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}




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
        
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
    }
}

async function checkStatus() {
    try {
        const response = await fetch('/auth/users/check_status/');
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const usersStat = await response.json();     
        usersStat.users.forEach(user =>  {
            if (user.id !== currentUserId) {
                const userElement = document.querySelector(`.friend[data-user-id="${user.id}"]`);
                if (userElement) {
                    const statusElement = userElement.querySelector('.online-status');

                    // Устанавливаем класс в зависимости от статуса
                    if (user.online_status) {
                        statusElement.classList.add('online');
                        statusElement.classList.remove('offline');
                    } else {
                        statusElement.classList.add('offline');
                        statusElement.classList.remove('online');
                    }
                }
            }
        });   
        
    } catch (error) {
        console.error('Ошибка загрузки статусов:', error);
    }
}

async function checkUnreadCountMessages() {
    const response = await fetch('/chat/messages/unread_counts/');
    const data = await response.json();
    const unreadCounts = data.unread_counts;
    for (const userId in unreadCounts) {
        const unreadCount = unreadCounts[userId];

        const notification = document.getElementById(`notification-${userId}`);
        const unreadCountEl = document.getElementById(`unread-count-${userId}`);
        const userElement = document.querySelector(`.friend[data-user-id="${userId}"]`);

        if (userElement && userElement.classList.contains('active')) {
            readMessages(userId);

            if (notification) {
                notification.style.display = "none";
                
            }
        } else {
            if (unreadCount > 0) {
                if (notification) {
                    notification.style.display = "block";
                    unreadCountEl.textContent = unreadCount;
                }
            } else {
                if (notification) {
                    notification.style.display = "none";
                }
            }
        }
    }
}

async function checkUnreadMessages() {
            try {
                const response = await fetch('/chat/messages/unread_counts/');
                const data = await response.json();

                const unreadCounts = data.unread_counts;
                const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
                
                // Изменяем заголовок страницы в зависимости от количества непрочитанных сообщений
                if (totalUnread > 0) {
                    document.title = `(${totalUnread}) Новые сообщения`;
                } else {
                    document.title = "CosmoChat";
                }
            } catch (error) {
                console.error('Ошибка при получении непрочитанных сообщений:', error);
            }
        }

async function readMessages(userId) {
    try {
        const response = await fetch(`/chat/messages/read/${userId}`, { // Убедитесь, что вы передаете правильные параметры
        method: 'PUT',
        headers: {'Content-Type': 'application/json',}
        });
        if (response.ok) {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
            console.error('Ошибка');
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}


async function loadMessages(userId) {
    try {
        const response = await fetch(`/chat/messages/${userId}`);
        const messages = await response.json();
        const messagesContainer = document.getElementById('messages');
        
        let lastDate = null; // Для отслеживания последней даты
        const today = new Date();
        messagesContainer.innerHTML = messages.map((message) => {
            const currentDate = new Date(message.created_at); // Получаем только дату
            formated_currentDate = formatDate(currentDate); // Форматируем дату в DD.MM.YYYY
            formated_today = formatDate(today);

            let dateDivider = '';

            // Если дата текущего сообщения отличается от предыдущей, добавляем разделитель
            if (lastDate !== formated_currentDate) {
                lastDate = formated_currentDate;
                if (formated_currentDate === formated_today) {
                    dateDivider = `<div class="date-divider">Сегодня</div>`;
                } else {
                    dateDivider = `<div class="date-divider">${formated_currentDate}</div>`;
                }
            }

            return `${dateDivider}${createMessageElement(
                message.content,
                message.recipient_id,
                message.created_at,
                message.is_file,
                message.is_read
            )}`;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}


function createMessageElement(text, recipient_id, createdAt, is_file, is_read) {
    const date = new Date(createdAt);
    date.setHours(date.getHours() + 5); // Добавляем смещение времени
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');    const messageClass = currentUserId === recipient_id ? 'other-message' : 'my-message';

    // Если сообщение является файлом, добавляем ссылку
    let content;
    if (is_file) {
        content = `<a href="" class="file-link">⬇️${text}</a>`;
    } else {
        content = text; // Экранируем текст, чтобы избежать XSS
    }

    // Статус прочтения для сообщений, отправленных текущим пользователем
    let readStatus = '';
    if (messageClass === 'my-message') {
        readStatus = `
                ${is_read ? '<div class="readed-green">VI</div>' : '<div class="readed-gray">V</div>'}
        `;
    }

    // Создаем HTML-разметку сообщения
    const message = `
        <div class="message ${messageClass}" data-is-file="${is_file}">
            <div class="message-content">${content}</div>
            <div class="createdAt">${hours}:${minutes}</div>
            ${readStatus}
        </div>
    `;
    return message;
}
    

// Отправка сообщения
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    clearTimeout(timeoutIdSelect);
    timeoutIdSelect = setTimeout(() => {statusOff(currentUserId);}, 120000);
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
            fetchUsers();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    }
}


async function uploadFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        alert(`Размер файла должен быть не более ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
        return;
        }
    const formData = new FormData();

    const payload = {recipient_id: selectedUserId, content: `Файл: ${file.name}`, is_file: true};
    try {
        const messageResponse = await fetch('/chat/messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
         if (!messageResponse.ok) {
            const errorText = await messageResponse.text();
            throw new Error(`Ошибка при отправке сообщения: ${errorText}`);
        }
        const messageData = await messageResponse.json();
        formData.append('file', file);
        formData.append('message_id', messageData.id);
        formData.append('recipient_id', selectedUserId);
        const response = await fetch('/files/upload-file/', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при загрузке файла: ${errorText}`);
        }
        addMessage(`Файл: ${file.name}`, selectedUserId, 1);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Добавление сообщения в чат

function addMessage(text, recipient_id, isFile = false) {
    const today = new Date();
    today.setHours(today.getHours() - 5);
    const messagesContainer = document.getElementById('messages');
    const messageContent = isFile ? `<a href="${text}" target="_blank">⬇️${text}</a>` : text;
    messagesContainer.insertAdjacentHTML('beforeend', createMessageElement(messageContent, recipient_id, today, 0));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
    
function startMessagePolling(userId) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = setInterval(() => loadMessages(userId), 1000);
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




const MAX_FILE_SIZE = 100 * 1024 * 1024;
let timeoutIdSelect;
let timeoutIdAll;
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

let status = true;

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

// Главная
document.getElementById('main').addEventListener('click', function() {
    window.location.href = '/chat';
});

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

setInterval(checkUnreadMessages, 3000);

// Отправка файлов
const fileBtn = document.querySelector('.file-btn');
const fileInput = document.querySelector('.file-input');
fileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
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
window.addEventListener('beforeunload', function (event) {
    statusOff(currentUserId);
});
timeoutIdAll = setTimeout(() => {statusOff(currentUserId);}, 120000);
setInterval(() => checkStatus(),5000);
setInterval(() => checkUnreadCountMessages(),1000);


