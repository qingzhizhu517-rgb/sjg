// display-v2/src/composables/useCraftProcess.js
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import {
  nextStep, prevStep, isLastStep,
  resolveStepVisible, findStepConflicts,
} from '../utils/craftProcess'

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 工序状态机：读 step config → 驱动 useGlbScene（显隐/部件动画/相机）。
 *
 *   const proc = useCraftProcess(config, sceneApi)
 *   await proc.enter(0)          // 进入某步（应用显隐+动画+机位）
 *   proc.next() / proc.prev() / proc.toggleAuto()
 *
 * sceneApi 需要的方法：setVisible / getObject / applyCameraPose / setFreeRoam
 */
export function useCraftProcess(config, sceneApi) {
  const currentStep = ref(0)
  const playing = ref(false)
  let partNames = []
  let autoTimeline = null

  const steps = config.steps
  const stepMeta = computed(() => steps[currentStep.value])
  const isLast = computed(() => isLastStep(currentStep.value, steps.length))

  /** 由页面在模型加载后注入部件清单 */
  const setPartNames = (names) => { partNames = names }

  /** 执行单条动画指令（GSAP）。fadeIn/fadeOut 走 opacity，需材质 transparent */
  const _runAnimation = (anim) => {
    const obj = sceneApi.getObject(anim.target)
    if (!obj) { console.warn('[craft] 部件缺失:', anim.target); return null }
    const d = anim.duration ?? 1
    const props = { duration: d, ease: 'power2.inOut' }
    if (anim.delay) props.delay = anim.delay
    const tl = gsap.timeline()
    if (anim.rotateY != null) tl.to(obj.rotation, { y: `+=${anim.rotateY}`, ...props }, 0)
    if (anim.rotateX != null) tl.to(obj.rotation, { x: `+=${anim.rotateX}`, ...props }, 0)
    if (anim.moveX != null) tl.to(obj.position, { x: `+=${anim.moveX}`, ...props }, 0)
    if (anim.moveY != null) tl.to(obj.position, { y: `+=${anim.moveY}`, ...props }, 0)
    if (anim.moveZ != null) tl.to(obj.position, { z: `+=${anim.moveZ}`, ...props }, 0)
    if (anim.scale != null) tl.to(obj.scale, { x: anim.scale, y: anim.scale, z: anim.scale, ...props }, 0)
    if (anim.fadeOut) tl.to(obj, { ...props, onStart: () => { obj.visible = true }, onComplete: () => { obj.visible = false } }, 0)
    if (anim.fadeIn) tl.fromTo(obj.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, ...props, onStart: () => { obj.visible = true } }, 0)
    return tl
  }

  /** 进入第 i 步：显隐 → 动画 → 相机 */
  const enter = (i) => {
    const step = steps[i]
    if (!step) return
    currentStep.value = i

    for (const c of findStepConflicts(step, partNames)) {
      console.warn('[craft] 步骤冲突（fadeOut 目标仍在 visible）:', c)
    }

    sceneApi.setVisible(resolveStepVisible(step, partNames))
    sceneApi.setFreeRoam(isLastStep(i, steps.length))

    if (!prefersReduce()) {
      for (const anim of step.animations || []) _runAnimation(anim)
    } else {
      // reduced-motion：直接应用终态（fadeOut → 隐藏，fadeIn → 显示）
      for (const anim of step.animations || []) {
        const obj = sceneApi.getObject(anim.target)
        if (!obj) continue
        if (anim.fadeOut) obj.visible = false
        if (anim.fadeIn) obj.visible = true
      }
    }
    sceneApi.applyCameraPose(step.camera)
  }

  const next = () => { stopAuto(); enter(nextStep(currentStep.value, steps.length)) }
  const prev = () => { stopAuto(); enter(prevStep(currentStep.value, steps.length)) }

  const stopAuto = () => {
    playing.value = false
    autoTimeline?.kill()
    autoTimeline = null
  }

  /** 自动播放：从当前步顺序走到末步 */
  const toggleAuto = () => {
    if (playing.value) { stopAuto(); return }
    if (prefersReduce()) { enter(steps.length - 1); return }
    playing.value = true
    autoTimeline = gsap.timeline({
      onComplete: () => { playing.value = false },
    })
    for (let i = currentStep.value; i < steps.length; i++) {
      const idx = i
      autoTimeline.call(() => enter(idx), null, '+=0.2')
      const dur = (steps[idx].animations || []).reduce((m, a) => Math.max(m, (a.duration ?? 1) + (a.delay ?? 0)), 0)
      autoTimeline.to({}, { duration: Math.max(dur, 1.5) })  // 每步驻留
    }
  }

  const dispose = () => stopAuto()

  return { currentStep, stepMeta, isLast, playing, setPartNames, enter, next, prev, toggleAuto, stopAuto, dispose }
}
