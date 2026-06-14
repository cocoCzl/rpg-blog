<template>
  <div class="danmaku-bubble" :style="bubbleStyle" @animationend="$emit('finished')" aria-hidden="true">
    <span v-html="content" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../../composables/useReducedMotion'

const props = defineProps<{ color: string; text: string; track: number; containerWidth: number }>()
defineEmits<{ finished: [] }>()
const reducedMotion = useReducedMotion()

function stripHtml(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const content = computed(() => {
  const safe = stripHtml(props.text)
  return safe
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.15);padding:0 3px;border-radius:2px">$1</code>')
})

const bubbleStyle = computed(() => ({
  top: `${props.track * 36}px`,
  color: props.color || 'var(--color-text, #FFFFFF)',
  animation: reducedMotion.value ? 'none' : 'danmakuScroll 8s linear forwards',
  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
  position: 'absolute' as const,
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
}))

const width = computed(() => `${props.containerWidth}px`)
</script>

<style scoped>
.danmaku-bubble {
  font-size: 14px;
  font-weight: 500;
}
@keyframes danmakuScroll {
  from { transform: translateX(v-bind(width)) }
  to { transform: translateX(-100%) }
}
</style>
