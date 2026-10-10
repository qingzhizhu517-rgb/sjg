<template>
  <div class="reading-ai-response" @click="followReference">
    <div v-if="html" class="ai-markdown" v-html="html"></div>
    <p v-else class="ai-placeholder">先读原文，选择一个比较方向。AI 会提出带行号的阅读线索，你可以回到原句核对。</p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { findReadingReference } from '../../utils/readingState.js'
import { safeSourceUrl } from '../../utils/source.js'
const props = defineProps({ text: { type: String, default: '' }, materials: { type: Array, default: () => [] } })
const emit = defineEmits(['reference'])
const html = computed(() => {
  if (!props.text) return ''
  const clean = DOMPurify.sanitize(marked.parse(props.text, { breaks: true }), { FORBID_TAGS: ['img', 'iframe', 'form', 'input', 'button', 'style'], FORBID_ATTR: ['style', 'id'] })
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  for (const link of doc.querySelectorAll('a')) {
    const url = safeSourceUrl(link.getAttribute('href'))
    if (url) { link.setAttribute('href', url); link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noopener noreferrer') }
    else link.replaceWith(doc.createTextNode(link.textContent))
  }
  const walker = doc.createTreeWalker(doc.body, 4)
  const nodes = []
  while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('a,code,pre')) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const value = node.textContent
    const matches = [...value.matchAll(/\[([AB]):([1-9]\d*)\]/g)].filter(match => findReadingReference(match[1], Number(match[2]), props.materials))
    if (!matches.length) continue
    const fragment = doc.createDocumentFragment(); let cursor = 0
    for (const match of matches) {
      fragment.append(doc.createTextNode(value.slice(cursor, match.index)))
      const button = doc.createElement('button')
      button.type = 'button'; button.className = 'reading-reference'; button.dataset.readingLabel = match[1]; button.dataset.readingNumber = match[2]
      button.textContent = match[0]; button.setAttribute('aria-label', `核对材料${match[1]}第${match[2]}行原文`)
      fragment.append(button); cursor = match.index + match[0].length
    }
    fragment.append(doc.createTextNode(value.slice(cursor))); node.replaceWith(fragment)
  }
  return doc.body.innerHTML
})
function followReference(event) {
  const button = event.target.closest?.('button.reading-reference')
  if (!button) return
  const reference = findReadingReference(button.dataset.readingLabel, Number(button.dataset.readingNumber), props.materials)
  if (reference) emit('reference', reference)
}
</script>
<style scoped>
.reading-ai-response { font-size:15px; line-height:1.95; overflow-wrap:anywhere; min-width:0; }
.ai-placeholder { color:var(--text-muted); padding:22px 0; max-width:38em; }
.ai-markdown :deep(p),.ai-markdown :deep(ul),.ai-markdown :deep(ol) { margin:12px 0; } .ai-markdown :deep(ul),.ai-markdown :deep(ol) { padding-left:22px; } .ai-markdown :deep(h1),.ai-markdown :deep(h2),.ai-markdown :deep(h3) { margin:18px 0 8px; font-size:18px; font-weight:600; } .ai-markdown :deep(blockquote) { border-left:2px solid var(--border); padding-left:14px; color:var(--text-secondary); } .ai-markdown :deep(pre) { white-space:pre-wrap; background:var(--bg-secondary); padding:12px; } .ai-markdown :deep(a) { text-decoration:underline; color:var(--accent); } .ai-markdown :deep(table) { display:block; max-width:100%; overflow-x:auto; } .ai-markdown :deep(td),.ai-markdown :deep(th) { border:1px solid var(--border); padding:6px; }
.ai-markdown :deep(.reading-reference) { display:inline-flex; align-items:center; min-height:44px; padding:0 6px; margin:0 2px; color:var(--accent); background:var(--accent-soft); border-bottom:1px solid var(--accent-a35); border-radius:2px; font-size:13px; font-family:inherit; vertical-align:baseline; } .ai-markdown :deep(.reading-reference:focus-visible) { outline:2px solid var(--accent); outline-offset:2px; }
</style>
