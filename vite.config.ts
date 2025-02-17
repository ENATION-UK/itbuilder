import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [vue(),svgLoader()],
  base: './',
  root: './',
  build: {
    outDir: 'dist', // 输出目录，Electron 会在该目录下寻找构建文件
  }, 
   resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3001
  }
});