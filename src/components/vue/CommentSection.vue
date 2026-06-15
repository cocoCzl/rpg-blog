<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold" style="font-family: var(--font-heading); color: var(--color-text)">
      {{ copy.title }} ({{ comments.length }})
    </h3>

    <div v-if="githubUser" class="glass-card p-4 space-y-3">
      <textarea
        v-model="newComment"
        :placeholder="copy.placeholder"
        rows="3"
        maxlength="5000"
        class="w-full px-3 py-2 rounded-lg text-sm resize-none"
        style="background: var(--color-crystal-glass, rgba(255,255,255,0.08)); border: 1px solid var(--color-crystal-border, rgba(255,255,255,0.1)); color: var(--color-text)"
        aria-label="Write a comment"
        aria-describedby="comment-status"
      />
      <div class="flex justify-between items-center">
        <span class="text-xs" style="color: var(--color-text-secondary)" id="comment-status">
          {{ copy.commentingAs }} {{ githubUser.login }} · {{ 5000 - newComment.length }} {{ copy.charsRemaining }}
        </span>
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style="background: var(--color-primary); color: var(--color-bg)"
        >
          {{ submitting ? copy.posting : copy.post }}
        </button>
      </div>
    </div>

    <div v-else class="text-sm" style="color: var(--color-text-secondary)">
      <a :href="loginHref" class="hover:underline" style="color: var(--color-primary)">
        {{ copy.login }}
      </a>
      {{ copy.loginSuffix }}
    </div>

    <div v-if="comments.length === 0" class="text-sm" style="color: var(--color-text-secondary)">
      {{ copy.noComments }}
    </div>

    <div v-for="comment in comments" :key="comment.id" class="glass-card p-4 space-y-2">
      <div class="flex items-center gap-2">
        <img v-if="comment.author_avatar" :src="comment.author_avatar" :alt="`${comment.author_name}'s avatar`" class="w-6 h-6 rounded-full" />
        <span class="text-sm font-medium" style="color: var(--color-text)">{{ comment.author_name }}</span>
        <span class="text-xs" style="color: var(--color-text-secondary)">{{ formatDate(comment.created_at) }}</span>
      </div>
      <p class="text-sm leading-relaxed" style="color: var(--color-text)">{{ comment.body }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { CommentDisplay } from '../../lib/types'
import { t } from '../../lib/i18n'
import { useToastStore } from '../../stores/toast'
import { buildGithubLoginHref } from '../../lib/client-auth'

const props = defineProps<{
  articleSlug: string
  locale?: 'en' | 'zh'
}>()
const locale = props.locale ?? 'en'

interface GithubUser {
  login: string
  avatar_url: string
  id: number
}

const comments = ref<CommentDisplay[]>([])
const totalPages = ref(1)
const currentPage = ref(1)
const githubUser = ref<GithubUser | null>(null)
const newComment = ref('')
const submitting = ref(false)
const loginHref = buildGithubLoginHref(`/posts/${props.articleSlug}`)
const toastStore = useToastStore()
const copy = {
  title: t('comment.title', locale),
  placeholder: t('comment.placeholder', locale),
  commentingAs: t('comment.commenting_as', locale),
  charsRemaining: t('comment.chars_remaining', locale),
  post: t('comment.post', locale),
  posting: t('comment.posting', locale),
  login: t('comment.login', locale),
  loginSuffix: locale === 'zh' ? '后即可发表评论。' : 'to leave a comment.',
  noComments: t('comment.no_comments', locale),
  posted: t('comment.posted', locale),
  submitFailed: t('comment.submit_failed', locale),
  networkError: t('comment.network_error', locale),
}
const errorByCode: Record<string, string> = {
  LOGIN_REQUIRED: t('api.login_required', locale),
  SESSION_EXPIRED: t('api.session_expired', locale),
  COMMENT_FIELDS_REQUIRED: t('api.comment_fields_required', locale),
  COMMENT_TOO_LONG: t('api.comment_too_long', locale),
  INVALID_USER_DATA: t('api.invalid_user_data', locale),
  GITHUB_COMMENTS_DISABLED: t('api.github_comments_disabled', locale),
}

onMounted(async () => {
  const [commentsResp, meResp] = await Promise.all([
    fetch(`/api/comments?article_slug=${props.articleSlug}`),
    fetch('/api/auth/me'),
  ])
  const data = await commentsResp.json()
  comments.value = data.comments || []
  totalPages.value = data.totalPages || 1
  currentPage.value = data.page || 1

  const meData = await meResp.json()
  if (meData.type === 'github') {
    githubUser.value = { login: meData.username, avatar_url: meData.avatar, id: meData.id ?? 0 } as GithubUser
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
    const data = await resp.json()
    if (resp.ok) {
      const newCommentBody = newComment.value.trim()
      newComment.value = ''
      if (githubUser.value) {
        comments.value.unshift({
          id: -Date.now(),
          author_name: githubUser.value.login,
          author_avatar: githubUser.value.avatar_url,
          body: newCommentBody,
          created_at: new Date().toISOString(),
        })
      }
      toastStore.success(copy.posted)
    } else {
      toastStore.error(errorByCode[data.code] || data.error || copy.submitFailed)
    }
  } catch {
    toastStore.error(copy.networkError)
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
}
</script>
