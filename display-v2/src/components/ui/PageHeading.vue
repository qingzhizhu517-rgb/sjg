<template>
  <header class="folio-heading">
    <img v-if="image" class="folio-heading__art" :src="image" alt="" aria-hidden="true" />
    <router-link v-if="backTo" :to="backTo" class="folio-back">← {{ backLabel }}</router-link>
    <p v-if="eyebrow" class="folio-eyebrow">{{ eyebrow }}</p>
    <div class="folio-heading__row">
      <div class="folio-heading__copy"><h1>{{ title }}</h1><p v-if="description" class="folio-heading__description">{{ description }}</p><slot /></div>
      <div v-if="$slots.actions" class="folio-actions"><slot name="actions" /></div>
    </div>
  </header>
</template>
<script setup>
defineProps({ eyebrow: String, title: { type: String, required: true }, description: String, image: { type: String, default: '/media/inkwash/atlas/mountain-vignette.webp' }, backTo: [String, Object], backLabel: { type: String, default: '返回上一级' } })
</script>
