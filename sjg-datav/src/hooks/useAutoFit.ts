import { useEffect, useRef } from 'react'

/**
 * 等比缩放适配: 设计稿 1920×1080 按 contain 策略缩放并居中,
 * 两侧/上下留黑边(letterbox)而非贴角裁切 —— 修复"显示一半/被截断"问题。
 * 缩放的是外层容器, 内部布局不受影响。
 */
export function useAutoFit(designWidth = 1920, designHeight = 1080) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const resize = () => {
      const vw = window.innerWidth || 1920
      const vh = window.innerHeight || 1080
      const scaleX = vw / designWidth
      const scaleY = vh / designHeight
      const scale = Math.min(scaleX, scaleY)
      // 居中偏移: 设计稿按 scale 缩放后的剩余空间均分到两侧
      const tx = (vw - designWidth * scale) / 2
      const ty = (vh - designHeight * scale) / 2
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
      el.style.transformOrigin = 'left top'
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
    }
  }, [designWidth, designHeight])

  return ref
}
