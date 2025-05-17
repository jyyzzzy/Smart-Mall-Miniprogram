<template>
    <view class="container">
        <uni-card v-if="merchantDetail" :title="merchantDetail.name" :thumbnail="merchantDetail.logo || '/static/logo.png'">
             <uni-list>
                <uni-list-item title="商户状态" :rightText="merchantDetail.status === 'active' ? '营业中' : '已下线'"></uni-list-item>
                <uni-list-item title="入驻日期" :rightText="merchantDetail.joinDate"></uni-list-item>
                 <uni-list-item title="主营类别" :rightText="merchantDetail.category"></uni-list-item>
                 <uni-list-item title="商品数量" :rightText="String(merchantDetail.productCount)"></uni-list-item>
                 <uni-list-item title="累计销售额" :rightText="`￥${merchantDetail.totalSales}`"></uni-list-item>
             </uni-list>
        </uni-card>
        <view v-else-if="!loading" class="empty-state">未找到商户信息</view>
        <uni-load-more :status="loading ? 'loading' : 'noMore'" />

        <uni-section title="操作" type="line" style="margin-top: 20px;">
            <button size="mini" type="warn" style="margin: 5px;">{{ merchantDetail?.status === 'active' ? '强制下线' : '恢复上线' }} (功能待实现)</button>
            <button size="mini" style="margin: 5px;">查看商品</button>
             <button size="mini" style="margin: 5px;">查看订单</button>
        </uni-section>
    </view>
</template>

<script>
import { getMerchantDetailApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            merchantId: null,
            merchantDetail: null,
            loading: false,
        };
    },
    onLoad(options) {
        if (options.id) {
            this.merchantId = options.id;
            this.fetchMerchantDetail();
        } else {
             uni.showToast({ title: '缺少商户ID', icon: 'none' });
             uni.navigateBack();
        }
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    methods: {
        async fetchMerchantDetail() {
            this.loading = true;
            try {
                const res = await getMerchantDetailApi(this.merchantId);
                if (res.success) {
                    this.merchantDetail = res.data;
                } else {
                    uni.showToast({ title: res.message || '加载详情失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
            } finally {
                this.loading = false;
            }
        }
        // 添加操作按钮的事件处理...
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px;
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>