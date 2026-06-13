import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { requireAdmin } from '../../lib/auth'

export const GET: APIRoute = async () => {
  const db = getDb()
  const state = db.prepare('SELECT experience, level, current_title FROM character_state LIMIT 1').get() as any
  const skills = db.prepare('SELECT skill_key, unlocked FROM character_skills').all()
  const equipment = db.prepare('SELECT equipment_key, equipped FROM character_equipment').all()
  const quests = db.prepare('SELECT quest_key, status, progress FROM character_quests').all()
  const titles = db.prepare('SELECT title_key, unlocked FROM character_titles').all()

  return new Response(JSON.stringify({
    state: state || { experience: 0, level: 1, current_title: '' },
    skills,
    equipment,
    quests,
    titles,
  }))
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
    db.prepare('INSERT OR REPLACE INTO character_state (id, experience, level, current_title, updated_at) VALUES (1, COALESCE((SELECT experience FROM character_state WHERE id = 1), 0) + ?, COALESCE((SELECT level FROM character_state WHERE id = 1), 1), COALESCE((SELECT current_title FROM character_state WHERE id = 1), \'\'), datetime(\'now\'))').run(amount)
  } else {
    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }))
}
