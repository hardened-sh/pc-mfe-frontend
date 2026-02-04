/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock Web Crypto API
const mockCrypto = {
    getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    },
    subtle: {
        importKey: vi.fn().mockResolvedValue({ type: 'secret' }),
        deriveKey: vi.fn().mockResolvedValue({ type: 'derived' }),
        encrypt: vi.fn().mockImplementation(async (_algo, _key, data) => {
            return new Uint8Array([...new Uint8Array(data), 0xDE, 0xAD]);
        }),
        decrypt: vi.fn().mockImplementation(async (_algo, _key, data) => {
            const arr = new Uint8Array(data);
            return arr.slice(0, arr.length - 2);
        })
    }
};

vi.stubGlobal('crypto', mockCrypto);

const scriptPath = resolve(__dirname, '../public/secure-storage.js');
const scriptContent = readFileSync(scriptPath, 'utf-8');
eval(scriptContent);

const SecureStorage = window.SecureStorage;

describe('SecureStorage', () => {
    let storage;
    const namespace = 'test_namespace';
    const secret = 'test-secret-key';

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        storage = new SecureStorage(namespace, secret, null, true);
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Constructor', () => {
        it('should create instance with namespace', () => {
            expect(storage).toBeDefined();
            expect(storage.namespace).toBe(`${namespace}:`);
        });

        it('should use PBKDF2 when usePBKDF2 is true', () => {
            const pbkdfStorage = new SecureStorage('ns', 'secret', null, true);
            expect(pbkdfStorage.usePBKDF2).toBe(true);
        });

        it('should use direct key when usePBKDF2 is false', () => {
            const directStorage = new SecureStorage('ns', 'secret', null, false);
            expect(directStorage.usePBKDF2).toBe(false);
        });
    });

    describe('setItem', () => {
        it('should store encrypted data with namespace prefix', async () => {
            await storage.setItem('testKey', 'testValue');

            const storedKey = `${namespace}:testKey`;
            const storedValue = localStorage.getItem(storedKey);

            expect(storedValue).toBeDefined();
            expect(storedValue).not.toBe('testValue');
        });

        it('should handle objects by serializing to JSON', async () => {
            const obj = { name: 'test', value: 123 };
            await storage.setItem('objKey', obj);

            const storedKey = `${namespace}:objKey`;
            const storedValue = localStorage.getItem(storedKey);

            expect(storedValue).toBeDefined();
        });

        it('should convert null to string "null"', async () => {
            await storage.setItem('key', null);
            const result = await storage.getItem('key');
            expect(result).toBe('null');
        });
    });

    describe('getItem', () => {
        it('should return null for non-existent key', async () => {
            const result = await storage.getItem('nonExistent');
            expect(result).toBeNull();
        });

        it('should decrypt and return stored value', async () => {
            await storage.setItem('myKey', 'myValue');
            const result = await storage.getItem('myKey');

            expect(result).toBeDefined();
        });
    });

    describe('removeItem', () => {
        it('should remove item from localStorage', async () => {
            await storage.setItem('toRemove', 'value');
            storage.removeItem('toRemove');

            const storedKey = `${namespace}:toRemove`;
            expect(localStorage.getItem(storedKey)).toBeNull();
        });
    });

    describe('clearNamespace', () => {
        it('should remove all items with namespace prefix', async () => {
            await storage.setItem('key1', 'value1');
            await storage.setItem('key2', 'value2');

            localStorage.setItem('other_namespace:key', 'otherValue');

            storage.clearNamespace();

            expect(localStorage.getItem(`${namespace}:key1`)).toBeNull();
            expect(localStorage.getItem(`${namespace}:key2`)).toBeNull();
            expect(localStorage.getItem('other_namespace:key')).toBe('otherValue');
        });
    });

    describe('Namespace Isolation', () => {
        it('should not access data from different namespace', async () => {
            const storage1 = new SecureStorage('namespace1', 'secret1', null, true);
            const storage2 = new SecureStorage('namespace2', 'secret2', null, true);

            await storage1.setItem('shared', 'value1');

            const result = await storage2.getItem('shared');
            expect(result).toBeNull();
        });
    });

    describe('Security', () => {
        it('should use different IV for each encryption', async () => {
            await storage.setItem('key', 'value');
            const encrypted1 = localStorage.getItem(`${namespace}:key`);

            await storage.setItem('key', 'value');
            const encrypted2 = localStorage.getItem(`${namespace}:key`);

            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should store data in base64 format', async () => {
            await storage.setItem('key', 'value');
            const stored = localStorage.getItem(`${namespace}:key`);

            const base64Regex = /^[A-Za-z0-9+/=]+$/;
            expect(base64Regex.test(stored)).toBe(true);
        });
    });
});
