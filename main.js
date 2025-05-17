/*
// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif
*/
// #ifdef VUE3
import { createSSRApp } from 'vue';
import { $http } from '@escook/request-miniprogram';
import App from './App.vue';
//import store from './store';
// 在 uni-app 项目中，可以把 $http 挂载到 uni 顶级对象之上，方便全局调用
uni.$http = $http
$http.baseUrl = 'http://localhost:8080'

// // 请求开始之前做一些事情
// $http.beforeRequest = function (options) {
//   wx.showLoading({
//     title: '数据加载中...',
//   })
// }
// // 请求完成之后做一些事情
// $http.afterRequest = function () {
//   uni.hideLoading()
// }
export function createApp() {
  const app = createSSRApp(App);
  //app.use(store);
  return {
    app
  };
}

// #endif