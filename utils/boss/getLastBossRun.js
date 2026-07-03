const db = require("../../database/database");

function getLastBossRun(bossName) {
  const row = db.prepare(`
    SELECT *
    FROM party_history
    WHERE boss_name = ?
    ORDER BY closed_at DESC
    LIMIT 1
  `).get(bossName);

  return row || null;
}

module.exports = getLastBossRun;