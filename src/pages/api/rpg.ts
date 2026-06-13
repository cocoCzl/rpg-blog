import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { requireAdmin } from '../../lib/auth'

export const GET: APIRoute = async () => {
  const db = getDb()
  const state = db.prepare('SELECT experience, level, current_title, hp, max_hp, mp, max_mp, atk, def, spd, luk FROM character_state LIMIT 1').get() as any
  const skills = db.prepare('SELECT skill_key, unlocked FROM character_skills').all()
  const equipment = db.prepare('SELECT equipment_key, equipped FROM character_equipment').all()
  const quests = db.prepare('SELECT quest_key, status, progress FROM character_quests').all()
  const titles = db.prepare('SELECT title_key, unlocked FROM character_titles').all()
  const statusEffects = db.prepare('SELECT effect_key, is_active FROM character_status_effects').all()

  return new Response(JSON.stringify({
    state: state || { experience: 0, level: 1, current_title: '', hp: 100, max_hp: 100, mp: 50, max_mp: 50, atk: 10, def: 5, spd: 8, luk: 3 },
    skills,
    equipment,
    quests,
    titles,
    statusEffects,
  }), { headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const body = await request.json()
  const { action, key } = body || {}
  const db = getDb()

  if (action === 'unlock_skill') {
    db.prepare('INSERT OR REPLACE INTO character_skills (skill_key, unlocked, unlocked_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else if (action === 'acquire_equipment') {
    db.prepare('INSERT OR REPLACE INTO character_equipment (equipment_key, equipped, acquired_at) VALUES (?, 0, datetime(\'now\'))').run(key)
  } else if (action === 'equip') {
    db.prepare('UPDATE character_equipment SET equipped = 1 WHERE equipment_key = ?').run(key)
  } else if (action === 'unequip') {
    db.prepare('UPDATE character_equipment SET equipped = 0 WHERE equipment_key = ?').run(key)
  } else if (action === 'unlock_quest') {
    db.prepare('INSERT OR REPLACE INTO character_quests (quest_key, status, progress) VALUES (?, \'active\', 0)').run(key)
  } else if (action === 'complete_quest') {
    db.prepare('UPDATE character_quests SET status = \'completed\', completed_at = datetime(\'now\') WHERE quest_key = ?').run(key)
  } else if (action === 'unlock_title') {
    db.prepare('INSERT OR REPLACE INTO character_titles (title_key, unlocked, unlocked_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else if (action === 'add_experience') {
    const amount = body.amount || 10
    const current = db.prepare('SELECT experience, level FROM character_state WHERE id = 1').get() as any
    const exp = (current?.experience || 0) + amount
    let lvl = current?.level || 1
    while (exp >= lvl * lvl * 100) lvl++
    db.prepare('INSERT OR REPLACE INTO character_state (id, experience, level, current_title, hp, max_hp, mp, max_mp, atk, def, spd, luk, updated_at) VALUES (1, ?, ?, COALESCE((SELECT current_title FROM character_state WHERE id = 1), \'\'), COALESCE((SELECT hp FROM character_state WHERE id = 1), 100), COALESCE((SELECT max_hp FROM character_state WHERE id = 1), 100), COALESCE((SELECT mp FROM character_state WHERE id = 1), 50), COALESCE((SELECT max_mp FROM character_state WHERE id = 1), 50), COALESCE((SELECT atk FROM character_state WHERE id = 1), 10), COALESCE((SELECT def FROM character_state WHERE id = 1), 5), COALESCE((SELECT spd FROM character_state WHERE id = 1), 8), COALESCE((SELECT luk FROM character_state WHERE id = 1), 3), datetime(\'now\'))').run(exp, lvl)
  } else if (action === 'add_status_effect') {
    db.prepare('INSERT OR REPLACE INTO character_status_effects (effect_key, is_active, acquired_at) VALUES (?, 1, datetime(\'now\'))').run(key)
  } else {
    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }))
}
