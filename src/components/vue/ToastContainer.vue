<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="alert"
      aria-live="assertive"
      class="px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 pointer-events-auto cursor-pointer"
      :style="toastStyle(toast.type)"
      @click="store.remove(toast.id)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '../../stores/toast'
import { computed } from 'vue'

const store = useToastStore()
const toasts = computed(() => store.toasts)

function toastStyle(type: string) {
  switch (type) {
    case 'success': return 'background: var(--color-success, #10B981); color: white'
    case 'error': return 'background: var(--color-error, #EF4444); color: white'
    default: return 'background: var(--color-surface); color: var(--color-text)'
  }
}
</script>
