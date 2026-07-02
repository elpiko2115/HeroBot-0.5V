const { SlashCommandBuilder } = require("discord.js");
const db = require("../database/database");
const createProfilePanel = require("../utils/panel/createProfilePanel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Pokazuje statystyki gracza")
    .addUserOption(option =>
      option
        .setName("gracz")
        .setDescription("Gracz do sprawdzenia")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("gracz") || interaction.user;

    const joinedParties = db.prepare(`
      SELECT COUNT(*) AS count
      FROM party_history
      WHERE members_json LIKE ?
    `).get(`%"id":"${user.id}"%`).count;

    const organizedParties = db.prepare(`
      SELECT COUNT(*) AS count
      FROM party_history
      WHERE owner_id = ?
    `).get(user.id).count;

    const wonLoots = db.prepare(`
      SELECT COUNT(*) AS count
      FROM loot_history
      WHERE winner_id = ?
    `).get(user.id).count;

    const winRate = joinedParties > 0
      ? ((wonLoots / joinedParties) * 100).toFixed(1)
      : "0.0";

    const image = await createProfilePanel(user, {
      joinedParties,
      organizedParties,
      wonLoots,
      winRate
    });

    await interaction.reply({
      files: [
        {
          attachment: image,
          name: "profil.png"
        }
      ],
      ephemeral: true
    });
  }
};