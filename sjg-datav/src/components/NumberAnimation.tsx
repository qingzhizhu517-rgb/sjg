import { useEffect, useRef } from 'react'
import styled from 'styled-components'

const NumberWrapper = styled.span`
  font-family: var(--dv-num);
  font-size: 26px;
  line-height: 1;
  color: var(--dv-gold-light);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
`

interface NumberAnimationProps {
  endValue: number
  duration?: number
  className?: string
}

/**
 * 数字滚动。
 *
 * 原实现用 gsap 的 onUpdate 驱动 React state，每帧触发一次重渲染，
 * 且样式里挂着旧的 AI 紫渐变（`#667eea → #764ba2` + background-clip:text），
 * 会把父级设的金色整个覆盖掉——本次一并去掉。
 *
 * 现在直接用 rAF 写 DOM 文本，不走 state，省掉每帧重渲染；
 * gsap 也因此在数据大屏里再无引用，已从依赖中移除。
 */
export default function NumberAnimation({ endValue, duration = 1.3, className }: NumberAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduce || endValue <= 0) {
      node.textContent = String(endValue)
      return
    }

    let raf = 0
    const startedAt = performance.now()
    const total = duration * 1000

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / total)
      const eased = 1 - Math.pow(1 - t, 3)
      node.textContent = String(Math.round(endValue * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    node.textContent = '0'
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [endValue, duration])

  return (
    <NumberWrapper className={className}>
      <span ref={ref}>0</span>
    </NumberWrapper>
  )
}
