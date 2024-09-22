<template>
    <div>
      <login-form v-if="currentForm === 'login'" @switch-form="switchForm" />
      <register-form v-else @switch-form="switchForm" />
    </div>
  </template>
  
  <script>
  import LoginForm from "./LoginForm.vue";
  import RegisterForm from "./RegisterForm.vue";
  
  export default {
    name: "AuthPage",
    components: {
      LoginForm,
      RegisterForm,
    },
    data() {
      return {
        currentForm: "login", // 当前显示的表单，默认显示登录表单
      };
    },
    methods: {
      switchForm(form) {
        this.currentForm = form;
      },
    },
  };
  </script>
  
  <style>
  /* 你可以在这里添加全局样式 */
  </style>
  