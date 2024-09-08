module.exports = {
  presets: [
    [
      "@vue/cli-plugin-babel/preset",
      {
        useBuiltIns: "usage", // 只包括应用程序中使用到的 polyfill
        corejs: 3, // 明确指定 core-js 版本
      },
    ],
  ],
};
