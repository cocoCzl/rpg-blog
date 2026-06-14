import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { requireAdmin } from '../../lib/auth'
import { DEFAULT_RPG_STATE, type RpgState, type RpgSkillState, type RpgEquipmentState, type RpgQuestState, type RpgTitleState, type RpgStatusEffectState } from '../../lib/rpg-state-types'
import skillData from '../../../data/rpg/skills'
import equipmentData from '../../../data/rpg/equipment'
import questData from '../../../data/rpg/quests'
import titleData from '../../../data/rpg/titles'
import effectsData from '../../../data/rpg/status-effects'

const JSON_HEADER = { 'Content-Type': 'application/json' }

const VALID_KEYS = {
  skills: new Set(skillData.map((s: any) => s.key)),
  equipment: new Set(equipmentData.map((e: any) => e.key)),
  quests: new Set(questData.map((q: any) => q.key)),
  titles: new Set(titleData.map((t: any) => t.key)),
  effects: new Set(effectsData.map((e: any) => e.key)),
}

export const GET: APIRoute = async () => {
  const db = getDb()
  const state = db.prepare('SELECT experience, level, current_title, hp, max_hp, mp, max_mp, atk, def, spd, luk FROM character_state LIMIT 1').get() as RpgState | undefined
  const skills = db.prepare('SELECT skill_key, unlocked FROM character_skills').all() as RpgSkillState[]
  const equipment = db.prepare('SELECT equipment_key, equipped FROM character_equipment').all() as RpgEquipmentState[]
  const quests = db.prepare('SELECT quest_key, status, progress FROM character_quests').all() as RpgQuestState[]
  const titles = db.prepare('SELECT title_key, unlocked FROM character_titles').all() as RpgTitleState[]
  const statusEffects = db.prepare('SELECT effect_key, is_active FROM character_status_effects').all() as RpgStatusEffectState[]

  return new Response(JSON.stringify({
    state: state || DEFAULT_RPG_STATE,
    skills,
    equipment,
    quests,
    titles,
    statusEffects,
  }), { headers: { ...JSON_HEADER, 'Cache-Control': 'public, max-age=60, s-maxage=300' } })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: JSON_HEADER })
  }

  let body: { action?: string; key?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: JSON_HEADER })
  }
  const { action, key } = body || {}
  const db = getDb()

  function err(msg: string) {
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: JSON_HEADER })
  }

  if (action === 'unlock_skill') {
    if (!VALID_KEYS.skills.has(key)) return err('Invalid skill key')
    db.prepare('INSERT OR REPLACE INTO character_skills (skill_key, unlocked, unlocked_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else if (action === 'acquire_equipment') {
    if (!VALID_KEYS.equipment.has(key)) return err('Invalid equipment key')
    db.prepare('INSERT OR REPLACE INTO character_equipment (equipment_key, equipped, acquired_at) VALUES (?, 0, datetime(\'now\'))').run(key)
  } else if (action === 'equip') {
    if (!VALID_KEYS.equipment.has(key)) return err('Invalid equipment key')
    const r = db.prepare('UPDATE character_equipment SET equipped = 1 WHERE equipment_key = ?').run(key)
    if (r.changes === 0) return err('Equipment not acquired')
  } else if (action === 'unequip') {
    if (!VALID_KEYS.equipment.has(key)) return err('Invalid equipment key')
    const r = db.prepare('UPDATE character_equipment SET equipped = 0 WHERE equipment_key = ?').run(key)
    if (r.changes === 0) return err('Equipment not found')
  } else if (action === 'unlock_quest') {
    if (!VALID_KEYS.quests.has(key)) return err('Invalid quest key')
    db.prepare('INSERT OR REPLACE INTO character_quests (quest_key, status, progress) VALUES (?, \'active\', 0)').run(key)
  } else if (action === 'complete_quest') {
    if (!VALID_KEYS.quests.has(key)) return err('Invalid quest key')
    const r = db.prepare('UPDATE character_quests SET status = \'completed\', completed_at = datetime(\'now\') WHERE quest_key = ?').run(key)
    if (r.changes === 0) return err('Quest not unlocked')
  } else if (action === 'unlock_title') {
    if (!VALID_KEYS.titles.has(key)) return err('Invalid title key')
    db.prepare('INSERT OR REPLACE INTO character_titles (title_key, unlocked, unlocked_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else if (action === 'add_experience') {
    const amount = Number(body.amount) || 0
    if (amount <= 0 || amount > 10000) return err('Experience amount must be between 1 and 10000')
    const upsert = db.transaction(() => {
      const current = db.prepare('SELECT id, experience, level, current_title, hp, max_hp, mp, max_mp, atk, def, spd, luk FROM character_state WHERE id = 1').get() as any
      if (!current) {
        db.prepare('INSERT INTO character_state (id, experience, level, hp, max_hp, mp, max_mp, atk, def, spd, luk, updated_at) VALUES (1, ?, 1, 100, 100, 50, 50, 10, 5, 8, 3, datetime(\'now\'))').run(amount)
        return
      }
      const exp = Math.min(current.experience + amount, Number.MAX_SAFE_INTEGER)
      let lvl = current.level
      while (exp >= lvl * lvl * 100 && lvl < 10000) lvl++
      db.prepare('UPDATE character_state SET experience = ?, level = ?, updated_at = datetime(\'now\') WHERE id = 1').run(exp, lvl)
    })
    upsert()
  } else if (action === 'add_status_effect') {
    if (!VALID_KEYS.effects.has(key)) return err('Invalid status effect key')
    db.prepare('INSERT OR REPLACE INTO character_status_effects (effect_key, is_active, acquired_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else {
    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: JSON_HEADER })
  }

  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADER })
}
