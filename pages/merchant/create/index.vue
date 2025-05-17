<template>
    <view class="container">
        <view class="page-title">创建新商户</view>
        <uni-forms ref="createFormRef" :modelValue="formData" :rules="rules" label-position="top">
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
            </uni-forms>
        <button type="primary" @click="submitCreate" :loading="loading">确认创建</button>
    </view>
</template>

<script>
import { createMerchantApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            formData: {
                name: '',
                category: '',
                description: '',
                phone: '',
                address: '',
                // logo: '', // 可选
            },
            rules: {
                name: { rules: [{ required: true, errorMessage: '请输入商户名称' }] },
                phone: { rules: [{ required: true, errorMessage: '请输入联系电话' }] },
            },
            loading: false,
        };
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    methods: {
        submitCreate() {
            this.$refs.createFormRef.validate().then(async (res) => {
                this.loading = true;
                try {
                    // 调用创建 API
                    // !! 注意：根据你的 uni.$http 响应调整数据提取路径 !!
                    const createRes = await createMerchantApi(this.formData);
                    if (createRes && createRes.data && createRes.data.id) { // 假设成功返回创建的商户信息包含 id
                        uni.showToast({ title: '创建成功', icon: 'success' });
                        // 创建成功后，需要刷新用户的商户列表
                        await merchantContextService.loadManagedMerchants();
                        // 并将新创建的商户设为当前选中
                        merchantContextService.setSelectedMerchant(createRes.data.id);
                        // 然后跳转到仪表盘
                        uni.reLaunch({
                            url: '/pages/merchant/dashboard/index'
                        });
                    } else {
                         uni.showToast({ title: createRes?.message || '创建失败', icon: 'none' });
                    }
                } catch (error) {
                    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
                    console.error("Create merchant error:", error);
                } finally {
                    this.loading = false;
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
    padding: 15px;
}
.page-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}
button {
    margin-top: 20px;
}
</style>