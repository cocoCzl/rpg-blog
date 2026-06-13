import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'data/rpg-blog.db')

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    ensureDir(DB_PATH)
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_slug TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL DEFAULT '',
      author_github_id TEXT NOT NULL,
      body TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      current_title TEXT DEFAULT '',
      hp INTEGER NOT NULL DEFAULT 100,
      max_hp INTEGER NOT NULL DEFAULT 100,
      mp INTEGER NOT NULL DEFAULT 50,
      max_mp INTEGER NOT NULL DEFAULT 50,
      atk INTEGER NOT NULL DEFAULT 10,
      def INTEGER NOT NULL DEFAULT 5,
      spd INTEGER NOT NULL DEFAULT 8,
      luk INTEGER NOT NULL DEFAULT 3,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_status_effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      effect_key TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      acquired_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_key TEXT NOT NULL UNIQUE,
      unlocked INTEGER NOT NULL DEFAULT 0,
      unlocked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS character_equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_key TEXT NOT NULL UNIQUE,
      equipped INTEGER NOT NULL DEFAULT 0,
      acquired_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quest_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'locked',
      progress INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS character_titles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_key TEXT NOT NULL UNIQUE,
      unlocked INTEGER NOT NULL DEFAULT 0,
      unlocked_at TEXT
    );
  `)
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
