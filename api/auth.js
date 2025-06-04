// api/auth.js (修改后版本)

/**
 * 用户登录API
 * @param {object} credentials - 包含用户凭证的对象 (例如: { username: 'xxx', password: 'yyy' })
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const loginApi = (credentials) => {
    // 登录操作应使用 POST 方法，凭证在请求体中传递
    return uni.$http.get('/auth/login', credentials);
};

/**
 * 用户注册API
 * @param {object} userData - 包含用户注册信息的对象 (例如: { username: 'xxx', password: 'yyy', email: 'zzz@example.com' })
 * @returns {Promise} uni.$http 返回的 Promise 对象
 */
export const registerApi = (userData) => { // 参数名改为 userData 更语义化
    // 注册操作使用 POST 方法，用户信息在请求体中传递，此部分是正确的
    return uni.$http.post('/auth/register', userData);
};