<template>
    <view class="container">
        <uni-search-bar
            placeholder="搜索商品名称/商户名称"
            @confirm="handleSearch"
            @cancel="handleCancelSearch"
            @clear="handleClearSearch"
        />

        <uni-list v-if="productList.length > 0" :border="false">
             <uni-card
                v-for="product in productList"
                :key="product.id"
                :title="product.name"
                :sub-title="`所属商户: ${product.merchantName}`"
                :extra="`￥${product.price.toFixed(2)}`"
                :thumbnail="product.image || '/static/images/default-product.png'"
                 padding="10px 5px"
                 margin="5px 0px"
            >
                 <view class="product-footer">
                    <uni-tag :text="product.category || '未分类'" type="default" size="small" />
                    <uni-tag
                        :text="product.status === 'active' ? '在售' : '已下架'"
                        :type="product.status === 'active' ? 'success' : 'error'"
                        size="small"
                        style="margin-left: 10px;"
                    />
                    </view>
            </uni-card>

            </uni-list>

        <view v-else-if="!loading && finished" class="empty-state">暂无商品信息</view>
        <uni-load-more :status="loading ? 'loading' : (finished ? 'noMore' : 'more')" />
    </view>
</template>

<script>
import { getMallProductsApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            productList: [],
            loading: false,
            finished: false, // 是否已加载所有数据
            searchKeyword: '',
            page: 1,
            pageSize: 10,
        };
    },
    onLoad() {
        this.fetchProducts(true); // 首次加载
    },
    onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    onReachBottom() {
        if (!this.loading && !this.finished) {
            this.page++;
            this.fetchProducts(false); // 加载下一页
        }
    },
    onPullDownRefresh() {
        this.fetchProducts(true, () => {
             uni.stopPullDownRefresh();
        });
    },
    methods: {
        async fetchProducts(isRefresh = false, callback = null) {
            if (this.loading) return;
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
                // 可添加其他筛选参数: category: 'xxx', status: 'active'
            };

            try {
                const res = await getMallProductsApi(params);
                // 注意：uni.$http 返回的数据结构可能需要调整
                // 假设 res 是包含 data 数组和分页信息的对象
                // 例如：{ success: true, data: { records: [], total: 100, current: 1, pages: 10 } }
                // 这里简化处理，只假设返回 data 数组
                if (res && Array.isArray(res.data)) { // 需要根据你的 uni.$http 响应拦截器调整判断条件和数据路径
                    if (res.data.length > 0) {
                        this.productList = isRefresh ? res.data : [...this.productList, ...res.data];
                    }
                    if (res.data.length < this.pageSize) {
                        this.finished = true; // 如果返回数据少于页面大小，则认为加载完毕
                    }
                } else if (res && res.success === false) {
                     uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                     this.finished = true; // 出错也标记为结束，防止无限加载
                } else {
                    // 假设无数据也算加载完成
                    this.finished = true;
                }
            } catch (error) {
                uni.showToast({ title: '网络错误，请稍后再试', icon: 'none' });
                console.error("fetchProducts error:", error);
                 this.finished = true;
            } finally {
                this.loading = false;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        },
        handleSearch(e) {
            this.searchKeyword = e.value;
            this.fetchProducts(true); // 重新搜索第一页
        },
        handleCancelSearch() {
            this.searchKeyword = '';
            this.fetchProducts(true);
        },
        handleClearSearch() {
            this.searchKeyword = '';
            this.fetchProducts(true);
        }
        // 可添加 goToProductDetail 等方法
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding-bottom: 10px;
}
.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>