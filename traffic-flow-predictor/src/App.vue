<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/user-dashboard">User Dashboard</router-link> |
      <router-link to="/admin-dashboard">Admin Dashboard</router-link>
    </nav>

    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* 添加一些全局样式 */
nav {
  padding: 10px;
  background-color: #f5f5f5;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #42b983;
}
</style>
