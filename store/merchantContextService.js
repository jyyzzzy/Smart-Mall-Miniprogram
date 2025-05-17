// store/merchantContextService.js
import { reactive, computed } from 'vue';
import { getUserMerchantsApi } from '@/api/merchant.js';
// 不再需要从 @/utils/storage 导入特定的存储封装 (除非你有通用封装)

const STORAGE_KEY = 'CURRENT_MERCHANT_ID';

// 创建响应式状态
const context = reactive({
    managedMerchants: [],
    selectedMerchantId: uni.getStorageSync(STORAGE_KEY) || null, // 直接使用 uni API
    loading: false,
    initialized: false,
});

// 计算属性 (getters)
const selectedMerchant = computed(() => {
    if (!context.selectedMerchantId || context.managedMerchants.length === 0) {
        return null;
    }
    return context.managedMerchants.find(m => m.id === context.selectedMerchantId);
});

const hasManagedMerchants = computed(() => context.managedMerchants.length > 0);

// 方法
async function loadManagedMerchants() {
    if (context.loading) return;
    context.loading = true;
    try {
        const res = await getUserMerchantsApi();
        if (res && Array.isArray(res.data)) {
            context.managedMerchants = res.data;
            const currentExists = context.managedMerchants.some(m => m.id === context.selectedMerchantId);
            if (!currentExists && context.managedMerchants.length > 0) {
                setSelectedMerchant(context.managedMerchants[0].id);
            } else if (context.managedMerchants.length === 0) {
                 setSelectedMerchant(null);
            }
            context.initialized = true;
            return context.managedMerchants;
        } else {
            console.error("Failed to load managed merchants:", res?.message);
            context.managedMerchants = [];
            setSelectedMerchant(null);
            context.initialized = true;
            return [];
        }
    } catch (error) {
        console.error("Error loading managed merchants:", error);
        context.managedMerchants = [];
        setSelectedMerchant(null);
        context.initialized = true;
        return [];
    } finally {
        context.loading = false;
    }
}

function setSelectedMerchant(merchantId) {
    if (context.selectedMerchantId !== merchantId) {
        context.selectedMerchantId = merchantId;
        if (merchantId) {
            uni.setStorageSync(STORAGE_KEY, merchantId); // 直接使用 uni API
            console.log(`Merchant context switched to: ${merchantId}`);
        } else {
            uni.removeStorageSync(STORAGE_KEY); // 直接使用 uni API
             console.log(`Merchant context cleared.`);
        }
    }
}

function clearMerchantContext() {
     context.managedMerchants = [];
     context.selectedMerchantId = null;
     context.initialized = false;
     uni.removeStorageSync(STORAGE_KEY); // 直接使用 uni API
}

export default {
    context,
    selectedMerchant,
    hasManagedMerchants,
    loadManagedMerchants,
    setSelectedMerchant,
    clearMerchantContext,
};