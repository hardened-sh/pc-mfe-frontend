import {
    MESSAGES,
    log,
    logTelemetry,
    updateModeButtons,
    updateAlert,
    updateTelemetryVisibility,
    clearConsole,
    initEventListeners
} from './shared.js';

let currentMode = 'vulnerable';

// Expor logTelemetry globalmente para o servidor
window.logTelemetry = logTelemetry;

function setMode(mode) {
    currentMode = mode;
    localStorage.clear();

    updateModeButtons(mode);
    clearConsole();
    updateTelemetryVisibility(mode);
    updateAlert(mode);

    if (mode === 'vulnerable') {
        log('warning', MESSAGES.vulnerableMode);
    } else {
        log('success', MESSAGES.secureMode);
    }

    loadMicroFrontends();
}

async function loadMicroFrontends() {
    log('info', `${MESSAGES.mfeLoading} (React + Vue)`);

    const dashboardContainer = document.getElementById('mfe-dashboard');
    const widgetContainer = document.getElementById('mfe-widget');

    dashboardContainer.textContent = '';
    widgetContainer.textContent = '';

    try {
        await loadMFE('/mfes/mfe-dashboard.js', 'mfe-dashboard');
        await customElements.whenDefined('mfe-dashboard');

        const dashboard = document.createElement('mfe-dashboard');
        dashboard.setAttribute('mode', currentMode);  // Definir ANTES de appendChild
        dashboardContainer.appendChild(dashboard);

        // Garantir que o modo seja atualizado após montagem também
        setTimeout(() => {
            dashboard.setAttribute('mode', currentMode);
            if (dashboard.setLogFunction) {
                dashboard.setLogFunction(log);
            }
        }, 0);

        log('success', `${MESSAGES.mfeDashboardLoaded} (React)`);

        await loadMFE('/mfes/mfe-widget.js', 'mfe-widget');
        await customElements.whenDefined('mfe-widget');

        const widget = document.createElement('mfe-widget');
        widget.setAttribute('mode', currentMode);
        widgetContainer.appendChild(widget);

        if (widget.setLogFunction) {
            widget.setLogFunction(log);
        }

        log('success', `${MESSAGES.mfeWidgetLoaded} (Vue)`);

    } catch (error) {
        log('error', `${MESSAGES.mfeLoadError}: ${error.message}`);
        console.error('MFE error:', error);
    }
}

async function loadMFE(url, name) {
    if (customElements.get(name)) {
        return;
    }

    const timestamp = Date.now();
    await import(`${url}?t=${timestamp}`);
}

window.addEventListener('DOMContentLoaded', () => {
    log('info', '🚀 ' + MESSAGES.hostInit);
    log('info', '   → React 18 (Dashboard) + Vue 3 (Widget)');
    log('info', '   → Web Components para isolamento');

    initEventListeners(setMode);

    setMode('vulnerable');
});
