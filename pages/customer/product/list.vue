<template>
    <view class="container product-list-container">
        <view v-if="pageTitle" class="page-header">
            <uni-nav-bar :title="pageTitle" :border="false" fixed />
            <view :style="{ height: navBarHeight + 'px' }"></view>
        </view>

        <view v-if="loading && productList.length === 0 && page === 1" class="initial-loading-state">
            <uni-load-more status="loading" />
        </view>

        <view class="product-grid" v-else-if="productList.length > 0">
            <view class="product-card" v-for="product in productList" :key="product.productId" @click="goToProductDetail(product.productId)">
                <image :src="product.image || '/static/images/default-product.png'" mode="aspectFill" class="product-image" />
                <view class="product-info">
                    <text class="product-name uni-ellipsis-2">{{ product.name }}</text>
                    <view class="product-price-row">
                        <text class="product-price">￥{{ (product.price || 0).toFixed(2) }}</text>
                        <text class="product-original-price" v-if="product.originalPrice && product.originalPrice > product.price">￥{{ (product.originalPrice || 0).toFixed(2) }}</text>
                    </view>
                    <text class="product-sales" v-if="typeof product.sales === 'number'">已售 {{ product.sales }}</text>
                </view>
            </view>
        </view>

        <view v-else-if="!loading && finished" class="empty-state">
            <uni-icons type="shop" size="60" color="#ccc"></uni-icons>
            <text>暂无相关商品</text>
        </view>

        <uni-load-more :status="loading && productList.length > 0 ? 'loading' : (finished ? 'noMore' : 'more')" />
    </view>
</template>

<script>
import { getProductsApi } from '@/api/customer.js';

export default {
    data() {
        return {
            productList: [],
            loading: false,
            finished: false, // Indicates if all data has been loaded
            page: 1,
            pageSize: 10,
            categoryId: null,
            keyword: null,
            sortBy: null, // e.g., 'price_asc', 'price_desc', 'sales_desc'
            pageTitle: '', // Set from onLoad based on category or search
            navBarHeight: 0, // For fixed nav-bar placeholder

            // Example sorting options
            // sortOptions: [
            //     { value: null, text: '综合' },
            //     { value: 'sales_desc', text: '销量' },
            //     { value: 'price_asc', text: '价格升序' },
            //     { value: 'price_desc', text: '价格降序' },
            // ],
            // currentSort: 0,
        };
    },
    onLoad(options) {
        if (options.categoryId) {
            this.categoryId = options.categoryId;
            this.pageTitle = options.title || '商品列表';
        }
        if (options.keyword) {
            this.keyword = options.keyword;
            this.pageTitle = `“${options.keyword}”的搜索结果`;
        }
        if (!this.pageTitle) {
             this.pageTitle = '商品列表';
        }

        // Get navigation bar height for placeholder if using fixed nav-bar
        const systemInfo = uni.getSystemInfoSync();
        this.navBarHeight = systemInfo.statusBarHeight + 44; // Assuming 44px for title bar

        this.fetchProducts(true);
    },
    onReachBottom() {
        if (!this.loading && !this.finished) {
            this.page++;
            this.fetchProducts(false);
        }
    },
    onPullDownRefresh() {
        this.fetchProducts(true, () => {
            uni.stopPullDownRefresh();
        });
    },
    methods: {
        async fetchProducts(isRefresh = false, callback = null) {
            if (this.loading && !isRefresh) return; // Avoid concurrent loading for pagination
            this.loading = true;
            if (isRefresh) {
                this.page = 1;
                this.productList = [];
                this.finished = false;
            }

            const params = {
                page: this.page,
                pageSize: this.pageSize,
                categoryId: this.categoryId || undefined,
                keyword: this.keyword || undefined,
                sortBy: this.sortBy || undefined,
            };

            try {
                const res = await getProductsApi(params);
                // Assuming API returns: { data: { records: [], total: number, current: number, pages: number } }
                // Or simpler: { data: [] } and we infer pagination end by returned array length
                if (res && Array.isArray(res.data)) { // Adjust based on actual API response structure
                    const newProducts = res.data; // Or res.data.records if nested
                    if (newProducts.length > 0) {
                        this.productList = isRefresh ? newProducts : [...this.productList, ...newProducts];
                    }
                    if (newProducts.length < this.pageSize) {
                        this.finished = true;
                    }
                    // If API provides total pages:
                    // if (res.data.pages && this.page >= res.data.pages) {
                    // this.finished = true;
                    // }
                } else if (res && res.success === false) {
                     uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                     this.finished = true;
                } else {
                    this.finished = true; // Assume no more data if response format is unexpected
                }
            } catch (error) {
                uni.showToast({ title: '网络请求失败，请稍后重试', icon: 'none' });
                console.error("fetchProducts error:", error);
                this.finished = true; // Prevent further loading attempts on error
            } finally {
                this.loading = false;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        },
        goToProductDetail(productId) {
            uni.navigateTo({
                url: `/pages/customer/product/detail?id=${productId}`
            });
        },
        // onSortClick(e) {
        //     if (this.currentSort !== e.currentIndex) {
        //         this.currentSort = e.currentIndex;
        //         this.sortBy = this.sortOptions[e.currentIndex].value;
        //         this.fetchProducts(true); // Refresh list with new sort
        //     }
        // }
    }
}
</script>

<style lang="scss" scoped>
.product-list-container {
    background-color: #f8f8f8;
    min-height: 100vh;
}
.page-header {
    // This view acts as a placeholder if uni-nav-bar is fixed
}
/*
.filter-bar {
    background-color: #fff;
    margin-bottom: 10px;
}
*/
.product-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px;
}
.product-card {
    width: calc(50% - 5px);
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 10px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.08);

    .product-image {
        width: 100%;
        height: 160px; // Adjust as needed
        display: block;
    }
    .product-info {
        padding: 8px 10px;
        .product-name {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
            height: 39.2px; // Approx 2 lines
        }
        .product-price-row {
            display: flex;
            align-items: baseline;
            margin-top: 5px;
            .product-price {
                font-size: 16px;
                font-weight: bold;
                //color: $uni-color-error;
            }
            .product-original-price {
                font-size: 12px;
                color: #999;
                text-decoration: line-through;
                margin-left: 8px;
            }
        }
        .product-sales {
            font-size: 12px;
            color: #999;
            margin-top: 3px;
        }
    }
}
.initial-loading-state {
    padding-top: 100px; // Adjust as needed
}
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 80px;
    color: #999;
    text {
        margin-top: 10px;
        font-size: 14px;
    }
}
</style>