import { ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 首页 scroll-driven 叙事编排。
 * 管理：sticky 沙盘（real 相机缓推 / inkwash 横向平移）+ RiverCityRail 视差。
 *
 * @returns {{ init, dispose, stickyProgress }}
 */
export function useScrollNarrative() {
  const stickyProgress = ref(0)
  let _triggers = []
  let _railTween = null
  let _inkTrigger = null
  let _lastConfig = null

  /** 初始化全部 scroll 叙事（重复调用会先清理旧触发器，支持主题切换重建） */
  function init(config) {
    dispose()
    _lastConfig = config
    _setup(config)
  }

  /** 用上一次配置重建（主题切换后目标段落已重新渲染） */
  function reinit() {
    if (!_lastConfig) return
    dispose()
    _setup(_lastConfig)
  }

  function _setup({ isReal, sandboxApi, stickyRealRef, stickyInkRef, railRef }) {
    if (prefersReduce()) return

    if (isReal?.value && stickyRealRef) {
      _initRealSticky(sandboxApi, stickyRealRef)
    } else if (!isReal?.value && stickyInkRef) {
      _initInkSticky(stickyInkRef)
    }

    if (railRef) {
      _initRailParallax(railRef)
    }

    ScrollTrigger.refresh()
  }

  function dispose() {
    _triggers.forEach((t) => t.kill())
    _triggers = []
    _inkTrigger = null
    if (_railTween) {
      _railTween.kill()
      _railTween = null
    }
    stickyProgress.value = 0
  }

  /** 主题切换/布局变化后刷新 ScrollTrigger 测量 */
  function refresh() {
    ScrollTrigger.refresh()
  }

  /**
   * 平滑滚动页面到长卷的指定进度（0-1）。
   * 供九城快捷导航调用；pin 触发器不存在时静默忽略。
   */
  function seekInkProgress(p) {
    if (!_inkTrigger) return
    const st = _inkTrigger
    const top = st.start + Math.max(0, Math.min(1, p)) * (st.end - st.start)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // ---- Real 主题：pin 沙盘容器，scrub 相机缓推 ----
  function _initRealSticky(sandboxApi, stickyEl) {
    const el = stickyEl?.$el || stickyEl
    if (!el) return

    const camera = sandboxApi?.getCamera?.()
    const controls = sandboxApi?.getControls?.()
    if (!camera || !controls) return

    const initPos = camera.position.clone()
    const initTarget = controls.target.clone()

    // end: 相机推近 30%，目标微下沉
    const endPos = initPos.clone()
    endPos.z -= initPos.z * 0.35
    endPos.y -= 0.6
    const endTarget = initTarget.clone()
    endTarget.y -= 0.3

    _triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=120%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          stickyProgress.value = self.progress
          if (!camera || !controls) return
          camera.position.lerpVectors(initPos, endPos, self.progress)
          controls.target.lerpVectors(initTarget, endTarget, self.progress)
          controls.update()
        },
      })
    )
  }

  // ---- Ink 主题：pin 长卷容器，scrub inner content 横向平移 ----
  // 单一 transform 来源：仅此处写 layer.style.transform（模板不得再绑鼠标视差样式，否则互相覆盖）。
  // 深度视差系数由各层 data-depth 声明（1 = 与滚动同步，<1 = 远景缓动）。
  function _initInkSticky(stickyEl) {
    const el = stickyEl?.$el || stickyEl
    if (!el) return

    _inkTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        stickyProgress.value = self.progress
        const layers = el.querySelectorAll('.parallax-layer')
        // 最大横向平移量（px）：层宽(200%)与容器视口宽度之差
        const paper = el.querySelector('.scroll-middle-paper')
        const maxScrollX = paper
          ? Math.max(0, paper.scrollWidth - paper.clientWidth)
          : 400
        layers.forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth || '1')
          layer.style.transform = `translate3d(${-self.progress * maxScrollX * depth}px, 0, 0)`
        })
      },
    })
    _triggers.push(_inkTrigger)
  }

  // ---- RiverCityRail 视差：卡片 Y 偏移 + 透明度 ----
  function _initRailParallax(railRef) {
    const el = railRef?.$el || railRef
    if (!el) return

    const cards = el.querySelectorAll('.rcr__city')
    if (!cards.length) return

    // 初始隐藏，scroll 进入时淡入上浮
    gsap.set(cards, { opacity: 0, y: 32 })

    _triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          _railTween = gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power2.out',
          })
        },
        // 滚动离开后重置，以便再次进入重新播放
        onLeaveBack: () => {
          if (_railTween) _railTween.kill()
          gsap.set(cards, { opacity: 0, y: 32 })
        },
      })
    )
  }

  onBeforeUnmount(dispose)

  return { init, reinit, dispose, refresh, seekInkProgress, stickyProgress }
}
