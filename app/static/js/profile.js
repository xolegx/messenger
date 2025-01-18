const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

// Функция выбора аватара

const avatars = ['👩','👨','🧑','👧','👦','🧒','👶','👵','👴','🧓','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦲','👨‍🦲','👩‍🦳','👨‍🦳','👱‍♀️','👱‍♂️','👸','🤴','👳‍♀️','👳‍♂️','👲','🧔','👼','🤶','🎅','👩🏻','👨🏻','🧑🏻','👧🏻','👦🏻','🧒🏻','👶🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👸🏻','🤴🏻','👳🏻‍♀️','👳🏻‍♂️','👲🏻','🧔🏻','👼🏻','🤶🏻','🎅🏻','👩🏿','👨🏿','🧑🏿','👧🏿','👦🏿','🧒🏿','👶🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👸🏿','🤴🏿','👳🏿‍♀️','👳🏿‍♂️','👲🏿','🧔🏿','👼🏿','🤶🏿','🎅🏿','👤'];

const avatarEl = document.getElementById('ava');
const avaPicker = document.getElementById('avaPicker');
const avatarButton = document.getElementById('chose_avatar');

async function takeAvatar(){
    const response = await fetch(`/auth/sprofile/${currentUserId}`);
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
    console.log(avatar)
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
        console.log('Индекс выбранного аватара:', index); // Выводим индекс
        setAva(index); // Вызываем функцию с индексом
    };
    avaPicker.appendChild(button);
});



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

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
});
document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
});

// Add click handlers for profile buttons
const profileButtons = document.querySelectorAll('.profile-button');
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

const buttons = document.querySelectorAll('.set-btn');

document.getElementById('main').addEventListener('click', function() {
    window.location.href = '/chat';
});

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
