const { EmbedBuilder } = require("discord.js");

function createLootPanel(party) {
  const members = party.members || [];

  const memberList = members.length
    ? members.map(member => {
        const name = member.displayName || member.username || member.id;
        return `• **${member.className || "Brak klasy"}** — ${name}`;
      }).join("\n")
    : "Brak uczestników";

  return new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(`🎁 Loot — ${party.bossName}`)
    .setDescription("Kliknij przycisk poniżej, aby wylosować zwycięzcę lootu.")
    .addFields(
      {
        name: "👥 Uczestnicy",
        value: memberList,
        inline: false
      }
    )
    .setFooter({
      text: "HeroBot v0.6 • Loot System"
    })
    .setTimestamp();
}

module.exports = createLootPanel;