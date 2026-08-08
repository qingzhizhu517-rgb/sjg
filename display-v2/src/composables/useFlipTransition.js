import gsap from 'gsap'

// Module-level singleton — SPA 内跨组件共享 flip 状态
let _pendingFlip = null

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 计算 FLIP 变换参数（纯函数，可单测）。
 * @param {{ top:number, left:number, width:number, height:number }} from
 * @param {{ top:number, left:number, width:number, height:number }} to
 * @returns {{ dx:number, dy:number, sx:number, sy:number }}
 */
export function computeFlipDeltas(from, to) {
  const dx = from.left - to.left
  const dy = from.top - to.top
  const sx = from.width / (to.width || 1)
  const sy = from.height / (to.height || 1)
  return { dx, dy, sx, sy }
}

/**
 * FLIP 共享元素过渡 composable。
 * - 导航前调用 capture(sourceEl, key) 捕获源元素 rect
 * - 目标页挂载后调用 animate(targetEl, key) 执行 FLIP 动画
 *
 * @returns {{ capture, animate }}
 */
export function useFlipTransition() {
  /**
   * 导航前捕获源元素位置。
   * @param {HTMLElement} sourceEl
   * @param {string} key 城市名等唯一标识
   */
  function capture(sourceEl, key) {
    if (!sourceEl || !key) return
    const r = sourceEl.getBoundingClientRect()
    _pendingFlip = {
      key,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      ts: Date.now(),
    }
  }

  /**
   * 目标页挂载后执行 FLIP 动画。
   * @param {HTMLElement} targetEl
   * @param {string} key
   * @param {object} [opts]
   * @param {number} [opts.duration=0.55]
   * @param {string} [opts.ease='power3.inOut']
   * @param {number} [opts.maxAge=5000] 过期时间 ms
   * @returns {gsap.core.Tween|null}
   */
  function animate(targetEl, key, opts = {}) {
    const { duration = 0.55, ease = 'power3.inOut', maxAge = 5000 } = opts

    if (!_pendingFlip || _pendingFlip.key !== key) return null
    if (Date.now() - _pendingFlip.ts > maxAge) {
      _pendingFlip = null
      return null
    }
    if (!targetEl) {
      _pendingFlip = null
      return null
    }

    const from = _pendingFlip.rect
    _pendingFlip = null

    const to = targetEl.getBoundingClientRect()
    if (to.width === 0 || to.height === 0) return null

    // reduced-motion 跳过
    if (prefersReduce()) return null

    const { dx, dy, sx, sy } = computeFlipDeltas(from, to)

    // Invert → Play
    gsap.set(targetEl, { x: dx, y: dy, scaleX: sx, scaleY: sy })
    return gsap.to(targetEl, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease,
      onComplete: () => gsap.set(targetEl, { clearProps: 'all' }),
    })
  }

  return { capture, animate }
}
