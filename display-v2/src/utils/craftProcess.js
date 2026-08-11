// 工序状态机纯逻辑（无 three/GSAP 依赖，可单测）。
import { expandPatterns } from '../config/glbParts.js'

export const clampStep = (i, len) => Math.max(0, Math.min(len - 1, i))
export const nextStep = (i, len) => clampStep(i + 1, len)
export const prevStep = (i, len) => clampStep(i - 1, len)
export const isLastStep = (i, len) => i === len - 1

/** 当前步可见部件集合（通配展开）。step.visible 缺省 = 全集 */
export const resolveStepVisible = (step, allNames) =>
  new Set(step.visible ? expandPatterns(step.visible, allNames) : allNames)

/** 冲突检查：fadeOut 目标不应仍在 visible 集合（动画与显隐互相打架） */
export const findStepConflicts = (step, allNames) => {
  const visible = resolveStepVisible(step, allNames)
  return (step.animations || [])
    .filter((a) => a.fadeOut && visible.has(a.target))
    .map((a) => a.target)
}
