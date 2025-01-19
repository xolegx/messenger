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

const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

const avatarEl = document.getElementById('ava');
const avaPicker = document.getElementById('avaPicker');
const avatarButton = document.getElementById('chose_avatar');

async function takeAvatar(){
    const response = await fetch(`/auth/user/${currentUserId}`);
    const user = await response.json();
    avatarEl.textContent = avatars[user.avatar];
}

takeAvatar(); 

avatarButton.addEventListener('click', (event) => {
    event.stopPropagation();
    avaPicker.style.display = avaPicker.style.display === 'none' || 
    avaPicker.style.display === '' ? 'block' : 'none';
});
document.addEventListener('click', () => {avaPicker.style.display = 'none';});
function setAva(avatar) {
    // Отправка запроса на сервер для обновления аватара
    fetch(`/auth/users/${currentUserId}/avatar?new_avatar=${avatar}`, { // Убедитесь, что вы передаете правильные параметры
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
        // Обновляем отображение аватара на странице
        avatarEl.textContent = avatars[data.avatar]; // Здесь предполагается, что сервер возвращает объект с полем avatar
    })
    .catch(error =>  {
        console.error('Ошибка:', error);
    });
}
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

    // Проверка на заполнение поля
    if (!newName) {
        messageDiv.textContent = 'Пожалуйста, введите новое имя.';
        return;
    }

    try {
        const response = await fetch('/auth/change-name', { // Убедитесь, что путь соответствует вашему API
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_name: newName }), // Отправляем новое имя
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            messageDiv.textContent = `Ошибка: ${errorData.detail}`;
        } else {
            messageDiv.textContent = 'Имя успешно изменено.';
            // Обновите отображаемое имя на странице, если это необходимо
            // Например, если у вас есть элемент, который показывает текущее имя:
            // document.getElementById('currentUserName').textContent = newName;
        }
    } catch (error) {
        console.error('Ошибка смены имени:', error);
        messageDiv.textContent = 'Произошла ошибка при смене имени.';
    }
}

async function changeDepartment() {
    const newDepartment = document.getElementById('newDepartment').value;
    const messageDiv = document.getElementById('departmentChangeMessage');

    // Проверка на заполнение поля
    if (!newDepartment) {
        messageDiv.textContent = 'Пожалуйста, введите новый отдел.';
        return;
    }

    try {
        const response = await fetch('/auth/change-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_department: newDepartment }), // Отправляем новый отдел
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            messageDiv.textContent = `Ошибка: ${errorData.detail}`;
        } else {
            messageDiv.textContent = 'Отдел успешно изменен.';
            // Обновите отображаемый отдел на странице, если это необходимо
            // Например, если у вас есть элемент, который показывает текущий отдел:
            // document.getElementById('currentUserDepartment').textContent = newDepartment;
        }
    } catch (error) {
        console.error('Ошибка смены отдела:', error);
        messageDiv.textContent = 'Произошла ошибка при смене отдела.';
    }
}