import { useEffect, useRef } from 'react'
import autofit from 'autofit.js'

export function useAutoFit(designWidth = 1920, designHeight = 1080) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      autofit.init({
        dw: designWidth,
        dh: designHeight,
        el: ref.current as unknown as string,
        resize: true
      })
    }

    return () => {
      autofit.off()
    }
  }, [designWidth, designHeight])

  return ref
}
