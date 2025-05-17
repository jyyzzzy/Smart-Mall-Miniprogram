<template>
    <view class="container">
        <view class="merchant-header" v-if="selectedMerchant">
            <image :src="selectedMerchant.logo || '/static/logo.png'" mode="aspectFill" class="merchant-logo"></image>
            <view class="merchant-info">
                <view class="merchant-name">{{ selectedMerchant.name }}</view>
                <text class="switch-merchant" @click="goToSelection">切换商户</text>
            </view>
        </view>
        <view v-else class="merchant-header">
             <text>未选择商户</text>
             <text class="switch-merchant" @click="goToSelection">去选择</text>
        </view>

         <uni-card v-if="selectedMerchantId" title="今日概览" margin="10px 0px" padding="10px">
             <view v-if="dashboardLoading" style="text-align: center; padding: 20px;"><uni-load-more status="loading"></uni-load-more></view>
             <uni-grid v-else :column="2" :show-border="false" :square="false">
                <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ typeof dashboardData.todayOrders === 'number' ? dashboardData.todayOrders : '0' }}</text>
                        <text class="label">新增订单</text>
                    </view>
                </uni-grid-item>
                 <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">￥{{ (typeof dashboardData.todaySales === 'number' ? dashboardData.todaySales : 0).toFixed(2) }}</text>
                        <text class="label">销售额</text>
                    </view>
                </uni-grid-item>
                  <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ typeof dashboardData.pendingOrders === 'number' ? dashboardData.pendingOrders : '0' }}</text>
                        <text class="label">待处理订单</text>
                    </view>
                </uni-grid-item>
                  <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ typeof dashboardData.activeProducts === 'number' ? dashboardData.activeProducts : '0' }}</text>
                        <text class="label">在售商品</text>
                    </view>
                </uni-grid-item>
            </uni-grid>
        </uni-card>

        <uni-section v-if="selectedMerchantId" title="常用功能" type="line" style="margin-top: 15px;">
             <uni-grid :column="3" :show-border="true" :square="false">
                  <uni-grid-item :index="0" @click="navigateTo('/pages/merchant/product-management/list')">
                     <view class="quick-link-box">
                        <uni-icons type="compose" size="26" color="#2979FF"></uni-icons>
                        <text class="label">商品管理</text>
                    </view>
                </uni-grid-item>
                  <uni-grid-item :index="1" @click="navigateTo('/pages/merchant/order-management/list')">
                     <view class="quick-link-box">
                        <uni-icons type="list" size="26" color="#2979FF"></uni-icons>
                        <text class="label">订单管理</text>
                    </view>
                </uni-grid-item>
                  <uni-grid-item :index="2" @click="navigateTo('/pages/merchant/profile/index')">
                     <view class="quick-link-box">
                        <uni-icons type="gear" size="26" color="#2979FF"></uni-icons>
                        <text class="label">店铺设置</text>
                    </view>
                </uni-grid-item>
                 <uni-grid-item :index="3" @click="navigateTo('/pages/merchant/mall/index')">
                     <view class="quick-link-box">
                        <uni-icons type="shop" size="26" color="#2979FF"></uni-icons>
                        <text class="label">商城关联</text>
                    </view>
                </uni-grid-item>
             </uni-grid>
        </uni-section>

         <button @click="logoutUser" type="warn" plain style="margin-top: 30px;">退出登录</button>
    </view>
</template>

<script>
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';
import { getMerchantDashboardApi } from '@/api/merchant.js';

export default {
    data() {
        return {
            dashboardData: {},
            dashboardLoading: false,
        };
    },
    computed: {
        selectedMerchantId() {
            // 直接从 context 获取，模板中用 .value
            return merchantContextService.context.selectedMerchantId;
        },
        selectedMerchant() {
            return merchantContextService.selectedMerchant.value; // 使用计算属性
        }
    },
    watch: {
        // 监听 selectedMerchantId 的变化，重新加载仪表盘数据
        selectedMerchantId(newId, oldId) {
            if (newId && newId !== oldId) {
                this.fetchDashboardData(newId);
            } else if (!newId) {
                this.dashboardData = {}; // 清空数据
            }
        }
    },
    onLoad() {
        // 页面加载时，如果已有选中 ID，则加载数据
        if (this.selectedMerchantId) {
            this.fetchDashboardData(this.selectedMerchantId);
        } else if (merchantContextService.context.initialized) {
            // 如果已初始化但没有选中商户，跳转到选择页
             this.goToSelection();
        }
        // 如果 context 还未初始化 (initialized=false)，等待 onShow 中的逻辑或 App.vue 中的加载
    },
    onShow() {
         if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
         }
         // 每次显示时检查是否选中了商户，如果没有且初始化已完成则跳转选择
         if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             this.goToSelection();
         } else if (this.selectedMerchantId && !this.dashboardData.todayOrders) {
             // 如果选中了商户但数据为空，可能需要重新加载
              this.fetchDashboardData(this.selectedMerchantId);
         }
    },
    methods: {
        async fetchDashboardData(merchantId) {
            if (!merchantId) return;
            this.dashboardLoading = true;
            try {
                // !! 调整数据提取路径 !!
                const res = await getMerchantDashboardApi(merchantId);
                if (res && res.data) {
                    this.dashboardData = res.data;
                } else {
                     this.dashboardData = {}; // 清空或显示错误
                     console.error("Failed to fetch dashboard data:", res?.message);
                }
            } catch (error) {
                 this.dashboardData = {};
                 console.error("Error fetching dashboard data:", error);
            } finally {
                this.dashboardLoading = false;
            }
        },
        navigateTo(url) {
             if (!this.selectedMerchantId) {
                 uni.showToast({ title: '请先选择要管理的商户', icon: 'none'});
                 this.goToSelection();
                 return;
             }
            uni.navigateTo({ url });
        },
        goToSelection() {
             uni.reLaunch({ // 使用 reLaunch 跳转到选择页，清空当前栈
                 url: '/pages/merchant/selection/index'
             });
        },
        logoutUser() {
            merchantContextService.clearMerchantContext();
            authService.logout();
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px;
}
.merchant-header {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    margin-bottom: 10px;
    border-radius: 5px;
    .merchant-logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 15px;
        border: 1px solid #eee;
    }
    .merchant-info {
        flex: 1;
        .merchant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
    }
    .switch-merchant {
        font-size: 12px;
        //color: $uni-color-primary;
        border: 1px solid;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
    }
}
.grid-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    .value {
        font-size: 18px;
        font-weight: bold;
        color: #333;
    }
    .label {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
    }
}
.quick-link-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
     .label {
        font-size: 12px;
        color: #333;
        margin-top: 5px;
    }
}
</style>