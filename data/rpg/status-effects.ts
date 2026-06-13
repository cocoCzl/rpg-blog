import type { StatusEffect } from '../../src/lib/rpg-types'

const statusEffects: StatusEffect[] = [
  { key: 'coffee_boost', name: 'Coffee Boost', description: 'Caffeine-powered focus. Typing speed +20%', effectType: 'BUFF', icon: '☕', color: '#10B981', isActive: true },
  { key: 'burnout', name: 'Burnout', description: 'Overworked and tired. All stats -10%', effectType: 'DEBUFF', icon: '🔥', color: '#EF4444', isActive: false },
  { key: 'full_moon', name: 'Full Moon', description: 'The moonlight inspires creativity. EXP gain +50%', effectType: 'BUFF', icon: '🌕', color: '#F59E0B', isActive: false },
]

export default statusEffects
