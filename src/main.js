import './assets/main.css'
import './assets/flex.css'

import { createApp } from 'vue'
import App from './App.vue'

// material-design-icons-iconfont
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// sweetalert2 for global use
import Swal from 'sweetalert2'
window.Swal = Swal

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// Vuex
import {store} from './store'
app.use(store);

app.use(ElementPlus)

app.mount('#app')