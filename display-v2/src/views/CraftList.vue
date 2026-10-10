<!-- 路由页 /crafts：非遗工艺列表，顶部置东昌葫芦专题工坊入口 -->
<template>
  <CultureCollection category="craft">
    <template #lead>
      <router-link :to="atlasLink('/crafts/workshop', route)" class="craft-feature">
        <div class="craft-feature__art"><HuluIllustration :step="4" :animated="false" /></div>
        <div class="craft-feature__body">
          <p class="folio-eyebrow">专题工坊 · 聊城 · 国家级非遗</p>
          <h2>东昌葫芦雕刻 · 五道工序</h2>
          <p>选料、去皮晾晒、画稿、雕刻、上色——一步步看一只生葫芦如何变成刻绘精美的器物。</p>
          <span class="craft-feature__go">进入工坊 <i aria-hidden="true">↗</i></span>
        </div>
      </router-link>
    </template>
  </CultureCollection>
</template>

<script setup>
import { useRoute } from 'vue-router'
import CultureCollection from '../components/CultureCollection.vue'
import HuluIllustration from '../components/craft/HuluIllustration.vue'
import { atlasLink } from '../config/atlasPreview'
const route = useRoute()
</script>

<style scoped>
.craft-feature {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  gap: 32px;
  margin-bottom: 28px;
  padding: 20px 32px;
  border: 1px solid var(--border-light);
  border-left: 3px solid var(--accent);
  background: url('/media/inkwash/atlas/mountain-vignette.webp') right bottom / 220px auto no-repeat, var(--bg-secondary);
  transition: border-color .2s, transform .2s;
}
.craft-feature:hover { border-color: #a99c85; border-left-color: var(--accent); transform: translateY(-2px); }
.craft-feature__art { height: 190px; }
.craft-feature h2 { font: 26px/1.5 var(--font-display); letter-spacing: 3px; margin: 6px 0 8px; color: var(--text-primary); }
.craft-feature p:not(.folio-eyebrow) { margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.9; max-width: 560px; }
.craft-feature__go { display: inline-block; margin-top: 14px; color: var(--accent); font-size: 14px; letter-spacing: 2px; }
.craft-feature__go i { font-style: normal; }
@media (max-width: 600px) {
  .craft-feature { grid-template-columns: 1fr; padding: 18px; gap: 8px; }
  .craft-feature__art { height: 150px; }
}
</style>
