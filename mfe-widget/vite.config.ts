import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'MfeWidget',
            fileName: 'mfe-widget',
            formats: ['es']
        },
        rollupOptions: {
            output: {
                entryFileNames: 'mfe-widget.js'
            }
        },
        outDir: '../public/mfes',
        emptyOutDir: false
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});
