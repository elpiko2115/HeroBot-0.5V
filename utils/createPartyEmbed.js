const path = require("path");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

function formatMembers(members) {
  return members
    .map(member => `• ${member.classEmoji || "❔"} **${member.className || "Brak klasy"}** — <@${member.id}>`)
    .join("\n");
}

function createPartyEmbed(party) {
  const isFull = party.members.length >= party.slots;
  const isClosed = party.closed;

  const status = isClosed
    ? "🔒 Rekrutacja zamknięta"
    : isFull
      ? "🔴 Drużyna pełna"
      : "🟢 Rekrutacja otwarta";

  const files = [];

  const embed = new EmbedBuilder()
    .setColor(isClosed ? 0x95a5a6 : isFull ? 0xe74c3c : party.color)
    .setTitle(`⚔️ Wyprawa na ${party.bossEmoji} ${party.bossName}`)
    .addFields(
      { name: "🎯 Przeciwnik", value: `${party.bossEmoji} **${party.bossName}**`, inline: true },
      { name: "⭐ Poziom", value: `${party.level || "?"}`, inline: true },
      { name: "📍 Mapa", value: party.map || "Nieznana", inline: true },
      { name: "👤 Organizator", value: `<@${party.owner.id}>`, inline: false },
      { name: "🕒 Godzina", value: party.time, inline: true },
      { name: `👥 Drużyna (${party.members.length}/${party.slots})`, value: formatMembers(party.members), inline: false },
      { name: "📝 Opis", value: party.description || "Brak opisu", inline: false },
      { name: "Status", value: status, inline: false }
    )
    .setFooter({
      text: "HeroBot • System wypraw Margonem"
    })
    .setTimestamp();

  if (party.imageFile) {
    const imagePath = path.join(__dirname, "..", "assets", "bosses", party.imageFile);

    const attachment = new AttachmentBuilder(imagePath, {
      name: party.imageFile
    });

    embed.setImage(`attachment://${party.imageFile}`);
    files.push(attachment);
  }

  return { embed, files };
}

module.exports = createPartyEmbed;