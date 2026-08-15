<template>
  <div class="poem-composer">
    <h2 class="composer-title">AI 诗人</h2>
    <p class="composer-subtitle">输入主题，让 AI 为你赋诗一首</p>
    
    <!-- 参数表单 -->
    <div class="composer-form">
      <div class="form-group">
        <label class="form-label">主题</label>
        <input 
          v-model="form.theme" 
          type="text" 
          class="form-input" 
          placeholder="例如：黄河、泰山、春日、离别"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">风格</label>
        <select v-model="form.style" class="form-select">
          <option value="豪放">豪放派</option>
          <option value="婉约">婉约派</option>
          <option value="浪漫">浪漫主义</option>
          <option value="现实">现实主义</option>
          <option value="山水">山水田园</option>
          <option value="边塞">边塞诗</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">字数</label>
        <select v-model="form.wordCount" class="form-select">
          <option value="五言">五言</option>
          <option value="七言">七言</option>
          <option value="不限">不限</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">朝代偏好</label>
        <select v-model="form.dynasty" class="form-select">
          <option value="不限">不限</option>
          <option value="唐">唐代</option>
          <option value="宋">宋代</option>
          <option value="元">元代</option>
          <option value="明">明代</option>
          <option value="清">清代</option>
        </select>
      </div>
      
      <button 
        class="compose-btn" 
        :disabled="loading || !form.theme"
        @click="composePoem"
      >
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else>赋诗一首</span>
      </button>
    </div>
    
    <!-- 生成结果 -->
    <div v-if="poem" class="poem-result">
      <div class="result-header">
        <h3 class="poem-title">{{ poem.title }}</h3>
        <p class="poem-meta">{{ poem.style }} · {{ poem.wordCount }}</p>
      </div>
      
      <!-- 毛笔书写动画区域 -->
      <div class="writing-area">
        <div class="paper-texture">
          <div class="ink-wash-bg"></div>
          <div class="poem-content">
            <div 
              v-for="(line, lineIndex) in poem.lines" 
              :key="lineIndex"
              class="poem-line"
            >
              <div 
                v-for="(char, charIndex) in line" 
                :key="charIndex"
                class="char-container"
              >
                <HanziWriterChar 
                  v-if="isChinese(char)"
                  :char="char"
                  :size="charSize"
                  :delay="(lineIndex * line.length + charIndex) * 300"
                  :auto-play="animationStarted"
                  @animation-complete="onCharAnimationComplete"
                />
                <span 
                  v-else
                  class="poem-char-simple"
                  :style="{ animationDelay: `${(lineIndex * line.length + charIndex) * 0.1}s` }"
                >
                  {{ char }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 印章 -->
          <div 
            class="seal-stamp"
            :class="{ 'animate-stamp': animationStarted }"
            :style="{ animationDelay: `${totalChars * 0.3 + 0.5}s` }"
          >
            <span class="seal-text">AI</span>
          </div>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="result-controls">
        <button class="control-btn" @click="replayAnimation">
          <span class="btn-icon">↻</span> 重播动画
        </button>
        <button class="control-btn" @click="downloadAsImage">
          <span class="btn-icon">↓</span> 保存为图片
        </button>
        <button class="control-btn" @click="sharePoem">
          <span class="btn-icon">↗</span> 分享
        </button>
      </div>
      
      <!-- 诗词解释 -->
      <div v-if="poem.explanation" class="poem-explanation">
        <h4 class="explanation-title">诗词赏析</h4>
        <p class="explanation-content">{{ poem.explanation }}</p>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="composePoem">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import api from '../api'
import HanziWriterChar from './HanziWriterChar.vue'

const form = ref({
  theme: '',
  style: '豪放',
  wordCount: '七言',
  dynasty: '不限'
})

const loading = ref(false)
const error = ref(null)
const poem = ref(null)
const animationStarted = ref(false)
const charSize = ref(80)

const totalChars = computed(() => {
  if (!poem.value) return 0
  return poem.value.lines.reduce((sum, line) => sum + line.length, 0)
})

function isChinese(char) {
  const chineseRegex = /[\u4e00-\u9fff]/
  return chineseRegex.test(char)
}

async function composePoem() {
  if (!form.value.theme) return
  
  loading.value = true
  error.value = null
  poem.value = null
  animationStarted.value = false
  
  try {
    // 后端契约: POST /api/public/ai-poem/generate, 参数走 query(@RequestParam),
    // 返回 Result<AiPoem>{theme,title,content,authorAlias,model,prompt,status}
    const response = await api.post('/ai-poem/generate', null, {
      params: {
        theme: form.value.theme,
        style: form.value.style,
        wordCount: form.value.wordCount,
        dynasty: form.value.dynasty
      }
    })

    // 适配展示形状: 后端无 lines/style/wordCount/explanation 字段,
    // 由 content 拆行; 元信息沿用表单选择值
    const content = (response && response.content) || ''
    poem.value = {
      title: (response && response.title) || '无题',
      content,
      lines: content.split('\n').map((l) => l.trim()).filter(Boolean),
      style: form.value.style,
      wordCount: form.value.wordCount,
      explanation: ''
    }

    // 等待 DOM 更新后开始动画
    await nextTick()
    setTimeout(() => {
      animationStarted.value = true
    }, 100)
  } catch (err) {
    console.error('赋诗失败:', err)
    error.value = err.message || '赋诗失败，请重试'
  } finally {
    loading.value = false
  }
}

function replayAnimation() {
  animationStarted.value = false
  nextTick(() => {
    setTimeout(() => {
      animationStarted.value = true
    }, 50)
  })
}

function onCharAnimationComplete(char) {
  // 单个字符动画完成
  console.log('字符动画完成:', char)
}

async function downloadAsImage() {
  // 实现保存为图片的功能
  alert('保存为图片功能开发中...')
}

function sharePoem() {
  // 实现分享功能
  if (navigator.share) {
    navigator.share({
      title: poem.value.title,
      text: `${poem.value.title}\n\n${poem.value.lines.join('\n')}`,
      url: window.location.href
    }).catch(() => {
      // 用户取消分享等: 静默处理, 避免 unhandled rejection
    })
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    // 复制到剪贴板(仅 HTTPS/localhost 下可用)
    const text = `${poem.value.title}\n\n${poem.value.lines.join('\n')}`
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板')
    }).catch(() => {
      alert('复制失败，请手动复制')
    })
  } else {
    alert('当前浏览器不支持分享，请手动复制')
  }
}
</script>

<style scoped>
.poem-composer {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.composer-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
}

.composer-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 40px;
}

.composer-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.compose-btn {
  grid-column: 1 / -1;
  padding: 16px 32px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.compose-btn:hover:not(:disabled) {
  background: var(--accent-dark);
}

.compose-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-on-accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.poem-result {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 32px;
  margin-top: 40px;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.poem-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.poem-meta {
  font-size: 14px;
  color: var(--text-muted);
}

.writing-area {
  margin-bottom: 32px;
}

.paper-texture {
  position: relative;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%);
  border-radius: 4px;
  padding: 40px;
  min-height: 300px;
  overflow: hidden;
}

.ink-wash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(0,0,0,0.05) 0%, transparent 50%);
  pointer-events: none;
}

.poem-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.poem-line {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.char-container {
  display: inline-block;
  width: v-bind(`${charSize}px`);
  height: v-bind(`${charSize}px`);
}

.poem-char-simple {
  font-family: '楷体', 'KaiTi', serif;
  font-size: 28px;
  color: #2c2c2c;
  opacity: 0;
  transform: translateY(20px);
  animation: writeCharSimple 0.5s ease forwards;
}

@keyframes writeCharSimple {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.seal-stamp {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border: 3px solid #c8a45c;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-15deg);
  opacity: 0;
}

.seal-stamp.animate-stamp {
  animation: stamp 0.5s ease forwards;
}

@keyframes stamp {
  0% {
    opacity: 0;
    transform: rotate(-15deg) scale(2);
  }
  50% {
    opacity: 0.8;
    transform: rotate(-15deg) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: rotate(-15deg) scale(1);
  }
}

.seal-text {
  font-family: '篆体', 'ZhuanTi', serif;
  font-size: 24px;
  color: #c8a45c;
  font-weight: bold;
}

.result-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.btn-icon {
  font-size: 16px;
}

.poem-explanation {
  background: var(--bg-primary);
  border-radius: 4px;
  padding: 24px;
  border-left: 4px solid var(--accent);
}

.explanation-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.explanation-content {
  color: var(--text-secondary);
  line-height: 1.8;
}

.error-message {
  text-align: center;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 40px;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 响应式 */
@media (max-width: 768px) {
  .composer-form {
    grid-template-columns: 1fr;
  }
  
  .char-container {
    width: 60px;
    height: 60px;
  }
  
  .result-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .control-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
