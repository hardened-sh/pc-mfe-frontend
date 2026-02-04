#!/usr/bin/env python3
"""
Servidor HTTP simples para a POC de Micro-frontends
Alternativa ao servidor Node.js quando npm não está disponível
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from datetime import datetime

class MFESecurityHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="public", **kwargs)
    
    def end_headers(self):
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self' https://c2.attacker.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        self.send_header('Content-Security-Policy', csp)
        
        # Outros headers de segurança
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        
        SimpleHTTPRequestHandler.end_headers(self)
    
    def do_POST(self):
        if self.path == '/api/collect':
            # Endpoint de exfiltração simulado
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            print('\n' + '=' * 60)
            print('🚨 ALERTA: Tentativa de exfiltração detectada!')
            print('=' * 60)
            print(f'Timestamp: {datetime.now().isoformat()}')
            print(f'IP: {self.client_address[0]}')
            print(f'User-Agent: {self.headers.get("User-Agent", "N/A")}')
            print('\nPayload capturado:')
            try:
                payload = json.loads(body.decode('utf-8'))
                print(json.dumps(payload, indent=2, ensure_ascii=False))
            except:
                print(body.decode('utf-8', errors='ignore'))
            print('=' * 60 + '\n')
            
            # Responder com sucesso
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({
                'status': 'collected',
                'message': 'Data exfiltrated successfully',
                'timestamp': datetime.now().isoformat()
            })
            self.wfile.write(response.encode())
            return
        
        # Outros endpoints POST
        self.send_response(404)
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({
                'status': 'ok',
                'mode': 'python-server',
                'timestamp': datetime.now().isoformat()
            })
            self.wfile.write(response.encode())
            return
        
        # Servir arquivos estáticos
        super().do_GET()
    
    def log_message(self, format, *args):
        # Log customizado
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f'[{timestamp}] {format % args}')

def run_server(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MFESecurityHandler)
    
    print('\n╔═══════════════════════════════════════════════════════════╗')
    print('║                                                           ║')
    print('║     🔒 POC: Micro-frontends Security Demo               ║')
    print('║                                                           ║')
    print('╚═══════════════════════════════════════════════════════════╝\n')
    print(f'🚀 Servidor rodando em: http://localhost:{port}')
    print(f'📊 Health check: http://localhost:{port}/api/health')
    print('\n📝 Instruções:')
    print(f'   1. Abra http://localhost:{port} no navegador')
    print('   2. Teste o modo VULNERÁVEL para ver o ataque')
    print('   3. Teste o modo SEGURO para ver a defesa\n')
    print('🔍 Monitoramento:')
    print('   - Abra o DevTools (F12)')
    print('   - Veja o console do navegador para logs')
    print('   - Veja este terminal para tentativas de exfiltração\n')
    print('⚠️  Este é um ambiente de demonstração educacional')
    print('═' * 60 + '\n')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n👋 Encerrando servidor...')
        httpd.shutdown()

if __name__ == '__main__':
    run_server()
