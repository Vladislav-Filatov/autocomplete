import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true,
        port: 5173,
        hmr: {
            protocol: 'ws',
            host: '127.0.0.1',
            clientPort: 5173,
        },
    },
});