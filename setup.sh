#!/bin/bash

# Script de instalação e inicialização da POC
# Micro-frontends Security Demo

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🔒 Setup: POC Micro-frontends Security               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo ""
    echo "Por favor, instale Node.js 16+ antes de continuar:"
    echo "  • Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  • Fedora: sudo dnf install nodejs npm"
    echo "  • Arch: sudo pacman -S nodejs npm"
    echo "  • Ou via nvm: https://github.com/nvm-sh/nvm"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js detectado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    echo "Por favor, instale npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm detectado: $NPM_VERSION"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Instalação concluída com sucesso!"
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 Para iniciar o servidor, execute:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "   Ou diretamente:"
    echo "   node server.js"
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo "❌ Erro na instalação das dependências"
    echo "Tente manualmente: npm install"
    exit 1
fi
