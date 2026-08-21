import { computed, readonly, ref } from 'vue'
import { resolveProfile, resolveAsset as _resolveAsset } from '../themes'
import { resolveContent as _resolveContent } from '../content'

// 2026-08-20 主题收敛：real / inkwash 双主题合并为单一水墨主题。
//
// 保留本 composable 与其导出签名，是为了不必一次性改 8 个消费方
// （MapView / RegionSpots / PoetList / SpotDetail / PoetDetail / KnowledgeCard /
//  StepRail / useScrollNarrative 等），各页在自己的批次里逐步移除对
// isReal / isAnime 的引用；届时本文件可只保留 resolveAsset / resolveContent。
//
// 语义约定（不要再写分支逻辑依赖它们）：
//   theme      恒为 'inkwash'
//   isReal     恒 false
//   isAnime    恒 true（历史命名，含义是 inkwash；'anime' 是早期风格名的化石）

const THEME = 'inkwash'

// 清理历史持久值：老浏览器里存的 'real' 会让"恒等 inkwash"与持久值不一致
try {
  if (localStorage.getItem('sjg-theme')) localStorage.removeItem('sjg-theme')
} catch { /* 隐私模式下 localStorage 可能不可用，忽略 */ }

// <html> 上保留 theme-inkwash 类：约 20 个 SFC 仍有 .theme-inkwash 作用域的
// scoped 规则，且 fixed / teleport 出 .app-root 的元素靠它吃到 token
if (typeof document !== 'undefined') {
  const root = document.documentElement
  root.classList.remove('theme-real')
  root.classList.add('theme-inkwash')
  root.setAttribute('data-theme', THEME)
}

const themeState = ref(THEME)
const isReal = computed(() => false)
const isAnime = computed(() => true)
const themeClass = computed(() => 'theme-inkwash')
const themeProfile = computed(() => resolveProfile(THEME))

// 转场状态机已随 ThemeTransition 组件一并删除；保留空壳导出避免残留调用方报错
const transitionPhase = readonly(ref('idle'))
const transitionTarget = readonly(ref(null))
const transitionOrigin = readonly(ref({ x: 0.5, y: 0.5 }))
const noop = () => {}

export function useTheme() {
  return {
    theme: readonly(themeState),
    isReal,
    isAnime,
    themeClass,
    themeProfile,
    // 代理解析器：自动用当前主题，组件无需传 theme
    resolveAsset: (key) => _resolveAsset(key, THEME),
    resolveContent: (scope, key) => _resolveContent(scope, key, THEME),
    // 以下为兼容占位，均为 no-op
    toggle: noop,
    switchTheme: noop,
    transitionPhase,
    transitionTarget,
    transitionOrigin,
    notifyCovered: noop,
    notifyExited: noop,
  }
}
