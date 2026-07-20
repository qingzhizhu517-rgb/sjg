import { ref, computed, watch } from 'vue'

// Global singleton reactive theme state (zero-dependency Pinia alternative)
const themeState = ref(localStorage.getItem('sjg-theme') || 'real')

const toggle = () => {
  themeState.value = themeState.value === 'real' ? 'inkwash' : 'real'
}

watch(themeState, (val) => {
  localStorage.setItem('sjg-theme', val)
  const root = document.documentElement
  root.setAttribute('data-theme', val)
  // 主题类上提到 <html>: 统一 .theme-real/.theme-inkwash 机制,
  // 让 fixed/teleport 出 .app-root 的元素也吃到主题 token
  root.classList.remove('theme-real', 'theme-inkwash')
  root.classList.add(val === 'inkwash' ? 'theme-inkwash' : 'theme-real')
}, { immediate: true })

export function useTheme() {
  const isReal = computed(() => themeState.value === 'real')
  const isAnime = computed(() => themeState.value === 'inkwash')

  const imageFor = (realUrl, animeUrl) => {
    return computed(() => themeState.value === 'real' ? realUrl : (animeUrl || realUrl))
  }

  const themeClass = computed(() => themeState.value === 'inkwash' ? 'theme-inkwash' : 'theme-real')

  return {
    theme: themeState,
    isReal,
    isAnime,
    toggle,
    imageFor,
    themeClass
  }
}
