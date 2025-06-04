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
            this.$refs.loginFormRef.validate().then(async (res) => {
                this.loading = true;
                this.errorMessage = '';
                try {
                    const response = await authService.login(this.loginForm); // 使用 authService
                    // 假设 authService.login 内部处理了响应，并返回了包含用户信息的对象
                    // 或者 authService.login 内部已经更新了 currentUser

                    // 直接从 authService 获取最新的 currentUser，确保数据是最新的
                    const user = authService.currentUser.value.data;

                    if (user && user.role) { // 确保 user 和 role 存在
                        uni.showToast({ title: '登录成功', icon: 'success' });
                        this.navigateToDashboard(user); // 传递整个 user 对象或至少 role 和 mallId
                    } else {
                         // 如果 authService.login 内部未更新 currentUser，
                         // 或者返回的 response.data 是 user 对象：
                         // const loggedInUser = response.data; // 假设 response.data 是用户对象
                         // if (loggedInUser && loggedInUser.role) {
                         //    uni.showToast({ title: '登录成功', icon: 'success' });
                         //    this.navigateToDashboard(loggedInUser);
                         // } else {
                         //    throw new Error('登录成功，但无法获取用户信息或角色');
                         // }
                        console.error("登录后未能获取有效的用户信息:", user);
                        this.errorMessage = '登录成功，但用户信息不完整';
                        uni.showToast({ title: this.errorMessage, icon: 'none' });
                    }
                } catch (error) {
                    this.errorMessage = typeof error === 'string' ? error : (error.message || '登录失败，请稍后再试');
                    uni.showToast({ title: this.errorMessage, icon: 'none' });
                } finally {
                    this.loading = false;
                }
            }).catch(err => {
                // console.log('表单校验失败：', err);
            });
        },
        navigateToDashboard(user) { // 接收 user 对象
            let url = '';
            // 确保 authService 中 currentUser 已经更新并包含 mallId (如果角色是 'mall')
            // 如果 mallId 需要作为路由参数传递（虽然下面仪表盘脚本未使用路由参数获取mallId）：
            if (user.role === 'customer') {
                url = '/pages/customer/index/index';
            } else if (user.role === 'merchant') {
                url = '/pages/merchant/dashboard/index';
                // 可选: if (user.merchantId) url += `?merchantId=${user.merchantId}`;
            } else if (user.role === 'admin') {
                url = '/pages/admin/dashboard/index';
            } else if (user.role === 'mall') {
                url = '/pages/mall/dashboard/index';
                // 如果需要通过路由参数传递 mallId (虽然当前仪表盘脚本未使用此方式)
                // if (user.mallId) {
                //     url += `?mallId=${user.mallId}`;
                // } else {
                //     console.warn("商场用户登录，但未找到 mallId");
                //     uni.showToast({ title: '商场信息不完整，部分功能可能受限', icon: 'none' });
                // }
            }
            console.log("导航至:", url, "用户信息:", user);
            if (url) {
                uni.reLaunch({ url });
            } else {
                uni.showToast({ title: '无法确定导航页面，角色未知', icon: 'none' });
            }
        },
        goToRegister() {
            uni.navigateTo({
                url: '/pages/common/register/index',
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