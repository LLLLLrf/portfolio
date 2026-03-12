const { defineConfig } = require('@vue/cli-service');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
      },
      '/data': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'data',
            to: 'data',
            globOptions: {
              ignore: ['**/*.gitkeep']
            }
          }
        ]
      })
    ]
  }
});
