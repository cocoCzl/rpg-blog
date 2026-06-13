<template>
  <div class="space-y-4">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="comments.length === 0" class="text-sm" style="color: var(--color-text-secondary)">
        No comments to review.
      </div>
      <div v-for="c in comments" :key="c.id" class="glass-card p-4 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img v-if="c.author_avatar" :src="c.author_avatar" class="w-5 h-5 rounded-full" />
            <span class="text-sm font-medium">{{ c.author_name }}</span>
            <span class="text-xs" style="color: var(--color-text-secondary)">
              on {{ c.article_slug }} · {{ new Date(c.created_at).toLocaleDateString() }}
            </span>
          </div>
          <span v-if="c.approved" class="text-xs px-2 py-0.5 rounded-full" style="background: #10B98120; color: #10B981">Approved</span>
          <span v-else class="text-xs px-2 py-0.5 rounded-full" style="background: #F59E0B20; color: #F59E0B">Pending</span>
        </div>
        <p class="text-sm" style="color: var(--color-text)">{{ c.body }}</p>
        <div v-if="!c.approved" class="flex gap-2">
          <button @click="moderate(c.id, 'approve')" class="px-3 py-1 rounded text-xs font-medium" style="background: #10B981; color: white">Approve</button>
          <button @click="moderate(c.id, 'reject')" class="px-3 py-1 rounded text-xs font-medium" style="background: #EF4444; color: white">Reject</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCookie } from '../../lib/client-cookie'

interface Comment {
  id: number
  article_slug: string
  author_name: string
  author_avatar: string
  body: string
  approved: number
  created_at: string
}

const comments = ref<Comment[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  comments.value = await fetch('/api/admin/comments').then(r => r.json())
  loading.value = false
}

async function moderate(id: number, action: string) {
  const csrfToken = getCookie('csrf_token')
  await fetch('/api/admin/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken || '',
    },
    body: JSON.stringify({ id, action }),
  })
  await load()
}

onMounted(load)
</script>
