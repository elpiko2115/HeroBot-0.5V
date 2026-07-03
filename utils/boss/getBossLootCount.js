const db = require("../../database/database");

function getBossLootCount(bossName) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM loot_history
    WHERE boss_name = ?
  `).get(bossName);

  return row?.total || 0;
}

module.exports = getBossLootCount;