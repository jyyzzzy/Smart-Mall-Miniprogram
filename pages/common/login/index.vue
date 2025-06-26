<template>
    <view class="container login-container">
        <view class="logo-section">
            <view class="app-title">欢迎登录</view>
        </view>

        <uni-forms ref="loginFormRef" :modelValue="loginForm" :rules="loginRules" class="form-section">
            <uni-forms-item label="用户名" name="username" label-width="70px">
                <uni-easyinput
                    type="text"
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    prefixIcon="person"
                />
            </uni-forms-item>
            <uni-forms-item label="密码" name="password" label-width="70px">
                <uni-easyinput
                    type="password"
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    prefixIcon="locked"
                />
            </uni-forms-item>
            <button type="primary" @click="handleLogin" :loading="loading" class="login-button">登录</button>
        </uni-forms>

        <view class="extra-links">
            <text @click="goToRegister" class="link-text">没有账号？去注册</text>
        </view>

        <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authService'

const auth = useAuthStore()

// 表单 & 校验
const loginForm = ref({ username: '', password: '' })
const loginRules = {
  username: { rules: [{ required: true, errorMessage: '请输入用户名' }] },
  password: { rules: [{ required: true, errorMessage: '请输入密码' }] }
}

const loading = ref(false)
const errorMessage = ref('')
const loginFormRef = ref(null)

/* ---------------- 提交 ---------------- */
const handleLogin = () => {
  loginFormRef.value.validate().then(async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const user = await auth.login(loginForm.value)      // Pinia action
      uni.showToast({ title: '登录成功', icon: 'success' })
      navigateToDashboard(user)
    } catch (e) {
      errorMessage.value = e.message || '登录失败，请稍后再试'
      uni.showToast({ title: errorMessage.value, icon: 'none' })
    } finally {
      loading.value = false
    }
  })
}

/* ---------------- 角色跳转 ---------------- */
function navigateToDashboard (user) {
  let url = ''
  switch (user.role) {
    case 'customer': url = '/pages/customer/index/index'; break
    case 'merchant': url = '/pages/merchant/dashboard/index'; break
    case 'admin'   : url = '/pages/admin/dashboard/index';    break
    case 'mall'    : url = '/pages/mall/dashboard/index';     break
    default        : uni.showToast({ title:'未知角色', icon:'none' })
  }
  if (url) uni.reLaunch({ url })
}

/* ---------------- 前往注册 ---------------- */
function goToRegister () {
  uni.navigateTo({ url: '/pages/common/register/index' })
}
</script>


<style lang="scss" scoped>
/* 与之前版本相同 */
.login-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}
.logo-section {
    margin-bottom: 30px;
    text-align: center;
    .app-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
    }
}
.form-section {
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.login-button {
    margin-top: 20px;
    width: 100%;
}
.extra-links {
    margin-top: 20px;
    display: flex;
    justify-content: center; /* 改为居中，因为只有一个链接 */
    width: 100%;
    max-width: 400px;
    font-size: 14px;
    .link-text {
        //color: $uni-color-primary; /* 确保 uni.scss 变量可用 */
        cursor: pointer;
    }
}
.error-message {
    //color: $uni-color-error; /* 确保 uni.scss 变量可用 */
    margin-top: 15px;
    text-align: center;
    width: 100%;
    max-width: 400px;
}
</style>