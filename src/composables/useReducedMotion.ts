import { ref, onMounted, onUnmounted } from 'vue'

const prefersReducedMotion = ref(false)
let mediaQuery: MediaQueryList | null = null

function updatePreference() {
  if (typeof window === 'undefined') return
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', (e) => { prefersReducedMotion.value = e.matches })
  }
  prefersReducedMotion.value = mediaQuery.matches
}

export function useReducedMotion() {
  onMounted(() => updatePreference())
  onUnmounted(() => {})
  return prefersReducedMotion
}
