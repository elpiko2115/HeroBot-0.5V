const db = require("../../database/database");

function getClanTopParticipant(days = 30) {
  const rows = db.prepare(`
    SELECT members_json
    FROM party_history
    WHERE closed_at >= datetime('now', ?)
  `).all(`-${days} days`);

  const counter = new Map();

  for (const row of rows) {
    const members = JSON.parse(row.members_json || "[]");

    for (const member of members) {
      const name = member.displayName || member.username || member.id || "Nieznany";
      counter.set(name, (counter.get(name) || 0) + 1);
    }
  }

  const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  return {
    player_name: sorted[0][0],
    total: sorted[0][1]
  };
}

module.exports = getClanTopParticipant;