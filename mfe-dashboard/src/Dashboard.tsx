import React, { useState, useEffect, useCallback } from 'react';
import './types/global.d.ts';

interface UserData {
    jwt: string;
    userId: string;
    email: string;
    balance: number;
    lastLogin: string;
}

interface DashboardProps {
    mode: 'vulnerable' | 'secure';
    log: (type: string, message: string) => void;
}

interface Toast {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

const MOCK_USER: UserData = {
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MmY3YzlhMS05YjNlLTRkMmEtOGY2ZS0xYTJiM2M0ZDVlNmYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDYwMjU2MDAsImV4cCI6MTcwNjExMjAwMH0.k9nZMQ5KvG8xT7YkJRXm5Z5qL0Qj3R8s4N6fV2tE1Xc',
    userId: '42f7c9a1-9b3e-4d2a-8f6e-1a2b3c4d5e6f',
    email: 'user@example.com',
    balance: 15750.50,
    lastLogin: new Date().toISOString()
};

export const Dashboard: React.FC<DashboardProps> = ({ mode, log }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userData] = useState<UserData>(MOCK_USER);
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Debug: verificar modo recebido
    useEffect(() => {
        console.log('[Dashboard] Mode received:', mode);
        console.log('[Dashboard] Mode type:', typeof mode);
        console.log('[Dashboard] Mode === secure:', mode === 'secure');
    }, [mode]);

    const createHoneytoken = useCallback(async () => {
        try {
            const response = await fetch('/api/honey');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const { key, value } = await response.json();

            localStorage.setItem(key, value);

            if (window.__HONEYTOKENS__) {
                window.__HONEYTOKENS__.add(key);
            }

            log('info', `🍯 [React] Honeytoken criada: ${key.substring(0, 20)}...`);
        } catch (error) {
            log('warning', `Falha ao criar honeytoken: ${(error as Error).message}`);
        }
    }, [log]);

    const saveVulnerable = useCallback(() => {
        localStorage.setItem('jwt', userData.jwt);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('email', userData.email);
        localStorage.setItem('balance', String(userData.balance));
        localStorage.setItem('lastLogin', userData.lastLogin);
        localStorage.setItem('dashboardTheme', 'dark');
        localStorage.setItem('lastViewedReport', 'Q3_2025');

        log('warning', '⚠️ [React] Dashboard: Dados salvos diretamente no localStorage (VULNERÁVEL)');
        log('info', '[React] Dashboard: JWT, userId, email armazenados sem proteção');
        showToast('Dados salvos SEM proteção!', 'warning');
    }, [userData, log, showToast]);

    // Login BFF com HttpOnly Cookie (separado do fluxo localStorage)
    const loginWithBFFCookie = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userData.email, 
                    password: '123456' 
                }),
                credentials: 'include'
            });

            if (response.ok) {
                log('success', '🍪 [BFF] Cookie HttpOnly criado com sucesso!');
                log('info', '[BFF] → O token está INVISÍVEL ao JavaScript');
                log('info', '[BFF] → Verifique: DevTools → Application → Cookies');
                log('info', '[BFF] → Teste no console: document.cookie (retorna vazio)');
                log('success', '[BFF] → Esta é a forma SEGURA de armazenar tokens!');
                showToast('Cookie HttpOnly criado!', 'success');
            } else {
                const error = await response.json();
                log('warning', `[BFF] Falha: ${error.error || 'Erro desconhecido'}`);
                showToast('Falha no login BFF', 'error');
            }
        } catch (error) {
            log('error', `[BFF] Erro de conexão: ${error}`);
            showToast('Erro de conexão', 'error');
        }
        setIsLoading(false);
    }, [userData.email, log, showToast]);

    // Refresh token via BFF
    const refreshBFFToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                log('success', '🔄 [BFF] Token renovado com sucesso!');
                log('info', `[BFF] → Novo cookie criado (expira em ${data.expiresIn}s)`);
                log('info', '[BFF] → Sessão anterior foi invalidada');
                showToast('Token renovado!', 'success');
            } else {
                const error = await response.json();
                log('warning', `[BFF] Falha ao renovar: ${error.error}`);
                log('info', '[BFF] → Faça login primeiro');
                showToast('Faça login primeiro', 'warning');
            }
        } catch (error) {
            log('error', `[BFF] Erro de conexão: ${error}`);
            showToast('Erro de conexão', 'error');
        }
        setIsLoading(false);
    }, [log, showToast]);

    const saveSecure = useCallback(async () => {
        const SecureStorage = window.SecureStorage;
        const CRYPTO_SECRET = window.CRYPTO_SECRET;

        if (!SecureStorage || !CRYPTO_SECRET) {
            log('error', 'SecureStorage não disponível');
            return;
        }

        const secureStore = new SecureStorage(
            'mfe_dashboard',
            CRYPTO_SECRET,
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

        log('success', '✅ [React] Dashboard: Dados salvos com SecureStorage (PBKDF2 + AES-GCM)');
        log('info', '[React] Dashboard: Chave derivada via PBKDF2 com 150.000 iterações');
        showToast('Dados criptografados com sucesso!', 'success');
    }, [userData, log, showToast]);

    const saveUserData = useCallback(async () => {
        setIsLoading(true);

        if (mode === 'vulnerable') {
            saveVulnerable();
        } else {
            await saveSecure();
            await createHoneytoken();
        }

        setIsLoading(false);
    }, [mode, saveVulnerable, saveSecure, createHoneytoken]);

    const checkStorage = useCallback(async () => {
        if (mode === 'vulnerable') {
            log('info', '[React] Verificando localStorage direto...');
            const jwt = localStorage.getItem('jwt');
            const userId = localStorage.getItem('userId');
            log('warning', `  → JWT: ${jwt ? jwt.substring(0, 30) + '...' : 'null'}`);
            log('warning', `  → User ID: ${userId || 'null'}`);
        } else {
            const SecureStorage = (window as any).SecureStorage;
            const CRYPTO_SECRET = (window as any).CRYPTO_SECRET;

            if (!SecureStorage) {
                log('error', 'SecureStorage não disponível');
                return;
            }

            const secureStore = new SecureStorage('mfe_dashboard', CRYPTO_SECRET, null, true);

            try {
                const jwt = await secureStore.getItem('jwt');
                const userId = await secureStore.getItem('userId');

                log('success', '[React] Verificou SecureStorage com sucesso');
                log('info', `  → JWT: ${jwt ? jwt.substring(0, 30) + '...' : 'null'}`);
                log('info', `  → User ID: ${userId || 'null'}`);
            } catch (error) {
                log('error', `Erro ao ler SecureStorage: ${(error as Error).message}`);
            }
        }
    }, [mode, log]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveUserData();
        }, 500);

        return () => clearTimeout(timer);
    }, [saveUserData]);

    const getToastIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}>
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                );
            case 'warning':
                return (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                );
            case 'error':
                return (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                );
        }
    };

    return (
        <div className="dashboard-container">
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '14px',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: toast.type === 'success' ? '#10b981' : 
                                     toast.type === 'warning' ? '#f59e0b' : 
                                     toast.type === 'error' ? '#ef4444' : '#3b82f6'
                }}>
                    {getToastIcon(toast.type)}
                    {toast.message}
                </div>
            )}

            <div className="react-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9z" />
                </svg>
                React 18
            </div>

            <div className="info-card">
                <h3>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Perfil do Usuário
                </h3>
                <p><strong>Email:</strong> {userData.email}</p>
                <p>
                    <strong>Saldo:</strong>{' '}
                    <span className="highlight glow">
                        R$ {userData.balance.toFixed(2)}
                    </span>
                </p>
            </div>

            <div className="info-card">
                <h3>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Status de Autenticação
                </h3>
                <p>
                    <strong>Status:</strong>{' '}
                    <span className="highlight glow">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Autenticado
                    </span>
                </p>
                <p>
                    <strong>Último Login:</strong>{' '}
                    {new Date(userData.lastLogin).toLocaleString('pt-BR')}
                </p>
            </div>

            <button
                className="btn btn-outline"
                onClick={saveUserData}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                            <line x1="12" y1="2" x2="12" y2="6"/>
                            <line x1="12" y1="18" x2="12" y2="22"/>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                            <line x1="2" y1="12" x2="6" y2="12"/>
                            <line x1="18" y1="12" x2="22" y2="12"/>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                        </svg>
                        Salvando...
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                            <polyline points="23 4 23 10 17 10"/>
                            <polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Simular Login
                    </>
                )}
            </button>

            <button
                className="btn btn-primary"
                onClick={checkStorage}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Verificar Storage
            </button>

            {/* Debug: mostrar modo atual */}
            <div style={{fontSize: '10px', color: '#666', marginTop: '8px', textAlign: 'center'}}>
                Debug: mode = "{mode}" | isSecure = {String(mode === 'secure')}
            </div>

            {/* Sempre mostrar para teste */}
            <div className="bff-section" style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,255,65,0.2)'}}>
                    <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>
                        🍪 BFF + HttpOnly Cookie (Artigo Seção 3.1)
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button
                            className="btn btn-secondary"
                            onClick={loginWithBFFCookie}
                            disabled={isLoading}
                            style={{flex: 1}}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Login BFF
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={refreshBFFToken}
                            disabled={isLoading}
                            style={{flex: 1}}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            Refresh Token
                        </button>
                    </div>
                </div>
        </div>
    );
};
