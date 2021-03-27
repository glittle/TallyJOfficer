import Vue from 'vue'
import router from './router'
import './registerServiceWorker'
import i18n from './i18n'
import App from './App.vue'
import _shared from "@/shared.js";

Vue.config.productionTip = false

new Vue({
    router,
    i18n,
    computed: {
        shared() {
            return _shared;
        }
    },
    render: h => h(App),
}).$mount('#app')