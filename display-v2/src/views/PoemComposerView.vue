<template><div class="folio-page composer-page"><PageHeading eyebrow="研学创作 / 诗词创作" title="把眼前山河，写成一首诗" description="写下主题，选择形式，借助 AI 生成一首新作。生成内容与古典原作分开展示。"><template #actions><router-link :to="atlasLink('/poems', route)" class="folio-button folio-button--quiet">先读一首诗 ↗</router-link></template></PageHeading><PoemComposer /></div></template>
<script setup>
import { useRoute } from 'vue-router'
import { atlasLink } from '../config/atlasPreview'
import PageHeading from '../components/ui/PageHeading.vue'
import PoemComposer from '../components/PoemComposer.vue'
const route = useRoute()
</script>
<style scoped>.composer-page { max-width:1180px; }</style>
