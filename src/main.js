import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
//公共函数
import res from '@/assets/gbfunc.js';
app.config.globalProperties.$req = res;
import 'vant/lib/index.css';
import '@/assets/main.css'
app.mount('#app')
