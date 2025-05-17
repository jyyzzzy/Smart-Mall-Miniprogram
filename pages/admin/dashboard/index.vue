<template>
    <view class="container dashboard-container">
        <uni-notice-bar v-if="pageCurrentUser" single :text="`欢迎您回来，${pageCurrentUser.name} (${pageUserRole})！`" />
        <view class="title">管理员首页</view>
        <view class="content-placeholder">
            <uni-tag text="热门商品" type="error" :circle="true"></uni-tag>
            <uni-tag text="我的订单" type="primary" :circle="true" style="margin-left: 10px;"></uni-tag>
            <text>这里是管理员可以看到的内容区域...</text>
        </view>
        <button @click="logoutUser" type="warn" class="logout-button">退出登录</button>
    </view>
</template>

<script>
import authService from '@/store/authService'; // 引入 AuthService

export default {
    // 在 Options API 中，要使 authService 的响应式数据在模板中可用，
    // 可以通过 computed 属性或将其部分内容挂载到 data 中。
    // 这里使用 computed 更符合 Vue 的模式。
    computed: {
        pageIsAuthenticated() {
            return authService.isAuthenticated.value; // 注意访问 .value
        },
        pageCurrentUser() {
            return authService.currentUser.value; // 注意访问 .value
        },
        pageUserRole() {
            return authService.userRole.value; // 注意访问 .value
        }
    },
    methods: {
        logoutUser() {
            authService.logout(); // authService.logout 内部已包含跳转逻辑
        }
    },
    onShow() {
        // 页面显示时检查认证状态
        if (!this.pageIsAuthenticated) { // 使用计算属性
            uni.reLaunch({ url: '/pages/common/login/login' });
        } else {
            console.log('当前用户 (顾客首页):', this.pageCurrentUser?.name, '角色:', this.pageUserRole);
        }
    }
}
</script>

<style lang="scss" scoped>
/* 与之前版本相同 */
.dashboard-container {
    padding: 15px;
    text-align: center;
}
.title {
    font-size: 22px;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 20px;
    color: #333;
}
.content-placeholder {
    margin: 20px 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    text-align: left;
    color: #666;
}
.logout-button {
    margin-top: 30px;
    width: 80%;
    max-width: 300px;
}
</style>