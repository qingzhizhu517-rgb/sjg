<script setup>
import { computed, ref, watch } from 'vue'
import { normalizeCultureExperience } from '../../utils/cultureExperience.js'

const props = defineProps({
  experience: { type: Object, required: true },
  itemTitle: { type: String, default: '' },
})
const content = computed(() => normalizeCultureExperience(props.experience))
const expanded = ref(false)
const isStory = computed(() => content.value.kind === 'story')
const versionNotes = computed(() => content.value.facts.filter(fact => /版本|出处|来源|讲述/.test(fact.label)))
const contextNotes = computed(() => content.value.facts.filter(fact => !/版本|出处|来源|讲述/.test(fact.label)))
const hasNotes = computed(() => content.value.steps.length > 0 || content.value.facts.length > 0)
const indexLabel = computed(() => content.value.kind === 'craft' ? '工序索引与观察线索' : '观察线索')

watch(() => props.experience, () => { expanded.value = false }, { deep: true })
function syncExpanded(event) {
  expanded.value = Boolean(event?.target?.open)
}
</script>

<template>
  <section v-if="hasNotes" class="culture-reading" :aria-label="`${itemTitle || '文化内容'}阅读线索`">
    <div v-if="isStory" class="story-reading">
      <h2>故事线索</h2>
      <ol v-if="content.steps.length" class="story-chapters">
        <li v-for="(step, index) in content.steps" :key="`${index}-${step.title}`">
          <span class="chapter-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <div><h3 v-if="step.description && step.description !== step.title">{{ step.title }}</h3><p>{{ step.description || step.title }}</p></div>
        </li>
      </ol>
      <aside class="source-reading" aria-label="版本与来源阅读提示">
        <p>民间传说会随流传地与讲述者产生不同版本。请结合页面中的原始来源辨读，传说叙述不作为历史实证。</p>
        <dl v-if="versionNotes.length"><div v-for="fact in versionNotes" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
      </aside>
      <dl v-if="contextNotes.length" class="context-notes"><div v-for="fact in contextNotes" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
    </div>
    <details v-else :open="expanded" class="observation-index" @toggle="syncExpanded">
      <summary>{{ indexLabel }}<span v-if="content.steps.length" class="index-count">{{ content.steps.length }} 个环节</span></summary>
      <div class="index-content">
        <p class="index-intro">{{ content.kind === 'craft' ? '看视频或图片时，可对照这些工序观察材料、工具与动作。' : '阅读资料或观看原始素材时，可参考以下线索。' }}</p>
        <ol v-if="content.steps.length" class="process-index"><li v-for="(step, index) in content.steps" :key="`${index}-${step.title}`"><span>{{ step.title }}</span><p v-if="step.description && step.description !== step.title">{{ step.description }}</p></li></ol>
        <dl v-if="content.facts.length" class="context-notes"><div v-for="fact in content.facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
      </div>
    </details>
  </section>
</template>

<style scoped>
.culture-reading { margin-top: var(--sp-5); color: var(--text-secondary); font-size: var(--fs-body-sm); }
.story-reading { border-top: 1px solid var(--border); padding-top: var(--sp-5); }
.story-reading h2 { color: var(--text-primary); font-size: var(--fs-card-title); font-weight: 400; }
.story-chapters { list-style: none; margin-top: var(--sp-4); }
.story-chapters li { display: flex; align-items: baseline; gap: var(--sp-4); padding: var(--sp-3) 0; border-bottom: 1px solid var(--border-light); }
.chapter-number { color: var(--accent); font-size: var(--fs-caption); font-variant-numeric: tabular-nums; }
.story-chapters h3 { font-size: var(--fs-body-sm); font-weight: 400; color: var(--text-primary); margin-bottom: var(--sp-1); }
.story-chapters p { line-height: 1.9; }
.source-reading { margin-top: var(--sp-4); padding-left: var(--sp-4); border-left: 2px solid var(--border); font-size: var(--fs-meta); color: var(--text-muted); line-height: 1.85; }
.context-notes, .source-reading dl { margin-top: var(--sp-3); }
dl > div { display: grid; grid-template-columns: minmax(4.5em, auto) 1fr; gap: var(--sp-4); padding: var(--sp-2) 0; font-size: var(--fs-meta); }
dt { color: var(--text-muted); }
dd { margin: 0; color: var(--text-secondary); line-height: 1.8; }
.observation-index { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.observation-index summary { cursor: pointer; min-height: 48px; padding: var(--sp-3) 0; color: var(--text-secondary); }
.observation-index summary:hover { color: var(--accent); }
.observation-index summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.index-count { margin-left: var(--sp-3); color: var(--text-muted); font-size: var(--fs-caption); }
.index-content { padding-bottom: var(--sp-4); }
.index-intro { color: var(--text-muted); font-size: var(--fs-meta); margin-bottom: var(--sp-3); }
.process-index { padding-left: 1.5em; }
.process-index li { padding: var(--sp-1) 0; line-height: 1.9; }
.process-index li::marker { color: var(--text-muted); }
.process-index p { color: var(--text-muted); font-size: var(--fs-meta); }
@media (max-width: 600px) { dl > div { grid-template-columns: 4.5em 1fr; gap: var(--sp-3); } .story-chapters li { gap: var(--sp-3); } }
</style>
