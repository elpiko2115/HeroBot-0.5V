const db = require("../../database/database");

function getClanRuns(days) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM party_history
    WHERE closed_at >= datetime('now', ?)
  `).get(`-${days} days`);

  return row?.total || 0;
}

module.exports = getClanRuns;