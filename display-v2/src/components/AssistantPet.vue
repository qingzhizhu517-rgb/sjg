<template>
  <svg class="assistant-pet" :class="{ 'is-awake': awake, 'is-dragging': dragging, 'is-thinking': thinking, 'is-compact': compact }" viewBox="0 0 96 96" aria-hidden="true">
    <ellipse class="pet-shadow" cx="48" cy="87" rx="25" ry="4" />
    <g class="pet-body">
      <path class="pet-foot" d="M31 73c-5 3-8 9-5 11 4 3 12 0 14-7m17-3c4 1 11 6 9 9-2 4-12 2-15-5" />
      <path class="pet-hand pet-hand-left" d="M24 45c-8-2-15 4-13 10 1 4 7 2 11-1" />
      <path class="pet-hand" d="M73 47c7-1 13 4 11 9-2 3-7 1-10-2" />
      <path class="pet-cover" d="M23 22c15-5 34-5 49-1l3 50c-14 8-36 9-52 3-4-15-4-36 0-52Z" />
      <path class="pet-pages" d="M27 19c16-3 32-3 44 1l-1 49c-13 5-30 6-42 2Z" />
      <path class="pet-page-edge" d="m31 19-1 49c12 3 25 2 37-1M34 16c11-1 23 0 33 2" />
      <path class="pet-paper" d="M30 23c14-3 28-2 40 1l1 45c-12 5-29 5-41 1-3-13-3-33 0-47Z" />
      <path class="pet-spine" d="M24 25c-2 13-2 32 1 44" />
      <path class="pet-bookmark" d="m59 18 11 2-1 20-5-4-5 3Z" />
      <path class="pet-fold" d="m31 24 7-1-6 8Z" />
      <g class="pet-face">
        <g class="pet-eyes">
          <ellipse cx="43" cy="46" rx="3" ry="4" />
          <ellipse cx="60" cy="46" rx="3" ry="4" />
          <circle class="pet-eye-light" cx="44" cy="44.5" r=".8" />
          <circle class="pet-eye-light" cx="61" cy="44.5" r=".8" />
        </g>
        <path class="pet-smile" d="M48 54q4 4 8-1" />
        <ellipse class="pet-cheek" cx="37" cy="53" rx="4" ry="2" />
        <ellipse class="pet-cheek" cx="65" cy="53" rx="4" ry="2" />
      </g>
      <rect class="pet-seal" x="52" y="61" width="12" height="12" rx="2" transform="rotate(-5 58 67)" />
      <text class="pet-seal-letter" x="58" y="70" text-anchor="middle">文</text>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  awake: Boolean,
  dragging: Boolean,
  thinking: Boolean,
  compact: Boolean,
})
</script>

<style scoped>
.assistant-pet { width:100%; height:100%; overflow:visible; filter:drop-shadow(0 3px 2px var(--shadow-soft)); }
.pet-shadow { fill:var(--shadow-soft); }
.pet-body { transform-origin:48px 80px; animation:pet-breathe 5s ease-in-out infinite; }
.pet-cover { fill:var(--accent); stroke:var(--accent-dark); stroke-width:1.3; }
.pet-pages { fill:var(--bg-tertiary); stroke:var(--border); stroke-width:1; }
.pet-page-edge { fill:none; stroke:var(--ink-wash); stroke-width:1; opacity:.5; }
.pet-paper { fill:var(--card-bg); stroke:var(--border); stroke-width:1.2; }
.pet-fold { fill:var(--bg-tertiary); }
.pet-spine { fill:none; stroke:var(--text-on-accent); stroke-width:1.2; opacity:.6; }
.pet-bookmark { fill:var(--accent); }
.pet-hand,.pet-foot { fill:var(--bg-secondary); stroke:var(--ink-wash); stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.pet-hand-left { transform-origin:23px 48px; }
.pet-eyes { fill:var(--text-primary); transform-origin:51px 46px; animation:pet-blink 6s infinite; }
.pet-eye-light { fill:var(--card-bg); }
.pet-smile { fill:none; stroke:var(--text-primary); stroke-width:1.5; stroke-linecap:round; }
.pet-cheek { fill:var(--accent-a25); }
.pet-seal { fill:var(--accent); }
.pet-seal-letter { fill:var(--text-on-accent); font:9px var(--font-display); }
.is-awake .pet-hand-left { transform:rotate(22deg); }
.is-dragging .pet-body { animation:none; transform:translateY(-4px) rotate(-7deg); }
.is-dragging .pet-hand-left { transform:rotate(35deg); }
.is-thinking .pet-body { animation:pet-breathe 1.6s ease-in-out infinite; }
.is-compact { filter:none; }
.is-compact .pet-body,.is-compact .pet-eyes { animation:none; }
@keyframes pet-breathe { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }
@keyframes pet-blink { 0%,43%,47%,100% { transform:scaleY(1); } 45% { transform:scaleY(.1); } }
@media (prefers-reduced-motion:reduce) { .pet-body,.pet-eyes { animation:none!important; } }
</style>
