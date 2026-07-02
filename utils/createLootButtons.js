const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function createLootButtons(partyId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`loot_roll_${partyId}`)
      .setLabel("Losuj loot")
      .setEmoji("🎲")
      .setStyle(ButtonStyle.Primary)
  );
}

module.exports = createLootButtons;