<template>
  <div class="sandbox-tools" aria-label="沙盘操作">
    <div class="sandbox-tools__modes" role="group" aria-label="操作模式">
      <button
        v-for="item in modes"
        :key="item.value"
        type="button"
        :aria-pressed="engine.mode === item.value"
        @click="engine.setMode(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
    <button
      type="button"
      :disabled="!engine.ready"
      :aria-pressed="engine.tour.status !== 'idle'"
      @click="engine.tour.status === 'idle' ? engine.toggleTour() : engine.stopTour()"
    >
      {{ engine.tour.status === 'idle' ? '九城巡游' : '退出巡游' }}
    </button>
    <div class="sandbox-tools__views" role="group" aria-label="相机视角">
      <button type="button" aria-label="放大沙盘" @click="engine.zoom(-0.2)">＋</button>
      <button type="button" aria-label="缩小沙盘" @click="engine.zoom(0.2)">−</button>
      <button type="button" @click="engine.setView('top')">俯视</button>
      <button type="button" @click="engine.setView('river')">沿河</button>
      <button type="button" @click="engine.setView('jitai')">济泰细览</button>
      <button type="button" @click="engine.setView('overview')">复位</button>
      <button type="button" :aria-pressed="labels" @click="$emit('toggle-labels')">
        {{ labels ? '隐藏地名' : '显示地名' }}
      </button>
    </div>
    <details class="sandbox-tools__settings">
      <summary>光景与画质</summary>
      <div class="sandbox-tools__settings-grid">
        <label
          >场景天气<select :value="engine.weather" @change="engine.setWeather($event.target.value)">
            <option value="clear">晴日</option>
            <option value="fog">薄雾</option>
            <option value="rain">细雨</option>
          </select></label
        >
        <label
          >渲染画质<select :value="engine.quality" @change="engine.setQuality($event.target.value)">
            <option value="low">省电</option>
            <option value="medium">均衡</option>
            <option value="high">精细</option>
          </select></label
        >
        <label class="sandbox-tools__check"
          ><input
            type="checkbox"
            :checked="engine.motion"
            @change="engine.setMotion($event.target.checked)"
          />动态效果</label
        >
        <label v-if="coarse" class="sandbox-tools__check"
          ><input
            type="checkbox"
            :checked="engine.touchInteraction"
            @change="engine.setTouchInteraction($event.target.checked)"
          />操作沙盘（单指旋转）</label
        >
        <small>天气为场景演示，可随时关闭动态效果。</small>
      </div>
    </details>
  </div>
</template>
<script setup>
defineProps({ engine: { type: Object, required: true }, labels: Boolean, coarse: Boolean })
defineEmits(['toggle-labels'])
const modes = [
  { value: 'explore', label: '山河探索' },
  { value: 'guided', label: '随页导览' },
  { value: 'object', label: '布置场景' },
  { value: 'terrain', label: '雕琢地形' },
]
</script>
<style scoped>
.sandbox-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
}
.sandbox-tools__modes,
.sandbox-tools__views {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
button,
summary,
select {
  font: inherit;
  font-size: 12px;
}
button {
  min-height: 36px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-secondary);
  cursor: pointer;
}
button:hover,
button[aria-pressed='true'] {
  color: var(--accent-dark);
  border-color: var(--accent);
  background: var(--accent-soft);
}
button:focus-visible,
summary:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.sandbox-tools__settings {
  margin-left: auto;
  position: relative;
}
summary {
  padding: 8px 2px;
  cursor: pointer;
  color: var(--text-secondary);
}
.sandbox-tools__settings-grid {
  position: absolute;
  top: 42px;
  right: 0;
  z-index: 20;
  width: 250px;
  padding: 18px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px var(--shadow-soft);
  display: grid;
  gap: 12px;
}
label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}
select {
  padding: 7px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.sandbox-tools__check {
  justify-content: flex-start;
}
input {
  accent-color: var(--accent);
}
small {
  color: var(--text-muted);
  line-height: 1.6;
}
@media (max-width: 700px) {
  .sandbox-tools {
    gap: 8px;
    padding: 10px;
  }
  button {
    min-height: 42px;
  }
  .sandbox-tools__settings {
    margin-left: 0;
  }
  .sandbox-tools__settings-grid {
    left: 0;
    right: auto;
  }
}
</style>
