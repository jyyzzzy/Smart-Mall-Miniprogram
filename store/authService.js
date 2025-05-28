// store/authService.js
import { reactive, computed } from 'vue';
import { loginApi, registerApi } from '@/api/auth.js'; // 确保路径正确

// 假设的本地存储辅助函数 (通常在 utils/storage.js 中定义)
// 如果没有封装，可以直接在下面代码中使用 uni.setStorageSync/uni.getStorageSync
const STORAGE_USER_KEY = 'APP_USER_INFO';
const STORAGE_AUTH_FLAG_KEY = 'APP_IS_AUTHENTICATED'; // 可选的独立认证标记

const persistUserInfo = (userInfo) => {
    uni.setStorageSync(STORAGE_USER_KEY, JSON.stringify(userInfo));
    uni.setStorageSync(STORAGE_AUTH_FLAG_KEY, true); // 标记为已认证
};

const getPersistedUserInfo = () => {
    const userInfoStr = uni.getStorageSync(STORAGE_USER_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
};

const clearPersistedAuthData = () => {
    uni.removeStorageSync(STORAGE_USER_KEY);
    uni.removeStorageSync(STORAGE_AUTH_FLAG_KEY);
};


// 内部响应式状态
const state = reactive({
    userInfo: getPersistedUserInfo(), // 初始化时从存储加载
    isAuthenticated: uni.getStorageSync(STORAGE_AUTH_FLAG_KEY) === true, // 初始化认证状态
});

// 计算属性 (Getters)
const currentUser = computed(() => state.userInfo);
const isAuthenticated = computed(() => state.isAuthenticated);
const userRole = computed(() => state.userInfo?.role || null);


// 方法 (Actions & Mutations 混合)
async function login(credentials) {
    try {
        // 假设 loginApi 返回的是 uni.request 的原始响应或经过拦截器处理的包含 statusCode 和 data 的对象
        const response = await loginApi(credentials);

        // !! 请根据您的 uni.$http 实际返回结构调整此处的判断和数据提取 !!
        // 常见情况1: uni.request 直接返回，response = { data: {实际后端数据}, statusCode, header, ... }
        // 常见情况2: 拦截器已处理，response = 实际后端数据, statusCode 在 error 中或通过其他方式判断
        
        // 此处假设 loginApi 成功时，response.data 包含 { success: true, data: { 用户对象 }, message: "..." }
        // 或者如您代码所示，直接判断 statusCode，且用户对象在 response.data.data
        if (response && response.statusCode === 200 && response.data && response.data.data) {
			console.log(response);
            state.userInfo = response.data;
            state.isAuthenticated = true;
            persistUserInfo(state.userInfo); // 持久化用户信息和认证状态
            return Promise.resolve(state.userInfo); // 返回用户信息对象
        } else {
            // 提取错误信息，如果 response.data.message 存在则使用
            const message = response?.data?.message || `认证失败 (状态码: ${response?.statusCode})`;
            return Promise.reject(new Error(message));
        }
    } catch (error) {
        // error 对象通常是 uni.request fail 回调的参数，或者 Promise.reject 的内容
        // error.errMsg 是 uni.request fail 时会有的
        // 如果是后端返回的业务错误，且拦截器中 Promise.reject(error.data)，那么 error 就是 error.data
        const errorMessage = error?.data?.message || error?.errMsg || error?.message || `登录请求异常 (状态码: ${error?.statusCode})`;
        return Promise.reject(new Error(errorMessage));
    }
}

async function register(userData) {
    try {
        const response = await registerApi(userData);
        // 与 login 类似，根据实际 API 响应结构调整
        if (response && response.statusCode === 200 && response.data) {
            // 注册成功后通常也应返回用户信息并自动登录
            // 假设 response.data.data 是用户信息
            if (response.data.data) {
                state.userInfo = response.data.data;
                state.isAuthenticated = true;
                persistUserInfo(state.userInfo);
                return Promise.resolve(state.userInfo);
            }
            return Promise.resolve(response.data); // 或仅返回成功消息
        } else {
            const message = response?.data?.message || `注册失败 (状态码: ${response?.statusCode})`;
            return Promise.reject(new Error(message));
        }
    } catch (error) {
        const errorMessage = error?.data?.message || error?.errMsg || error?.message || `注册请求异常 (状态码: ${error?.statusCode})`;
        return Promise.reject(new Error(errorMessage));
    }
}

function logout() {
    state.userInfo = null;
    state.isAuthenticated = false;
    clearPersistedAuthData();

    uni.reLaunch({
        url: '/pages/common/login/index' // 确保路径正确
    });
}

function tryAutoLogin() {
    // 此方法在 App.vue onLaunch 时调用，用于恢复登录状态
    const persistedUser = getPersistedUserInfo();
    const persistedAuthFlag = uni.getStorageSync(STORAGE_AUTH_FLAG_KEY) === true;

    if (persistedUser && persistedAuthFlag) {
        state.userInfo = persistedUser;
        state.isAuthenticated = true;
        console.log('AuthService: Auto login successful for', state.userInfo?.username);
        return state.userInfo?.role || null;
    }
    // 如果未找到持久化信息或认证标记为false，则确保状态已清除
    state.userInfo = null;
    state.isAuthenticated = false;
    console.log('AuthService: No valid session found for auto login.');
    return null;
}

// 导出，供其他模块或页面使用
export default {
    // 响应式状态的计算属性 (推荐通过这些访问)
    currentUser,
    isAuthenticated,
    userRole,

    // 方法
    login,
    register,
    logout,
    tryAutoLogin,

    // (可选) 直接暴露 state，但不推荐，因为外部可以直接修改，破坏封装性
    // state, 
};