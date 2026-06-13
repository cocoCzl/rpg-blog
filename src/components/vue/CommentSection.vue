<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold" style="font-family: var(--font-heading); color: var(--color-text)">
      Comments ({{ comments.length }})
    </h3>

    <div v-if="githubUser" class="glass-card p-4 space-y-3">
      <textarea
        v-model="newComment"
        placeholder="Write a comment..."
        rows="3"
        class="w-full px-3 py-2 rounded-lg text-sm resize-none"
        style="background: var(--color-crystal-glass, rgba(255,255,255,0.08)); border: 1px solid var(--color-crystal-border, rgba(255,255,255,0.1)); color: var(--color-text)"
      />
      <div class="flex justify-between items-center">
        <span class="text-xs" style="color: var(--color-text-secondary)">
          Commenting as {{ githubUser.login }}
        </span>
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style="background: var(--color-primary); color: var(--color-bg)"
        >
          {{ submitting ? 'Posting...' : 'Post' }}
        </button>
      </div>
    </div>

    <div v-else class="text-sm" style="color: var(--color-text-secondary)">
      <a href="/api/auth/github/login" class="hover:underline" style="color: var(--color-primary)">
        Login with GitHub
      </a>
      to leave a comment.
    </div>

    <div v-if="comments.length === 0" class="text-sm" style="color: var(--color-text-secondary)">
      No comments yet. Be the first!
    </div>

    <div v-for="comment in comments" :key="comment.id" class="glass-card p-4 space-y-2">
      <div class="flex items-center gap-2">
        <img v-if="comment.author_avatar" :src="comment.author_avatar" alt="" class="w-6 h-6 rounded-full" />
        <span class="text-sm font-medium" style="color: var(--color-text)">{{ comment.author_name }}</span>
        <span class="text-xs" style="color: var(--color-text-secondary)">{{ formatDate(comment.created_at) }}</span>
      </div>
      <p class="text-sm leading-relaxed" style="color: var(--color-text)">{{ comment.body }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ articleSlug: string }>()

interface Comment {
  id: number
  author_name: string
  author_avatar: string
  body: string
  created_at: string
}

interface GithubUser {
  login: string
  avatar_url: string
  id: number
}

const comments = ref<Comment[]>([])
const githubUser = ref<GithubUser | null>(null)
const newComment = ref('')
const submitting = ref(false)

onMounted(async () => {
  const [commentsResp, meResp] = await Promise.all([
    fetch(`/api/comments?article_slug=${props.articleSlug}`),
    fetch('/api/auth/me'),
  ])
  comments.value = await commentsResp.json()
  const meData = await meResp.json()
  if (meData.type === 'github') {
    // fetch full user data from cookie
    try {
      githubUser.value = JSON.parse(decodeURIComponent(document.cookie.split('; ')
        .find(row => row.startsWith('github_user='))
        ?.split('=')[1] || ''))
    } catch {}
  }
})

async function submitComment() {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    const resp = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_slug: props.articleSlug,
        body: newComment.value.trim(),
      }),
    })
    if (resp.ok) {
      newComment.value = ''
      // Reload comments
      const r = await fetch(`/api/comments?article_slug=${props.articleSlug}`)
      comments.value = await r.json()
    }
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}
</script>
