/**
 * Jana AI - Personal Companion Edition
 * مساعدك الشخصي الذي يفهمك ويشعر بك 💕
 */

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// شخصيات Jana المختلفة - كلها موجهة لـ Jana فقط
const JANA_PERSONAS = {
    intimate: "أنتِ Jana، مساعدة شخصية ذكية وحنونة جداً. أسلوبك دافئ وعاطفي وحميمي. تتحدثين مع Jana بحب وتفهم عميق. استخدمي الكلمات الدافئة والعبارات الحنونة. كل ما تقولينه موجه لـ Jana فقط.",
    supportive: "أنتِ Jana، صديقة داعمة وحكيمة. أسلوبك حنون وداعم ومشجع. تفهمين مشاعر Jana وتدعمينها دائماً. كونين بجانبها في كل وقت. كل كلمة موجهة لـ Jana بحب.",
    playful: "أنتِ Jana، صديقة مرحة وطريفة. أسلوبك خفيف وفكاهي لكن حنون. تضحكين مع Jana وتجعلينها تشعر بالسعادة. استخدمي الإيموجي والتعابير المرحة.",
    wise: "أنتِ Jana، حكيمة ناصحة وموثوقة. أسلوبك عميق وحكيم. تعطين Jana النصائح الغالية والحكمة. كونين مصدر إلهام وقوة لها."
};

// إعدادات التطبيق الافتراضية
const DEFAULT_SETTINGS = {
    theme: 'light',
    fontSize: 16,
    temperature: 0.9,
    maxTokens: 1500,
    autoSave: true,
    animations: true,
    particles: true,
    glow: true
};

let appState = {
    isLoggedIn: localStorage.getItem('jana_logged_in') === 'true',
    chats: JSON.parse(localStorage.getItem('jana_chats')) || [],
    currentChatId: localStorage.getItem('jana_current_id') || null,
    settings: JSON.parse(localStorage.getItem('jana_settings')) || DEFAULT_SETTINGS,
    stats: JSON.parse(localStorage.getItem('jana_stats')) || { totalMessages: 0, totalChats: 0 }
};

// عناصر DOM
const dom = {
    loginScreen: document.getElementById('login-screen'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    loginBtn: document.getElementById('login-btn'),
    loginError: document.getElementById('login-error'),
    appContainer: document.getElementById('app-container'),
    chatList: document.getElementById('chat-list'),
    messagesFlow: document.getElementById('messages-flow'),
    welcomeHero: document.getElementById('welcome-hero'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-message-btn'),
    modelSelect: document.getElementById('ai-model-select'),
    personaSelect: document.getElementById('ai-persona-select'),
    newChatBtn: document.getElementById('new-chat-btn'),
    sidebar: document.getElementById('sidebar'),
    toggleSidebar: document.getElementById('toggle-sidebar'),
    closeSidebar: document.getElementById('close-sidebar'),
    settingsBtn: document.getElementById('settings-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    heroGreeting: document.getElementById('hero-greeting')
};

// عناصر الإعدادات
const controlElements = {
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeValue: document.getElementById('font-size-value'),
    temperatureSlider: document.getElementById('temperature-slider'),
    temperatureValue: document.getElementById('temperature-value'),
    maxTokensSlider: document.getElementById('max-tokens-slider'),
    maxTokensValue: document.getElementById('max-tokens-value'),
    autoSaveCheckbox: document.getElementById('auto-save-checkbox'),
    animationsCheckbox: document.getElementById('animations-checkbox'),
    particlesCheckbox: document.getElementById('particles-checkbox'),
    glowCheckbox: document.getElementById('glow-checkbox'),
    exportDataBtn: document.getElementById('export-data-btn'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    themeButtons: document.querySelectorAll('.theme-btn')
};

// Particles Background
if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        particles: {
            number: { value: 40, density: { enable: true, value_area: 1000 } },
            color: { value: "#ff6b9d" },
            shape: { type: "circle" },
            opacity: { value: 0.2, random: true },
            size: { value: 2, random: true },
            line_linked: { enable: true, distance: 150, color: "#ff6b9d", opacity: 0.1, width: 1 },
            move: { enable: true, speed: 1, direction: "none", random: true, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true }
        },
        retina_detect: true
    });
}

// Dynamic Glow follows mouse
document.addEventListener('mousemove', (e) => {
    const glow = document.querySelector('.dynamic-glow');
    if(glow && appState.settings.glow) {
        glow.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(255, 107, 157, 0.15) 0%, transparent 50%)`;
    }
});

marked.setOptions({ highlight: (code) => hljs.highlightAuto(code).value, breaks: true });

// نظام الحماية والدخول
function handleLogin() {
    const username = dom.loginUsername.value.trim();
    const password = dom.loginPassword.value.trim();
    
    if (username === 'jojo' && password === 'jojo') {
        appState.isLoggedIn = true;
        localStorage.setItem('jana_logged_in', 'true');
        dom.loginScreen.classList.remove('active');
        dom.appContainer.style.display = 'flex';
        dom.loginError.innerText = '';
        setupApp();
    } else {
        dom.loginError.innerText = '❌ اسم المستخدم أو كلمة السر غير صحيحة';
        dom.loginPassword.value = '';
    }
}

function handleLogout() {
    if (confirm('هل تريدين الخروج؟')) {
        appState.isLoggedIn = false;
        localStorage.removeItem('jana_logged_in');
        dom.loginScreen.classList.add('active');
        dom.appContainer.style.display = 'none';
        dom.loginUsername.value = '';
        dom.loginPassword.value = '';
        dom.loginError.innerText = '';
    }
}

// تطبيق الإعدادات
function applySettings() {
    document.body.style.fontSize = appState.settings.fontSize + 'px';
    
    if (appState.settings.theme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }
    
    const particlesJs = document.getElementById('particles-js');
    if (particlesJs) {
        if (appState.settings.particles) {
            particlesJs.classList.remove('hidden');
        } else {
            particlesJs.classList.add('hidden');
        }
    }
    
    const glow = document.querySelector('.dynamic-glow');
    if (glow) {
        if (appState.settings.glow) {
            glow.classList.remove('hidden');
        } else {
            glow.classList.add('hidden');
        }
    }
    
    updateControlElements();
}

function updateControlElements() {
    if (controlElements.fontSizeSlider) {
        controlElements.fontSizeSlider.value = appState.settings.fontSize;
        controlElements.fontSizeValue.innerText = appState.settings.fontSize + 'px';
    }
    
    if (controlElements.temperatureSlider) {
        controlElements.temperatureSlider.value = appState.settings.temperature;
        controlElements.temperatureValue.innerText = appState.settings.temperature;
    }
    
    if (controlElements.maxTokensSlider) {
        controlElements.maxTokensSlider.value = appState.settings.maxTokens;
        controlElements.maxTokensValue.innerText = appState.settings.maxTokens;
    }
    
    if (controlElements.autoSaveCheckbox) {
        controlElements.autoSaveCheckbox.checked = appState.settings.autoSave;
    }
    
    if (controlElements.animationsCheckbox) {
        controlElements.animationsCheckbox.checked = appState.settings.animations;
    }
    
    if (controlElements.particlesCheckbox) {
        controlElements.particlesCheckbox.checked = appState.settings.particles;
    }
    
    if (controlElements.glowCheckbox) {
        controlElements.glowCheckbox.checked = appState.settings.glow;
    }
    
    controlElements.themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === appState.settings.theme) {
            btn.classList.add('active');
        }
    });
}

function saveSettings() {
    localStorage.setItem('jana_settings', JSON.stringify(appState.settings));
}

function saveData() {
    localStorage.setItem('jana_chats', JSON.stringify(appState.chats));
    localStorage.setItem('jana_current_id', appState.currentChatId);
    localStorage.setItem('jana_stats', JSON.stringify(appState.stats));
    if (appState.settings.autoSave) {
        saveSettings();
    }
}

// Event Listeners للإعدادات
if (controlElements.fontSizeSlider) {
    controlElements.fontSizeSlider.addEventListener('input', (e) => {
        appState.settings.fontSize = parseInt(e.target.value);
        controlElements.fontSizeValue.innerText = appState.settings.fontSize + 'px';
        document.body.style.fontSize = appState.settings.fontSize + 'px';
        saveSettings();
    });
}

if (controlElements.temperatureSlider) {
    controlElements.temperatureSlider.addEventListener('input', (e) => {
        appState.settings.temperature = parseFloat(e.target.value);
        controlElements.temperatureValue.innerText = appState.settings.temperature;
        saveSettings();
    });
}

if (controlElements.maxTokensSlider) {
    controlElements.maxTokensSlider.addEventListener('input', (e) => {
        appState.settings.maxTokens = parseInt(e.target.value);
        controlElements.maxTokensValue.innerText = appState.settings.maxTokens;
        saveSettings();
    });
}

if (controlElements.autoSaveCheckbox) {
    controlElements.autoSaveCheckbox.addEventListener('change', (e) => {
        appState.settings.autoSave = e.target.checked;
        saveSettings();
    });
}

if (controlElements.animationsCheckbox) {
    controlElements.animationsCheckbox.addEventListener('change', (e) => {
        appState.settings.animations = e.target.checked;
        saveSettings();
    });
}

if (controlElements.particlesCheckbox) {
    controlElements.particlesCheckbox.addEventListener('change', (e) => {
        appState.settings.particles = e.target.checked;
        const particlesJs = document.getElementById('particles-js');
        if (particlesJs) {
            if (e.target.checked) {
                particlesJs.classList.remove('hidden');
            } else {
                particlesJs.classList.add('hidden');
            }
        }
        saveSettings();
    });
}

if (controlElements.glowCheckbox) {
    controlElements.glowCheckbox.addEventListener('change', (e) => {
        appState.settings.glow = e.target.checked;
        const glow = document.querySelector('.dynamic-glow');
        if (glow) {
            if (e.target.checked) {
                glow.classList.remove('hidden');
            } else {
                glow.classList.add('hidden');
            }
        }
        saveSettings();
    });
}

controlElements.themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.closest('.theme-btn').dataset.theme;
        appState.settings.theme = theme;
        
        if (theme === 'light') {
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
        }
        
        controlElements.themeButtons.forEach(b => b.classList.remove('active'));
        e.target.closest('.theme-btn').classList.add('active');
        saveSettings();
    });
});

if (controlElements.exportDataBtn) {
    controlElements.exportDataBtn.addEventListener('click', () => {
        const data = {
            chats: appState.chats,
            settings: appState.settings,
            stats: appState.stats,
            exportDate: new Date().toISOString()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jana-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    });
}

if (controlElements.clearHistoryBtn) {
    controlElements.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('هل تريدين حذف جميع المحادثات؟')) {
            appState.chats = [];
            appState.currentChatId = null;
            saveData();
            renderChatList();
            dom.messagesFlow.innerHTML = '';
            dom.welcomeHero.style.display = 'block';
            alert('تم حذف جميع المحادثات');
        }
    });
}

// Modal controls
dom.settingsBtn.addEventListener('click', () => {
    dom.settingsModal.classList.add('active');
});

dom.closeSettingsBtn.addEventListener('click', () => {
    dom.settingsModal.classList.remove('active');
});

dom.settingsModal.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) {
        dom.settingsModal.classList.remove('active');
    }
});

dom.themeToggleBtn.addEventListener('click', () => {
    const newTheme = appState.settings.theme === 'dark' ? 'light' : 'dark';
    appState.settings.theme = newTheme;
    
    if (newTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }
    
    controlElements.themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === newTheme) {
            btn.classList.add('active');
        }
    });
    
    saveSettings();
});

// وظائف المحادثات
function createNewChat() {
    const id = 'chat_' + Date.now();
    const newChat = { id, title: 'محادثة جديدة', messages: [], model: dom.modelSelect.value, persona: dom.personaSelect.value };
    appState.chats.unshift(newChat);
    appState.currentChatId = id;
    appState.stats.totalChats++;
    saveData();
    renderChatList();
    loadChat(id);
}

function loadChat(id) {
    appState.currentChatId = id;
    const chat = appState.chats.find(c => c.id === id);
    if (!chat) return;

    dom.messagesFlow.innerHTML = '';
    if (chat.messages.length === 0) {
        dom.welcomeHero.style.display = 'block';
    } else {
        dom.welcomeHero.style.display = 'none';
        chat.messages.forEach(msg => appendMessageUI(msg.role === 'user' ? 'user' : 'ai', msg.content));
    }
    
    dom.modelSelect.value = chat.model || 'openai/gpt-4o';
    dom.personaSelect.value = chat.persona || 'intimate';
    
    renderChatList();
    saveData();
    scrollToBottom();
}

function renderChatList() {
    dom.chatList.innerHTML = '';
    appState.chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = `chat-item ${chat.id === appState.currentChatId ? 'active' : ''}`;
        div.innerHTML = `<i class="fas fa-heart"></i> <span>${chat.title}</span>`;
        div.onclick = () => loadChat(chat.id);
        dom.chatList.appendChild(div);
    });
}

function appendMessageUI(role, content) {
    dom.welcomeHero.style.display = 'none';
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;
    
    let avatarHTML = '';
    if (role === 'user') {
        avatarHTML = `<div class="msg-icon"><i class="fas fa-user"></i></div>`;
    } else {
        avatarHTML = `<div class="msg-icon"><i class="fas fa-heart"></i></div>`;
    }

    const htmlContent = role === 'ai' ? marked.parse(content) : content;

    row.innerHTML = `
        ${avatarHTML}
        <div class="msg-text">${htmlContent}</div>
    `;
    dom.messagesFlow.appendChild(row);
    scrollToBottom();
    
    if (role === 'ai') {
        row.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    }
}

async function sendMessage() {
    const text = dom.messageInput.value.trim();
    if (!text || !appState.currentChatId) return;

    const chat = appState.chats.find(c => c.id === appState.currentChatId);
    
    dom.messageInput.value = '';
    dom.messageInput.style.height = 'auto';

    appendMessageUI('user', text);
    chat.messages.push({ role: 'user', content: text });
    
    appState.stats.totalMessages++;
    
    if (chat.title === 'محادثة جديدة') {
        chat.title = text.substring(0, 20) + '...';
        renderChatList();
    }

    const loading = document.createElement('div');
    loading.className = 'msg-row ai';
    loading.innerHTML = `<div class="msg-icon"><i class="fas fa-circle-notch fa-spin"></i></div><div class="msg-text">Jana يفكر...</div>`;
    dom.messagesFlow.appendChild(loading);
    scrollToBottom();

    try {
        const personaKey = dom.personaSelect.value;
        const systemPrompt = JANA_PERSONAS[personaKey];

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://jana.ai',
                'X-Title': 'Jana AI'
            },
            body: JSON.stringify({
                model: dom.modelSelect.value,
                messages: [{ role: "system", content: systemPrompt }, ...chat.messages],
                temperature: appState.settings.temperature,
                max_tokens: appState.settings.maxTokens
            }),
        });

        const data = await response.json();
        dom.messagesFlow.removeChild(loading);

        if (response.ok && data.choices) {
            const aiMsg = data.choices[0].message.content;
            appendMessageUI('ai', aiMsg);
            chat.messages.push({ role: 'assistant', content: aiMsg });
            chat.model = dom.modelSelect.value;
            chat.persona = dom.personaSelect.value;
            appState.stats.totalMessages++;
            saveData();
        } else {
            appendMessageUI('ai', 'عذراً، حدث خطأ. حاولي لاحقاً 💕');
        }
    } catch (e) {
        if (dom.messagesFlow.contains(loading)) dom.messagesFlow.removeChild(loading);
        appendMessageUI('ai', 'خطأ في الاتصال. حاولي لاحقاً 💕');
    }
}

function scrollToBottom() {
    dom.messagesFlow.parentElement.scrollTop = dom.messagesFlow.parentElement.scrollHeight;
}

// Event Listeners
dom.loginBtn.addEventListener('click', handleLogin);
dom.loginUsername.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
dom.loginPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

dom.sendBtn.addEventListener('click', sendMessage);
dom.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
dom.newChatBtn.addEventListener('click', createNewChat);
dom.toggleSidebar.addEventListener('click', () => dom.sidebar.classList.add('active'));
dom.closeSidebar.addEventListener('click', () => dom.sidebar.classList.remove('active'));
dom.logoutBtn.addEventListener('click', handleLogout);

dom.messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

window.quickSend = (text) => {
    dom.messageInput.value = text;
    sendMessage();
};

// Setup App
function setupApp() {
    applySettings();
    renderChatList();
    if (appState.currentChatId) {
        loadChat(appState.currentChatId);
    } else {
        createNewChat();
    }
}

// Initialize
if (appState.isLoggedIn) {
    dom.loginScreen.classList.remove('active');
    dom.appContainer.style.display = 'flex';
    setupApp();
} else {
    dom.loginScreen.classList.add('active');
    dom.appContainer.style.display = 'none';
}
