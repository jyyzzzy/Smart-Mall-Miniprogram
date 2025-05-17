// api/merchant.js
// 假设 uni.$http 已全局配置好

/**
 * 获取当前登录用户管理的商户列表
 * GET /api/user/merchants
 * @returns {Promise}
 */
export const getUserMerchantsApi = () => {
    return uni.$http.get('/api/user/merchants');
};

/**
 * 创建新的商户实体
 * POST /api/merchants
 * @param {object} data - 创建商户所需的资料 (name, description, logo?, address?, etc.)
 * @returns {Promise}
 */
export const createMerchantApi = (data) => {
    return uni.$http.post('/api/merchants', data);
};

// --- 以下 API 均针对特定 merchantId ---

/**
 * 获取指定商户的仪表盘数据
 * GET /api/merchants/{merchantId}/dashboard
 * @param {string} merchantId
 * @returns {Promise}
 */
export const getMerchantDashboardApi = (merchantId) => {
    return uni.$http.get(`/api/merchants/${merchantId}/dashboard`);
};

/**
 * 获取指定商户的资料
 * GET /api/merchants/{merchantId}/profile
 * @param {string} merchantId
 * @returns {Promise}
 */
export const getMerchantProfileApi = (merchantId) => {
    return uni.$http.get(`/api/merchants/${merchantId}/profile`);
};

/**
 * 更新指定商户的资料
 * PUT /api/merchants/{merchantId}/profile
 * @param {string} merchantId
 * @param {object} data - 要更新的商户资料
 * @returns {Promise}
 */
export const updateMerchantProfileApi = (merchantId, data) => {
    return uni.$http.put(`/api/merchants/${merchantId}/profile`, data);
};

/**
 * 获取指定商户的商品列表
 * GET /api/merchants/{merchantId}/products
 * @param {string} merchantId
 * @param {object} params - 查询参数 (分页, 搜索, 筛选)
 * @returns {Promise}
 */
export const getMerchantProductsApi = (merchantId, params) => {
    return uni.$http.get(`/api/merchants/${merchantId}/products`, params);
};

/**
 * 获取指定商品详情 (通常可以直接用通用商品接口，但需后端验证权限)
 * GET /api/products/{productId}
 * @param {string} productId
 * @returns {Promise}
 */
export const getProductDetailApi = (productId) => {
    return uni.$http.get(`/api/products/${productId}`);
};


/**
 * 为指定商户创建新商品
 * POST /api/merchants/{merchantId}/products
 * @param {string} merchantId
 * @param {object} data - 商品数据
 * @returns {Promise}
 */
export const createProductApi = (merchantId, data) => {
    return uni.$http.post(`/api/merchants/${merchantId}/products`, data);
};

/**
 * 更新指定商品信息
 * PUT /api/products/{productId}
 * @param {string} productId
 * @param {object} data - 要更新的商品数据
 * @returns {Promise}
 */
export const updateProductApi = (productId, data) => {
    return uni.$http.put(`/api/products/${productId}`, data);
};

/**
 * 删除指定商品
 * DELETE /api/products/{productId}
 * @param {string} productId
 * @returns {Promise}
 */
export const deleteProductApi = (productId) => {
    return uni.$http.delete(`/api/products/${productId}`);
};

/**
 * 获取指定商户的订单列表
 * GET /api/merchants/{merchantId}/orders
 * @param {string} merchantId
 * @param {object} params - 查询参数 (分页, 搜索, 筛选)
 * @returns {Promise}
 */
export const getMerchantOrdersApi = (merchantId, params) => {
    return uni.$http.get(`/api/merchants/${merchantId}/orders`, params);
};

/**
 * 获取指定订单详情 (需验证商户权限)
 * GET /api/orders/{orderId}
 * @param {string} orderId
 * @returns {Promise}
 */
export const getOrderDetailApi = (orderId) => {
    return uni.$http.get(`/api/orders/${orderId}`);
};

/**
 * 更新订单状态 (例如：发货)
 * POST /api/orders/{orderId}/status
 * @param {string} orderId
 * @param {object} data - 例如 { status: 'shipped', trackingNumber: 'SF123...' }
 * @returns {Promise}
 */
export const updateOrderStatusApi = (orderId, data) => {
    // 使用 POST 或 PUT 根据后端设计，POST 更常用于执行动作
    return uni.$http.post(`/api/orders/${orderId}/status`, data);
};


/**
 * 获取指定商户的商城关联状态
 * GET /api/merchants/{merchantId}/mall-association
 * @param {string} merchantId
 * @returns {Promise}
 */
export const getMallAssociationApi = (merchantId) => {
    return uni.$http.get(`/api/merchants/${merchantId}/mall-association`);
};

/**
 * 提交加入商城的申请
 * POST /api/merchants/{merchantId}/mall-applications
 * @param {string} merchantId
 * @param {object} data - 例如 { mallId: 'mall001', applicationReason: '...' }
 * @returns {Promise}
 */
export const applyToMallApi = (merchantId, data) => {
    return uni.$http.post(`/api/merchants/${merchantId}/mall-applications`, data);
};


// --- 预留接口定义 (暂不实现页面) ---

/**
 * 获取商户促销活动列表
 * GET /api/merchants/{merchantId}/promotions
 */
export const getMerchantPromotionsApi = (merchantId, params) => {
    console.warn('API function getMerchantPromotionsApi is defined but not implemented.');
    return Promise.reject('Not implemented');
    // return uni.$http.get(`/api/merchants/${merchantId}/promotions`, params);
};

/**
 * 获取商户数据统计
 * GET /api/merchants/{merchantId}/analytics
 */
export const getMerchantAnalyticsApi = (merchantId, params) => {
     console.warn('API function getMerchantAnalyticsApi is defined but not implemented.');
     return Promise.reject('Not implemented');
    // return uni.$http.get(`/api/merchants/${merchantId}/analytics`, params);
};