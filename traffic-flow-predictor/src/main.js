import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";

createApp(App)
  .use(router) // 确保这里的 router 是已导入的
  .mount("#app");
