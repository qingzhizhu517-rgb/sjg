import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase warning threshold for isolated visualization modules (ECharts and G6)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'vendor-echarts'
            }
            if (id.includes('@antv/g6') || id.includes('g6') || id.includes('@antv')) {
              return 'vendor-g6'
            }
            if (id.includes('three')) {
              return 'vendor-three'
            }
            return 'vendor-core' // other libraries like vue, axios, vue-router
          }
        }
      }
    }
  }
})
