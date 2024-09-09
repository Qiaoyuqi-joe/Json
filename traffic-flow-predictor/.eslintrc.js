module.exports = {
  root: true,
  env: {
    node: true,
    browser: true, // 添加浏览器环境，确保Vue项目可以正常解析
  },
  extends: [
    "plugin:vue/vue3-essential", // Vue 3 适配
    "eslint:recommended",
    "prettier", // 配置 prettier 以关闭 ESLint 中的格式规则
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false, // Babel 配置禁用
  },
  rules: {
    "vue/no-multiple-template-root": "off", // Vue 3 不需要这个限制
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
};
