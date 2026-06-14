<template>
  <div ref="layerRef" class="danmaku-layer fixed inset-0 pointer-events-none z-10 overflow-hidden" :aria-hidden="paused || undefined" />
  <button
    class="fixed bottom-4 right-4 z-50 pointer-events-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
    style="background: var(--color-surface); color: var(--color-text-secondary)"
    @click="togglePause"
    :aria-pressed="paused"
    :aria-label="paused ? 'Resume danmaku' : 'Pause danmaku'"
  >
    {{ paused ? '▶' : '⏸' }}
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, createVNode, render, nextTick } from 'vue'
import { useDanmakuStore } from '../../stores/danmaku'
import { useReducedMotion } from '../../composables/useReducedMotion'
import DanmakuBubble from './DanmakuBubble.vue'

const store = useDanmakuStore()
const reducedMotion = useReducedMotion()
const layerRef = ref<HTMLElement | null>(null)
const paused = ref(false)

interface ActiveDanmaku {
  id: string
  track: number
  vnode: ReturnType<typeof createVNode>
  el: HTMLElement
}

const active: ActiveDanmaku[] = []
const MAX_TRACKS = 6
const trackOccupied: boolean[] = Array(MAX_TRACKS).fill(false)
let interval: ReturnType<typeof setInterval> | null = null

function findTrack(): number {
  for (let i = 0; i < MAX_TRACKS; i++) {
    if (!trackOccupied[i]) return i
  }
  return Math.floor(Math.random() * MAX_TRACKS)
}

function togglePause() {
  paused.value = !paused.value
}

function spawn() {
  if (paused.value || reducedMotion.value || !layerRef.value || store.items.length === 0) return
  const next = store.items.shift()
  if (!next) return
  const track = findTrack()
  trackOccupied[track] = true
  next._track = track

  const containerWidth = layerRef.value.clientWidth || 800
  const vnode = createVNode(DanmakuBubble, {
    color: next.color,
    text: next.content,
    track,
    containerWidth,
    onFinished: () => remove(next.id),
  })
  const el = document.createElement('div')
  render(vnode, el)
  layerRef.value.appendChild(el)
  active.push({ id: next.id, track, vnode, el })
}

function remove(id: string) {
  const idx = active.findIndex(a => a.id === id)
  if (idx >= 0) {
    const item = active[idx]
    trackOccupied[item.track] = false
    render(null, item.el)
    if (item.el.parentNode) item.el.parentNode.removeChild(item.el)
    active.splice(idx, 1)
  }
}

onMounted(() => {
  interval = setInterval(spawn, 800)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  for (const a of active) {
    render(null, a.el)
    if (a.el.parentNode) a.el.parentNode.removeChild(a.el)
  }
})
</script>
