import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import { nextStep, prevStep, isLastStep, resolveStepVisible } from '../utils/craftProcess.js'

const prefersReduce = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 工序实例拥有位姿与动画；切步先停止旧动画再恢复基准，不影响其他工坊。 */
export function useCraftProcess(config, sceneApi) {
  const currentStep = ref(0), playing = ref(false)
  const baseline = new Map(), animations = new Set()
  let partNames = [], autoTimeline = null, cameraTween = null, disposed = false
  const steps = config.steps
  const stepMeta = computed(() => steps[currentStep.value])
  const isLast = computed(() => isLastStep(currentStep.value, steps.length))
  const materialEntries = obj => {
    const materials = new Set()
    const collect = node => [].concat(node.material || []).forEach(m => materials.add(m))
    if (obj.traverse) obj.traverse(collect); else collect(obj)
    return [...materials]
  }
  const snapshot = name => {
    const obj = sceneApi.getObject(name)
    if (obj && !baseline.has(name)) baseline.set(name, {
      obj, position: obj.position.clone(), rotation: obj.rotation.clone(), scale: obj.scale.clone(),
      materials: materialEntries(obj).map(material => ({ material, opacity: material.opacity, transparent: material.transparent })),
    })
  }
  const setPartNames = names => { partNames = [...names]; partNames.forEach(snapshot) }
  const cancelAnimations = () => {
    animations.forEach(t => t.kill()); animations.clear(); cameraTween?.kill?.(); cameraTween = null
  }
  const restore = () => baseline.forEach(base => {
    base.obj.position.copy(base.position); base.obj.rotation.copy(base.rotation); base.obj.scale.copy(base.scale)
    base.materials.forEach(({ material, opacity, transparent }) => { material.opacity = opacity; material.transparent = transparent; material.needsUpdate = true })
  })
  const runAnimation = anim => {
    snapshot(anim.target)
    const base = baseline.get(anim.target)
    if (!base) return
    const obj = base.obj, props = { duration: anim.duration ?? 1, delay: anim.delay || 0, ease: 'power2.inOut' }
    const tl = gsap.timeline(); animations.add(tl)
    for (const [key, axis, target] of [['rotateY', 'y', obj.rotation], ['rotateX', 'x', obj.rotation], ['moveX', 'x', obj.position], ['moveY', 'y', obj.position], ['moveZ', 'z', obj.position]]) {
      if (anim[key] != null) tl.to(target, { [axis]: `+=${anim[key]}`, ...props }, 0)
    }
    if (anim.scale != null) tl.to(obj.scale, { x: base.scale.x * anim.scale, y: base.scale.y * anim.scale, z: base.scale.z * anim.scale, ...props }, 0)
    if (anim.fadeIn || anim.fadeOut) {
      obj.visible = true
      base.materials.forEach(({ material, opacity }) => {
        material.transparent = true; material.needsUpdate = true
        const end = { ...props, opacity: anim.fadeOut ? 0 : opacity }
        if (anim.fadeIn) tl.fromTo(material, { opacity: 0 }, end, 0); else tl.to(material, end, 0)
      })
      tl.to({}, { ...props, onComplete: () => { obj.visible = !anim.fadeOut } }, 0)
    }
  }
  const stopAuto = () => { playing.value = false; autoTimeline?.kill(); autoTimeline = null }
  const applyStep = i => {
    if (disposed || !steps[i]) return
    const step = steps[i], reduced = prefersReduce()
    cancelAnimations(); (step.animations || []).forEach(a => snapshot(a.target)); restore()
    currentStep.value = i
    sceneApi.setVisible(resolveStepVisible(step, partNames))
    sceneApi.setFreeRoam(isLastStep(i, steps.length))
    if (!reduced) (step.animations || []).forEach(runAnimation)
    else (step.animations || []).forEach(anim => {
      const obj = sceneApi.getObject(anim.target)
      if (!obj) return
      if (anim.fadeOut) obj.visible = false
      if (anim.fadeIn) obj.visible = true
    })
    cameraTween = sceneApi.applyCameraPose(step.camera && { ...step.camera, ...(reduced ? { duration: 0 } : {}) })
  }
  const enter = i => { stopAuto(); applyStep(i) }
  const next = () => enter(nextStep(currentStep.value, steps.length))
  const prev = () => enter(prevStep(currentStep.value, steps.length))
  const toggleAuto = () => {
    if (disposed) return
    if (playing.value) return stopAuto()
    if (prefersReduce()) { applyStep(steps.length - 1); return }
    if (isLast.value) applyStep(0)
    playing.value = true
    autoTimeline = gsap.timeline({ onComplete: () => { playing.value = false; autoTimeline = null } })
    for (let i = currentStep.value; i < steps.length; i++) {
      const index = i
      autoTimeline.call(() => applyStep(index), null, '+=0.2')
      const duration = (steps[index].animations || []).reduce((max, a) => Math.max(max, (a.duration ?? 1) + (a.delay || 0)), 0)
      autoTimeline.to({}, { duration: Math.max(duration, 1.5) })
    }
  }
  const dispose = () => { disposed = true; stopAuto(); cancelAnimations(); restore(); baseline.clear() }
  return { currentStep, stepMeta, isLast, playing, setPartNames, enter, next, prev, toggleAuto, stopAuto, dispose }
}
