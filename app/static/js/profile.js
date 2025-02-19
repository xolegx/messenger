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
                    document.title = "Мой профиль";
                }
            } catch (error) {
                console.error('Ошибка при получении непрочитанных сообщений:', error);
            }
        }
setInterval(checkUnreadMessages, 3000);


function setAva(avatar) {
    fetch(`/auth/users/${currentUserId}/avatar?new_avatar=${avatar}`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при обновлении аватара');
        }
        return response.json();
    })
    .then(data =>  {
        avatarEl.textContent = avatars[data.avatar]; 
    })
    .catch(error =>  {
        console.error('Ошибка:', error);
    });
}

async function takeAvatar(){
    const response = await fetch(`/auth/user/${currentUserId}`);
    const user = await response.json();
    avatarEl.textContent = avatars[user.avatar];
}

async function changePassword() { 
    const oldPassword = document.getElementById('oldPassword').value; 
    const newPassword = document.getElementById('newPassword').value; 
    const confirmNewPassword = document.getElementById('confirmNewPassword').value; 
    const messageDiv = document.getElementById('passwordChangeMessage');

        if (!oldPassword || !newPassword) {
           messageDiv.textContent = 'Пожалуйста, заполните оба поля.';
           return;
        }

         if (newPassword !== confirmNewPassword) {
        messageDiv.textContent = 'Новый пароль и подтверждение пароля не совпадают.';
        return;
    }
        try { const response = await fetch('/auth/change-password', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', }, 
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, 
            }), 
        });

        if (!response.ok) {
           const errorData = await response.json();
           console.log(errorData)
           messageDiv.textContent = `Ошибка: ${errorData.detail || JSON.stringify(errorData)}`;
        } else {
           messageDiv.textContent = 'Пароль успешно изменен.';
        }

} catch (error) { console.error('Ошибка смены пароля:', error); messageDiv.textContent = 'Произошла ошибка при смене пароля.'; }
}

async function changeName() {
    const newName = document.getElementById('newName').value;
    const messageDiv = document.getElementById('nameChangeMessage');

    if (!newName) {
        messageDiv.textContent = 'Пожалуйста, введите новое имя.';
        return;
    }

    try {
        const response = await fetch('/auth/change-name', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_name: newName }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            messageDiv.textContent = `${errorData.detail}`;
        } else {
            messageDiv.textContent = 'Имя успешно изменено!';
  
        }
    } catch (error) {
        console.error('Ошибка смены имени:', error);
        messageDiv.textContent = 'Произошла ошибка при смене имени.';
    }
}

async function changeDepartment() {
    const newDepartment = document.getElementById('newDepartment').value;
    const messageDiv = document.getElementById('departmentChangeMessage');

    if (!newDepartment) {
        messageDiv.textContent = 'Пожалуйста, введите новый отдел.';
        return;
    }

    try {
        const response = await fetch('/auth/change-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_department: newDepartment }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            messageDiv.textContent = `Ошибка: ${errorData.detail}`;
        } else {
            messageDiv.textContent = 'Отдел успешно изменен.';
        }
    } catch (error) {
        console.error('Ошибка смены отдела:', error);
        messageDiv.textContent = 'Произошла ошибка при смене отдела.';
    }
}




const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];
const avatarEl = document.getElementById('ava');
const avaPicker = document.getElementById('avaPicker');
const avatarButton = document.getElementById('chose_avatar');

takeAvatar(); 

avatarButton.addEventListener('click', (event) => {
    event.stopPropagation();
    avaPicker.style.display = avaPicker.style.display === 'none' || 
    avaPicker.style.display === '' ? 'block' : 'none';
});
document.addEventListener('click', () => {avaPicker.style.display = 'none';});

avatars.forEach((ava, index) =>  {
    const button = document.createElement('button');
    button.textContent = ava;
    button.className = 'ava-button';
    button.onclick = () =>  {
        setAva(index); // Вызываем функцию с индексом
    };
    avaPicker.appendChild(button);
});

const profileButtons = document.querySelectorAll('.profile-button');

const buttons = document.querySelectorAll('.set-btn');
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

// Add click handlers for profile buttons
profileButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.textContent === 'Удалить аккаунт') {
            if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
             try {
                const response = fetch(`/auth/user/`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
                        alert('Аккаунт удален');
                        window.location.href = '/'
                    }
        } 
    });
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

document.getElementById('main').addEventListener('click', function() {
    window.location.href = '/chat';
});




