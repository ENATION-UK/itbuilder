import { defineConfig } from 'vite';
import {resolve} from "path";
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader'


// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        vue(), svgLoader()
    ],
    base: './',
    root: resolve(__dirname, 'src/renderer'), // 指定 Vue 项目的根目录
    build: {
        outDir: resolve(__dirname, '.vite/renderer'), // 指定输出目录
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5173
    }
});
