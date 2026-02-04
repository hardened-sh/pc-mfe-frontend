# 📂 Estrutura do Projeto

```
pc-mfe-frontend/
│
├── 📄 package.json              # Dependências e scripts npm
├── 📄 server.js                 # Servidor Express com CSP e BFF
├── 📄 setup.sh                  # Script de instalação
├── 📄 README.md                 # Documentação principal
│
├── 📚 docs/                     # Documentação adicional
│   ├── INDEX.md                 # Índice da documentação
│   ├── QUICKSTART.md            # Guia rápido (4 passos)
│   ├── TUTORIAL.md              # Tutorial passo a passo
│   ├── TESTING.md               # Cenários de teste
│   ├── STRUCTURE.md             # Este arquivo
│   ├── DIAGRAMS.md              # Diagramas visuais ASCII
│   └── screenshots/             # Imagens de demonstração
│
├── 🔷 mfe-dashboard/            # MFE 1: React 18 + TypeScript
│   ├── package.json             # Dependências React/Vite
│   ├── vite.config.ts           # Configuração build
│   ├── tsconfig.json            # Configuração TypeScript
│   └── src/
│       ├── main.tsx             # Web Component wrapper
│       └── Dashboard.tsx        # Componente React principal
│
├── 🟢 mfe-widget/               # MFE 2: Vue 3 + TypeScript
│   ├── package.json             # Dependências Vue/Vite
│   ├── vite.config.ts           # Configuração build
│   ├── tsconfig.json            # Configuração TypeScript
│   └── src/
│       ├── main.ts              # Web Component wrapper
│       └── Widget.vue           # Componente Vue SFC
│
└── 📁 public/                   # Arquivos servidos pelo navegador
    ├── index.html               # Host App (Vanilla JS)
    ├── index-wc.html            # Host App (React + Vue)
    ├── host-app.js              # Lógica host (Vanilla)
    ├── host-app-wc.js           # Lógica host (Web Components)
    ├── shared.js                # Funções compartilhadas (logs, UI)
    ├── mfe-dashboard.js         # MFE Dashboard vanilla
    ├── mfe-widget.js            # MFE Widget vanilla
    ├── secure-storage.js        # SecureStorage (PBKDF2 + AES-GCM)
    ├── storage-audit.js         # Proxy de auditoria localStorage
    └── mfes/                    # Bundles compilados
        ├── mfe-dashboard.js     # React 18 compilado (~220KB)
        └── mfe-widget.js        # Vue 3 compilado (~108KB)
```

## 🎯 Duas Versões Disponíveis

| Versão | URL | MFEs | Descrição |
|--------|-----|------|-----------|
| **React + Vue** | `/` | Web Components | Frameworks reais com Shadow DOM |
| **Vanilla JS** | `/vanilla` | JS puro | Versão original sem frameworks |

##  Dependências entre Arquivos

```
server.js
  └─► serve public/*

index.html
  ├─► carrega secure-storage.js
  ├─► import mfe-dashboard.js
  └─► import mfe-widget.js

mfe-dashboard.js
  └─► usa SecureStorage (modo seguro)

mfe-widget.js
  └─► tenta usar SecureStorage (sem sucesso)

secure-storage.js
  └─► usa Web Crypto API
```

## 📊 Estatísticas

- **Código JavaScript**: ~1.500 linhas
- **Documentação**: 6 arquivos
- **MFEs**: 2 (React + Vue)

## 📦 Dependências npm

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "cookie-parser": "^1.4.6",
  "express-rate-limit": "^7.0.0"
}
```

## 🚀 Pontos de Entrada

| Objetivo | Arquivo |
|----------|--------|
| Executar servidor | `npm run dev` |
| Página principal | http://localhost:3000 |
| Versão vanilla | http://localhost:3000/vanilla |
