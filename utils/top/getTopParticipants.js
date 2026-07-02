const db = require("../../database/database");

function getTopParticipants(limit = 10) {
  const rows = db.prepare(`
    SELECT members_json
    FROM party_history
  `).all();

  const counter = new Map();

  for (const row of rows) {
    let members = [];

    try {
      members = JSON.parse(row.members_json || "[]");
    } catch {
      members = [];
    }

    for (const member of members) {
      if (!member?.id) continue;

      const betterName =
        member.displayName ||
        member.username ||
        member.name ||
        null;

      const current = counter.get(member.id) || {
        user_id: member.id,
        username: betterName || `Gracz ${member.id}`,
        total: 0
      };

      current.total += 1;

      if (
        betterName &&
        (!current.username || current.username.startsWith("Gracz "))
      ) {
        current.username = betterName;
      }

      counter.set(member.id, current);
    }
  }

  return [...counter.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

module.exports = getTopParticipants;