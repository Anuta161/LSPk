// Вспомогательные UI функции
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация темы
    initTheme();
    
    // Инициализация редактора заметок (если на странице редактирования)
    if (document.getElementById('noteContent')) {
        initNoteEditor();
    }
});

function initTheme() {
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Обновляем все переключатели темы на странице
    const themeToggles = document.querySelectorAll('[id^="themeToggle"]');
    themeToggles.forEach(toggle => {
        updateThemeButton(toggle, savedTheme);
        
        toggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Обновляем все переключатели на странице
            document.querySelectorAll('[id^="themeToggle"]').forEach(btn => {
                updateThemeButton(btn, newTheme);
            });
        });
    });
}

function updateThemeButton(button, theme) {
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    
    if (button.textContent.includes('Темная') || button.textContent.includes('Светлая')) {
        button.textContent = theme === 'dark' ? ' Светлая тема' : ' Темная тема';
        if (icon) button.prepend(icon);
    }
}