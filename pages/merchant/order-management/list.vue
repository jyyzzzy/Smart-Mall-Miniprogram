<template>
    <view class="container">
         <view v-if="!selectedMerchantId" class="header-tip">请先选择商户</view>
         <template v-else>
            <uni-search-bar
                placeholder="搜索订单号/顾客信息"
                @confirm="handleSearch"
                @cancel="handleCancelSearch"
                @clear="handleClearSearch"
            />

            <uni-list v-if="orderList.length > 0" :border="true">
                 <uni-list-item
                    v-for="order in orderList"
                    :key="order.id"
                    :title="`订单号: ${order.id}`"
                    :note="`下单时间: ${order.date}`"
                    showArrow
                    clickable
                    @click="goToDetail(order.id)"
                >
                    <template v-slot:body>
                         <view class="order-item-body">
                             <view>顾客: {{ order.customerName }}</view>
                             </view>
                     </template>
                     <template v-slot:footer>
                        <view style="display: flex; flex-direction: column; align-items: flex-end;">
                             <text style="color: #FF5A5F; font-weight: bold;">￥{{ (order.totalAmount ?? 0).toFixed(2) }}</text>
                            <uni-tag :text="getOrderStatusText(order.status)" :type="getOrderStatusType(order.status)" size="small" style="margin-top: 5px;"/>
                        </view>
                    </template>
                </uni-list-item>
            </uni-list>

             <view v-else-if="!loading && finished" class="empty-state">暂无订单</view>
            <uni-load-more :status="loading ? 'loading' : (finished ? 'noMore' : 'more')" />
         </template>
    </view>
</template>

<script>
import { getMerchantOrdersApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            orderList: [],
            loading: false,
            finished: false,
            searchKeyword: '',
            page: 1,
            pageSize: 10,
            // filterStatus: '', // 筛选状态
        };
    },
     computed: {
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        }
    },
     watch: {
         selectedMerchantId(newId, oldId) {
            if (newId && newId !== oldId) {
                 this.fetchOrders(true); // 切换商户时刷新列表
            } else if (!newId) {
                this.orderList = [];
                this.finished = true;
            }
        }
    },
     onLoad() {
        if (this.selectedMerchantId) {
            this.fetchOrders(true);
        }
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ url: '/pages/merchant/selection/index' });
        } else if (this.selectedMerchantId && this.orderList.length === 0 && !this.loading) {
             this.fetchOrders(true);
        }
        // 从详情页返回可能需要刷新状态，通过事件监听或标记
    },
     onReachBottom() {
        if (!this.loading && !this.finished && this.selectedMerchantId) {
            this.page++;
            this.fetchOrders(false);
        }
    },
    onPullDownRefresh() {
         if (this.selectedMerchantId) {
             this.fetchOrders(true, () => {
                uni.stopPullDownRefresh();
            });
         } else {
             uni.stopPullDownRefresh();
         }
    },
    methods: {
        async fetchOrders(isRefresh = false, callback = null) {
            if (!this.selectedMerchantId) {
                this.loading = false; this.finished = true; this.orderList = [];
                 if (callback) callback(); return;
            }
             if (this.loading && !isRefresh) return;
            this.loading = true;
            if (isRefresh) {
                this.page = 1;
                this.orderList = [];
                this.finished = false;
            }

            const params = {
                page: this.page,
                pageSize: this.pageSize,
                keyword: this.searchKeyword,
                // status: this.filterStatus || undefined,
            };

            try {
                // !! 调整数据提取路径 !!
                const res = await getMerchantOrdersApi(this.selectedMerchantId, params);
                if (res && Array.isArray(res.data)) {
                    if (res.data.length > 0) {
                         this.orderList = isRefresh ? res.data : [...this.orderList, ...res.data];
                    }
                     if (res.data.length < this.pageSize) {
                        this.finished = true;
                    }
                } else if (res && res.success === false) {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                    this.finished = true;
                } else {
                    this.finished = true;
                }
            } catch (error) {
                 uni.showToast({ title: '网络错误', icon: 'none' });
                 this.finished = true;
                 console.error("fetchOrders error:", error);
            } finally {
                this.loading = false;
                if (callback) callback();
            }
        },
        handleSearch(e) {
            this.searchKeyword = e.value;
            this.fetchOrders(true);
        },
        handleCancelSearch() {
            this.searchKeyword = '';
            this.fetchOrders(true);
        },
        handleClearSearch() {
             this.searchKeyword = '';
            this.fetchOrders(true);
        },
        goToDetail(orderId) {
            uni.navigateTo({
                url: `/pages/merchant/order-management/detail?id=${orderId}`
            });
        },
         // 复制辅助函数
        getOrderStatusText(status) {
             const statusMap = { pending_payment: '待付款', processing: '待发货', shipped: '已发货', completed: '已完成', cancelled: '已取消', refunded: '已退款' };
            return statusMap[status] || status || '未知';
        },
        getOrderStatusType(status) {
             const typeMap = { pending_payment: 'warning', processing: 'primary', shipped: 'success', completed: 'success', cancelled: 'default', refunded: 'error' };
            return typeMap[status] || 'default';
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding-bottom: 10px;
}
.header-tip {
    text-align: center; color: #999; padding: 30px;
}
.order-item-body {
    font-size: 13px; color: #666; margin-top: 5px;
    view { margin-bottom: 3px; }
}
.empty-state {
    text-align: center; color: #999; padding: 50px 0;
}
</style>