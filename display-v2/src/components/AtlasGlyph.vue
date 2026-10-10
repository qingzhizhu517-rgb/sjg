<template>
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="20" cy="20" r="17"/><circle cx="20" cy="20" r="14.5" opacity=".45"/>
    <g v-if="kind === 'temple'"><path d="m9 16 11-6 11 6H9Zm2 1h18M12 28h16M10 30h20M14 18v9m6-9v9m6-9v9"/><path d="M17 12h6"/></g>
    <g v-else-if="kind === 'mountain'"><path d="m8 29 8-15 5 9 4-12 8 18H8Z"/><path d="m12 23 4-2 3 5m5-10 2 5 3-1"/><circle cx="11" cy="12" r="2"/></g>
    <g v-else-if="kind === 'river'"><path d="M12 11c19-2 18 8 7 9S9 31 28 29M16 11c14 0 12 6 3 7S4 33 26 32M11 9l4 2-4 3M29 26l3 3-4 3"/></g>
    <g v-else-if="kind === 'sunrise'"><path d="m8 28 8-10 5 6 4-5 7 9M9 31h22M12 14l-2-2m17 2 2-2M20 9v3"/><path d="M16 16a5 5 0 0 1 9 3"/></g>
    <g v-else-if="kind === 'inscription'"><path d="M12 29V14l4-4h9l3 5v14M9 31h22M17 15h6m-6 5h6m-6 5h6"/><path d="m25 12 3 3h-3v-3Z"/></g>
    <g v-else-if="kind === 'food'"><path d="M9 21h22c-1 7-5 10-11 10S10 28 9 21ZM16 33h8M12 25h16M14 17c-3-3 3-4 0-7m6 7c-3-3 3-4 0-7m6 7c-3-3 3-4 0-7"/></g>
    <g v-else-if="kind === 'festival'"><path d="M20 7v4M15 12h10m-10 15h10M20 28v5m-3-2h6"/><path d="M15 13c-8 4-6 12 0 13h10c6-1 8-9 0-13H15ZM17 13c-3 4-3 8 0 13m6-13c3 4 3 8 0 13M11 19h18"/></g>
    <g v-else><path d="m20 8 10 8-4 12H14l-4-12 10-8Z"/><path d="m20 12 6 5-2 8h-8l-2-8 6-5Zm-5 17-3 5 8-3 8 3-3-5"/></g>
  </svg>
</template>
<script setup>
defineProps({ kind: { type: String, default: 'heritage' } })
</script>
