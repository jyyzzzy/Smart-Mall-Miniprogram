<template>
    <view class="container">
        <uni-card title="运营概览" margin="5px" padding="10px">
            <uni-grid :column="2" :show-border="false" :square="false">
                <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ dashboardData.merchantCount ?? '...' }}</text>
                        <text class="label">总商户数</text>
                    </view>
                </uni-grid-item>
                <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ dashboardData.pendingAuditCount ?? '...' }}</text>
                        <text class="label">待审核申请</text>
                    </view>
                </uni-grid-item>
                <uni-grid-item>
                    <view class="grid-item-box">
                        <text class="value">{{ dashboardData.productCount ?? '...' }}</text>
                        <text class="label">总商品数</text>
                    </view>
                </uni-grid-item>
                <uni-grid-item>
                     <view class="grid-item-box">
                        <text class="value">{{ dashboardData.todayOrderCount ?? '...' }}</text>
                        <text class="label">今日订单数</text>
                    </view>
                </uni-grid-item>
                 <uni-grid-item :index="4" @click="navigateTo('/pages/mall/order-management/list')">
                     <view class="grid-item-box link">
                        <uni-icons type="list" size="24" color="#2979FF"></uni-icons>
                        <text class="label">订单管理</text>
                    </view>
                </uni-grid-item>
                 <uni-grid-item :index="5" @click="navigateTo('/pages/mall/merchant-management/list')">
                     <view class="grid-item-box link">
                        <uni-icons type="shop" size="24" color="#2979FF"></uni-icons>
                        <text class="label">商户管理</text>
                    </view>
                </uni-grid-item>
            </uni-grid>
        </uni-card>

        <uni-section title="快捷入口" type="line" style="margin-top: 15px;">
             <uni-list>
                <uni-list-item title="商场资料设置" showArrow clickable @click="navigateTo('/pages/mall/profile/index')"></uni-list-item>
                <uni-list-item title="商户入驻审核" showArrow clickable @click="navigateTo('/pages/mall/merchant-management/audit')"></uni-list-item>
                <uni-list-item title="商品管理" showArrow clickable @click="navigateTo('/pages/mall/product-management/list')"></uni-list-item>
             </uni-list>
        </uni-section>
        <button @click="logoutUser" type="warn" style="margin-top: 30px;">退出登录</button>
    </view>
</template>

<script>
import { getMallDashboardApi } from '@/api/mall.js';
import authService from '@/store/authService'; // 引入用于退出登录

export default {
    data() {
        return {
            dashboardData: {
				merchantCount: '',
				productCount: '',
				todayOrderCount: ''
			},
            loading: false,
        };
    },
    computed: {
        // 用于模板中访问认证信息 (如果需要)
        isAuthenticated() {
            return authService.isAuthenticated.value;
        },
        currentUser() {
            return authService.currentUser.value;
        }
    },
    onLoad() {
        this.fetchDashboardData();
    },
    methods: {
        async fetchDashboardData() {
            this.loading = true;
            try {
                const res = await getMallDashboardApi();
                if (res.success) {
                    this.dashboardData = res.data;
                } else {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
                console.error("fetchDashboardData error:", error);
            } finally {
                this.loading = false;
            }
        },
        navigateTo(url) {
            uni.navigateTo({ url });
        },
        logoutUser() {
            authService.logout(); // 内部处理跳转
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px;
}
.grid-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    &.link {
         color: #2979FF;
         .label {
             margin-top: 5px;
              color: #2979FF;
         }
    }
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
</style>