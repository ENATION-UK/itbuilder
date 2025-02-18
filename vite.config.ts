import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader'
import {resolve} from 'path';

export default defineConfig({
    plugins: [vue(), svgLoader()],
    base: './',
    root: resolve(__dirname, 'src/renderer'), // 指定 Vue 项目的根目录
    build: {
        outDir: 'dist', // 输出目录，Electron 会在该目录下寻找构建文件
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src/renderer'), // 简化路径引用
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173
    },
    define: {
        'process.env.VITE_DEV_SERVER_URL': JSON.stringify('http://localhost:5173') // 替换为你的开发服务器 URL
    }
});