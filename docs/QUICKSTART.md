# 🚀 Guia Rápido de Início

## Stack Tecnológica

- **MFE Dashboard**: React 18 + TypeScript + Vite
- **MFE Widget**: Vue 3 + TypeScript + Vite
- **Host App**: Vanilla JS + Web Components
- **Server**: Node.js + Express

## Instalação e Execução em 4 Passos

### 1️⃣ Instalar Dependências do Servidor

```bash
cd pc-mfe-frontend
npm install
```

### 2️⃣ Compilar os MFEs (React + Vue)

```bash
# Compilar Dashboard (React)
cd mfe-dashboard && npm install && npm run build && cd ..

# Compilar Widget (Vue)
cd mfe-widget && npm install && npm run build && cd ..
```

### 3️⃣ Iniciar o Servidor

```bash
npm run dev
```

Você verá:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🔒 POC: Micro-frontends Security Demo v2.0           ║
║        React 18 + Vue 3 + Web Components                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:3000

📝 Versões disponíveis:
   → React + Vue:  http://localhost:3000
   → Vanilla JS:   http://localhost:3000/vanilla
```

### 4️⃣ Abrir no Navegador

| Versão | URL | Descrição |
|--------|-----|-----------|
| **React + Vue** | http://localhost:3000 | MFEs compilados com frameworks reais |
| **Vanilla JS** | http://localhost:3000/vanilla | Versão JavaScript puro |

## 🎮 Teste Rápido (2 minutos)

### Teste o ATAQUE (Modo Vulnerável)

1. A página já inicia em **"⚠️ Modo Vulnerável"**
2. Clique em **"🔄 Simular Login"** no Dashboard
3. Aguarde 1 segundo
4. Observe o **Console de Segurança** (painel inferior):
   - 🚨 Você verá o widget roubando JWT, email, saldo, etc.
   - 🔴 Todos os dados são capturados e exfiltrados

### Teste a DEFESA (Modo Seguro)

1. Clique em **"🛡️ Modo Seguro"**
2. Clique em **"🔄 Simular Login"** novamente
3. Observe o console:
   - ✅ Widget BLOQUEADO
   - 🔒 Dados protegidos por criptografia
   - 🛡️ Ataque neutralizado

## 📊 O Que Você Vai Ver

### No Navegador (DevTools - F12)

- **Console**: Logs detalhados de cada operação
- **Network**: Tentativas de exfiltração (bloqueadas no modo seguro)
- **Application → Local Storage**: Veja dados em texto plano vs criptografados

### No Terminal (Servidor)

Se o widget conseguir exfiltrar (modo vulnerável), você verá:
```
🚨 ALERTA: Tentativa de exfiltração detectada!
═══════════════════════════════════════════════
Payload capturado:
{
  "jwt": "eyJhbGciOiJIUzI1...",
  "userId": "42f7c9a1-9b3e...",
  "email": "user@example.com",
  ...
}
```

## 🎯 Pontos Chave para Observar

1. **localStorage compartilhado**: Mesmo domínio = mesmo storage
2. **Runtime Integration**: Scripts rodam no mesmo contexto
3. **Sem isolamento**: Widget acessa tudo que Dashboard salva
4. **Criptografia funciona**: Dados cifrados são inúteis para o atacante
5. **CSP ajuda**: Headers bloqueiam conexões não autorizadas

## ❓ Problemas Comuns

### Porta 3000 já em uso?

```bash
# Use outra porta
PORT=3001 npm run dev
```

### Módulos não encontrados?

```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Cache do navegador?

Pressione **Ctrl+Shift+R** (ou Cmd+Shift+R no Mac) para hard refresh

## 📚 Próximos Passos

Depois de testar:

1. Leia o **README.md** para detalhes técnicos
2. Explore o código em **mfe-dashboard/src/** e **mfe-widget/src/**
3. Modifique os componentes para criar novos cenários de ataque

---

**Bom aprendizado! 🔒**
