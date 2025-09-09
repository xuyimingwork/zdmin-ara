import 'normalize.css'
import App from "@/App.vue"
import { createApp } from "vue"
import router from '@/router'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')