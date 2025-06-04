<template>
    <view class="container dashboard-container">
        <uni-notice-bar v-if="pageCurrentUser" single :text="`欢迎您回来，${pageCurrentUser.username} (${pageUserRole})！`" />
        <view class="title">管理员仪表盘</view>

        <view class="admin-functions-section">
            <view class="section-title">管理功能</view>
            <uni-list>
                <uni-list-item 
                    title="用户管理" 
                    showArrow 
                    clickable 
                    @click="navigateTo('/pages/admin/user-management/list')" />
                <uni-list-item 
                    title="商品管理" 
                    showArrow 
                    clickable 
                    @click="navigateTo('/pages/admin/product-management/index')" />
                <uni-list-item 
                    title="订单管理" 
                    showArrow 
                    clickable 
                    @click="navigateTo('/pages/admin/order-management/index')" />
                <uni-list-item 
                    title="内容管理" 
                    showArrow 
                    clickable 
                    @click="navigateTo('/pages/admin/content-management/index')" />
                <uni-list-item 
                    title="系统设置" 
                    showArrow 
                    clickable 
                    @click="navigateTo('/pages/admin/system-settings/index')" />
                </uni-list>
        </view>

        <view class="content-placeholder">
            <text>请从上方选择一项管理功能进行操作。</text>
        </view>

        <button @click="logoutUser" type="warn" class="logout-button">退出登录</button>
    </view>
</template>

<script>
import authService from '@/store/authService'; // 引入 AuthService

export default {
    computed: {
        pageIsAuthenticated() {
            return authService.isAuthenticated.value;
        },
        pageCurrentUser() {
            // 注意：之前代码中使用了 pageCurrentUser.name，但您的 User Domain 对象中是 username
            // 已将其修改为 pageCurrentUser.username 以匹配常见的用户对象结构。
            // 如果您的用户对象确实有 name 字段，请改回。
            return authService.currentUser.value;
        },
        pageUserRole() {
            return authService.userRole.value;
        }
    },
    methods: {
        logoutUser() {
            authService.logout();
        },
        navigateTo(url) {
            uni.navigateTo({ url });
        }
    },
    // onShow() {
    //     // 页面显示时检查认证状态
    //     if (!this.pageIsAuthenticated) {
    //         uni.reLaunch({ url: '/pages/common/login/login' });
    //     } else {
    //         // 确保 pageUserRole 是 'admin' 或您定义的管理员角色标识
    //         // 如果此页面严格限定为管理员，可以在这里添加额外的角色检查，
    //         // 例如： if (this.pageUserRole !== 'admin') { uni.reLaunch({ url: '/pages/common/forbidden/forbidden' }); }
    //         console.log('当前用户 (管理员仪表盘):', this.pageCurrentUser?.username, '角色:', this.pageUserRole);
    //     }
    // }
}
</script>

<style lang="scss" scoped>
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

.admin-functions-section {
    margin-bottom: 20px;
    .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #444;
        text-align: left;
        margin-bottom: 10px;
        padding-left: 5px; // Slight padding for the title
    }
    // uni-list-item 的样式可以通过 uni-list 的属性或 itemStyle 来调整
    // 也可以通过 ::v-deep 或 /deep/ (如果scss处理器支持) 来穿透修改内部样式，但不推荐除非必要
}

.content-placeholder {
    margin: 20px 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    text-align: center; // Center the instructional text
    color: #666;
    font-size: 14px;
}

.logout-button {
    margin-top: 30px;
    width: 80%;
    max-width: 300px;
}
</style>