import { useEffect, useRef } from 'react'

export function useAutoFit(designWidth = 1920, designHeight = 1080) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const resize = () => {
      const scaleX = window.innerWidth / designWidth
      const scaleY = window.innerHeight / designHeight
      const scale = Math.min(scaleX, scaleY)
      el.style.transform = `scale(${scale})`
      el.style.transformOrigin = 'left top'
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [designWidth, designHeight])

  return ref
}
