declare class SecureStorageClass {
    constructor(namespace: string, secret: string, allowedOrigin?: string | null, usePBKDF2?: boolean);
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): void;
    clear(): void;
    keys(): string[];
}

declare global {
    interface Window {
        SecureStorage?: typeof SecureStorageClass;
        CRYPTO_SECRET?: string;
        __HONEYTOKENS__?: Set<string>;
        logTelemetry?: (data: Record<string, unknown>, type?: string) => void;
    }
}

export {};
