/**
 * @typedef {Object} UserData
 * @property {string} jwt - Token JWT do usuário
 * @property {string} userId - ID único do usuário
 * @property {string} email - Email do usuário
 * @property {number} balance - Saldo da conta
 * @property {string} lastLogin - Data/hora do último login (ISO)
 */

/**
 * Inicializa o MFE Dashboard Financeiro
 * @param {string} containerId - ID do elemento container no DOM
 * @param {'vulnerable' | 'secure'} mode - Modo de operação
 * @param {(type: 'info' | 'warning' | 'error' | 'success', message: string) => void} log - Função de log
 */
export function init(containerId, mode, log) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`MFE Dashboard: Container '${containerId}' não encontrado`);
        return;
    }

    /** @type {UserData} */
    const userData = {
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MmY3YzlhMS05YjNlLTRkMmEtOGY2ZS0xYTJiM2M0ZDVlNmYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDYwMjU2MDAsImV4cCI6MTcwNjExMjAwMH0.k9nZMQ5KvG8xT7YkJRXm5Z5qL0Qj3R8s4N6fV2tE1Xc',
        userId: '42f7c9a1-9b3e-4d2a-8f6e-1a2b3c4d5e6f',
        email: 'user@example.com',
        balance: 15750.50,
        lastLogin: new Date().toISOString()
    };

    container.innerHTML = `
        <div style="padding: 20px;">
            <div class="dashboard-card">
                <h3 class="dashboard-card-title">👤 Perfil do Usuário</h3>
                <p class="dashboard-card-text">
                    <strong class="dashboard-label">Email:</strong> ${userData.email}
                </p>
                <p class="dashboard-card-text">
                    <strong class="dashboard-label">Saldo:</strong> <span class="dashboard-accent">R$ ${userData.balance.toFixed(2)}</span>
                </p>
            </div>

            <div class="dashboard-card">
                <h3 class="dashboard-card-title">🔐 Status de Autenticação</h3>
                <p class="dashboard-card-text">
                    <strong class="dashboard-label">Status:</strong> <span class="dashboard-accent dashboard-glow">✓ Autenticado</span>
                </p>
                <p class="dashboard-card-text">
                    <strong class="dashboard-label">Último Login:</strong> ${new Date(userData.lastLogin).toLocaleString('pt-BR')}
                </p>
            </div>

            <button id="btn-login" class="mfe-btn mfe-btn-outline">
                🔄 Simular Login
            </button>

            <button id="btn-check-storage" class="mfe-btn mfe-btn-primary">
                🔍 Verificar Storage
            </button>

            <div id="bff-section" class="bff-section" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-accent-subtle, rgba(0,255,65,0.2)); display: none;">
                <div style="font-size: 12px; color: var(--color-text-muted, #9ca3af); margin-bottom: 8px;">
                    🍪 BFF + HttpOnly Cookie (Artigo Seção 3.1)
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="btn-bff-login" class="mfe-btn mfe-btn-outline" style="flex: 1; margin-top: 0;">
                        🔐 Login BFF
                    </button>
                    <button id="btn-bff-refresh" class="mfe-btn mfe-btn-outline" style="flex: 1; margin-top: 0;">
                        🔄 Refresh Token
                    </button>
                </div>
            </div>
        </div>
        <style>
            .dashboard-card {
                background: var(--color-bg-secondary, #0a0a0a);
                border: 1px solid var(--color-border, #1a1a1a);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            .dashboard-card-title {
                color: var(--color-text, #e5e7eb);
                margin-bottom: 10px;
                font-size: 14px;
                font-weight: 600;
            }
            .dashboard-card-text {
                color: var(--color-text-muted, #9ca3af);
                font-size: 14px;
                margin: 5px 0;
            }
            .dashboard-label {
                color: var(--color-text, #e5e7eb);
            }
            .dashboard-accent {
                color: var(--color-accent, #00ff41);
            }
            .dashboard-glow {
                text-shadow: 0 0 10px var(--color-accent-glow, rgba(0, 255, 65, 0.3));
            }
            .mfe-btn {
                margin-top: 10px;
                padding: 12px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                width: 100%;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
            }
            .mfe-btn-outline {
                margin-top: 15px;
                background: transparent;
                color: var(--color-accent, #00ff41);
                border: 1px solid var(--color-accent, #00ff41);
            }
            .mfe-btn-outline:hover {
                background: var(--color-accent-subtle, rgba(0, 255, 65, 0.1));
                box-shadow: 0 0 20px var(--color-accent-glow, rgba(0, 255, 65, 0.2));
            }
            .mfe-btn-primary {
                background: var(--color-accent, #00ff41);
                color: var(--color-bg, #050505);
                border: none;
                box-shadow: 0 0 20px var(--color-accent-glow, rgba(0, 255, 65, 0.2));
            }
            .mfe-btn-primary:hover {
                box-shadow: 0 0 30px var(--color-accent-dim, rgba(0, 255, 65, 0.4));
            }
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: #fff;
                font-weight: 500;
                font-size: 14px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .toast-success { background: #10b981; }
            .toast-warning { background: #f59e0b; }
            .toast-error { background: #ef4444; }
            .toast-info { background: #3b82f6; }
            .toast svg { flex-shrink: 0; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;

    const toastIcons = {
        success: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        error: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `${toastIcons[type] || toastIcons.info}<span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    async function saveUserData() {
        if (mode === 'vulnerable') {
            localStorage.setItem('jwt', userData.jwt);
            localStorage.setItem('userId', userData.userId);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('balance', userData.balance);
            localStorage.setItem('lastLogin', userData.lastLogin);
            localStorage.setItem('dashboardTheme', 'dark');
            localStorage.setItem('lastViewedReport', 'Q3_2025');

            log('warning', '⚠️ Dashboard: Dados salvos diretamente no localStorage (VULNERÁVEL)');
            log('info', 'Dashboard: JWT, userId, email e outros dados armazenados sem proteção');
            showToast('Dados salvos SEM proteção!', 'warning');
        } else {
            if (!window.SecureStorage) {
                log('error', 'SecureStorage não disponível');
                return;
            }

            const secureStore = new window.SecureStorage(
                'mfe_dashboard',
                window.CRYPTO_SECRET,
                null,
                true
            );

            await secureStore.setItem('jwt', userData.jwt);
            await secureStore.setItem('userId', userData.userId);
            await secureStore.setItem('email', userData.email);
            await secureStore.setItem('balance', String(userData.balance));
            await secureStore.setItem('lastLogin', userData.lastLogin);
            await secureStore.setItem('dashboardTheme', 'dark');
            await secureStore.setItem('lastViewedReport', 'Q3_2025');

            log('success', '✅ Dashboard: Dados salvos com SecureStorage v2 (PBKDF2 + AES-GCM)');
            log('info', 'Dashboard: Chave derivada via PBKDF2 com 150.000 iterações');
            log('info', 'Dashboard: Salt aleatório de 128 bits armazenado com ciphertext');
            showToast('Dados criptografados com sucesso!', 'success');

            await createHoneytoken();
        }
    }

    /**
     * Cria uma honeytoken (isca) para detectar varredura
     * @returns {Promise<void>}
     */
    async function createHoneytoken() {
        try {
            const response = await fetch('/api/honey');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const { key, value } = await response.json();

            localStorage.setItem(key, value);

            if (window.__HONEYTOKENS__) {
                window.__HONEYTOKENS__.add(key);
            }

            log('info', `🍯 Honeytoken criada: ${key.substring(0, 20)}...`);
            log('info', '   → Qualquer leitura desta chave dispara alerta crítico');
        } catch (error) {
            console.warn('Erro ao criar honeytoken:', error);
            log('warning', `Falha ao criar honeytoken: ${error.message}`);
        }
    }

    async function checkStorage() {
        if (mode === 'vulnerable') {
            const items = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
                items.push(`${key}: ${preview}`);
            }
            log('info', `Dashboard verificou localStorage: ${items.length} itens encontrados`);
            items.forEach(item => log('info', `  → ${item}`));
        } else {
            if (!window.SecureStorage) {
                log('error', 'SecureStorage não disponível');
                return;
            }

            const secureStore = new window.SecureStorage(
                'mfe_dashboard',
                window.CRYPTO_SECRET,
                null,
                true
            );

            const jwt = await secureStore.getItem('jwt');
            const userId = await secureStore.getItem('userId');
            const email = await secureStore.getItem('email');

            log('success', 'Dashboard verificou SecureStorage com sucesso');
            log('info', `  → JWT recuperado: ${jwt ? jwt.substring(0, 30) + '...' : 'null'}`);
            log('info', `  → User ID: ${userId || 'null'}`);
            log('info', `  → Email: ${email || 'null'}`);

            log('info', 'Dashboard: Dados no localStorage (criptografados):');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mfe_dashboard:')) {
                    const value = localStorage.getItem(key);
                    log('info', `  → ${key}: ${value.substring(0, 40)}...`);
                }
            }
        }
    }

    document.getElementById('btn-login').addEventListener('click', async () => {
        log('info', 'Dashboard: Simulando processo de login...');
        await saveUserData();
        log('success', 'Dashboard: Login concluído e dados persistidos');
    });

    document.getElementById('btn-check-storage').addEventListener('click', checkStorage);

    document.getElementById('btn-bff-login').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: userData.email, password: 'demo123456' })
            });

            const data = await response.json();

            if (response.ok) {
                log('success', '🍪 [BFF] Cookie HttpOnly criado com sucesso!');
                log('info', '[BFF] → O token está INVISÍVEL ao JavaScript');
                log('info', '[BFF] → Verifique: DevTools → Application → Cookies');
                log('info', '[BFF] → Teste no console: document.cookie (retorna vazio)');
                log('success', '[BFF] → Esta é a forma SEGURA de armazenar tokens!');
                showToast('Cookie HttpOnly criado!', 'success');
            } else {
                log('warning', `[BFF] Falha: ${data.error || 'Erro desconhecido'}`);
                showToast('Falha no login BFF', 'error');
            }
        } catch (error) {
            log('error', `[BFF] Erro de conexão: ${error.message}`);
            showToast('Erro de conexão', 'error');
        }
    });

    document.getElementById('btn-bff-refresh').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                log('success', '🔄 [BFF] Token renovado com sucesso!');
                log('info', `[BFF] → Novo cookie criado (expira em ${data.expiresIn}s)`);
                log('info', '[BFF] → Sessão anterior foi invalidada');
                showToast('Token renovado!', 'success');
            } else {
                log('warning', `[BFF] Falha ao renovar: ${data.error}`);
                log('info', '[BFF] → Faça login primeiro');
                showToast('Faça login primeiro', 'warning');
            }
        } catch (error) {
            log('error', `[BFF] Erro de conexão: ${error.message}`);
            showToast('Erro de conexão', 'error');
        }
    });

    if (mode === 'secure') {
        document.getElementById('bff-section').style.display = 'block';
    }

    setTimeout(() => {
        saveUserData();
    }, 500);
}
