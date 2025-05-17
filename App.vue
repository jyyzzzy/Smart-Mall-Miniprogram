<script>
import authService from '@/store/authService'; // 引入 AuthService

export default {
    onLaunch: async function() {
            console.log('App Launch');
    
            // 调试开关和目标页面配置
            const DEBUG_SKIP_LOGIN = true; // !!! 上线前务必改为 false !!!
            const DEBUG_TARGET_ROLE = 'admin'; // 'admin', 'mall', 'merchant', 'customer'
            const DEBUG_MOCK_USER_INFO = { // 模拟的用户信息
                admin: { id: 'admin007', username: 'debug_admin', name: '调试管理员', role: 'admin' },
                mall: { id: 'mall_debug', username: 'debug_mall_user', name: '调试商场', role: 'mall', mallId: 'M001' }, // mallId 可能需要
                merchant: { 
                    id: 'merch_debug_user', username: 'debug_merchant_user', name: '调试商户用户', role: 'merchant',
                    // 如果商户直接管理一个店铺，或者需要模拟 merchantContextService 的状态
                    // merchantId: 'S001', merchantName: '调试店铺' 
                },
                customer: { id: 'cust_debug', username: 'debug_customer', name: '调试顾客', role: 'customer' }
            };
            const DEBUG_TARGET_PAGES = {
                admin: '/pages/admin/dashboard/index',
                mall: '/pages/mall/dashboard/index',
                merchant: '/pages/merchant/selection/index', // 商户通常先到选择页或仪表盘
                // merchant: '/pages/merchant/dashboard/index', // 如果直接跳仪表盘，需要模拟 merchantContextService
                customer: '/pages/customer/index/index'
            };
    
            if (process.env.NODE_ENV === 'development' && DEBUG_SKIP_LOGIN) {
                const mockUser = DEBUG_MOCK_USER_INFO[DEBUG_TARGET_ROLE];
                const targetPage = DEBUG_TARGET_PAGES[DEBUG_TARGET_ROLE];
    
                if (mockUser && targetPage) {
                    console.warn(`DEBUG MODE: Skipping login. Simulating ${DEBUG_TARGET_ROLE} user.`);
                    // 1. 模拟登录状态到本地存储
                    uni.setStorageSync('APP_USER_INFO', JSON.stringify(mockUser));
                    // 如果 authService 有 isAuthenticated 标记，也需要模拟
                    // uni.setStorageSync('APP_IS_AUTHENTICATED', true); // 假设有这个标记
    
                    // 2. 更新 authService 状态 (重要!)
                    // 理想情况下 authService 有一个 setDebugUser 方法，或者直接操作其内部状态
                    if (authService.setDebugUser) { // 假设 authService 有此方法
                        authService.setDebugUser(mockUser, true);
                    } else { // 否则，直接修改其响应式 state (如果允许，通常不推荐直接修改)
                           // 或依赖其 tryAutoLogin 逻辑能从 storage 正确恢复
                        authService.state.userInfo = mockUser; 
                        authService.state.isAuthenticated = true; // 假设 authService 有此状态
                    }
    
                    // 特别注意：如果跳转的是商户的非 selection 页面 (如 dashboard)，
                    // 且该页面依赖 merchantContextService.selectedMerchantId，
                    // 则还需要模拟 merchantContextService 的状态。
                    if (DEBUG_TARGET_ROLE === 'merchant' && targetPage !== '/pages/merchant/selection/index') {
                        const merchantContextService = (await import('@/store/merchantContextService')).default; // 异步导入
                        const mockManagedMerchants = [{ id: 'S001', name: '我的调试店铺', /* ...其他店铺信息 */ }];
                        const mockSelectedMerchantId = 'S001';
    
                        merchantContextService.context.managedMerchants = mockManagedMerchants;
                        merchantContextService.setSelectedMerchant(mockSelectedMerchantId); // 这会更新 context 和 storage
                        console.warn(`DEBUG MODE: Merchant context set for ${mockSelectedMerchantId}`);
                    }
    
    
                    uni.reLaunch({ url: targetPage });
                } else {
                    console.error("DEBUG MODE: Invalid DEBUG_TARGET_ROLE or mock user/page not defined.");
                    // 正常启动流程
                    await authService.tryAutoLogin();
                }
            } else {
                // 正常启动流程
                await authService.tryAutoLogin();
                // 初始页面跳转逻辑通常由首页的 onShow 或路由守卫处理
            }
        },
    onShow: function() {
        console.log('App Show');
    },
    onHide: function() {
        console.log('App Hide');
    }
}
</script>

<style lang="scss">
/* uni.scss */
/* uni-ui 全局样式也可能在这里或 uni.scss 引入，取决于你的项目配置 */
/* 例如：@import '@/uni_modules/uni-scss/variables.scss'; */

/*每个页面公共css */
page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8f8f8;
    font-size: 16px;
    color: #333;
}
.container {
    padding: 15px;
    box-sizing: border-box;
}
</style>