<template>
  <div class="min-h-screen flex items-center justify-center" style="background: linear-gradient(to bottom right, var(--color-bg), var(--color-surface))">
    <div class="glass-card p-8 w-full max-w-sm space-y-6">
      <h1 class="text-2xl font-bold text-center" style="font-family: var(--font-heading); color: var(--color-text)">
        Admin Login
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="admin-username" class="block text-sm mb-1" style="color: var(--color-text-secondary)">Username</label>
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
          <label for="admin-password" class="block text-sm mb-1" style="color: var(--color-text-secondary)">Password</label>
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
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

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
      error.value = data.error || 'Login failed'
      return
    }
    window.location.href = '/admin'
  } catch {
    error.value = 'Network error'
  } finally {
    loading.value = false
  }
}
</script>
