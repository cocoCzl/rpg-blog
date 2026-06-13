<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">Upload Image</h2>
    <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleUpload" ref="fileInput" class="text-sm" style="color: var(--color-text-secondary)" />
    <p v-if="message" class="text-sm" :class="messageType === 'success' ? '' : ''" :style="messageType === 'success' ? 'color: #10B981' : 'color: #EF4444'">{{ message }}</p>
    <div v-if="url" class="space-y-2">
      <img :src="url" class="max-w-xs rounded-lg" />
      <p class="text-xs" style="color: var(--color-text-secondary)">Copy this path for your Markdown:</p>
      <code class="block p-2 rounded text-xs break-all" style="background: var(--color-crystal-glass)">{{ url }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement>()
const url = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  message.value = 'Uploading...'
  messageType.value = 'success'

  try {
    const resp = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await resp.json()
    if (resp.ok) {
      url.value = data.url
      message.value = `Uploaded as ${data.filename}`
      messageType.value = 'success'
    } else {
      message.value = data.error || 'Upload failed'
      messageType.value = 'error'
    }
  } catch {
    message.value = 'Network error'
    messageType.value = 'error'
  }
}
</script>
