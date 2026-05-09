// ===== Local Storage Keys =====
const STORAGE_KEYS = {
    THEME: 'dashboard-theme',
    NAME: 'dashboard-name',
    TODOS: 'dashboard-todos',
    LINKS: 'dashboard-links'
};

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', toggleTheme);

// ===== Clock and Date =====
const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('id-ID', options);
}

setInterval(updateClock, 1000);
updateClock();
updateDate();

// ===== Greeting =====
const greetingElement = document.getElementById('greeting');
const nameInput = document.getElementById('nameInput');
const nameDisplay = document.getElementById('nameDisplay');
const editNameBtn = document.getElementById('editName');

function updateGreeting() {
    const hour = new Date().getHours();
    let greetingText = '';

    if (hour >= 5 && hour < 12) {
        greetingText = 'Selamat Pagi';
    } else if (hour >= 12 && hour < 15) {
        greetingText = 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
        greetingText = 'Selamat Sore';
    } else {
        greetingText = 'Selamat Malam';
    }

    const savedName = localStorage.getItem(STORAGE_KEYS.NAME);
    if (savedName) {
        greetingElement.textContent = `${greetingText}, ${savedName}!`;
        nameDisplay.textContent = savedName;
        nameInput.classList.add('hidden');
        nameDisplay.classList.remove('hidden');
        editNameBtn.classList.remove('hidden');
    } else {
        greetingElement.textContent = greetingText;
    }
}

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && nameInput.value.trim()) {
        const name = nameInput.value.trim();
        localStorage.setItem(STORAGE_KEYS.NAME, name);
        updateGreeting();
    }
});

editNameBtn.addEventListener('click', () => {
    nameInput.classList.remove('hidden');
    nameDisplay.classList.add('hidden');
    editNameBtn.classList.add('hidden');
    nameInput.value = '';
    nameInput.focus();
});

updateGreeting();
setInterval(updateGreeting, 60000); // Update setiap menit

// ===== Focus Timer =====
const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimer');
const stopTimerBtn = document.getElementById('stopTimer');
const resetTimerBtn = document.getElementById('resetTimer');

let timerInterval = null;
let timeLeft = 25 * 60; // 25 menit dalam detik

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) return; // Jangan start jika sudah berjalan
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            stopTimer();
            alert('⏰ Waktu fokus selesai! Saatnya istirahat.');
            resetTimer();
        }
    }, 1000);
    
    startTimerBtn.disabled = true;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startTimerBtn.disabled = false;
}

function resetTimer() {
    stopTimer();
    timeLeft = 25 * 60;
    updateTimerDisplay();
}

startTimerBtn.addEventListener('click', startTimer);
stopTimerBtn.addEventListener('click', stopTimer);
resetTimerBtn.addEventListener('click', resetTimer);

updateTimerDisplay();

// ===== To-Do List =====
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');

let todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS)) || [];

function saveTodos() {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text" contenteditable="false">${todo.text}</span>
            <div class="todo-actions">
                <button class="todo-btn edit-btn">✏️</button>
                <button class="todo-btn delete-btn">🗑️</button>
            </div>
        `;
        
        // Checkbox toggle
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            todos[index].completed = checkbox.checked;
            saveTodos();
            renderTodos();
        });
        
        // Edit todo
        const editBtn = li.querySelector('.edit-btn');
        const todoText = li.querySelector('.todo-text');
        editBtn.addEventListener('click', () => {
            if (todoText.contentEditable === 'false') {
                todoText.contentEditable = 'true';
                todoText.classList.add('editing');
                todoText.focus();
                editBtn.textContent = '✅';
            } else {
                const newText = todoText.textContent.trim();
                if (newText && !isDuplicateTodo(newText, index)) {
                    todos[index].text = newText;
                    saveTodos();
                }
                todoText.contentEditable = 'false';
                todoText.classList.remove('editing');
                editBtn.textContent = '✏️';
                renderTodos();
            }
        });
        
        // Delete todo
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Hapus tugas ini?')) {
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            }
        });
        
        todoList.appendChild(li);
    });
}

function isDuplicateTodo(text, excludeIndex = -1) {
    return todos.some((todo, index) => 
        index !== excludeIndex && todo.text.toLowerCase() === text.toLowerCase()
    );
}

function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Tugas tidak boleh kosong!');
        return;
    }
    
    if (isDuplicateTodo(text)) {
        alert('Tugas ini sudah ada dalam daftar!');
        return;
    }
    
    todos.push({
        text: text,
        completed: false
    });
    
    saveTodos();
    renderTodos();
    todoInput.value = '';
}

addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

renderTodos();

// ===== Quick Links =====
const linkNameInput = document.getElementById('linkName');
const linkUrlInput = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLink');
const linksList = document.getElementById('linksList');

let links = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS)) || [];

function saveLinks() {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
}

function renderLinks() {
    linksList.innerHTML = '';
    
    links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        
        div.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
            <button class="link-delete">×</button>
        `;
        
        const deleteBtn = div.querySelector('.link-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Hapus link "${link.name}"?`)) {
                links.splice(index, 1);
                saveLinks();
                renderLinks();
            }
        });
        
        linksList.appendChild(div);
    });
}

function addLink() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (!name || !url) {
        alert('Nama dan URL harus diisi!');
        return;
    }
    
    // Validasi URL sederhana
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL harus dimulai dengan http:// atau https://');
        return;
    }
    
    links.push({ name, url });
    saveLinks();
    renderLinks();
    
    linkNameInput.value = '';
    linkUrlInput.value = '';
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addLink();
    }
});

renderLinks();

// ===== Initialize App =====
initTheme();

console.log('🚀 Life Dashboard loaded successfully!');
