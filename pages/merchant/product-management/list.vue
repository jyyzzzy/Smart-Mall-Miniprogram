<template>
    <view class="container">
         <view class="header-actions">
             <uni-search-bar
                placeholder="搜索商品名称"
                @confirm="handleSearch"
                @cancel="handleCancelSearch"
                @clear="handleClearSearch"
                style="flex: 1;"
            />
             <button type="primary" size="mini" @click="goToEdit()" class="add-button">
                 <uni-icons type="plusempty" size="16" color="#fff"></uni-icons>
                 发布商品
             </button>
         </view>

         <uni-list v-if="productList.length > 0" :border="true">
            <uni-list-item
                v-for="product in productList"
                :key="product.id"
                :title="product.name"
                :note="`库存: ${product.stock ?? 'N/A'} | 销量: ${product.sales ?? 'N/A'}`"
                clickable
                :thumb="product.image || '/static/images/default-product.png'"
                thumb-size="lg"
                @click="goToEdit(product.id)"
            >
                 <template v-slot:footer>
                    <view style="display: flex; flex-direction: column; align-items: flex-end;">
                         <text style="color: #FF5A5F; font-weight: bold; font-size: 16px;">￥{{ (product.price ?? 0).toFixed(2) }}</text>
                        <uni-tag
                            :text="product.status === 'active' ? '在售' : '已下架'"
                            :type="product.status === 'active' ? 'success' : 'default'"
                            size="small"
                            style="margin-top: 5px;"
                        />
                        <view class="item-actions">
                             <text @click.stop="toggleStatus(product)">{{ product.status === 'active' ? '下架' : '上架' }}</text>
                             <text @click.stop="deleteProduct(product)" style="color: red; margin-left: 10px;">删除</text>
                         </view>
                    </view>
                </template>
            </uni-list-item>
        </uni-list>

        <view v-else-if="!loading && finished" class="empty-state">暂无商品</view>
        <uni-load-more :status="loading ? 'loading' : (finished ? 'noMore' : 'more')" />
    </view>
</template>

<script>
import { getMerchantProductsApi, updateProductApi, deleteProductApi } from '@/api/merchant.js';
import merchantContextService from '@/store/merchantContextService';
import authService from '@/store/authService';

export default {
    data() {
        return {
            productList: [],
            loading: false,
            finished: false,
            searchKeyword: '',
            page: 1,
            pageSize: 10,
        };
    },
     computed: {
        selectedMerchantId() {
            return merchantContextService.context.selectedMerchantId;
        }
    },
     watch: {
         selectedMerchantId(newId, oldId) {
            if (newId && newId !== oldId) {
                 this.fetchProducts(true); // 切换商户时刷新列表
            } else if (!newId) {
                this.productList = []; // 清空
                this.finished = true;
            }
        }
    },
    onLoad() {
        if (this.selectedMerchantId) {
            this.fetchProducts(true);
        }
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
            return;
        }
        if (merchantContextService.context.initialized && !this.selectedMerchantId) {
             uni.redirectTo({ url: '/pages/merchant/selection/index' });
        } else if (this.selectedMerchantId && this.productList.length === 0 && !this.loading) {
             // 如果选中了商户但列表为空，尝试重新加载第一页
             this.fetchProducts(true);
        }
        // 从编辑页返回时可能需要刷新列表，可以通过事件或检查特定标记实现
        // 这里简化处理，依赖下拉刷新或重新进入页面
    },
     onReachBottom() {
        if (!this.loading && !this.finished && this.selectedMerchantId) {
            this.page++;
            this.fetchProducts(false);
        }
    },
    onPullDownRefresh() {
         if (this.selectedMerchantId) {
             this.fetchProducts(true, () => {
                uni.stopPullDownRefresh();
            });
         } else {
             uni.stopPullDownRefresh();
         }
    },
    methods: {
        async fetchProducts(isRefresh = false, callback = null) {
             if (!this.selectedMerchantId) {
                 this.loading = false;
                 this.finished = true;
                 this.productList = [];
                  if (callback) callback();
                 return;
             }
            if (this.loading && !isRefresh) return; // 防止重复加载更多
            this.loading = true;
            if (isRefresh) {
                this.page = 1;
                this.productList = [];
                this.finished = false;
            }

            const params = {
                page: this.page,
                pageSize: this.pageSize,
                keyword: this.searchKeyword,
            };

            try {
                // !! 调整数据提取路径 !!
                const res = await getMerchantProductsApi(this.selectedMerchantId, params);
                 if (res && Array.isArray(res.data)) {
                    if (res.data.length > 0) {
                         this.productList = isRefresh ? res.data : [...this.productList, ...res.data];
                    }
                     if (res.data.length < this.pageSize) {
                        this.finished = true;
                    }
                } else if (res && res.success === false) {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                    this.finished = true;
                } else {
                    this.finished = true;
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
                 this.finished = true;
                console.error("fetchProducts error:", error);
            } finally {
                this.loading = false;
                if (callback) callback();
            }
        },
         handleSearch(e) {
            this.searchKeyword = e.value;
            this.fetchProducts(true);
        },
        handleCancelSearch() {
            this.searchKeyword = '';
            this.fetchProducts(true);
        },
        handleClearSearch() {
             this.searchKeyword = '';
            this.fetchProducts(true);
        },
        goToEdit(productId = null) {
             const url = productId
                ? `/pages/merchant/product-management/edit?id=${productId}`
                : '/pages/merchant/product-management/edit';
            uni.navigateTo({ url });
        },
        async toggleStatus(product) {
             if (!product || !product.id) return;
             const newStatus = product.status === 'active' ? 'inactive' : 'active';
             uni.showLoading({title: '处理中...'});
             try {
                 const res = await updateProductApi(product.id, { status: newStatus });
                  if (res && (res.success || res.data)) {
                      uni.showToast({title: `${newStatus === 'active' ? '上架' : '下架'}成功`});
                      // 更新列表中的状态
                      const index = this.productList.findIndex(p => p.id === product.id);
                      if (index !== -1) {
                          this.productList[index].status = newStatus;
                          // Vue 3 Options API 可能需要 $forceUpdate 或其他方式强制刷新视图，或者确保 productList 本身是响应式的
                          // 如果 productList 是 data() 中的数组，Vue 应该能检测到修改
                      }
                  } else {
                       uni.showToast({title: res?.message || '操作失败', icon: 'none'});
                  }
             } catch (error) {
                  uni.showToast({title: '网络错误', icon: 'none'});
             } finally {
                 uni.hideLoading();
             }
        },
        deleteProduct(product) {
             if (!product || !product.id) return;
             uni.showModal({
                 title: '确认删除',
                 content: `确定要删除商品 "${product.name}" 吗？此操作不可恢复。`,
                 success: async (res) => {
                     if (res.confirm) {
                         uni.showLoading({title: '删除中...'});
                         try {
                             const deleteRes = await deleteProductApi(product.id);
                              if (deleteRes && (deleteRes.success || deleteRes.data)) { // 假设成功条件
                                 uni.showToast({title: '删除成功'});
                                 // 从列表中移除
                                 this.productList = this.productList.filter(p => p.id !== product.id);
                                 // 如果当前页为空了，可能需要重新加载上一页或第一页
                                 if(this.productList.length === 0 && this.page > 1) {
                                     this.page = Math.max(1, this.page -1); // 回到上一页
                                     this.fetchProducts(false);
                                 } else if (this.productList.length === 0 && this.page === 1) {
                                     this.finished = true; // 标记为空
                                 }
                             } else {
                                  uni.showToast({title: deleteRes?.message || '删除失败', icon: 'none'});
                             }
                         } catch (error) {
                              uni.showToast({title: '网络错误', icon: 'none'});
                         } finally {
                             uni.hideLoading();
                         }
                     }
                 }
             });
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding-bottom: 10px;
}
.header-actions {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    .add-button {
        margin-left: 10px;
        display: flex;
        align-items: center;
        padding: 0 10px; // 调整按钮内边距
        height: 30px; // 调整按钮高度
        line-height: 30px; // 确保文字垂直居中
        uni-icons {
             margin-right: 3px;
        }
    }
}
.item-actions {
    margin-top: 8px;
    font-size: 12px;
    //color: $uni-color-primary;
    text {
        cursor: pointer;
    }
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>