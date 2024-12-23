<template>
    <div class="login-container">
        <section class="hero-section" id="home">
            <div class="container">
                <div class="row align-items-center justify-content-center h-100">
                    <div class="col-md-6">
                        <div class="text-content">
                            <span class="welcome-message">Hello, Welcome</span>
                            <h1 class="main-title">算力网关融合平台</h1>
                            <p class="description">欢迎使用我们的平台。请登录以访问更多功能。</p>
                            <el-form :model="form" label-width="120px" class="login-form">
                                <el-form-item label="用户名">
                                    <el-input v-model="username" placeholder="请输入用户名" />
                                </el-form-item>
                                <el-form-item label="密码">
                                    <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="success" @click="login" class="login-button">登录</el-button>
                                    <span class="error-message">{{failmsg}}</span>
                                </el-form-item>
                            </el-form>
                            <div class="footer-text">
                                <p>还没有账户？ <a href="#" class="link">注册</a></p>
                                <p><a href="#" class="link">忘记密码？</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
export default {
    name: 'About',
    data() {
        return {
            username: '',
            password: '',
            failmsg: '',
            auth_map: '',
        }
    },
    methods: {
        login() {
            console.log(this.username, this.password)
            if (!this.auth_map.has(this.username)) {
                this.failmsg = '用户名错误'
            } else {
                if (this.auth_map.get(this.username) != this.password) {
                    this.failmsg = '密码错误'
                } else {
                    this.$emit('getLogin', true)
                    this.suc_msg()
                }
            }
        },
        suc_msg() {
            ElMessage({ message: '登录成功！', type: 'success' });
        },
    },
    created() {
        this.auth_map = new Map([['admin', 'admin']])
    }
}
</script>

<style scoped>
body {
    margin: 0;
    padding:0;
    height: 100vh; /* 设置为视口高度 */

    font-family: 'Arial', sans-serif;
}

.login-container {
    margin:0;
    padding:0;
    height: 100vh;
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    background-color: #2c3e50; /* 深蓝灰色背景 */
}

.hero-section {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; /* 100%宽度 */
}

.text-content {
    text-align: left;
    padding: 40px;
    background-color: #ecf0f1; /* 浅灰色背景 */
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3); /* 增加阴影 */
    border: 2px solid #3498db; /* 明亮的蓝色边框 */
    transition: transform 0.3s; /* 动画效果 */
}

.text-content:hover {
    transform: scale(1.02); /* 悬停放大效果 */
}

.welcome-message {
    font-size: 1.5rem;
    color: #34495e; /* 深灰蓝色 */
}

.main-title {
    color: #2980b9; /* 明亮的蓝色 */
    font-size: 2.5rem;
    margin: 10px 0;
    font-weight: 600;
}

.description {
    color: #7f8c8d; /* 中灰色 */
    margin-bottom: 20px;
}

.login-form {
    margin-top: 30px;
}

.el-form-item__label {
    color: #2980b9; /* 明亮的蓝色 */
}

.error-message {
    color: red;
    margin-top: 10px;
    display: block;
}

.login-button {
    width: 100%; /* 按钮宽度 */
    background-color: #3498db; /* 明亮的蓝色 */
    border: none; /* 去掉边框 */
    transition: background-color 0.3s, transform 0.2s; /* 动画效果 */
}

.login-button:hover {
    background-color: #2980b9; /* 悬停颜色 */
    transform: scale(1.05); /* 悬停放大效果 */
}

.footer-text {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #bdc3c7; /* 浅灰色 */
}

.link {
    color: #3498db; /* 明亮的蓝色 */
    text-decoration: none; /* 去掉下划线 */
}

.link:hover {
    text-decoration: underline; /* 悬停时出现下划线 */
}
</style>