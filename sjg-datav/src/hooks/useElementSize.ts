import { useEffect, useRef, useState } from 'react'

/**
 * 观测元素内容尺寸。
 * 数据大屏被 AutoFit 用 transform 缩放，`window.resize` 只在窗口变化时触发，
 * 无法反映容器自身尺寸变化，因此这里统一用 ResizeObserver。
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      setSize((prev) =>
        Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1
          ? prev
          : { width: rect.width, height: rect.height },
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}
