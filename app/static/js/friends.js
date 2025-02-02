
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
                        
                    </div><button class="add-friend-btn">+</button>
                `;
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
                        
                    </div><button class="del-friend-btn">-</button>
                `;
                friendList.appendChild(friendElement);
            }
        });

       
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}


document.addEventListener('DOMContentLoaded', fetchUsers);
document.addEventListener('DOMContentLoaded', fetchFriends);

const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const buttons = document.querySelectorAll('.set-btn');

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

