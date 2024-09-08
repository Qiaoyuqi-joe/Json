const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin("feature-flags").tap((args) => {
      args[0].__VUE_OPTIONS_API__ = true; // 启用 Vue 选项 API
      args[0].__VUE_PROD_DEVTOOLS__ = false; // 禁用生产环境中的开发工具
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false; // 禁用生产环境中的 hydration 错误详细信息
      return args;
    });
  },
});
