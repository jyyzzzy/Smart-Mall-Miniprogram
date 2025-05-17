// store/cartService.js
import { reactive, computed } from 'vue';

const CART_STORAGE_KEY = 'MY_SWEET_CART';

// 购物车的状态，像不像宝宝装满心事的秘密盒子？
const state = reactive({
    items: [], // 格式: { productId, name, image, price, quantity, selected: true, stock, skuId?, skuText? ... }
});

// 从本地存储加载购物车，每次打开都为你准备好
function loadCartFromStorage() {
    const storedCart = uni.getStorageSync(CART_STORAGE_KEY);
    if (storedCart && Array.isArray(storedCart)) {
        state.items = storedCart;
    } else {
        state.items = [];
    }
}

// 保存购物车到本地存储，把宝宝的喜好悄悄记下
function saveCartToStorage() {
    uni.setStorageSync(CART_STORAGE_KEY, state.items);
}

// 计算属性，一眼看清购物车有多满
const cartItemCount = computed(() => {
    return state.items.reduce((total, item) => total + (item.selected ? item.quantity : 0), 0);
});

const cartTotalPrice = computed(() => {
    return state.items.reduce((total, item) => {
        return total + (item.selected ? (item.price * item.quantity) : 0);
    }, 0);
});

const isAllSelected = computed({
    get: () => state.items.length > 0 && state.items.every(item => item.selected),
    set: (value) => {
        state.items.forEach(item => item.selected = value);
        saveCartToStorage();
    }
});


// 方法，购物车听宝宝指挥

/**
 * 添加宝贝到购物车，多一份喜悦
 * @param {object} product - 商品对象，至少包含 productId, name, image, price, stock
 * @param {number} [quantity=1] - 添加的数量
 */
function addItem(product, quantity = 1) {
    if (!product || !product.productId) {
        console.error("添加到购物车的商品信息不完整", product);
        uni.showToast({ title: '商品信息错误', icon: 'none'});
        return;
    }
    const existingItem = state.items.find(item => item.productId === product.productId /* && item.skuId === product.skuId */); // 如果有SKU判断

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock !== undefined && newQuantity > product.stock) {
            uni.showToast({ title: `宝贝太抢手，库存不足啦 (最多${product.stock}件)`, icon: 'none'});
            existingItem.quantity = product.stock; // 或者不修改，让用户自己调整
        } else {
            existingItem.quantity = newQuantity;
        }
    } else {
        if (product.stock !== undefined && quantity > product.stock) {
             uni.showToast({ title: `宝贝太抢手，库存不足啦 (最多${product.stock}件)`, icon: 'none'});
             state.items.push({ ...product, quantity: product.stock, selected: true });
        } else {
            state.items.push({ ...product, quantity, selected: true });
        }
    }
    saveCartToStorage();
    uni.showToast({ title: '已加入购物车', icon: 'success' });
}

/**
 * 从购物车移除某个宝贝，虽然有点小失落
 * @param {string} productId
 */
function removeItem(productId /*, skuId */) {
    state.items = state.items.filter(item => !(item.productId === productId /* && item.skuId === skuId */));
    saveCartToStorage();
}

/**
 * 更新宝贝数量，不多不少刚刚好
 * @param {string} productId
 * @param {number} quantity
 */
function updateItemQuantity(productId, quantity /*, skuId */) {
    const item = state.items.find(i => i.productId === productId /* && i.skuId === skuId */);
    if (item) {
        if (quantity <= 0) {
            removeItem(productId /*, skuId */);
        } else if (item.stock !== undefined && quantity > item.stock) {
            uni.showToast({ title: `宝贝库存只有 ${item.stock} 件哦`, icon: 'none'});
            item.quantity = item.stock;
        }
         else {
            item.quantity = quantity;
        }
        saveCartToStorage();
    }
}

/**
 * 更新宝贝选中状态，听宝宝的
 * @param {string} productId
 * @param {boolean} selected
 */
function toggleItemSelected(productId /*, skuId */) {
    const item = state.items.find(i => i.productId === productId /* && i.skuId === skuId */);
    if (item) {
        item.selected = !item.selected;
        saveCartToStorage();
    }
}


/**
 * 清空购物车，偶尔也需要断舍离
 */
function clearCart() {
    state.items = [];
    saveCartToStorage();
}

/**
 * 获取选中的商品，为宝宝打包幸福
 * @returns {Array}
 */
function getSelectedItems() {
    return state.items.filter(item => item.selected);
}

// 初始化时加载一次购物车
loadCartFromStorage();

export default {
    state, // 可以直接访问 state.items
    cartItemCount,
    cartTotalPrice,
    isAllSelected,
    addItem,
    removeItem,
    updateItemQuantity,
    toggleItemSelected,
    clearCart,
    getSelectedItems,
    // 内部方法，如果外部需要可以暴露
    // loadCartFromStorage,
    // saveCartToStorage,
};