const db = require("../../database/database");

function getLastBossLoot(bossName) {
  return db.prepare(`
    SELECT *
    FROM loot_history
    WHERE boss_name = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(bossName) || null;
}

module.exports = getLastBossLoot;