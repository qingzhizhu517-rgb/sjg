<template>
  <main class="task-index">
    <header class="task-index__hero">
      <span class="task-index__tag">教学应用 · 一城一课</span>
      <h1>进入诗词探究任务</h1>
      <p>输入老师或研究者提供的分享 ID，打开一份可追溯、可导出的学习任务。</p>
    </header>

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
        <button type="submit">打开任务</button>
      </div>
      <p id="task-code-help" class="task-index__help">分享 ID 只使用小写字母、数字和短横线；如果没有 ID，请向任务发布者索取链接。</p>
      <p v-if="errorMsg" class="task-index__error" role="alert">{{ errorMsg }}</p>
    </form>

    <section class="task-index__note" aria-label="任务说明">
      <h2>你将完成什么</h2>
      <p>先阅读有来源的材料，再进行比较，最后写下自己的判断。每道题都会保留实体和来源线索，完成后可以导出为 Markdown。</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const taskCode = ref('')
const errorMsg = ref('')

const openTask = () => {
  const code = taskCode.value.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(code)) {
    errorMsg.value = '请输入 3-32 位小写字母、数字或短横线组成的分享 ID。'
    return
  }
  errorMsg.value = ''
  router.push(`/learn/${encodeURIComponent(code)}`)
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
@media (max-width: 600px) { .task-index { padding: 40px 16px 72px; } .task-index__control { display: grid; grid-template-columns: 1fr; } }
</style>
