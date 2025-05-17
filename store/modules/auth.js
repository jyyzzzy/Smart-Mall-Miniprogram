// store/modules/auth.js
import { loginApi, registerApi } from '@/api/auth';
import { setToken, getToken, removeToken, setUserInfo, getUserInfo, clearAuthStorage } from '@/utils/storage';

const state = {
    token: getToken() || null,
    userInfo: getUserInfo() || null,
};

const getters = {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.userInfo,
    userRole: state => state.userInfo ? state.userInfo.role : null,
};

const mutations = {
    SET_TOKEN(state, token) {
        state.token = token;
        setToken(token);
    },
    SET_USER_INFO(state, userInfo) {
        state.userInfo = userInfo;
        setUserInfo(userInfo);
    },
    LOGOUT(state) {
        state.token = null;
        state.userInfo = null;
        clearAuthStorage();
    },
};

const actions = {
    async login({ commit }, credentials) {
        try {
            const response = await loginApi(credentials); // { code, data, message }
            if (response.code === 0 && response.data) {
                commit('SET_TOKEN', response.data.token);
                commit('SET_USER_INFO', response.data.user);
                return Promise.resolve(response.data.user);
            } else {
                return Promise.reject(response.message || '登录失败');
            }
        } catch (error) {
             // error 可能是 { code, message } 或仅字符串
            const message = error.message || (typeof error === 'string' ? error : '登录请求异常');
            return Promise.reject(message);
        }
    },

    async register({ commit }, userData) {
        try {
            const response = await registerApi(userData);
            if (response.code === 0 && response.data) {
                commit('SET_TOKEN', response.data.token);
                commit('SET_USER_INFO', response.data.user);
                return Promise.resolve(response.data.user);
            } else {
                return Promise.reject(response.message || '注册失败');
            }
        } catch (error) {
            const message = error.message || (typeof error === 'string' ? error : '注册请求异常');
            return Promise.reject(message);
        }
    },

    logout({ commit }) {
        commit('LOGOUT');
        uni.reLaunch({ url: '/pages/common/login/login' });
    },

    tryAutoLogin({ commit }) {
        const token = getToken();
        const userInfo = getUserInfo();
        if (token && userInfo) {
            commit('SET_TOKEN', token);
            commit('SET_USER_INFO', userInfo);
            return userInfo.role;
        }
        return null;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};