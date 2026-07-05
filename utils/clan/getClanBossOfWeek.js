const db = require("../../database/database");

function getClanBossOfWeek() {
  return db.prepare(`
    SELECT boss_name, COUNT(*) AS total
    FROM party_history
    WHERE closed_at >= datetime('now','-7 days')
    GROUP BY boss_name
    ORDER BY total DESC
    LIMIT 1
  `).get() || null;
}

module.exports = getClanBossOfWeek;