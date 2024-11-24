const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false
  
})
module.exports = {
  configureWebpack: {
      resolve: {
          fallback: {
              "crypto": require.resolve("crypto-browserify"),
              "stream": require.resolve("stream-browserify"),
              "buffer": require.resolve("buffer"),
              "process": require.resolve("process/browser"),
              "util": require.resolve("util/"),  
              "assert": require.resolve("assert/"),
              "https": require.resolve("https-browserify"), 
              "http": require.resolve("stream-http"), 
              "tls": require.resolve("tls-browserify"),
              "net": require.resolve("net-browserify"),
              "url": require.resolve("url/"),
              "path": require.resolve("path-browserify"),
              "fs": require.resolve("browserify-fs"),
              "querystring": require.resolve("querystring-es3"),
              "zlib": false
              
          }
      },
      plugins: [
          new webpack.ProvidePlugin({
              Buffer: ['buffer', 'Buffer'],
              process: 'process/browser',
              util: ['util'],
              assert: 'assert/',
              http: 'stream-http', 
              https: 'https-browserify',  
              tls: 'tls-browserify', 
              net: 'net-browserify',
              url: 'url/' ,
              path: 'path-browserify',
              fs: 'browserify-fs',
              querystring: 'querystring-es3',
              zlib: 'browserify-zlib', 
          }),
      ]
  }
};


