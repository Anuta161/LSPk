// auth.js

// Функция для обработки входа
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Здесь должна быть реальная проверка учетных данных
    // Например, запрос к серверу или проверка в localStorage
    
    // Временная заглушка для демонстрации
    if (email && password) {
        // Сохраняем информацию о пользователе
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Перенаправляем на страницу заметок
        window.location.href = 'notes.html';
    } else {
        alert('Пожалуйста, заполните все поля');
    }
}

// Функция для обработки регистрации
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }
    
    // Здесь должна быть реальная логика регистрации
    // Например, сохранение в localStorage или запрос к серверу
    
    // Временная заглушка для демонстрации
    if (name && email && password) {
        // Сохраняем информацию о пользователе
        const userData = {
            name: name,
            email: email,
            password: password // В реальном приложении пароль должен быть хеширован!
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Перенаправляем на страницу заметок
        window.location.href = 'notes.html';
    } else {
        alert('Пожалуйста, заполните все поля');
    }
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Проверка авторизации при загрузке страницы
    if (localStorage.getItem('userLoggedIn') === 'true') {
        // Если пользователь уже авторизован, перенаправляем на страницу заметок
        if (window.location.pathname.endsWith('index.html')) {
            window.location.href = 'notes.html';
        }
        
        // Отображаем email пользователя, если есть соответствующий элемент
        const userEmail = localStorage.getItem('userEmail');
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && userEmail) {
            userNameDisplay.textContent = userEmail;
        }
    }
});