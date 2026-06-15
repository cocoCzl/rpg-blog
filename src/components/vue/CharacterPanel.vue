<template>
  <div class="glass-card p-5 space-y-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg" style="background: var(--color-primary); color: var(--color-bg)">
        {{ level }}
      </div>
      <div>
        <h3 class="font-bold" style="font-family: var(--font-heading); color: var(--color-text)">{{ copy.character }}</h3>
        <p class="text-xs" style="color: var(--color-text-secondary)">{{ copy.level }}{{ level }} · {{ currentTitle || copy.novice }}</p>
      </div>
    </div>

    <div>
      <div class="flex justify-between text-xs mb-1" style="color: var(--color-text-secondary)">
        <span>{{ copy.exp }}</span>
        <span>{{ experience }} / {{ nextLevelExp }}</span>
      </div>
      <div class="w-full h-2 rounded-full overflow-hidden" style="background: var(--color-crystal-glass, rgba(255,255,255,0.08))">
        <div class="h-full rounded-full transition-all duration-300" :style="{ background: 'var(--color-primary)', width: expPercent + '%' }"></div>
      </div>
    </div>

    <div v-if="unlockedSkills.length" class="space-y-1">
      <p class="text-xs font-medium" style="color: var(--color-text-secondary)">{{ copy.skills }}</p>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="s in unlockedSkills" :key="s.skill_key" class="px-2 py-0.5 rounded text-xs" style="background: var(--color-accent); color: var(--color-bg)">
          {{ skillName(s.skill_key) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RpgState, RpgSkillState } from '../../lib/rpg-state-types'
import { t } from '../../lib/i18n'
import skillsData from '../../../data/rpg/skills'

const props = defineProps<{
  state: RpgState
  skills: RpgSkillState[]
  locale?: 'en' | 'zh'
}>()

const locale = props.locale ?? 'en'
const skillNames = new Map(skillsData.map((skill) => [
  skill.key,
  locale === 'zh' ? skill.nameZh || skill.name : skill.name,
]))
const experience = computed(() => props.state?.experience ?? 0)
const level = computed(() => props.state?.level ?? 1)
const currentTitle = computed(() => props.state?.current_title ?? '')
const unlockedSkills = computed(() => (props.skills ?? []).filter((s) => s.unlocked))
const copy = {
  character: t('rpg.character', locale),
  level: t('rpg.level', locale),
  novice: t('rpg.novice', locale),
  exp: t('rpg.exp', locale),
  skills: t('rpg.skills', locale),
}

const nextLevelExp = computed(() => level.value * level.value * 100)
const expPercent = computed(() => Math.min(100, Math.round((experience.value / nextLevelExp.value) * 100)))

function skillName(key: string) {
  return skillNames.get(key) || key
}
</script>
