<template>
  <div class="ai-chat-wrapper">
    <!-- Floating Chat Toggle Button -->
    <button class="ai-toggle-btn" @click="isOpen = !isOpen" :title="isOpen ? '关闭小文' : '唤醒AI小文'">
      <div class="bot-avatar-inner">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <span class="pulse-ring"></span>
    </button>

    <!-- Chat Slide-in Drawer -->
    <transition name="drawer-fade">
      <div class="ai-chat-drawer card" v-if="isOpen">
        <!-- Header -->
        <div class="drawer-header-ai">
          <div class="avatar-title-wrap">
            <div class="bot-avatar-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M12 2v9M8 5h8" />
              </svg>
            </div>
            <div class="bot-title-text">
              <h3 class="bot-name">AI 小文</h3>
              <span class="bot-status">齐鲁文化大模型驱动</span>
            </div>
          </div>
          <button class="close-drawer-btn" @click="isOpen = false">×</button>
        </div>

        <!-- Predefined Quick Questions -->
        <div class="quick-questions" v-if="messages.length <= 1">
          <span class="quick-lbl">您可以这样问我：</span>
          <div class="quick-tags">
            <button
              v-for="q in quickList"
              :key="q"
              class="quick-btn-tag"
              @click="askQuick(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <!-- Chat messages log -->
        <div class="chat-log" ref="chatLogRef">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message-row"
            :class="msg.role"
          >
            <!-- Avatar -->
            <div class="msg-avatar">
              <span v-if="msg.role === 'assistant'">文</span>
              <span v-else>访</span>
            </div>
            <!-- Bubble -->
            <div class="msg-bubble">
              <div v-if="msg.role === 'assistant'" class="bubble-txt md-body" v-html="renderMd(msg.content)"></div>
              <p v-else class="bubble-txt">{{ msg.content }}</p>
            </div>
          </div>
          <!-- Typing indicator -->
          <div class="message-row assistant" v-if="isTyping">
            <div class="msg-avatar">文</div>
            <div class="msg-bubble typing-bubble">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>

        <!-- Input Box -->
        <form class="chat-input-form" @submit.prevent="sendMessage">
          <input
            v-model="inputMsg"
            type="text"
            placeholder="探寻齐鲁文脉，问我李杜足迹..."
            class="chat-input"
            required
            ref="inputRef"
          />
          <button type="submit" class="chat-send-btn" :disabled="isTyping">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="send-svg">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Markdown 渲染：breaks(单换行-><br>) + gfm(表格/删除线)
marked.setOptions({ breaks: true, gfm: true })
// 链接强制新标签打开 + noopener，避免覆盖当前应用页
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})
// LLM 输出不可信：marked 解析后必须经 DOMPurify 消毒再 v-html，防 <script>/onerror 等 XSS
const renderMd = (md) => (md ? DOMPurify.sanitize(marked.parse(md)) : '')

const isOpen = ref(false)
const inputMsg = ref('')
const isTyping = ref(false)
const chatLogRef = ref(null)
const inputRef = ref(null)

// ===== 上下文感知 =====
const route = useRoute()

const chatContext = computed(() => {
  const ctx = { type: 'map' }
  if (route.name === 'RegionSpots') {
    ctx.type = 'city'
    ctx.city = route.params.region
  } else if (route.name === 'PoetDetail') {
    ctx.type = 'poet'
    ctx.poetId = route.params.id
  } else if (route.name === 'PoemDetail') {
    ctx.type = 'poem'
    ctx.poemId = route.params.id
  } else if (route.name === 'SpotDetail') {
    ctx.type = 'spot'
    ctx.spotId = route.params.id
  } else if (route.name === 'Timeline') {
    ctx.type = 'timeline'
  } else if (route.name === 'Poets' || route.name === 'PoetsAll') {
    ctx.type = 'poets'
  }
  return ctx
})

const quickList = computed(() => {
  const ctx = chatContext.value
  if (ctx.type === 'city') {
    return [
      `${ctx.city}有哪些著名诗人？`,
      `${ctx.city}的文学景观有哪些？`,
      `推荐${ctx.city}的经典诗词`,
      `${ctx.city}的历史文化背景`,
    ]
  }
  if (ctx.type === 'poet') {
    return [
      `这位诗人的代表作是什么？`,
      `他在山东留下过哪些足迹？`,
      `与他同时代的齐鲁诗人有哪些？`,
    ]
  }
  if (ctx.type === 'poem') {
    return [
      `这首诗的创作背景是什么？`,
      `这首诗的意境赏析`,
      `这位诗人还写过哪些名篇？`,
    ]
  }
  if (ctx.type === 'timeline') {
    return [
      `哪个朝代的齐鲁诗人最多？`,
      `唐宋时期的山东文学特点`,
      `齐鲁文脉的演变历程`,
    ]
  }
  // 默认（地图/首页）
  return [
    '李白与杜甫在山东同游过哪些地方？',
    '大明湖有哪些经典诗词？',
    '齐鲁文化大模型包含什么？',
    '沿黄九城各有什么文学特色？',
  ]
})

const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是 AI 小文。已为您接入齐鲁文化大模型，集合了历史名人、文化典籍、自然地理景观等六大板块。请问有什么可以帮您？'
  }
])

const askQuick = (q) => {
  inputMsg.value = q
  sendMessage()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatLogRef.value) {
      chatLogRef.value.scrollTop = chatLogRef.value.scrollHeight
    }
  })
}

/**
 * 发送消息：POST /api/public/chat（SSE 流式）。
 * 后端经 RAG 检索 + 大模型流式生成，逐 token 返回 {"delta":"..."} 事件。
 */
const sendMessage = async () => {
  const text = inputMsg.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ role: 'user', content: text })
  // 历史：不含当前提问，取最近 10 条作多轮上下文
  const history = messages.value.slice(0, -1).slice(-10).map(m => ({ role: m.role, content: m.content }))
  inputMsg.value = ''
  scrollToBottom()

  isTyping.value = true
  const assistantMsg = reactive({ role: 'assistant', content: '' })
  messages.value.push(assistantMsg)
  scrollToBottom()

  try {
    const res = await fetch('/api/public/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message: text, history, context: chatContext.value })
    })
    if (!res.ok || !res.body) {
      isTyping.value = false
      assistantMsg.content = '（服务暂不可用，请稍后再试）'
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let firstDelta = true

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE 事件以空行(\n\n)分隔
      let idx
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const event = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        const dataLines = event
          .split('\n')
          .filter(l => l.startsWith('data:'))
          .map(l => l.slice(5))
        if (!dataLines.length) continue
        const payload = dataLines.join('\n').trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const obj = JSON.parse(payload)
          if (obj.delta) {
            if (firstDelta) { isTyping.value = false; firstDelta = false }
            assistantMsg.content += obj.delta
            scrollToBottom()
          } else if (obj.error) {
            isTyping.value = false
            assistantMsg.content += (assistantMsg.content ? '\n' : '') + '⚠ ' + obj.error
            scrollToBottom()
          }
        } catch {
          // 非 JSON 数据块，忽略
        }
      }
    }

    isTyping.value = false
    if (!assistantMsg.content) assistantMsg.content = '（未收到回复，请重试）'
  } catch (e) {
    isTyping.value = false
    assistantMsg.content = '（网络异常，请稍后再试）'
  }
}
</script>

<style scoped>
.ai-chat-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

/* Floating button */
.ai-toggle-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px var(--accent-a35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ai-toggle-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 45%, transparent);
}

.bot-avatar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-icon {
  width: 24px;
  height: 24px;
}

/* Breathing glow ring */
.pulse-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid var(--accent);
  border-radius: 50%;
  animation: pulseGlow 2s infinite;
  pointer-events: none;
}

@keyframes pulseGlow {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* Slide in drawer panel */
.ai-chat-drawer {
  position: absolute;
  bottom: 66px;
  right: 0;
  width: 350px;
  height: 480px;
  background: color-mix(in srgb, var(--bg-primary) 95%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 48px color-mix(in srgb, var(--text-primary) 15%, transparent);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
}

.drawer-header-ai {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.02);
}

.avatar-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-avatar-active {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-avatar-active svg {
  width: 18px;
  height: 18px;
}

.bot-title-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.bot-name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.bot-status {
  font-size: 9px;
  color: var(--text-muted);
  font-weight: bold;
}

.close-drawer-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
}

.close-drawer-btn:hover {
  color: var(--accent);
}

/* Quick Questions tags */
.quick-questions {
  padding: 12px 16px;
  border-bottom: 1px dashed var(--border-light);
  background: var(--accent-a1);
}

.quick-lbl {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.quick-btn-tag {
  font-size: 11px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn-tag:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 2%, transparent);
}

/* Message log list */
.chat-log {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  gap: 10px;
  max-width: 88%;
}

.message-row.assistant {
  align-self: flex-start;
}

.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
  max-width: 80%;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
  font-size: 14px;
}

.msg-bubble {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
}

.message-row.user .msg-bubble {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.bubble-txt {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

.message-row.user .bubble-txt {
  color: #fff;
}

/* Markdown 渲染（助手气泡；v-html 内容需用 :deep 穿透 scoped） */
.bubble-txt.md-body {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.bubble-txt.md-body :deep(p) { margin: 0 0 8px; }
.bubble-txt.md-body :deep(p:last-child) { margin-bottom: 0; }
.bubble-txt.md-body :deep(ul),
.bubble-txt.md-body :deep(ol) { margin: 6px 0; padding-left: 20px; }
.bubble-txt.md-body :deep(li) { margin: 2px 0; }
.bubble-txt.md-body :deep(li > ul),
.bubble-txt.md-body :deep(li > ol) { margin: 2px 0; }
.bubble-txt.md-body :deep(h1),
.bubble-txt.md-body :deep(h2),
.bubble-txt.md-body :deep(h3),
.bubble-txt.md-body :deep(h4) {
  margin: 10px 0 6px;
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.3;
}
.bubble-txt.md-body :deep(h1) { font-size: 16px; }
.bubble-txt.md-body :deep(h2) { font-size: 15px; }
.bubble-txt.md-body :deep(h3) { font-size: 14px; }
.bubble-txt.md-body :deep(h4) { font-size: 13px; }
.bubble-txt.md-body :deep(strong) { font-weight: 700; }
.bubble-txt.md-body :deep(em) { font-style: italic; }
.bubble-txt.md-body :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  word-break: break-all;
}
.bubble-txt.md-body :deep(blockquote) {
  margin: 6px 0;
  padding: 4px 10px;
  border-left: 3px solid var(--accent);
  background: rgba(142, 53, 46, 0.04);
  color: var(--text-secondary);
}
.bubble-txt.md-body :deep(blockquote p) { margin: 0; }
.bubble-txt.md-body :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
}
.bubble-txt.md-body :deep(pre) {
  margin: 8px 0;
  padding: 10px 12px;
  background: #2b2b2b;
  border-radius: 6px;
  overflow-x: auto;
}
.bubble-txt.md-body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #f8f8f2;
  font-size: 12px;
  line-height: 1.5;
}
.bubble-txt.md-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 12px;
}
.bubble-txt.md-body :deep(th),
.bubble-txt.md-body :deep(td) {
  border: 1px solid var(--border-light);
  padding: 4px 8px;
  text-align: left;
}
.bubble-txt.md-body :deep(th) {
  background: rgba(0, 0, 0, 0.03);
  font-weight: 700;
}
.bubble-txt.md-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 10px 0;
}

/* Typing bubble dots */
.typing-bubble {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 18px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite both;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}

/* Input Form */
.chat-input-form {
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  background: rgba(0, 0, 0, 0.01);
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: var(--accent);
}

.chat-send-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-send-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(142, 53, 46, 0.25);
  transform: scale(1.02);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-svg {
  width: 16px;
  height: 16px;
}

/* Slide Drawer animation */
.drawer-fade-enter-active, .drawer-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-fade-enter-from, .drawer-fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* Responsive adjustment */
@media (max-width: 768px) {
  .ai-chat-drawer {
    width: calc(100vw - 32px);
    right: 0px;
    height: 400px;
  }
}
</style>
