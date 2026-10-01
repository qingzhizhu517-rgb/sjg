// CSS 必须最先求值：chartTheme 在模块加载时要读 :root 上的 token
import './styles/global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './theme/echartsSetup'
import { syncThemeTokens } from './theme/chartTheme'

// 样式已落地，再同步一次主题 token（dev 下 CSS 注入顺序不保证）
syncThemeTokens()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
