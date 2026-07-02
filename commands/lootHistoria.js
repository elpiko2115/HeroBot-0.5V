const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const lootManager = require("../utils/lootManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loot-historia")
    .setDescription("Pokazuje ostatnie losowania lootów."),

  async execute(interaction) {
    const loots = lootManager.getLastLoots(10);

    if (!loots.length) {
      await interaction.reply({
        content: "📭 Brak historii lootów.",
        ephemeral: true
      });
      return;
    }

    const description = loots.map((loot, index) => {
      return [
        `**${index + 1}. 🎁 ${loot.boss_name}**`,
        `🏆 Zwycięzca: **${loot.winner_name || loot.winner_id}**`,
        `📅 ${loot.created_at}`
      ].join("\n");
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("📜 Historia lootów")
      .setDescription(description)
      .setFooter({ text: "HeroBot v0.6 • Loot System" })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};