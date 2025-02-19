
const groupItems = document.querySelectorAll('.group-item');
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const buttons = document.querySelectorAll('.set-btn');

async function fetchFriends() {
    try {
        const response = await fetch('/friends');
        const friends = await response.json();
        //console.log(friends)
        const friendList = document.getElementById('friend-list');
        friendList.innerHTML = '';
        friends.forEach(friend => {
            if (friend.id !== currentUserId) {
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.setAttribute('data-friend-id', friend.id);
                friendElement.innerHTML = `
                    <span style="font-size: 30px;">${avatars[friend.avatar] || "👤"}  </span>
                    <div style="margin-left: 10px;"> <div>${friend.name}</div>
                        
                    </div><button class="add-to-group-btn">+</button>
                `;
                friendList.appendChild(friendElement);
            }
        });

       
    } catch (error) {
        console.error('Ошибка при загрузке списка пользователей:', error);
    }
}
const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

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
                    document.title = "Мои группы";
                }
            } catch (error) {
                console.error('Ошибка при получении непрочитанных сообщений:', error);
            }
        }
setInterval(checkUnreadMessages, 3000);


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

// Group selection
groupItems.forEach(item => {
    item.addEventListener('click', function() {
        groupItems.forEach(g => g.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Create group functionality
const createGroupBtn = document.querySelector('.create-group-btn');
createGroupBtn.addEventListener('click', () => {
    const groupName = prompt('Введите название группы:');
    if (groupName) {
        alert(`Группа "${groupName}" создана!`);
    }
});

// Add to group functionality
const addToGroupButtons = document.querySelectorAll('.add-to-group-btn');
addToGroupButtons.forEach(button => {
    button.addEventListener('click', function() {
        const selectedGroup = document.querySelector('.group-item.selected');
        if (!selectedGroup) {
            alert('Пожалуйста, выберите группу слева');
            return;
        }
        
        const friendName = this.parentElement.querySelector('.friend-info span').textContent;
        const groupName = selectedGroup.querySelector('span').textContent;
        alert(`Пользователь ${friendName} добавлен в группу "${groupName}"`);
        this.disabled = true;
        this.textContent = '✓';
        this.style.opacity = '0.5';
    });
});
document.addEventListener('DOMContentLoaded', fetchFriends);
