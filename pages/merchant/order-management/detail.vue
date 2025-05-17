<template>
    <view class="container">
         <view v-if="!selectedMerchantId" class="header-tip">请先选择商户</view>
         <view v-else-if="loadingData" style="text-align: center; padding: 50px;">
             <uni-load-more status="loading"></uni-load-more>
         </view>
         <view v-else-if="orderDetail">
             <uni-section title="订单状态" type="line">
                <uni-list :border="false">
                    <uni-list-item title="当前状态">
                        <template v-slot:footer>
                           <uni-tag :text="getOrderStatusText(orderDetail.status)" :type="getOrderStatusType(orderDetail.status)" size="default"/>
                        </template>
                    </uni-list-item>
                    </uni-list>
            </uni-section>

            <uni-section title="订单信息" type="line">
                <uni-list :border="false">
                    <uni-list-item title="订单号" :rightText="orderDetail.id" :showArrow="false"/>
                    <uni-list-item title="下单时间" :rightText="orderDetail.date" :showArrow="false"/>
                    <uni-list-item title="顾客昵称" :rightText="orderDetail.customerName" :showArrow="false"/>
                    <uni-list-item title="收货地址" :note="orderDetail.shippingAddress || '暂无地址信息'" :showArrow="false"></uni-list-item>
                 </uni-list>
            </uni-section>

            <uni-section title="商品列表" type="line">
                <view v-for="item in orderDetail.items" :key="item.productId || item.id" class="product-item">
                     <view class="product-info">
                         <view class="name">{{ item.name }}</view>
                         <view class="spec">规格: {{ item.specification || '(默认)' }}</view>
                     </view>
                     <view class="price-qty">
                         <view>x {{ item.quantity }}</view>
                         <view class="price">￥{{ (item.price ?? 0).toFixed(2) }}</view>
                     </view>
                </view>
            </uni-section>

            <uni-section title="金额汇总" type="line">
                 <uni-list :border="false">
                     <uni-list-item title="订单总额" :showArrow="false">
                         <template v-slot:footer>
                            <text style="color: #FF5A5F; font-weight: bold; font-size: 16px;">￥{{ (orderDetail.totalAmount ?? 0).toFixed(2) }}</text>
                        </template>
                    </uni-list-item>
                 </uni-list>
            </uni-section>

            <uni-section title="订单操作" type="line" v-if="canOperate">
                 <view class="order-actions">
                     <button v-if="orderDetail.status === 'processing'" size="mini" type="primary" @click="showShipModal">标记发货</button>
                     <button v-if="orderDetail.status === 'shipped'" size="mini" type="primary" @click="confirmComplete">确认完成</button>
                     <button v-if="canCancel" size="mini" type="warn" @click="confirmCancel">取消订单</button>
                      </view>
            </uni-section>

            <uni-popup ref="shipPopup" type="dialog">
                <uni-popup-dialog mode="input" title="输入物流单号" placeholder="请输入快递单号" :before-close="true" @confirm="handleShipConfirm" @close="closeShipPopup">
                     </uni-popup-dialog>
            </uni-popup>

         </view>
         <view v-else class="empty-state">未找到订单信息</view>
    </view>
</template>

<script>
import { getOrderDetailApi, updateOrderStatusApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            orderId: null,
            orderDetail: null,
            loadingData: false,
            operating: false, // 防止重复点击操作按钮
        };
    },
    computed: {
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        },
        // 根据状态判断是否可操作
        canOperate() {
             if (!this.orderDetail) return false;
             const cancellableStatus = ['pending_payment', 'processing']; // 假设这些状态可取消
             return this.orderDetail.status === 'processing' || this.orderDetail.status === 'shipped' || cancellableStatus.includes(this.orderDetail.status);
        },
        canCancel() {
             if (!this.orderDetail) return false;
             const cancellableStatus = ['pending_payment', 'processing'];
             return cancellableStatus.includes(this.orderDetail.status);
        }
    },
     onLoad(options) {
        if (options.id) {
            this.orderId = options.id;
             if (this.selectedMerchantId) {
                this.fetchOrderDetail();
             }
        } else {
             uni.showToast({ title: '缺少订单ID', icon: 'none' });
             uni.navigateBack();
        }
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ url: '/pages/merchant/selection/index' });
        } else if (this.orderId && !this.orderDetail && !this.loadingData) {
            // 如果有订单ID但无数据，尝试加载
             this.fetchOrderDetail();
        }
    },
    methods: {
        async fetchOrderDetail() {
            if (!this.orderId) return;
            this.loadingData = true;
            try {
                // !! 调整数据提取路径 !!
                const res = await getOrderDetailApi(this.orderId);
                if (res && res.data) {
                    this.orderDetail = res.data;
                     // 假设 API 返回的 items 是数组
                    if (!Array.isArray(this.orderDetail.items)) {
                        this.orderDetail.items = [];
                    }
                } else {
                    uni.showToast({ title: res?.message || '加载详情失败', icon: 'none' });
                     this.orderDetail = null; // 清空
                }
            } catch (error) {
                 uni.showToast({ title: '网络错误', icon: 'none' });
                 this.orderDetail = null;
                 console.error("fetchOrderDetail error:", error);
            } finally {
                this.loadingData = false;
            }
        },
        showShipModal() {
            this.$refs.shipPopup.open();
        },
        closeShipPopup() {
             this.$refs.shipPopup.close();
        },
        async handleShipConfirm(value) {
            const trackingNumber = value.trim();
            if (!trackingNumber) {
                uni.showToast({ title: '请输入物流单号', icon: 'none' });
                return; // 阻止弹窗关闭
            }
             this.closeShipPopup(); // 先关闭弹窗
             await this.updateStatus('shipped', { trackingNumber });
        },
        async confirmComplete() {
            uni.showModal({
                title: '确认完成',
                content: '确定要将此订单标记为已完成吗？',
                success: async (res) => {
                    if (res.confirm) {
                         await this.updateStatus('completed');
                    }
                }
            })
        },
         async confirmCancel() {
             uni.showModal({
                title: '确认取消',
                content: '确定要取消此订单吗？',
                success: async (res) => {
                    if (res.confirm) {
                         await this.updateStatus('cancelled');
                    }
                }
            })
        },
        async updateStatus(newStatus, extraData = {}) {
            if (this.operating) return;
            this.operating = true;
            uni.showLoading({ title: '处理中...' });
            try {
                const payload = { status: newStatus, ...extraData };
                 // !! 调整成功判断 !!
                const res = await updateOrderStatusApi(this.orderId, payload);
                 if (res && (res.success !== false)) { // 假设没有明确返回 false 即为成功
                    uni.showToast({ title: '操作成功', icon: 'success' });
                    // 更新当前页面的状态显示
                    if (this.orderDetail) {
                        this.orderDetail.status = newStatus;
                        // 如果有物流单号也更新
                        if(extraData.trackingNumber) {
                             this.orderDetail.trackingNumber = extraData.trackingNumber; // 假设详情对象有此字段
                        }
                    }
                     uni.$emit('orderListNeedRefresh'); // 通知列表页刷新
                } else {
                     uni.showToast({ title: res?.message || '操作失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
                 console.error("Update status error:", error);
            } finally {
                this.operating = false;
                uni.hideLoading();
            }
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
    padding: 10px 0;
    background-color: #f8f8f8;
}
.header-tip, .empty-state {
    text-align: center; color: #999; padding: 50px 0;
}
.product-item {
    display: flex; justify-content: space-between; padding: 10px; background-color: #fff; border-bottom: 1px solid #eee;
    &:last-child { border-bottom: none; }
    .product-info {
        flex: 1; margin-right: 10px;
        .name { font-size: 14px; color: #333; margin-bottom: 5px; }
        .spec { font-size: 12px; color: #999; }
    }
    .price-qty {
        text-align: right; font-size: 12px; color: #666;
        .price { font-size: 14px; color: #333; margin-top: 5px; }
    }
}
.order-actions {
    padding: 10px 15px;
    display: flex;
    justify-content: flex-end; // 操作按钮靠右
    gap: 10px; // 按钮间距
}
</style>