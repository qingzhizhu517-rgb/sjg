<template>
  <div class="sec-head" :class="{ 'sec-head--center': center }">
    <span v-if="eyebrow" class="sec-head__eyebrow">{{ eyebrow }}</span>
    <h2 class="sec-head__title folio-section-title">{{ title }}</h2>
    <p v-if="subtitle" class="sec-head__sub">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  center: { type: Boolean, default: false },
})
</script>

<style scoped>
.sec-head {
  text-align: left;
  max-width: var(--measure-wide);
  margin-bottom: var(--sp-5);
}
.sec-head--center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.sec-head__eyebrow {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: .15em;
  color: var(--accent);
  margin-bottom: 10px;
}
.sec-head__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: .06em;
  line-height: 1.5;
  margin: 0 0 8px 0;
}
.sec-head__sub {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: 1.8;
  letter-spacing: 0.5px;
  margin: 0;
}
@media (max-width: 768px) {
  .sec-head__title {
    font-size: 24px;
    letter-spacing: 2px;
  }
}
</style>
