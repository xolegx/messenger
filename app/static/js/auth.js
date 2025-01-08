document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');
   
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.querySelector(`.form#${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                window.location.href = '/chat';
            } else {
                const error = await response.json();
                alert(error.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при входе');
        }
    });

    // Register form handling
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const name = document.getElementById('registerName').value;
        const password = document.getElementById('registerPassword').value;
        const password_check = document.getElementById('registerPasswordConfirm').value;

        if (password !== password_check) {
            document.getElementById('registerPasswordConfirmError').style.display = 'block';
            return;
        }

        try {
            const response = await fetch('auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, password, password_check })
            });

            if (response.ok) {
                alert("Регистрация прошла успешно");
            } else {
                const error = await response.json();
                alert(error.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при регистрации');
        }
    });

    // Input validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const error = document.getElementById(`${input.id}Error`);
            if (error) {
                error.style.display = 'none';
            }
        });
    });
});
