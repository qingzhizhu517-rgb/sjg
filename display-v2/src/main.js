import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installImgFallback } from './utils/imgFallback'
import './styles/variables.css'

// 全局图片失败兜底(远端资源 403/404 时换主题印章占位, 防满屏破图)
installImgFallback()

// DEV 错误可视化: 渲染/路由/异步异常不再静默空白, 页面顶部显示红条便于定位
if (import.meta.env.DEV) {
  const showDevError = (source, err) => {
    const msg = err && (err.message || err.reason || String(err))
    let bar = document.getElementById('dev-error-bar')
    if (!bar) {
      bar = document.createElement('div')
      bar.id = 'dev-error-bar'
      bar.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:99999;background:#b3261e;color:#fff;' +
        'font:12px/1.5 monospace;padding:8px 16px;white-space:pre-wrap;'
      document.body.appendChild(bar)
    }
    bar.textContent = `[${source}] ${msg || '未知错误'}\n点击关闭`
    bar.onclick = () => bar.remove()
  }
  window.addEventListener('error', (e) => {
    if (e.error || e.message) showDevError('window.onerror', e.error || e.message)
  })
  window.addEventListener('unhandledrejection', (e) => showDevError('unhandledrejection', e.reason))
}

const app = createApp(App)
// DEV 下 Vue 渲染/生命周期错误同样上红条
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, _instance, info) => {
    console.error('[vue errorHandler]', info, err)
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: `[vue ${info}] ${err && err.message ? err.message : err}`,
      }),
    )
  }
}
app.use(router)
app.mount('#app')
