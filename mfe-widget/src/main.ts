import { createApp, h } from 'vue';
import Widget from './Widget.vue';

const styles = `
    :host {
        display: block;
        font-family: 'Inter', sans-serif;
    }
    
    .widget-container {
        padding: 20px;
    }
    
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
    
    .vue-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(66, 184, 131, 0.1);
        border: 1px solid rgba(66, 184, 131, 0.3);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        color: #42b883;
        margin-bottom: 15px;
    }
    
    .attack-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #ff3c41;
        font-weight: 600;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

class WidgetElement extends HTMLElement {
    private app: ReturnType<typeof createApp> | null = null;
    private _mode: 'vulnerable' | 'secure' = 'vulnerable';
    private _logFn: ((type: string, message: string) => void) | null = null;

    static get observedAttributes() {
        return ['mode'];
    }

    get mode() {
        return this._mode;
    }

    set mode(value: 'vulnerable' | 'secure') {
        this._mode = value;
        this.render();
    }

    setLogFunction(fn: (type: string, message: string) => void) {
        this._logFn = fn;
        this.render();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });
        
        const container = document.createElement('div');
        container.id = 'vue-root';
        shadow.appendChild(container);

        const style = document.createElement('style');
        style.textContent = styles;
        shadow.appendChild(style);

        this.render();
    }

    disconnectedCallback() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
        }
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'mode') {
            this._mode = newValue as 'vulnerable' | 'secure';
            this.render();
        }
    }

    private render() {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const container = shadow.getElementById('vue-root');
        if (!container) return;

        if (this.app) {
            this.app.unmount();
        }

        const mode = this._mode;
        const logFn = this._logFn || console.log;

        this.app = createApp({
            render: () => h(Widget, { mode, log: logFn })
        });

        this.app.mount(container);
    }
}

if (!customElements.get('mfe-widget')) {
    customElements.define('mfe-widget', WidgetElement);
}

export { WidgetElement };
