<template>
    <view class="container home-container">
        <view class="search-bar-placeholder" @click="goToSearch">
            <uni-icons type="search" size="18" color="#999"></uni-icons>
            <text class="placeholder-text">搜索你心动的宝贝</text>
        </view>

        <swiper v-if="homeData.banners && homeData.banners.length > 0" class="banner-swiper" indicator-dots autoplay circular>
            <swiper-item v-for="banner in homeData.banners" :key="banner.id" @click="handleBannerClick(banner)">
                <image :src="banner.imageUrl" mode="aspectFill" class="banner-image" />
            </swiper-item>
        </swiper>

        <uni-section title="宝贝分类" type="line" v-if="homeData.categories && homeData.categories.length > 0">
             <uni-grid :column="4" :show-border="false" :square="false" @change="handleCategoryClick">
                <uni-grid-item v-for="(category, index) in homeData.categories" :key="category.id" :index="index">
                    <view class="category-item">
                        <image :src="category.iconUrl || '/static/images/default-category.png'" mode="aspectFit" class="category-icon" />
                        <text class="category-name">{{ category.name }}</text>
                    </view>
                </uni-grid-item>
            </uni-grid>
        </uni-section>

        <uni-section title="猜你喜欢" type="line" v-if="homeData.featuredProducts && homeData.featuredProducts.length > 0">
            <view class="product-grid">
                <view class="product-card" v-for="product in homeData.featuredProducts" :key="product.productId" @click="goToProductDetail(product.productId)">
                    <image :src="product.image || '/static/images/default-product.png'" mode="aspectFill" class="product-image" />
                    <view class="product-info">
                        <text class="product-name uni-ellipsis-2">{{ product.name }}</text>
                        <view class="product-price-row">
                            <text class="product-price">￥{{ (product.price || 0).toFixed(2) }}</text>
                            <text class="product-original-price" v-if="product.originalPrice">￥{{ (product.originalPrice || 0).toFixed(2) }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </uni-section>

        <view v-if="loading" class="loading-state">
            <uni-load-more status="loading" />
        </view>
        <view v-if="!loading && !hasContent" class="empty-state">
            <text>首页空空如也，店主正在努力上新中...</text>
        </view>

        </view>
</template>

<script>
import { getHomePageDataApi } from '@/api/customer.js';
import authService from '@/store/authService'; // 如果需要判断登录状态来显示不同内容

export default {
    data() {
        return {
            homeData: {
                banners: [],      // { id, imageUrl, linkUrl? }
                categories: [],   // { id, name, iconUrl, categoryId }
                featuredProducts: [] // { productId, name, image, price, originalPrice? }
            },
            loading: false,
        };
    },
    computed: {
        hasContent() {
            return (this.homeData.banners && this.homeData.banners.length > 0) ||
                   (this.homeData.categories && this.homeData.categories.length > 0) ||
                   (this.homeData.featuredProducts && this.homeData.featuredProducts.length > 0);
        }
        // 可以加入 currentUser 计算属性，如果需要的话
        // currentUser() {
        // return authService.currentUser.value;
        // }
    },
    onLoad() {
        this.fetchHomePageData();
    },
    onPullDownRefresh() {
        this.fetchHomePageData(() => {
            uni.stopPullDownRefresh();
        });
    },
    methods: {
        async fetchHomePageData(callback = null) {
            this.loading = true;
            try {
                // !! 同样，宝宝要注意这里的 res 数据结构是否和你的后端一致哦 !!
                const res = await getHomePageDataApi();
                if (res && res.data) { // 假设成功时 res.data 包含 banners, categories, featuredProducts
                    this.homeData = {
                        banners: res.data.banners || [],
                        categories: res.data.categories || [],
                        featuredProducts: res.data.featuredProducts || []
                    };
                } else {
                    uni.showToast({ title: res?.message || '首页数据加载失败啦', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络有点小情绪，稍后再试', icon: 'none' });
                console.error("fetchHomePageData error:", error);
            } finally {
                this.loading = false;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        },
        goToSearch() {
            uni.navigateTo({
                url: '/pages/customer/search/index' // 假设宝宝的搜索页路径是这个
            });
        },
        handleBannerClick(banner) {
            if (banner.linkUrl) {
                // 可以根据 linkUrl 类型判断是内部页面跳转还是webview
                if (banner.linkUrl.startsWith('/pages/')) {
                    uni.navigateTo({ url: banner.linkUrl });
                } else if (banner.linkUrl.startsWith('http')) {
                    uni.navigateTo({ url: `/pages/common/webview/index?url=${encodeURIComponent(banner.linkUrl)}` });
                }
            }
            console.log('Banner clicked:', banner);
        },
        handleCategoryClick(e) {
            const { index } = e.detail;
            const category = this.homeData.categories[index];
            if (category && category.id) { // 假设用 category.id 跳转到商品列表页
                uni.navigateTo({
                    url: `/pages/customer/product/list?categoryId=${category.id}&title=${category.name}`
                });
            }
            console.log('Category clicked:', category);
        },
        goToProductDetail(productId) {
            uni.navigateTo({
                url: `/pages/customer/product/detail?id=${productId}`
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.home-container {
    background-color: #f8f8f8;
    min-height: 100vh;
}

.search-bar-placeholder {
    background-color: #fff;
    padding: 8px 15px;
    margin: 10px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    color: #999;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    .placeholder-text {
        margin-left: 8px;
    }
}

.banner-swiper {
    width: 100%;
    height: 180px; // 根据宝宝的设计调整高度
    margin-bottom: 10px; // 如果下方有内容
    .banner-image {
        width: 100%;
        height: 100%;
    }
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    .category-icon {
        width: 40px; // 图标大小
        height: 40px;
        margin-bottom: 5px;
    }
    .category-name {
        font-size: 12px;
        color: #333;
    }
}

.product-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 10px; // 左右留边距
}

.product-card {
    width: calc(50% - 5px); // 两列布局，减去中间的间隙
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 10px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.08);

    .product-image {
        width: 100%;
        height: 160px; // 根据图片比例调整
        display: block;
    }
    .product-info {
        padding: 8px;
        .product-name {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
            height: 39.2px; // 约两行的高度
            // uni-ellipsis-2 class for two lines, or use CSS:
            // display: -webkit-box;
            // -webkit-line-clamp: 2;
            // -webkit-box-orient: vertical;
            // overflow: hidden;
            // text-overflow: ellipsis;
        }
        .product-price-row {
            display: flex;
            align-items: baseline; // 对齐价格基线
            margin-top: 5px;
            .product-price {
                font-size: 16px;
                font-weight: bold;
                //color: $uni-color-error; // 主题红色
            }
            .product-original-price {
                font-size: 12px;
                color: #999;
                text-decoration: line-through;
                margin-left: 8px;
            }
        }
    }
}
.loading-state, .empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>