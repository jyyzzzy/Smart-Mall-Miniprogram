<template>
    <view class="container">
        <view v-if="orderDetail">
            <uni-section title="订单信息" type="line">
                <uni-list :border="false">
                    <uni-list-item title="订单号" :rightText="orderDetail.id" />
                    <uni-list-item title="订单状态">
                        <template v-slot:footer>
                            <uni-tag :text="getOrderStatusText(orderDetail.status)" :type="getOrderStatusType(orderDetail.status)" size="small"/>
                        </template>
                    </uni-list-item>
                    <uni-list-item title="下单时间" :rightText="orderDetail.date" />
                     </uni-list>
            </uni-section>

            <uni-section title="顾客信息" type="line">
                 <uni-list :border="false">
                     <uni-list-item title="顾客昵称" :rightText="orderDetail.customerName" />
                      </uni-list>
            </uni-section>

             <uni-section title="商户信息" type="line">
                 <uni-list :border="false">
                     <uni-list-item title="负责商户" :rightText="orderDetail.merchantName" />
                     </uni-list>
            </uni-section>

            <uni-section title="商品列表" type="line">
                <view v-for="item in orderDetail.items" :key="item.productId" class="product-item">
                     <view class="product-info">
                         <view class="name">{{ item.name }}</view>
                         <view class="spec">规格: (暂无)</view> </view>
                     <view class="price-qty">
                         <view>x {{ item.quantity }}</view>
                         <view class="price">￥{{ item.price.toFixed(2) }}</view>
                     </view>
                </view>
            </uni-section>

            <uni-section title="价格明细" type="line">
                 <uni-list :border="false">
                    <uni-list-item title="订单总额">
                         <template v-slot:footer>
                            <text style="color: #FF5A5F; font-weight: bold;">￥{{ orderDetail.totalAmount.toFixed(2) }}</text>
                        </template>
                    </uni-list-item>
                 </uni-list>
            </uni-section>

             </view>
        <view v-else-if="!loading" class="empty-state">未找到订单信息</view>
        <uni-load-more :status="loading ? 'loading' : 'noMore'" />
    </view>
</template>

<script>
import { getMallOrderDetailApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            orderId: null,
            orderDetail: null,
            loading: false,
        };
    },
    onLoad(options) {
        if (options.id) {
            this.orderId = options.id;
            this.fetchOrderDetail();
        } else {
             uni.showToast({ title: '缺少订单ID', icon: 'none' });
             uni.navigateBack();
        }
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    methods: {
        async fetchOrderDetail() {
            this.loading = true;
            try {
                const res = await getMallOrderDetailApi(this.orderId);
                // 根据你的 uni.$http 响应结构调整
                if (res && res.data) {
                    this.orderDetail = res.data;
                } else if (res && res.success === false) {
                    uni.showToast({ title: res.message || '加载详情失败', icon: 'none' });
                } else {
                     uni.showToast({ title: '未找到订单数据', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
                console.error("fetchOrderDetail error:", error);
            } finally {
                this.loading = false;
            }
        },
         // 复制订单列表页的辅助函数
        getOrderStatusText(status) {
            const statusMap = { /* ... (同上) ... */ };
            return statusMap[status] || status || '未知状态';
        },
        getOrderStatusType(status) {
             const typeMap = { /* ... (同上) ... */ };
            return typeMap[status] || 'default';
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px 0; // 使用 section 自带的 padding
    background-color: #f8f8f8;
}
.product-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #fff; // 商品项背景设为白色，在 section 内
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
    .product-info {
        flex: 1;
        margin-right: 10px;
        .name {
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
        }
        .spec {
            font-size: 12px;
            color: #999;
        }
    }
    .price-qty {
        text-align: right;
        font-size: 12px;
        color: #666;
        .price {
            font-size: 14px;
            color: #333;
            margin-top: 5px;
        }
    }
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
// 为 uni-list-item 的 rightText 添加样式 (如果需要)
::v-deep .uni-list-item__content-title {
    // font-weight: bold; // 例如
}
::v-deep .uni-list-item__extra-text {
    // color: #333; // 例如
}
</style>