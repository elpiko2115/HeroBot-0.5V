const db = require("../../database/database");

function getTopOrganizers(limit = 10) {
  return db.prepare(`
    SELECT owner_id AS user_id, owner_name AS username, COUNT(*) AS total
    FROM party_history
    GROUP BY owner_id
    ORDER BY total DESC
    LIMIT ?
  `).all(limit);
}

module.exports = getTopOrganizers;