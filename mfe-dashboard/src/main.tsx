import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './Dashboard';

class DashboardElement extends HTMLElement {
    private root: ReactDOM.Root | null = null;
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
        container.id = 'react-root';
        shadow.appendChild(container);

        const style = document.createElement('style');
        style.textContent = this.getStyles();
        shadow.appendChild(style);

        // Ler atributo mode definido antes de appendChild
        const modeAttr = this.getAttribute('mode');
        if (modeAttr === 'secure' || modeAttr === 'vulnerable') {
            this._mode = modeAttr;
        }

        this.root = ReactDOM.createRoot(container);
        this.render();
    }

    disconnectedCallback() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'mode') {
            this._mode = newValue as 'vulnerable' | 'secure';
            this.render();
        }
    }

    private render() {
        if (this.root) {
            this.root.render(
                <React.StrictMode>
                    <Dashboard 
                        mode={this._mode} 
                        log={this._logFn || console.log}
                    />
                </React.StrictMode>
            );
        }
    }

    private getStyles(): string {
        return `
            :host {
                display: block;
                font-family: 'Inter', sans-serif;
            }
            
            .dashboard-container {
                padding: 20px;
            }
            
            .info-card {
                background: #0a0a0a;
                border: 1px solid #1a1a1a;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .info-card h3 {
                color: #e5e7eb;
                margin: 0 0 10px 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .info-card p {
                color: #9ca3af;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .info-card strong {
                color: #e5e7eb;
            }
            
            .highlight {
                color: #00ff41 !important;
            }
            
            .glow {
                text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
            }
            
            .btn {
                margin-top: 10px;
                padding: 12px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                width: 100%;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-outline {
                margin-top: 15px;
                background: transparent;
                color: #00ff41;
                border: 1px solid #00ff41;
            }
            
            .btn-outline:hover {
                background: rgba(0, 255, 65, 0.1);
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
            }
            
            .btn-primary {
                background: #00ff41;
                color: #050505;
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
            }
            
            .btn-primary:hover {
                box-shadow: 0 0 30px rgba(0, 255, 65, 0.4);
            }
            
            .react-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(97, 218, 251, 0.1);
                border: 1px solid rgba(97, 218, 251, 0.3);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                color: #61dafb;
                margin-bottom: 15px;
            }
            
            .btn svg {
                vertical-align: middle;
            }
            
            .spin {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
    }
}

if (!customElements.get('mfe-dashboard')) {
    customElements.define('mfe-dashboard', DashboardElement);
}

export { DashboardElement, Dashboard };
