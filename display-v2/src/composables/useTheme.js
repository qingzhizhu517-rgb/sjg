import { ref, computed, watch } from 'vue'
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

// 同步切换（保留作向后兼容入口，等价 switchTheme(false)）
const toggle = () => {
  themeState.value = themeState.value === 'real' ? 'inkwash' : 'real'
}

// 切换主题。withTransition=true 时编排转场遮罩（P1-6 ThemeTransition 落地后接入：
// 墨晕/光扫 clip-path 扩散 + 锁滚动 + three.js 在遮罩下重建）。
// 目前转场组件未就绪，直接切换；_switching 防抖锁重复点击。
let _switching = false
const switchTheme = async (withTransition = true) => {
  if (_switching) return
  _switching = true
  try {
    // TODO(P1-6): withTransition 时挂 ThemeTransition 遮罩，在遮罩下换类 + 重建沙盘
    void withTransition
    themeState.value = themeState.value === 'real' ? 'inkwash' : 'real'
  } finally {
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
  }
}
