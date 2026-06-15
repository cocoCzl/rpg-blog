import type { StatusEffect } from '../../src/lib/rpg-types'

const statusEffects: StatusEffect[] = [
  { key: 'coffee_boost', name: 'Coffee Boost', nameZh: '咖啡增益', description: 'Caffeine-powered focus. Typing speed +20%', descriptionZh: '咖啡因带来专注，输入速度 +20%', effectType: 'BUFF', icon: '☕', color: '#10B981', isActive: true },
  { key: 'burnout', name: 'Burnout', nameZh: '过载疲惫', description: 'Overworked and tired. All stats -10%', descriptionZh: '过度劳累，所有属性 -10%', effectType: 'DEBUFF', icon: '🔥', color: '#EF4444', isActive: false },
  { key: 'full_moon', name: 'Full Moon', nameZh: '满月灵感', description: 'The moonlight inspires creativity. EXP gain +50%', descriptionZh: '月光激发创造力，经验获取 +50%', effectType: 'BUFF', icon: '🌕', color: '#F59E0B', isActive: false },
]

export default statusEffects
