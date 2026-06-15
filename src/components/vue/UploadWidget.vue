<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">{{ copy.title }}</h2>
    <label>
      <span class="block text-sm mb-1" style="color: var(--color-text-secondary)">{{ copy.selectImage }}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleUpload" ref="fileInput" class="text-sm" style="color: var(--color-text-secondary)" aria-describedby="upload-error" />
    </label>
    <p v-if="message" id="upload-error" class="text-sm" :style="{ color: messageType === 'success' ? 'var(--color-success, #10B981)' : 'var(--color-error, #EF4444)' }">{{ message }}</p>
    <div v-if="url" class="space-y-2">
      <img :src="url" class="max-w-xs rounded-lg" :alt="copy.previewAlt" />
      <p class="text-xs" style="color: var(--color-text-secondary)">{{ copy.copyPath }}</p>
      <code class="block p-2 rounded text-xs break-all" style="background: var(--color-crystal-glass)">{{ url }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getCookie } from '../../lib/client-cookie'
import { t } from '../../lib/i18n'

const props = defineProps<{
  locale?: 'en' | 'zh'
}>()
const locale = props.locale ?? 'en'
const fileInput = ref<HTMLInputElement>()
const url = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const copy = {
  title: t('upload.title', locale),
  selectImage: t('upload.select_image', locale),
  copyPath: t('upload.copy_path', locale),
  previewAlt: t('upload.preview_alt', locale),
  uploading: t('upload.uploading', locale),
  uploadFailed: t('upload.upload_failed', locale),
  networkError: t('upload.network_error', locale),
  uploadedAs: t('upload.uploaded_as', locale),
  uploadSuccess: t('upload.upload_success', locale),
}
const errorByCode: Record<string, string> = {
  FORBIDDEN: t('api.forbidden', locale),
  NO_FILE: t('api.no_file', locale),
  FILE_TOO_LARGE: t('api.file_too_large', locale),
  FILE_TYPE_INVALID: t('api.file_type_invalid', locale),
  FILE_MAGIC_INVALID: t('api.file_magic_invalid', locale),
  INVALID_FORM_DATA: t('api.invalid_form_data', locale),
}

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  message.value = copy.uploading
  messageType.value = 'success'

  try {
    const csrfToken = getCookie('csrf_token')
    const resp = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: formData,
    })
    const data = await resp.json()
    if (resp.ok) {
      url.value = data.url
      message.value = `${copy.uploadSuccess}: ${data.filename}`
      messageType.value = 'success'
    } else {
      message.value = errorByCode[data.code] || data.error || copy.uploadFailed
      messageType.value = 'error'
    }
  } catch {
    message.value = copy.networkError
    messageType.value = 'error'
  }
}
</script>
