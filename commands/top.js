const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Pokazuje rankingi HeroBota"),

  async execute(interaction) {

    const organizers = db.prepare(`
      SELECT owner_name, owner_id, COUNT(*) AS total
      FROM party_history
      GROUP BY owner_id
      ORDER BY total DESC
      LIMIT 10
    `).all();

    const lucky = db.prepare(`
      SELECT winner_name, winner_id, COUNT(*) AS total
      FROM loot_history
      GROUP BY winner_id
      ORDER BY total DESC
      LIMIT 10
    `).all();

    const embed1 = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("👑 TOP Organizatorzy")
      .setDescription(
        organizers.length
          ? organizers
              .map((p, i) =>
                `${i + 1}. <@${p.owner_id}> — ${p.total}`
              )
              .join("\n")
          : "Brak danych."
      );

    const embed2 = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🎁 TOP Szczęściarze")
      .setDescription(
        lucky.length
          ? lucky
              .map((p, i) =>
                `${i + 1}. <@${p.winner_id}> — ${p.total}`
              )
              .join("\n")
          : "Brak danych."
      );

    await interaction.reply({
      embeds: [embed1, embed2],
      ephemeral: true
    });

  }
};