import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.tsx'),
            name: 'MfeDashboard',
            fileName: 'mfe-dashboard',
            formats: ['es']
        },
        rollupOptions: {
            // Não externaliza React - embute no bundle para isolamento
            output: {
                entryFileNames: 'mfe-dashboard.js'
            }
        },
        outDir: '../public/mfes',
        emptyOutDir: false
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});
