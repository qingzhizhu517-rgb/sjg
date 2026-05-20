import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('sjg-theme') || 'real')

  const toggle = () => {
    theme.value = theme.value === 'real' ? 'inkwash' : 'real'
  }

  watch(theme, (val) => {
    localStorage.setItem('sjg-theme', val)
    document.documentElement.setAttribute('data-theme', val)
  }, { immediate: true })

  return { theme, toggle }
})
