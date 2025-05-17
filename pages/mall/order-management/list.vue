<template>
    <view class="container">
        <uni-search-bar
            placeholder="搜索订单号/顾客/商户名称"
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
                         <view>商户: {{ order.merchantName }}</view>
                     </view>
                 </template>
                 <template v-slot:footer>
                    <view style="display: flex; flex-direction: column; align-items: flex-end;">
                         <text style="color: #FF5A5F; font-weight: bold;">￥{{ order.totalAmount.toFixed(2) }}</text>
                        <uni-tag :text="getOrderStatusText(order.status)" :type="getOrderStatusType(order.status)" size="small" style="margin-top: 5px;"/>
                    </view>
                </template>
            </uni-list-item>
        </uni-list>

        <view v-else-if="!loading && finished" class="empty-state">暂无订单信息</view>
        <uni-load-more :status="loading ? 'loading' : (finished ? 'noMore' : 'more')" />
    </view>
</template>

<script>
import { getMallOrdersApi } from '@/api/mall.js';
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
            // 可选：添加 status 筛选
            // selectedStatus: ''
        };
    },
    onLoad() {
        this.fetchOrders(true);
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    onReachBottom() {
        if (!this.loading && !this.finished) {
            this.page++;
            this.fetchOrders(false);
        }
    },
    onPullDownRefresh() {
        this.fetchOrders(true, () => {
             uni.stopPullDownRefresh();
        });
    },
    methods: {
        async fetchOrders(isRefresh = false, callback = null) {
            if (this.loading) return;
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
                // status: this.selectedStatus || undefined
            };

            try {
                const res = await getMallOrdersApi(params);
                // 同样，需要根据你的 uni.$http 响应结构调整
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
                uni.showToast({ title: '网络错误，请稍后再试', icon: 'none' });
                console.error("fetchOrders error:", error);
                this.finished = true;
            } finally {
                this.loading = false;
                 if (callback && typeof callback === 'function') {
                    callback();
                }
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
                url: `/pages/mall/order-management/detail?id=${orderId}`
            });
        },
        // 辅助函数：根据订单状态返回文本
        getOrderStatusText(status) {
            const statusMap = {
                pending_payment: '待付款',
                processing: '处理中',
                shipped: '已发货',
                completed: '已完成',
                cancelled: '已取消',
                refunded: '已退款'
            };
            return statusMap[status] || status || '未知状态';
        },
        // 辅助函数：根据订单状态返回标签类型
        getOrderStatusType(status) {
             const typeMap = {
                pending_payment: 'warning',
                processing: 'primary',
                shipped: 'success',
                completed: 'success',
                cancelled: 'default',
                refunded: 'error'
            };
            return typeMap[status] || 'default';
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding-bottom: 10px;
}
.order-item-body {
    font-size: 13px;
    color: #666;
    margin-top: 5px; // 仅作为示例，uniListItem 内部可能有自己的布局
    view {
        margin-bottom: 3px;
    }
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>