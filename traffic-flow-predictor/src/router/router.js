import { createRouter, createWebHistory } from "vue-router"; // 使用 Vue Router 4 的新 API
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import UserDashboard from "../views/UserDashboard.vue"; // 更新路径
import AdminDashboard from "../views/AdminDashboard.vue"; // 更新路径
import TrafficAnalysis from "../components/TrafficAnalysis.vue"; // 仍然在components中
import NetworkOverview from "../views/NetworkOverview.vue"; // 更新路径
import PublicAuthentication from "../components/PublicAuthentication.vue"; // 假设这是PublicView的路径
import LoginPage from "../views/LoginPage.vue"; // 添加新的页面
import RegisterPage from "../views/RegisterPage.vue"; // 添加新的页面

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },

  {
    path: "/about",
    name: "About",
    component: AboutView,
  },
  {
    path: "/user-dashboard",
    name: "UserDashboard",
    component: UserDashboard,
  },
  {
    path: "/admin-dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
  },
  {
    path: "/traffic-analysis",
    name: "TrafficAnalysis",
    component: TrafficAnalysis,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
  },
  {
    path: "/network-overview",
    name: "NetworkOverview",
    component: NetworkOverview,
  },
  {
    path: "/public-authentication",
    name: "PublicAuthentication",
    component: PublicAuthentication,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
