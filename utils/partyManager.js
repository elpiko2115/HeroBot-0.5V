const db = require("../database/database");
const waitlist = require("./waitlistManager");

function buildParty(row) {
  if (!row) return null;

  const members = db.prepare(`
    SELECT user_id, username, display_name, class_name, class_emoji
    FROM party_members
    WHERE message_id = ?
  `).all(row.message_id);

  return {
    messageId: row.message_id,
    channelId: row.channel_id,
    bossName: row.boss_name,
    bossEmoji: row.boss_emoji,
    level: row.level,
    map: row.map,
    color: row.color,
    image: row.image,
    imageFile: row.image_file,
    owner: {
      id: row.owner_id,
      username: row.owner_name || row.owner_id,
      displayName: row.owner_name || row.owner_id,
      className: row.owner_class_name,
      classEmoji: row.owner_class_emoji
    },
    time: row.time,
    startAt: row.start_at,
    slots: row.slots,
    description: row.description,
    closed: Boolean(row.closed),
    reminded: Boolean(row.reminded),
    members: members.map(member => ({
      id: member.user_id,
      username: member.username || member.display_name || member.user_id,
      displayName: member.display_name || member.username || member.user_id,
      className: member.class_name,
      classEmoji: member.class_emoji
    }))
  };
}

function createParty(messageId, channelId, data) {
  db.prepare(`
INSERT OR REPLACE INTO parties (
  message_id,
  channel_id,
  boss_name,
  boss_emoji,
  level,
  map,
  color,
  image,
  image_file,
  owner_id,
  owner_name,
  owner_class_name,
  owner_class_emoji,
  time,
  start_at,
  slots,
  description,
  closed,
  reminded
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    messageId,
    channelId,
    data.bossName,
    data.bossEmoji,
    String(data.level),
    data.map,
    data.color,
    data.image || "",
    data.imageFile || "",
    data.owner.id,
    data.owner.displayName || data.owner.username || data.owner.id,
    data.owner.className,
    data.owner.classEmoji,
    data.time,
    data.startAt,
    data.slots,
    data.description,
    0,
    0
  );

  db.prepare(`
    INSERT OR REPLACE INTO party_members (
      message_id, user_id, username, display_name, class_name, class_emoji
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    messageId,
    data.owner.id,
    data.owner.username || data.owner.displayName || data.owner.id,
    data.owner.displayName || data.owner.username || data.owner.id,
    data.owner.className,
    data.owner.classEmoji
  );
}

function getParty(messageId) {
  const row = db.prepare(`SELECT * FROM parties WHERE message_id = ?`).get(messageId);
  return buildParty(row);
}

function getActiveParties() {
  const rows = db.prepare(`SELECT * FROM parties WHERE closed = 0`).all();
  return rows.map(buildParty);
}

function joinParty(messageId, member) {
  const party = getParty(messageId);

  if (!party) return { ok: false, reason: "not_found" };
  if (party.closed) return { ok: false, reason: "closed" };
  if (party.members.some(m => m.id === member.id)) return { ok: false, reason: "already_joined" };
  if (party.members.length >= party.slots) {
  const waitlist = require("./waitlistManager");
  const position = waitlist.addToWaitlist(messageId, member);

  return {
    ok: false,
    reason: "waitlist",
    position
  };
}

  db.prepare(`
    INSERT INTO party_members (
      message_id, user_id, username, display_name, class_name, class_emoji
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    messageId,
    member.id,
    member.username || member.displayName || member.name || member.id,
    member.displayName || member.username || member.name || member.id,
    member.className,
    member.classEmoji
  );

  return { ok: true, party: getParty(messageId) };
}

function leaveParty(messageId, userId) {
  const party = getParty(messageId);
  if (!party) return { ok: false, reason: "not_found" };

  db.prepare(`
    DELETE FROM party_members
    WHERE message_id = ? AND user_id = ?
  `).run(messageId, userId);

  const next = waitlist.popNextWaitlist(messageId);

  if (next) {
    db.prepare(`
      INSERT INTO party_members (
        message_id, user_id, username, display_name, class_name, class_emoji
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      next.id,
      next.username || next.displayName || next.id,
      next.displayName || next.username || next.id,
      next.className,
      next.classEmoji
    );
  }

  return {
    ok: true,
    party: getParty(messageId),
    promoted: next
  };
}

function closeParty(messageId) {
  const party = getParty(messageId);
  if (!party) return { ok: false, reason: "not_found" };

  db.prepare(`
    UPDATE parties
    SET closed = 1
    WHERE message_id = ?
  `).run(messageId);

  waitlist.clearWaitlist(messageId);

  return { ok: true, party: getParty(messageId) };
}

function markReminded(messageId) {
  db.prepare(`
    UPDATE parties
    SET reminded = 1
    WHERE message_id = ?
  `).run(messageId);
}

module.exports = {
  createParty,
  getParty,
  getActiveParties,
  joinParty,
  leaveParty,
  closeParty,
  markReminded
};