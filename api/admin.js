// api/admin.js
import { request } from '@/utils/request';

/**
 * 获取用户列表 (管理员)
 * @param {object} params - 查询参数，例如 { page: 1, pageSize: 10, role: 'merchant' }
 * @returns {Promise}
 */
export const fetchUsersApi = (params) => {
    return request({
        url: '/api/admin/users',
        method: 'GET', // 通常列表用 GET
        data: params // GET 请求参数通常放在 data 或 params 中，取决于 request 封装
    });
};

// 未来可以添加其他管理员API，例如：
// export const approveUserApi = (userId) => { ... };
// export const updateUserApi = (userId, data) => { ... };
// export const deleteUserApi = (userId) => { ... };