const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

function getBosses() {
  delete require.cache[require.resolve("../data/bosses.json")];
  return require("../data/bosses.json");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("boss")
    .setDescription("Pokazuje statystyki wybranego bossa"),

  async execute(interaction) {
    await interaction.deferReply({
  ephemeral: true
});
    const bosses = getBosses();

    if (!bosses.length) {
      await interaction.reply({
        content: "❌ Brak bossów w bazie.",
        ephemeral: true
      });
      return;
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId("boss_stats_select")
      .setPlaceholder("Wybierz bossa")
      .addOptions(
        bosses.slice(0, 25).map(boss => ({
          label: boss.name,
          description: `Poziom: ${boss.level} | Mapa: ${boss.map || "Nieznana"}`,
          value: boss.name,
          emoji: boss.emoji || "🎯"
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("👹 Statystyki bossa")
      .setDescription("Wybierz bossa z listy poniżej.");

await interaction.editReply({
  embeds: [embed],
  components: [row]
});
  }
};