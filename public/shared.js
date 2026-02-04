const MESSAGES = {
    hostInit: 'Host Application inicializado',
    mfeLoading: 'Carregando micro-frontends...',
    mfeDashboardLoaded: 'MFE Dashboard carregado',
    mfeWidgetLoaded: 'MFE Widget carregado',
    mfeLoadError: 'Erro ao carregar MFE',

    vulnerableMode: 'Modo vulnerável ativado - localStorage sem proteção',
    secureMode: 'Modo seguro ativado - SecureStorage wrapper em uso',

    vulnerableAlert: 'Modo vulnerável ativado. O Widget irá exfiltrar dados do localStorage.',
    secureAlert: 'Modo seguro ativado. SecureStorage está isolando os dados.',

    waitingTelemetry: 'Aguardando eventos de segurança...',

    telemetry: {
        audit: 'Evento de Auditoria',
        honeytoken: 'HONEYTOKEN DETECTADO',
        massScan: 'VARREDURA COMPLETA',
        exfiltration: 'EXFILTRAÇÃO DETECTADA'
    },

    icons: {
        audit: '📊',
        honeytoken: '🚨',
        massScan: '⚠️',
        exfiltration: '🔴'
    }
};

function log(type, message) {
    const consoleEl = document.getElementById('security-console');
    if (!consoleEl) {
        console.warn('Console element not found:', type, message);
        return;
    }

    const time = new Date().toLocaleTimeString('pt-BR');
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = time;

    const typeSpan = document.createElement('span');
    typeSpan.className = `log-type ${type}`;
    typeSpan.textContent = type.toUpperCase();

    const messageSpan = document.createElement('span');
    messageSpan.className = 'log-message';
    messageSpan.textContent = message;

    entry.appendChild(timeSpan);
    entry.appendChild(typeSpan);
    entry.appendChild(messageSpan);
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function logTelemetry(data, type = 'info') {
    const telemetryEl = document.getElementById('server-telemetry');
    if (!telemetryEl) {
        return;
    }

    const waitingMsg = telemetryEl.querySelector('div:not(.telemetry-entry)');
    if (waitingMsg && !telemetryEl.querySelector('.telemetry-entry')) {
        waitingMsg.remove();
    }

    const eventDate = data.ts ? new Date(data.ts) : new Date();
    const time = eventDate.toLocaleTimeString('pt-BR');
    const isCritical = data.level === 'CRITICAL' || type === 'critical';

    const entry = document.createElement('div');
    entry.className = `telemetry-entry${isCritical ? ' critical' : ''}`;

    let title = MESSAGES.telemetry.audit;
    let icon = MESSAGES.icons.audit;

    if (data.type === 'HONEYTOKEN_ACCESS') {
        title = MESSAGES.telemetry.honeytoken;
        icon = MESSAGES.icons.honeytoken;
    } else if (data.type === 'MASS_SCAN') {
        title = MESSAGES.telemetry.massScan;
        icon = MESSAGES.icons.massScan;
    } else if (data.type === 'exfiltration') {
        title = data.source
            ? `${MESSAGES.telemetry.exfiltration} (${data.source})`
            : MESSAGES.telemetry.exfiltration;
        icon = MESSAGES.icons.exfiltration;
    }

    const header = document.createElement('div');
    header.className = `telemetry-header${isCritical ? ' critical' : ''}`;
    header.textContent = `${time} - ${icon} ${title}`;

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data, null, 2);

    entry.appendChild(header);
    entry.appendChild(pre);

    telemetryEl.insertBefore(entry, telemetryEl.firstChild);

    while (telemetryEl.children.length > 10) {
        telemetryEl.removeChild(telemetryEl.lastChild);
    }
}

function updateModeButtons(mode) {
    const btnVulnerable = document.getElementById('btn-vulnerable');
    const btnSecure = document.getElementById('btn-secure');

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (mode === 'vulnerable') {
        btnVulnerable?.classList.add('active');
        btnVulnerable?.setAttribute('aria-pressed', 'true');
        btnSecure?.setAttribute('aria-pressed', 'false');
    } else {
        btnSecure?.classList.add('active');
        btnSecure?.setAttribute('aria-pressed', 'true');
        btnVulnerable?.setAttribute('aria-pressed', 'false');
    }
}

function updateAlert(mode) {
    const alertEl = document.getElementById('mode-alert');
    if (!alertEl) {
        return;
    }

    alertEl.textContent = '';

    const alertDiv = document.createElement('div');
    const alertStrong = document.createElement('strong');

    if (mode === 'vulnerable') {
        alertDiv.className = 'alert alert-danger';
        alertStrong.textContent = '⚠️ ATENÇÃO: ';
        alertDiv.appendChild(alertStrong);
        alertDiv.appendChild(document.createTextNode(MESSAGES.vulnerableAlert));
    } else {
        alertDiv.className = 'alert alert-success';
        alertStrong.textContent = '✅ PROTEGIDO: ';
        alertDiv.appendChild(alertStrong);
        alertDiv.appendChild(document.createTextNode(MESSAGES.secureAlert));
    }

    alertEl.appendChild(alertDiv);
}

function updateTelemetryVisibility(mode) {
    const telemetryEl = document.getElementById('server-telemetry');
    const telemetryCard = telemetryEl?.closest('.mfe-card');

    if (telemetryCard) {
        telemetryCard.style.display = 'block';
    }

    if (telemetryEl && !telemetryEl.querySelector('.telemetry-entry')) {
        telemetryEl.textContent = '';
        const waitingMsg = document.createElement('div');
        waitingMsg.style.cssText = 'color: #64748b; padding: 10px;';
        waitingMsg.textContent = mode === 'vulnerable'
            ? '⚠️ Monitorando ataques em tempo real...'
            : MESSAGES.waitingTelemetry;
        telemetryEl.appendChild(waitingMsg);
    }
}

function clearConsole() {
    const consoleEl = document.getElementById('security-console');
    if (consoleEl) {
        consoleEl.textContent = '';
    }
}

function initEventListeners(setModeFn) {
    document.getElementById('btn-vulnerable')?.addEventListener('click', () => setModeFn('vulnerable'));
    document.getElementById('btn-secure')?.addEventListener('click', () => setModeFn('secure'));
    document.getElementById('btn-clear-console')?.addEventListener('click', clearConsole);
}

export {
    MESSAGES,
    log,
    logTelemetry,
    updateModeButtons,
    updateAlert,
    updateTelemetryVisibility,
    clearConsole,
    initEventListeners
};
