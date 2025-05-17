<template>
    <view class="container">
        <view v-if="auditList.length === 0 && !loading" class="empty-state">该功能暂未开放</view>
        <uni-card v-for="item in auditList" :key="item.id" :title="item.name" :extra="`申请日期: ${item.applyDate}`" margin="10px 5px">
            <view>联系人: {{ item.contact }} ({{ item.phone }})</view>
            <view>申请类别: {{ item.category }}</view>
            <view style="color: #666; font-size: 13px; margin-top: 5px;">申请理由: {{ item.reason }}</view>
            <view slot="actions" class="card-actions">
                <button size="mini" type="primary" @click="handleAudit(item.id, 'approve')">通过</button>
                <button size="mini" type="warn" @click="handleAudit(item.id, 'reject')" style="margin-left: 10px;">驳回</button>
            </view>
        </uni-card>
        <uni-load-more :status="loading ? 'loading' : 'noMore'" />
    </view>
</template>

<script>
import { getAuditMerchantsApi, handleMerchantAuditApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            auditList: [],
            loading: false,
        };
    },
     onLoad() {

    },
     onShow() {

    },
    methods: {
        async fetchAuditList() {
            this.loading = true;
            try {
                const res = await getAuditMerchantsApi();
                if (res.success) {
                    this.auditList = res.data;
                } else {
                    uni.showToast({ title: res.message || '加载列表失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        async handleAudit(auditId, action) {
            uni.showLoading({ title: '处理中...' });
            try {
                const res = await handleMerchantAuditApi(auditId, action);
                if (res.success) {
                    uni.hideLoading();
                    uni.showToast({ title: res.message || '操作成功', icon: 'success' });
                    // 刷新列表
                    this.fetchAuditList();
                } else {
                    uni.hideLoading();
                    uni.showToast({ title: res.message || '操作失败', icon: 'none' });
                }
            } catch (error) {
                 uni.hideLoading();
                 uni.showToast({ title: '网络错误', icon: 'none' });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 5px;
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
.card-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid #eee;
    margin-top: 10px;
}
</style>