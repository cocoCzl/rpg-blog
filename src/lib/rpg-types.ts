export interface Skill {
  key: string
  name: string
  nameZh?: string
  description: string
  descriptionZh?: string
  icon: string
  level: number
  category: 'Active' | 'Passive'
  sortOrder?: number
}

export interface Equipment {
  key: string
  name: string
  nameZh?: string
  description: string
  descriptionZh?: string
  icon: string
  slot: EquipmentSlot
  level?: number
}

export type EquipmentSlot = 'WEAPON' | 'SUB_WEAPON' | 'HEAD' | 'BODY' | 'ACCESSORY_1' | 'ACCESSORY_2' | 'PET' | 'MOUNT'

export const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string }[] = [
  { slot: 'WEAPON', label: 'Weapon' },
  { slot: 'SUB_WEAPON', label: 'Sub Weapon' },
  { slot: 'HEAD', label: 'Head' },
  { slot: 'BODY', label: 'Body' },
  { slot: 'ACCESSORY_1', label: 'Accessory 1' },
  { slot: 'ACCESSORY_2', label: 'Accessory 2' },
  { slot: 'PET', label: 'Pet' },
  { slot: 'MOUNT', label: 'Mount' },
]

export interface Title {
  key: string
  name: string
  description: string
  requirement: string
}

export interface Quest {
  key: string
  name: string
  nameZh?: string
  description: string
  descriptionZh?: string
  objective: string
  objectiveZh?: string
  target: number
  questType?: string
  difficulty?: number
  reward: {
    experience: number
    title?: string
    skill?: string
    equipment?: string
  }
}

export interface CharacterAttributes {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  atk: number
  def: number
  spd: number
  luk: number
}

export const ATTRIBUTE_LABELS: Record<string, { label: string; realLabel: string; color: string }> = {
  hp: { label: 'HP', realLabel: '生命力', color: '#FF6B6B' },
  mp: { label: 'MP', realLabel: '创造力', color: '#74B9FF' },
  atk: { label: 'ATK', realLabel: '编码攻击', color: '#FFB7C5' },
  def: { label: 'DEF', realLabel: '调试防御', color: '#A8E6CF' },
  spd: { label: 'SPD', realLabel: '部署速度', color: '#FFEAA7' },
  luk: { label: 'LUK', realLabel: '面试运气', color: '#C3B1E1' },
}

export interface StatusEffect {
  key: string
  name: string
  nameZh?: string
  description: string
  descriptionZh?: string
  effectType: 'BUFF' | 'DEBUFF' | 'NEUTRAL'
  icon: string
  color: string
  isActive: boolean
}
