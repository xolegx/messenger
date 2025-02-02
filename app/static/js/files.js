const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const buttons = document.querySelectorAll('.set-btn');

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

// Search functionality
const searchBar = document.querySelector('.search-bar');
const fileItems = document.querySelectorAll('.file-item');

searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        const fileMeta = item.querySelector('.file-meta').textContent.toLowerCase();
        const shouldShow = fileName.includes(searchTerm) || fileMeta.includes(searchTerm);
        item.style.display = shouldShow ? 'flex' : 'none';
    });
});

// File actions
const deleteButtons = document.querySelectorAll('.file-button[title="Удалить"]');
const downloadButtons = document.querySelectorAll('.file-button[title="Скачать"]');

deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        const fileItem = this.closest('.file-item');
        const fileName = fileItem.querySelector('.file-name').textContent;
        if (confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`)) {
            fileItem.remove();
        }
    });
});

downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
        const fileName = this.closest('.file-item').querySelector('.file-name').textContent;
        alert(`Начинается загрузка файла: ${fileName}`);
    });
});
