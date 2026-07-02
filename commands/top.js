const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const getTopOrganizers = require("../utils/top/getTopOrganizers");
const getTopLoot = require("../utils/top/getTopLoot");
const getTopBosses = require("../utils/top/getTopBosses");
const getTopParticipants = require("../utils/top/getTopParticipants");

const createTopPanel = require("../utils/panel/createTopPanel");

function formatUserList(rows) {
  return rows.length
    ? rows.map((row, i) => `${i + 1}. <@${row.user_id}> — **${row.total}**`).join("\n")
    : "Brak danych.";
}

function formatBossList(rows) {
  return rows.length
    ? rows.map((row, i) => `${i + 1}. **${row.boss_name}** — **${row.total}**`).join("\n")
    : "Brak danych.";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Pokazuje rankingi HeroBota")
    .addStringOption(option =>
      option
        .setName("typ")
        .setDescription("Wybierz typ rankingu")
        .setRequired(true)
        .addChoices(
          { name: "👥 Uczestnicy", value: "participants" },
          { name: "👑 Organizatorzy", value: "organizers" },
          { name: "🎁 Loot", value: "loot" },
          { name: "⚔️ Bossy", value: "bosses" }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString("typ");

    let title = "";
    let description = "";
    let color = 0x8b5cf6;

    if (type === "participants") {
      title = "👥 TOP Uczestnicy";
      description = formatUserList(getTopParticipants(10));
      color = 0x22c55e;
    }

    if (type === "organizers") {
      title = "👑 TOP Organizatorzy";
      description = formatUserList(getTopOrganizers(10));
      color = 0xfacc15;
    }

    if (type === "loot") {
      title = "🎁 TOP Loot";
      description = formatUserList(getTopLoot(10));
      color = 0xf97316;
    }

    if (type === "bosses") {
      title = "⚔️ TOP Bossy";
      description = formatBossList(getTopBosses(10));
      color = 0xef4444;
    }

const rows =
  type === "participants"
    ? getTopParticipants(10)
    : type === "organizers"
    ? getTopOrganizers(10)
    : type === "loot"
    ? getTopLoot(10)
    : getTopBosses(10);

const image = await createTopPanel({
  title,
  rows,
  type
});

const attachment = new AttachmentBuilder(image, {
  name: "top.png"
});

await interaction.reply({
  files: [attachment],
  ephemeral: true
});
  }
};