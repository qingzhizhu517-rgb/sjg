<template>
  <div class="poem-composer">
    <h2 class="composer-title">写下你的灵感</h2>
    <p class="composer-subtitle">可以写一个地方、一种情绪，或一句想表达的话。</p>
    
    <!-- 参数表单 -->
    <form class="composer-form" @submit.prevent="composePoem">
      <div class="form-group">
        <label class="form-label" for="compose-theme">主题</label>
        <input 
          v-model="form.theme" id="compose-theme" maxlength="120" required
          type="text" 
          class="form-input folio-input"
          placeholder="例如：黄河、泰山、春日、离别"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="compose-style">风格</label>
        <select v-model="form.style" id="compose-style" class="form-select folio-select">
          <option value="豪放">豪放派</option>
          <option value="婉约">婉约派</option>
          <option value="浪漫">浪漫主义</option>
          <option value="现实">现实主义</option>
          <option value="山水">山水田园</option>
          <option value="边塞">边塞诗</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="compose-length">字数</label>
        <select v-model="form.wordCount" id="compose-length" class="form-select folio-select">
          <option value="五言">五言</option>
          <option value="七言">七言</option>
          <option value="不限">不限</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="compose-dynasty">朝代偏好</label>
        <select v-model="form.dynasty" id="compose-dynasty" class="form-select folio-select">
          <option value="不限">不限</option>
          <option value="唐">唐代</option>
          <option value="宋">宋代</option>
          <option value="元">元代</option>
          <option value="明">明代</option>
          <option value="清">清代</option>
        </select>
      </div>
      
      <button 
        type="submit" class="compose-btn folio-button folio-button--primary"
        :disabled="loading || !form.theme.trim()"

      >
        <span v-if="loading" role="status">正在生成…</span>
        <span v-else>赋诗一首</span>
      </button>
    </form>
    
    <!-- 生成结果 -->
    <div v-if="poem" class="poem-result">
      <div class="result-header">
        <h3 class="poem-title">{{ poem.title }}</h3>
        <p class="poem-meta">{{ poem.style }} · {{ poem.wordCount }}</p>
      </div>
      
      <!-- 毛笔书写动画区域 -->
      <div class="writing-area">
        <div class="paper-texture" ref="paperRef">
          <div class="ink-wash-bg"></div>
          <div class="poem-content" :key="animationEpoch">
            <div
              v-for="(chars, lineIndex) in renderedLines"
              :key="lineIndex"
              class="poem-line"
            >
              <div
                v-for="item in chars"
                :key="item.index"
                class="char-container"
              >
                <HanziWriterChar
                  v-if="isChinese(item.char)"
                  :key="`${item.index}-${animationEpoch}`"
                  :char="item.char"
                  :size="charSize"
                  :delay="item.index * charDelayMs"
                  :auto-play="animationStarted"
                  @animation-complete="onCharAnimationComplete"
                />
                <span
                  v-else
                  class="poem-char-simple"
                  :style="{ animationDelay: `${(item.index * charDelayMs) / 1000}s` }"
                >
                  {{ item.char }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 印章 -->
          <div 
            class="seal-stamp"
            :class="{ 'animate-stamp': animationStarted }"
            :style="{ animationDelay: sealDelayCss }"
          >
            <span class="seal-text">AI</span>
          </div>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="result-controls">
        <button type="button" class="control-btn folio-button" @click="replayAnimation">
          <span class="btn-icon">↻</span> 重播动画
        </button>
        <button type="button" class="control-btn folio-button" :disabled="exporting" @click="downloadAsImage">
          <span class="btn-icon">↓</span> {{ exporting ? '正在制作诗笺…' : '保存为图片' }}
        </button>
        <button type="button" class="control-btn folio-button" @click="sharePoem">
          <span class="btn-icon">↗</span> 分享
        </button>
      </div>
      <p v-if="actionMessage" class="composer-action-message" role="status">{{ actionMessage }}</p>
      <!-- 诗词解释 -->
      <div v-if="poem.explanation" class="poem-explanation">
        <h4 class="explanation-title">诗词赏析</h4>
        <p class="explanation-content">{{ poem.explanation }}</p>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="retry-btn folio-button" :disabled="loading" @click="composePoem">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import api from '../api'
import HanziWriterChar from './HanziWriterChar.vue'
import { createPoemCard } from '../utils/poemCard.js'

const form = ref({
  theme: '',
  style: '豪放',
  wordCount: '七言',
  dynasty: '不限'
})

const loading = ref(false)
const exporting = ref(false)
const actionMessage = ref('')
const error = ref(null)
const poem = ref(null)
const animationStarted = ref(false)

/**
 * 每轮播放的代号。重播或重新生成时自增，配合 :key 让所有字组件销毁重建。
 * 这是保证「从一笔未写的空白字帖重新写起」最可靠的方式：复用旧实例时，
 * delay 未到的字仍停留在上一轮的完成态，视觉上就像照着旧字又描了一遍。
 */
const animationEpoch = ref(0)

/**
 * 结果区字号必须自适应：此前 charSize 固定 80px，而一行 12 个字符就需要
 * 12×(80+8)≈1056px，但纸面可用宽度只有约 640px，于是 .poem-line 的 flex-wrap
 * 把整句拦腰折断（「渊。」被挤到下一行），版面完全散掉。
 * 现在按「纸面实际宽度 ÷ 最长行字数」反推字号，并夹在可读区间内。
 */
const paperRef = ref(null)
const paperWidth = ref(0)
let resizeObserver = null

const CHAR_GAP_RATIO = 0.07
const MAX_CHAR_SIZE = 76
const MIN_CHAR_SIZE = 20

const longestLineLength = computed(() => {
  const lines = poem.value?.lines || []
  if (!lines.length) return 0
  return Math.max(...lines.map((line) => [...line].length))
})

const charSize = computed(() => {
  const count = longestLineLength.value
  if (!count) return 64
  const available = paperWidth.value || 600
  const gap = Math.round(MAX_CHAR_SIZE * CHAR_GAP_RATIO)
  const raw = Math.floor((available - gap * (count - 1)) / count)
  return Math.max(MIN_CHAR_SIZE, Math.min(MAX_CHAR_SIZE, raw))
})

const charSizeCss = computed(() => `${charSize.value}px`)
const charGapCss = computed(() => `${Math.max(2, Math.round(charSize.value * CHAR_GAP_RATIO))}px`)
const charSimpleFontCss = computed(() => `${Math.max(12, Math.round(charSize.value * 0.6))}px`)

/** 预先把每行拆成带全局序号的字，序号用于计算逐字延迟（跨行连续，不因行长不同而错位） */
const renderedLines = computed(() => {
  let index = 0
  return (poem.value?.lines || []).map((line) => [...line].map((char) => ({ char, index: index++ })))
})

const totalChars = computed(() =>
  (poem.value?.lines || []).reduce((sum, line) => sum + [...line].length, 0)
)

/**
 * 逐字书写间隔（毫秒）。按总字数反推，把整首诗的书写时长控制在 5 秒左右：
 * 固定 260ms 会让 4 行 56 字的诗拖到近 15 秒，印章更是迟迟不落。
 */
const CHAR_DELAY_TARGET_MS = 5000
const charDelayMs = computed(() => {
  const count = totalChars.value
  if (!count) return 260
  return Math.max(90, Math.min(260, Math.round(CHAR_DELAY_TARGET_MS / count)))
})

/** 印章在最后一个字落笔后随即盖上 */
const sealDelayCss = computed(() => `${((totalChars.value * charDelayMs.value) / 1000 + 0.25).toFixed(2)}s`)

function measurePaper() {
  const el = paperRef.value
  if (!el) return
  const styles = window.getComputedStyle(el)
  const padding = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0')
  const width = el.clientWidth - (Number.isFinite(padding) ? padding : 0)
  if (width > 0) paperWidth.value = Math.floor(width)
}

function ensurePaperObserver() {
  const el = paperRef.value
  if (!el) return
  if (resizeObserver) resizeObserver.disconnect()
  measurePaper()
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect?.width
    if (width) paperWidth.value = Math.floor(width)
  })
  resizeObserver.observe(el)
}

onMounted(() => {
  window.addEventListener('resize', measurePaper)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measurePaper)
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = null
})

function isChinese(char) {
  const chineseRegex = /[\u4e00-\u9fff]/
  return chineseRegex.test(char)
}

async function composePoem() {
  if (loading.value || !form.value.theme.trim()) return
  form.value.theme = form.value.theme.trim()
  const preferences = { ...form.value }
  actionMessage.value = ''
  
  loading.value = true
  error.value = null
  poem.value = null
  animationStarted.value = false
  animationEpoch.value += 1
  
  try {
    // 后端契约: POST /api/public/ai-poem/generate, 参数走 query(@RequestParam),
    // 返回 Result<AiPoem>{theme,title,content,authorAlias,model,prompt,status}
    const response = await api.post('/ai-poem/generate', null, {
      params: {
        ...preferences
      }
    })

    // 适配展示形状: 后端无 lines/style/wordCount/explanation 字段,
    // 由 content 拆行; 元信息沿用表单选择值
    const content = (response && response.content) || ''
    if (typeof content !== 'string' || !content.trim()) throw new Error('本次未生成诗词内容，请重试。')
    poem.value = {
      title: (response && response.title) || '无题',
      content,
      lines: content.split('\n').map((l) => l.trim()).filter(Boolean),
      style: preferences.style,
      wordCount: preferences.wordCount,
      explanation: ''
    }

    // 等待 DOM 更新：先按纸面真实宽度定字号（否则会退回默认宽度，字被算得过小），再启动逐字书写
    await nextTick()
    ensurePaperObserver()
    setTimeout(() => {
      animationStarted.value = true
    }, 120)
  } catch (err) {
    console.error('赋诗失败:', err)
    error.value = err.message || '赋诗失败，请重试'
  } finally {
    loading.value = false
  }
}

function replayAnimation() {
  animationStarted.value = false
  animationEpoch.value += 1
  nextTick(() => {
    setTimeout(() => {
      animationStarted.value = true
    }, 60)
  })
}

function onCharAnimationComplete(char) {
  // 单个字符动画完成
  console.log('字符动画完成:', char)
}

async function downloadAsImage() {
  if (!poem.value || exporting.value) return
  const currentPoem = { ...poem.value, lines: [...poem.value.lines] }
  exporting.value = true
  actionMessage.value = ''
  try {
    await document.fonts.ready
    const canvas = createPoemCard(currentPoem)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('图片未能生成，请重试。')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${String(currentPoem.title || '齐鲁诗笺').replace(/[\\/:*?"<>|]/g, '').slice(0, 60)}.png`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    actionMessage.value = '诗笺图片已准备好，请在浏览器下载中查看。'
  } catch (err) { actionMessage.value = err.message || '图片导出失败，请重试。' }
  finally { exporting.value = false }
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
      actionMessage.value = '诗词已复制，可以粘贴分享。'
    }).catch(() => {
      actionMessage.value = '复制失败，请手动选中诗词复制。'
    })
  } else {
    actionMessage.value = '当前浏览器不支持分享，请手动选中诗词复制。'
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
  margin-top: 35px;
}

.result-header {
  text-align: center;
  margin-bottom: 20px;
}

.poem-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.poem-meta {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--text-muted);
}

.writing-area {
  margin-bottom: 32px;
}

.paper-texture {
  position: relative;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 3px;
  /* 上下留白略大于左右，给逐行书写留呼吸感；底部额外留出印章位置 */
  padding: 34px 32px 58px;
  min-height: 300px;
  overflow: hidden;
}

.ink-wash-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 18% 40%, var(--accent-faint) 0%, transparent 55%),
    radial-gradient(ellipse at 84% 62%, var(--accent-faint) 0%, transparent 55%);
  pointer-events: none;
}

.poem-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.poem-line {
  display: flex;
  justify-content: center;
  align-items: center;
  /* 字号已按最长行反推，这里绝不能再折行，否则整句会被拦腰截断 */
  flex-wrap: nowrap;
  gap: v-bind(charGapCss);
}

.char-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: v-bind(charSizeCss);
  height: v-bind(charSizeCss);
}

.poem-char-simple {
  font-family: var(--font-display);
  font-size: v-bind(charSimpleFontCss);
  color: #2f2a24;
  opacity: 0;
  transform: translateY(10px);
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
  bottom: 24px;
  right: 26px;
  width: 46px;
  height: 46px;
  border: 2px solid var(--accent);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-12deg);
  opacity: 0;
}

.seal-stamp.animate-stamp {
  animation: stamp 0.5s ease forwards;
}

@keyframes stamp {
  0% {
    opacity: 0;
    transform: rotate(-12deg) scale(2);
  }
  50% {
    opacity: 0.8;
    transform: rotate(-12deg) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: rotate(-12deg) scale(1);
  }
}

.seal-text {
  font-family: var(--font-display);
  font-size: 17px;
  color: var(--accent);
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

  .result-controls {
    flex-direction: column;
    align-items: center;
  }

  .control-btn {
    width: 100%;
    justify-content: center;
  }

  .paper-texture {
    padding: 24px 16px 52px;
  }
}
.poem-composer { max-width:none; padding:0; background:none; }
.composer-title { font:26px var(--font-display); text-align:left; }
.composer-subtitle { text-align:left; font-size:14px; color:var(--text-secondary); margin:10px 0 24px; }
.composer-form { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; padding:28px; border:1px solid var(--border-light); background:#eee9df70; border-radius:3px; }
.composer-form .form-group:first-child { grid-column:1/-1; }
.form-group { margin:0; }
.form-label { font-size:13px; margin-bottom:8px; }
.form-input,.form-select { width:100%; }
.compose-btn { grid-column:1/-1; justify-self:end; width:auto; min-width:170px; margin-top:5px; box-shadow:none; }
.result-controls { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; border-top:1px solid var(--border-light); padding-top:22px; }
.char-container :deep(.hanzi-writer-char), .char-container :deep(svg) { width:100%; height:100%; }
.poem-result { margin-top:35px; }
@media(max-width:600px) { .composer-form { grid-template-columns:1fr; padding:22px; } .compose-btn { width:100%; } .result-controls > button { flex:1 1 45%; } }
</style>
