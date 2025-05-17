<template>
    <view class="container">
        <uni-section :title="isEdit ? '编辑商品' : '发布新商品'" type="line">
             <view v-if="loadingData" style="text-align: center; padding: 30px;"><uni-load-more status="loading"></uni-load-more></view>
             <uni-forms v-else ref="productFormRef" :modelValue="formData" :rules="rules" label-position="top">
                 <uni-forms-item label="商品名称" name="name" required>
                    <uni-easyinput v-model="formData.name" placeholder="请输入商品名称" />
                </uni-forms-item>

                <uni-forms-item label="商品主图" name="image">
                    <image v-if="formData.image" :src="formData.image" mode="aspectFit" style="width: 100px; height: 100px; border: 1px solid #eee;"></image>
                    <view v-else style="width: 100px; height: 100px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">点击上传(暂未实现)</view>
                </uni-forms-item>

                <uni-forms-item label="商品描述" name="description">
                    <uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入商品描述" />
                    </uni-forms-item>

                <uni-forms-item label="商品分类" name="category">
                    <uni-easyinput v-model="formData.category" placeholder="例如：新鲜水果" />
                </uni-forms-item>

                 <uni-forms-item label="销售价格(元)" name="price" required>
                     <uni-easyinput type="digit" v-model="formData.price" placeholder="0.00" />
                 </uni-forms-item>

                  <uni-forms-item label="库存数量" name="stock" required>
                     <uni-number-box v-model="formData.stock" :min="0" />
                 </uni-forms-item>

                 <uni-forms-item label="商品状态" name="status">
                      <uni-data-checkbox v-model="formData.status" :localdata="statusOptions"></uni-data-checkbox>
                 </uni-forms-item>

                <button type="primary" @click="submitForm" :loading="submitting" style="margin-top: 20px;">{{ isEdit ? '确认修改' : '确认发布' }}</button>
            </uni-forms>
        </uni-section>
    </view>
</template>

<script>
import { getProductDetailApi, createProductApi, updateProductApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            productId: null, // 编辑时从路由获取
            formData: { // 表单数据模型
                name: '',
                image: '', // 图片 URL
                description: '',
                category: '',
                price: null,
                stock: 0,
                status: 'active', // 默认上架 'active' 或 'inactive'
                // merchantId: '', // 提交时从 context 获取
                // specs: [], // 规格
            },
            rules: { // 简单校验
                name: { rules: [{ required: true, errorMessage: '请输入商品名称' }] },
                price: { rules: [{ required: true, errorMessage: '请输入销售价格' }, { type: 'number', errorMessage: '价格必须是数字' }] },
                stock: { rules: [{ required: true, errorMessage: '请输入库存数量' }, { type: 'number', errorMessage: '库存必须是数字' }] },
            },
            statusOptions: [ // 商品状态选项
                { text: '立即上架', value: 'active'},
                { text: '放入仓库', value: 'inactive'}
            ],
            loadingData: false, // 加载编辑数据时
            submitting: false, // 提交时
        };
    },
     computed: {
        isEdit() {
            return !!this.productId;
        },
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        }
    },
    onLoad(options) {
        if (options.id) {
            this.productId = options.id;
             if (this.selectedMerchantId) {
                 this.loadProductData(this.productId);
             }
        } else {
            // 新建商品，确保状态是 active (如果需要)
             this.formData.status = 'active';
        }
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ url: '/pages/merchant/selection/index' });
        } else if(this.isEdit && this.selectedMerchantId && !this.loadingData && !this.formData.name) {
            // 如果是编辑模式，且没有加载数据，尝试加载
             this.loadProductData(this.productId);
        }
    },
    methods: {
        async loadProductData(productId) {
            if (!productId) return;
            this.loadingData = true;
            try {
                // !! 调整数据提取路径 !!
                const res = await getProductDetailApi(productId);
                 if (res && res.data) {
                    // 赋值给 formData
                    Object.assign(this.formData, res.data);
                    // 后端返回的价格可能是字符串，确保转为数字
                    this.formData.price = parseFloat(res.data.price) || null;
                    this.formData.stock = parseInt(res.data.stock) || 0;
                } else {
                     uni.showToast({ title: res?.message || '加载商品信息失败', icon: 'none' });
                     uni.navigateBack(); // 加载失败返回上一页
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
                console.error("Load product error:", error);
                uni.navigateBack();
            } finally {
                this.loadingData = false;
            }
        },
        submitForm() {
            if (!this.selectedMerchantId) {
                 uni.showToast({title: '未选择商户', icon: 'none'});
                 return;
             }
             this.$refs.productFormRef.validate().then(async (res) => {
                this.submitting = true;
                 // 确保价格和库存是数字类型再提交
                 const payload = {
                     ...this.formData,
                     price: parseFloat(this.formData.price) || 0,
                     stock: parseInt(this.formData.stock) || 0,
                 };
                 // 移除 ID (如果是新建) 或其他不需要提交的字段
                 if (!this.isEdit) {
                    delete payload.id;
                 }

                try {
                    let apiRes;
                    if (this.isEdit) {
                        // 调用更新 API
                         apiRes = await updateProductApi(this.productId, payload);
                    } else {
                        // 调用创建 API
                        apiRes = await createProductApi(this.selectedMerchantId, payload);
                    }

                    // !! 调整成功判断条件 !!
                    if (apiRes && (apiRes.success || apiRes.data)) {
                         uni.showToast({ title: this.isEdit ? '修改成功' : '发布成功', icon: 'success' });
                         // 成功后返回上一页，并可能需要通知列表页刷新
                         uni.$emit('productUpdated'); // 发送事件通知列表页刷新
                         uni.navigateBack();
                    } else {
                         uni.showToast({ title: apiRes?.message || '操作失败', icon: 'none' });
                    }
                } catch (error) {
                    uni.showToast({ title: '网络错误', icon: 'none' });
                     console.error("Submit product error:", error);
                } finally {
                    this.submitting = false;
                }
            }).catch(err => {
                 console.log('表单校验失败：', err);
            });
        }
        // 图片上传逻辑需要单独实现
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding: 10px;
}
</style>