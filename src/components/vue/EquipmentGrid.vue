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
import type { RpgEquipmentState } from '../../lib/rpg-state-types'

const props = defineProps<{
  equipmentState: RpgEquipmentState[]
}>()

const equippedSet = new Set((props.equipmentState ?? []).filter((e) => e.equipped).map((e) => e.equipment_key))
const equipment = equipmentData

function isEquipped(key: string) {
  return equippedSet.has(key)
}
</script>
