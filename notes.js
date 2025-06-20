// Логика работы с заметками
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (!localStorage.getItem('authToken') {
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализируем страницу
    initNotesPage();
    
    // Загружаем заметки
    loadNotes();
});

function initNotesPage() {
    // Кнопка новой заметки
    const addNoteBtn = document.getElementById('addNoteBtn') || document.getElementById('newNoteBtn');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', function() {
            window.location.href = 'edit-note.html';
        });
    }
    
    // Фильтры
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Поиск
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
    
    // Экспорт всех заметок
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllNotes);
    }
}

function loadNotes() {
    // В реальном приложении здесь был бы запрос к серверу
    // Для демо используем localStorage
    
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Фильтруем по пользователю (в реальном приложении это делал бы сервер)
    const userEmail = localStorage.getItem('userEmail');
    notes = notes.filter(note => note.userEmail === userEmail);
    
    displayNotes(notes);
}

function displayNotes(notes) {
    const notesContainer = document.getElementById('notesContainer');
    const noNotesAlert = document.getElementById('noNotesAlert');
    
    if (!notesContainer) return;
    
    // Очищаем контейнер
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        if (noNotesAlert) noNotesAlert.style.display = 'block';
        return;
    }
    
    if (noNotesAlert) noNotesAlert.style.display = 'none';
    
    // Создаем карточки заметок
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesContainer.appendChild(noteCard);
    });
}

function createNoteCard(note) {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';
    
    const card = document.createElement('div');
    card.className = 'card note-card h-100';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = note.title || 'Без названия';
    
    const content = document.createElement('div');
    content.className = 'card-text flex-grow-1';
    content.innerHTML = note.content 
        ? marked.parse(note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''))
        : '<p class="text-muted">Нет содержимого</p>';
    
    const meta = document.createElement('div');
    meta.className = 'note-meta mt-2';
    
    const category = document.createElement('span');
    category.className = 'd-block mb-1';
    category.innerHTML = `<i class="bi bi-folder-fill me-1"></i> ${note.category || 'Без категории'}`;
    
    const date = document.createElement('span');
    date.className = 'd-block mb-2';
    date.innerHTML = `<i class="bi bi-calendar-event me-1"></i> ${formatDate(note.updatedAt || new Date())}`;
    
    const tags = document.createElement('div');
    tags.className = 'mb-2';
    
    if (note.tags && note.tags.length > 0) {
        note.tags.split(',').forEach(tag => {
            const trimmedTag = tag.trim();
            if (trimmedTag) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-1';
                badge.textContent = trimmedTag;
                tags.appendChild(badge);
            }
        });
    }
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex justify-content-between mt-auto';
    
    const editBtn = document.createElement('a');
    editBtn.className = 'btn btn-sm btn-outline-primary';
    editBtn.innerHTML = '<i class="bi bi-pencil-fill me-1"></i> Редактировать';
    editBtn.href = `edit-note.html?id=${note.id}`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash-fill me-1"></i>';
    deleteBtn.dataset.noteId = note.id;
    deleteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmDeleteNote(note.id);
    });
    
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    
    meta.appendChild(category);
    meta.appendChild(date);
    if (tags.children.length > 0) meta.appendChild(tags);
    
    cardBody.appendChild(title);
    cardBody.appendChild(content);
    cardBody.appendChild(meta);
    cardBody.appendChild(btnGroup);
    
    card.appendChild(cardBody);
    col.appendChild(card);
    
    return col;
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const tags = document.getElementById('tagsFilter').value;
    const date = document.getElementById('dateFilter').value;
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    const userEmail = localStorage.getItem('userEmail');
    notes = notes.filter(note => note.userEmail === userEmail);
    
    if (category !== 'all') {
        notes = notes.filter(note => note.category === category);
    }
    
    if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        notes = notes.filter(note => {
            if (!note.tags) return false;
            const noteTags = note.tags.split(',').map(tag => tag.trim().toLowerCase());
            return tagsArray.some(tag => noteTags.includes(tag));
        });
    }
    
    if (date) {
        const filterDate = new Date(date);
        notes = notes.filter(note => {
            const noteDate = new Date(note.updatedAt || note.createdAt);
            return noteDate.toDateString() === filterDate.toDateString();
        });
    }
    
    if (searchText) {
        notes = notes.filter(note => {
            const titleMatch = note.title?.toLowerCase().includes(searchText) || false;
            const contentMatch = note.content?.toLowerCase().includes(searchText) || false;
            return titleMatch || contentMatch;
        });
    }
    
    displayNotes(notes);
}

function resetFilters() {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('tagsFilter').value = '';
    document.getElementById('dateFilter').value = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    loadNotes();
}

function confirmDeleteNote(noteId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Удаляем предыдущие обработчики
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', function() {
        deleteNote(noteId);
        modal.hide();
    });
    
    modal.show();
}

function deleteNote(noteId) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== noteId);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    loadNotes();
}

function exportAllNotes() {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    const userEmail = localStorage.getItem('userEmail');
    notes = notes.filter(note => note.userEmail === userEmail);
    
    if (notes.length === 0) {
        alert('Нет заметок для экспорта');
        return;
    }
    
    // Формируем содержимое для экспорта
    let exportContent = `# Экспорт всех заметок\n\n`;
    exportContent += `Пользователь: ${localStorage.getItem('userName') || 'Неизвестный'}\n`;
    exportContent += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
    exportContent += `Количество заметок: ${notes.length}\n\n`;
    
    notes.forEach((note, index) => {
        exportContent += `## ${note.title || 'Без названия'} (${index + 1}/${notes.length})\n\n`;
        exportContent += `**Категория:** ${note.category || 'Не указана'}\n`;
        exportContent += `**Теги:** ${note.tags || 'Нет тегов'}\n`;
        exportContent += `**Дата создания:** ${formatDate(note.createdAt || new Date())}\n`;
        exportContent += `**Последнее изменение:** ${formatDate(note.updatedAt || note.createdAt || new Date())}\n\n`;
        exportContent += `${note.content || 'Нет содержимого'}\n\n`;
        exportContent += '---\n\n';
    });
    
    // Создаем файл и скачиваем
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Заметки_ЛСПК_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Редактирование заметки
function initNoteEditor() {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    
    let note = null;
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    if (noteId) {
        note = notes.find(n => n.id === noteId);
        if (note) {
            document.getElementById('editPageTitle').textContent = 'Редактирование заметки';
            document.getElementById('deleteNoteBtn').style.display = 'block';
            
            // Заполняем поля
            document.getElementById('noteTitle').value = note.title || '';
            document.getElementById('noteCategory').value = note.category || 'Учеба';
            document.getElementById('noteTags').value = note.tags || '';
            
            // Инициализируем редактор
            const easyMDE = new EasyMDE({
                element: document.getElementById('noteContent'),
                spellChecker: false,
                placeholder: 'Начните писать свою заметку здесь...',
                toolbar: [
                    'bold', 'italic', 'heading', '|',
                    'quote', 'unordered-list', 'ordered-list', '|',
                    'link', 'image', '|',
                    'preview', 'side-by-side', 'fullscreen', '|',
                    'guide'
                ],
                initialValue: note.content || ''
            });
            
            // Кнопка предпросмотра
            const previewToggle = document.getElementById('previewToggle');
            if (previewToggle) {
                previewToggle.addEventListener('click', function() {
                    const previewContainer = document.getElementById('previewContainer');
                    const editorContainer = document.getElementById('editorContainer');
                    
                    if (previewContainer.style.display === 'none') {
                        // Показываем предпросмотр
                        document.getElementById('notePreview').innerHTML = marked.parse(easyMDE.value());
                        previewContainer.style.display = 'block';
                        editorContainer.style.display = 'none';
                        previewToggle.innerHTML = '<i class="bi bi-pencil-fill me-1"></i> Редактировать';
                    } else {
                        // Показываем редактор
                        previewContainer.style.display = 'none';
                        editorContainer.style.display = 'block';
                        previewToggle.innerHTML = '<i class="bi bi-eye-fill me-1"></i> Предпросмотр';
                    }
                });
            }
            
            // Кнопка удаления
            document.getElementById('deleteNoteBtn').addEventListener('click', function() {
                confirmDeleteNote(note.id);
            });
            
            // Кнопка экспорта
            document.getElementById('exportNoteBtn').addEventListener('click', function() {
                showExportModal(note);
            });
            
            // Кнопки сохранения
            const saveNote = function() {
                note.title = document.getElementById('noteTitle').value;
                note.category = document.getElementById('noteCategory').value;
                note.tags = document.getElementById('noteTags').value;
                note.content = easyMDE.value();
                note.updatedAt = new Date().toISOString();
                
                // Обновляем в массиве
                const index = notes.findIndex(n => n.id === note.id);
                if (index !== -1) {
                    notes[index] = note;
                } else {
                    notes.push(note);
                }
                
                localStorage.setItem('notes', JSON.stringify(notes));
                
                // Перенаправляем на страницу заметок
                window.location.href = 'notes.html';
            };
            
            document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
            document.getElementById('saveNoteBtnBottom').addEventListener('click', saveNote);
        }
    } else {
        // Новая заметка
        const easyMDE = new EasyMDE({
            element: document.getElementById('noteContent'),
            spellChecker: false,
            placeholder: 'Начните писать свою заметку здесь...',
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ]
        });
        
        // Кнопка предпросмотра
        const previewToggle = document.getElementById('previewToggle');
        if (previewToggle) {
            previewToggle.addEventListener('click', function() {
                const previewContainer = document.getElementById('previewContainer');
                const editorContainer = document.getElementById('editorContainer');
                
                if (previewContainer.style.display === 'none') {
                    // Показываем предпросмотр
                    document.getElementById('notePreview').innerHTML = marked.parse(easyMDE.value());
                    previewContainer.style.display = 'block';
                    editorContainer.style.display = 'none';
                    previewToggle.innerHTML = '<i class="bi bi-pencil-fill me-1"></i> Редактировать';
                } else {
                    // Показываем редактор
                    previewContainer.style.display = 'none';
                    editorContainer.style.display = 'block';
                    previewToggle.innerHTML = '<i class="bi bi-eye-fill me-1"></i> Предпросмотр';
                }
            });
        }
        
        // Кнопки сохранения
        const saveNewNote = function() {
            const newNote = {
                id: generateId(),
                userEmail: localStorage.getItem('userEmail'),
                title: document.getElementById('noteTitle').value || 'Без названия',
                category: document.getElementById('noteCategory').value,
                tags: document.getElementById('noteTags').value,
                content: easyMDE.value(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            notes.push(newNote);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            // Перенаправляем на страницу заметок
            window.location.href = 'notes.html';
        };
        
        document.getElementById('saveNoteBtn').addEventListener('click', saveNewNote);
        document.getElementById('saveNoteBtnBottom').addEventListener('click', saveNewNote);
        
        // Кнопка экспорта
        document.getElementById('exportNoteBtn').addEventListener('click', function() {
            const note = {
                title: document.getElementById('noteTitle').value,
                category: document.getElementById('noteCategory').value,
                tags: document.getElementById('noteTags').value,
                content: easyMDE.value()
            };
            showExportModal(note);
        });
    }
}

function generateId() {
    return 'note-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showExportModal(note) {
    const modal = new bootstrap.Modal(document.getElementById('exportModal'));
    
    // Удаляем предыдущие обработчики
    const confirmBtn = document.getElementById('confirmExportBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', function() {
        const format = document.getElementById('exportFormat').value;
        const includeMetadata = document.getElementById('includeMetadata').checked;
        
        exportNote(note, format, includeMetadata);
        modal.hide();
    });
    
    modal.show();
}

function exportNote(note, format, includeMetadata) {
    let exportContent = '';
    let fileName = 'note';
    
    if (includeMetadata) {
        if (format === 'markdown') {
            exportContent += `# ${note.title || 'Без названия'}\n\n`;
            exportContent += `**Категория:** ${note.category || 'Не указана'}\n`;
            exportContent += `**Теги:** ${note.tags || 'Нет тегов'}\n\n`;
            exportContent += `${note.content || 'Нет содержимого'}\n`;
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        } else if (format === 'plaintext') {
            exportContent += `Заголовок: ${note.title || 'Без названия'}\n`;
            exportContent += `Категория: ${note.category || 'Не указана'}\n`;
            exportContent += `Теги: ${note.tags || 'Нет тегов'}\n\n`;
            exportContent += `${note.content || 'Нет содержимого'}\n`;
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        } else if (format === 'html') {
            exportContent += `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>${note.title || 'Без названия'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .meta { color: #7f8c8d; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${note.title || 'Без названия'}</h1>
    <div class="meta">
        <p><strong>Категория:</strong> ${note.category || 'Не указана'}</p>
        <p><strong>Теги:</strong> ${note.tags || 'Нет тегов'}</p>
    </div>
    <div class="content">
        ${note.content ? marked.parse(note.content) : '<p>Нет содержимого</p>'}
    </div>
</body>
</html>`;
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        }
    } else {
        if (format === 'markdown') {
            exportContent = note.content || 'Нет содержимого';
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        } else if (format === 'plaintext') {
            exportContent = note.content || 'Нет содержимого';
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        } else if (format === 'html') {
            exportContent = note.content ? marked.parse(note.content) : '<p>Нет содержимого</p>';
            fileName = note.title ? note.title.replace(/[^a-zа-яё0-9]/gi, '_') : 'note';
        }
    }
    
    // Определяем MIME-тип и расширение файла
    let mimeType, extension;
    if (format === 'markdown') {
        mimeType = 'text/markdown';
        extension = 'md';
    } else if (format === 'plaintext') {
        mimeType = 'text/plain';
        extension = 'txt';
    } else if (format === 'html') {
        mimeType = 'text/html';
        extension = 'html';
    }
    
    // Создаем файл и скачиваем
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}