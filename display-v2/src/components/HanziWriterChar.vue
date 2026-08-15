<template>
  <div class="hanzi-writer-char" ref="charRef"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import HanziWriter from 'hanzi-writer'

const props = defineProps({
  char: { type: String, required: true },
  size: { type: Number, default: 100 },
  delay: { type: Number, default: 0 },
  autoPlay: { type: Boolean, default: false }
})

const emit = defineEmits(['animation-complete'])

const charRef = ref(null)
const writer = ref(null)
let playTimer = null

onMounted(async () => {
  await nextTick()
  if (charRef.value && props.char) {
    initWriter()
  }
})

watch(() => props.char, async () => {
  await nextTick()
  if (charRef.value && props.char) {
    initWriter()
  }
})

// autoPlay 由 false→true 时开始播放（父组件用翻转实现"重播"）
watch(() => props.autoPlay, (playing) => {
  if (!playing) return
  clearTimeout(playTimer)
  playTimer = setTimeout(() => {
    playAnimation()
  }, props.delay || 0)
})

onBeforeUnmount(() => {
  clearTimeout(playTimer)
  playTimer = null
  writer.value = null
})

function initWriter() {
  clearTimeout(playTimer)
  playTimer = null
  writer.value = null

  // 清空容器
  charRef.value.innerHTML = ''

  try {
    writer.value = HanziWriter.create(charRef.value, props.char, {
      width: props.size,
      height: props.size,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      strokeColor: '#2c2c2c',
      outlineColor: '#ddd',
      radicalColor: '#c8a45c',
      charDataLoader: (char, onComplete) => {
        // 使用内置数据
        onComplete(HanziWriter.getCharacterData(char))
      }
    })

    // 组件挂载时 autoPlay 已为 true（如直接渲染带动画）也要能播放
    if (props.autoPlay) {
      playTimer = setTimeout(() => {
        playAnimation()
      }, props.delay)
    }
  } catch (error) {
    console.error('HanziWriter初始化失败:', error)
    // 回退到简单显示
    charRef.value.textContent = props.char
    charRef.value.style.fontSize = `${props.size}px`
    charRef.value.style.lineHeight = `${props.size}px`
  }
}

function playAnimation() {
  if (writer.value) {
    writer.value.animateCharacter({
      onComplete: () => emit('animation-complete', props.char)
    })
  }
}

function pauseAnimation() {
  if (writer.value) {
    writer.value.pauseAnimation()
  }
}

function resumeAnimation() {
  if (writer.value) {
    writer.value.resumeAnimation()
  }
}

defineExpose({
  playAnimation,
  pauseAnimation,
  resumeAnimation
})
</script>

<style scoped>
.hanzi-writer-char {
  display: inline-block;
  width: v-bind(`${props.size}px`);
  height: v-bind(`${props.size}px`);
}
</style>
