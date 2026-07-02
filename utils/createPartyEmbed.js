const path = require("path");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

function createProgressBar(current, max) {
  const totalBars = 5;
  const filledBars = Math.min(totalBars, Math.round((current / max) * totalBars));
  const emptyBars = totalBars - filledBars;

  return "🟩".repeat(filledBars) + "⬜".repeat(emptyBars);
}

function formatMembers(members, slots) {
  const lines = members.map(member =>
    `${member.classEmoji || "❔"} **${member.className || "Brak klasy"}** — <@${member.id}>`
  );

  const emptySlots = Math.max(0, slots - members.length);

  for (let i = 0; i < emptySlots; i++) {
    lines.push("⬜ **Wolne miejsce**");
  }

  return lines.join("\n");
}

function getStatus(party) {
  const isFull = party.members.length >= party.slots;
  const isClosed = party.closed;

  if (isClosed) {
    return {
      text: "🔒 ZAMKNIĘTA",
      color: 0x95a5a6
    };
  }

  if (isFull) {
    return {
      text: "🔴 PEŁNA",
      color: 0xe74c3c
    };
  }

  return {
    text: "🟢 OTWARTA",
    color: party.color || 0x2ecc71
  };
}

function createPartyEmbed(party) {
  const files = [];
  const status = getStatus(party);
  const membersCount = party.members.length;
  const slots = party.slots || 1;
  const progressBar = createProgressBar(membersCount, slots);

  const embed = new EmbedBuilder()
    .setColor(status.color)
    .setTitle(`⚔️ ${party.bossEmoji || "🎯"} ${party.bossName}`)
    .setDescription(status.text)
    .addFields(
      {
        name: "🎯 Przeciwnik",
        value: `${party.bossEmoji || "🎯"} **${party.bossName}**`,
        inline: true
      },
      {
        name: "⭐ Poziom",
        value: `${party.level || "?"}`,
        inline: true
      },
      {
        name: "🗺️ Mapa",
        value: party.map || "Nieznana",
        inline: true
      },
      {
        name: "👤 Organizator",
        value: `<@${party.owner.id}>`,
        inline: true
      },
      {
        name: "🕒 Godzina",
        value: party.time || "Nieznana",
        inline: true
      },
      {
        name: "👥 Drużyna",
        value: `${progressBar} **${membersCount}/${slots}**\n\n${formatMembers(party.members, slots)}`,
        inline: false
      },
      {
        name: "📝 Opis",
        value: party.description || "Brak opisu",
        inline: false
      }
    )
    .setFooter({
      text: "HeroBot v0.5 • Assets + UI"
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