const db = require("../../database/database");

function getClanTopOrganizer(days = 30) {
  return db.prepare(`
    SELECT owner_name, COUNT(*) AS total
    FROM party_history
    WHERE closed_at >= datetime('now', ?)
    GROUP BY owner_name
    ORDER BY total DESC
    LIMIT 1
  `).get(`-${days} days`) || null;
}

module.exports = getClanTopOrganizer;