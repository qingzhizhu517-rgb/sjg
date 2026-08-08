<template>
  <section class="famous-cities">
    <SectionHeading
      eyebrow="名城精选"
      :title="headingTitle"
      subtitle="沿黄九城 · 各具风华"
      center
    />
    <div class="famous-cities__grid">
      <CityFeatureSpot
        v-for="(c, i) in cities"
        :key="c.name"
        :index="i"
        :name="c.name"
        :description="c.desc"
        :image="c.image"
        :tag="c.tag"
        :address="c.geo"
        :reversed="i % 2 === 1"
        @click="$emit('go', `/regions/${c.name}`)"
      />
    </div>
  </section>
</template>

<script setup>
import SectionHeading from './SectionHeading.vue'
import CityFeatureSpot from './CityFeatureSpot.vue'

defineProps({
  cities: { type: Array, required: true },
  headingTitle: { type: String, default: '山河名城' },
})

defineEmits(['go'])
</script>

<style scoped>
.famous-cities {
  padding: 72px 0;
  max-width: var(--container-max, 1280px);
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.famous-cities__grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media (max-width: 768px) {
  .famous-cities {
    padding: 48px 16px;
  }
}
</style>
