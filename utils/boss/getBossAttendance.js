const db = require("../../database/database");

function getBossAttendance(bossName) {
  const row = db.prepare(`
    SELECT AVG(members_count) AS average
    FROM party_history
    WHERE boss_name = ?
  `).get(bossName);

  return row?.average ? Number(row.average).toFixed(1) : "0.0";
}

module.exports = getBossAttendance;