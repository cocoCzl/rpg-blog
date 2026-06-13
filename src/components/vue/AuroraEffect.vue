<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from '../../composables/useReducedMotion'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
const reducedMotion = useReducedMotion()

const AURORA_COLORS = ['rgba(0, 245, 255, ', 'rgba(78, 205, 196, ', 'rgba(150, 206, 180, ', 'rgba(195, 177, 225, ', 'rgba(255, 183, 197, ']

interface Wave { y: number; amplitude: number; frequency: number; speed: number; offset: number; color: string; opacity: number; gradient: CanvasGradient | null }
const waves = ref<Wave[]>([])

let frameCount = 0

function createWaves(w: number, h: number, ctx: CanvasRenderingContext2D): Wave[] {
  return Array.from({ length: 5 }, (_, i) => {
    const y = h * 0.15 + i * h * 0.12
    const amplitude = 20 + Math.random() * 40
    const opacity = 0.06 + Math.random() * 0.08
    const color = AURORA_COLORS[i % AURORA_COLORS.length]
    const grad = ctx.createLinearGradient(0, y - amplitude * 2, 0, y + h * 0.3)
    grad.addColorStop(0, color + opacity + ')')
    grad.addColorStop(0.5, color + opacity * 0.5 + ')')
    grad.addColorStop(1, color + '0)')
    return {
      y, amplitude,
      frequency: 0.003 + Math.random() * 0.004, speed: 0.005 + Math.random() * 0.01,
      offset: Math.random() * Math.PI * 2, color, opacity, gradient: grad,
    }
  })
}

function animate(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, c.width, c.height); frameCount++
  for (const w of waves.value) {
    ctx.beginPath(); ctx.moveTo(0, c.height)
    for (let x = 0; x <= c.width; x += 3) {
      const y = w.y + Math.sin(x * w.frequency + frameCount * w.speed + w.offset) * w.amplitude + Math.sin(x * w.frequency * 0.5 + frameCount * w.speed * 0.7) * w.amplitude * 0.5
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.lineTo(c.width, c.height); ctx.lineTo(0, c.height); ctx.closePath()
    ctx.fillStyle = w.gradient!
    ctx.fill()
  }
  animationId = requestAnimationFrame(() => animate(c, ctx))
}

function resize() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')!
  canvasRef.value.width = window.innerWidth; canvasRef.value.height = window.innerHeight
  waves.value = createWaves(canvasRef.value.width, canvasRef.value.height, ctx)
}

onMounted(() => {
  if (reducedMotion.value) return
  resize(); window.addEventListener('resize', resize)
  animate(canvasRef.value!, canvasRef.value!.getContext('2d')!)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId); window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[1]" />
</template>
