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

<script>
import authService from '@/store/authService'; // 引入 AuthService

export default {
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
            },
            loginRules: { // uni-forms 校验规则
                username: {
                    rules: [{ required: true, errorMessage: '请输入用户名' }],
                },
                password: {
                    rules: [{ required: true, errorMessage: '请输入密码' }],
                },
            },
            loading: false,
            errorMessage: '',
        };
    },
    methods: {
        handleLogin() {
            this.$refs.loginFormRef.validate().then(async (res) => { // uni-forms 校验
                this.loading = true;
                this.errorMessage = '';
                try {
                    const data = await authService.login(this.loginForm); // 使用 authService
					//console.log(data);
					console.log(data)
					const user = data.data;
					//console.log(user);
                    uni.showToast({ title: '登录成功', icon: 'success' });
                    this.navigateToDashboard(user.role);
                } catch (error) {
                    this.errorMessage = typeof error === 'string' ? error : (error.message || '登录失败，请稍后再试');
                    uni.showToast({ title: this.errorMessage, icon: 'none' });
                } finally {
                    this.loading = false;
                }
            }).catch(err => {
                console.log('表单校验失败：', err);
				console.log(this.loginForm);
            });
        },
        navigateToDashboard(role) {
            // ... (与之前版本相同)
            let url = ''; // 默认
			//console.log(role);
            if (role === 'customer') {
                url = '/pages/customer/index/index';
            } else if (role === 'merchant') {
                url = '/pages/merchant/dashboard/index';
            } else if (role === 'admin') {
                url = '/pages/admin/dashboard/index';
            } else if (role === 'mall') {
                url = '/pages/mall/dashboard/index';
            }
			//console.log(url);
            uni.reLaunch({ url });
        },
        goToRegister() {
            uni.navigateTo({
                url: '/pages/common/register/register',
            });
        },
    },
};
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