<template>
  <section class="sandbox-editor" aria-label="场景编辑器">
    <p class="sandbox-editor__eyebrow">我的山河 · 本地草稿</p>
    <h2>{{ engine.mode === 'terrain' ? '雕琢一方山水' : '安放亭台草木' }}</h2>
    <p class="sandbox-editor__intro">
      {{
        engine.mode === 'terrain'
          ? '在地表按住拖动，用笔刷调整起伏。河岸保护区域不会被修改。'
          : '选择素材，再点击地表放置；拖动已选对象调整位置。'
      }}
    </p>
    <fieldset v-if="engine.mode === 'object'">
      <legend>选择素材</legend>
      <div class="sandbox-editor__assets">
        <button
          v-for="asset in assets"
          :key="asset.id"
          type="button"
          :aria-pressed="engine.objectAsset === asset.id"
          @click="engine.setObjectAsset(asset.id)"
        >
          <span aria-hidden="true">{{ asset.glyph }}</span
          >{{ asset.label }}
        </button>
      </div>
      <small>程序化示意模型，不代表真实历史建筑。</small>
    </fieldset>
    <fieldset v-if="engine.mode === 'object' && engine.selectedObject">
      <legend>调整选中对象</legend>
      <label
        >朝向
        <input
          type="range"
          min="-180"
          max="180"
          step="5"
          :value="engine.selectedObject.rotation"
          @change="updateObject('rotation', $event)"
      /></label>
      <label
        >尺度
        <input
          type="range"
          min="0.3"
          max="3"
          step="0.1"
          :value="engine.selectedObject.scale"
          @change="updateObject('scale', $event)"
      /></label>
      <button type="button" @click="engine.deleteSelected()">移除选中对象</button>
    </fieldset>
    <fieldset v-if="engine.mode === 'terrain'">
      <legend>地形笔刷</legend>
      <label
        >操作<select :value="engine.brush.type" @change="engine.setBrush({ type: $event.target.value })">
          <option value="raise">抬升</option>
          <option value="lower">压低</option>
          <option value="smooth">平滑</option>
          <option value="flatten">定高</option>
        </select></label
      >
      <label
        >半径
        <input
          type="range"
          min="0.4"
          max="3"
          step="0.1"
          :value="engine.brush.radius"
          @input="engine.setBrush({ radius: Number($event.target.value) })"
      /></label>
      <label
        >强度
        <input
          type="range"
          min="0.02"
          max="0.5"
          step="0.02"
          :value="engine.brush.strength"
          @input="engine.setBrush({ strength: Number($event.target.value) })"
      /></label>
    </fieldset>
    <div class="sandbox-editor__history" role="group" aria-label="编辑历史">
      <button type="button" :disabled="!engine.canUndo" @click="engine.undo()">↶ 撤销</button>
      <button type="button" :disabled="!engine.canRedo" @click="engine.redo()">↷ 重做</button>
    </div>
    <fieldset :disabled="busy">
      <legend>保存这片山河</legend>
      <div class="sandbox-editor__actions">
        <button type="button" @click="save">保存草稿</button
        ><button type="button" @click="restore">恢复草稿</button>
        <button type="button" @click="download">导出 JSON</button
        ><button type="button" @click="fileInput?.click()">导入 JSON</button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        class="sandbox-editor__file"
        aria-label="导入场景草稿"
        @change="importFile"
      />
      <small>仅保存在此浏览器；导出可备份。编辑不会改动公开文化资料。</small>
      <button v-if="!confirmReset" class="sandbox-editor__reset" type="button" @click="confirmReset = true">
        重置场景…
      </button>
      <div v-else class="sandbox-editor__confirm">
        <p>清空当前布置与地形修改？已保存草稿不受影响。</p>
        <button type="button" @click="reset">确认重置</button
        ><button type="button" @click="confirmReset = false">取消</button>
      </div>
    </fieldset>
    <p v-if="feedback" class="sandbox-editor__feedback" role="status" aria-live="polite">{{ feedback }}</p>
  </section>
</template>
<script setup>
import { ref } from 'vue'
import { SANDBOX_ASSETS } from '../../config/sandboxAssets.js'
const props = defineProps({ engine: { type: Object, required: true } })
const busy = ref(false)
const feedback = ref('')
const confirmReset = ref(false)
const fileInput = ref(null)
const assets = SANDBOX_ASSETS.map((asset) => ({ ...asset, label: asset.name, glyph: asset.name.slice(-1) }))
async function run(action, message) {
  if (busy.value) return
  busy.value = true
  feedback.value = ''
  try {
    await action()
    feedback.value = message
  } catch (error) {
    feedback.value = error?.message || '操作未完成，请重试'
  } finally {
    busy.value = false
  }
}
const save = () => run(() => props.engine.saveDraft(), '草稿已保存在此浏览器。')
const restore = () => run(() => props.engine.loadDraft(), '已恢复保存的场景。')
const reset = () =>
  run(() => {
    props.engine.resetDraft()
    confirmReset.value = false
  }, '已恢复初始山河。')
const updateObject = (key, event) => props.engine.updateSelected({ [key]: Number(event.target.value) })
async function importFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  await run(async () => {
    if (file.size > 5_000_000) throw new Error('草稿文件不能超过 5 MB。')
    await props.engine.importDraft(await file.text())
  }, '草稿导入成功。')
  event.target.value = ''
}
const download = () =>
  run(() => {
    const url = URL.createObjectURL(new Blob([props.engine.exportDraft()], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = '我的山河草稿.json'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, '草稿已导出。')
</script>
<style scoped>
.sandbox-editor {
  display: grid;
  gap: 16px;
  padding: 4px;
  color: var(--text-primary);
}
.sandbox-editor__eyebrow {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 3px;
  margin: 0;
}
h2 {
  font: 500 23px/1.4 var(--font-heading);
  margin: 0;
}
p {
  margin: 0;
}
.sandbox-editor__intro,
small {
  font-size: 12px;
  line-height: 1.8;
  color: var(--text-secondary);
}
fieldset {
  border: 0;
  border-top: 1px solid var(--border);
  padding: 12px 0 0;
  min-width: 0;
  display: grid;
  gap: 12px;
}
legend {
  font-size: 12px;
  padding-right: 8px;
  letter-spacing: 1px;
}
button,
select {
  font: inherit;
  font-size: 12px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 3px;
  min-height: 38px;
  padding: 8px 10px;
  cursor: pointer;
}
button:hover,
button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
button:disabled {
  opacity: 0.4;
  cursor: default;
}
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.sandbox-editor__assets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.sandbox-editor__assets button {
  display: grid;
  gap: 4px;
}
.sandbox-editor__assets span {
  font: 500 26px var(--font-heading);
}
.sandbox-editor__history,
.sandbox-editor__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}
input[type='range'] {
  width: 65%;
  accent-color: var(--accent);
}
.sandbox-editor__file {
  display: none;
}
.sandbox-editor__reset {
  background: transparent;
}
.sandbox-editor__confirm {
  display: grid;
  gap: 8px;
  font-size: 12px;
  line-height: 1.7;
}
.sandbox-editor__feedback {
  color: var(--accent);
  font-size: 12px;
  line-height: 1.7;
  padding: 12px;
  background: var(--accent-soft);
}
</style>
