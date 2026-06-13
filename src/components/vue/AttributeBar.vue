<script setup lang="ts">
defineProps<{
  label: string
  value: number
  max: number
  color: string
  realLabel: string
}>()
</script>

<template>
  <div class="mb-2">
    <div class="flex justify-between items-center mb-1">
      <span class="text-[0.6rem] font-bold tracking-wider" :style="{ color }">{{ label }}</span>
      <div class="flex items-center gap-2">
        <span class="text-[0.45rem] opacity-30">{{ realLabel }}</span>
        <span class="text-[0.5rem] font-mono" :class="value < 30 ? 'text-red-400' : ''" style="color: var(--color-text-secondary)">{{ value }} / {{ max }}</span>
      </div>
    </div>
    <div class="h-2.5 rounded-full overflow-hidden relative" style="background: rgba(255,255,255,0.08)" role="progressbar" :aria-valuenow="value" :aria-valuemin="0" :aria-valuemax="max" :aria-label="realLabel">
      <div class="h-full rounded-full transition-all duration-700" :style="{ width: Math.min(100, Math.round((value / max) * 100)) + '%', background: `linear-gradient(90deg, ${color}, ${color}88)` }" />
      <div v-if="value < 30" class="absolute inset-0 rounded-full" :style="{ background: `linear-gradient(90deg, ${color}40, transparent)` }" />
    </div>
  </div>
</template>
