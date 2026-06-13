<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from '../../composables/useReducedMotion'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
const reducedMotion = useReducedMotion()

const PETAL_COUNT = 30
const COLORS = ['#FFB7C5', '#FFCDD2', '#F8BBD0', '#FFE0E6', '#FADADD']

interface Petal {
  x: number; y: number; size: number; speed: number; speedX: number
  rotation: number; rotationSpeed: number; opacity: number; color: string
  swingAmplitude: number; swingSpeed: number; swingOffset: number
}

let petals: Petal[] = []
let frameCount = 0

function createPetal(w: number, h: number): Petal {
  return {
    x: Math.random() * w, y: -20 - Math.random() * h * 0.5, size: 6 + Math.random() * 10,
    speed: 0.5 + Math.random() * 1.5, speedX: -0.3 + Math.random() * 0.6,
    rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.04,
    opacity: 0.3 + Math.random() * 0.5, color: COLORS[Math.floor(Math.random() * COLORS.length)],
    swingAmplitude: 30 + Math.random() * 60, swingSpeed: 0.01 + Math.random() * 0.02,
    swingOffset: Math.random() * Math.PI * 2,
  }
}

function draw(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
}

function animate(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, c.width, c.height); frameCount++
  for (const p of petals) {
    p.y += p.speed; p.x += p.speedX + Math.sin(frameCount * p.swingSpeed + p.swingOffset) * 0.5; p.rotation += p.rotationSpeed
    if (p.y > c.height + 20) { p.y = -20; p.x = Math.random() * c.width }
    if (p.x < -20) p.x = c.width + 20
    if (p.x > c.width + 20) p.x = -20
    draw(ctx, p)
  }
  animationId = requestAnimationFrame(() => animate(c, ctx))
}

function resize() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth; canvasRef.value.height = window.innerHeight
  if (!petals.length) for (let i = 0; i < PETAL_COUNT; i++) { const p = createPetal(canvasRef.value.width, canvasRef.value.height); p.y = Math.random() * canvasRef.value.height; petals.push(p) }
}

onMounted(() => {
  if (reducedMotion.value) return
  resize(); window.addEventListener('resize', resize)
  animate(canvasRef.value!, canvasRef.value!.getContext('2d')!)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); petals = []
})
</script>

<template>
  <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[1]" style="mix-blend-mode: screen" />
</template>
