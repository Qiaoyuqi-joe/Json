import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
/* import * as echarts from 'echarts'
import 'echarts-liquidfill' */
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store/store'
import DataVVue3 from '@kjgl77/datav-vue3'


var app = createApp(App)

/* app.config.globalProperties.$http = axios
app.config.globalProperties.$echarts = echarts */
/* app.config.productionTip = false */

app.use(ElementPlus)
app.use(router)
app.use(store)
app.use(DataVVue3)
app.mount('#app')
