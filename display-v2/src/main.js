import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installImgFallback } from './utils/imgFallback'
import './styles/variables.css'

// 全局图片失败兜底(远端资源 403/404 时换主题印章占位, 防满屏破图)
installImgFallback()

const app = createApp(App)
app.use(router)
app.mount('#app')
