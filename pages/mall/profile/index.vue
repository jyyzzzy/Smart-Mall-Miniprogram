<template>
    <view class="container">
        <uni-section title="商场基本信息" type="line">
            <uni-forms ref="profileFormRef" :modelValue="formData" :rules="rules" label-position="top">
                <uni-forms-item label="商场名称" name="name">
                    <uni-easyinput v-model="formData.name" placeholder="请输入商场名称" />
                </uni-forms-item>
                <uni-forms-item label="商场Logo" name="logo">
                    <image :src="formData.logo || '/static/logo.png'" mode="aspectFit" style="width: 80px; height: 80px; border: 1px solid #eee;"></image>
                    <text style="font-size: 12px; color: #999; margin-left: 10px;">(上传功能暂未实现)</text>
                </uni-forms-item>
                <uni-forms-item label="商场简介" name="description">
                    <uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入商场简介" />
                </uni-forms-item>
                 <uni-forms-item label="地址" name="address">
                    <uni-easyinput v-model="formData.address" placeholder="请输入详细地址" />
                </uni-forms-item>
                 <uni-forms-item label="联系电话" name="phone">
                    <uni-easyinput v-model="formData.phone" placeholder="请输入联系电话" />
                </uni-forms-item>
                 <uni-forms-item label="营业时间" name="hours">
                    <uni-easyinput v-model="formData.hours" placeholder="例如：每天 10:00 - 22:00" />
                </uni-forms-item>
                 <uni-forms-item label="平台抽佣比例(%)" name="commissionRate">
                     <uni-number-box v-model="formData.commissionRate" :min="0" :max="100" />
                </uni-forms-item>
            </uni-forms>
            <button type="primary" @click="submitForm" :loading="loading" style="margin-top: 20px;">保存修改</button>
        </uni-section>
    </view>
</template>

<script>
import { getMallProfileApi, updateMallProfileApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            formData: {
                id: '',
                name: '',
                logo: '',
                description: '',
                address: '',
                phone: '',
                hours: '',
                commissionRate: 0,
            },
            rules: { // 简单校验规则
                name: { rules: [{ required: true, errorMessage: '请输入商场名称' }] },
                address: { rules: [{ required: true, errorMessage: '请输入地址' }] },
                phone: { rules: [{ required: true, errorMessage: '请输入联系电话' }] },
            },
            loading: false,
            fetchLoading: false,
        };
    },
     onLoad() {
        this.fetchProfile();
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    methods: {
        async fetchProfile() {
            this.fetchLoading = true;
            try {
                const res = await getMallProfileApi();
                if (res.success) {
                    // 将获取的数据赋值给 formData
                    Object.keys(this.formData).forEach(key => {
                        if(res.data[key] !== undefined) {
                            this.formData[key] = res.data[key];
                        }
                    });
                } else {
                    uni.showToast({ title: res.message || '加载资料失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
            } finally {
                this.fetchLoading = false;
            }
        },
        submitForm() {
            this.$refs.profileFormRef.validate().then(async (res) => {
                this.loading = true;
                try {
                    const updateRes = await updateMallProfileApi(this.formData);
                    if (updateRes.success) {
                        uni.showToast({ title: '保存成功', icon: 'success' });
                    } else {
                         uni.showToast({ title: updateRes.message || '保存失败', icon: 'none' });
                    }
                } catch (error) {
                     uni.showToast({ title: '网络错误', icon: 'none' });
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
    padding: 10px;
}
/* 可以添加更多样式 */
</style>