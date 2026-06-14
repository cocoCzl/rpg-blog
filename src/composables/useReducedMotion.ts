import { ref, onMounted, onUnmounted } from 'vue'

const prefersReducedMotion = ref(false)
let mediaQuery: MediaQueryList | null = null
let subscriberCount = 0

function updatePreference() {
  if (typeof window === 'undefined') return
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  }
  prefersReducedMotion.value = mediaQuery.matches
}

function onMediaChange(e: MediaQueryListEvent) {
  prefersReducedMotion.value = e.matches
}

export function useReducedMotion() {
  onMounted(() => {
    updatePreference()
    if (subscriberCount === 0) {
      mediaQuery?.addEventListener('change', onMediaChange)
    }
    subscriberCount++
  })
  onUnmounted(() => {
    subscriberCount--
    if (subscriberCount <= 0) {
      mediaQuery?.removeEventListener('change', onMediaChange)
      subscriberCount = 0
    }
  })
  return prefersReducedMotion
}
