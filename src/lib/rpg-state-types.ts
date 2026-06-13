import type { CharacterAttributes } from './rpg-types'

export interface RpgState {
  experience: number
  level: number
  current_title: string
  hp: number
  max_hp: number
  mp: number
  max_mp: number
  atk: number
  def: number
  spd: number
  luk: number
}

export interface RpgSkillState {
  skill_key: string
  unlocked: number
}

export interface RpgEquipmentState {
  equipment_key: string
  equipped: number
}

export interface RpgQuestState {
  quest_key: string
  status: string
  progress: number
}

export interface RpgTitleState {
  title_key: string
  unlocked: number
}

export interface RpgStatusEffectState {
  effect_key: string
  is_active: number
}

export interface RpgData {
  state: RpgState
  skills: RpgSkillState[]
  equipment: RpgEquipmentState[]
  quests: RpgQuestState[]
  titles: RpgTitleState[]
  statusEffects: RpgStatusEffectState[]
}
