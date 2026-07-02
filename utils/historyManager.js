const db = require("../database/database");

function savePartyHistory(party) {
  db.prepare(`
    INSERT INTO party_history (
      message_id,
      boss_name,
      owner_id,
      owner_name,
      members_json,
      members_count,
      slots,
      time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    party.messageId,
    party.bossName,
    party.owner.id,
    party.owner.displayName || party.owner.username || party.owner.id,
    JSON.stringify(party.members || []),
    (party.members || []).length,
    party.slots,
    party.time
  );
}

function getLastParties(limit = 10) {
  return db.prepare(`
    SELECT *
    FROM party_history
    ORDER BY closed_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  savePartyHistory,
  getLastParties
};