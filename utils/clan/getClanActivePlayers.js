const db = require("../../database/database");

function getClanActivePlayers(days = 30) {
  const rows = db.prepare(`
    SELECT members_json
    FROM party_history
    WHERE closed_at >= datetime('now', ?)
  `).all(`-${days} days`);

  const players = new Set();

  for (const row of rows) {
    const members = JSON.parse(row.members_json || "[]");

    for (const member of members) {
      players.add(member.id || member.displayName || member.username);
    }
  }

  return players.size;
}

module.exports = getClanActivePlayers;