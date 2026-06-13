export interface Skill {
  key: string
  name: string
  description: string
  icon: string
  level: number
  category: 'combat' | 'magic' | 'crafting' | 'social'
}

export interface Equipment {
  key: string
  name: string
  description: string
  icon: string
  slot: 'weapon' | 'armor' | 'accessory'
  stats: {
    attack?: number
    defense?: number
    magic?: number
    speed?: number
  }
}

export interface Title {
  key: string
  name: string
  description: string
  requirement: string
}

export interface Quest {
  key: string
  name: string
  description: string
  objective: string
  target: number
  reward: {
    experience: number
    title?: string
    skill?: string
    equipment?: string
  }
}
