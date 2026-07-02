const db = require("../database/database");

function saveLootResult({ messageId, bossName, winner, ownerId, members }) {
  db.prepare(`
    INSERT INTO loot_history (
      message_id,
      boss_name,
      winner_id,
      winner_name,
      owner_id,
      members_json
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    messageId,
    bossName,
    winner.id,
    winner.displayName || winner.username || winner.id,
    ownerId,
    JSON.stringify(members)
  );
}

function hasLootResult(messageId) {
  const result = db.prepare(`
    SELECT id
    FROM loot_history
    WHERE message_id = ?
    LIMIT 1
  `).get(messageId);

  return !!result;
}

function getLastLoots(limit = 10) {
  return db.prepare(`
    SELECT *
    FROM loot_history
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  saveLootResult,
  hasLootResult,
  getLastLoots
};