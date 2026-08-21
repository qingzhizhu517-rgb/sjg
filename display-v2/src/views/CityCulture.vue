<template>
  <div class="city-culture">
    <!-- 页头 -->
    <header class="cc-hero">
      <div class="cc-hero__main">
        <span class="cc-hero__eyebrow">九城文脉 · 第 {{ cityIndex + 1 }} 站</span>
        <h1 class="cc-hero__title">{{ city }}</h1>
        <p class="cc-hero__sub">{{ cityDescriptor }}</p>
        <nav class="cc-hero__nav" aria-label="上下游城市">
          <router-link v-if="prevCity" :to="`/cities/${prevCity}`" class="cc-hero__nav-link">← {{ prevCity }}</router-link>
          <span class="cc-hero__nav-sep">黄河东流</span>
          <router-link v-if="nextCity" :to="`/cities/${nextCity}`" class="cc-hero__nav-link">{{ nextCity }} →</router-link>
        </nav>
      </div>
      <div class="cc-hero__seal" aria-hidden="true">{{ city[0] }}</div>
    </header>

    <!-- 骨架 -->
    <div v-if="!loaded" class="cc-skeleton" aria-busy="true" aria-label="加载中">
      <SkeletonBlock v-for="i in 6" :key="i" height="200px" />
    </div>

    <!-- 错误态 -->
    <ErrorState v-else-if="errorMsg" :message="errorMsg" @retry="load" />

    <!-- 五格册页 -->
    <section v-else class="cc-bento">
      <article class="cc-tile cc-tile--big">
        <header class="cc-tile__head">
          <span class="cc-tile__seal">节</span>
          <h2 class="cc-tile__title">民俗节庆</h2>
          <router-link class="cc-tile__more" :to="`/festivals?region=${encodeURIComponent(city)}`">更多 →</router-link>
        </header>
        <ul v-if="groups.festival.length" class="cc-tile__list">
          <li v-for="it in groups.festival.slice(0, 4)" :key="it.id" class="cc-tile__item">
            <router-link :to="`/festivals/${it.id}`" class="cc-tile__item-link">
              <span class="cc-tile__item-title">{{ it.title }}</span>
              <span class="cc-tile__item-desc">{{ it.summary }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="cc-tile__empty">暂无收录</p>
      </article>

      <article class="cc-tile">
        <header class="cc-tile__head">
          <span class="cc-tile__seal">诗</span>
          <h2 class="cc-tile__title">古诗词</h2>
          <router-link class="cc-tile__more" :to="`/poems`">更多 →</router-link>
        </header>
        <ul v-if="groups.poems.length" class="cc-tile__list">
          <li v-for="pm in groups.poems.slice(0, 4)" :key="pm.id" class="cc-tile__item">
            <router-link :to="`/poems/${pm.id}`" class="cc-tile__item-link">
              <span class="cc-tile__item-title">{{ pm.title }}</span>
              <span class="cc-tile__item-desc">{{ poetNameOf(pm.poetId) }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="cc-tile__empty">暂无收录</p>
      </article>

      <article class="cc-tile">
        <header class="cc-tile__head">
          <span class="cc-tile__seal">味</span>
          <h2 class="cc-tile__title">饮食戏曲</h2>
          <router-link class="cc-tile__more" :to="`/food-opera?region=${encodeURIComponent(city)}`">更多 →</router-link>
        </header>
        <ul v-if="groups.food_opera.length" class="cc-tile__list">
          <li v-for="it in groups.food_opera.slice(0, 4)" :key="it.id" class="cc-tile__item">
            <router-link :to="`/food-opera/${it.id}`" class="cc-tile__item-link">
              <span class="cc-tile__item-title">{{ it.title }}</span>
              <span class="cc-tile__item-desc">{{ it.summary }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="cc-tile__empty">暂无收录</p>
      </article>

      <article class="cc-tile">
        <header class="cc-tile__head">
          <span class="cc-tile__seal">艺</span>
          <h2 class="cc-tile__title">非遗工艺</h2>
          <router-link class="cc-tile__more" :to="`/crafts`">更多 →</router-link>
        </header>
        <ul v-if="groups.craft.length" class="cc-tile__list">
          <li v-for="it in groups.craft.slice(0, 3)" :key="it.id" class="cc-tile__item">
            <router-link :to="`/crafts/${it.id}`" class="cc-tile__item-link">
              <span class="cc-tile__item-title">{{ it.title }}</span>
              <span class="cc-tile__item-desc">{{ it.summary }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="cc-tile__empty">暂无收录</p>
      </article>

      <article class="cc-tile">
        <header class="cc-tile__head">
          <span class="cc-tile__seal">文</span>
          <h2 class="cc-tile__title">民间文学</h2>
          <router-link class="cc-tile__more" :to="`/literature?region=${encodeURIComponent(city)}`">更多 →</router-link>
        </header>
        <ul v-if="groups.literature.length" class="cc-tile__list">
          <li v-for="it in groups.literature.slice(0, 3)" :key="it.id" class="cc-tile__item">
            <router-link :to="`/literature/${it.id}`" class="cc-tile__item-link">
              <span class="cc-tile__item-title">{{ it.title }}</span>
              <span class="cc-tile__item-desc">{{ it.summary }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="cc-tile__empty">暂无收录</p>
      </article>
    </section>

    <!-- 景点速览 -->
    <section v-if="loaded && spots.length" class="cc-spots">
      <SectionHeading eyebrow="山水形胜" :title="`${city} · 文学景观`" subtitle="点击进入景点详情" />
      <div class="cc-spots__rail">
        <router-link v-for="s in spots.slice(0, 12)" :key="s.id" :to="`/spots/${s.id}`" class="cc-spots__chip">
          {{ s.name }}
        </router-link>
        <router-link :to="`/regions/${city}`" class="cc-spots__chip cc-spots__chip--all">全部景点 →</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { NINE_CITIES } from '../config/nineCities'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'

const route = useRoute()
const CITY_DESCRIPTORS = {
  菏泽: '黄河入鲁首站，牡丹之都，曹州古韵。',
  济宁: '运河之都，孔孟故里，太白遗风。',
  泰安: '泰山安则四海安，五岳独尊之地。',
  聊城: '江北水城，运河古都，鲁西重镇。',
  济南: '泉城名郡，四面荷花三面柳。',
  德州: '九达天衢，神京门户，运河名城。',
  淄博: '齐国故都，聊斋故里，陶琉之乡。',
  滨州: '渤海之滨，孙子故里，黄河尾闾。',
  东营: '黄河入海，湿地之城，胜利油城。',
}

const city = computed(() => String(route.params.region || ''))
const cityIndex = computed(() => Math.max(0, NINE_CITIES.indexOf(city.value)))
const cityDescriptor = computed(() => CITY_DESCRIPTORS[city.value] || '黄河岸边的文化名城。')
const prevCity = computed(() => (cityIndex.value > 0 ? NINE_CITIES[cityIndex.value - 1] : ''))
const nextCity = computed(() => (cityIndex.value < NINE_CITIES.length - 1 ? NINE_CITIES[cityIndex.value + 1] : ''))

const loaded = ref(false)
const errorMsg = ref('')
const groups = ref({ festival: [], craft: [], literature: [], food_opera: [], poems: [] })
const spots = ref([])
const poets = ref([])

const poetNameOf = (poetId) => poets.value.find((p) => p.id === poetId)?.name || ''

async function load() {
  loaded.value = false
  errorMsg.value = ''
  try {
    const region = city.value
    const [festival, craft, literature, foodOpera, poemsRes, poetsRes, spotsRes] = await Promise.allSettled([
      api.get('/cultural', { params: { category: 'festival', region, size: 10 } }),
      api.get('/cultural', { params: { category: 'craft', region, size: 10 } }),
      api.get('/cultural', { params: { category: 'literature', region, size: 10 } }),
      api.get('/cultural', { params: { category: 'food_opera', region, size: 10 } }),
      api.get('/poems', { params: { region, size: 10 } }),
      api.get('/poets', { params: { region, size: 30 } }),
      api.get('/spots', { params: { region, size: 30 } }),
    ])
    const rec = (r) => (r.status === 'fulfilled' ? r.value.records || [] : [])
    groups.value = {
      festival: rec(festival),
      craft: rec(craft),
      literature: rec(literature),
      food_opera: rec(foodOpera),
      poems: rec(poemsRes),
    }
    poets.value = rec(poetsRes)
    spots.value = rec(spotsRes)
  } catch (err) {
    console.error('加载城市文化页失败:', err)
    errorMsg.value = err.message || '加载失败'
  } finally {
    loaded.value = true
  }
}

watch(city, load)
onMounted(load)
</script>

<style scoped>
.city-culture {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px 120px;
}

/* 页头: 衬线大标题 + 朱红印章(日式留白) */
.cc-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 48px 0 72px;
  border-bottom: 1px solid var(--line, var(--border));
}
.cc-hero__eyebrow {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--accent);
}
.cc-hero__title {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: 500;
  letter-spacing: 0.08em;
  margin: 12px 0;
  color: var(--text-primary);
}
.cc-hero__sub {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.9;
  max-width: 420px;
}
.cc-hero__nav {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.cc-hero__nav-link { color: var(--text-secondary); text-decoration: none; letter-spacing: 1px; }
.cc-hero__nav-link:hover { color: var(--accent); }
.cc-hero__nav-sep { color: var(--text-muted); letter-spacing: 2px; }
.cc-hero__seal {
  width: 92px;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 600;
  border-radius: 4px;
  transform: rotate(-3deg);
  flex-shrink: 0;
}

.cc-skeleton {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 40px;
}

/* 五格册页: bento 网格(4列×3行, 严格对齐), inkwash 下以细线+留白代替 tile 底色 */
.cc-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(150px, auto);
  gap: 16px;
  margin-top: 48px;
}
.cc-tile {
  grid-column: span 2;
  border: 1px solid var(--line, var(--border));
  border-radius: 2px;
  background: transparent;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.cc-tile--big {
  grid-column: span 4;
  grid-row: span 1;
}
.cc-tile__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.cc-tile__seal {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-weight: 600;
  border-radius: 2px;
  flex-shrink: 0;
}
.cc-tile__title {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--text-primary);
  margin: 0;
}
.cc-tile__more {
  margin-left: auto;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-decoration: none;
}
.cc-tile__more:hover { color: var(--accent); }
.cc-tile__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cc-tile--big .cc-tile__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}
.cc-tile__item-link {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.cc-tile__item-link:hover {
  border-left-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 4%, transparent);
}
.cc-tile__item-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-primary);
}
.cc-tile__item-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cc-tile__empty { color: var(--text-muted); font-size: 13px; letter-spacing: 1px; }

/* 景点速览 */
.cc-spots { margin-top: 72px; }
.cc-spots__rail {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.cc-spots__chip {
  padding: 8px 18px;
  border: 1px solid var(--line, var(--border));
  border-radius: 999px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}
.cc-spots__chip:hover { border-color: var(--accent); color: var(--accent); }
.cc-spots__chip--all { border-style: dashed; }

@media (max-width: 768px) {
  .cc-hero { flex-direction: column; align-items: flex-start; }
  .cc-hero__title { font-size: 40px; }
  .cc-bento { grid-template-columns: 1fr; }
  .cc-tile, .cc-tile--big { grid-column: span 1; }
  .cc-tile--big .cc-tile__list { grid-template-columns: 1fr; }
}
</style>