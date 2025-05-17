<template>
    <view class="container register-container">
        <view class="app-title">创建您的账户</view>

        <uni-forms ref="registerFormRef" :modelValue="registerForm" :rules="registerRules" class="form-section">
            <uni-forms-item label="用户名" name="username" label-width="80px">
                <uni-easyinput
                    type="text"
                    v-model="registerForm.username"
                    placeholder="请输入用户名"
                    prefixIcon="person"
                />
            </uni-forms-item>
            <uni-forms-item label="密码" name="password" label-width="80px">
                <uni-easyinput
                    type="password"
                    v-model="registerForm.password"
                    placeholder="请输入密码"
                    prefixIcon="locked"
                />
            </uni-forms-item>
            <uni-forms-item label="确认密码" name="confirmPassword" label-width="80px">
                <uni-easyinput
                    type="password"
                    v-model="registerForm.confirmPassword"
                    placeholder="请再次输入密码"
                    prefixIcon="locked"
                />
            </uni-forms-item>
            <uni-forms-item label="选择角色" name="role" label-width="80px">
                <uni-data-select
                    v-model="registerForm.role"
                    :localdata="roleOptions"
                    placeholder="请选择注册角色"
                ></uni-data-select>
            </uni-forms-item>
            <button type="primary" @click="handleRegister" :loading="loading" class="register-button">注册</button>
        </uni-forms>

        <view class="extra-links">
            <text @click="goToLogin" class="link-text">已有账号？直接登录</text>
        </view>

        <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
    </view>
</template>

<script>
import authService from '@/store/authService'; // 引入 AuthService

export default {
    data() {
        const validatePass = (rule, value, data, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.registerForm.password) { // 确保能访问到 this.registerForm.password
                callback(new Error('两次输入的密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            registerForm: {
                username: '',
                password: '',
                confirmPassword: '',
                role: null,
            },
            roleOptions: [
                { value: 'customer', text: '顾客' },
                { value: 'merchant', text: '商户' },
            ],
            registerRules: { // uni-forms 校验规则
                username: {
                    rules: [{ required: true, errorMessage: '请输入用户名' }],
                },
                password: {
                    rules: [{ required: true, errorMessage: '请输入密码' },
                            { minLength: 6, errorMessage: '密码长度至少为6位' }],
                },
                confirmPassword: {
                    rules: [{ required: true, errorMessage: '请再次输入密码' },
                            { validateFunction: validatePass.bind(this) }] // 绑定 this
                },
                role: {
                    rules: [{ required: true, errorMessage: '请选择角色' }],
                },
            },
            loading: false,
            errorMessage: '',
        };
    },
    methods: {
        handleRegister() {
            this.$refs.registerFormRef.validate().then(async (res) => { // uni-forms 校验
                this.loading = true;
                this.errorMessage = '';
                try {
                    const { confirmPassword, ...payload } = this.registerForm;
                    const data = await authService.register(payload); // 使用 authService
					if(data.code===200)
					{
						uni.showToast({ title: '注册成功', icon: 'success' });
					}
                    else{
						uni.showToast({ title: '注册失败', icon: 'error' });
					}
                    //this.navigateToDashboard(user.role);
                } catch (error) {
                    this.errorMessage = typeof error === 'string' ? error : (error.message || '注册失败，请稍后再试');
                    uni.showToast({ title: this.errorMessage, icon: 'none' });
                } finally {
                    this.loading = false;
                }
            }).catch(err => {
                console.log('表单校验失败：', err);
            });
        },
        navigateToDashboard(role) {
            // ... (与之前版本相同)
            let url = '/pages/customer/index/index';
            if (role === 'customer') {
                url = '/pages/customer/index/index';
            } else if (role === 'merchant') {
                url = 'pages/merchant/dashboard/index';
            }
            uni.reLaunch({ url });
        },
        goToLogin() {
            uni.navigateTo({
                url: '/pages/common/login/login',
            });
        },
    },
};
</script>

<style lang="scss" scoped>
/* 与之前版本相同 */
.register-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}
.app-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
}
.form-section {
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.register-button {
    margin-top: 20px;
    width: 100%;
}
.extra-links {
    margin-top: 20px;
    text-align: center;
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