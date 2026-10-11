<template>
  <article class="reading-material" :aria-labelledby="`material-${label}-title`">
    <header class="material-heading">
      <span class="material-seal" aria-hidden="true">{{ label }}</span>
      <div><p class="material-kicker">{{ label === 'A' ? '第一篇' : '第二篇' }} · 原文</p><h2 :id="`material-${label}-title`">{{ material?.title || '等待选材' }}</h2><p v-if="material" class="material-meta">{{ [material.author, material.dynasty, material.form].filter(Boolean).join(' · ') || '作者资料未登记' }}</p></div>
      <button type="button" class="change-material" @click="$emit('choose', label)">换一篇 <span aria-hidden="true">↗</span></button>
    </header>
    <div v-if="loading" class="material-empty" role="status">正在打开原文…</div>
    <div v-else-if="error" class="material-empty material-error" role="alert"><p>{{ error }}</p><button type="button" @click="$emit('retry')">重新读取原文</button></div>
    <ol v-else-if="material" class="material-lines" aria-label="原文行号，点击诗句加入或移除证据">
      <li v-for="line in material.lines" :key="line.number">
        <button :id="`reading-${label}-${line.number}`" type="button" :disabled="!canSelect" :aria-pressed="isSelected(line.number)" :class="{ selected: isSelected(line.number), highlighted: highlight?.label === label && highlight?.number === line.number }" @click="$emit('select', { label, number: line.number })">
          <span class="line-number" aria-hidden="true">{{ String(line.number).padStart(2, '0') }}</span><span class="line-text">{{ line.text }}</span><span class="line-check" aria-hidden="true">{{ isSelected(line.number) ? '✓' : '+' }}</span><span class="sr-only">{{ isSelected(line.number) ? '移除' : '加入' }}第{{ line.number }}行证据</span>
        </button>
      </li>
    </ol>
    <div v-else class="material-empty">从选材栏选择一篇已发布作品，开始阅读。</div>
    <footer v-if="material" class="material-foot"><span>{{ canSelect ? '点选原句，留下你的依据' : '选好两篇后，可以标记原句证据' }}</span><router-link :to="detailLink">完整作品 ↗</router-link></footer>
  </article>
</template>
<script setup>
const props = defineProps({ label: String, material: Object, loading: Boolean, error: String, canSelect: { type: Boolean, default: true }, selected: { type: Array, default: () => [] }, highlight: Object, detailLink: [String, Object] })
defineEmits(['choose', 'select', 'retry'])
const isSelected = number => props.selected.some(item => item.label === props.label && item.number === number)
</script>
<style scoped>
.reading-material { min-width:0; padding:20px 20px 12px; background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-sm); }
.material-heading { display:flex; gap:10px; align-items:flex-start; padding-bottom:15px; border-bottom:1px solid var(--border-light); }
.material-heading>div { min-width:0; flex:1; } .material-seal { display:grid; place-items:center; width:29px; height:32px; flex:0 0 29px; border:1px solid var(--accent); color:var(--accent); font-family:var(--font-display); transform:rotate(-2deg); }
.material-kicker { color:var(--text-muted); font-size:12px; letter-spacing:2px; } h2 { font-size:23px; font-weight:400; font-family:var(--font-display); line-height:1.5; margin:6px 0; overflow-wrap:anywhere; } .material-meta { font-size:13px; color:var(--text-secondary); }
.change-material { min-height:44px; flex:0 0 auto; font-size:13px; color:var(--accent); padding:0 4px; } .material-lines { list-style:none; padding:16px 0; min-height:185px; } .material-lines button { display:flex; align-items:baseline; gap:9px; width:100%; text-align:left; min-height:44px; padding:6px 5px; border-radius:2px; color:var(--text-primary); } .line-number { color:var(--text-muted); font-size:11px; flex:0 0 18px; font-variant-numeric:tabular-nums; } .line-text { font-family:var(--font-display); font-size:18px; line-height:1.8; flex:1; overflow-wrap:anywhere; } .line-check { color:var(--accent); font-size:15px; opacity:0; } .material-lines button:hover { background:var(--bg-secondary); } .material-lines button:hover .line-check,.material-lines button.selected .line-check { opacity:1; } .material-lines button.selected { background:var(--accent-soft); } .material-lines button.highlighted { outline:2px solid var(--accent); outline-offset:2px; }
.material-foot { border-top:1px solid var(--border-light); padding-top:9px; font-size:12px; color:var(--text-muted); display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; } .material-foot a { color:var(--accent); min-height:44px; display:inline-flex; align-items:center; } .material-foot>span { display:flex; align-items:center; } .material-empty { min-height:200px; padding:40px 0; color:var(--text-muted); font-size:14px; } .material-error { color:var(--accent); } .material-error button { min-height:44px; text-decoration:underline; color:var(--accent); }
.sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
@media(min-width:1100px) { .reading-material { padding:18px 14px 10px; } .material-heading { gap:8px; flex-wrap:wrap; } .material-heading>div { flex:1 1 185px; } .material-seal { width:25px; height:29px; flex-basis:25px; } .change-material { margin-left:33px; min-height:44px; } h2 { font-size:22px; } .material-lines button { gap:7px; padding:5px 2px; } .line-text { font-size:17px; } .line-number { flex-basis:15px; } .material-foot { gap:0; } }
@media(max-width:640px) { .reading-material { padding:20px 15px 12px; } .material-heading { gap:10px; } h2 { font-size:23px; } .material-lines { padding:16px 0; } .material-lines button { gap:8px; padding:8px 4px; } .line-text { font-size:18px; } .line-check { opacity:1; } }
</style>
