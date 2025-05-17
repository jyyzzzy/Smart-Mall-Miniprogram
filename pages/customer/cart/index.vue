<template>
    <view class="shopping-cart-container">
        <view v-if="!cartItems || cartItems.length === 0" class="empty-cart">
            <uni-icons type="cart-filled" size="60" color="#c0c0c0"></uni-icons>
            <text class="empty-text">购物车还是空的</text>
            <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
        </view>

        <scroll-view v-else scroll-y="true" class="cart-scroll-view">
            <view class="cart-item" v-for="(item, index) in cartItems" :key="item.id">
                <view class="item-selector" @click="toggleItemSelected(item)">
                    <uni-icons :type="item.selected ? 'checkbox-filled' : 'circle'" size="22" :color="item.selected ? primaryColor : '#ccc'"></uni-icons>
                </view>

                <image class="item-image" :src="item.image || '/static/default-product.png'" mode="aspectFill" @click="goToProductDetail(item.id)"></image>

                <view class="item-info">
                    <text class="item-name" @click="goToProductDetail(item.id)">{{ item.name }}</text>
                    <text class="item-specs" v-if="item.specs">{{ item.specs }}</text>
                    <view class="item-price-quantity">
                        <text class="item-price">￥{{ formatPrice(item.price) }}</text>
                        <uni-number-box
                            class="item-quantity-selector"
                            :min="1"
                            :max="item.stock || 99"
                            :value="item.quantity"
                            @change="onQuantityChange($event, item)"
                            :input-disabled="true"
                            :disabled="processingQuantityChange === item.id"
                        ></uni-number-box>
                    </view>
                </view>

                <view class="item-actions">
                    <text class="item-subtotal">小计: ￥{{ formatPrice(item.price * item.quantity) }}</text>
                    <uni-icons class="delete-icon" type="trash" size="20" color="#e43d33" @click="confirmRemoveItem(item.id, index)"></uni-icons>
                </view>
            </view>
        </scroll-view>

        <view class="bottom-bar" v-if="cartItems && cartItems.length > 0">
            <view class="select-all" @click="toggleSelectAll">
                <uni-icons :type="isAllSelected ? 'checkbox-filled' : 'circle'" size="22" :color="isAllSelected ? primaryColor : '#ccc'"></uni-icons>
                <text>全选</text>
            </view>
            <view class="total-section">
                <text class="total-label">合计:</text>
                <text class="total-amount">￥{{ formatPrice(grandTotal) }}</text>
            </view>
            <button class="checkout-button" :disabled="selectedItemsCount === 0" @click="proceedToCheckout">
                结算 ({{ selectedItemsCount }})
            </button>
        </view>
    </view>
</template>

<script>
    export default {
        name: "ShoppingCart",
        data() {
            return {
                primaryColor: '#007aff', // 默认主色调，以防SCSS变量仍无效
                processingQuantityChange: null,
                cartItems: [
                    {
                        id: 1,
                        name: '高性能运动T恤 - 透气快干',
                        image: '/static/mock/product1.jpg',
                        specs: '颜色: 深空灰, 尺码: L',
                        price: 129.00,
                        quantity: 2,
                        stock: 10,
                        selected: true,
                    },
                    {
                        id: 2,
                        name: '智能降噪无线蓝牙耳机 Pro',
                        image: '/static/mock/product2.jpg',
                        specs: '颜色: 珍珠白',
                        price: 599.00,
                        quantity: 1,
                        stock: 5,
                        selected: true,
                    },
                    {
                        id: 3,
                        name: '多功能家用榨汁机料理机',
                        image: '/static/mock/product3.jpg',
                        specs: '容量: 1.5L',
                        price: 288.50,
                        quantity: 1,
                        stock: 0,
                        selected: false,
                    }
                ]
            };
        },
        computed: {
            selectedItems() {
                return this.cartItems.filter(item => item.selected);
            },
            selectedItemsCount() {
                return this.selectedItems.length;
            },
            grandTotal() {
                return this.selectedItems.reduce((total, item) => {
                    return total + item.price * item.quantity;
                }, 0);
            },
            isAllSelected() {
                if (this.cartItems.length === 0) return false;
                return this.cartItems.every(item => item.selected);
            }
        },
        methods: {
            formatPrice(price) {
                if (typeof price !== 'number') {
                    price = parseFloat(price) || 0;
                }
                return price.toFixed(2);
            },
            fetchCartData() {
                console.log("购物车数据已加载 (模拟)");
                // 尝试获取 SCSS 变量的值，如果失败则使用 data 中的默认值
                // 注意：直接在 JS 中访问 SCSS 变量通常不可行，除非通过特定方式注入
                // this.primaryColor = getComputedStyle(this.$el).getPropertyValue('--uni-color-primary').trim() || '#007aff';
            },
            toggleItemSelected(item) {
                item.selected = !item.selected;
            },
            toggleSelectAll() {
                const targetSelectedState = !this.isAllSelected;
                this.cartItems.forEach(item => {
                    item.selected = targetSelectedState;
                });
            },
            onQuantityChange(newQuantity, item) {
                if (this.processingQuantityChange === item.id) return;
                this.processingQuantityChange = item.id;
                const quantity = parseInt(newQuantity, 10);
                if (isNaN(quantity) || quantity < 1) {
                    item.quantity = item.quantity;
                    this.processingQuantityChange = null;
                    return;
                }
                if (item.stock > 0 && quantity > item.stock) {
                     uni.showToast({ title: `最多可购买 ${item.stock} 件`, icon: 'none' });
                    item.quantity = item.stock;
                } else {
                    item.quantity = quantity;
                }
                setTimeout(() => { this.processingQuantityChange = null; }, 200);
            },
            confirmRemoveItem(itemId, index) {
                uni.showModal({
                    title: '确认删除',
                    content: '您确定要从购物车中移除该商品吗？',
                    success: (res) => { if (res.confirm) { this.removeItem(itemId, index); } }
                });
            },
            removeItem(itemId, index) {
                this.cartItems.splice(index, 1);
                uni.showToast({ title: '商品已移除', icon: 'none' });
            },
            proceedToCheckout() {
                if (this.selectedItemsCount === 0) {
                    uni.showToast({ title: '请至少选择一件商品', icon: 'none' });
                    return;
                }
                const itemsToCheckout = this.selectedItems.map(item => ({
                    id: item.id, name: item.name, price: item.price, quantity: item.quantity
                }));
                uni.setStorageSync('itemsToCheckout', itemsToCheckout);
                uni.navigateTo({ url: '/pages/orderConfirmation/orderConfirmation' });
            },
            goShopping() {
                uni.switchTab({ url: '/pages/index/index' });
            },
            goToProductDetail(productId) {
                uni.navigateTo({ url: `/pages/productDetail/productDetail?id=${productId}` });
            }
        },
        created() {
            this.fetchCartData();
        }
    }
</script>

<style scoped lang="scss">
// 尝试在组件内部导入 uni.scss，这通常能解决变量未定义的问题
@import '@/uni_modules/uni-scss/index.scss';

.shopping-cart-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.empty-cart {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #999;
    .empty-text {
        margin-top: 15px;
        font-size: 14px;
    }
    .go-shopping-btn {
        margin-top: 20px;
        //background-color: $uni-color-primary; // 使用 uni-scss 变量
         background-color: #007aff; // 如果上面 SCSS 变量无效，请取消注释此行并注释掉上一行
        color: white;
        font-size: 14px;
        padding: 0 30px;
        height: 38px;
        line-height: 38px;
        border-radius: 19px;
    }
}

.cart-scroll-view {
    flex: 1;
    padding-bottom: 110px;
    box-sizing: border-box;
}

.cart-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    margin: 10px;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.item-selector {
    padding-right: 10px;
    display: flex;
    align-items: center;
}

.item-image {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    margin-right: 10px;
    background-color: #eee;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
}

.item-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.item-specs {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
}

.item-price-quantity {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-price {
    font-size: 15px;
    color: #ff5000;
    font-weight: bold;
}

.item-quantity-selector {
    transform: scale(0.9);
    transform-origin: right;
}

.item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-left: 10px;
    min-width: 90px;
    text-align: right;
}

.item-subtotal {
    font-size: 13px;
    color: #333;
    margin-bottom: 10px;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-top: 1px solid #eee;
    box-shadow: 0 -1px 3px rgba(0,0,0,0.05);
    z-index: 100;
}

.select-all {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
    text {
        margin-left: 5px;
    }
}

.total-section {
    flex-grow: 1;
    text-align: right;
    padding-right: 10px;
}

.total-label {
    font-size: 14px;
    color: #333;
    margin-right: 5px;
}

.total-amount {
    font-size: 16px;
    color: #ff5000;
    font-weight: bold;
}

.checkout-button {
    //background-color: $uni-color-primary; // 使用 uni-scss 变量
     background-color: #007aff; // 如果上面 SCSS 变量无效，请取消注释此行并注释掉上一行
    color: white;
    font-size: 15px;
    padding: 0 20px;
    height: 38px;
    line-height: 38px;
    border-radius: 19px;
    margin: 0;
    &[disabled] {
        background-color: #e0e0e0;
        color: #999;
    }
}
</style>