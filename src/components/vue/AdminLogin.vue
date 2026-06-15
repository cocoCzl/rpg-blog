<template>
  <div class="min-h-screen flex items-center justify-center" style="background: linear-gradient(to bottom right, var(--color-bg), var(--color-surface))">
    <div class="glass-card p-8 w-full max-w-sm space-y-6">
      <h1 class="text-2xl font-bold text-center" style="font-family: var(--font-heading); color: var(--color-text)">
        {{ copy.title }}
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="admin-username" class="block text-sm mb-1" style="color: var(--color-text-secondary)">{{ copy.username }}</label>
          <input
            id="admin-username"
            v-model="username"
            type="text"
            required
            :aria-describedby="error ? 'login-error' : undefined"
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--color-crystal-glass, rgba(255,255,255,0.08)); border: 1px solid var(--color-crystal-border, rgba(255,255,255,0.1)); color: var(--color-text)"
          />
        </div>

        <div>
          <label for="admin-password" class="block text-sm mb-1" style="color: var(--color-text-secondary)">{{ copy.password }}</label>
          <input
            id="admin-password"
            v-model="password"
            type="password"
            required
            :aria-describedby="error ? 'login-error' : undefined"
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--color-crystal-glass, rgba(255,255,255,0.08)); border: 1px solid var(--color-crystal-border, rgba(255,255,255,0.1)); color: var(--color-text)"
          />
        </div>

        <p v-if="error" id="login-error" class="text-red-400 text-sm" role="alert">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 rounded-lg font-medium text-sm transition-opacity"
          style="background: var(--color-primary); color: var(--color-bg)"
        >
          {{ loading ? copy.loggingIn : copy.login }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../../lib/i18n'

const props = defineProps<{
  locale?: 'en' | 'zh'
}>()
const locale = props.locale ?? 'en'
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const copy = {
  title: t('admin.login', locale),
  username: t('admin.username', locale),
  password: t('admin.password', locale),
  login: t('admin.login', locale),
  loggingIn: t('admin.logging_in', locale),
  loginFailed: t('admin.login_failed', locale),
  networkError: t('admin.network_error', locale),
}
const errorByCode: Record<string, string> = {
  TOO_MANY_ATTEMPTS: t('api.too_many_attempts', locale),
  INVALID_JSON: t('api.invalid_json', locale),
  CREDENTIALS_REQUIRED: t('api.credentials_required', locale),
  INVALID_CREDENTIALS: t('api.invalid_credentials', locale),
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
    const data = await resp.json()
    if (!resp.ok) {
      error.value = errorByCode[data.code] || data.error || copy.loginFailed
      return
    }
    window.location.href = '/admin'
  } catch {
    error.value = copy.networkError
  } finally {
    loading.value = false
  }
}
</script>
