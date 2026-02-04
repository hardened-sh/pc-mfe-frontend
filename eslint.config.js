import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**', 'public/mfes/**', 'mfe-dashboard/**', 'mfe-widget/**'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                fetch: 'readonly',
                crypto: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                TextEncoder: 'readonly',
                TextDecoder: 'readonly',
                atob: 'readonly',
                btoa: 'readonly',
                customElements: 'readonly',
                MutationObserver: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'indent': ['error', 4],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always']
        }
    }
];
