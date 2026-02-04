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

function setMode(mode) {
    currentMode = mode;
    localStorage.clear();
    document.documentElement.setAttribute('data-mode', mode);

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
    log('info', MESSAGES.mfeLoading);

    const dashboardContainer = document.getElementById('mfe-dashboard');
    const widgetContainer = document.getElementById('mfe-widget');

    dashboardContainer.textContent = '';
    widgetContainer.textContent = '';

    try {
        const timestamp = Date.now();

        const dashboardModule = await import(`./mfe-dashboard.js?t=${timestamp}`);
        dashboardModule.init('mfe-dashboard', currentMode, log);
        log('success', MESSAGES.mfeDashboardLoaded);

        const widgetModule = await import(`./mfe-widget.js?t=${timestamp}`);
        widgetModule.init('mfe-widget', currentMode, log);
        log('success', MESSAGES.mfeWidgetLoaded);

    } catch (error) {
        log('error', `${MESSAGES.mfeLoadError}: ${error.message}`);
        console.error('MFE error:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    log('info', MESSAGES.hostInit);
    window.logTelemetry = logTelemetry;
    window.dispatchEvent(new Event('logTelemetryReady'));

    initEventListeners(setMode);

    setMode('vulnerable');
});
