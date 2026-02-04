(() => {
    'use strict';

    const DEBUG = window.__STORAGE_AUDIT_DEBUG__ || false;

    if (DEBUG) {
        console.log('🛡️ Storage Audit Proxy: Inicializando...');
    }

    const pendingTelemetry = [];

    function sendToTelemetry(event, type) {
        if (window.logTelemetry) {
            while (pendingTelemetry.length > 0) {
                const pending = pendingTelemetry.shift();
                window.logTelemetry(pending.event, pending.type);
            }
            window.logTelemetry(event, type);
        } else {
            pendingTelemetry.push({ event, type });
        }
    }

    window.addEventListener('logTelemetryReady', () => {
        while (pendingTelemetry.length > 0 && window.logTelemetry) {
            const pending = pendingTelemetry.shift();
            window.logTelemetry(pending.event, pending.type);
        }
    });

    const AUDIT_CONFIG = {
        BATCH_INTERVAL_MS: 5000,
        MAX_BATCH_SIZE: 64 * 1024,
        SCAN_THRESHOLD: 5,
        TIME_WINDOW_MS: 1000
    };

    window.__STORAGE_AUDIT_CONFIG__ = AUDIT_CONFIG;

    const WHITELIST = new Set([
        'ui-theme',
        'lang',
        'lastVisit',
        'dashboardTheme',
        'lastViewedReport',
        'weatherLocation',
        'weatherTemp',
        'widgetImpressionId'
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

    window.__HONEYTOKENS__ = new Set();

    const queue = [];
    let accessCount = 0;
    let lastAccessTime = Date.now();

    const enqueue = (op, key, _value = null) => {
        if (WHITELIST.has(key)) {
            return;
        }

        const isHoneytoken = window.__HONEYTOKENS__.has(key) ||
            (typeof key === 'string' && key.startsWith('honey-'));

        if (isHoneytoken && op !== 'write') {
            const stack = new Error().stack || '';
            let sourceMfe = 'unknown';
            let sourceFunction = null;
            const stackLines = stack.split('\n').slice(2);

            for (const line of stackLines) {
                const fileMatch = line.match(/\/(mfe-[^/.]+|host-app[^/.]*)\.js/);
                if (fileMatch) {
                    sourceMfe = fileMatch[1];
                    const funcMatch = line.match(/at\s+([^\s(]+)/);
                    if (funcMatch && funcMatch[1] !== 'Object.<anonymous>') {
                        sourceFunction = funcMatch[1];
                    }
                    break;
                }
            }

            const criticalEvent = {
                op,
                key,
                ts: Date.now(),
                level: 'CRITICAL',
                type: 'HONEYTOKEN_ACCESS',
                sourceMfe,
                sourceFunction,
                userAgent: navigator.userAgent,
                origin: window.origin
            };

            console.error('🚨🚨🚨 HONEYTOKEN DETECTADO! 🚨🚨🚨', criticalEvent);

            sendToTelemetry(criticalEvent, 'critical');

            navigator.sendBeacon('/api/alert/honey', JSON.stringify(criticalEvent));

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

        if (level === 'HIGH') {
            console.warn(`🔍 Audit: ${op.toUpperCase()} em chave sensível "${key}"`);
        }

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

                    sendToTelemetry(scanEvent, 'critical');

                    navigator.sendBeacon('/api/alert/scan', JSON.stringify(scanEvent));
                    accessCount = 0;
                }
            } else {
                accessCount = 1;
            }

            lastAccessTime = now;
        }
    };

    const originalLocalStorage = window.localStorage;

    const handler = {
        get(target, prop) {
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

            if (typeof target[prop] !== 'function' && prop !== 'length') {
                enqueue('read-direct', prop);
            }

            return Reflect.get(target, prop);
        },

        set(target, prop, value) {
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

    try {
        Object.defineProperty(window, 'localStorage', {
            value: proxy,
            writable: false,
            configurable: false
        });
        if (DEBUG) {
            console.log('✅ Storage Audit Proxy: Selado com sucesso (não pode ser bypassado)');
        }
    } catch (error) {
        console.error('❌ Storage Audit Proxy: Falha ao selar:', error);
    }

    const batchIntervalId = setInterval(() => {
        if (queue.length === 0) {
            return;
        }

        const payload = JSON.stringify(queue);

        if (payload.length > AUDIT_CONFIG.MAX_BATCH_SIZE) {
            const chunks = Math.ceil(payload.length / AUDIT_CONFIG.MAX_BATCH_SIZE);
            for (let i = 0; i < chunks; i++) {
                const slice = queue.splice(0, Math.ceil(queue.length / (chunks - i)));
                navigator.sendBeacon('/api/audit/localstorage', JSON.stringify(slice));
            }
        } else {
            const sent = navigator.sendBeacon('/api/audit/localstorage', payload);
            if (sent) {
                queue.length = 0;
            } else if (DEBUG) {
                console.warn('⚠️ Storage Audit: Falha ao enviar batch, tentará novamente');
            }
        }
    }, AUDIT_CONFIG.BATCH_INTERVAL_MS);

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
                }
            });
        });
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

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
