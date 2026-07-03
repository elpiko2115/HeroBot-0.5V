const db = require("../database/database");

function addToWaitlist(messageId, member) {
const count = db.prepare(`
  SELECT COUNT(*) AS count
  FROM party_waitlist
  WHERE message_id = ?
`).get(messageId)?.count || 0;

  db.prepare(`
    INSERT INTO party_waitlist (
      message_id, user_id, username, display_name, class_name, class_emoji, position
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    messageId,
    member.id,
    member.username || member.displayName || member.id,
    member.displayName || member.username || member.id,
    member.className,
    member.classEmoji,
    count + 1
  );

  return count + 1;
}

function popNextWaitlist(messageId) {
  const next = db.prepare(`
    SELECT *
    FROM party_waitlist
    WHERE message_id = ?
    ORDER BY position ASC
    LIMIT 1
  `).get(messageId);

  if (!next) return null;

  db.prepare(`
    DELETE FROM party_waitlist
    WHERE message_id = ? AND user_id = ?
  `).run(messageId, next.user_id);

  return {
    id: next.user_id,
    username: next.username,
    displayName: next.display_name,
    className: next.class_name,
    classEmoji: next.class_emoji
  };
}
function getWaitlist(messageId) {
const rows = db.prepare(`
  SELECT *
  FROM party_waitlist
  WHERE message_id = ?
  ORDER BY position ASC
`).all(messageId);


return rows;
}

function clearWaitlist(messageId) {
  db.prepare(`
    DELETE FROM party_waitlist
    WHERE message_id = ?
  `).run(messageId);
}

module.exports = {
  addToWaitlist,
  popNextWaitlist,
  getWaitlist,
  clearWaitlist
};