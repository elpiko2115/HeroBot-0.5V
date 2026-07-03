const db = require("../../database/database");

function getBossOrganizer(bossName) {
  const row = db.prepare(`
    SELECT owner_name, COUNT(*) AS total
    FROM party_history
    WHERE boss_name = ?
    GROUP BY owner_name
    ORDER BY total DESC
    LIMIT 1
  `).get(bossName);

  return row || null;
}

module.exports = getBossOrganizer;