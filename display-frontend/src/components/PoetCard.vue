<template>
  <div class="poet-card card" @click="$emit('click')">
    <div class="card-avatar-wrap">
      <img :src="avatar" :alt="poet.name" class="card-avatar" />
      <div class="avatar-ring"></div>
    </div>
    <div class="card-body">
      <h3 class="card-name">{{ poet.name }}</h3>
      <p class="card-dynasty" v-if="dynasty">{{ dynasty }}</p>
      <p class="card-style" v-if="poet.style">{{ poet.style }}</p>
    </div>
    <div class="card-accent"></div>
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
  padding: 28px 20px 24px;
  text-align: center;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  position: relative;
  overflow: hidden;
}

.poet-card:hover {
  transform: translateY(-6px);
}

.card-avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
}

.card-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  border: 3px solid var(--bg-secondary);
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  opacity: 0;
  transition: all 0.35s ease;
}

.poet-card:hover .avatar-ring {
  opacity: 1;
  inset: -6px;
}

.card-body {
  position: relative;
  z-index: 1;
}

.card-name {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: 2px;
}

.card-dynasty {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.card-style {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Bottom accent bar */
.card-accent {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.35s ease;
}

.poet-card:hover .card-accent {
  width: 60%;
}

.theme-inkwash .card-avatar {
  border-color: var(--bg-tertiary);
}

.theme-inkwash .avatar-ring {
  border-color: var(--accent);
  border-style: dashed;
}
</style>
