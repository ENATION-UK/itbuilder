const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { VitePlugin } = require('@electron-forge/plugin-vite');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    new VitePlugin({
      renderer: [
        {
          config: "vite.config.ts", // 设置 Vite 配置文件路径
          build: false, // 不构建渲染进程
        },
      ],
      build: [
        {
          outDir: 'dist/main', // 指定构建输出目录（示例）
          target: 'electron-main', // 确保主进程的目标是 electron
          minify: true, // 构建时启用压缩
        },
      ],
    }),
  ],
};
