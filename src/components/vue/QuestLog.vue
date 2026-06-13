<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">Quest Log</h2>
    <div class="space-y-2">
      <div v-for="q in quests" :key="q.key" class="p-2 rounded-lg" style="background: var(--color-crystal-glass, rgba(255,255,255,0.05))">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium" style="color: var(--color-text)">{{ q.name }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full" :style="questStatusStyle(q.key)">
            {{ questStatusText(q.key) }}
          </span>
        </div>
        <p class="text-xs mt-1" style="color: var(--color-text-secondary)">{{ q.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import questsData from '../../../data/rpg/quests'
import { ref, onMounted } from 'vue'

const questStates = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const resp = await fetch('/api/rpg')
    const data = await resp.json()
    const map: Record<string, string> = {}
    for (const q of (data.quests || [])) {
      map[q.quest_key] = q.status
    }
    questStates.value = map
  } catch {}
})

const quests = questsData

function questStatusText(key: string) {
  const status = questStates.value[key]
  if (status === 'completed') return 'Done'
  if (status === 'active') return 'Active'
  return 'Locked'
}

function questStatusStyle(key: string) {
  const status = questStates.value[key]
  if (status === 'completed') return 'background: #10B981; color: white'
  if (status === 'active') return 'background: var(--color-primary); color: var(--color-bg)'
  return 'background: var(--color-surface); color: var(--color-text-secondary)'
}
</script>
