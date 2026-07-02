const { EmbedBuilder } = require("discord.js");
const db = require("../database/database");
const { getLastParties } = require("./historyManager");
const { getLastLoots } = require("./lootManager");
const bosses = require("../data/bosses.json");

function getState(key) {
  const row = db.prepare("SELECT value FROM bot_state WHERE key = ?").get(key);
  return row?.value || null;
}

function setState(key, value) {
  db.prepare(`
    INSERT INTO bot_state (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function getBossEmoji(bossName) {
  const boss = bosses.find(b => b.name === bossName);
  return boss?.emoji || "⚔️";
}

async function updatePartyDashboard(client) {
  const channel = await client.channels.fetch(process.env.PARTY_HISTORY_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const parties = getLastParties(5);

  const description = parties.length
    ? parties.map((party, index) => {
return `**${index + 1}. ${getBossEmoji(party.boss_name)} ${party.boss_name}**
👥 ${party.members_count}/${party.slots} • 🕒 ${party.time || "-"}`;
      }).join("\n\n")
    : "Brak historii wypraw.";

  const embed = new EmbedBuilder()
    .setTitle("📜 Ostatnie wyprawy")
    .setDescription(description)
    .setColor(0x8b5cf6)
    .setTimestamp();

  const stateKey = "party_dashboard_message_id";
  const messageId = getState(stateKey);

  if (messageId) {
    const oldMessage = await channel.messages.fetch(messageId).catch(() => null);

    if (oldMessage) {
      await oldMessage.edit({ embeds: [embed] });
      return;
    }
  }

  const newMessage = await channel.send({ embeds: [embed] });
  setState(stateKey, newMessage.id);
}

async function updateLootDashboard(client) {
  const channel = await client.channels
    .fetch(process.env.LOOT_CHANNEL_ID)
    .catch(() => null);

  if (!channel) return;

  const loots = getLastLoots(5);

  const description = loots.length
    ? loots.map((loot, index) => {
return `**${index + 1}. ${getBossEmoji(loot.boss_name)} ${loot.boss_name}** • 🏆 ${loot.winner_name || loot.winner_id}`;
      }).join("\n\n")
    : "Brak historii lootów.";

  const embed = new EmbedBuilder()
    .setTitle("🎁 Ostatnie looty")
    .setDescription(description)
    .setColor(0xf1c40f)
    .setTimestamp();

  const stateKey = "loot_dashboard_message_id";
  const messageId = getState(stateKey);

  if (messageId) {
    const oldMessage = await channel.messages.fetch(messageId).catch(() => null);

    if (oldMessage) {
      await oldMessage.edit({ embeds: [embed] });
      return;
    }
  }

  const newMessage = await channel.send({ embeds: [embed] });
  setState(stateKey, newMessage.id);
}

module.exports = {
  updatePartyDashboard,
  updateLootDashboard
};