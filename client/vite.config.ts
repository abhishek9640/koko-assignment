import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        // Redirect /admin to /admin/index.html
        {
            name: 'admin-redirect',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/admin') {
                        res.writeHead(302, { Location: '/admin/index.html' });
                        res.end();
                        return;
                    }
                    next();
                });
            },
        },
    ],
    server: {
        port: 5173,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
            },
        },
    },
});
