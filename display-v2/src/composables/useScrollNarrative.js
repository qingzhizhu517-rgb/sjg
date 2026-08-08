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

  /** 初始化全部 scroll 叙事 */
  function init({
    isReal,
    sandboxApi,
    stickyRealRef,
    stickyInkRef,
    railRef,
  }) {
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
    if (_railTween) {
      _railTween.kill()
      _railTween = null
    }
    stickyProgress.value = 0
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
        end: '+=200%',
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
  function _initInkSticky(stickyEl) {
    const el = stickyEl?.$el || stickyEl
    if (!el) return

    _triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          stickyProgress.value = self.progress
          const layers = el.querySelectorAll('.parallax-layer')
          // 最大横向平移量（px），取滚动画宽度与视口差值
          const paper = el.querySelector('.scroll-middle-paper')
          const maxScrollX = paper
            ? Math.max(0, paper.scrollWidth - paper.clientWidth)
            : 400
          layers.forEach((layer, i) => {
            const factor = 0.3 + i * 0.35
            layer.style.transform = `translateX(${-self.progress * maxScrollX * factor}px)`
          })
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

  return { init, dispose, stickyProgress }
}
