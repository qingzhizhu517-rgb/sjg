import { useEffect, useRef } from 'react'

/**
 * 等比缩放适配(容器实测版):
 * 以设计稿 1920×1080 为基准, 读取容器 clientWidth/clientHeight(而非 window 尺寸,
 * 避免 iframe/滚动条/视口测量偏差), 按 contain 策略居中缩放。
 * 返回 { outerRef, stageRef }: outer=100% 容器, stage=1920×1080 设计舞台。
 */
export function useAutoFit(designWidth = 1920, designHeight = 1080) {
  const outerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const stage = stageRef.current
    if (!outer || !stage) return

    const resize = () => {
      const w = outer.clientWidth || window.innerWidth || designWidth
      const h = outer.clientHeight || window.innerHeight || designHeight
      const s = Math.min(w / designWidth, h / designHeight)
      stage.style.transform = `translate(-50%, -50%) scale(${s})`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(outer)
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
    }
  }, [designWidth, designHeight])

  return { outerRef, stageRef }
}
