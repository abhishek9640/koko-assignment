import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/sdk.tsx'),
            name: 'VetChatbot',
            fileName: () => 'chatbot.js',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
        cssCodeSplit: false,
        outDir: 'dist-sdk',
    },
});
