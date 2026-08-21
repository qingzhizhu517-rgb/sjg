import { ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 首页 scroll-driven 叙事编排。
 * 管理：sticky 三维沙盘（pin + scrub 相机缓推）+ 城市卡视差。
 *
 * 2026-08-20 主题收敛：inkwash 横向长卷分支已删除（首页恒为三维沙盘）。
 *
 * @returns {{ init, reinit, dispose, refresh, stickyProgress }}
 */
export function useScrollNarrative() {
  const stickyProgress = ref(0)
  let _triggers = []
  let _railTween = null
  let _lastConfig = null

  /** 初始化全部 scroll 叙事（重复调用会先清理旧触发器） */
  function init(config) {
    dispose()
    _lastConfig = config
    _setup(config)
  }

  /** 用上一次配置重建（目标段落重新渲染后调用） */
  function reinit() {
    if (!_lastConfig) return
    dispose()
    _setup(_lastConfig)
  }

  function _setup({ sandboxApi, stickyRealRef, railRef }) {
    if (prefersReduce()) return

    if (stickyRealRef) {
      _initRealSticky(sandboxApi, stickyRealRef)
    }

    if (railRef) {
      _initRailParallax(railRef)
    }

    ScrollTrigger.refresh()
  }

  function dispose() {
    _triggers.forEach((t) => t.kill())
    _triggers = []
    if (_railTween) {
      _railTween.kill()
      _railTween = null
    }
    stickyProgress.value = 0
  }

  /** 布局变化后刷新 ScrollTrigger 测量 */
  function refresh() {
    ScrollTrigger.refresh()
  }

  // ---- pin 沙盘容器，scrub 相机缓推 ----
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

  return { init, reinit, dispose, refresh, stickyProgress }
}
