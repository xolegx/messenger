
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

async function fetchUsers() {
    try {
        const response = await fetch('/auth/users');
        const users = await response.json();
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';// Генерация списка пользователей
        users.forEach(user => {
            if (user.id !== currentUserId) {
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.setAttribute('data-user-id', user.id);
                userElement.setAttribute('status', user.status);

                // Устанавливаем контент с учетом аватара, имени и последнего сообщения
                userElement.innerHTML = `
                    <span style="font-size: 30px;">${avatars[user.avatar] || "👤"}  </span>
                    <div style="margin-left: 10px;"> <div>${user.name}</div>
                        
                    </div><button class="add-friend-btn" data-user-id="${user.id}">+</button>
                `;
                const addButton = userElement.querySelector('.add-friend-btn');
                addButton.addEventListener('click', async () =>  {
                    await addFriend(user.id);
                });
                //userElement.innerHTML += `<span class="mail">💬</span>`;
                userList.appendChild(userElement);
            }
        });

       
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}


async function fetchFriends() {
    try {
        const response = await fetch('/friends');
        const friends = await response.json();
        //console.log(friends)
        const friendList = document.getElementById('friends-list');
        friendList.innerHTML = '';
        friends.forEach(friend => {
            if (friend.id !== currentUserId) {
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.setAttribute('data-friend-id', friend.id);
                friendElement.innerHTML = `
                    <span style="font-size: 30px;">${avatars[friend.avatar] || "👤"}  </span>
                    <div style="margin-left: 10px;"> <div>${friend.name}</div>
                        
                    </div><button class="del-friend-btn" data-friend-id="${friend.id}">-</button>
                `;
                const addButton = friendElement.querySelector('.del-friend-btn');
                addButton.addEventListener('click', async () =>  {
                    await delFriend(friend.id);
                });
                friendList.appendChild(friendElement);
            }
        });

       
    } catch (error) {
        console.error('Ошибка при загрузке списка друзей:', error);
    }
}


async function addFriend(user_id) {
    try {
        const response = await fetch(`/friends/add/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось добавить друга');
        }
        const result = await response.json();
        fetchFriends();
        fetchUsers();
    } catch (error) {
        console.error('Ошибка при добавлении друга:', error);
    }
}


async function delFriend(friends_id) {
    try {
        const response = await fetch(`/friends/remove/${friends_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось удалить друга');
        }
        const result = await response.json();
        fetchFriends();
        fetchUsers();
    } catch (error) {
        console.error('Ошибка при удалении друга:', error);
    }
}


document.addEventListener('DOMContentLoaded', fetchUsers);
document.addEventListener('DOMContentLoaded', fetchFriends);

const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const buttonSet = document.querySelectorAll('.set-btn');

document.getElementById('main').addEventListener('click', function() {
    window.location.href = '/chat';
});

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
});

buttonSet.forEach(button => {
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

// Add friend functionality
const addFriendButtons = document.querySelectorAll('.add-friend-btn');
addFriendButtons.forEach(button => {
    button.addEventListener('click', function() {
        const userName = this.parentElement.querySelector('.user-info span').textContent;
        alert(`Запрос на добавление в друзья отправлен пользователю ${userName}`);
        this.disabled = true;
        this.textContent = '✓';
        this.style.opacity = '0.5';
    });
});
// Search functionality
const searchInput = document.querySelector('.search-input');
const userItems = document.querySelectorAll('.user-item');
async function search() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        userItems.forEach(item => {

            const userName = item.textContent.toLowerCase().trim();
            if (userName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', search);

