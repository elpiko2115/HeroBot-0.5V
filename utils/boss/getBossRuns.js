const db = require("../../database/database");

function getBossRuns(bossName) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM party_history
    WHERE boss_name = ?
  `).get(bossName);

  return row?.total || 0;
}

module.exports = getBossRuns;