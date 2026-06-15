<template>
  <div class="space-y-2">
    <h4 class="text-xs font-bold flex items-center gap-2" style="color: var(--color-accent)">
      {{ title }}
    </h4>
    <div v-for="eff in localizedEffects" :key="eff.key" class="flex items-center gap-2 py-1.5 px-2 rounded-lg border text-xs transition-all" :style="{ background: getBg(eff.effectType), borderColor: getBorder(eff.effectType) }">
      <span aria-hidden="true">{{ eff.icon || '✨' }}</span>
      <span class="font-bold flex-shrink-0" :style="{ color: eff.color || getTextColor(eff.effectType) }">{{ eff.name }}</span>
      <span class="opacity-50 truncate">{{ eff.description }}</span>
      <span v-if="eff.isActive" class="ml-auto w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" :style="{ background: eff.color || getTextColor(eff.effectType) }" :aria-label="eff.isActive ? `${eff.name} ${activeEffectSuffix}` : undefined" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatusEffect } from '../../lib/rpg-types'
import { t } from '../../lib/i18n'

const props = defineProps<{
  effects: StatusEffect[]
  locale?: 'en' | 'zh'
}>()
const locale = props.locale ?? 'en'
const localizedEffects = props.effects.map((effect) => ({
  ...effect,
  name: locale === 'zh' ? effect.nameZh || effect.name : effect.name,
  description: locale === 'zh' ? effect.descriptionZh || effect.description : effect.description,
}))
const title = t('rpg.status_effects', locale)
const activeEffectSuffix = t('rpg.active_effect', locale)

function getBg(type: string) {
  return type === 'BUFF' ? 'rgba(16,185,129,0.1)' : type === 'DEBUFF' ? 'rgba(239,68,68,0.1)' : 'rgba(195,177,225,0.1)'
}
function getBorder(type: string) {
  return type === 'BUFF' ? 'rgba(16,185,129,0.2)' : type === 'DEBUFF' ? 'rgba(239,68,68,0.2)' : 'rgba(195,177,225,0.2)'
}
function getTextColor(type: string) {
  return type === 'BUFF' ? 'var(--color-success, #10B981)' : type === 'DEBUFF' ? 'var(--color-error, #EF4444)' : 'var(--color-accent, #C3B1E1)'
}
</script>
