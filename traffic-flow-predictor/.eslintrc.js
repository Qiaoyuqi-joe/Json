module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false, // 添加这行以禁用配置文件检查
  },
  rules: {
    "vue/no-multiple-template-root": "off", // 如果你在使用Vue 3，禁用多根元素检查
  },
};
