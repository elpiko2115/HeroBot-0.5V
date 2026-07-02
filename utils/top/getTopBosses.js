const db = require("../../database/database");

function getTopBosses(limit = 10) {
  return db.prepare(`
    SELECT boss_name, COUNT(*) AS total
    FROM party_history
    GROUP BY boss_name
    ORDER BY total DESC
    LIMIT ?
  `).all(limit);
}

module.exports = getTopBosses;