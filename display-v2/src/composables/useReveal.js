import { onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 手动滚动揭示：在数据就绪后调用 reveal(container) 扫描 [data-reveal] 子元素。
 * 元素进入视口时 fade-up；reduced-motion / 移动端降级为直接可见。
 * 组件卸载时 gsap.context.revert() 清理。
 *
 * @returns {{ reveal: (container: HTMLElement, opts?: object) => void, refresh: () => void }}
 */
export function useReveal() {
  let ctx = null

  const reveal = (container, opts = {}) => {
    if (!container || prefersReduce()) return
    const { y = 26, duration = 0.6, stagger = 0.07, start = 'top 88%' } = opts
    if (ctx) ctx.revert()
    ctx = gsap.context(() => {
      const els = container.querySelectorAll('[data-reveal]')
      if (!els.length) return
      gsap.set(els, { opacity: 0, y })
      ScrollTrigger.batch(els, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power2.out',
            overwrite: true,
          }),
      })
      ScrollTrigger.refresh()
    }, container)
  }

  onBeforeUnmount(() => {
    if (ctx) ctx.revert()
    ctx = null
  })

  return {
    reveal,
    refresh: () => ScrollTrigger.refresh(),
  }
}
