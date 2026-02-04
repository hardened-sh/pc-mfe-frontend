// Storage Audit Proxy - Monitoramento e detecção de acessos suspeitos ao localStorage
// Baseado no artigo: "Relato de um dia na vida de quem vive a dor dos Micro-frontends"
// Deve ser carregado ANTES de qualquer outro script para evitar bypass

(() => {
    'use strict';

    // Flag de debug
    const DEBUG = window.__STORAGE_AUDIT_DEBUG__ || false;

    if (DEBUG) {
        console.log('🛡️ Storage Audit Proxy: Inicializando...');
    }

    // -----------------------------------------------------------------
    // 1️⃣ Configurações centralizadas
    // -----------------------------------------------------------------
    const AUDIT_CONFIG = {
        BATCH_INTERVAL_MS: 5000,      // Intervalo de envio em lote
        MAX_BATCH_SIZE: 64 * 1024,    // 64 KB, evita payload gigante
        SCAN_THRESHOLD: 5,            // 5+ acessos em menos de 1s = suspeito
        TIME_WINDOW_MS: 1000          // Janela de tempo para detecção de varredura
    };

    // Expor config para debug/testes
    window.__STORAGE_AUDIT_CONFIG__ = AUDIT_CONFIG;

    const WHITELIST = new Set([
        'ui-theme',          // dark / light
        'lang',              // idioma escolhido
        'lastVisit',         // timestamp de última visita
        'dashboardTheme',    // tema do dashboard
        'lastViewedReport',  // último relatório visualizado
        'weatherLocation',   // localização para previsão do tempo
        'weatherTemp',       // temperatura
        'widgetImpressionId' // ID de impressão do widget
    ]);

    const SENSITIVE = new Set([
        'jwt',
        'access_token',
        'refresh_token',
        'userId',
        'email',
        'balance',
        'session_id',
        'apiKey'
    ]);

    // Lista de honeytokens será preenchida dinamicamente
    window.__HONEYTOKENS__ = new Set();

    // -----------------------------------------------------------------
    // 2️⃣ Estrutura de fila de eventos – batch a cada 5s
    // -----------------------------------------------------------------
    const queue = [];

    // Variáveis para detecção de varredura (scan detection)
    let accessCount = 0;
    let lastAccessTime = Date.now();

    const enqueue = (op, key, _value = null) => {
        // Ignora ruído da whitelist
        if (WHITELIST.has(key)) {
            return;
        }

        // Detecta honeytokens - prioridade crítica!
        const isHoneytoken = window.__HONEYTOKENS__.has(key) ||
            (typeof key === 'string' && key.startsWith('honey-'));

        if (isHoneytoken) {
            // Alerta imediato para honeytokens
            const criticalEvent = {
                op,
                key,
                ts: Date.now(),
                level: 'CRITICAL',
                type: 'HONEYTOKEN_ACCESS',
                userAgent: navigator.userAgent,
                origin: window.origin
            };

            console.error('🚨🚨🚨 HONEYTOKEN DETECTADO! 🚨🚨🚨', criticalEvent);

            // Exibir no painel de telemetria
            if (window.logTelemetry) {
                window.logTelemetry(criticalEvent, 'critical');
            }

            // Envio imediato (não espera o batch)
            navigator.sendBeacon('/api/alert/honey', JSON.stringify(criticalEvent));

            // Ainda adiciona à fila para auditoria
            queue.push(criticalEvent);
            return;
        }

        const level = SENSITIVE.has(key) ? 'HIGH' : 'LOW';
        const event = {
            op,
            key,
            ts: Date.now(),
            level,
            stackTrace: new Error().stack.split('\n').slice(2, 5).join(' | ')
        };

        queue.push(event);

        // Log visual para demonstração
        if (level === 'HIGH') {
            console.warn(`🔍 Audit: ${op.toUpperCase()} em chave sensível "${key}"`);
        }

        // Detecção de varredura completa (mass scan)
        if (op === 'read' || op === 'read-direct' || op === 'enumerate') {
            const now = Date.now();

            if (now - lastAccessTime < AUDIT_CONFIG.TIME_WINDOW_MS) {
                accessCount++;

                if (accessCount >= AUDIT_CONFIG.SCAN_THRESHOLD) {
                    const scanEvent = {
                        type: 'MASS_SCAN',
                        count: accessCount,
                        timeWindow: now - lastAccessTime,
                        ts: now,
                        level: 'CRITICAL',
                        userAgent: navigator.userAgent
                    };

                    console.error('🚨 ATENÇÃO: Varredura completa detectada!');

                    // Exibir no painel de telemetria
                    if (window.logTelemetry) {
                        window.logTelemetry(scanEvent, 'critical');
                    }

                    navigator.sendBeacon('/api/alert/scan', JSON.stringify(scanEvent));
                    accessCount = 0; // Reset para não spammar
                }
            } else {
                accessCount = 1; // Reset do contador
            }

            lastAccessTime = now;
        }
    };

    // -----------------------------------------------------------------
    // 3️⃣ Criação do Proxy – intercepta get/set/remove/key/clear
    // -----------------------------------------------------------------
    const originalLocalStorage = window.localStorage;

    const handler = {
        get(target, prop) {
            // Intercepta métodos do localStorage
            if (prop === 'getItem') {
                return function (key) {
                    enqueue('read', key);
                    return originalLocalStorage.getItem(key);
                };
            }

            if (prop === 'setItem') {
                return function (key, value) {
                    enqueue('write', key, value);
                    return originalLocalStorage.setItem(key, value);
                };
            }

            if (prop === 'removeItem') {
                return function (key) {
                    enqueue('delete', key);
                    return originalLocalStorage.removeItem(key);
                };
            }

            if (prop === 'key') {
                return function (index) {
                    enqueue('enumerate', `index:${index}`);
                    return originalLocalStorage.key(index);
                };
            }

            if (prop === 'clear') {
                return function () {
                    enqueue('clear-all', 'ALL_KEYS');
                    return originalLocalStorage.clear();
                };
            }

            // Acesso direto a propriedades (ex: localStorage.jwt)
            if (typeof target[prop] !== 'function' && prop !== 'length') {
                enqueue('read-direct', prop);
            }

            return Reflect.get(target, prop);
        },

        set(target, prop, value) {
            // Detecta escrita direta (ex: localStorage.jwt = "...")
            if (prop !== 'length') {
                enqueue('write-direct', prop, value);
            }
            return Reflect.set(target, prop, value);
        },

        deleteProperty(target, prop) {
            enqueue('delete-direct', prop);
            return Reflect.deleteProperty(target, prop);
        }
    };

    const proxy = new Proxy(originalLocalStorage, handler);

    // -----------------------------------------------------------------
    // 4️⃣ Selar o descriptor – impede sobrescrita posterior
    // -----------------------------------------------------------------
    try {
        Object.defineProperty(window, 'localStorage', {
            value: proxy,
            writable: false,      // não pode ser reatribuído
            configurable: false   // não pode ser redefinido ou deletado
        });
        if (DEBUG) {
            console.log('✅ Storage Audit Proxy: Selado com sucesso (não pode ser bypassado)');
        }
    } catch (error) {
        console.error('❌ Storage Audit Proxy: Falha ao selar:', error);
    }

    // -----------------------------------------------------------------
    // 5️⃣ Envio em lote – keep-alive para não bloquear unload
    // -----------------------------------------------------------------
    const batchIntervalId = setInterval(() => {
        if (queue.length === 0) {
            return;
        }

        const payload = JSON.stringify(queue);

        // Se o batch estourar o limite, fragmenta
        if (payload.length > AUDIT_CONFIG.MAX_BATCH_SIZE) {
            const chunks = Math.ceil(payload.length / AUDIT_CONFIG.MAX_BATCH_SIZE);
            for (let i = 0; i < chunks; i++) {
                const slice = queue.splice(0, Math.ceil(queue.length / (chunks - i)));
                navigator.sendBeacon('/api/audit/localstorage', JSON.stringify(slice));
            }
        } else {
            // Envia batch completo
            const sent = navigator.sendBeacon('/api/audit/localstorage', payload);
            if (sent) {
                queue.length = 0; // Limpa fila apenas se enviou com sucesso
            } else if (DEBUG) {
                console.warn('⚠️ Storage Audit: Falha ao enviar batch, tentará novamente');
            }
        }
    }, AUDIT_CONFIG.BATCH_INTERVAL_MS);

    // -----------------------------------------------------------------
    // 6️⃣ Proteção contra bypass via iframe
    // -----------------------------------------------------------------
    // CSP já bloqueia frame-src, mas adiciona camada extra
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'IFRAME') {
                    console.error('🚨 Tentativa de criar iframe detectada!');
                    navigator.sendBeacon('/api/alert/iframe', JSON.stringify({
                        type: 'IFRAME_CREATION_ATTEMPT',
                        src: node.src,
                        ts: Date.now()
                    }));
                    // Não remove o iframe (pode quebrar funcionalidade legítima)
                    // Apenas registra o evento
                }
            });
        });
    });

    // Inicia observação do DOM
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // -----------------------------------------------------------------
    // 7️⃣ Função de cleanup para SPAs com hot reload
    // -----------------------------------------------------------------
    window.__STORAGE_AUDIT_CLEANUP__ = () => {
        clearInterval(batchIntervalId);
        observer.disconnect();
        if (DEBUG) {
            console.log('🧹 Storage Audit Proxy: Cleanup realizado');
        }
    };

    if (DEBUG) {
        console.log('✅ Storage Audit Proxy: Totalmente inicializado');
        console.log('   → Whitelist:', Array.from(WHITELIST).join(', '));
        console.log('   → Sensitive:', Array.from(SENSITIVE).join(', '));
        console.log(`   → Batch interval: ${AUDIT_CONFIG.BATCH_INTERVAL_MS / 1000}s`);
        console.log('   → Scan detection: ativo');
        console.log('   → Iframe detection: ativo');
    }
})();
