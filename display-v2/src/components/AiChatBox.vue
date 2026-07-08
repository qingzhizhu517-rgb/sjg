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
              <p class="bubble-txt">{{ msg.content }}</p>
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
import { ref, nextTick, reactive } from 'vue'

const isOpen = ref(false)
const inputMsg = ref('')
const isTyping = ref(false)
const chatLogRef = ref(null)
const inputRef = ref(null)

const quickList = [
  '李白与杜甫在山东同游过哪些地方？',
  '大明湖有哪些经典诗词？',
  '带我去泰山风景区一键抵达。',
  '齐鲁文化大模型包含什么？'
]

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
      body: JSON.stringify({ message: text, history })
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
  box-shadow: 0 6px 20px rgba(142, 53, 46, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ai-toggle-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 24px rgba(142, 53, 46, 0.45);
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
  background: rgba(253, 250, 245, 0.95);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 48px rgba(61, 43, 31, 0.15);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
}

.theme-inkwash .ai-chat-drawer {
  background: rgba(244, 239, 228, 0.95);
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
  background: rgba(142, 53, 46, 0.01);
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
  background: rgba(142, 53, 46, 0.02);
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
