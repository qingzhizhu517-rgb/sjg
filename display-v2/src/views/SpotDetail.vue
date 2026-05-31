<template>
  <div class="spot-detail" :class="themeClass" v-if="spot">
    <!-- BACK BUTTON -->
    <div class="detail-top">
      <router-link to="/map" class="back-link">← 返回地图</router-link>
    </div>

    <!-- UNIFIED SPLIT LAYOUT -->
    <div class="spot-split-layout">
      <!-- LEFT COLUMN: Spot Info & Imagery Scroll/Frame -->
      <aside class="spot-left-col">
        <div class="spot-title-box">
          <h1 class="spot-name-title">{{ spot.name }}</h1>
          <span class="spot-seal" v-if="getSpotData(spot.name).tag && isAnime">{{ getSpotData(spot.name).tag }}</span>
          <span class="hero-region" v-if="spot.region && isReal">{{ spot.region }}</span>
        </div>

        <!-- Showcase image frame (Calligraphy scroll vs Exhibit Showcase) -->
        <div class="image-frame-container">
          <div class="scroll-wrapper" v-if="isAnime">
            <div class="scroll-rod top-rod"></div>
            <div class="scroll-body card">
              <img :src="imageUrl" :alt="spot.name" class="scroll-img" />
            </div>
            <div class="scroll-rod bottom-rod"></div>
          </div>
          <div class="portrait-frame card" v-else>
            <img :src="imageUrl" :alt="spot.name" class="portrait-img" />
            <div class="frame-border-decor"></div>
          </div>
        </div>

        <div class="spot-meta-details card">
          <p class="meta-item">
            <span class="meta-lbl">地理位置</span>
            <span class="meta-val">{{ spot.address || '山东省' + spot.region }}</span>
          </p>
          <p class="meta-item">
            <span class="meta-lbl">所属区域</span>
            <span class="meta-val">{{ spot.region }}市</span>
          </p>
        </div>

        <div class="spot-intro-box card">
          <h3 class="intro-title-bordered">景点名片</h3>
          <p class="intro-desc-indent">{{ spot.description }}</p>
        </div>

        <div class="spot-extra-box card" v-if="getSpotData(spot.name).history">
          <h3 class="intro-title-bordered">历史沿革</h3>
          <p class="intro-desc-indent">{{ getSpotData(spot.name).history }}</p>
        </div>

        <div class="spot-extra-box card" v-if="getSpotData(spot.name).play">
          <h3 class="intro-title-bordered">推荐玩法</h3>
          <p class="intro-desc-indent">{{ getSpotData(spot.name).play }}</p>
        </div>
      </aside>

      <!-- RIGHT COLUMN: Chart, Poems, and Progress Rings -->
      <section class="spot-right-col">
        <!-- ECHARTS sentiment curve -->
        <div class="chart-section card animate-slide-in">
          <h3 class="section-title-ink">
            <span class="title-seal">图</span>
            历代诗词情感波澜曲线
          </h3>
          <p class="chart-subtitle">展现该景观在各个朝代吟咏作品中的情感基调与文人风骨演变</p>
          <div ref="chartRef" class="echarts-container"></div>
        </div>

        <!-- Representative poems -->
        <div class="spot-poems-section card">
          <h3 class="section-title-ink">
            <span class="title-seal">诗</span>
            经典吟咏名篇
          </h3>
          <div class="anime-poems-list">
            <div
              v-for="poem in enrichedPoems"
              :key="poem.id"
              class="anime-poem-card hover-lift"
              @click="$router.push(`/poems/${poem.id}`)"
            >
              <div class="poem-card-header">
                <div class="poet-avatar-wrap" v-if="poem.poet">
                  <img :src="getPoetAvatar(poem.poet)" :alt="poem.poet.name" class="poet-avatar-img" />
                </div>
                <div class="poem-meta-info">
                  <h4 class="poem-card-title">{{ poem.title }}</h4>
                  <span class="poem-card-author" v-if="poem.poet">
                    [{{ poem.poet.dynastyName || '朝代' }}] {{ poem.poet.name }}
                  </span>
                </div>
                <!-- Sentiment tags -->
                <div class="poem-tags-wrap" v-if="poem.sentimentList.length">
                  <span v-for="tag in poem.sentimentList" :key="tag" class="sentiment-seal-tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="poem-card-excerpt">
                <p class="excerpt-text">{{ poem.excerpt }}</p>
              </div>
              <div class="poem-card-footer">
                <span class="read-more-txt">品读全文 & 聆听吟诵 →</span>
              </div>
            </div>
            <div v-if="!enrichedPoems.length" class="empty-poems">
              暂无相关诗词记载，待学者考证录入。
            </div>
          </div>
        </div>

        <!-- Sentiment distribution overview -->
        <div class="sentiment-overview-section card">
          <h3 class="section-title-ink">
            <span class="title-seal">析</span>
            情感维度分布
          </h3>
          <div class="sentiment-rings-grid">
            <div v-for="ring in sentimentRings" :key="ring.name" class="ring-item">
              <div class="ring-circle" :style="getRingStyle(ring.percent, ring.color)">
                <div class="ring-inner">
                  <span class="ring-value">{{ ring.percent }}%</span>
                </div>
              </div>
              <span class="ring-name">{{ ring.name }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockSpots } from '../config/mockDetailData'
import * as echarts from 'echarts'
import api from '../api'

const route = useRoute()
const { themeClass, isReal, isAnime } = useTheme()
const { getImageUrl } = useImage()
const spot = ref(null)
const poems = ref([])
const poetsMap = ref({})
const chartRef = ref(null)
let chartInstance = null

const imageUrl = computed(() => {
  if (!spot.value) return null
  const url = isReal.value ? spot.value.imageUrl : (spot.value.imageAnimeUrl || spot.value.imageUrl)
  return getImageUrl(url, isAnime.value)
})

const getSpotData = (name) => {
  return mockSpots[name] || {
    verticalText: '黄河九曲，齐鲁揽胜；文脉千载，源远流长。',
    tag: '经典景区',
    history: '',
    play: ''
  }
}

const getDynastyName = (dynastyId) => {
  const mapping = {
    1: '先秦',
    2: '秦汉',
    3: '魏晋南北朝',
    4: '唐代',
    5: '宋代',
    6: '元代',
    7: '明代',
    8: '清代'
  }
  return mapping[dynastyId] || '古代'
}

const getPoetAvatar = (poetObj) => {
  if (!poetObj) return ''
  const url = isAnime.value ? poetObj.avatarAnimeUrl || poetObj.avatarUrl : poetObj.avatarUrl
  return getImageUrl(url, isAnime.value)
}

const enrichedPoems = computed(() => {
  return poems.value.map(poem => {
    const poetObj = poetsMap.value[poem.poetId] || null
    let poetWithDynasty = null
    if (poetObj) {
      poetWithDynasty = {
        ...poetObj,
        dynastyName: getDynastyName(poetObj.dynastyId)
      }
    }
    
    let excerpt = ''
    if (poem.content) {
      const lines = poem.content.split('\n').filter(l => l.trim())
      excerpt = lines.slice(0, 2).join(' / ')
      if (lines.length > 2) excerpt += ' ...'
    }

    let sentimentList = []
    if (poem.sentimentTags) {
      try {
        sentimentList = JSON.parse(poem.sentimentTags)
      } catch (e) {
        sentimentList = poem.sentimentTags.split(',').map(s => s.trim())
      }
    }

    return {
      ...poem,
      poet: poetWithDynasty,
      excerpt,
      sentimentList
    }
  })
})

const sentimentRings = computed(() => {
  if (!spot.value) return []
  const name = spot.value.name
  if (name === '泰山' || name === '泰山风景区') {
    return [
      { name: '豪放', percent: 45, color: '#8e352e' },
      { name: '悠远', percent: 20, color: '#c27b38' },
      { name: '婉约', percent: 10, color: '#5b8c85' },
      { name: '幽思', percent: 15, color: '#7a5a8f' },
      { name: '淡泊', percent: 10, color: '#688c5b' }
    ]
  } else if (name === '趵突泉') {
    return [
      { name: '豪放', percent: 20, color: '#8e352e' },
      { name: '悠远', percent: 35, color: '#c27b38' },
      { name: '婉约', percent: 15, color: '#5b8c85' },
      { name: '幽思', percent: 10, color: '#7a5a8f' },
      { name: '淡泊', percent: 20, color: '#688c5b' }
    ]
  } else if (name === '大明湖') {
    return [
      { name: '豪放', percent: 15, color: '#8e352e' },
      { name: '悠远', percent: 25, color: '#c27b38' },
      { name: '婉约', percent: 30, color: '#5b8c85' },
      { name: '幽思', percent: 18, color: '#7a5a8f' },
      { name: '淡泊', percent: 12, color: '#688c5b' }
    ]
  } else {
    return [
      { name: '豪放', percent: 25, color: '#8e352e' },
      { name: '悠远', percent: 25, color: '#c27b38' },
      { name: '婉约', percent: 15, color: '#5b8c85' },
      { name: '幽思', percent: 20, color: '#7a5a8f' },
      { name: '淡泊', percent: 15, color: '#688c5b' }
    ]
  }
})

const getRingStyle = (percent, color) => {
  const degrees = (percent / 100) * 360
  return {
    background: `conic-gradient(${color} 0deg, ${color} ${degrees}deg, var(--border-light) ${degrees}deg, var(--border-light) 360deg)`
  }
}

const getChartData = (name) => {
  if (name === '泰山' || name === '泰山风景区') {
    return {
      values: [85, 75, 60, 65, 70, 80],
      markPoint: [
        { name: '唐代杜甫《望岳》', value: 85, xAxis: 0, yAxis: 85, label: '盛唐气象 壮怀豪情' },
        { name: '清代乾隆题刻', value: 70, xAxis: 4, yAxis: 70, label: '帝王封禅 雄浑庄重' }
      ]
    }
  } else if (name === '趵突泉') {
    return {
      values: [50, 70, 85, 55, 65, 75],
      markPoint: [
        { name: '元代赵孟頫《趵突泉》', value: 85, xAxis: 2, yAxis: 85, label: '白玉千壶 波澜声震' },
        { name: '宋代曾巩品茗', value: 70, xAxis: 1, yAxis: 70, label: '清洌涤尘 濯缨洗耳' }
      ]
    }
  } else if (name === '大明湖') {
    return {
      values: [70, 55, 75, 60, 65, 70],
      markPoint: [
        { name: '唐代杜甫历下亭宴', value: 70, xAxis: 0, yAxis: 70, label: '济南名士 宴乐历下' },
        { name: '宋代李清照溪亭', value: 55, xAxis: 1, yAxis: 55, label: '常记溪亭 藕花争渡' }
      ]
    }
  } else {
    return {
      values: [60, 65, 70, 55, 60, 65],
      markPoint: [
        { name: '历代文人吟咏', value: 70, xAxis: 2, yAxis: 70, label: '齐鲁风雅 诗意延绵' }
      ]
    }
  }
}

const initChart = () => {
  if (!chartRef.value || !spot.value) return
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  chartInstance = echarts.init(chartRef.value)
  const chartData = getChartData(spot.value.name)
  
  // Theme color adaptation
  const chartTheme = isAnime.value ? {
    lineColor: '#8e352e', // cinnabar red
    itemColor: '#c27b38',
    areaStart: 'rgba(142, 53, 46, 0.15)',
    areaEnd: 'rgba(142, 53, 46, 0.01)',
    fontFamily: 'var(--font-heading)'
  } : {
    lineColor: '#b8860b', // digital gold
    itemColor: '#8b6508',
    areaStart: 'rgba(184, 134, 11, 0.15)',
    areaEnd: 'rgba(184, 134, 11, 0.01)',
    fontFamily: 'var(--font-body)'
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border)',
      textStyle: {
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: 12
      },
      formatter: function(params) {
        const era = params.name
        const val = params.value
        let sentiment = '清雅'
        if (val <= 20) sentiment = '淡泊'
        else if (val <= 40) sentiment = '幽思'
        else if (val <= 60) sentiment = '婉约'
        else if (val <= 80) sentiment = '悠远'
        else sentiment = '豪放'
        return `<strong>${era} 吟咏情感</strong><br/>情感维度：${sentiment} (${val}%)`
      }
    },
    grid: {
      top: '18%',
      left: '12%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['唐代', '宋代', '元代', '明代', '清代', '近现代'],
      axisLabel: {
        color: 'var(--text-secondary)',
        fontFamily: chartTheme.fontFamily,
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: 'var(--border)'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 10,
      max: 95,
      splitNumber: 4,
      axisLabel: {
        color: 'var(--text-secondary)',
        fontFamily: chartTheme.fontFamily,
        fontSize: 11,
        formatter: function(value) {
          if (value <= 20) return '淡泊'
          if (value <= 40) return '幽思'
          if (value <= 60) return '婉约'
          if (value <= 80) return '悠远'
          return '豪放'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: 'var(--border-light)'
        }
      }
    },
    series: [{
      data: chartData.values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: chartTheme.itemColor
      },
      lineStyle: {
        color: chartTheme.lineColor,
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: chartTheme.areaStart },
          { offset: 1, color: chartTheme.areaEnd }
        ])
      },
      markPoint: {
        symbol: 'pin',
        symbolSize: 10,
        itemStyle: {
          color: chartTheme.itemColor
        },
        data: chartData.markPoint.map(pt => ({
          coord: [pt.xAxis, pt.yAxis],
          value: pt.label,
          label: {
            show: true,
            position: 'top',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border)',
            borderWidth: 1,
            borderRadius: 3,
            padding: [4, 8],
            fontSize: 10,
            fontFamily: chartTheme.fontFamily,
            formatter: pt.label
          }
        }))
      }
    }]
  }
  
  chartInstance.setOption(option)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch([isAnime, spot], () => {
  if (spot.value) {
    nextTick(() => {
      setTimeout(() => {
        initChart()
      }, 150)
    })
  }
})

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  
  // Load main details
  const data = await api.get(`/spots/${route.params.id}`)
  spot.value = data.spot || data
  poems.value = data.poems || []
  
  // Load poets lookup dictionary
  try {
    const poetsData = await api.get('/poets', { params: { size: 100 } })
    const map = {}
    poetsData.records.forEach(p => {
      map[p.id] = p
    })
    poetsMap.value = map
  } catch (e) {
    console.error('Error loading poets map:', e)
  }
  
  // Init chart
  nextTick(() => {
    setTimeout(() => {
      initChart()
    }, 150)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.spot-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 80px;
}

.detail-top {
  padding: 24px 0 16px;
  text-align: left;
}

.back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  letter-spacing: 1px;
}

.back-link:hover {
  color: var(--accent);
}

/* UNIFIED THEME-ADAPTIVE IMAGE FRAMES & TITLES */
.image-frame-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Exhibit Showcase frame for Real Theme */
.portrait-frame {
  position: relative;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
}

.theme-real .portrait-frame {
  border: 6px solid #2b1d12; /* Rich mahogany frame */
  outline: 1px solid #d4a843;
  outline-offset: -4px;
}

.portrait-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  border-radius: 4px;
}

/* Spot Name Title adaptation */
.spot-name-title {
  margin: 0;
  transition: all 0.3s ease;
}

.theme-inkwash .spot-name-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  line-height: 1.15;
}

.theme-real .spot-name-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  text-align: left;
}

.hero-region {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 8px;
  border-radius: 2px;
  margin-top: 6px;
  letter-spacing: 1.5px;
}

/* ANIME/INK WASH MODE STYLING */
.spot-split-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 48px;
  align-items: start;
}

/* Left Column */
.spot-left-col {
  display: flex;
  flex-direction: column;
  gap: 28px;
  text-align: left;
}

.spot-title-box {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 16px;
}

.spot-name-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  line-height: 1.15;
}

.spot-seal {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 6px 4px;
  border-radius: 2px;
  letter-spacing: 2px;
  background: rgba(142, 53, 46, 0.05);
  box-shadow: 1px 1px 3px rgba(142, 53, 46, 0.1);
  margin-top: 6px;
}

/* Hanging picture scroll wrapper */
.scroll-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0;
}

.scroll-rod {
  width: 96%;
  height: 10px;
  background: linear-gradient(to right, #4b3621, #8b5a2b, #4b3621);
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.scroll-body {
  width: 88%;
  border: 6px solid #fcf9f2;
  border-top: none;
  border-bottom: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  background: #fcf9f2;
  padding: 6px;
}

.scroll-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 2px;
}

.spot-meta-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0,0,0,0.01);
  border-left: 2px solid var(--border);
  padding: 8px 0 8px 16px;
}

.meta-item {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.meta-lbl {
  font-weight: 700;
  color: var(--text-muted);
  margin-right: 8px;
}

.meta-val {
  color: var(--text-primary);
  font-weight: 600;
}

.spot-intro-box, .spot-extra-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intro-title-bordered {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  border-left: 3px solid var(--accent);
  padding-left: 10px;
  margin: 0;
  letter-spacing: 1px;
}

.intro-desc-indent {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-indent: 2em;
  text-align: justify;
  margin: 0;
}

/* Right Column */
.spot-right-col {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.title-seal {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-size: 12px;
  border-radius: 2px;
  margin-right: 10px;
  vertical-align: middle;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.15);
}

.section-title-ink {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 10px;
  margin: 0 0 16px 0;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  text-align: left;
}

/* ECharts card */
.chart-section {
  padding: 24px;
}

.chart-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: -10px 0 20px 32px;
  text-align: left;
  letter-spacing: 0.5px;
}

.echarts-container {
  width: 100%;
  height: 280px;
}

/* Representative Poems */
.spot-poems-section {
  padding: 24px;
}

.anime-poems-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.anime-poem-card {
  background: var(--card-bg);
  border: 1px dashed var(--border);
  border-radius: 4px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: left;
  transition: all 0.3s;
}

.anime-poem-card:hover {
  border-style: solid;
  border-color: var(--accent);
}

.poem-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 10px;
}

.poet-avatar-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--accent);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background: #fff;
}

.poet-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poem-meta-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.poem-card-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.poem-card-author {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  font-weight: 600;
}

.poem-tags-wrap {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.sentiment-seal-tag {
  font-size: 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 700;
  background: rgba(142, 53, 46, 0.02);
}

.poem-card-excerpt {
  flex: 1;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  font-style: italic;
  font-family: var(--font-heading);
  margin: 4px 0 12px 0;
  text-align: justify;
}

.poem-card-footer {
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.empty-poems {
  grid-column: span 2;
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}

/* Sentiment distribution rings */
.sentiment-overview-section {
  padding: 24px;
}

.sentiment-rings-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 8px;
}

.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-circle {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  transition: transform 0.3s;
}

.ring-circle:hover {
  transform: scale(1.06);
}

.ring-inner {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.ring-name {
  margin-top: 10px;
  font-size: 12px;
  font-family: var(--font-heading);
  color: var(--text-secondary);
  font-weight: bold;
  letter-spacing: 0.5px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease both;
}

.animate-slide-in {
  animation: slideIn 0.5s ease both;
}

/* Responsive design */
@media (max-width: 1024px) {
  .spot-split-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .scroll-img {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .anime-poems-list {
    grid-template-columns: 1fr;
  }
  .spot-detail {
    padding: 0 16px 60px;
  }
  .hero-image-wrap {
    height: 240px;
  }
  .hero-title {
    font-size: 28px;
    letter-spacing: 3px;
  }
  .scroll-body {
    width: 95%;
  }
}
</style>

