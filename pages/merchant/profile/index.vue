<template>
    <view class="container">
         <view class="header-tip" v-if="!selectedMerchantId">请先选择商户</view>
         <uni-section v-else title="编辑商户资料" type="line">
            <view v-if="loadingData" style="text-align: center; padding: 30px;">加载中...</view>
            <uni-forms v-else ref="profileFormRef" :modelValue="formData" :rules="rules" label-position="top">
                <uni-forms-item label="商户名称" name="name" required>
                    <uni-easyinput v-model="formData.name" placeholder="请输入商户/店铺名称" />
                </uni-forms-item>
                <uni-forms-item label="主营类别" name="category">
                    <uni-easyinput v-model="formData.category" placeholder="例如：生鲜水果、服饰鞋包" />
                </uni-forms-item>
                 <uni-forms-item label="商户简介" name="description">
                    <uni-easyinput type="textarea" v.model="formData.description" placeholder="介绍一下您的商户" />
                </uni-forms-item>
                 <uni-forms-item label="联系电话" name="phone" required>
                    <uni-easyinput v-model="formData.phone" placeholder="请输入联系电话" />
                </uni-forms-item>
                 <uni-forms-item label="详细地址" name="address">
                    <uni-easyinput v-model="formData.address" placeholder="请输入商户详细地址" />
                </uni-forms-item>
                <button type="primary" @click="submitUpdate" :loading="submitting" style="margin-top: 20px;">保存修改</button>
            </uni-forms>
        </uni-section>
    </view>
</template>

<script>
import { getMerchantProfileApi, updateMerchantProfileApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            formData: { // 初始化为空或默认值
                id: null,
                name: '',
                category: '',
                description: '',
                phone: '',
                address: '',
                logo: '',
            },
            rules: { // 校验规则
                name: { rules: [{ required: true, errorMessage: '请输入商户名称' }] },
                phone: { rules: [{ required: true, errorMessage: '请输入联系电话' }] },
            },
            loadingData: false,
            submitting: false,
        };
    },
    computed: {
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        }
    },
    watch: {
         // 监听选中 ID 变化，如果变化则重新加载
         selectedMerchantId(newId, oldId) {
            if (newId && newId !== oldId) {
                 this.loadProfileData(newId);
            } else if (!newId) {
                this.resetForm(); // 如果清空了选择，则清空表单
            }
        }
    },
    onLoad() {
        if (this.selectedMerchantId) {
            this.loadProfileData(this.selectedMerchantId);
        }
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        // 如果没有选中 ID 且 context 初始化了，跳转选择页
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ // 用 redirectTo 防止返回空页面
                 url: '/pages/merchant/selection/index'
             });
        } else if (this.selectedMerchantId && !this.formData.id) {
            // 如果有选中 ID 但表单无数据，可能需要加载
            this.loadProfileData(this.selectedMerchantId);
        }
    },
    methods: {
        resetForm() {
             this.formData = {
                id: null, name: '', category: '', description: '', phone: '', address: '', logo: '',
            };
            this.$refs.profileFormRef?.clearValidate(); // 清除校验状态
        },
        async loadProfileData(merchantId) {
            if (!merchantId) return;
            this.loadingData = true;
            this.resetForm(); // 先清空
            try {
                // !! 调整数据提取路径 !!
                const res = await getMerchantProfileApi(merchantId);
                if (res && res.data) {
                    // 使用 Object.assign 或遍历赋值，避免丢失响应式
                     Object.assign(this.formData, res.data);
                     // 确保 ID 也被设置
                     this.formData.id = res.data.id || merchantId;
                } else {
                     uni.showToast({ title: res?.message || '加载资料失败', icon: 'none' });
                }
            } catch (error) {
                 uni.showToast({ title: '网络错误', icon: 'none' });
                 console.error("Load profile error:", error);
            } finally {
                this.loadingData = false;
            }
        },
        submitUpdate() {
             if (!this.selectedMerchantId) {
                 uni.showToast({title: '未选择商户', icon: 'none'});
                 return;
             }
            this.$refs.profileFormRef.validate().then(async (res) => {
                this.submitting = true;
                try {
                    // !! 调整数据提取路径 !!
                    const updateRes = await updateMerchantProfileApi(this.selectedMerchantId, this.formData);
                     if (updateRes && (updateRes.success || updateRes.data)) { // 假设成功条件
                        uni.showToast({ title: '保存成功', icon: 'success' });
                        // 可选：更新 merchantContextService 中的列表缓存 (如果需要实时看到名称等变化)
                        merchantContextService.loadManagedMerchants(); // 简单重新加载
                        // uni.navigateBack(); // 可选：保存后返回上一页
                    } else {
                         uni.showToast({ title: updateRes?.message || '保存失败', icon: 'none' });
                    }
                } catch (error) {
                    uni.showToast({ title: '网络错误', icon: 'none' });
                    console.error("Update profile error:", error);
                } finally {
                    this.submitting = false;
                }
            }).catch(err => {
                 console.log('表单校验失败：', err);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px;
}
.header-tip {
    text-align: center;
    color: #999;
    padding: 30px;
}
</style>