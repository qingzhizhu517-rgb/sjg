<template>
  <div class="poet-card card" @click="$emit('click')">
    <img :src="avatar" :alt="poet.name" class="poet-avatar" />
    <div class="poet-info">
      <h3>{{ poet.name }}</h3>
      <p class="dynasty" v-if="dynasty">{{ dynasty }}</p>
      <p class="style" v-if="poet.style">{{ poet.style }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps({ poet: Object, dynasty: String })
defineEmits(['click'])
const { isReal } = useTheme()

const avatar = computed(() =>
  isReal.value ? props.poet.avatarUrl : (props.poet.avatarAnimeUrl || props.poet.avatarUrl)
)
</script>

<style scoped>
.poet-card {
  cursor: pointer;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.poet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.poet-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}
h3 {
  font-family: var(--font-heading);
  font-size: 18px;
  margin-bottom: 4px;
}
.dynasty {
  color: var(--accent);
  font-size: 14px;
}
.style {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}
</style>
