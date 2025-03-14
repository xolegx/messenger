
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
                    document.title = "Мои файлы";
                }
            } catch (error) {
                console.error('Ошибка при получении непрочитанных сообщений:', error);
            }
        }
setInterval(checkUnreadMessages, 3000);


async function filesItem() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        const fileList = document.getElementById('files-container');
        fileList.innerHTML = ''; // Генерация списка файлов
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-item');
            fileElement.setAttribute('file-id', file.id);
            const date = new Date(file.created_at);
            date.setHours(date.getHours() + 5);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            let icon = 0;
            const endFile = (file.filename.split('.')).pop(); // Получение расширения файла
            if (['xlsx', 'csv'].includes(endFile)) {
                icon = 2;
            } else if (['jpg', 'png', 'bmp', 'gif'].includes(endFile)) {
                icon = 1;
            } else if (['pdf', 'djvu', 'doc', 'docx'].includes(endFile)) {
                icon = 3;
            } else if (['avi', 'mp4', 'mkv', 'mov'].includes(endFile)) {
                icon = 4;
            } else if (['mp3', 'aac', 'flac', 'wma'].includes(endFile)) {
                icon = 5;
            } else if (['dxf', 'dwg', 'mksl', 'prt', 'asm'].includes(endFile)) {
                icon = 6;
            }

            fileElement.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">${fileIcon[icon]}</div>
                    <div class="file-details">
                        <div class="file-name">${file.filename}</div>
                        <div class="file-meta">От: ${file.sender} • ${(file.file_size / 1024).toFixed(2)} KB • ${day}.${month}.${year} </div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-button" title="Скачать">⬇️</button>
                    <button class="file-button" title="Удалить">🗑️</button>
                </div>
                
                `
            ;

            fileList.appendChild(fileElement); 
        });
        updateFileItems();
        downloadFile();
        deleteFile();
    } catch (error) {
        console.error('Ошибка при загрузке списка:', error);
    }
}


function updateFileItems() {
    fileItems = document.querySelectorAll('.file-item');
}


function downloadFile() {
    let downloadButtons = document.querySelectorAll('.file-button[title="Скачать"]');
    downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
        const fileId = this.closest('.file-item').getAttribute('file-id');
        window.location.href = `/files/download-file/${fileId}`;
    });
});
}


function deleteFile() {
    let deleteButtons = document.querySelectorAll('.file-button[title="Удалить"]');

    deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        const fileId = this.closest('.file-item').getAttribute('file-id');

        if (confirm("Вы уверены, что хотите удалить этот файл?")) {
            fetch(`/files/delete-file/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при удалении файла');
                }
                window.location.href = '/auth/files';
            })
        }
    });
});
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



const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const buttons = document.querySelectorAll('.set-btn');
const fileIcon = ['📄','🖼️','📊','📜','🎬','🎧','📐'];

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

// Exit
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
let fileItems = document.querySelectorAll('.file-item');
searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        const fileMeta = item.querySelector('.file-meta').textContent.toLowerCase();
        const shouldShow = fileName.includes(searchTerm) || fileMeta.includes(searchTerm);
        item.style.display = shouldShow ? 'flex' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', filesItem);

window.addEventListener('beforeunload', function (event) {
    statusOff(currentUserId);
});
timeoutIdAll = setTimeout(() => {statusOff(currentUserId);}, 180000);

statusOn(currentUserId);
