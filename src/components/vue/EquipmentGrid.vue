<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">{{ copy.title }}</h2>
    <div class="grid grid-cols-1 gap-2">
      <div v-for="item in equipment" :key="item.key" class="flex items-center justify-between p-2 rounded-lg" style="background: var(--color-crystal-glass, rgba(255,255,255,0.05))">
        <div>
          <p class="text-sm font-medium" style="color: var(--color-text)">{{ item.name }}</p>
          <p class="text-xs" style="color: var(--color-text-secondary)">{{ item.description }}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full" :style="isEquipped(item.key) ? 'background: var(--color-accent); color: var(--color-bg)' : 'background: var(--color-surface); color: var(--color-text-secondary)'">
          {{ isEquipped(item.key) ? copy.equipped : copy.stored }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import equipmentData from '../../../data/rpg/equipment'
import type { RpgEquipmentState } from '../../lib/rpg-state-types'
import { t } from '../../lib/i18n'

const props = defineProps<{
  equipmentState: RpgEquipmentState[]
  locale?: 'en' | 'zh'
}>()

const locale = props.locale ?? 'en'
const equippedSet = new Set((props.equipmentState ?? []).filter((e) => e.equipped).map((e) => e.equipment_key))
const equipment = equipmentData.map((item) => ({
  ...item,
  name: locale === 'zh' ? item.nameZh || item.name : item.name,
  description: locale === 'zh' ? item.descriptionZh || item.description : item.description,
}))
const copy = {
  title: t('rpg.equipment', locale),
  equipped: t('rpg.equipped', locale),
  stored: t('rpg.stored', locale),
}

function isEquipped(key: string) {
  return equippedSet.has(key)
}
</script>
