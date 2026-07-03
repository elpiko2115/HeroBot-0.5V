const db = require("../../database/database");

function getBossTopWinner(bossName) {
  return db.prepare(`
    SELECT winner_name, COUNT(*) AS total
    FROM loot_history
    WHERE boss_name = ?
    GROUP BY winner_name
    ORDER BY total DESC
    LIMIT 1
  `).get(bossName) || null;
}

module.exports = getBossTopWinner;