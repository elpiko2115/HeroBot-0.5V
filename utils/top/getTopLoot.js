const db = require("../../database/database");

function getTopLoot(limit = 10) {
  return db.prepare(`
    SELECT winner_id AS user_id, winner_name AS username, COUNT(*) AS total
    FROM loot_history
    GROUP BY winner_id
    ORDER BY total DESC
    LIMIT ?
  `).all(limit);
}

module.exports = getTopLoot;