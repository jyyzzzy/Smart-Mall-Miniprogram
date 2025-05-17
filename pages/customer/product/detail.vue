<template>
    <view class="container product-detail-container">
        <view v-if="loading && !productDetail" class="loading-state">
            <uni-load-more status="loading" />
        </view>
        <view v-else-if="productDetail">
            <swiper class="image-swiper" indicator-dots autoplay circular>
                <swiper-item v-for="(image, index) in (productDetail.images && productDetail.images.length ? productDetail.images : [productDetail.image || '/static/images/default-product.png'])" :key="index">
                    <image :src="image" mode="aspectFill" class="swiper-image" @click="previewImage(index)" />
                </swiper-item>
            </swiper>

            <view class="info-section product-header">
                <view class="price-section">
                    <text class="current-price">￥{{ (productDetail.price || 0).toFixed(2) }}</text>
                    <text class="original-price" v-if="productDetail.originalPrice && productDetail.originalPrice > productDetail.price">
                        ￥{{ (productDetail.originalPrice || 0).toFixed(2) }}
                    </text>
                </view>
                <view class="product-name-main">{{ productDetail.name }}</view>
                <view class="product-subtitle" v-if="productDetail.subtitle">{{ productDetail.subtitle }}</view>
                <view class="tags-row" v-if="productDetail.tags && productDetail.tags.length">
                     <uni-tag v-for="tag in productDetail.tags" :key="tag" :text="tag" type="primary" size="small" inverted style="margin-right: 5px;" />
                </view>
            </view>

            <uni-section title="商品详情" type="line" class="description-section">
                <view class="description-content" v-if="productDetail.description">
                     <text selectable>{{ productDetail.description }}</text>
                     </view>
                <view v-else class="no-description">暂无详细描述</view>
            </uni-section>

            <view class="bottom-action-bar">
                <uni-goods-nav
                    :options="navOptions"
                    :fill="true"
                    :button-group="buttonGroup"
                    @click="onNavClick"
                    @buttonClick="onActionClick"
                />
            </view>

        </view>
        <view v-else class="empty-state">
            <text>商品信息加载失败或不存在</text>
        </view>

        </view>
</template>

<script>
import { getProductDetailApi } from '@/api/customer.js';
import cartService from '@/store/cartService.js';
import authService from '@/store/authService'; // For cart icon behavior based on login

export default {
    data() {
        return {
            productId: null,
            productDetail: null, // { productId, name, image, images:[], price, originalPrice, description, stock, skuInfo?, etc. }
            loading: false,
            selectedQuantity: 1, // Default quantity for adding to cart
            // selectedSkuText: '', // Display text for selected SKU

            navOptions: [
                // { icon: 'shop', text: '店铺' }, // Optional
                { icon: 'cart', text: '购物车', info: 0 } // info will be updated
            ],
            buttonGroup: [
                { text: '加入购物车', backgroundColor: '#ffaa00', color: '#fff' },
                { text: '立即购买', backgroundColor: '#ff0000', color: '#fff' }
            ]
        };
    },
    computed: {
        // Update cart badge reactively
        cartItemCountFromService() {
            return cartService.cartItemCount.value;
        }
    },
    watch: {
        cartItemCountFromService(newCount) {
            const cartOption = this.navOptions.find(opt => opt.icon === 'cart');
            if (cartOption) {
                cartOption.info = newCount > 0 ? newCount : null; // Show badge only if count > 0
            }
        }
    },
    onLoad(options) {
        if (options.id) {
            this.productId = options.id;
            this.fetchProductDetail();
        } else {
            uni.showToast({ title: '商品ID无效', icon: 'error' });
            uni.navigateBack();
        }
        this.updateCartBadge(); // Initial badge update
    },
    onShow() {
        this.updateCartBadge(); // Update badge when page is shown (e.g., after navigating back from cart)
    },
    methods: {
        updateCartBadge() {
             const cartOption = this.navOptions.find(opt => opt.icon === 'cart');
            if (cartOption) {
                const count = cartService.cartItemCount.value;
                cartOption.info = count > 0 ? count : null;
            }
        },
        async fetchProductDetail() {
            this.loading = true;
            try {
                const res = await getProductDetailApi(this.productId);
                // Assuming API returns: { data: { ...product details... } }
                // Adjust based on actual API response structure
                if (res && res.data) {
                    this.productDetail = res.data;
                    // Initialize selectedSkuText if applicable
                    // this.selectedSkuText = this.getDefaultSkuText();
                } else {
                    uni.showToast({ title: res?.message || '加载商品详情失败', icon: 'none' });
                    this.productDetail = null;
                }
            } catch (error) {
                uni.showToast({ title: '网络请求失败', icon: 'none' });
                console.error("fetchProductDetail error:", error);
                this.productDetail = null;
            } finally {
                this.loading = false;
            }
        },
        previewImage(index) {
            const urls = (this.productDetail.images && this.productDetail.images.length ? this.productDetail.images : [this.productDetail.image]).filter(url => !!url);
            if (urls.length > 0) {
                uni.previewImage({
                    urls: urls,
                    current: index
                });
            }
        },
        // openSkuPopup() { this.$refs.skuPopup.open(); },
        // handleSkuSelected(sku) { /* ... update selectedSkuText, price, stock ... */ this.$refs.skuPopup.close(); },

        onNavClick(e) {
            if (e.content.icon === 'cart') {
                uni.switchTab({ url: '/pages/customer/cart/index' }); // Assuming cart is a TabBar page
            }
            // Handle other nav clicks like 'shop' if implemented
        },
        onActionClick(e) {
            if (!this.productDetail) return;

            const productToAdd = {
                productId: this.productDetail.productId || this.productDetail.id, // Ensure consistent ID field
                name: this.productDetail.name,
                image: this.productDetail.image || (this.productDetail.images ? this.productDetail.images[0] : ''),
                price: this.productDetail.price, // TODO: Use selected SKU price if applicable
                stock: this.productDetail.stock, // TODO: Use selected SKU stock if applicable
                // skuId: this.selectedSku ? this.selectedSku.id : null,
                // skuText: this.selectedSkuText,
            };

            if (e.index === 0) { // 加入购物车
                cartService.addItem(productToAdd, this.selectedQuantity); // Assuming selectedQuantity is 1 or from uni-number-box
                 // Update badge explicitly, as watch might not catch all scenarios immediately
                this.updateCartBadge();

            } else if (e.index === 1) { // 立即购买
                // Simplified: Add to cart then go to checkout with only this item selected
                // Or, pass item directly to checkout page
                const tempCartItems = [{ ...productToAdd, quantity: this.selectedQuantity, selected: true }];
                uni.navigateTo({
                    url: `/pages/customer/checkout/index?from=buyNow&items=${encodeURIComponent(JSON.stringify(tempCartItems))}`
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.product-detail-container {
    padding-bottom: 60px; /* Space for bottom action bar */
    background-color: #f8f8f8;
}
.loading-state {
    padding-top: 100px;
}
.image-swiper {
    width: 100%;
    height: 375px; // 1:1 aspect ratio on 750rpx width, adjust as needed
    .swiper-image {
        width: 100%;
        height: 100%;
    }
}
.info-section {
    background-color: #fff;
    padding: 10px 15px;
    margin-bottom: 10px;
}
.product-header {
    .price-section {
        margin-bottom: 8px;
        .current-price {
            font-size: 22px;
            font-weight: bold;
            //color: $uni-color-error;
        }
        .original-price {
            font-size: 14px;
            color: #999;
            text-decoration: line-through;
            margin-left: 10px;
        }
    }
    .product-name-main {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        line-height: 1.4;
    }
    .product-subtitle {
        font-size: 13px;
        color: #666;
        margin-top: 5px;
    }
    .tags-row {
        margin-top: 8px;
    }
}
.sku-section {
    // uni-list-item will provide its own padding
    padding: 0;
}
.description-section {
    margin-bottom: 0; // Remove bottom margin if it's the last content before bar
    .description-content {
        padding: 10px;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        // For rich-text, ensure proper styling of HTML elements
        // img { max-width: 100%; }
    }
    .no-description {
        padding: 20px;
        text-align: center;
        color: #999;
    }
}
.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    // uni-goods-nav will have its own background and height
    // background-color: #fff;
    // box-shadow: 0 -1px 5px rgba(0,0,0,0.1);
}
.empty-state {
    text-align: center;
    color: #999;
    padding-top: 100px;
}
</style>