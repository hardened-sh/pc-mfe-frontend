import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = {
    SESSION_DURATION_MS: 15 * 60 * 1000,
    RATE_LIMIT: {
        WINDOW_MS: 1 * 60 * 1000,
        MAX_REQUESTS: 500,
        MAX_AUTH_REQUESTS: 10
    }
};

const activeHoneytokens = new Map();
const activeSessions = new Map();

const generalLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
    max: CONFIG.RATE_LIMIT.MAX_REQUESTS,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
    max: CONFIG.RATE_LIMIT.MAX_AUTH_REQUESTS,
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));
app.use(express.json());
app.use(express.text());
app.use(cookieParser());
app.use('/api/', generalLimiter);

app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data:;
        connect-src 'self';
        frame-src 'none';
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s+/g, ' ').trim();

    res.setHeader('Content-Security-Policy', cspHeader);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    next();
});

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    }
}));

app.post('/api/auth/login', authLimiter, (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const sessionId = crypto.randomUUID();
    const accessToken = `jwt_${crypto.randomBytes(32).toString('base64')}`;

    activeSessions.set(sessionId, {
        email,
        accessToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + CONFIG.SESSION_DURATION_MS)
    });

    res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: CONFIG.SESSION_DURATION_MS
    });

    logger.info({ email, sessionId }, 'Login bem-sucedido');

    res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: { email }
    });
});

app.get('/api/auth/session', (req, res) => {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
        return res.status(401).json({ error: 'Sessão inválida' });
    }

    if (new Date() > session.expiresAt) {
        activeSessions.delete(sessionId);
        res.clearCookie('session_id');
        return res.status(401).json({ error: 'Sessão expirada' });
    }

    res.json({
        email: session.email,
        expiresAt: session.expiresAt
    });
});

app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.cookies?.session_id;

    if (sessionId) {
        activeSessions.delete(sessionId);
        res.clearCookie('session_id');
        logger.info({ sessionId }, 'Logout realizado');
    }

    res.json({ success: true, message: 'Logout realizado' });
});

app.post('/api/auth/refresh', (req, res) => {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
        return res.status(401).json({ error: 'Não autenticado - cookie não encontrado' });
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
        res.clearCookie('session_id');
        return res.status(401).json({ error: 'Sessão inválida' });
    }

    if (new Date() > session.expiresAt) {
        activeSessions.delete(sessionId);
        res.clearCookie('session_id');
        return res.status(401).json({ error: 'Sessão expirada' });
    }

    const newAccessToken = `jwt_${crypto.randomBytes(32).toString('base64')}`;
    const newSessionId = crypto.randomUUID();

    activeSessions.delete(sessionId);
    activeSessions.set(newSessionId, {
        email: session.email,
        accessToken: newAccessToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + CONFIG.SESSION_DURATION_MS)
    });

    res.cookie('session_id', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: CONFIG.SESSION_DURATION_MS
    });

    logger.info({ email: session.email, newSessionId }, 'Token renovado');

    res.json({
        ok: true,
        message: 'Token renovado com sucesso',
        expiresIn: CONFIG.SESSION_DURATION_MS / 1000
    });
});

app.get('/api/honey', (req, res) => {
    const uuid = crypto.randomUUID();
    const key = `honey-${uuid}`;
    const value = `fake_token_${crypto.randomBytes(16).toString('hex')}`;

    activeHoneytokens.set(key, {
        value,
        createdAt: new Date(),
        accessed: false
    });

    logger.info({ key }, 'Honeytoken criado');

    res.json({ key, value });
});

app.post('/api/alert/honey', express.json(), (req, res) => {
    logger.warn({
        type: 'HONEYTOKEN_DETECTED',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        data: req.body
    }, '🚨 HONEYTOKEN DETECTADO!');

    res.status(200).json({ acknowledged: true });
});

app.post('/api/alert/scan', express.json(), (req, res) => {
    logger.warn({
        type: 'MASS_SCAN_DETECTED',
        ip: req.ip,
        data: req.body
    }, '⚠️ VARREDURA COMPLETA DETECTADA!');

    res.status(200).json({ acknowledged: true });
});

app.post('/api/alert/iframe', express.json(), (req, res) => {
    logger.warn({
        type: 'IFRAME_ATTEMPT',
        data: req.body
    }, '⚠️ TENTATIVA DE CRIAÇÃO DE IFRAME!');

    res.status(200).json({ acknowledged: true });
});

app.post('/api/audit/localstorage', express.json(), (req, res) => {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    logger.debug({ eventCount: events.length }, 'Auditoria localStorage');

    events.forEach(event => {
        if (event.level === 'HIGH' || event.level === 'CRITICAL') {
            logger.warn({ level: event.level, operation: event.op, key: event.key }, 'Acesso suspeito ao storage');
        }
    });

    res.status(200).json({ received: events.length });
});

app.post('/api/exfiltrate', (req, res) => {
    let payload;
    try {
        payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (_e) {
        payload = req.body;
    }

    logger.error({
        type: 'EXFILTRATION_ATTEMPT',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        payload
    }, '🚨 TENTATIVA DE EXFILTRAÇÃO DETECTADA!');

    res.status(200).json({
        status: 'collected',
        message: 'Data exfiltrated successfully',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/csp-report', express.json(), (req, res) => {
    logger.warn({
        type: 'CSP_VIOLATION',
        report: req.body
    }, '⚠️ Violação de CSP detectada!');

    res.status(204).send();
});

app.get('/api/health', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
        status: 'ok',
        mode: process.env.VULNERABLE === 'true' ? 'vulnerable' : 'secure',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        activeSessions: activeSessions.size,
        activeHoneytokens: activeHoneytokens.size,
        memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        version: process.version
    });
});

app.get('/api/user-data', (req, res) => {
    res.json({
        userId: '42f7c9a1-9b3e-4d2a-8f6e-1a2b3c4d5e6f',
        email: 'user@example.com',
        balance: 15750.50,
        lastLogin: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    if (req.query.vanilla === 'true') {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index-wc.html'));
    }
});

app.get('/vanilla', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res) => {
    logger.error({ err, path: req.path }, 'Erro no servidor');
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    logger.info({
        port: PORT,
        mode: process.env.NODE_ENV || 'development',
        urls: {
            main: `http://localhost:${PORT}`,
            vanilla: `http://localhost:${PORT}/vanilla`,
            health: `http://localhost:${PORT}/api/health`
        }
    }, '🚀 POC Micro-frontends Security Demo iniciado');
});

process.on('SIGTERM', () => {
    logger.info('Encerrando servidor (SIGTERM)');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Encerrando servidor (SIGINT)');
    process.exit(0);
});
