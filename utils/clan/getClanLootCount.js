const db = require("../../database/database");

function getClanLootCount(days = 30) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM loot_history
    WHERE created_at >= datetime('now', ?)
  `).get(`-${days} days`);

  return row?.total || 0;
}

module.exports = getClanLootCount;