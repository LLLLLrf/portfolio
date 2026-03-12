const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      args[0].patterns.push({
        from: 'data',
        to: 'data',
        globOptions: {
          ignore: ['**/*.gitkeep']
        }
      });
      return args;
    });
  }
});
