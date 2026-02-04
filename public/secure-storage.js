const DEBUG = window.__SECURE_STORAGE_DEBUG__ || false;

const SECURE_STORAGE_CONFIG = {
    PBKDF2_ITERATIONS: 150_000,
    IV_LENGTH: 12,
    SALT_LENGTH: 16,
    KEY_LENGTH: 256
};

class SecureStorage {
    constructor(namespace, secret, allowedOrigin = null, usePBKDF2 = true) {
        if (!namespace || typeof namespace !== 'string') {
            throw new Error('Namespace é obrigatório e deve ser uma string');
        }
        if (!secret || typeof secret !== 'string') {
            throw new Error('Secret é obrigatório e deve ser uma string');
        }

        this.namespace = `${namespace}:`;
        this.allowedOrigin = allowedOrigin;
        this.secret = secret;
        this.usePBKDF2 = usePBKDF2;
        this.legacyKey = null;
    }

    async _deriveKey(salt) {
        const encoder = new TextEncoder();

        const baseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(this.secret),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: SECURE_STORAGE_CONFIG.PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: SECURE_STORAGE_CONFIG.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async _importKey(rawKey) {
        try {
            const keyBytes = Uint8Array.from(atob(rawKey), c => c.charCodeAt(0));

            return await crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Erro ao importar chave:', error);
            throw new Error('Falha ao inicializar SecureStorage: chave inválida');
        }
    }

    _assertOrigin() {
        if (this.allowedOrigin && window.origin !== this.allowedOrigin) {
            throw new Error(`Origem ${window.origin} não autorizada`);
        }
    }

    _nsKey(key) {
        return `${this.namespace}${key}`;
    }

    async _encrypt(value) {
        const iv = crypto.getRandomValues(new Uint8Array(SECURE_STORAGE_CONFIG.IV_LENGTH));
        const salt = crypto.getRandomValues(new Uint8Array(SECURE_STORAGE_CONFIG.SALT_LENGTH));

        const encoder = new TextEncoder();
        const plaintext = encoder.encode(value);

        let cryptoKey;
        if (this.usePBKDF2) {
            cryptoKey = await this._deriveKey(salt);
        } else {
            if (!this.legacyKey) {
                this.legacyKey = await this._importKey(this.secret);
            }
            cryptoKey = this.legacyKey;
        }

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            plaintext
        );

        return {
            iv,
            salt: this.usePBKDF2 ? salt : null,
            data: new Uint8Array(ciphertext),
            usePBKDF2: this.usePBKDF2
        };
    }

    async _decrypt(cipherObj) {
        let cryptoKey;

        if (cipherObj.usePBKDF2 && cipherObj.salt) {
            cryptoKey = await this._deriveKey(cipherObj.salt);
        } else {
            if (!this.legacyKey) {
                this.legacyKey = await this._importKey(this.secret);
            }
            cryptoKey = this.legacyKey;
        }

        const plaintext = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: cipherObj.iv },
            cryptoKey,
            cipherObj.data
        );

        const decoder = new TextDecoder();
        return decoder.decode(plaintext);
    }

    _serialize(cipherObj) {
        const version = 2;
        const flags = cipherObj.usePBKDF2 ? 0x01 : 0x00;

        let totalLength = 1 + 1 + cipherObj.iv.length + cipherObj.data.length;
        if (cipherObj.salt) {
            totalLength += cipherObj.salt.length;
        }

        const combined = new Uint8Array(totalLength);
        let offset = 0;

        combined[offset++] = version;
        combined[offset++] = flags;
        combined.set(cipherObj.iv, offset);
        offset += cipherObj.iv.length;

        if (cipherObj.salt) {
            combined.set(cipherObj.salt, offset);
            offset += cipherObj.salt.length;
        }

        combined.set(cipherObj.data, offset);

        return btoa(String.fromCharCode(...combined));
    }

    _deserialize(blob) {
        let bytes;
        try {
            bytes = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
        } catch (e) {
            throw new Error('Falha ao desserializar: dados base64 inválidos');
        }

        if (bytes.length < 14) {
            throw new Error('Falha ao desserializar: dados corrompidos ou incompletos');
        }

        let offset = 0;
        const version = bytes[offset++];

        if (version === 2) {
            const flags = bytes[offset++];
            const usePBKDF2 = (flags & 0x01) !== 0;

            const iv = bytes.slice(offset, offset + 12);
            offset += 12;

            let salt = null;
            if (usePBKDF2) {
                salt = bytes.slice(offset, offset + 16);
                offset += 16;
            }

            const data = bytes.slice(offset);

            return { iv, salt, data, usePBKDF2 };
        } else {
            const iv = bytes.slice(0, 12);
            const data = bytes.slice(12);
            return { iv, salt: null, data, usePBKDF2: false };
        }
    }

    async setItem(key, value) {
        this._assertOrigin();

        try {
            const cipherObj = await this._encrypt(value);
            const serialized = this._serialize(cipherObj);
            localStorage.setItem(this._nsKey(key), serialized);
        } catch (error) {
            console.error('Erro ao salvar item:', error);
            throw new Error(`Falha ao salvar ${key}`);
        }
    }

    async getItem(key) {
        this._assertOrigin();

        try {
            const blob = localStorage.getItem(this._nsKey(key));
            if (!blob) {
                return null;
            }

            const cipherObj = this._deserialize(blob);
            return await this._decrypt(cipherObj);
        } catch (error) {
            console.log('🛡️ Tentativa de decriptação com chave incorreta bloqueada:', error.name);
            return null;
        }
    }

    removeItem(key) {
        this._assertOrigin();
        localStorage.removeItem(this._nsKey(key));
    }

    clearNamespace() {
        this._assertOrigin();
        const prefix = this.namespace;
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    keys() {
        this._assertOrigin();
        const prefix = this.namespace;
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key.substring(prefix.length));
            }
        }

        return keys;
    }

    get length() {
        return this.keys().length;
    }
}

window.SecureStorage = SecureStorage;
window.SECURE_STORAGE_CONFIG = SECURE_STORAGE_CONFIG;

window.CRYPTO_SECRET = 'mfe-poc-demo-secret-2026-hardened';
window.CRYPTO_KEY = 'bWZlLXBvYy1kZW1vLWtleS0yMDI2LWhhcmRlbmVkLXNoLW9yZw==';

if (DEBUG) {
    console.log('🔒 SecureStorage v2 inicializado (com suporte a PBKDF2)');
    console.log(`   → AES-GCM ${SECURE_STORAGE_CONFIG.KEY_LENGTH}-bit`);
    console.log(`   → PBKDF2 com ${SECURE_STORAGE_CONFIG.PBKDF2_ITERATIONS.toLocaleString()} iterações`);
    console.log(`   → Salt aleatório de ${SECURE_STORAGE_CONFIG.SALT_LENGTH * 8} bits`);
    console.log(`   → IV aleatório de ${SECURE_STORAGE_CONFIG.IV_LENGTH * 8} bits`);
}
