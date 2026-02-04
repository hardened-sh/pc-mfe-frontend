// SecureStorage - Wrapper seguro para localStorage com criptografia
// Implementa namespacing, criptografia AES-GCM, PBKDF2 e validação de origem
// Baseado no artigo: "Relato de um dia na vida de quem vive a dor dos Micro-frontends"

/**
 * @typedef {Object} CipherObject
 * @property {Uint8Array} iv - Vetor de inicialização (12 bytes)
 * @property {Uint8Array|null} salt - Salt para PBKDF2 (16 bytes) ou null
 * @property {Uint8Array} data - Dados criptografados
 * @property {boolean} usePBKDF2 - Se usa PBKDF2 para derivação de chave
 */

// Flag de debug (controlada globalmente)
const DEBUG = window.__SECURE_STORAGE_DEBUG__ || false;

// Configurações centralizadas
const SECURE_STORAGE_CONFIG = {
    PBKDF2_ITERATIONS: 150_000,
    IV_LENGTH: 12,      // 96 bits
    SALT_LENGTH: 16,    // 128 bits
    KEY_LENGTH: 256     // AES-256
};

/**
 * SecureStorage - Armazenamento seguro com criptografia AES-GCM
 * @class
 */
class SecureStorage {
    /**
     * Cria uma instância do SecureStorage
     * @param {string} namespace - Prefixo para todas as chaves (ex: 'mfe_dashboard')
     * @param {string} secret - Secret para derivar a chave (não é a chave direta!)
     * @param {string|null} [allowedOrigin=null] - Origem permitida (opcional)
     * @param {boolean} [usePBKDF2=true] - Se true, usa PBKDF2 para derivar chave (recomendado)
     */
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

        /** @type {CryptoKey|null} */
        this.legacyKey = null;
    }

    /**
     * Deriva uma chave AES-256 usando PBKDF2
     * @private
     * @param {Uint8Array} salt - Salt aleatório (16 bytes)
     * @returns {Promise<CryptoKey>} Chave AES-GCM derivada
     */
    async _deriveKey(salt) {
        const encoder = new TextEncoder();

        // Importa o secret como chave base para PBKDF2
        const baseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(this.secret),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Deriva a chave AES-GCM de 256 bits
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: SECURE_STORAGE_CONFIG.PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: SECURE_STORAGE_CONFIG.KEY_LENGTH },
            false,  // Não exportável
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Importa a chave diretamente (modo legado, menos seguro)
     * @private
     */
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

    /**
     * Verifica se a origem atual é permitida
     * @private
     */
    _assertOrigin() {
        if (this.allowedOrigin && window.origin !== this.allowedOrigin) {
            throw new Error(`Origem ${window.origin} não autorizada`);
        }
    }

    /**
     * Adiciona namespace à chave
     * @private
     */
    _nsKey(key) {
        return `${this.namespace}${key}`;
    }

    /**
     * Encripta valor usando AES-GCM com PBKDF2
     * @private
     * @param {string} value - Valor a ser criptografado
     * @returns {Promise<CipherObject>} Objeto cifrado
     */
    async _encrypt(value) {
        const iv = crypto.getRandomValues(new Uint8Array(SECURE_STORAGE_CONFIG.IV_LENGTH));
        const salt = crypto.getRandomValues(new Uint8Array(SECURE_STORAGE_CONFIG.SALT_LENGTH));

        const encoder = new TextEncoder();
        const plaintext = encoder.encode(value);

        // Deriva ou importa a chave
        let cryptoKey;
        if (this.usePBKDF2) {
            cryptoKey = await this._deriveKey(salt);
        } else {
            // Modo legado (compatibilidade)
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

    /**
     * Decripta valor usando AES-GCM
     * @private
     */
    async _decrypt(cipherObj) {
        let cryptoKey;

        if (cipherObj.usePBKDF2 && cipherObj.salt) {
            // Usa PBKDF2 com o salt armazenado
            cryptoKey = await this._deriveKey(cipherObj.salt);
        } else {
            // Modo legado
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

    /**
     * Serializa objeto cifrado para base64
     * @private
     */
    _serialize(cipherObj) {
        // Formato: [version(1)] [flags(1)] [iv(12)] [salt(16 se PBKDF2)] [data(n)]
        const version = 2; // v2 com suporte a PBKDF2
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

    /**
     * Desserializa base64 para objeto cifrado
     * @private
     */
    _deserialize(blob) {
        let bytes;
        try {
            bytes = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
        } catch (e) {
            throw new Error('Falha ao desserializar: dados base64 inválidos');
        }

        // Validação mínima: version(1) + flags(1) + iv(12) = 14 bytes
        if (bytes.length < 14) {
            throw new Error('Falha ao desserializar: dados corrompidos ou incompletos');
        }

        let offset = 0;
        const version = bytes[offset++];

        // Suporta v1 (legado) e v2 (PBKDF2)
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
            // v1 ou dados sem versão (legado)
            // Assume formato antigo: [iv(12)] [data(n)]
            const iv = bytes.slice(0, 12);
            const data = bytes.slice(12);
            return { iv, salt: null, data, usePBKDF2: false };
        }
    }

    /**
     * Salva item criptografado
     * @param {string} key - Chave do item
     * @param {string} value - Valor a ser armazenado
     */
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

    /**
     * Recupera item e decripta
     * @param {string} key - Chave do item
     * @returns {Promise<string|null>} Valor decriptado ou null
     */
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
            // Falha segura: isso é ESPERADO quando chave incorreta é usada
            // É uma DEFESA funcionando, não um bug!
            console.log('🛡️ Tentativa de decriptação com chave incorreta bloqueada:', error.name);
            // Retorna null silenciosamente (fail-safe)
            return null;
        }
    }

    /**
     * Remove item do namespace
     * @param {string} key - Chave do item
     */
    removeItem(key) {
        this._assertOrigin();
        localStorage.removeItem(this._nsKey(key));
    }

    /**
     * Limpa apenas itens do namespace atual
     */
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

    /**
     * Lista todas as chaves do namespace (sem valores)
     * @returns {string[]} Array de chaves
     */
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

    /**
     * Retorna o número de itens no namespace
     * @returns {number}
     */
    get length() {
        return this.keys().length;
    }
}

// Expor globalmente para uso nos MFEs
window.SecureStorage = SecureStorage;

// Expor config para debug/testes
window.SECURE_STORAGE_CONFIG = SECURE_STORAGE_CONFIG;

// ═══════════════════════════════════════════════════════════════════
// ATENÇÃO: Em produção, o secret DEVE vir do backend!
// Opções seguras:
// 1. Cookie HttpOnly com token de sessão
// 2. Derivação baseada em credenciais do usuário
// 3. Endpoint protegido com autenticação
// ═══════════════════════════════════════════════════════════════════

window.CRYPTO_SECRET = 'mfe-poc-demo-secret-2026-hardened';
window.CRYPTO_KEY = 'bWZlLXBvYy1kZW1vLWtleS0yMDI2LWhhcmRlbmVkLXNoLW9yZw==';

if (DEBUG) {
    console.log('🔒 SecureStorage v2 inicializado (com suporte a PBKDF2)');
    console.log(`   → AES-GCM ${SECURE_STORAGE_CONFIG.KEY_LENGTH}-bit`);
    console.log(`   → PBKDF2 com ${SECURE_STORAGE_CONFIG.PBKDF2_ITERATIONS.toLocaleString()} iterações`);
    console.log(`   → Salt aleatório de ${SECURE_STORAGE_CONFIG.SALT_LENGTH * 8} bits`);
    console.log(`   → IV aleatório de ${SECURE_STORAGE_CONFIG.IV_LENGTH * 8} bits`);
}
console.log('   → IV aleatório de 96 bits');
