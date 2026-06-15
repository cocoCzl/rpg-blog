<template>
  <div class="space-y-4">
    <div v-if="loading">{{ copy.loading }}</div>
    <p v-else-if="error" class="text-sm" style="color: var(--color-error, #EF4444)">{{ error }}</p>
    <div v-else>
      <div v-if="comments.length === 0" class="text-sm" style="color: var(--color-text-secondary)">
        {{ copy.empty }}
      </div>
      <div v-for="c in comments" :key="c.id" class="glass-card p-4 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img v-if="c.author_avatar" :src="c.author_avatar" class="w-5 h-5 rounded-full" :alt="`${c.author_name}'s avatar`" />
            <span class="text-sm font-medium">{{ c.author_name }}</span>
            <span class="text-xs" style="color: var(--color-text-secondary)">
              {{ copy.onPost }} {{ c.article_slug }} · {{ new Date(c.created_at).toLocaleDateString(dateLocale) }}
            </span>
          </div>
          <span v-if="c.approved" class="text-xs px-2 py-0.5 rounded-full" style="background: var(--color-success, #10B98120); color: var(--color-success, #10B981)">{{ copy.approved }}</span>
          <span v-else class="text-xs px-2 py-0.5 rounded-full" style="background: var(--color-warning, #F59E0B20); color: var(--color-warning, #F59E0B)">{{ copy.pending }}</span>
        </div>
        <p class="text-sm" style="color: var(--color-text)">{{ c.body }}</p>
        <div v-if="!c.approved" class="flex gap-2">
          <button @click="moderate(c.id, 'approve')" class="px-3 py-1 rounded text-xs font-medium" style="background: var(--color-success, #10B981); color: white" :aria-label="`${copy.approve} ${c.author_name}`">{{ copy.approve }}</button>
          <button @click="moderate(c.id, 'reject')" class="px-3 py-1 rounded text-xs font-medium" style="background: var(--color-error, #EF4444); color: white" :aria-label="`${copy.reject} ${c.author_name}`">{{ copy.reject }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCookie } from '../../lib/client-cookie'
import type { Comment } from '../../lib/types'
import { t } from '../../lib/i18n'

const props = defineProps<{
  locale?: 'en' | 'zh'
}>()

const comments = ref<Comment[]>([])
const loading = ref(true)
const activeLocale = props.locale ?? 'en'
const dateLocale = activeLocale === 'zh' ? 'zh-CN' : 'en-US'
const copy = {
  loading: t('system.loading', activeLocale),
  empty: t('comment.moderation_empty', activeLocale),
  onPost: t('comment.on_post', activeLocale),
  approved: t('admin.approved', activeLocale),
  pending: t('admin.pending', activeLocale),
  approve: t('admin.approve', activeLocale),
  reject: t('admin.reject', activeLocale),
  loadFailed: t('admin.load_failed', activeLocale),
  actionFailed: t('admin.action_failed', activeLocale),
}
const errorByCode: Record<string, string> = {
  FORBIDDEN: t('api.forbidden', activeLocale),
  ID_ACTION_REQUIRED: t('api.id_action_required', activeLocale),
}
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const resp = await fetch('/api/admin/comments')
    if (!resp.ok) {
      const data = await resp.json()
      throw new Error(errorByCode[data.code] || data.error || copy.loadFailed)
    }
    comments.value = await resp.json()
  } catch (err) {
    comments.value = []
    error.value = err instanceof Error ? err.message : copy.loadFailed
  }
  loading.value = false
}

async function moderate(id: number, action: string) {
  const csrfToken = getCookie('csrf_token')
  const resp = await fetch('/api/admin/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken || '',
    },
    body: JSON.stringify({ id, action }),
  })
  if (!resp.ok) {
    const data = await resp.json()
    error.value = errorByCode[data.code] || data.error || copy.actionFailed
    return
  }
  await load()
}

onMounted(load)
</script>
