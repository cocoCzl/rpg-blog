<template>
  <div class="glass-card p-6 space-y-4">
    <h2 class="text-lg font-bold" style="font-family: var(--font-heading); color: var(--color-text)">Skill Tree</h2>
    <div class="space-y-2">
      <div v-for="skill in skills" :key="skill.key" class="flex items-center justify-between p-2 rounded-lg" style="background: var(--color-crystal-glass, rgba(255,255,255,0.05))">
        <div>
          <p class="text-sm font-medium" style="color: var(--color-text)">{{ skill.name }}</p>
          <p class="text-xs" style="color: var(--color-text-secondary)">{{ skill.description }}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full" :style="isUnlocked(skill.key) ? 'background: var(--color-primary); color: var(--color-bg)' : 'background: var(--color-surface); color: var(--color-text-secondary)'">
          {{ isUnlocked(skill.key) ? 'Lv.' + skill.level : 'Locked' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import skillsData from '../../../data/rpg/skills'
import type { RpgSkillState } from '../../lib/rpg-state-types'

const props = defineProps<{
  unlockedSkills: RpgSkillState[]
}>()

const unlockedSet = new Set((props.unlockedSkills ?? []).filter((s) => s.unlocked).map((s) => s.skill_key))
const skills = skillsData

function isUnlocked(key: string) {
  return unlockedSet.has(key)
}
</script>
