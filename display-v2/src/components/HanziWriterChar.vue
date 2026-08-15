<template>
  <div class="hanzi-writer-char" ref="charRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import HanziWriter from 'hanzi-writer'

const props = defineProps({
  char: { type: String, required: true },
  size: { type: Number, default: 100 },
  delay: { type: Number, default: 0 },
  autoPlay: { type: Boolean, default: false }
})

const charRef = ref(null)
const writer = ref(null)

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

function initWriter() {
  if (writer.value) {
    writer.value = null
  }
  
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
    
    if (props.autoPlay) {
      setTimeout(() => {
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
    writer.value.animateCharacter()
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
