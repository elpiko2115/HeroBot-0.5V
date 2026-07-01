const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("herosi")
    .setDescription("Otwiera panel wyboru wyprawy"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🎯 Wybierz kategorię")
      .setDescription("Wybierz typ przeciwnika, na którego chcesz zorganizować wyprawę.");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("category_e2")
        .setLabel("Elita II")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("category_heroes")
        .setLabel("Herosi")
        .setEmoji("🟡")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("category_titans")
        .setLabel("Tytani")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("category_colossi")
        .setLabel("Kolosi")
        .setEmoji("👑")
        .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};