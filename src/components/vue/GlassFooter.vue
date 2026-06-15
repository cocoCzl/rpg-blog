<template>
  <footer class="glass-card mt-16 py-6 border-b-0 border-x-0 rounded-none">
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-4 text-xs" style="color: var(--color-text-secondary)">
          <span>{{ time }}</span>
          <span class="hidden sm:inline">|</span>
          <span class="hidden sm:inline">{{ uptimeLabel }}: {{ uptime }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs" style="color: var(--color-text-secondary)">
          <template v-if="socialLinks.length > 0">
            <a
              v-for="link in socialLinks"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="hover:underline"
              style="color: var(--color-text-secondary)"
            >
              {{ link.label }}
            </a>
            <span class="hidden sm:inline">|</span>
          </template>
          <span>Astro</span>
          <span>Vue 3</span>
          <span>SQLite</span>
          <span>Tailwind</span>
        </div>
        <p class="text-xs" style="color: var(--color-text-secondary)">
          &copy; {{ year }} {{ author }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '../../../site.config'
import { t } from '../../lib/i18n'

const props = defineProps<{
  locale?: 'en' | 'zh'
  author?: string
}>()

const author = props.author ?? config.author.name
const year = new Date().getFullYear()
const locale = props.locale ?? 'en'
const uptimeLabel = t('footer.uptime', locale)
const socialLinks = [
  { label: 'GitHub', href: config.social.github },
  { label: 'X', href: config.social.twitter },
  { label: 'Website', href: config.social.website },
].filter((link) => Boolean(link.href))
const time = ref('')
const uptime = ref('')
let clockInterval: ReturnType<typeof setInterval> | null = null
const startTime = Date.now()

function updateClock() {
  time.value = new Date().toLocaleTimeString()
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  uptime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

function onVisibilityChange() {
  if (document.hidden) {
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null }
  } else {
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
  }
}
</script>
