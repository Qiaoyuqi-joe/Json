<template>
  <div class="register">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">用户名:</label>
        <input type="text" v-model="username" id="username" required />
      </div>
      <div>
        <label for="email">邮箱:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div>
        <label for="password">密码:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit">注册</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
    };
  },
  methods: {
    handleRegister() {
      // 处理注册逻辑，这里可以调用API
      console.log("注册中", this.username, this.email, this.password);
    },
  },
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
