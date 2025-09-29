import 'normalize.css'
import App from "@/App.vue"
import { createApp } from "vue"
import router from '@/router'
import './styles/index.css'
import "./styles/scss/index.scss";

const app = createApp(App)
app.use(router)
app.mount('#app')