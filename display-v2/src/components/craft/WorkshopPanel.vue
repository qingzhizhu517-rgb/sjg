<template>
  <section class="workshop-panel" aria-label="制作操作">
    <nav class="workshop-panel__steps" aria-label="制作阶段">
      <button v-for="(label, i) in MAKE_STEPS" :key="label" type="button" :aria-current="step === i ? 'step' : undefined" :disabled="i === 3 && !assessment.canColor || i === 4 && !assessment.canFinish" @click="$emit('enter', i)"><span>{{ i + 1 }}</span>{{ label }}</button>
    </nav>
    <header class="workshop-panel__heading"><p>第 {{ step + 1 }} 阶段 / 共 5 阶段</p><h2>{{ MAKE_STEPS[step] }}</h2></header>
    <template v-if="step === 0">
      <fieldset><legend>选择数字坯形</legend><div class="workshop-panel__options">
        <button v-for="shape in HULU_SHAPES" :key="shape.id" type="button" :aria-pressed="work.shape === shape.id" @click="$emit('choose', 'shape', shape.id)">{{ shape.label }}<small>{{ shape.note }}</small></button>
      </div></fieldset>
      <fieldset><legend>练习方式</legend><div class="workshop-panel__choices">
        <button type="button" :aria-pressed="work.practice === 'guided'" @click="$emit('choose', 'practice', 'guided')">跟刻入门</button>
        <button type="button" :aria-pressed="work.practice === 'free'" @click="$emit('choose', 'practice', 'free')">自由练习</button>
      </div></fieldset>
      <p class="workshop-panel__note">三种坯形为数字设计选项。观察腹部与束腰，为纹样留出空间；制作从处理后的干坯开始。</p>
    </template>
    <template v-else-if="step === 1">
      <fieldset><legend>原创纹样</legend><div class="workshop-panel__choices">
        <button v-for="motif in HULU_MOTIFS" :key="motif.id" type="button" :aria-pressed="work.motif === motif.id" @click="$emit('choose', 'motif', motif.id)">{{ motif.label }}</button>
      </div><p class="workshop-panel__note">{{ HULU_MOTIFS.find(m => m.id === work.motif)?.note }}</p></fieldset>
      <div class="workshop-panel__ranges">
        <label>左右位置 <input aria-label="纹样左右位置" type="range" min=".15" max=".85" step=".01" :value="work.placement.u" @input="place('u', $event.target.value)" /></label>
        <label>上下位置 <input aria-label="纹样上下位置" type="range" min=".18" max=".68" step=".01" :value="work.placement.v" @input="place('v', $event.target.value)" /></label>
        <label>纹样大小 <input aria-label="纹样大小" type="range" min=".55" max="1.4" step=".05" :value="work.placement.scale" @input="place('scale', $event.target.value)" /></label>
        <label>纹样方向 <input aria-label="纹样方向" type="range" min="-180" max="180" step="5" :value="work.placement.rotation" @input="place('rotation', $event.target.value)" /></label>
      </div>
      <p class="workshop-panel__note">{{ placementHint(work) }} 辅助线只供参考，不会自动生成刻痕。</p>
    </template>
    <template v-else-if="step === 2 || step === 3">
      <fieldset><legend>当前工具</legend><div class="workshop-panel__choices">
        <button type="button" :aria-pressed="tool === 'rotate'" @click="$emit('tool', 'rotate')">{{ sceneCapability === '3d' ? '旋转' : '停笔' }}</button>
        <button v-if="step === 2" type="button" :aria-pressed="tool === 'carve'" @click="$emit('tool', 'carve')">刻刀</button>
        <template v-else><button type="button" :aria-pressed="tool === 'coat'" @click="$emit('tool', 'coat')">敷色</button><button type="button" :aria-pressed="tool === 'wipe'" @click="$emit('tool', 'wipe')">擦色</button></template>
      </div></fieldset>
      <template v-if="step === 2">
        <fieldset><legend>数字刻刀档位</legend><div class="workshop-panel__choices"><button v-for="(label, i) in ['浅', '中', '深']" :key="label" type="button" :aria-pressed="work.depth === i + 1" @click="$emit('choose', 'depth', i + 1)">{{ label }}</button></div></fieldset>
        <label v-if="work.practice === 'guided'" class="workshop-panel__select">描线容错 <select aria-label="描线容错" :value="work.tolerance" @change="$emit('choose', 'tolerance', $event.target.value)"><option value="relaxed">宽容 · 入门</option><option value="precise">精细 · 挑战</option></select></label>
      </template>
      <fieldset v-else><legend>本次敷色用色</legend><div class="workshop-panel__choices"><button type="button" :aria-pressed="work.pigment === 'ink'" @click="$emit('choose', 'pigment', 'ink')">墨色</button><button type="button" :aria-pressed="work.pigment === 'ochre'" @click="$emit('choose', 'pigment', 'ochre')">赭色</button></div><p class="workshop-panel__note">先敷色，再擦净浮色，凹槽留下纹样。两种颜色是体验选项。</p></fieldset>
      <div class="workshop-panel__choices"><button type="button" :disabled="!canUndo" @click="$emit('undo')">撤销一笔</button><button type="button" :disabled="!canRedo" @click="$emit('redo')">重做一笔</button></div>
      <div class="workshop-panel__feedback">
        <template v-if="step === 2 && work.practice === 'guided'"><label>参考线覆盖 <strong>{{ assessment.coverage }}%</strong><progress max="100" :value="assessment.coverage" /></label><p>偏离参考线 {{ assessment.deviation }}% · 体验评分 {{ assessment.score }}</p></template>
        <template v-if="step === 3"><label>刻线敷色 <strong>{{ assessment.colorCoverage }}%</strong><progress max="100" :value="assessment.colorCoverage" /></label><label>浮色擦净 <strong>{{ assessment.wipeCoverage }}%</strong><progress max="100" :value="assessment.wipeCoverage" /></label></template>
        <p v-if="assessment.deepWarning">深档位在同一区域反复落刀；可撤销后试试浅档位。</p>
        <p>{{ assessment.hint }}</p><small>反馈用于数字练习，不作专业工艺鉴定。{{ work.practice === 'free' ? '自由练习不要求匹配参考线。' : '' }}</small>
      </div>
    </template>
    <template v-else>
      <label class="workshop-panel__name">为作品命名<input aria-label="作品名称" type="text" maxlength="48" :value="work.name" @input="$emit('choose', 'name', $event.target.value)" /></label>
      <p class="workshop-panel__note">{{ sceneCapability === '3d' ? '转动、近看，在侧光中检查刻线。' : '检查平面纹样，或返回前序继续练习。' }}作品只保存在当前浏览器，最多保留最近 6 件。</p>
      <button type="button" class="folio-button folio-button--primary" :disabled="!assessment.canFinish" @click="$emit('save')">保存到本地作品集</button>
      <button type="button" class="folio-button" @click="$emit('export')">导出作品图片</button>
    </template>
    <footer class="workshop-panel__footer"><button type="button" class="folio-button" :disabled="step === 0" @click="$emit('enter', step - 1)">← 上一阶段</button><button v-if="step < 4" type="button" class="folio-button folio-button--primary" :disabled="step === 2 && !assessment.canColor || step === 3 && !assessment.canFinish" @click="$emit('enter', step + 1)">下一阶段 →</button></footer>
    <button type="button" class="workshop-panel__reset" @click="$emit('reset')">重新选坯并清除笔迹</button>
  </section>
</template>

<script setup>
import { HULU_SHAPES, HULU_MOTIFS, MAKE_STEPS, placementHint } from '../../utils/huluWorkshop.js'
const props = defineProps({ work: { type: Object, required: true }, step: Number, tool: String, sceneCapability: { type: String, default: 'loading' }, assessment: { type: Object, required: true }, canUndo: Boolean, canRedo: Boolean })
const emit = defineEmits(['choose', 'enter', 'tool', 'undo', 'redo', 'save', 'export', 'reset'])
const place = (key, value) => emit('choose', 'placement', { ...props.work.placement, [key]: Number(value) })
</script>

<style scoped>
.workshop-panel { padding:24px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--card-bg); display:flex; flex-direction:column; gap:20px; }
.workshop-panel__steps { display:flex; gap:5px; padding-bottom:18px; border-bottom:1px solid var(--border-light); }
.workshop-panel__steps button { flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; font-size:10px; line-height:1.5; border:0; background:transparent; padding:0; min-height:54px; color:var(--text-secondary); cursor:pointer; }
.workshop-panel__steps span { display:grid; place-items:center; width:28px; height:28px; border:1px solid var(--border); border-radius:50%; font-size:12px; }
.workshop-panel__steps [aria-current] { color:var(--accent); } .workshop-panel__steps [aria-current] span { background:var(--accent); color:var(--text-on-accent); border-color:var(--accent); }
.workshop-panel__heading p { color:var(--text-muted); margin:0 0 5px; font-size:var(--fs-caption); letter-spacing:1px; }
.workshop-panel__heading h2 { font:600 25px/1.4 var(--font-heading); letter-spacing:3px; margin:0; }
.workshop-panel fieldset { padding:0; margin:0; border:0; min-width:0; }
.workshop-panel legend { margin-bottom:10px; font-size:var(--fs-body-sm); color:var(--text-secondary); }
.workshop-panel__choices { display:flex; flex-wrap:wrap; gap:8px; }
.workshop-panel__choices button, .workshop-panel__options button { min-height:44px; flex:1; border:1px solid var(--border); background:transparent; border-radius:var(--radius-sm); padding:10px; color:var(--text-primary); cursor:pointer; font-size:var(--fs-body-sm); }
.workshop-panel [aria-pressed="true"] { border-color:var(--accent); color:var(--accent); background:var(--accent-faint); }
.workshop-panel__options { display:grid; gap:8px; } .workshop-panel__options button { text-align:left; display:flex; gap:10px; align-items:center; }
.workshop-panel__options small { font-size:12px; color:var(--text-muted); }
.workshop-panel__note { color:var(--text-secondary); font-size:var(--fs-caption); line-height:1.85; margin:10px 0 0; }
.workshop-panel__ranges { display:grid; gap:12px; } .workshop-panel__ranges label { font-size:12px; color:var(--text-secondary); display:grid; grid-template-columns:70px 1fr; align-items:center; gap:8px; }
.workshop-panel input[type="range"] { width:100%; accent-color:var(--accent); min-height:36px; }
.workshop-panel__select, .workshop-panel__name { display:grid; gap:10px; font-size:var(--fs-body-sm); color:var(--text-secondary); }
.workshop-panel select, .workshop-panel input[type="text"] { min-height:44px; width:100%; background:var(--bg-primary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 10px; color:var(--text-primary); font-size:14px; }
.workshop-panel__feedback { padding:16px; border-left:2px solid var(--accent); background:var(--bg-secondary); font-size:var(--fs-caption); color:var(--text-secondary); line-height:1.8; }
.workshop-panel__feedback label { display:block; margin-bottom:10px; } .workshop-panel__feedback strong { float:right; font-weight:400; color:var(--accent); }
.workshop-panel__feedback progress { display:block; width:100%; height:4px; margin-top:7px; accent-color:var(--accent); }
.workshop-panel__feedback p { margin:5px 0; } .workshop-panel__feedback small { display:block; color:var(--text-muted); margin-top:10px; font-size:11px; }
.workshop-panel__footer { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
.workshop-panel__footer button { flex:1; padding-inline:9px; font-size:12px; white-space:nowrap; }
.workshop-panel__reset { border:0; background:none; color:var(--text-muted); font-size:12px; text-decoration:underline; text-underline-offset:4px; min-height:44px; cursor:pointer; }
.workshop-panel button:disabled { opacity:.45; cursor:default; }
@media (max-width:900px) { .workshop-panel { padding:20px; } .workshop-panel__options { grid-template-columns:repeat(3,1fr); } .workshop-panel__options button { display:block; } .workshop-panel__options small { display:block; margin-top:5px; } }
</style>
