<template>
  <div class="register-form">
    <h2>注册</h2>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input v-model="email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="username">用户名</label>
        <input v-model="username" type="text" id="username" required />
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input v-model="password" type="password" id="password" required />
      </div>

      <button type="submit" class="btn">注册</button>
      <p class="switch-form">
        已经有账户？<a @click="switchToLogin">去登录</a>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  name: "RegisterForm",
  data() {
    return {
      email: "",
      username: "",
      password: "",
    };
  },
  methods: {
    onSubmit() {
      // 处理注册逻辑，例如向后端发送请求
      console.log("注册信息:", this.email, this.username, this.password);
    },
    switchToLogin() {
      this.$emit("switch-form", "login");
    },
  },
};
</script>

<style scoped>
.register-form {
  width: 300px;
  margin: 100px auto;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.btn {
  width: 100%;
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.switch-form {
  margin-top: 10px;
  text-align: center;
}

.switch-form a {
  color: #4caf50;
  cursor: pointer;
}
</style>
