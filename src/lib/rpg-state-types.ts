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

export const DEFAULT_RPG_STATE: RpgState = {
  experience: 0,
  level: 1,
  current_title: '',
  hp: 100,
  max_hp: 100,
  mp: 50,
  max_mp: 50,
  atk: 10,
  def: 5,
  spd: 8,
  luk: 3,
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
