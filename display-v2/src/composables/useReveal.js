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

      // 兜底: 调用时已在视口内的元素立即揭示。
      // 修复: 路由过渡/布局测量时机导致 ScrollTrigger.batch 不触发时,
      // 内容永久停在 opacity:0 —— DOM 存在但页面"空白/像被遮住"。
      const vh = window.innerHeight || 800
      const inView = []
      const below = []
      els.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.95 && r.bottom > 0) inView.push(el)
        else below.push(el)
      })
      if (inView.length) {
        gsap.to(inView, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
          overwrite: true,
        })
      }

      // 视口外的元素走滚动揭示
      if (below.length) {
        ScrollTrigger.batch(below, {
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
      }
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
