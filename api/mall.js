// api/mall.js

/**
 * 获取商场仪表盘数据
 * GET /api/mall/dashboard
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallDashboardApi = () => {
    // GET 请求，通常没有请求体，参数通过 URL 或查询字符串传递 (这里无参数)
    return uni.$http.get('/api/mall/dashboard');
};

/**
 * 获取商场资料
 * GET /api/mall/profile
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallProfileApi = () => {
    return uni.$http.get('/api/mall/profile');
};

/**
 * 更新商场资料
 * PUT /api/mall/profile
 * @param {object} data - 包含要更新的商场资料的对象
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const updateMallProfileApi = (data) => {
    // PUT 请求，将更新的数据放在请求体中
    return uni.$http.put('/api/mall/profile', data);
};

/**
 * 获取入驻商户列表
 * GET /api/mall/merchants
 * @param {object} params - 查询参数，例如 { page: 1, pageSize: 10, keyword: '水果', status: 'active' }
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallMerchantsApi = (params) => {
    // GET 请求，第二个参数通常作为查询参数 (query parameters) 附加到 URL 上
    return uni.$http.get('/api/mall/merchants', params);
};

/**
 * 获取商户详情
 * GET /api/mall/merchants/{merchantId}
 * @param {string} merchantId - 要查询的商户 ID
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMerchantDetailApi = (merchantId) => {
    // 使用模板字符串动态构建 URL
    return uni.$http.get(`/api/mall/merchants/${merchantId}`);
};

/**
 * 获取待审核商户列表
 * GET /api/mall/merchants/audit
 * @param {object} params - 可选的查询参数，例如 { page: 1, pageSize: 10 }
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getAuditMerchantsApi = (params) => {
    return uni.$http.get('/api/mall/merchants/audit', params);
};

/**
 * 处理商户审核（通过或驳回）
 * POST /api/mall/merchants/audit/{auditId}
 * @param {string} auditId - 要处理的审核记录 ID
 * @param {string} action - 操作指令 ('approve' 或 'reject')
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const handleMerchantAuditApi = (auditId, action) => {
    // POST 请求，通常用于执行一个动作或创建资源
    // 将操作指令 'action' 放在请求体中
    return uni.$http.post(`/api/mall/merchants/audit/${auditId}`, { action });
};

/**
 * 获取商场内商品列表
 * GET /api/mall/products
 * @param {object} params - 查询参数，例如 { page: 1, pageSize: 10, category: '生鲜', merchantId: 'm001' }
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallProductsApi = (params) => {
    return uni.$http.get('/api/mall/products', params);
};

/**
 * 获取商场内订单列表
 * GET /api/mall/orders
 * @param {object} params - 查询参数，例如 { page: 1, pageSize: 10, status: 'completed', dateStart: '2024-01-01' }
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallOrdersApi = (params) => {
    return uni.$http.get('/api/mall/orders', params);
};

/**
 * 获取订单详情
 * GET /api/mall/orders/{orderId}
 * @param {string} orderId - 要查询的订单 ID
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const getMallOrderDetailApi = (orderId) => {
    return uni.$http.get(`/api/mall/orders/${orderId}`);
};

// 注意：如果需要 DELETE 操作，例如删除某个商户（假设有此功能），可以这样定义：
/**
 * (示例) 删除商户
 * DELETE /api/mall/merchants/{merchantId}
 * @param {string} merchantId - 要删除的商户 ID
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
// export const deleteMerchantApi = (merchantId) => {
//     // DELETE 请求通常没有请求体
//     return uni.$http.delete(`/api/mall/merchants/${merchantId}`);
// };