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
// 商场仪表盘脚本 <script> 部分
import { getMallDashboardApi } from '@/api/mall.js';
import authService from '@/store/authService'; // 引入 authService

export default {
    data() {
        return {
            dashboardData: { // 初始化期望的结构
                merchantCount: 0,       // 使用数字类型并给默认值
                productCount: 0,        // 使用数字类型并给默认值
                todayOrderCount: 0      // 使用数字类型并给默认值
            },
            loading: false,
            mallId: null, // 用于存储当前商场的ID
        };
    },
    computed: {
        isAuthenticated() {
            return authService.isAuthenticated.value;
        },
        currentUser() {
            return authService.currentUser.value;
        }
    },
    onLoad(options) { // onLoad 比 created 更适合uni-app页面参数接收，但这里我们主要依赖currentUser
	console.log(this.currentUser);
        // 检查登录状态和用户信息
        if (!this.isAuthenticated || !this.currentUser || this.currentUser.role !== 'mall') {
            uni.showToast({ title: '请先以商场管理员身份登录', icon: 'none' });
            // 根据实际情况决定是否重定向到登录页
            // uni.reLaunch({ url: '/pages/common/login/index' });
            return;
        }

        // 从 currentUser 中获取 mallId
        if (this.currentUser && this.currentUser.mallId) {
            this.mallId = this.currentUser.mallId;
            this.fetchDashboardData();
        } else {
            this.loading = false; // 确保停止加载状态
            uni.showToast({ title: '无法获取商场信息，请重新登录', icon: 'none' });
            console.error("当前用户是商场角色，但未找到 mallId:", this.currentUser);
             // 可选: 退出登录或导航到错误页
             // authService.logout();
        }
    },
    methods: {
        async fetchDashboardData() {
            if (!this.mallId) { // 再次检查 mallId
                uni.showToast({ title: '商场ID缺失，无法加载数据', icon: 'none' });
                return;
            }
            this.loading = true;
            try {
                // 调用 API 时传入 mallId
                const res = await getMallDashboardApi(this.mallId);
                console.log("Dashboard API response:", res); // 调试API响应

                // 假设后端直接返回 MallStatistics 对象作为 res.data
                // 且 MallStatistics 包含 totalMerchants, totalProducts, todayOrderCount
                if (res && (res.code === 200 || res.success) && res.data) { // 根据实际的 Result 结构调整
                    // 注意后端返回的字段名可能与前端期望的不同，需要匹配
                    // 例如后端返回 totalMerchants，前端是 merchantCount
                    this.dashboardData = {
                        merchantCount: res.data.totalMerchants !== undefined ? res.data.totalMerchants : (res.data.merchantCount !== undefined ? res.data.merchantCount : 0),
                        productCount: res.data.totalProducts !== undefined ? res.data.totalProducts : (res.data.productCount !== undefined ? res.data.productCount : 0),
                        todayOrderCount: res.data.todayOrderCount !== undefined ? res.data.todayOrderCount : 0,
                    };
                } else {
                    uni.showToast({ title: (res && res.message) || '加载仪表盘数据失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误或请求失败', icon: 'none' });
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