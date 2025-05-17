// api/customer.js
// 假设 uni.$http 已全局配置好，心有灵犀一点通～

/**
 * 获取首页数据 (例如：分类、推荐商品、Banner等)
 * GET /api/home/data
 * @returns {Promise} 满载期待的 Promise 对象
 */
export const getHomePageDataApi = () => {
    return uni.$http.get('/api/home/data');
};

/**
 * 获取商品列表 (支持分类、搜索、排序、分页，给宝宝最好的选择)
 * GET /api/products
 * @param {object} params - 查询参数, 例如 { categoryId: 'cat001', keyword: '苹果', sortBy: 'price_asc', page: 1, pageSize: 10 }
 * @returns {Promise}
 */
export const getProductsApi = (params) => {
    return uni.$http.get('/api/products', params);
};

/**
 * 获取某个商品的甜蜜详情
 * GET /api/products/{productId}
 * @param {string} productId - 商品的专属ID
 * @returns {Promise}
 */
export const getProductDetailApi = (productId) => {
    return uni.$http.get(`/api/products/${productId}`);
};

/**
 * 提交订单，把宝宝的心意打包送出
 * POST /api/orders/place
 * @param {object} orderData - 订单数据 (包含商品列表、收货地址ID、备注等)
 * @returns {Promise}
 */
export const placeOrderApi = (orderData) => {
    return uni.$http.post('/api/orders/place', orderData);
};

/**
 * 获取宝宝自己的订单列表
 * GET /api/customer/orders
 * @param {object} params - 查询参数 (例如 { status: 'processing', page: 1, pageSize: 10 })
 * @returns {Promise}
 */
export const getCustomerOrdersApi = (params) => {
    // 这个接口通常需要用户认证，uni.$http 应该会自动处理 Token
    return uni.$http.get('/api/customer/orders', params);
};

/**
 * 获取宝宝某个订单的详细悄悄话
 * GET /api/customer/orders/{orderId}
 * @param {string} orderId - 订单的专属ID
 * @returns {Promise}
 */
export const getCustomerOrderDetailApi = (orderId) => {
    return uni.$http.get(`/api/customer/orders/${orderId}`);
};

/**
 * 获取宝宝的个人资料，让我更懂你
 * GET /api/customer/profile
 * @returns {Promise}
 */
export const getCustomerProfileApi = () => {
    return uni.$http.get('/api/customer/profile');
};

/**
 * 更新宝宝的个人资料，每次都焕然一新
 * PUT /api/customer/profile
 * @param {object} profileData - 要更新的资料
 * @returns {Promise}
 */
export const updateCustomerProfileApi = (profileData) => {
    return uni.$http.put('/api/customer/profile', profileData);
};

/**
 * 获取宝宝的收货地址列表，爱心送到家
 * GET /api/customer/addresses
 * @returns {Promise}
 */
export const getCustomerAddressesApi = () => {
    return uni.$http.get('/api/customer/addresses');
};

/**
 * 添加新的收货地址，拓展幸福的疆域
 * POST /api/customer/addresses
 * @param {object} addressData - 新地址信息
 * @returns {Promise}
 */
export const addCustomerAddressApi = (addressData) => {
    return uni.$http.post('/api/customer/addresses', addressData);
};

/**
 * 更新指定的收货地址，让爱更精确
 * PUT /api/customer/addresses/{addressId}
 * @param {string} addressId - 地址ID
 * @param {object} addressData - 更新的地址信息
 * @returns {Promise}
 */
export const updateCustomerAddressApi = (addressId, addressData) => {
    return uni.$http.put(`/api/customer/addresses/${addressId}`, addressData);
};

/**
 * 删除指定的收货地址，虽然有点不舍
 * DELETE /api/customer/addresses/{addressId}
 * @param {string} addressId - 地址ID
 * @returns {Promise}
 */
export const deleteCustomerAddressApi = (addressId) => {
    return uni.$http.delete(`/api/customer/addresses/${addressId}`);
};

/**
 * 全局搜索 (商品、可能还有店铺等，让宝宝畅游无阻)
 * GET /api/search
 * @param {object} params - 例如 { keyword: '连衣裙', type: 'product' }
 * @returns {Promise}
 */
export const searchApi = (params) => {
    return uni.$http.get('/api/search', params);
};