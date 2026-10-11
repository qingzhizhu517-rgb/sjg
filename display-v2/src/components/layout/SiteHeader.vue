<template>
  <header class="site-header">
    <a class="skip-navigation" href="#main-content">跳到正文</a>
    <div class="site-header__row">
      <router-link :to="atlasLink('/map', route)" class="site-wordmark" aria-label="齐鲁文脉首页"><span class="site-wordmark__seal">齐鲁</span><span><b>齐鲁文脉</b><small>SHANDONG · YELLOW RIVER</small></span></router-link>
      <nav class="site-navigation" aria-label="主导航">
        <router-link :to="atlasLink('/map', route)" :aria-current="route.path === '/map' ? 'page' : undefined">首页</router-link>
        <router-link v-for="section in siteSections" :key="section.id" :to="atlasLink(section.path, route)" :class="{ active: currentSection?.id === section.id }">{{ section.label }}</router-link>
      </nav>
      <div class="site-header__actions">
        <router-link :to="atlasLink('/poems?focus=search', route)" class="site-search" aria-label="检索诗词"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><span>检索诗词</span></router-link>
        <button ref="trigger" class="site-guide-trigger" type="button" aria-label="全站导览" :aria-expanded="open" aria-controls="site-guide" @click="openGuide"><span class="site-guide-trigger__icon" aria-hidden="true">☰</span><span>全站导览</span></button>
      </div>
    </div>
    <div v-if="currentSection" class="site-subnav">
      <span class="site-subnav__label">{{ currentSection.label }}<i aria-hidden="true">／</i></span>
      <nav aria-label="分区导航" @focusin="revealSubnavFocus"><router-link v-for="link in currentSection.links" :key="link.path" :to="atlasLink(link.path, route)" :aria-current="isSectionLinkActive(route.path, link) ? 'page' : undefined">{{ link.label }}</router-link></nav>
    </div>
    <Teleport to="body">
      <div v-if="open" class="site-guide-mask" @click.self="closeGuide">
        <section id="site-guide" ref="dialog" class="site-guide" role="dialog" aria-modal="true" aria-labelledby="site-guide-title" tabindex="-1" @keydown="onDialogKeydown">
          <header class="site-guide__header"><div><p>沿着黄河，走进齐鲁</p><h2 id="site-guide-title">山河之间，自有去处</h2></div><button type="button" class="site-guide__close" aria-label="关闭全站导览" @click="closeGuide">×</button></header>
          <div class="site-guide__groups"><section v-for="(section, i) in siteSections" :key="section.id"><small>0{{ i + 1 }}</small><h3>{{ section.label }}</h3><p>{{ section.note }}</p><nav :aria-label="`${section.label}页面`"><router-link v-for="link in section.links" :key="link.path" :to="atlasLink(link.path, route)" @click="closeGuide">{{ link.label }} <span aria-hidden="true">↗</span></router-link></nav></section></div>
          <section class="site-guide__cities"><h3>沿黄九城</h3><nav aria-label="城市册页"><router-link v-for="city in NINE_CITIES" :key="city" :to="atlasLink(`/regions/${city}`, route)" @click="closeGuide">{{ city }}</router-link></nav></section>
          <footer><router-link :to="atlasLink('/map', route)" @click="closeGuide">返回首页</router-link><a :href="datavUrl" target="_blank" rel="noopener">数据大屏 ↗</a></footer>
        </section>
      </div>
    </Teleport>
  </header>
</template>
<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { siteSections, sectionForPath, isSectionLinkActive } from '../../config/siteNavigation'
import { atlasLink } from '../../config/atlasPreview'
import { NINE_CITIES } from '../../config/nineCities'
const route = useRoute()
const currentSection = computed(() => sectionForPath(route.path))
const datavUrl = import.meta.env.VITE_DATAV_URL || 'http://localhost:5180'
const open = ref(false), trigger = ref(null), dialog = ref(null)
let savedOverflow = ''
async function openGuide() { savedOverflow = document.body.style.overflow; open.value = true; document.body.style.overflow = 'hidden'; await nextTick(); dialog.value?.querySelector('button')?.focus() }
function closeGuide() { if (!open.value) return; open.value = false; document.body.style.overflow = savedOverflow; nextTick(() => trigger.value?.focus()) }
function revealSubnavFocus(event) {
  const nav = event.currentTarget
  const link = event.target.closest('a')
  if (!link || nav.scrollWidth <= nav.clientWidth) return
  const viewport = nav.getBoundingClientRect()
  const item = link.getBoundingClientRect()
  // 只滚动横向导航，保留焦点环边距，不改变正文滚动位置。
  if (item.left < viewport.left + 4) nav.scrollLeft += item.left - viewport.left - 4
  else if (item.right > viewport.right - 4) nav.scrollLeft += item.right - viewport.right + 4
}
function onDialogKeydown(event) {
  if (event.key === 'Escape') { event.preventDefault(); closeGuide(); return }
  if (event.key !== 'Tab') return
  const elements = [...dialog.value.querySelectorAll('a[href],button:not(:disabled)')].filter(el => el.getClientRects().length)
  const first = elements[0], last = elements.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
watch(() => route.path, closeGuide)
onBeforeUnmount(() => { if (open.value) document.body.style.overflow = savedOverflow })
</script>
<style scoped>
.site-header { position: sticky; top: 0; z-index: 100; background: #f5f2ebf5; backdrop-filter: blur(14px); border-bottom: 1px solid #d6ccba80; }
.site-header__row { max-width: 1500px; margin: auto; min-height: 82px; padding: 0 34px; display: flex; align-items: center; gap: 28px; }
.site-wordmark { display: flex; gap: 12px; align-items: center; flex-shrink: 0; }
.site-wordmark__seal { color: #fff4e7; writing-mode: vertical-rl; background: #a95043; border: 1px solid #c98d77; outline: 1px solid #a9504366; outline-offset: 2px; padding: 3px 1px; font: 16px/1.4 var(--font-display); }
.site-wordmark b { font: 500 23px/1.4 var(--font-display); letter-spacing: 4px; }
.site-wordmark small { display: block; font: 8px/2 Georgia, serif; letter-spacing: 1px; color: var(--text-muted); }
.site-navigation { display: flex; justify-content: center; align-self: stretch; flex: 1; gap: 24px; }
.site-navigation a { position: relative; display: flex; align-items: center; font-size: 14px; color: var(--text-secondary); letter-spacing: 1px; }
.site-navigation a.active, .site-navigation a[aria-current] { color: var(--accent); }
.site-navigation a.active::after, .site-navigation a[aria-current]::after { content: ''; position: absolute; bottom: 15px; height: 2px; width: 24px; left: 50%; translate: -50%; background: var(--accent); }
.site-header__actions { display: flex; gap: 16px; align-items: center; }
.site-search { display: flex; min-height: 44px; gap: 8px; align-items: center; font-size: 12px; }
.site-search svg { width: 20px; height: 20px; }
.site-guide-trigger { min-height: 44px; display: flex; align-items: center; gap: 8px; padding: 7px 14px; border: 1px solid var(--border); border-radius: 3px; color: var(--text-secondary); font-size: 12px; }
.site-guide-trigger:hover, .site-search:hover { color: var(--accent); }
.site-guide-trigger__icon { font-family: sans-serif; }
.site-subnav { padding: 0 34px; min-height: 47px; display: flex; gap: 20px; align-items: center; max-width: 1500px; margin: auto; border-top: 1px solid var(--border-light); }
.site-subnav__label { color: var(--text-muted); font-size: 11px; letter-spacing: 1px; white-space: nowrap; }
.site-subnav__label i { padding-left: 20px; font-style: normal; opacity: .5; }
.site-subnav nav { display: flex; flex-wrap: wrap; gap: 6px; }
.site-subnav a { display: flex; min-height: 44px; align-items: center; padding: 7px 14px; font-size: 12px; color: var(--text-secondary); }
.site-subnav a[aria-current] { color: var(--accent); font-weight: 600; }
.skip-navigation { position: fixed; left: 20px; top: -90px; background: var(--card-bg); padding: 12px 24px; z-index: 1300; }
.skip-navigation:focus { top: 10px; }
.site-guide-mask { position: fixed; inset: 0; z-index: 1100; background: #332b2252; display: flex; justify-content: flex-end; }
.site-guide { background: var(--bg-primary); width: min(100%, 980px); height: 100%; overflow-y: auto; padding: 38px 44px; box-shadow: -12px 0 80px #332b2220; color: var(--text-primary); }
.site-guide__header { display: flex; justify-content: space-between; align-items: start; gap: 20px; border-bottom: 1px solid var(--border); padding-bottom: 28px; }
.site-guide__header p { font-size: 12px; color: var(--reading-green); letter-spacing: 2px; }
.site-guide__header h2 { font: 32px/1.7 var(--font-display); margin-top: 8px; }
.site-guide__close { width: 44px; height: 44px; border: 1px solid var(--border); font-size: 27px; }
.site-guide__groups { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 32px 40px; padding: 32px 0; }
.site-guide__groups small { color: #a3957f; font: italic 13px Georgia,serif; }
.site-guide h3 { font: 24px/1.6 var(--font-display); }
.site-guide__groups p { font-size: 12px; color: var(--text-muted); margin: 6px 0 12px; }
.site-guide__groups nav { display: grid; grid-template-columns: 1fr 1fr; }
.site-guide__groups a { padding: 10px 0; min-height: 44px; display: flex; justify-content: space-between; gap: 10px; margin-right: 20px; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.site-guide a:hover { color: var(--accent); }
.site-guide__groups a span { color: #a3957f; }
.site-guide__cities { border-top: 1px solid var(--border); padding-block: 22px; }
.site-guide__cities nav { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.site-guide__cities a { border: 1px solid var(--border-light); min-height: 44px; padding: 8px 17px; font-size: 14px; }
.site-guide footer { display: flex; justify-content: space-between; font-size: 13px; padding-block: 20px; border-top: 1px solid var(--border); }
.site-search, .site-guide-trigger { min-width: 44px; justify-content: center; }
@media(max-width:1150px) { .site-navigation { gap: 18px; } .site-search span { display: none; } .site-header__row { gap: 18px; padding-inline: 25px; } }
@media(max-width:960px) { .site-navigation { display: none; } .site-header__actions { margin-left: auto; } .site-header__row { min-height: 74px; } }
@media(max-width:767px) {
  .site-subnav { min-width: 0; }
  .site-subnav nav { min-width: 0; flex: 1; flex-wrap: nowrap; overflow-x: auto; padding: 4px; scrollbar-width: thin; }
  .site-subnav nav a { flex: 0 0 auto; white-space: nowrap; }
}
@media(max-width:600px) { .site-header__row { padding-inline: 20px; } .site-wordmark b { font-size: 22px; } .site-wordmark small { font-size: 7px; } .site-header__actions { gap: 12px; } .site-guide-trigger { border: 0; padding: 0; } .site-guide-trigger > span:last-child { display: none; } .site-guide-trigger__icon { font-size: 23px; width: 32px; } .site-subnav { padding-inline: 12px; gap: 0; } .site-subnav__label { display: none; } .site-subnav nav { gap: 0; } .site-subnav a { font-size: 12px; padding-inline: 10px; } .site-guide { padding: 24px; } .site-guide__header h2 { font-size: 24px; } .site-guide__groups { grid-template-columns: 1fr; gap: 24px; } }
</style>
