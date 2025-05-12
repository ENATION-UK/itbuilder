import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            external: ['hnswlib-node'], // 👈 关键配置：排除原生模块
        },
    },
});