<template>
  <nav
    ref="navRef"
    class="glass-card fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-t-0 border-x-0 rounded-none"
    :style="{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', backdropFilter: 'blur(12px)' }"
    @focusin="show"
  >
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="/" class="font-bold text-lg" style="font-family: var(--font-heading)">
        {{ title }}
      </a>
      <div class="flex items-center gap-4">
        <a href="/rpg" class="text-xs hover:opacity-80 transition-opacity hidden sm:inline" style="color: var(--color-text-secondary)">RPG</a>
        <slot name="actions" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '../../../site.config'

const title = config.title
const visible = ref(true)
const navRef = ref<HTMLElement | null>(null)
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let lastMove = 0
let keyboardUsed = false

function show() {
  visible.value = true
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
}

function scheduleHide() {
  if (keyboardUsed) return
  hideTimeout = setTimeout(() => { visible.value = false }, 600)
}

function onMouseMove(e: MouseEvent) {
  const now = Date.now()
  if (now - lastMove < 50) return
  lastMove = now
  if (e.clientY < 60) show()
  else scheduleHide()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    keyboardUsed = true
    show()
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('keydown', onKeyDown)
  if (hideTimeout) clearTimeout(hideTimeout)
})
</script>
