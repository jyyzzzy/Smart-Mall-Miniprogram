<template>
    <view class="container">
        <uni-search-bar placeholder="搜索商户名称" @confirm="handleSearch" @cancel="handleCancelSearch" @clear="handleClearSearch" />

        <uni-list v-if="merchantList.length > 0">
            <uni-list-item
                v-for="merchant in merchantList"
                :key="merchant.id"
                :title="merchant.name"
                :note="`入驻日期: ${merchant.joinDate} | ${merchant.category}`"
                showArrow
                clickable
                @click="goToDetail(merchant.id)"
            >
                <template v-slot:header>
                     <image :src="merchant.logo || '/static/logo.png'" mode="aspectFill" style="width: 40px; height: 40px; border-radius: 5px; margin-right: 10px;"></image>
                </template>
                 <template v-slot:footer>
                    <uni-tag :text="merchant.status === 'active' ? '营业中' : '已下线'" :type="merchant.status === 'active' ? 'success' : 'default'" size="small" />
                </template>
            </uni-list-item>
        </uni-list>
        <view v-else-if="!loading" class="empty-state">暂无商户</view>
         <uni-load-more :status="loading ? 'loading' : 'noMore'" />
    </view>
</template>

<script>
import { getMallMerchantsApi } from '@/api/mall.js';
import authService from '@/store/authService';

export default {
    data() {
        return {
            merchantList: [],
            loading: false,
            searchKeyword: '',
        };
    },
    onLoad() {
        this.fetchMerchants();
    },
     onShow() {
        if (!authService.isAuthenticated.value) {
            uni.reLaunch({ url: '/pages/common/login/login' });
        }
    },
    methods: {
        async fetchMerchants() {
            this.loading = true;
            try {
                // 简单实现，未加入搜索参数
                const res = await getMallMerchantsApi({ keyword: this.searchKeyword });
                if (res.success) {
                    this.merchantList = res.data;
                } else {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' });
                }
            } catch (error) {
                uni.showToast({ title: '网络错误', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },
        handleSearch(e) {
            this.searchKeyword = e.value;
            this.fetchMerchants(); // 重新获取数据
        },
        handleCancelSearch() {
            this.searchKeyword = '';
            this.fetchMerchants();
        },
        handleClearSearch() {
             this.searchKeyword = '';
            this.fetchMerchants();
        },
        goToDetail(merchantId) {
            uni.navigateTo({
                url: `/pages/mall/merchant-management/detail?id=${merchantId}`
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    padding-bottom: 10px;
}
.empty-state {
    text-align: center;
    color: #999;
    padding: 50px 0;
}
</style>