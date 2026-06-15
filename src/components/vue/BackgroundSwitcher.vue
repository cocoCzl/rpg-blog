<template>
  <div class="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
    <div
      v-for="(img, idx) in layers"
      :key="idx"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-[1.6s]"
      :class="img.class"
      :style="{ backgroundImage: `url(${img.url})`, opacity: img.opacity }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '../../../site.config'
import { useReducedMotion } from '../../composables/useReducedMotion'

const reducedMotion = useReducedMotion()

const fallbackImages = [
  '/backgrounds/landscape-1.jpg',
  '/backgrounds/landscape-2.jpg',
  '/backgrounds/landscape-3.jpg',
  '/backgrounds/landscape-4.jpg',
  '/backgrounds/landscape-5.jpg',
]

interface Layer {
  url: string
  opacity: number
  class: string
}

const layers = ref<Layer[]>([
  { url: '', opacity: 1, class: '' },
  { url: '', opacity: 0, class: 'dark:brightness-75 dark:saturate-80 dark:contrast-110' },
])

const images = ref<string[]>([])
let currentIdx = 0
let nextIdx = 1
let activeLayer = 0
let interval: ReturnType<typeof setInterval> | null = null

async function loadImages() {
  const bgImages = config.theme?.backgroundImages as string[] | undefined
  images.value = (bgImages && bgImages.length > 0) ? bgImages : fallbackImages
  layers.value[0].url = images.value[0]
  currentIdx = 0
  nextIdx = 1 % images.value.length
  // Only preload the next image, not all
  if (images.value.length > 1) {
    new Image().src = images.value[1]
  }
}

function swap() {
  if (images.value.length <= 1) return
  currentIdx = nextIdx
  nextIdx = (nextIdx + 1) % images.value.length

  const old = activeLayer
  const next = 1 - activeLayer
  layers.value[old].opacity = 0
  layers.value[next].url = images.value[currentIdx]
  layers.value[next].opacity = 1
  activeLayer = next
  // Preload the image after next
  const afterNext = (nextIdx + 1) % images.value.length
  new Image().src = images.value[afterNext]
}

onMounted(async () => {
  await loadImages()
  if (reducedMotion.value) return
  interval = setInterval(swap, 30000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>
