import { ref, computed, watch } from 'vue'

// Global singleton reactive theme state (zero-dependency Pinia alternative)
const themeState = ref(localStorage.getItem('sjg-theme') || 'real')

const toggle = () => {
  themeState.value = themeState.value === 'real' ? 'inkwash' : 'real'
}

watch(themeState, (val) => {
  localStorage.setItem('sjg-theme', val)
  document.documentElement.setAttribute('data-theme', val)
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
