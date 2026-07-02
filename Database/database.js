const Database = require("better-sqlite3");

const db = new Database("database/herobot.sqlite");

db.exec(`
CREATE TABLE IF NOT EXISTS parties (
  message_id TEXT PRIMARY KEY,
  channel_id TEXT,
  boss_name TEXT NOT NULL,
  boss_emoji TEXT,
  level TEXT,
  map TEXT,
  color INTEGER,
  owner_id TEXT NOT NULL,
  owner_class_name TEXT,
  owner_class_emoji TEXT,
  time TEXT NOT NULL,
  start_at INTEGER,
  slots INTEGER NOT NULL,
  description TEXT,
  closed INTEGER DEFAULT 0,
  reminded INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS party_members (
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_name TEXT,
  class_emoji TEXT,
  PRIMARY KEY (message_id, user_id)
);

CREATE TABLE IF NOT EXISTS loot_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  message_id TEXT NOT NULL,

  boss_name TEXT NOT NULL,

  winner_id TEXT NOT NULL,
  winner_name TEXT,

  owner_id TEXT NOT NULL,

  members_json TEXT NOT NULL,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS party_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  boss_name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_name TEXT,
  members_json TEXT NOT NULL,
  members_count INTEGER NOT NULL,
  slots INTEGER NOT NULL,
  time TEXT,
  closed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_state (
  key TEXT PRIMARY KEY,
  value TEXT

  );
`);

function addColumn(columnSql) {
  try {
    db.prepare(columnSql).run();
  } catch (error) {
    // kolumna już istnieje
  }
}

addColumn("ALTER TABLE parties ADD COLUMN channel_id TEXT");
addColumn("ALTER TABLE parties ADD COLUMN start_at INTEGER");
addColumn("ALTER TABLE parties ADD COLUMN reminded INTEGER DEFAULT 0");

module.exports = db;