import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router"; // 导入路由
import store from "./store/store"; // 导入 Vuex store

createApp(App)
  .use(router) // 使用路由
  .use(store) // 使用 Vuex store
  .mount("#app"); // 挂载应用
