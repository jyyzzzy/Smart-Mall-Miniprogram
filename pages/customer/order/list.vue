<template>
    <view class="order-list-container">
        <uni-nav-bar left-icon="back" title="我的订单" @clickLeft="goBack" :fixed="true" :status-bar="true"></uni-nav-bar>

        <view v-if="isLoading" class="loading-placeholder">
            <uni-load-more status="loading"></uni-load-more>
        </view>

        <template v-else-if="orderList.length > 0">
            <view v-for="(order, index) in orderList" :key="order.orderId || index" class="order-card" @click="goToOrderDetail(order.orderId)">
                <view class="order-header">
                    <text class="order-sn">订单号: {{ order.orderSn }}</text>
                    <text :class="['order-status', getStatusClass(order.status)]">{{ formatOrderStatus(order.status) }}</text>
                </view>

                <view v-if="order.items && order.items.length > 0" class="order-item-simple">
                    <view class="product-info">
                        <text class="product-name">{{ order.items[0].productName }}</text>
                        <text class="product-spec" v-if="order.items[0].specification">规格: {{ order.items[0].specification }}</text>
                        <text class="product-quantity">
                            共 {{ order.items.length }} 种商品
                            <text v-if="order.items.length > 1">等</text>
                        </text>
                    </view>
                </view>
                 <view v-else class="order-item-simple">
                    <view class="product-info">
                        <text class="product-name">订单商品信息缺失</text>
                    </view>
                </view>

                <view class="order-footer">
                    <text class="order-time">下单时间: {{ formatDate(order.createdAt, 'yyyy-MM-dd hh:mm') }}</text>
                    <view class="order-total">
                        <text>总金额: </text>
                        <text class="amount">¥{{ order.totalAmount.toFixed(2) }}</text>
                    </view>
                </view>
                <view class="order-actions">
                    <button v-if="canPay(order.status)" class="action-btn primary" size="mini" @click.stop="payOrder(order.orderId)">去支付</button>
                    <button v-if="canCancel(order.status)" class="action-btn" size="mini" @click.stop="cancelOrder(order.orderId)">取消订单</button>
                    <button class="action-btn view-detail-btn" size="mini" @click.stop="goToOrderDetail(order.orderId)">查看详情</button>
                </view>
            </view>
        </template>

        <view v-else class="empty-orders">
            <image class="empty-image" src="/static/images/empty_orders.png" mode="aspectFit"></image>
            <text class="empty-text">您还没有相关的订单</text>
            <button class="go-shopping-btn" type="primary" size="mini" @click="goShopping">去逛逛</button>
        </view>
    </view>
</template>

<script>
// 假设你有一个 getOrderListApi 方法在 api/customer.js
// import { getOrderListApi, cancelOrderApi, getPaymentParamsApi } from '@/api/customer.js';

export default {
    data() {
        return {
            isLoading: true,
            orderList: [],
            // 示例订单数据 (用于前端展示，移除了 productImage 字段)
            sampleOrderData: [
                {
                    orderId: 'order123456',
                    orderSn: 'SN202505300001',
                    status: 'PENDING_PAYMENT',
                    createdAt: '2025-05-30T10:30:00Z', // ISO 8601 格式的日期字符串
                    totalAmount: 299.00,
                    items: [
                        {
                            productId: 'prod001',
                            productName: '智能降噪耳机Pro',
                            quantity: 1,
                            unitPrice: 299.00,
                            specification: '黑色'
                        }
                    ]
                },
                {
                    orderId: 'order123457',
                    orderSn: 'SN202505290008',
                    status: 'PENDING_SHIPMENT',
                    createdAt: '2025-05-29T15:45:10Z',
                    totalAmount: 108.50,
                    items: [
                        {
                            productId: 'prod002',
                            productName: '便携咖啡手冲壶套装',
                            quantity: 1,
                            unitPrice: 89.00,
                            specification: '经典款'
                        },
                        {
                            productId: 'prod003',
                            productName: '精品咖啡豆 250g',
                            quantity: 1,
                            unitPrice: 19.50,
                            specification: '中度烘焙'
                        }
                    ]
                },
                 {
                    orderId: 'order123458',
                    orderSn: 'SN202505280015',
                    status: 'COMPLETED',
                    createdAt: '2025-05-28T09:12:30Z',
                    totalAmount: 899.00,
                    items: [
                        {
                            productId: 'prod004',
                            productName: '超薄高清笔记本电脑',
                            quantity: 1,
                            unitPrice: 899.00,
                            specification: '14英寸/银色'
                        }
                    ]
                },
                {
                    orderId: 'order123459',
                    orderSn: 'SN202505270023',
                    status: 'CANCELLED',
                    createdAt: '2025-05-27T18:05:00Z',
                    totalAmount: 79.80,
                    items: [
                        {
                            productId: 'prod005',
                            productName: '进口零食大礼包',
                            quantity: 2,
                            unitPrice: 39.90
                        }
                    ]
                }
            ]
        };
    },
    onLoad() {
        this.fetchOrders();
    },
    methods: {
        padLeftZero(str) {
            return ('00' + str).substr(str.length);
        },
        formatDate(dateInput, fmt) {
            if (!dateInput) return 'N/A';
            let date;
            if (typeof dateInput === 'string') {
                date = new Date(dateInput.replace('T', ' ').replace('Z', ''));
            } else if (dateInput instanceof Date) {
                date = dateInput;
            } else {
                return 'Invalid Date';
            }

            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            };
            for (let k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                    let str = o[k] + '';
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str));
                }
            }
            return fmt;
        },
        async fetchOrders() {
            this.isLoading = true;
            try {
                // **使用示例数据替代API调用**
                await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
                this.orderList = JSON.parse(JSON.stringify(this.sampleOrderData));

            } catch (error) {
                console.error("Error fetching orders:", error);
                uni.showToast({ title: '加载订单异常', icon: 'none' });
                this.orderList = [];
            } finally {
                this.isLoading = false;
            }
        },
        formatOrderStatus(status) {
            const statusMap = {
                PENDING_PAYMENT: '待支付',
                PENDING_SHIPMENT: '待发货',
                SHIPPED: '已发货',
                COMPLETED: '已完成',
                CANCELLED: '已取消',
                REFUNDING: '退款中',
                REFUNDED: '已退款'
            };
            return statusMap[status] || '未知状态';
        },
        getStatusClass(status) {
            const classMap = {
                PENDING_PAYMENT: 'status-pending-payment',
                PENDING_SHIPMENT: 'status-pending-shipment',
                SHIPPED: 'status-shipped',
                COMPLETED: 'status-completed',
                CANCELLED: 'status-cancelled',
            };
            return classMap[status] || 'status-unknown';
        },
        goToOrderDetail(orderId) {
            if (!orderId) return;
            // 实际项目中，订单详情页也需要做类似的处理以实现独立运行
            uni.navigateTo({
                url: `/pages/customer/order/detail?orderId=${orderId}`
            });
        },
        goBack() {
            uni.navigateBack();
        },
        goShopping() {
            uni.switchTab({
                url: '/pages/customer/index/index'
            });
        },
        canPay(status) {
            return status === 'PENDING_PAYMENT';
        },
        canCancel(status) {
            return status === 'PENDING_PAYMENT';
        },
        async payOrder(orderId) {
            uni.showLoading({ title: '正在准备支付...' });
            try {
                console.log(`模拟支付订单: ${orderId}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟支付API调用
                uni.hideLoading();
                uni.showToast({ title: `模拟支付订单 ${orderId} 成功`, icon: 'success' });
                // 更新本地订单状态
                const order = this.orderList.find(o => o.orderId === orderId);
                if (order) {
                    order.status = 'PENDING_SHIPMENT';
                }
            } catch (error) {
                uni.hideLoading();
                uni.showToast({ title: '支付请求异常 (模拟)', icon: 'none' });
            }
        },
        async cancelOrder(orderId) {
            const confirm = await new Promise(resolve => {
                uni.showModal({
                    title: '确认取消',
                    content: '您确定要取消这个订单吗？',
                    success: (res) => resolve(res.confirm)
                });
            });

            if (confirm) {
                uni.showLoading({ title: '正在取消...' });
                try {
                    console.log(`模拟取消订单: ${orderId}`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟取消API调用
                    uni.hideLoading();
                    uni.showToast({ title: '订单已取消 (模拟)', icon: 'success' });
                     // 更新本地订单状态
                    const order = this.orderList.find(o => o.orderId === orderId);
                    if (order) {
                        order.status = 'CANCELLED';
                    }
                } catch (error) {
                    uni.hideLoading();
                    uni.showToast({ title: '取消订单异常 (模拟)', icon: 'none' });
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.order-list-container {
    background-color: #f8f8f8;
    min-height: 100vh;
    padding-bottom: 20rpx;
}

.loading-placeholder {
    padding-top: 100rpx;
}

.order-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;

    .order-sn {
        font-size: 26rpx;
        color: #666;
    }

    .order-status {
        font-size: 26rpx;
        font-weight: bold;
    }
}

.order-item-simple {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .product-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;

        .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .product-spec {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 4rpx;
        }
        .product-quantity {
            font-size: 24rpx;
            color: #999;
        }
    }
}

.order-footer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 16rpx;
    border-top: 1rpx solid #eee;
    margin-bottom: 20rpx;

    .order-time {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
        width: 100%; // 让时间显示在左侧
    }

    .order-total {
        font-size: 28rpx;
        color: #333;

        .amount {
            font-weight: bold;
            color: #ff5000;
            font-size: 32rpx;
        }
    }
}

.order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx; // 按钮之间的间隙

    .action-btn {
        font-size: 24rpx;
        padding: 0 20rpx; // 调整内边距让按钮更紧凑
        height: 56rpx; // 按钮高度
        line-height: 56rpx; // 使文字垂直居中
        border-radius: 28rpx; // 圆角
        background-color: #fff;
        color: #333;
        border: 1rpx solid #ccc;
        // 移除默认的 margin
        margin-left: 0;
        margin-right: 0;

        // 主按钮样式
        &.primary {
            background-color: #ff5000; // 主题橙色
            color: #fff;
            border-color: #ff5000;
        }

        // 查看详情按钮可以有特定样式，如果需要的话
        // &.view-detail-btn {}
    }
}

.empty-orders {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;

    .empty-image {
        width: 280rpx;
        height: 280rpx;
        margin-bottom: 30rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 40rpx;
    }
    .go-shopping-btn {
        // 主题色，或根据您的设计调整
        // background-color: $uni-color-primary;
        // color: #fff;
        border-radius: 30rpx;
        // padding: 10rpx 40rpx;
    }
}

// 订单状态颜色
.status-pending-payment { color: #ff9900; } // 橙色 - 待支付
.status-pending-shipment { color: #1890ff; } // 蓝色 - 待发货/处理中
.status-shipped { color: #52c41a; } // 绿色 - 已发货
.status-completed { color: #8c8c8c; } // 深灰色 - 已完成
.status-cancelled { color: #bfbfbf; } // 浅灰色 - 已取消
.status-unknown { color: #333; } // 默认黑色 - 未知状态
</style>