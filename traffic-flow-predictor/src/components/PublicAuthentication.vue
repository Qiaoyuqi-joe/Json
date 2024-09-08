<template>
  <div class="auth-container">
    <!-- 用户登录表单 -->
    <form @submit.prevent="handleUserLogin">
      <h2>用户登录</h2>
      <input v-model="userLogin.username" placeholder="用户名" />
      <input v-model="userLogin.password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>

    <!-- 管理员登录表单 -->
    <form @submit.prevent="handleAdminLogin">
      <h2>管理员登录</h2>
      <input v-model="adminLogin.username" placeholder="管理员用户名" />
      <input
        v-model="adminLogin.password"
        type="password"
        placeholder="管理员密码"
      />
      <button type="submit">登录</button>
    </form>

    <!-- 用户注册表单 -->
    <form @submit.prevent="handleUserRegister">
      <h2>用户注册</h2>
      <input v-model="userRegister.username" placeholder="用户名" />
      <input
        v-model="userRegister.password"
        type="password"
        placeholder="密码"
      />
      <input v-model="userRegister.email" type="email" placeholder="邮箱" />
      <button type="submit">注册</button>
    </form>

    <!-- 管理员注册表单 -->
    <form @submit.prevent="handleAdminRegister">
      <h2>管理员注册</h2>
      <input v-model="adminRegister.username" placeholder="管理员用户名" />
      <input
        v-model="adminRegister.password"
        type="password"
        placeholder="管理员密码"
      />
      <input
        v-model="adminRegister.email"
        type="email"
        placeholder="管理员邮箱"
      />
      <button type="submit">注册</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userLogin: { username: "", password: "" },
      adminLogin: { username: "", password: "" },
      userRegister: { username: "", password: "", email: "" },
      adminRegister: { username: "", password: "", email: "" },
    };
  },
  methods: {
    handleUserLogin() {
      // 处理用户登录逻辑
      console.log("User Login", this.userLogin);
    },
    handleAdminLogin() {
      // 处理管理员登录逻辑
      console.log("Admin Login", this.adminLogin);
    },
    handleUserRegister() {
      // 处理用户注册逻辑
      console.log("User Register", this.userRegister);
    },
    handleAdminRegister() {
      // 处理管理员注册逻辑
      console.log("Admin Register", this.adminRegister);
    },
  },
};
</script>

<style scoped>
.auth-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
