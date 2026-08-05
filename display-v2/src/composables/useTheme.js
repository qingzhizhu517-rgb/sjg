import { ref, computed, watch, nextTick } from 'vue'
import { resolveProfile, resolveAsset as _resolveAsset } from '../themes'
import { resolveContent as _resolveContent } from '../content'

// Global singleton reactive theme state (zero-dependency Pinia alternative)
const themeState = ref(localStorage.getItem('sjg-theme') || 'real')

const applyTheme = (val) => {
  localStorage.setItem('sjg-theme', val)
  const root = document.documentElement
  root.setAttribute('data-theme', val)
  // 主题类上提到 <html>: 统一 .theme-real/.theme-inkwash 机制,
  // 让 fixed/teleport 出 .app-root 的元素也吃到主题 token
  root.classList.remove('theme-real', 'theme-inkwash')
  root.classList.add(val === 'inkwash' ? 'theme-inkwash' : 'theme-real')
}

watch(themeState, (val) => applyTheme(val), { immediate: true })

// 同步切换（向后兼容入口，等价 switchTheme(false)；当前无直接调用方）
const toggle = () => { void switchTheme(false) }

// ---- 仪式化转场状态机（P1-6 ThemeTransition）----
// phase: idle -> enter -> cover -> exit -> idle
//   enter: 遮罩进入（inkwash 墨晕圆形 clip-path 扩散 / real 金色光条横扫）
//   cover: 遮罩盖满 -> 在此换类（watch isReal -> three.setTheme 在遮罩下重建沙盘）
//   exit:  遮罩收缩消失，露出新主题画面
const transitionPhase = ref('idle')
const transitionTarget = ref(null)                 // 'real' | 'inkwash' | null
const transitionOrigin = ref({ x: 0.5, y: 0.5 })   // 墨晕扩散圆心（相对屏幕 0-1）
let _coverResolver = null
let _exitResolver = null
const notifyCovered = () => { _coverResolver?.(); _coverResolver = null }
const notifyExited = () => { _exitResolver?.(); _exitResolver = null }

// 滚动锁：保存/恢复先前 inline overflow，避免清掉其它锁（弹窗/抽屉）
let _prevOverflow = ''
const lockScroll = (lock) => {
  if (lock) {
    _prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = _prevOverflow
  }
}

// await 转场阶段，带超时兜底：组件未挂载 / 后台标签页 timer 节流时不死锁
const awaitNotify = (setResolver, fallbackMs) =>
  Promise.race([
    new Promise((r) => { setResolver(r) }),
    new Promise((r) => setTimeout(() => r('timeout'), fallbackMs)),
  ])

let _switching = false
/**
 * 切换主题。
 * @param {boolean} withTransition - true 编排转场遮罩；false 同步切换
 * @param {{x:number,y:number}} [origin] - 转场原点（0-1，墨晕圆心 / 光扫起点）
 */
const switchTheme = async (withTransition = true, origin = null) => {
  if (_switching) return
  const current = themeState.value
  const target = current === 'real' ? 'inkwash' : 'real'
  if (target === current) return
  _switching = true
  lockScroll(true)
  try {
    if (!withTransition) {
      themeState.value = target
      await nextTick()
      return
    }
    transitionTarget.value = target
    transitionOrigin.value = origin || { x: 0.5, y: 0.5 }
    // 等一帧让 ThemeTransition 先应用目标风格的初始（收起）态，再触发 enter 过渡，
    // 否则"挂载即终态"会丢失 clip-path 过渡。双 rAF 确保初始态被浏览器绘制。
    await nextTick()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    transitionPhase.value = 'enter'
    await awaitNotify((r) => { _coverResolver = r }, 2000)

    // 遮罩盖满 -> 换类（watch isReal -> three.setTheme 在遮罩下销毁/重建沙盘）
    transitionPhase.value = 'cover'
    themeState.value = target
    await nextTick()
    // 给 setTheme 内 150ms setTimeout + 沙盘重建启动留时间，避免遮罩撤去时露白
    await new Promise((r) => setTimeout(r, 220))

    transitionPhase.value = 'exit'
    await awaitNotify((r) => { _exitResolver = r }, 2000)
    transitionPhase.value = 'idle'
    transitionTarget.value = null
  } catch (e) {
    // 异常时复位转场状态，避免卡在遮罩中（不 rethrow：finally 已复位，错误对调用方无意义）
    console.error('[switchTheme] 转场异常:', e)
    transitionPhase.value = 'idle'
    transitionTarget.value = null
  } finally {
    lockScroll(false)
    _switching = false
  }
}

export function useTheme() {
  const isReal = computed(() => themeState.value === 'real')
  const isAnime = computed(() => themeState.value === 'inkwash')
  const themeClass = computed(() => themeState.value === 'inkwash' ? 'theme-inkwash' : 'theme-real')
  const themeProfile = computed(() => resolveProfile(themeState.value))

  // 代理解析器：自动用当前主题，组件无需传 theme
  const resolveAsset = (key) => _resolveAsset(key, themeState.value)
  const resolveContent = (scope, key) => _resolveContent(scope, key, themeState.value)

  return {
    theme: themeState,
    isReal,
    isAnime,
    toggle,
    switchTheme,
    themeClass,
    themeProfile,
    resolveAsset,
    resolveContent,
    // 转场（ThemeTransition 组件消费）
    transitionPhase,
    transitionTarget,
    transitionOrigin,
    notifyCovered,
    notifyExited,
  }
}
