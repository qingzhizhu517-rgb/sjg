<template>
  <div class="task-index folio-page">
    <PageHeading eyebrow="研学创作 / 探究任务" title="带着问题，走进山河" description="打开老师分享的任务，从阅读证据到比较分析，再写下你的思考。"><template #actions><router-link :to="atlasLink('/compose', route)" class="folio-button folio-button--quiet">自由创作诗词 ↗</router-link></template></PageHeading>
    <ol class="learning-overview"><li><span>01</span><h2>读证据</h2><p>阅读材料，寻找有来源的线索。</p></li><li><span>02</span><h2>作比较</h2><p>比较不同作品，整理共同与差异。</p></li><li><span>03</span><h2>写思考</h2><p>形成自己的判断，保存研学成果。</p></li></ol>
    <form class="task-index__form" @submit.prevent="openTask">
      <label for="task-code">任务分享 ID</label>
      <div class="task-index__control">
        <input
          id="task-code"
          v-model="taskCode"
          type="text"
          inputmode="text"
          autocomplete="off"
          placeholder="例如 jinan-poetry-01"
          aria-describedby="task-code-help"
        />
        <button type="submit" class="folio-button folio-button--primary">打开任务</button>
      </div>
      <p id="task-code-help" class="task-index__help">分享 ID 只使用小写字母、数字和短横线；如果没有 ID，请向任务发布者索取链接。</p>
      <p v-if="errorMsg" class="task-index__error" role="alert">{{ errorMsg }}</p>
    </form>

    <section class="task-index__note" aria-label="任务说明">
      <h2>你将完成什么</h2>
      <p>先阅读有来源的材料，再进行比较，最后写下自己的判断。每道题都会保留实体和来源线索，完成后可以导出为 Markdown。</p>
      <router-link :to="readingLink" class="folio-button folio-button--quiet">AI对照阅读 ↗</router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageHeading from '../components/ui/PageHeading.vue'
import { atlasLink } from '../config/atlasPreview'
import { buildReadingLink } from '../utils/readingLink'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const readingLink = computed(() => buildReadingLink({ returnTo: route.fullPath }, route))
const taskCode = ref('')
const errorMsg = ref('')

const openTask = () => {
  const code = taskCode.value.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(code)) {
    errorMsg.value = '请输入 3-32 位小写字母、数字或短横线组成的分享 ID。'
    return
  }
  errorMsg.value = ''
  router.push(atlasLink(`/learn/${encodeURIComponent(code)}`, route))
}
</script>

<style scoped>
.task-index { max-width: 820px; min-height: 66vh; margin: 0 auto; padding: 64px 24px 100px; color: var(--text-primary); }
.task-index__hero { max-width: 640px; margin: 0 auto 36px; text-align: center; }
.task-index__tag { display: inline-block; padding: 5px 12px; background: var(--accent); color: var(--text-on-accent); font-size: 12px; letter-spacing: 2px; }
.task-index__hero h1 { margin: 18px 0 12px; font-family: var(--font-heading); font-size: clamp(30px, 5vw, 48px); font-weight: 500; letter-spacing: 3px; }
.task-index__hero p, .task-index__help, .task-index__note p { color: var(--text-secondary); line-height: 1.9; }
.task-index__form { max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid var(--border-light); background: var(--card-bg); }
.task-index__form label { display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600; }
.task-index__control { display: flex; gap: 10px; }
.task-index__control input { min-width: 0; flex: 1; min-height: 46px; padding: 10px 12px; border: 1px solid var(--border); background: var(--bg-primary); color: var(--text-primary); font: inherit; }
.task-index__control button { min-height: 46px; padding: 0 18px; background: var(--accent); color: var(--text-on-accent); font: inherit; cursor: pointer; }
.task-index__help { margin: 12px 0 0; font-size: 13px; }
.task-index__error { margin: 10px 0 0; color: var(--accent); font-size: 13px; }
.task-index__note { max-width: 620px; margin: 32px auto 0; padding: 20px 22px; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 5%, transparent); }
.task-index__note h2 { margin: 0 0 8px; font-family: var(--font-heading); font-size: 22px; }
.task-index__note p { margin: 0; }
.task-index__note .folio-button { margin-top: 16px; }
@media (max-width: 600px) { .task-index { padding: 40px 16px 72px; } .task-index__control { display: grid; grid-template-columns: 1fr; } }
.task-index { max-width:1180px; padding:32px var(--page-gutter) 70px; }
.learning-overview { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); list-style:none; gap:24px; margin:30px 0 35px; }
.learning-overview li { border-bottom:1px solid var(--border-light); padding:18px 0 24px; }
.learning-overview span { font:italic 18px Georgia,serif; color:#a4957e; }
.learning-overview h2 { font:25px var(--font-display); margin:12px 0; }
.learning-overview p { font-size:13px; color:var(--text-secondary); }
.task-index__form { max-width:none; padding:30px; background:#eee9df70; }
.task-index__note { max-width:none; background:transparent; border-left:0; padding:0; margin-top:32px; }
@media(max-width:600px) { .learning-overview { gap:14px; } .learning-overview h2 { font-size:21px; } .learning-overview p { font-size:12px; } .task-index__form { padding:22px; } }
</style>
