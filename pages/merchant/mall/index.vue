<template>
    <view class="container">
        <view v-if="!selectedMerchantId" class="header-tip">请先选择商户</view>
        <view v-else>
            <uni-section title="当前关联状态" type="line">
                 <view v-if="loadingStatus" style="padding: 20px; text-align: center;">加载中...</view>
                 <uni-list v-else-if="associationInfo" :border="false">
                    <uni-list-item title="关联商场" :rightText="associationInfo.mallName || '未关联'" :showArrow="false"/>
                    <uni-list-item title="关联状态">
                         <template v-slot:footer>
                            <uni-tag :text="getStatusText(associationInfo.status)" :type="getStatusType(associationInfo.status)" size="default"/>
                        </template>
                    </uni-list-item>
                     <uni-list-item v-if="associationInfo.status === 'rejected'" title="驳回原因" :note="associationInfo.rejectReason || '无'" :showArrow="false"/>
                 </uni-list>
                 <view v-else class="empty-status">暂无关联信息</view>
            </uni-section>

            <uni-section title="申请加入新商城" type="line" v-if="canApply">
                 <view style="padding: 15px;">
                    <view style="margin-bottom: 10px;">您可以选择一个商城提交入驻申请。</view>
                    <uni-easyinput v-model="applyForm.mallId" placeholder="输入要申请的商场ID (暂用输入框)" />
                     <uni-easyinput type="textarea" v-model="applyForm.reason" placeholder="输入申请理由 (可选)" style="margin-top: 10px;" />
                     <button type="primary" @click="submitApplication" :loading="applying" style="margin-top: 15px;">提交申请</button>
                 </view>
            </uni-section>
        </view>
    </view>
</template>

<script>
import { getMallAssociationApi, applyToMallApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            associationInfo: null, // { mallId, mallName, status: 'pending'/'approved'/'rejected'/'none', rejectReason? }
            loadingStatus: false,
            applying: false,
            applyForm: {
                mallId: '',
                reason: '',
            }
        };
    },
     computed: {
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        },
        // 是否可以申请 (未关联或被驳回时)
        canApply() {
            return !this.associationInfo || this.associationInfo.status === 'none' || this.associationInfo.status === 'rejected';
        }
    },
     watch: {
         selectedMerchantId(newId, oldId) {
            if (newId && newId !== oldId) {
                 this.loadAssociationStatus(newId);
            } else if (!newId) {
                this.associationInfo = null;
            }
        }
    },
     onLoad() {
        if (this.selectedMerchantId) {
            this.loadAssociationStatus(this.selectedMerchantId);
        }
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ url: '/pages/merchant/selection/index' });
        } else if (this.selectedMerchantId && !this.associationInfo && !this.loadingStatus) {
             this.loadAssociationStatus(this.selectedMerchantId);
        }
    },
    methods: {
        async loadAssociationStatus(merchantId) {
            if (!merchantId) return;
            this.loadingStatus = true;
            try {
                // !! 调整数据提取路径 !!
                const res = await getMallAssociationApi(merchantId);
                 if (res && res.data) {
                    // 假设 res.data 包含 { mallId, mallName, status }
                    this.associationInfo = res.data;
                    // 如果后端对于未关联返回 null 或空对象，需要处理
                    if (!this.associationInfo || !this.associationInfo.status) {
                         this.associationInfo = { status: 'none' }; // 设定一个明确的未关联状态
                    }
                } else {
                    // 接口可能返回特定错误码表示未找到记录，也视为未关联
                     this.associationInfo = { status: 'none' };
                     console.warn("Load association status failed or no association found:", res?.message);
                }
            } catch (error) {
                 this.associationInfo = { status: 'none' }; // 出错也视为未关联
                 uni.showToast({ title: '网络错误', icon: 'none' });
                 console.error("Load association error:", error);
            } finally {
                this.loadingStatus = false;
            }
        },
        getStatusText(status) {
            const map = { 'pending': '审核中', 'approved': '已关联', 'rejected': '已驳回', 'none': '未关联' };
            return map[status] || status || '未知';
        },
         getStatusType(status) {
            const map = { 'pending': 'warning', 'approved': 'success', 'rejected': 'error', 'none': 'default' };
            return map[status] || 'default';
        },
        async submitApplication() {
            if (!this.applyForm.mallId) {
                uni.showToast({ title: '请输入要申请的商场ID', icon: 'none' });
                return;
            }
             if (!this.selectedMerchantId) return;
            this.applying = true;
             try {
                 const payload = {
                     mallId: this.applyForm.mallId,
                     applicationReason: this.applyForm.reason
                 };
                 // !! 调整成功判断 !!
                 const res = await applyToMallApi(this.selectedMerchantId, payload);
                  if (res && (res.success !== false)) {
                     uni.showToast({ title: '申请已提交', icon: 'success' });
                     // 提交成功后刷新状态
                     this.loadAssociationStatus(this.selectedMerchantId);
                     // 清空表单
                     this.applyForm.mallId = '';
                     this.applyForm.reason = '';
                 } else {
                      uni.showToast({ title: res?.message || '申请失败', icon: 'none' });
                 }
             } catch (error) {
                 uni.showToast({ title: '网络错误', icon: 'none' });
                  console.error("Apply to mall error:", error);
             } finally {
                 this.applying = false;
             }
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px 0;
    background-color: #f8f8f8;
}
.header-tip, .empty-state, .empty-status {
    text-align: center; color: #999; padding: 50px 0;
}
</style>