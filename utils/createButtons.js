const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function createButtons(party) {
  const isFull = party.members.length >= party.slots;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Dołącz")
      .setStyle(ButtonStyle.Success)
      .setDisabled(party.closed || isFull),

    new ButtonBuilder()
      .setCustomId("leave")
      .setLabel("Opuść")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(party.closed),

    new ButtonBuilder()
      .setCustomId("close")
      .setLabel("Zamknij")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(party.closed)
  );
}

module.exports = createButtons;