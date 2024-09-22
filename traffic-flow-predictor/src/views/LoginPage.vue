<template>
  <div class="login-form">
    <h2>登录</h2>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input v-model="email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input v-model="password" type="password" id="password" required />
      </div>

      <button type="submit" class="btn">登录</button>
      <p class="switch-form">
        还没有账户？<a @click="switchToRegister">去注册</a>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    onSubmit() {
      // 处理登录逻辑，例如向后端发送请求
      console.log("登录信息:", this.email, this.password);
    },
    switchToRegister() {
      this.$emit("switch-form", "register");
    },
  },
};
</script>

<style scoped>
.login-form {
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
