import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserState {
  type: 'anonymous' | 'github' | 'admin'
  username?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserState>({ type: 'anonymous' })

  async function fetchUser() {
    try {
      const resp = await fetch('/api/auth/me')
      user.value = await resp.json()
      return user.value
    } catch {
      user.value = { type: 'anonymous' }
      return user.value
    }
  }

  async function login(username: string, password: string) {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.error || 'Login failed')
    await fetchUser()
  }

  async function logout() {
    await fetch('/api/auth/logout')
    user.value = { type: 'anonymous' }
  }

  return { user, fetchUser, login, logout }
})
