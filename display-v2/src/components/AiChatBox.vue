<template>
  <div class="ai-chat-wrapper" :class="{ 'is-dragging': isDragging }" :style="dockStyle">
    <p id="xiaowen-controls" class="assistant-sr-only">点击小文打开对话，拖动换位置。也可按住 Shift 和方向键移动。</p>
    <button ref="toggleRef" type="button" class="ai-toggle-btn" :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen" aria-controls="reading-assistant" aria-describedby="xiaowen-controls"
      :aria-label="isOpen ? '收起小文对话' : '和小文对话'"
      @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
      @pointercancel="onPointerCancel" @lostpointercapture="onPointerCancel" @keydown="onKeydown"
      @click="onClick($event, () => { isOpen = !isOpen })">
      <span class="pet-greeting" :class="greetingClasses" aria-hidden="true">{{ isDragging ? '这里也可以' : isOpen ? '点我收起对话' : '聊聊齐鲁风物？' }}<small>{{ isDragging ? '松手就停在这里' : '点击对话 · 拖动换位置' }}</small></span>
      <AssistantPet :awake="isOpen" :dragging="isDragging" :thinking="isTyping" />
      <span class="ai-toggle-label" aria-hidden="true"><i></i>小文</span>
    </button>

    <!-- Chat Slide-in Drawer -->
    <transition name="drawer-fade">
      <div id="reading-assistant" ref="drawerRef" class="ai-chat-drawer" :class="{ 'is-short': Number.parseFloat(drawerStyle.height) < 420 }" :style="drawerStyle" v-if="isOpen" role="dialog" tabindex="-1" aria-labelledby="xiaowen-title" @keydown.esc="isOpen = false">
        <!-- Header -->
        <div class="drawer-header-ai">
          <div class="avatar-title-wrap">
            <div class="bot-avatar-active"><AssistantPet compact awake /></div>
            <div class="bot-title-text">
              <h3 id="xiaowen-title" class="bot-name">小文 <span>AI 伴读</span></h3>
              <span class="bot-status">陪你读诗，也陪你看风物</span>
            </div>
          </div>
          <div class="assistant-window-actions">
            <button type="button" class="dock-reset-btn" aria-label="把小文放回右下角" title="放回右下角" @click="resetPosition"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5" /></svg></button>
            <button type="button" class="close-drawer-btn" aria-label="收起小文对话" title="收起对话" @click="isOpen = false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
          </div>
        </div>

        <div class="assistant-tools">
          <router-link class="reading-entry" :to="readingLink" @click="isOpen = false">进入 AI 对照阅读 <span aria-hidden="true">↗</span></router-link>
          <div class="generation-notice" role="status">
            <p>{{ generationNotice }}</p>
            <button v-if="!isPreview && ['unknown', 'not_configured'].includes(generationStatus)" type="button" @click="checkGenerationStatus">重新检查</button>
          </div>
        </div>

        <!-- Predefined Quick Questions -->
        <div class="quick-questions" v-if="messages.length <= 1">
          <span class="quick-lbl">从这里聊起</span>
          <div class="quick-tags">
            <button
              v-for="q in quickList"
              :key="q"
              class="quick-btn-tag"
              :disabled="!canGenerate"
              @click="askQuick(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <!-- Chat messages log -->
        <div class="chat-log" role="log" aria-live="polite" ref="chatLogRef">
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
              <div v-if="msg.role === 'assistant' && isTyping && i === messages.length - 1 && !msg.content.trim()" class="typing-bubble" role="status" aria-label="小文正在思考">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
              <div v-else-if="msg.role === 'assistant'" class="bubble-txt md-body" v-html="renderMd(msg.content)"></div>
              <p v-else class="bubble-txt">{{ msg.content }}</p>
              <!-- 导航 action 按钮 -->
              <div v-if="msg.role === 'assistant' && msg.navAction" class="nav-action-row">
                <button class="nav-action-btn" @click="navigateTo(msg.navAction)">
                  🗺️ {{ msg.navAction.label }}
                </button>
              </div>
              <details v-if="msg.role === 'assistant' && msg.evidence?.length" class="evidence-details">
                <summary>本次依据</summary>
                <div class="evidence-list">
                  <div v-for="item in msg.evidence" :key="`${item.entityType}-${item.entityId}`" class="evidence-item">
                    <strong>{{ item.title }}</strong>
                    <p v-if="item.snippet">{{ item.snippet }}</p>
                    <span v-if="item.sourceIds?.length" class="evidence-sources">来源 ID：{{ item.sourceIds.join('、') }}</span>
                    <span v-else class="evidence-sources">暂无来源 ID</span>
                  </div>
                </div>
              </details>
              <div v-if="msg.role === 'assistant' && msg.auditId && msg.content && !msg.feedback" class="feedback-row">
                <span class="feedback-label">这条回答对你有帮助吗？</span>
                <button type="button" class="feedback-btn" :disabled="isPreview || msg.feedbackSending" @click="sendFeedback(msg, 'helpful')">有帮助</button>
                <button type="button" class="feedback-btn" :disabled="isPreview || msg.feedbackSending" @click="sendFeedback(msg, 'unhelpful')">没帮助</button>
                <button type="button" class="feedback-btn" :disabled="isPreview || msg.feedbackSending" @click="sendFeedback(msg, 'factual_error')">事实有误</button>
                <span v-if="msg.feedbackError" class="feedback-error" role="status">{{ msg.feedbackError }}</span>
              </div>
              <div v-if="msg.role === 'assistant' && msg.feedback" class="feedback-thanks">感谢反馈</div>
            </div>
          </div>
          <!-- 错误重试 -->
          <div v-if="errorMsg && !isTyping" class="retry-row">
            <button class="retry-btn" :disabled="!canGenerate" @click="retryLastMessage">
              ↻ 重新发送
            </button>
          </div>
        </div>

        <!-- Input Box -->
        <form class="chat-input-form" @submit.prevent="sendMessage">
          <input
            v-model="inputMsg"
            type="text"
            placeholder="想了解哪段齐鲁文脉？"
            class="chat-input" aria-label="向小文提问"
            :disabled="!canGenerate && !isTyping"
            required
            ref="inputRef"
          />
          <button type="submit" class="chat-send-btn" aria-label="发送问题" :disabled="!canGenerate || !inputMsg.trim()">
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
import { ref, nextTick, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiUrl } from '../api/url.js'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { consumeSseBuffer } from '../utils/sse.js'
import { atlasLink, isAtlasPreview } from '../config/atlasPreview.js'
import { buildReadingLink } from '../utils/readingLink.js'
import AssistantPet from './AssistantPet.vue'
import { useAssistantDock } from '../composables/useAssistantDock.js'

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
const { dockStyle, drawerStyle, isDragging, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClick, onKeydown, resetPosition } = useAssistantDock()
const greetingClasses = computed(() => ({ 'opens-right': Number.parseFloat(dockStyle.value.left) < 180, 'opens-below': Number.parseFloat(dockStyle.value.top) < 110 }))
const inputMsg = ref('')
const isTyping = ref(false)
const chatLogRef = ref(null)
const inputRef = ref(null)
const toggleRef = ref(null)
const drawerRef = ref(null)
const errorMsg = ref(null)

// SSE 健壮性：AbortController
let abortController = null
let activeAssistant = null
let chatRequestId = 0
let statusController = null
let statusRequestId = 0
const feedbackRequests = new Map()
let disposed = false

// ===== 上下文感知 =====
const route = useRoute()
const router = useRouter()
const isPreview = computed(() => isAtlasPreview(route))
const generationStatus = ref('idle')
const canGenerate = computed(() => !isPreview.value && !isTyping.value && !['checking', 'not_configured'].includes(generationStatus.value))
const generationNotice = computed(() => {
  if (isPreview.value) return '设计预览仅展示样本，不发送提问或反馈。'
  if (generationStatus.value === 'checking') return '正在检查 AI 生成服务…'
  if (generationStatus.value === 'not_configured') return '当前未配置 AI 生成服务。您仍可查阅诗词、来源与对照阅读资料。'
  if (generationStatus.value === 'unknown') return '暂时无法确认 AI 生成服务状态。您可以重新检查，或尝试提问。'
  if (generationStatus.value === 'configured') return 'AI 回答为生成内容，请结合原文与来源核实。'
  return '打开后检查 AI 生成服务；资料导航随时可用。'
})

async function checkGenerationStatus() {
  if (isPreview.value || disposed || generationStatus.value === 'checking') return
  const requestId = ++statusRequestId
  const controller = new AbortController()
  statusController = controller
  generationStatus.value = 'checking'
  try {
    const response = await fetch(apiUrl('/api/public/ai/status'), { signal: controller.signal })
    if (!response.ok) throw new Error('status unavailable')
    const result = await response.json()
    if (result?.code !== 200 || typeof result?.data?.generationConfigured !== 'boolean') throw new Error('invalid status')
    if (requestId !== statusRequestId || controller.signal.aborted || isPreview.value || disposed) return
    generationStatus.value = result.data.generationConfigured ? 'configured' : 'not_configured'
  } catch {
    if (requestId === statusRequestId && !controller.signal.aborted && !isPreview.value && !disposed) generationStatus.value = 'unknown'
  } finally {
    if (requestId === statusRequestId) statusController = null
  }
}

watch(isOpen, async open => {
  if (open && generationStatus.value === 'idle') checkGenerationStatus()
  await nextTick()
  if (open) (inputRef.value?.disabled ? drawerRef.value : inputRef.value)?.focus({ preventScroll: true })
  else toggleRef.value?.focus({ preventScroll: true })
})

// 导航 action 解析
const NAV_PATTERNS = [
  /带我去[「」《》\s]*([^「」《》。，,！!？?\s]+(?:市|城|山|湖|景|阁|楼|台|庙|祠|园|洲|亭|岛|洞|泉|峰|岭|崖|谷|洞|寺|塔|桥|关|寨|堡|港|湾|河|江|溪|泉|瀑|池|潭|井|泉|温泉|古镇|古城|风景区|景区|遗址|故居|纪念馆|博物馆|公园|广场|街道|巷|胡同|路|道|街|弄|里|坊|区|县|镇|乡|村|庄|屯|营|寨|堡|关|隘|口|渡|津|驿|站|亭|台|楼|阁|殿|堂|庙|寺|庵|观|宫|祠|坛|庙|陵|墓|冢|碑|碣|坊|表|阙|亭|台|楼|阁|殿|堂|庙|寺|庵|观|宫|祠|坛|庙|陵|墓|冢|碑|碣|坊|表|阙))[^一-龥]?/,
  /一键抵达[「」《》\s]*([^「」《》。，,！!？?\s]+)/,
  /前往[「」《》\s]*([^「」《》。，,！!？?\s]+)/,
  /去看看[「」《》\s]*([^「」《》。，,！!？?\s]+)/,
]

// 城市名映射
const CITY_NAMES = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']

function extractNavAction(text) {
  if (!text) return null
  for (const pattern of NAV_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const target = match[1].trim()
      // 检查是否是城市名
      const city = CITY_NAMES.find(c => target.includes(c))
      if (city) {
        return { type: 'navigate', label: `前往${city}`, route: `/regions/${city}` }
      }
      // 其他目标（景点等）
      return { type: 'navigate', label: `前往${target}`, route: null }
    }
  }
  return null
}

function navigateTo(action) {
  if (action.route) {
    router.push(atlasLink(action.route, route))
    isOpen.value = false
  } else {
    // 非城市目标：跳转到地图页让用户自行探索
    router.push(atlasLink('/map', route))
    isOpen.value = false
  }
}

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
  } else if (route.name === 'Poets') {
    ctx.type = 'poets'
  } else if (route.name === 'LearningTask') {
    ctx.type = 'learning_task'
    ctx.taskCode = route.params.taskCode
  } else if (typeof route.name === 'string' && route.name.startsWith('CulturalDetail')) {
    ctx.type = 'cultural_item'
    ctx.entityId = route.params.id
  }
  return ctx
})

const readingLink = computed(() => buildReadingLink({
  poem: chatContext.value.poemId,
  spot: chatContext.value.spotId,
  region: chatContext.value.city || route.query.region || (route.name === 'CityCulture' ? route.params.region : undefined),
  returnTo: route.fullPath,
}, route))

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
  if (ctx.type === 'cultural_item') {
    return [
      '这个文化条目的历史渊源是什么？',
      '这个条目与齐鲁文化有什么联系？',
      '页面资料中有哪些可以核实的依据？',
    ]
  }
  // 默认（地图/首页）
  return [
    '李白与杜甫在山东同游过哪些地方？',
    '大明湖有哪些经典诗词？',
    '如何核实诗词中的地理与历史信息？',
    '沿黄九城各有什么文学特色？',
  ]
})

const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是 AI 小文。可以围绕本页资料陪您探寻齐鲁文脉，也可以进入 AI 对照阅读，结合诗词原文与来源一起读。'
  }
])

const askQuick = (q) => {
  inputMsg.value = q
  sendMessage()
}

function cancelActiveRequests() {
  // 先使旧回调失效，再中断网络；旧 catch/finally 不能改动新请求状态。
  chatRequestId += 1
  abortController?.abort()
  abortController = null
  if (activeAssistant && !activeAssistant.content) {
    const index = messages.value.indexOf(activeAssistant)
    if (index !== -1) messages.value.splice(index, 1)
  }
  activeAssistant = null
  isTyping.value = false
  errorMsg.value = null
  statusRequestId += 1
  statusController?.abort()
  statusController = null
  if (generationStatus.value === 'checking') generationStatus.value = 'idle'
  for (const [msg, controller] of feedbackRequests) {
    controller.abort()
    msg.feedbackSending = false
  }
  feedbackRequests.clear()
}

watch(() => [route.path, isPreview.value], () => {
  cancelActiveRequests()
  if (isOpen.value && generationStatus.value === 'idle') checkGenerationStatus()
})

onBeforeUnmount(() => {
  disposed = true
  cancelActiveRequests()
})

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
  if (!text || !canGenerate.value || disposed) return
  if (generationStatus.value === 'idle') await checkGenerationStatus()
  if (!canGenerate.value || disposed) return

  errorMsg.value = null
  messages.value.push({ role: 'user', content: text })
  // 历史：不含当前提问，取最近 10 条作多轮上下文
  const history = messages.value.slice(0, -1).slice(-10).map(m => ({ role: m.role, content: m.content }))
  inputMsg.value = ''
  scrollToBottom()

  isTyping.value = true
  const assistantMsg = reactive({ role: 'assistant', content: '', evidence: [], auditId: null, feedback: null, feedbackSending: false, feedbackError: '' })
  messages.value.push(assistantMsg)
  scrollToBottom()

  const requestId = ++chatRequestId
  const controller = new AbortController()
  abortController = controller
  activeAssistant = assistantMsg
  const isCurrent = () => requestId === chatRequestId && !controller.signal.aborted && !disposed

  try {
    const res = await fetch(apiUrl('/api/public/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message: text, history, context: chatContext.value }),
      signal: controller.signal,
    })
    if (!isCurrent()) return
    if (!res.ok || !res.body) {
      assistantMsg.content = '（服务暂不可用，请稍后再试）'
      errorMsg.value = '服务暂不可用'
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    const handleSseEvent = (payload) => {
      if (!isCurrent() || !payload || payload === '[DONE]') return
      try {
        const obj = JSON.parse(payload)
        if (obj.delta) {
          assistantMsg.content += obj.delta
          scrollToBottom()
        } else if (Array.isArray(obj.items)) {
          assistantMsg.evidence = obj.items
          if (obj.auditId) assistantMsg.auditId = obj.auditId
        } else if (obj.error) {
          assistantMsg.content += (assistantMsg.content ? '\n' : '') + '⚠ ' + obj.error
          errorMsg.value = obj.error
          scrollToBottom()
        }
      } catch {
        // 非 JSON 数据块，忽略
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (!isCurrent()) return
      if (done) {
        buffer += decoder.decode()
        consumeSseBuffer(buffer, true).events.forEach(handleSseEvent)
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const parsed = consumeSseBuffer(buffer)
      parsed.events.forEach(handleSseEvent)
      buffer = parsed.rest
    }

    if (!assistantMsg.content) {
      assistantMsg.content = '（未收到回复，请重试）'
      errorMsg.value = '未收到回复'
    } else {
      // 提取导航 action
      const navAction = extractNavAction(assistantMsg.content)
      if (navAction) {
        assistantMsg.navAction = navAction
      }
    }
  } catch (e) {
    if (!isCurrent()) return
    // AbortError 是用户主动取消，移除空 assistant 消息
    if (e.name === 'AbortError') {
      const lastIdx = messages.value.length - 1
      if (lastIdx >= 0 && messages.value[lastIdx] === assistantMsg && !assistantMsg.content) {
        messages.value.splice(lastIdx, 1)
      }
      return
    }
    assistantMsg.content = '（网络异常，请稍后再试）'
    errorMsg.value = '网络异常'
  } finally {
    if (requestId === chatRequestId) {
      isTyping.value = false
      abortController = null
      activeAssistant = null
    }
  }
}

const sendFeedback = async (msg, feedback) => {
  if (!msg?.auditId || msg.feedback || msg.feedbackSending || isPreview.value || disposed) return
  const controller = new AbortController()
  feedbackRequests.set(msg, controller)
  msg.feedbackSending = true
  msg.feedbackError = ''
  try {
    const res = await fetch(apiUrl('/api/public/chat/feedback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId: msg.auditId, feedback }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error('feedback unavailable')
    const result = await res.json()
    if (result?.code !== 200) throw new Error('feedback rejected')
    if (!controller.signal.aborted && !disposed) msg.feedback = feedback
  } catch {
    if (!controller.signal.aborted && !disposed) msg.feedbackError = '反馈未提交，请重试。'
  } finally {
    if (feedbackRequests.get(msg) === controller) {
      feedbackRequests.delete(msg)
      msg.feedbackSending = false
    }
  }
}

/**
 * 重试：重新发送最后一条用户消息
 */
const retryLastMessage = () => {
  if (!canGenerate.value || disposed) return
  const lastUserMsg = [...messages.value].reverse().find(m => m.role === 'user')
  if (lastUserMsg) {
    inputMsg.value = lastUserMsg.content
    // 移除最后一条 assistant 消息（空的或含错误内容的）
    const lastIdx = messages.value.length - 1
    if (lastIdx >= 0 && messages.value[lastIdx]?.role === 'assistant') {
      messages.value.splice(lastIdx, 1)
    }
    errorMsg.value = null
    sendMessage()
  }
}
</script>

<style scoped>
.ai-chat-wrapper {
  position: fixed;
  width: 88px;
  height: 96px;
  z-index: var(--z-float);
}
.assistant-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.ai-toggle-btn {
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:88px;
  height:96px;
  padding:0;
  border:0;
  background:transparent;
  color:var(--text-secondary);
  cursor:grab;
  touch-action:none;
  user-select:none;
  -webkit-user-select:none;
  -webkit-tap-highlight-color:transparent;
}
.ai-toggle-btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px; border-radius:16px; }
.is-dragging .ai-toggle-btn { cursor:grabbing; }
.ai-toggle-btn > .assistant-pet { width:88px; height:88px; margin-top:-3px; pointer-events:none; transition:filter .2s; }
.ai-toggle-btn:hover > .assistant-pet { filter:drop-shadow(0 5px 4px var(--shadow-soft)); }
.ai-toggle-label { display:flex; align-items:center; gap:5px; margin-top:-3px; font:11px var(--font-body); line-height:18px; letter-spacing:2px; }
.ai-toggle-label i { width:4px; height:4px; background:var(--accent); border-radius:50%; }
.pet-greeting {
  position:absolute;
  bottom:104px;
  right:0;
  width:170px;
  padding:12px 14px;
  border:1px solid var(--border-light);
  border-radius:12px 12px 3px 12px;
  box-shadow:0 5px 22px var(--shadow-soft);
  background:var(--card-bg);
  color:var(--text-primary);
  font:14px var(--font-body);
  line-height:1.5;
  text-align:left;
  opacity:0;
  transform:translateY(4px);
  transition:opacity .18s, transform .18s;
  pointer-events:none;
}
.pet-greeting.opens-right { left:0; right:auto; }
.pet-greeting.opens-below { top:100px; bottom:auto; }
.pet-greeting small { display:block; margin-top:3px; color:var(--text-muted); font-size:11px; white-space:nowrap; }
.ai-toggle-btn:hover .pet-greeting,.ai-toggle-btn:focus-visible .pet-greeting,.is-dragging .pet-greeting { opacity:1; transform:translateY(0); }
.ai-toggle-btn.is-open .pet-greeting { display:none; }
.ai-chat-drawer {
  position:fixed;
  z-index:var(--z-drawer);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  text-align:left;
  background:var(--card-bg);
  border:1px solid var(--border);
  border-radius:16px;
  box-shadow:0 12px 50px var(--shadow-soft),0 2px 8px var(--shadow-a6);
}
.drawer-header-ai {
  flex-shrink:0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  padding:16px 16px 14px 12px;
  border-bottom:1px solid var(--border-light);
  background:var(--bg-primary);
}
.avatar-title-wrap { display:flex; align-items:center; gap:9px; min-width:0; }
.bot-avatar-active { width:50px; height:50px; flex-shrink:0; }
.bot-title-text { display:flex; flex-direction:column; align-items:flex-start; gap:5px; }
.bot-name { margin:0; display:flex; align-items:center; gap:10px; color:var(--text-primary); font:22px var(--font-display); line-height:1.3; }
.bot-name span { font:10px var(--font-body); letter-spacing:1px; color:var(--accent); }
.bot-status { font-size:11px; color:var(--text-muted); }
.assistant-window-actions { display:flex; gap:2px; }
.is-short .quick-questions { display:none; }
.is-short .drawer-header-ai { padding-block:8px; }
.is-short .assistant-tools { padding-block:4px; }
.close-drawer-btn,.dock-reset-btn { width:36px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; background:transparent; color:var(--text-muted); cursor:pointer; }
.close-drawer-btn:hover,.dock-reset-btn:hover { background:var(--bg-secondary); color:var(--accent); }
.close-drawer-btn:focus-visible,.dock-reset-btn:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.close-drawer-btn svg,.dock-reset-btn svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }

.assistant-tools {
  padding: 9px 16px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.reading-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
}
.generation-notice { display: flex; align-items: flex-start; gap: 8px; color: var(--text-muted); font-size: 11px; line-height: 1.6; }
.generation-notice p { margin: 0; overflow-wrap: anywhere; }
.generation-notice button { flex-shrink: 0; border: 0; background: transparent; color: var(--accent); text-decoration: underline; cursor: pointer; font: inherit; padding: 0; }
.quick-btn-tag:disabled,.feedback-btn:disabled { opacity: .5; cursor: not-allowed; }
.feedback-error { flex-basis: 100%; color: var(--accent); }

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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.quick-btn-tag {
  font-size: 12px;
  min-height: 40px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 6px;
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
  min-height: 0;
  padding: 20px 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  gap: 10px;
  max-width: 100%;
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
  padding: 5px 4px;
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

/* Retry button */
.retry-row {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.retry-btn {
  padding: 6px 16px;
  border: 1px solid var(--accent);
  border-radius: 100px;
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 1px;
}

.retry-btn:hover {
  background: var(--accent);
  color: #fff;
}
.retry-btn:disabled { opacity: .5; cursor: not-allowed; }

/* Navigation action button */
.nav-action-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-light);
}

.nav-action-btn {
  padding: 6px 14px;
  border: 1px solid var(--accent);
  border-radius: 100px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 1px;
}

.nav-action-btn:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}

.evidence-details {
  margin-top: 10px;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  font-size: 10px;
  color: var(--text-muted);
}

.evidence-details summary {
  cursor: pointer;
  color: var(--accent);
  font-weight: 700;
}

.evidence-list {
  display: grid;
  gap: 7px;
  margin-top: 7px;
}

.evidence-item {
  padding: 7px 8px;
  border-left: 2px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 4%, transparent);
}

.evidence-item p {
  margin: 3px 0;
  color: var(--text-secondary);
}

.evidence-item a {
  color: var(--accent);
}

.feedback-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 0.76rem;
}

.feedback-label {
  margin-right: 2px;
}

.feedback-btn {
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
  color: var(--text-secondary);
  padding: 3px 8px;
  cursor: pointer;
  font-size: 0.75rem;
}

.feedback-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.feedback-thanks {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.76rem;
}

/* Input Form */
.chat-input-form {
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  background: rgba(0, 0, 0, 0.01);
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  min-height: 44px;
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
  width: 44px;
  height: 44px;
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
  transition: opacity .2s ease, transform .2s ease;
}

.drawer-fade-enter-from, .drawer-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(.98);
}

@media (max-width:600px) {
  .drawer-header-ai { padding:12px; }
  .close-drawer-btn,.dock-reset-btn { width:40px; height:44px; }
  .quick-btn-tag { min-height:40px; }
  .chat-input { font-size:16px; }
}
@media (prefers-reduced-motion:reduce) {
  .drawer-fade-enter-active,.drawer-fade-leave-active,.pet-greeting { transition:none; }
  .typing-dot { animation:none; }
}
</style>
