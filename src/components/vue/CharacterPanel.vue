<template>
  <div class="glass-card p-5 space-y-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg" style="background: var(--color-primary); color: var(--color-bg)">
        {{ level }}
      </div>
      <div>
        <h3 class="font-bold" style="font-family: var(--font-heading); color: var(--color-text)">Character</h3>
        <p class="text-xs" style="color: var(--color-text-secondary)">Lv.{{ level }} · {{ currentTitle || 'Novice' }}</p>
      </div>
    </div>

    <div>
      <div class="flex justify-between text-xs mb-1" style="color: var(--color-text-secondary)">
        <span>EXP</span>
        <span>{{ experience }} / {{ nextLevelExp }}</span>
      </div>
      <div class="w-full h-2 rounded-full overflow-hidden" style="background: var(--color-crystal-glass, rgba(255,255,255,0.08))">
        <div class="h-full rounded-full transition-all duration-300" style="background: var(--color-primary); width: `${expPercent}%`">
        </div>
      </div>
    </div>

    <div v-if="skills.length" class="space-y-1">
      <p class="text-xs font-medium" style="color: var(--color-text-secondary)">Skills</p>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="s in skills" :key="s.skill_key" class="px-2 py-0.5 rounded text-xs" style="background: var(--color-accent); color: var(--color-bg)">
          {{ s.skill_key }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const experience = ref(0)
const level = ref(1)
const currentTitle = ref('')
const skills = ref<any[]>([])
const titles = ref<any[]>([])

const nextLevelExp = computed(() => level.value * level.value * 100)
const expPercent = computed(() => Math.min(100, Math.round((experience.value / nextLevelExp.value) * 100)))

onMounted(async () => {
  try {
    const resp = await fetch('/api/rpg')
    const data = await resp.json()
    if (data.state) {
      experience.value = data.state.experience || 0
      level.value = data.state.level || 1
      currentTitle.value = data.state.current_title || ''
    }
    skills.value = (data.skills || []).filter((s: any) => s.unlocked)
    titles.value = (data.titles || []).filter((t: any) => t.unlocked)
  } catch {}
})
</script>
