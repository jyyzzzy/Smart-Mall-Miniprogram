<template>
    <view class="container selection-container">
        <view class="page-title">选择要管理的商户</view>

        <view v-if="context.loading && !context.initialized" class="loading-state">
            <uni-load-more status="loading" />
        </view>

        <view v-else-if="!hasManagedMerchants && context.initialized" class="empty-state">
            <text>您还没有创建任何商户</text>
            <button type="primary" size="mini" @click="goToCreate" style="margin-top: 15px;">立即创建</button>
        </view>

        <uni-list v-else :border="true">
            <uni-list-chat
                v-for="merchant in context.managedMerchants"
                :key="merchant.id"
                :title="merchant.name"
                :avatar="merchant.logo || '/static/logo.png'"
                :note="merchant.category || '暂无分类'"
                clickable
                @click="selectAndEnter(merchant.id)"
            >
                 <view class="list-chat-badge-container">
                    <uni-tag :text="merchant.status || '状态未知'" type="primary" size="small" :circle="true" />
                 </view>
            </uni-list-chat>
             <view class="create-button-container">
                 <button type="default" plain size="mini" @click="goToCreate" icon="plusempty" style="margin-top: 20px;">创建新商户</button>
            </view>
        </uni-list>

         <button @click="logoutUser" type="warn" plain style="margin-top: 30px;">退出登录</button>

    </view>
</template>

<script>
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService'; // 用于退出

export default {
    data() {
        return {
            // 直接从 service 获取响应式状态
            context: merchantContextService.context,
        };
    },
    computed: {
        // 使用计算属性访问 service 的计算属性
        hasManagedMerchants() {
            return merchantContextService.hasManagedMerchants.value; // 注意 .value
        }
    },
    onLoad() {
        // 首次进入页面时加载商户列表
        // 或者这个逻辑可以放在 App.vue onLaunch 登录成功后
        if (!merchantContextService.context.initialized) {
             merchantContextService.loadManagedMerchants();
        }
    },
    onShow() {
        // 每次进入页面，检查是否需要重新加载列表（比如创建后返回）
        // 这里简化处理，也可以通过事件或特定逻辑触发刷新
         if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return; // 必须 return，防止未登录状态下继续执行
        }
         // 如果已初始化但列表为空，可能需要重新加载以防万一
         if(merchantContextService.context.initialized && !this.hasManagedMerchants) {
             merchantContextService.loadManagedMerchants();
         }

    },
    methods: {
        selectAndEnter(merchantId) {
            merchantContextService.setSelectedMerchant(merchantId);
            uni.reLaunch({ // 使用 reLaunch 或 redirectTo 进入主管理界面，避免返回选择页
                url: '/pages/merchant/dashboard/index'
            });
        },
        goToCreate() {
            uni.navigateTo({
                url: '/pages/merchant/create/index'
            });
        },
        logoutUser() {
            // 退出前可能需要清空商户上下文
            merchantContextService.clearMerchantContext();
            authService.logout();
        }
    }
}
</script>

<style lang="scss" scoped>
.selection-container {
    padding: 15px;
}
.page-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}
.loading-state, .empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
.list-chat-badge-container {
    /* uni-list-chat 的右侧插槽默认对齐方式可能需要调整 */
     display: flex;
     align-items: center; /* 垂直居中 */
     height: 100%; /* 可能需要确保容器有高度 */
}
.create-button-container {
    padding: 15px;
    text-align: center;
    background-color: #fff; // 如果列表有背景色
    border-top: 1px solid #eee; // 分隔线
}

/* 可能需要调整 uni-list-chat 内部样式让 badge 对齐 */
::v-deep .uni-list-chat__container {
    align-items: center;
}
::v-deep .uni-list-chat__header-warp {
     margin-right: 10px;
}
</style>