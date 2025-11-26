import 'normalize.css'
import App from "@/App.vue"
import { createApp } from "vue"
import router from '@/router'
import './styles/index.css'
import "./styles/scss/index.scss";
import axios from 'axios'
import { useAsyncData } from 'vue-asyncx'

const { meta } = useAsyncData('meta', () => axios('/meta.json').then(res => res.data).catch(() => ''), { immediate: true })

watch(meta, () => {
  if (!chrome) return
  chrome.action.setBadgeText({
    text: meta.value?.source || ''
  })
}, { immediate: true })


const initialLocation = (document.querySelector('meta[name="router-initial-location"]') as HTMLMetaElement)?.content
router.isReady().then(() => {
  if (initialLocation) router.push(initialLocation);
  app.mount('#app')
}) 

const app = createApp(App)
app.use(router)
