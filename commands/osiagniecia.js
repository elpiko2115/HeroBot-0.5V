const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/database");

function achievement(current, target, name) {
  const unlocked = current >= target;
  return `${unlocked ? "✅" : "🔒"} ${name} (${current}/${target})`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("osiagniecia")
    .setDescription("Pokazuje osiągnięcia gracza")
    .addUserOption(option =>
      option
        .setName("gracz")
        .setDescription("Gracz do sprawdzenia")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("gracz") || interaction.user;

    const joined = db.prepare(`
      SELECT COUNT(*) AS count
      FROM party_history
      WHERE members_json LIKE ?
    `).get(`%"id":"${user.id}"%`).count;

    const organized = db.prepare(`
      SELECT COUNT(*) AS count
      FROM party_history
      WHERE owner_id = ?
    `).get(user.id).count;

    const loots = db.prepare(`
      SELECT COUNT(*) AS count
      FROM loot_history
      WHERE winner_id = ?
    `).get(user.id).count;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏅 Osiągnięcia: ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: "⚔️ Wyprawy",
          value: [
            achievement(joined, 1, "Pierwsza wyprawa"),
            achievement(joined, 10, "Aktywny poszukiwacz"),
            achievement(joined, 50, "Weteran wypraw"),
            achievement(joined, 100, "Legenda wypraw")
          ].join("\n"),
          inline: false
        },
        {
          name: "👑 Organizator",
          value: [
            achievement(organized, 1, "Pierwsze dowodzenie"),
            achievement(organized, 10, "Dowódca"),
            achievement(organized, 50, "Generał")
          ].join("\n"),
          inline: false
        },
        {
          name: "🎁 Loot",
          value: [
            achievement(loots, 1, "Pierwszy loot"),
            achievement(loots, 10, "Szczęściarz"),
            achievement(loots, 25, "Wybraniec RNG")
          ].join("\n"),
          inline: false
        }
      )
      .setFooter({
        text: "HeroBot v0.7 • Osiągnięcia"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};