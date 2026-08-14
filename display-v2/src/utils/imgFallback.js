// 全局图片加载失败兜底
// 场景: 远端资源(如 OSS 桶)整体 403/404 或单图失效时, <img> 会显示破图图标。
// 本模块在 capture 阶段拦截 error 事件, 将失败的 http(s) 图片替换为主题印章占位
// (data URI, 永不再失败), 保证页面在任何远端资源故障下仍优雅降级。
// 与组件自身的 onerror 处理(如 PoetDetail 隐藏头像露出印章)兼容: 先换 src 后隐藏, 无冲突。

const sealSvg = (isInkwash, kind) => {
  const bg = isInkwash ? '#F4EFE4' : '#FDFAF5'
  const fg = isInkwash ? '#A93226' : '#B8860B'
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">` +
    `<rect width="240" height="240" fill="${bg}"/>` +
    `<rect x="10" y="10" width="220" height="220" fill="none" stroke="${fg}" stroke-width="3"/>` +
    `<text x="120" y="142" text-anchor="middle" font-size="116" font-family="serif" font-weight="700" fill="${fg}">${kind}</text>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const inferKind = (url) =>
  typeof url === 'string' && url.includes('/spots/') ? '景' : '文'

let installed = false

export function installImgFallback() {
  if (installed || typeof document === 'undefined') return
  installed = true
  document.addEventListener(
    'error',
    (e) => {
      const t = e.target
      if (!t || t.tagName !== 'IMG') return
      const src = t.getAttribute('src') || ''
      // 仅处理远端资源; 占位/本地相对路径/已是 data URI 的跳过, 防死循环
      if (!/^https?:/i.test(src) || src.startsWith('data:')) return
      const isInkwash = document.documentElement.classList.contains('theme-inkwash')
      t.src = sealSvg(isInkwash, inferKind(src))
    },
    true,
  )
}