import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

export function useTheme() {
  const store = useThemeStore()

  const isReal = computed(() => store.theme === 'real')
  const isAnime = computed(() => store.theme === 'inkwash')

  const imageFor = (realUrl, animeUrl) => {
    return computed(() => store.theme === 'real' ? realUrl : (animeUrl || realUrl))
  }

  const themeClass = computed(() => store.theme === 'inkwash' ? 'theme-inkwash' : 'theme-real')

  return { theme: computed(() => store.theme), isReal, isAnime, toggle: store.toggle, imageFor, themeClass }
}
