const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const getClanRuns = require("../utils/clan/getClanRuns");
const getClanLootCount = require("../utils/clan/getClanLootCount");
const getClanTopOrganizer = require("../utils/clan/getClanTopOrganizer");
const getClanTopParticipant = require("../utils/clan/getClanTopParticipant");
const getClanBossOfWeek = require("../utils/clan/getClanBossOfWeek");
const getClanActivePlayers = require("../utils/clan/getClanActivePlayers");
const createClanPanel = require("../utils/panel/createClanPanel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("klan")
    .setDescription("Pokazuje statystyki aktywności klanu"),

  async execute(interaction) {
    const topOrganizer = getClanTopOrganizer(30);
    const topParticipant = getClanTopParticipant(30);
    const bossOfWeek = getClanBossOfWeek();

const image = await createClanPanel({
  runsToday: getClanRuns(1),
  runsWeek: getClanRuns(7),
  runsMonth: getClanRuns(30),
  lootMonth: getClanLootCount(30),

  topOrganizer: topOrganizer
    ? `${topOrganizer.owner_name} (${topOrganizer.total})`
    : "Brak danych",

  topParticipant: topParticipant
    ? `${topParticipant.player_name} (${topParticipant.total})`
    : "Brak danych",

  bossOfWeek: bossOfWeek
    ? `${bossOfWeek.boss_name} (${bossOfWeek.total})`
    : "Brak danych",

  activePlayers: getClanActivePlayers(30)
});

const attachment = new AttachmentBuilder(image, {
  name: "klan.png"
});

await interaction.reply({
  files: [attachment],
  ephemeral: true
});
  }
};