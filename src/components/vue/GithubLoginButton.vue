<template>
  <div class="flex items-center gap-3">
    <template v-if="auth.user.type === 'anonymous'">
      <a
        :href="loginHref"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 flex items-center gap-2"
        style="background: var(--color-surface); color: var(--color-text)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        {{ copy.login }}
      </a>
    </template>
    <template v-else>
      <div class="flex items-center gap-2">
        <img v-if="auth.user.avatar" :src="auth.user.avatar" alt="avatar" class="w-7 h-7 rounded-full border" style="border-color: var(--color-crystal-border, rgba(255,255,255,0.1))" />
        <span class="text-sm" style="color: var(--color-text)">{{ auth.user.username }}</span>
        <button
          @click="logout"
          :disabled="loggingOut"
          class="text-xs hover:underline disabled:opacity-50"
          style="color: var(--color-text-secondary)"
          aria-live="polite"
        >
          {{ loggingOut ? copy.loggingOut : copy.logout }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { t } from '../../lib/i18n'
import { buildGithubLoginHref } from '../../lib/client-auth'

const props = defineProps<{
  locale?: 'en' | 'zh'
}>()
const locale = props.locale ?? 'en'
const auth = useAuthStore()
const loggingOut = ref(false)
const loginHref = ref(buildGithubLoginHref('/'))
const copy = {
  login: t('comment.login', locale),
  logout: t('admin.logout', locale),
  loggingOut: locale === 'zh' ? '退出中...' : 'Logging out...',
}

onMounted(async () => {
  loginHref.value = buildGithubLoginHref(
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  )
  await auth.fetchUser()
})

async function logout() {
  loggingOut.value = true
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {}
  auth.user = { type: 'anonymous' }
  loggingOut.value = false
}
</script>
