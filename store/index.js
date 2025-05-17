// store/index.js
// #ifdef VUE3
import { createStore } from 'vuex';
// #endif
// #ifndef VUE3
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
// #endif

import authModule from './modules/auth'; // 引入auth模块

// #ifdef VUE3
const store = createStore({
    modules: {
        auth: authModule,
        // ...其他模块
    },
    // Vue 3 的 Vuex 也可以有全局的 state, getters, mutations, actions
});
// #endif

// #ifndef VUE3
const store = new Vuex.Store({
    modules: {
        auth: authModule,
    },
});
// #endif


export default store;