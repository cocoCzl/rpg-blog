<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">Equipment</h2>
    <div class="grid grid-cols-1 gap-2">
      <div v-for="item in equipment" :key="item.key" class="flex items-center justify-between p-2 rounded-lg" style="background: var(--color-crystal-glass, rgba(255,255,255,0.05))">
        <div>
          <p class="text-sm font-medium" style="color: var(--color-text)">{{ item.name }}</p>
          <p class="text-xs" style="color: var(--color-text-secondary)">{{ item.description }}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full" :style="isEquipped(item.key) ? 'background: var(--color-accent); color: var(--color-bg)' : 'background: var(--color-surface); color: var(--color-text-secondary)'">
          {{ isEquipped(item.key) ? 'Equipped' : 'Stored' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import equipmentData from '../../../data/rpg/equipment'
import { ref, onMounted } from 'vue'

const equipped = ref<string[]>([])

onMounted(async () => {
  try {
    const resp = await fetch('/api/rpg')
    const data = await resp.json()
    equipped.value = (data.equipment || []).filter((e: any) => e.equipped).map((e: any) => e.equipment_key)
  } catch {}
})

const equipment = equipmentData

function isEquipped(key: string) {
  return equipped.value.includes(key)
}
</script>
